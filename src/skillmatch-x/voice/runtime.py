"""Tanıtım sitesi için ön görüşme çalışma zamanı (tarayıcıda, Pyodide).

SORU MOTORU YENİDEN YAZILMADI: engine.py, extraction.py, qa.py ve seed.py
SkillMatch deposundan birebir kopyalanır (scripts/skillmatch-x/sync-voice-engine.mjs).
Bu dosya yalnız services/voice_screening/service.py'nin veritabanına
dokunmayan orkestrasyonunu taklit eder:

  plan_for / _render        -> build_plan
  qa_for / build_facts      -> _qa (her turda ilerlemeyle yeniden)
  submit_turn               -> turn  (kural çıkarımı; LLM anahtarı yok)
  candidate_pause / human   -> pause / human
  _finalize_summary         -> summary (yalnız yapılandırılmış cevaplardan, kuralla)

Hiçbir şey kaydedilmez; durum sekme kapanınca yok olur.
"""
import json

from services.voice_screening import engine, extraction as ex, qa as qa_mod, seed

_S = {}


def _render(text, hotel_name, position_title):
    return (text or "").replace("{otel}", hotel_name or "Başvurduğunuz otel") \
                       .replace("{pozisyon}", position_title or "Başvurduğunuz pozisyon")


def _plan(hotel_name, position_title):
    items = []
    for i, spec in enumerate(seed.DEFAULT_QUESTIONS):
        q = {"id": i + 1, "version": 1, "options": [], "validation": {}, "clarification": {}, "max_clarifications": 1,
             "is_required": True, "confirm_existing": False, "condition": None, "hotel_ids": [],
             "position_ids": [], "category": "other", "help_text": None, "status": "published"}
        q.update(spec)
        q["question_text"] = _render(q["question_text"], hotel_name, position_title)
        items.append(q)
    return engine.build_plan(items)


def _progress(plan, st):
    applicable = [q for q in plan if engine.condition_holds(q.get("condition"), st)]
    done = len([q for q in applicable if (st["answers"].get(q["field_key"]) or {}).get("final")])
    return {"answered": done, "total": len(applicable)}


def _qa():
    c = _S["ctx"]
    facts = qa_mod.build_facts(position=c["position"], hotel=c["hotel"], cfg=c["cfg"],
                               progress=_progress(_S["plan"], _S["st"]), recording=False)
    return qa_mod.QA(facts=facts, use_llm=False, max_questions=int(c["cfg"].get("qa_max_questions") or 10))


def _rows():
    """Sorular ve durumları: akışın dallanmasını görselleştirmek için."""
    plan, st = _S["plan"], _S["st"]
    out = []
    for q in plan:
        k = q["field_key"]
        a = st["answers"].get(k) or {}
        rec = _S["current"].get(k)
        cond = q.get("condition")
        holds = engine.condition_holds(cond, st)
        if a.get("final"):
            src = (rec or {}).get("source")
            state = "prefilled" if a.get("status") == "prefilled" else "volunteered" if src == "volunteered" else "answered"
        elif st.get("current") == k:
            state = "current"
        elif cond and not holds:
            dep = st["answers"].get(cond.get("field"))
            state = "skipped" if dep is not None and dep.get("final") else "waiting"
        else:
            state = "pending"
        out.append({
            "key": k, "label": seed.CATEGORIES.get(q.get("category") or "other", k), "text": q["question_text"],
            "required": bool(q.get("is_required", True)), "state": state, "status": a.get("status"),
            "value": ex.display_value(q["answer_type"], a.get("value"), q.get("options")) if a.get("final") else None,
            "condition": ({"field": cond.get("field"), "op": cond.get("op"), "value": cond.get("value"),
                           "label": seed.CATEGORIES.get((engine.find_question(plan, cond.get("field")) or {}).get("category"), cond.get("field"))}
                          if cond else None),
            "clarifications": a.get("clarifications") or 0,
        })
    return out


def _view(res, user_text=None):
    plan, st = _S["plan"], _S["st"]
    recs = []
    for r in res.records or []:
        q = engine.find_question(plan, r["field_key"]) or {}
        _S["current"][r["field_key"]] = r
        recs.append({"key": r["field_key"], "label": seed.CATEGORIES.get(q.get("category") or "other", r["field_key"]),
                     "value": ex.display_value(q.get("answer_type", "text"), r.get("value"), q.get("options")),
                     "status": r.get("status"), "source": r.get("source"), "method": r.get("method"),
                     "final": bool(r.get("final")), "flags": (r.get("notes") or {}).get("flags") or []})
    q = engine.find_question(plan, st.get("current") or "")
    return json.dumps({
        "action": res.action, "text": res.agent_text, "segments": engine.speech_segments(res.agent_text),
        "ended": res.ended, "end_reason": res.end_reason, "records": recs, "qa": res.qa,
        "question": engine.q_brief(q, plan) if q else None, "mode": st.get("mode"), "current": st.get("current"),
        "progress": _progress(plan, st), "rows": _rows(), "silence": st.get("silence", 0), "turn": st.get("turn", 0),
    }, ensure_ascii=False, default=str)


def start(ctx_json):
    ctx = json.loads(ctx_json)
    hotel_name = engine.spoken_name(ctx["hotel"]["name"])
    title = engine.spoken_name(ctx["position"]["title"], turkish=True)
    ctx["position"]["title"] = title
    ctx["hotel"]["name"] = hotel_name
    _S.clear()
    _S["ctx"] = ctx
    _S["plan"] = _plan(hotel_name, title)
    prefill = {}
    for k, v in (ctx.get("prefill") or {}).items():
        q = engine.find_question(_S["plan"], k)
        if q is not None and ex.validate_value(q["answer_type"], v["value"], q.get("options")):
            prefill[k] = {"value": v["value"], "status": "confirmed", "source_label": v.get("source_label") or "Başvurunuzda"}
    _S["st"] = engine.new_state(prefill)
    _S["current"] = {}
    _S["today"] = ex.today_tr()
    intro = engine.disclosure(hotel_name, title, ctx.get("first_name"))
    res = engine.start(_S["plan"], _S["st"])
    res.agent_text = intro + " " + res.agent_text
    return _view(res)


def turn(text):
    today = _S["today"]
    res = engine.process_turn(
        _S["plan"], _S["st"], text,
        lambda q, t: ex.extract(q, t, today=today, use_llm=False),
        today=today, max_silence=int(_S["ctx"]["cfg"].get("max_silence_reprompts", 2)), qa=_qa(),
        volunteer_fn=lambda qs, t: ex.extract_volunteered(qs, t, today))
    return _view(res, text)


def complete(text):
    """engine.turn_complete: konuşma sonu zamanlaması (karar değil)."""
    try:
        return bool(engine.turn_complete(_S["plan"], _S["st"], text, qa=_qa()))
    except Exception:
        return False


def pause():
    return _view(engine.TurnResult("pause", engine.PAUSE_TEXT, ended=True, end_reason="candidate_paused"))


def human():
    return _view(engine.TurnResult("human", engine.HUMAN_TEXT, ended=True, end_reason="human_requested"))


def summary():
    """service._finalize_summary ile aynı kurallar; kayıtlar bellekteki son revizyonlardan."""
    plan, st = _S["plan"], _S["st"]
    by_key = {q["field_key"]: q for q in plan}
    order = {q["field_key"]: i for i, q in enumerate(plan)}
    lines, unconfirmed, notice_noted = [], [], False
    for k in sorted(_S["current"], key=lambda x: order.get(x, 999)):
        r = _S["current"][k]
        if not r.get("final"):
            continue
        q = by_key.get(k) or {}
        label = seed.CATEGORIES.get(q.get("category") or "other", k)
        shown = ex.display_value(q.get("answer_type", "text"), r.get("value"), q.get("options"))
        status = r.get("status")
        if status == "declined":
            lines.append(f"{label}: aday cevaplamak istemedi.")
            continue
        if status in ("unknown", "invalid"):
            unconfirmed.append(label)
            lines.append(f"{label}: net bir cevap alınamadı.")
            continue
        suffix = ""
        if status in ("approximate", "unconfirmed"):
            suffix = " (yaklaşık / teyit gerekli)"
            unconfirmed.append(label)
        elif status == "prefilled":
            suffix = " (başvuru kaydından, yeniden sorulmadı)"
        lines.append(f"{label}: {shown}{suffix}")
        notes = r.get("notes") or {}
        other = (notes.get("related") or {}).get("other_experience_months")
        if other:
            detail = notes.get("other_experience_detail")
            lines.append("Farklı alanda deneyim: " + ex.display_value("duration", {"months": other})
                         + (f" ({detail})" if detail else ""))
        if (not notice_noted and (notes.get("related") or {}).get("notice_period_days")
                and k not in ("earliest_start_date", "notice_period")):
            notice_noted = True
            lines.append(f"Aday beyanı: mevcut işinden yaklaşık {notes['related']['notice_period_days']} "
                         "gün içinde ayrılabileceğini söyledi.")
    missing = engine.required_missing(plan, st)
    missing_labels = [seed.CATEGORIES.get((by_key.get(k) or {}).get("category") or "other", k) for k in missing]
    flags = any("possible_instruction" in ((r.get("notes") or {}).get("flags") or []) for r in _S["current"].values())
    asked = [{"text": c.get("text"), "answer": c.get("answer"), "answered": bool(c.get("answered"))}
             for c in (st.get("candidate_questions") or [])]
    return json.dumps({
        "lines": lines, "unconfirmed": unconfirmed, "missing": missing_labels, "candidate_questions": asked,
        "instruction_like_content": flags, "source": "rule",
        "needs_hr_attention": bool(missing or unconfirmed or flags or any(not c["answered"] for c in asked)),
        "disclaimer": "Yapılandırılmış aday cevaplarından otomatik derlendi. Değerlendirme ya da karar içermez.",
    }, ensure_ascii=False)
