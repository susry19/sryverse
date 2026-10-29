"""Deterministik soru durum makinesi (SAF: veritabanına dokunmaz).

Akışı model değil bu modül yönetir: hangi sorunun sorulacağı, ne zaman
netleştirme isteneceği, ne zaman bitirileceği burada kurallarla belirlenir.
AI yalnız cevabı çıkarır (extraction). Böylece:
  * AI yeni bir konu açamaz, soru atlatamaz, akışı uzatamaz;
  * aynı girdi aynı akışı üretir (test edilebilir, açıklanabilir);
  * HR sandbox'ı aynı motoru veritabanı yazmadan çalıştırır.

Durum (state) JSON'a çevrilebilir bir sözlüktür:
  answers  {field_key: {value, status, final, clarifications, ...}}
  prefill  {field_key: {value, status, source_label}}   başvuru kaydındaki bilgi
  hints    {field_key: value}                            başka cevaptan gelen ipucu
  current, mode (ask|clarify|confirm), pending, silence, history, turn
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date
import re
from typing import Callable, Optional

from services.voice_screening import extraction as ex
from services.voice_screening import qa as qa_mod

DEFAULT_CLARIFY_ON = ("approximate", "unknown", "invalid", "unconfirmed")
FINAL_OK = ("confirmed", "approximate", "prefilled", "declined", "unknown", "unconfirmed", "invalid")

# Sesli okunur: kısa, konuşur gibi. AI olduğu ve karar vermediği açıkça
# söylenir; ayrıntılı aydınlatma metni izin ekranında yazılı durur.
AI_DISCLOSURE = ("Merhaba{name}, ben {company} adına çalışan SkillMatch'in yapay zekâ asistanıyım. "
                 "{position} ilgili birkaç kısa soru soracağım. Bu bir mülakat değil ve ben karar vermiyorum; "
                 "cevaplarınızı İK ekibi inceleyecek. Soruyu tekrar duymak, ara vermek ya da bir insanla "
                 "görüşmek isterseniz söylemeniz yeterli. Başlayalım.")
CLOSING = ("Teşekkür ederim, sorularım bu kadar. Cevaplarınız İK ekibine iletilecek; değerlendirmeyi ve "
           "sonraki adımları ekip yapacak. İyi günler dilerim.")
PAUSE_TEXT = ("Tabii. Görüşmeyi şimdilik durduruyorum. Size gönderilen bağlantıdan, bağlantının süresi "
              "dolmadan istediğiniz zaman kaldığınız yerden devam edebilirsiniz.")
SILENCE_PAUSE_TEXT = ("Sizi duyamıyorum. Görüşmeyi şimdilik durduruyorum; aynı bağlantıdan daha sonra "
                      "kaldığınız yerden devam edebilirsiniz.")
STOP_TEXT = ("Anlaşıldı, görüşmeyi burada sonlandırıyorum. Verdiğiniz cevaplar İK ekibine iletilecek. "
             "Teşekkür ederim.")
HUMAN_TEXT = ("Elbette. Talebinizi İK ekibine iletiyorum; ekipten biri sizinle iletişime geçecek. Görüşmeyi "
              "burada sonlandırıyorum. Teşekkür ederim.")
# Geçiş sözleri: kısa ve TEKRARSIZ (her cevaba "teşekkür ederim" demek
# doğal değil). Her üçüncü turda geçiş sözü yok, doğrudan soru.
ACKS = ("Anladım.", "Peki.", "Tamam.", "Not aldım.")
CONTRADICTION_NOTE = "çelişki"


@dataclass
class TurnResult:
    action: str                       # next | clarify | repeat | silence | pause | stop | human | done
    agent_text: str
    records: list = field(default_factory=list)   # kaydedilecek cevaplar
    ended: bool = False
    end_reason: Optional[str] = None
    question: Optional[dict] = None   # şimdi sorulan soru (kısa künye)
    qa: Optional[dict] = None         # adayın sorusuna verilen cevap (varsa)


def spoken_name(name: str, turkish: bool = False) -> str:
    """Sesli okunacak ad: sondaki kod parantezi atılır ("RIXOS PREMIUM BELEK
    (PRM)" -> "Rixos Premium Belek"), tamamı büyük harfse baş harf büyük
    olacak biçimde düzeltilir - aksi halde ses "parantez PRM" diye okur ya da harf harf heceler.
    Kısaltmalar ("AVM", "HAB1") olduğu gibi kalır."""
    import re as _re
    n = _re.sub(r"\s*\([^)]*\)\s*$", "", (name or "").strip()).strip()
    if n and n == n.upper() and any(ch.isalpha() for ch in n):
        def word(w):
            short = 2 if turkish else 3       # pozisyonda "ÖN" kelimedir, "IT"/"İK" kısaltma
            if any(ch.isdigit() or ch == "&" for ch in w) or (len(w) <= short and not set(w) & set("ÇĞÖŞÜ")):
                return w
            rest = w[1:].replace("İ", "i")
            # Pozisyon adı Türkçedir ("UZMANI" -> "Uzmanı"); marka adları
            # ("RIXOS") Türkçe I->ı kuralına uymaz.
            if turkish:
                rest = rest.replace("I", "ı")
            return w[:1] + rest.lower()
        n = " ".join(word(w) for w in n.split())
    return n


def disclosure(company: str, position_title: str = None, first_name: str = None) -> str:
    """AI kimlik açıklaması + görüşmenin sınırları (her görüşmenin ilk cümlesi)."""
    pos = spoken_name(position_title, turkish=True) if position_title else ""
    clause = f"{pos} başvurunuzla" if pos else "Başvurunuzla"
    return AI_DISCLOSURE.format(company=spoken_name(company) or "işveren", position=clause,
                                name=f" {first_name}" if first_name else "")


MIN_SEGMENT = 25
_SENTENCE_END = re.compile(r"(?<=[.!?…])\s+")


def speech_segments(text: str) -> list:
    """Seslendirme parçaları (cümleler). İstemci ilk cümleyi çalarken sonrakini
    ister: ilk ses çok daha erken başlar. Onay ("Not aldım.") ve soru metinleri
    tüm adaylarda aynı olduğundan cümle cümle önbelleğe de girer."""
    out = []
    for p in (x.strip() for x in _SENTENCE_END.split((text or "").strip())):
        if not p:
            continue
        # Kısa cümle ("Not aldım.") sonrakine eklenir: hem istek sayısı (kota)
        # azalır hem ses modeli çok kısa metinde ara sıra boş döndürüyor.
        if out and len(out[-1]) < MIN_SEGMENT:
            out[-1] = out[-1] + " " + p
        else:
            out.append(p)
    return out


def new_state(prefill: dict = None) -> dict:
    return {"answers": {}, "prefill": prefill or {}, "hints": {}, "current": None, "mode": "ask",
            "pending": None, "silence": 0, "history": [], "turn": 0}


# ─── Plan ───────────────────────────────────────────────────────────────────

def question_in_scope(q: dict, hotel_id, position_id) -> bool:
    hotels = [int(h) for h in (q.get("hotel_ids") or [])]
    positions = [int(p) for p in (q.get("position_ids") or [])]
    if hotels and (hotel_id is None or int(hotel_id) not in hotels):
        return False
    if positions and (position_id is None or int(position_id) not in positions):
        return False
    return True


def build_plan(items: list, hotel_id=None, position_id=None, only_fields=None) -> list:
    """Şablon kalemlerinden (sıralı soru sözlükleri) bu başvuruya ait plan."""
    plan = [q for q in items if question_in_scope(q, hotel_id, position_id)]
    if only_fields:
        wanted = set(only_fields)
        plan = [q for q in plan if q["field_key"] in wanted]
    return plan


def _value_of(state: dict, key: str):
    a = state["answers"].get(key)
    if a is not None and a.get("final"):
        return a.get("value")
    p = state["prefill"].get(key)
    return p.get("value") if p else None


def condition_holds(cond: Optional[dict], state: dict) -> bool:
    """Koşul yalnız aynı görüşmedeki yapılandırılmış değerlere bakar. Değer
    henüz yoksa koşullu soru SORULMAZ (eksik bilgiyle tahmin yürütülmez)."""
    if not cond:
        return True
    val = _value_of(state, cond.get("field", ""))
    op, target = cond.get("op", "eq"), cond.get("value")
    if op == "truthy":
        return bool(val)
    if op == "falsy":
        return val is not None and not val
    if val is None:
        return False
    if op == "eq":
        return val == target
    if op == "neq":
        return val != target
    if op == "in":
        return val in (target or []) if not isinstance(val, list) else bool(set(val) & set(target or []))
    if op == "not_in":
        return val not in (target or []) if not isinstance(val, list) else not (set(val) & set(target or []))
    return False


def select_next(plan: list, state: dict) -> Optional[dict]:
    for q in plan:
        a = state["answers"].get(q["field_key"])
        if a is not None and a.get("final"):
            continue
        if not condition_holds(q.get("condition"), state):
            continue
        return q
    return None


def find_question(plan: list, field_key: str) -> Optional[dict]:
    return next((q for q in plan if q["field_key"] == field_key), None)


def required_missing(plan: list, state: dict) -> list:
    """Sorulması gerekip kesin bir cevap alınamamış zorunlu alanlar."""
    out = []
    for q in plan:
        if not q.get("is_required", True) or not condition_holds(q.get("condition"), state):
            continue
        a = state["answers"].get(q["field_key"])
        if a is None or not a.get("final") or a.get("status") in ("unknown", "invalid", "declined", "unconfirmed"):
            out.append(q["field_key"])
    return out


# ─── İfade üretimi (onaylı metinden) ────────────────────────────────────────

def _short(value_display: str) -> str:
    return value_display.replace("Yaklaşık ", "")


def ask_text(q: dict, state: dict) -> str:
    hint = state["hints"].get(q["field_key"])
    prefix = ""
    if hint is not None:
        approx = hint.get("approx_text") if isinstance(hint, dict) else None
        shown = approx or _short(ex.display_value(q["answer_type"], hint, q.get("options")))
        prefix = f"Daha önce verdiğiniz bilgiye göre bu {shown} olabilir. "
    return prefix + q["question_text"]


def confirm_text(q: dict, state: dict) -> str:
    p = state["prefill"][q["field_key"]]
    shown = ex.display_value(q["answer_type"], p.get("value"), q.get("options"))
    src = p.get("source_label") or "Başvurunuzda"
    return f"{src} bu bilgi \"{shown}\" olarak görünüyor. Bu hâlâ doğru mu?"


def clarify_text(q: dict, status: str, value, note: Optional[str] = None) -> str:
    if note == CONTRADICTION_NOTE:
        return ("Başlangıç tarihinizi netleştirmek için soruyorum: mevcut işinizden ayrıldıktan sonra mı "
                "başlayabilirsiniz?")
    custom = (q.get("clarification") or {}).get("prompt")
    shown = ex.display_value(q["answer_type"], value, q.get("options")) if value is not None else None
    if custom:
        return custom.replace("{value}", _short(shown) if shown else "")
    at = q["answer_type"]
    if at == "date" and status == "approximate" and value:
        return f"Yaklaşık {_short(shown).split(' (')[0]} olarak mı değerlendirebiliriz, yoksa tarih henüz kesin değil mi?"
    if at == "duration" and status == "approximate" and value:
        return f"Yaklaşık {shown} olarak not alabilir miyim?"
    if at == "language_list" and status == "approximate":
        return "Bu dillerdeki seviyenizi başlangıç, orta, iyi ya da ileri olarak söyleyebilir misiniz?"
    if at == "boolean":
        if status == "unconfirmed":
            return "Anladığım kadarıyla duruma göre değişiyor. Genel olarak evet mi, hayır mı diyebiliriz?"
        return "Kısaca evet ya da hayır diyebilir misiniz?"
    if at in ("choice", "multi_choice") and q.get("options"):
        labels = ", ".join(o.get("label") or o["value"] for o in q["options"])
        return f"Tam anlayamadım. Şu seçeneklerden hangisi size uyuyor: {labels}?"
    if at == "date":
        return "Tam anlayamadım. Yaklaşık bir gün ve ay söyleyebilir misiniz? Henüz belli değilse bunu da söyleyebilirsiniz."
    if at == "duration":
        return "Kaç yıl ya da kaç ay olduğunu söyleyebilir misiniz?"
    return "Tam anlayamadım. " + q["question_text"]


def current_prompt(plan: list, state: dict) -> str:
    q = find_question(plan, state.get("current") or "")
    if q is None:
        return ""
    mode = state.get("mode") or "ask"
    if mode == "followup" and state.get("followup"):
        return state["followup"]["prompt"]
    if mode == "confirm" and q["field_key"] in state["prefill"]:
        return confirm_text(q, state)
    if mode == "clarify":
        a = state["answers"].get(q["field_key"]) or {}
        return clarify_text(q, a.get("status", "unknown"), state.get("pending"), a.get("note"))
    return ask_text(q, state)


def q_brief(q: Optional[dict], plan: list) -> Optional[dict]:
    if q is None:
        return None
    idx = next((i for i, x in enumerate(plan) if x["field_key"] == q["field_key"]), 0)
    return {"field_key": q["field_key"], "index": idx + 1, "total": len(plan), "category": q.get("category"),
            "answer_type": q["answer_type"],
            "options": [{"value": o["value"], "label": o.get("label") or o["value"]} for o in (q.get("options") or [])]}


# ─── Akış ───────────────────────────────────────────────────────────────────

def _advance(plan: list, state: dict, lead: str = "") -> TurnResult:
    """Sıradaki soruya geç; başvuruda zaten olan bilgiyi teyit et ya da (teyit
    gerekmiyorsa) sormadan kaydet. Soru kalmadıysa kapanış."""
    records = []
    while True:
        q = select_next(plan, state)
        if q is None:
            state["current"], state["mode"], state["pending"] = None, "ask", None
            # Kapanış zaten teşekkür eder: "Teşekkür ederim. Teşekkür ederim, ..." olmasın.
            text = CLOSING if (lead in ACKS or not lead) else (lead + " " + CLOSING).strip()
            return TurnResult("done", text, records, ended=True, end_reason="completed")
        key = q["field_key"]
        pre = state["prefill"].get(key)
        if pre is not None and not q.get("confirm_existing"):
            # Bilgi başvuruda var ve teyit istenmiyor: tekrar sorulmaz.
            state["answers"][key] = {"value": pre["value"], "status": "prefilled", "final": True,
                                     "clarifications": 0}
            records.append({"field_key": key, "question_id": q.get("id"), "raw_text": None,
                            "value": pre["value"], "status": "prefilled", "confidence": 1.0,
                            "method": "prefill", "source": "prefill", "clarification_status": "none",
                            "clarification_count": 0, "candidate_confirmation": "not_asked",
                            "new_revision": False, "final": True,
                            "notes": {"prefill_source": pre.get("source_label")}})
            continue
        state["current"], state["pending"] = key, None
        hint = state["hints"].get(key)
        if pre is not None:
            state["mode"] = "confirm"
            prompt = confirm_text(q, state)
        elif (q["answer_type"] == "language_list" and isinstance(hint, list) and hint
              and all(not h.get("level") for h in hint)):
            # Diller zaten söylendi, yalnız seviye eksik: yalnız eksik kısmı sor.
            state["mode"], state["pending"] = "clarify", hint
            state["answers"][key] = {"value": hint, "status": "approximate", "final": False, "clarifications": 1,
                                     "raw": None, "turns": []}
            prompt = (f"{ex.display_value('language_list', hint)} bildiğinizi söylediniz. Seviyenizi başlangıç, orta, "
                      "iyi ya da ileri olarak söyleyebilir misiniz?")
        else:
            state["mode"] = "ask"
            prompt = ask_text(q, state)
        if key not in state["history"]:
            state["history"].append(key)
        return TurnResult("next", (lead + " " + prompt).strip(), records, question=q_brief(q, plan))


def start(plan: list, state: dict) -> TurnResult:
    """İlk soruyu (ya da yeniden bağlanışta kalınan soruyu) verir."""
    if state.get("current") and find_question(plan, state["current"]):
        q = find_question(plan, state["current"])
        return TurnResult("next", current_prompt(plan, state), question=q_brief(q, plan))
    return _advance(plan, state)


def _record(q, raw, res, *, status=None, value=None, final=True, clar_status="none", clar_count=0,
            confirmation="not_asked", new_revision=False, method=None, extra_turns=None):
    notes = {}
    if res is not None:
        if res.related:
            notes["related"] = res.related
        if res.flags:
            notes["flags"] = res.flags
        if res.note:
            notes["note"] = res.note
    if extra_turns:
        notes["clarification_turns"] = extra_turns
    return {"field_key": q["field_key"], "question_id": q.get("id"), "raw_text": raw,
            "value": value if value is not None else (res.value if res else None),
            "status": status or (res.status if res else "unknown"),
            "confidence": res.confidence if res else None,
            "method": method or (res.method if res else None), "source": None,
            "clarification_status": clar_status, "clarification_count": clar_count,
            "candidate_confirmation": confirmation, "new_revision": new_revision, "final": final,
            "notes": notes}


# ─── Doğal ifade (karar değişmez, yalnız söyleyiş) ──────────────────────────

def next_lead(state: dict, turn: int = None) -> str:
    """Sıradaki sorudan önceki kısa geçiş sözü. Belirlenimci (aynı durum aynı
    söz): sunucu bir sonraki cümlenin sesini önceden hazırlayabilsin."""
    t = int(state.get("turn") or 0) if turn is None else turn
    if t % 3 == 2:
        return ""
    lead = ACKS[t % len(ACKS)]
    if lead == state.get("last_lead"):
        lead = ACKS[(t + 1) % len(ACKS)]
    return lead


def _join(parts: list) -> str:
    return parts[0] if len(parts) == 1 else ", ".join(parts[:-1]) + " ve " + parts[-1]


def echo_phrase(q: dict, value) -> str:
    """Kaydedilen bilginin kısa, doğal tekrarı ("hemen başlayabiliyorsunuz")."""
    cat, at = q.get("category"), q["answer_type"]
    opts = q.get("options") or []
    label = {o["value"]: (o.get("label") or o["value"]).lower() for o in opts}
    if cat == "employment" and isinstance(value, str):
        return {"employed": "şu an çalışıyorsunuz", "unemployed": "şu an çalışmıyorsunuz",
                "student": "öğrencisiniz"}.get(value, label.get(value, value))
    if at == "date" and isinstance(value, dict):
        if value.get("immediate"):
            return "hemen başlayabiliyorsunuz"
        return ex.display_value(at, value, opts).replace("Yaklaşık", "yaklaşık") + " tarihinde başlayabiliyorsunuz"
    if at == "multi_choice" and isinstance(value, list) and opts:
        allv = [o["value"] for o in opts]
        if set(value) >= set(allv):
            return "tüm vardiyalarda çalışabiliyorsunuz" if cat == "shift" else "hepsi size uygun"
        out = [v for v in allv if v not in value]
        if cat == "shift" and out and len(value) >= 2:
            return _join([label[v] for v in out]) + " vardiyası dışında çalışabiliyorsunuz"
        return _join([label.get(v, v) for v in value]) + (" vardiyasında çalışabiliyorsunuz" if cat == "shift" else "")
    if at == "boolean":
        return {("weekend", True): "hafta sonu çalışabiliyorsunuz", ("weekend", False): "hafta sonu çalışamıyorsunuz",
                ("accommodation", True): "lojman ihtiyacınız var", ("accommodation", False): "lojman ihtiyacınız yok",
                ("transportation", True): "servis ihtiyacınız var", ("transportation", False): "servis ihtiyacınız yok",
                ("certificate", True): "gerekli belgeniz var", ("certificate", False): "gerekli belgeniz yok",
                ("location", True): "lokasyon size uygun", ("location", False): "lokasyon size uygun değil",
                }.get((cat, bool(value)), q["question_text"].rstrip("?") + (": evet" if value else ": hayır"))
    if cat == "experience":
        return ex.display_value(at, value, opts) + " deneyiminiz var"
    if cat == "language":
        return ex.display_value(at, value, opts) + " biliyorsunuz"
    if cat == "notice":
        return "ihbar sürenizi not ettim"
    return ex.display_value(at, value, opts)


def _echo_lead(applied: list) -> str:
    phrases = [echo_phrase(q, v) for q, v in applied]
    return ("Anladım; " + _join(phrases) + ".") if phrases else ""


def _apply_volunteered(plan, state, current_key) -> tuple:
    """Aynı cevapta verilen diğer bilgileri kaydet: kesin olanlar cevaplanmış
    sayılır (soru SORULMAZ), yaklaşık olanlar ipucu olur (soru teyitle
    sorulur). Koşul o anki duruma göre denetlenir (ör. ihbar süresi yalnız
    "çalışıyor" cevabından sonra uygulanır)."""
    vol = state.pop("_vol", None) or {}
    records, applied = [], []
    for key, v in vol.items():
        q2 = find_question(plan, key)
        if q2 is None or (state["answers"].get(key) or {}).get("final"):
            continue
        if not condition_holds(q2.get("condition"), state):
            continue
        if v["status"] != "confirmed":
            state["hints"].setdefault(key, v["value"])
            continue
        state["answers"][key] = {"value": v["value"], "status": "confirmed", "final": True, "clarifications": 0,
                                 "raw": v["clause"], "volunteered": True}
        if key not in state["history"]:
            state["history"].append(key)
        records.append({"field_key": key, "question_id": q2.get("id"), "raw_text": v["clause"], "value": v["value"],
                        "status": "confirmed", "confidence": v.get("confidence"), "method": v.get("method") or "rule",
                        "source": "volunteered", "clarification_status": "none", "clarification_count": 0,
                        "candidate_confirmation": "not_asked", "new_revision": False, "final": True,
                        "notes": {"volunteered_during": current_key, **({"note": v["note"]} if v.get("note") else {})}})
        applied.append((q2, v["value"]))
    return records, applied


def _finalize(plan, state, q, rec, res=None, lead=None) -> TurnResult:
    key = q["field_key"]
    prev = state["answers"].get(key) or {}
    state["answers"][key] = {"value": rec["value"], "status": rec["status"], "final": True,
                             "clarifications": rec["clarification_count"], "raw": prev.get("raw") or rec["raw_text"],
                             "correcting": False}
    if res is not None:
        for k, v in (res.related or {}).items():
            if k != key and k not in state["answers"]:
                state["hints"][k] = v
    state["mode"], state["pending"] = "ask", None
    vol_records, applied = _apply_volunteered(plan, state, key)
    other = ((rec.get("notes") or {}).get("related") or {}).get("other_experience_months")
    if q.get("category") == "experience" and other and key not in (state.get("followups_done") or []):
        # "2 yıl benzer, 3 yıl başka": sorulan alan kaydedildi; diğer deneyimi kısaca sor.
        main = (rec.get("value") or {}).get("months") or 0
        said = (f"{ex.display_value('duration', rec['value'])} benzer deneyiminiz var" if main
                else "bu alanda deneyiminiz yok")
        span = ex.display_value('duration', {'months': other}) + "lık"      # "3 yıllık", "6 aylık"
        prompt = f"Peki diğer {span} deneyiminiz hangi alanda, hangi görevdeydi?"
        state["mode"], state["current"] = "followup", key
        state["followup"] = {"field": key, "prompt": prompt, "rec": rec}
        state["last_lead"] = ""
        return TurnResult("followup", f"Anladım; {said}. {prompt}", [rec] + vol_records, question=q_brief(q, plan))
    if lead is None:
        lead = _echo_lead(applied) or next_lead(state)
    state["last_lead"] = lead
    out = _advance(plan, state, lead)
    out.records = [rec] + vol_records + out.records
    return out


# Cümle bu sözlerle bitiyorsa aday büyük olasılıkla devam edecek.
_TRAILING = {"ama", "ve", "yani", "sey", "ee", "eee", "mesela", "cunku", "ki", "veya", "hem", "de", "da", "ile",
             "sonra", "hatta", "aslinda", "simdi", "iste", "fakat", "ancak", "bir", "gibi", "ya", "hani", "belki"}


def turn_complete(plan: list, state: dict, text: str, qa=None) -> bool:
    """Önizleme transkriptine göre adayın cevabı TAMAM mı? Tamamsa tarayıcı
    turu hemen bitirir (kısa "Hayır" beklemez); değilse daha uzun dinler
    (tarih/deneyim anlatan aday erken kesilmez). Karar vermez, yalnız
    zamanlamayı ayarlar: cevap yine /turn ile işlenir."""
    clean = (text or "").strip()
    if not clean:
        return False
    words = ex.fold(clean).split()
    if not words or words[-1] in _TRAILING:
        return False
    if ex.detect_intent(clean) or ex.detect_intent(clean, strong_only=True):
        return True
    if qa is not None and qa.split(clean)[1]:
        return True
    q = find_question(plan, state.get("current") or "")
    if q is None:
        return True
    if (state.get("mode") or "ask") == "confirm" and ex.extract_boolean(clean).status == "confirmed":
        return True
    res = ex.extract_rule(q["answer_type"], clean, q.get("options"))
    if q["answer_type"] == "date" and isinstance(res.value, dict) and res.value.get("precision") == "month":
        return False                           # "Kasımın..." - gün büyük olasılıkla geliyor
    if res.value is not None and res.status in ("confirmed", "approximate"):
        return True
    if res.status in ("unknown", "declined") or ex._is_unknown(ex.fold(clean)):
        return True
    return q["answer_type"] == "text" and len(words) >= 3


def _note_question(state: dict, text: str, reply: dict, key: Optional[str]) -> None:
    if reply.get("invite"):
        return
    state.setdefault("candidate_questions", []).append({
        "text": text[:500], "answer": reply.get("text"), "answered": bool(reply.get("answered")),
        "method": reply.get("method"), "topic": reply.get("topic"), "field_key": key, "turn": state.get("turn")})


def _with_volunteered(plan, state, q, text, extract_fn, today, max_silence, volunteer_fn) -> TurnResult:
    """Cevabı işler; aynı cevapta başka sorulara verilen bilgileri de yakalar.
    Başka bir konuya ait parça ("ama servis lazım") şu anki sorunun
    çıkarımından ayıklanır ki iki bilgi birbirini bozmasın."""
    vf = volunteer_fn or (lambda qs, t: ex.extract_volunteered(qs, t, today))
    others = [x for x in plan if x["field_key"] != q["field_key"]
              and not (state["answers"].get(x["field_key"]) or {}).get("final")]
    vol = vf(others, text) if others and text else {}
    use = text
    if vol:
        claimed = ex.claimed_clauses(vol)
        mine = [c for c in ex.clauses(text) if c not in claimed or ex.topic_of(q, c)]
        if mine:
            use = " , ".join(mine)
        state["_vol"] = {k: {"value": v["result"].value, "status": v["result"].status,
                             "confidence": v["result"].confidence, "method": v["result"].method,
                             "note": v["result"].note, "clause": v["clause"]} for k, v in vol.items()}
        if not mine:
            # Cevabın tamamı BAŞKA soruya ait ("Lojman?" -> "Servis yok yani"):
            # o bilgi kaydedilir, şu anki soru cevaplanmış sayılmaz, yeniden sorulur.
            recs, applied = _apply_volunteered(plan, state, q["field_key"])
            if applied:
                state["turn"] = int(state.get("turn") or 0) + 1
                state["silence"] = 0
                return TurnResult("next", f"{_echo_lead(applied)} {current_prompt(plan, state)}", recs,
                                  question=q_brief(q, plan))
    out = _process_answer(plan, state, use, extract_fn, today=today, max_silence=max_silence)
    if "_vol" in state:                    # cevap kesinleşmedi (netleştirme vb.): yine de kaydet
        recs, applied = _apply_volunteered(plan, state, q["field_key"])
        out.records += recs
        if applied and not out.ended:
            out.agent_text = "Not aldım; " + _join([echo_phrase(a, v) for a, v in applied]) + ". " + out.agent_text
    return out


def process_turn(plan: list, state: dict, text: str, extract_fn: Callable = None, *,
                 today: date = None, max_silence: int = 2, qa=None, volunteer_fn: Callable = None) -> TurnResult:
    """Adayın bir turu. Aday soru sorduysa (`qa` verildiyse) önce o
    cevaplanır: yalnız soruysa cevap + aynı soruya dönüş (netleştirme hakkı
    harcanmaz); cevap + soruysa cevap işlenir, sorunun cevabı öne eklenir."""
    clean = (text or "").strip()
    q = find_question(plan, state.get("current") or "")
    if not clean or q is None or (ex.detect_intent(clean, strong_only=True)
                                  and not qa_mod.is_identity_question(clean)):
        return _process_answer(plan, state, text, extract_fn, today=today, max_silence=max_silence)
    if qa is None:
        return _with_volunteered(plan, state, q, clean, extract_fn, today, max_silence, volunteer_fn)
    identity = qa_mod.is_identity_question(clean)
    answer_part, question_part = qa.split(clean)
    if not question_part:
        return _with_volunteered(plan, state, q, clean, extract_fn, today, max_silence, volunteer_fn)
    if not answer_part and not identity and ex.detect_intent(clean):
        # "Tekrar eder misiniz?" bir soru değil, kontrol niyeti - serbest metin
        # sorusunda cevap sanılmasın diye çıkarım atlanır, niyet işlenir.
        no_answer = lambda _q, _t: ex.ExtractionResult(value=None, status="unknown", confidence=0.0, method="intent")
        return _process_answer(plan, state, text, no_answer, today=today, max_silence=max_silence)
    if not answer_part:
        state["turn"] = int(state.get("turn") or 0) + 1
        state["silence"] = 0
        reply = qa.answer(question_part, state)
        _note_question(state, question_part, reply, q["field_key"])
        if reply.get("invite"):
            return TurnResult("answer", reply["text"], question=q_brief(q, plan), qa=reply)
        return TurnResult("answer", f"{reply['text']} {qa_mod.BACK_TEXT} {current_prompt(plan, state)}",
                          question=q_brief(q, plan), qa=reply)
    reply = qa.answer(question_part, state)
    _note_question(state, question_part, reply, q["field_key"])
    out = _with_volunteered(plan, state, q, answer_part, extract_fn, today, max_silence, volunteer_fn)
    if not reply.get("invite"):
        body = out.agent_text
        rec = next((r for r in out.records if r["field_key"] == q["field_key"] and r.get("final")), None)
        if rec is not None and rec.get("value") is not None and rec.get("status") == "confirmed":
            # "Var ama lojman ücretsiz mi?": soruyu cevapla, cevabı da kaydettiğini söyle.
            lead = state.get("last_lead") or ""
            if lead and body.startswith(lead):
                body = body[len(lead):].strip()
            echo = echo_phrase(q, rec["value"])
            body = f"{echo[:1].upper() + echo[1:]}, not ettim. {body}"
        out.agent_text = f"{reply['text']} {body}"
        out.qa = reply
    return out


def _process_answer(plan: list, state: dict, text: str, extract_fn: Callable = None, *,
                    today: date = None, max_silence: int = 2) -> TurnResult:
    """Adayın cevabını işler. `extract_fn(question, text) -> ExtractionResult`
    verilmezse kural katmanı kullanılır."""
    extract_fn = extract_fn or (lambda q, t: ex.extract_rule(q["answer_type"], t, q.get("options"), today))
    state["turn"] = int(state.get("turn") or 0) + 1
    q = find_question(plan, state.get("current") or "")
    if q is None:
        return start(plan, state)
    clean = (text or "").strip()

    # Sessizlik / anlaşılmayan ses
    if not clean:
        state["silence"] = int(state.get("silence") or 0) + 1
        if state["silence"] > max_silence:
            return TurnResult("pause", SILENCE_PAUSE_TEXT, ended=True, end_reason="silence")
        return TurnResult("silence", "Sizi duyamadım. " + current_prompt(plan, state), question=q_brief(q, plan))
    state["silence"] = 0

    # Güçlü kontrol niyetleri: her zaman önce.
    intent = ex.detect_intent(clean, strong_only=True)
    if intent == "human":
        return TurnResult("human", HUMAN_TEXT, ended=True, end_reason="human_requested")
    if intent == "stop":
        return TurnResult("stop", STOP_TEXT, ended=True, end_reason="candidate_stopped")

    mode = state.get("mode") or "ask"
    key = q["field_key"]
    if mode == "followup":
        # Takip sorusunun cevabı aynı cevabın notuna yazılır (yeni soru değil);
        # "geçelim/bilmiyorum" da kabul: bilgi zorunlu değil.
        fu = state.pop("followup", None) or {}
        state["mode"] = "ask"
        state.setdefault("followups_done", []).append(key)
        rec = dict(fu.get("rec") or {})
        weak = ex.detect_intent(clean)
        if weak == "repeat":
            state["mode"], state["followup"] = "followup", fu
            state["followups_done"].remove(key)
            return TurnResult("repeat", "Tabii, tekrar ediyorum. " + fu.get("prompt", ""), question=q_brief(q, plan))
        if rec and weak not in ("skip",):
            rec["notes"] = {**(rec.get("notes") or {}), "other_experience_detail": clean[:300]}
            rec["raw_text"], rec["new_revision"] = None, False
        out = _advance(plan, state, next_lead(state))
        out.records = ([rec] if rec else []) + out.records
        return out
    a = state["answers"].get(key) or {}
    clar_count = int(a.get("clarifications") or 0)
    max_clar = int(q.get("max_clarifications") if q.get("max_clarifications") is not None else 1)
    clarify_on = tuple((q.get("clarification") or {}).get("on") or DEFAULT_CLARIFY_ON)
    correcting = bool(a.get("correcting"))           # bu tur yeni revizyon açar
    corrected = correcting or bool(a.get("corrected"))  # aday önceki cevabını düzeltiyor

    res = extract_fn(q, clean)
    if res.value is not None and not ex.value_in_range(q["answer_type"], res.value, q.get("validation"), today):
        res.status, res.note = "invalid", "kabul edilen aralığın dışında"
    if q["answer_type"] == "date" and ex.start_contradiction(res, clean):
        # "Hemen başlayabilirim ama ay sonunda ayrılacağım": "hemen" kaydedilmez,
        # yalnız çelişen kısım sorulur.
        res.status, res.note, res.confidence = "unconfirmed", CONTRADICTION_NOTE, 0.4
        res.value = (res.related or {}).get("earliest_start_date")

    # Zayıf niyetler yalnız cevap çıkmadıysa (cevap içindeki "tekrar" kelimesi niyet değildir).
    if res.status not in ("confirmed", "approximate") or mode == "confirm":
        weak = ex.detect_intent(clean)
        if weak == "repeat":
            return TurnResult("repeat", "Tabii, tekrar ediyorum. " + current_prompt(plan, state),
                              question=q_brief(q, plan))
        if weak == "pause":
            return TurnResult("pause", PAUSE_TEXT, ended=True, end_reason="candidate_paused")
        if weak == "skip":
            rec = _record(q, clean, None, status="declined", value=None, clar_count=clar_count,
                          new_revision=correcting, method="intent")
            return _finalize(plan, state, q, rec, lead="Anlaşıldı, bu soruyu geçiyorum.")
        if weak == "correct_previous":
            prev_key = next((k for k in reversed(state["history"]) if k != key
                             and (state["answers"].get(k) or {}).get("final")), None)
            prev_q = find_question(plan, prev_key) if prev_key else None
            if prev_q is None:
                return TurnResult("repeat", "Düzeltilecek önceki bir cevap yok. " + current_prompt(plan, state),
                                  question=q_brief(q, plan))
            state["answers"][prev_key] = {**state["answers"][prev_key], "final": False, "correcting": True,
                                          "clarifications": 0}
            state["current"], state["mode"], state["pending"] = prev_key, "ask", None
            return TurnResult("next", "Elbette, önceki soruya dönüyorum. " + prev_q["question_text"],
                              question=q_brief(prev_q, plan))

    # ── Teyit modu: başvuruda kayıtlı bilgi ──
    if mode == "confirm":
        pre = state["prefill"].get(key) or {}
        yes = ex.extract_boolean(clean)
        if res.status in ("confirmed", "approximate") and res.value != pre.get("value") and yes.value is not True:
            rec = _record(q, clean, res, confirmation="corrected", new_revision=correcting)
            return _finalize(plan, state, q, rec, res)
        if yes.value is True and yes.status == "confirmed":
            rec = _record(q, clean, yes, status="confirmed", value=pre.get("value"), confirmation="confirmed",
                          method="confirm", new_revision=correcting)
            rec["source"] = "prefill"
            return _finalize(plan, state, q, rec)
        if yes.value is False:
            state["mode"] = "ask"
            return TurnResult("clarify", "Anlaşıldı. " + q["question_text"], question=q_brief(q, plan))
        if clar_count < max_clar:
            state["answers"][key] = {**a, "clarifications": clar_count + 1, "final": False}
            return TurnResult("clarify", "Kayıttaki bilgi doğru mu? Evet ya da hayır diyebilirsiniz.",
                              question=q_brief(q, plan))
        rec = _record(q, clean, res, status="unconfirmed", value=pre.get("value"), clar_status="exhausted",
                      clar_count=clar_count, new_revision=correcting)
        return _finalize(plan, state, q, rec, res)

    # ── Netleştirme modu ──
    if mode == "clarify":
        pending = state.get("pending")
        first_raw = a.get("raw")
        turns = list(a.get("turns") or []) + [clean]
        if res.status == "confirmed":
            rec = _record(q, first_raw, res, clar_status="resolved", clar_count=clar_count,
                          confirmation="corrected" if corrected else "confirmed", new_revision=correcting,
                          extra_turns=turns)
            return _finalize(plan, state, q, rec, res)
        if q["answer_type"] == "language_list":
            filled = ex.fill_language_levels(pending, clean)
            if filled is not None:
                rec = _record(q, first_raw, res, status="confirmed", value=filled, clar_status="resolved",
                              clar_count=clar_count, confirmation="corrected" if corrected else "confirmed",
                              method="confirm", new_revision=correcting, extra_turns=turns)
                return _finalize(plan, state, q, rec, res)
        yes = ex.extract_boolean(clean)
        if pending is not None and yes.value is True and yes.status == "confirmed":
            rec = _record(q, first_raw, res, status="confirmed", value=pending, clar_status="resolved",
                          clar_count=clar_count, confirmation="corrected" if corrected else "confirmed",
                          method="confirm", new_revision=correcting, extra_turns=turns)
            return _finalize(plan, state, q, rec, res)
        if pending is not None and (yes.value is False or res.status in ("unknown", "unconfirmed")):
            # "Henüz kesin değil": yaklaşık değer yaklaşık olarak KALIR (kesin
            # tarih gibi saklanmaz) ve İK'ya teyit gereken bilgi olarak düşer.
            rec = _record(q, first_raw, res, status="approximate", value=pending, clar_status="resolved",
                          clar_count=clar_count, new_revision=correcting, extra_turns=turns,
                          confirmation="corrected" if corrected else "not_asked")
            return _finalize(plan, state, q, rec, res)
        if res.status in clarify_on and clar_count < max_clar:
            state["answers"][key] = {**a, "clarifications": clar_count + 1, "final": False, "turns": turns,
                                     "status": res.status, "correcting": False, "corrected": corrected}
            if res.value is not None:
                state["pending"] = res.value
            return TurnResult("clarify", clarify_text(q, res.status, state.get("pending"), res.note),
                              question=q_brief(q, plan))
        final_value = res.value if res.value is not None else pending
        final_status = res.status if res.value is not None else ("approximate" if pending is not None else res.status)
        rec = _record(q, first_raw, res, status=final_status, value=final_value,
                      clar_status="exhausted" if final_status in clarify_on else "resolved",
                      clar_count=clar_count, new_revision=correcting, extra_turns=turns,
                      confirmation="corrected" if corrected else "not_asked")
        return _finalize(plan, state, q, rec, res)

    # ── Soru modu ──
    if res.status in clarify_on and clar_count < max_clar:
        state["answers"][key] = {"value": res.value, "status": res.status, "final": False,
                                 "clarifications": clar_count + 1, "raw": clean, "turns": [],
                                 "note": res.note, "correcting": False, "corrected": corrected}
        state["mode"] = "clarify"
        state["pending"] = res.value
        rec = _record(q, clean, res, final=False, clar_status="asked", clar_count=clar_count + 1,
                      new_revision=correcting)
        return TurnResult("clarify", clarify_text(q, res.status, res.value, res.note), [rec],
                          question=q_brief(q, plan))
    rec = _record(q, clean, res, clar_status="exhausted" if res.status in clarify_on else "none",
                  clar_count=clar_count, confirmation="corrected" if correcting else "not_asked",
                  new_revision=correcting)
    return _finalize(plan, state, q, rec, res)
