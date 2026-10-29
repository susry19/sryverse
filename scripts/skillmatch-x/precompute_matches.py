"""Eşleşme sinyallerini SkillMatch'in KENDİ koduyla hesaplar.

Sayfa eşleştirme formülünü yeniden yazmaz. Bu betik SkillMatch deposundaki
services/match_criteria_service.py, skill_match_service.py,
match_score_service.py ve candidate_profile_service.py fonksiyonlarını
sentetik aday/pozisyon nesneleri üzerinde çalıştırır ve sonucu JSON'a yazar:

  * 8 kriterin sinyal değerleri (ağırlıktan bağımsız)
  * zorunlu / tercih edilen yetkinliklerin kanıt kademesi (liste / CV metni)
  * alan deneyimi, unvan eşleşmesi, uygunluk kapısı, "neden uygun / doğrulanacak"

Tarayıcı yalnız ağırlıklı ortalamayı (match_criteria_service.score) yeniden
uygular; ziyaretçi ağırlık değiştirdiğinde skor böyle anında güncellenir.
Varsayılan ağırlıklarla üretilen skor burada ayrıca yazılır ve sayfa testi
JS sonucunun bununla birebir aynı olduğunu doğrular.

Çalıştırma (sryverse kökünden):
  python3 scripts/skillmatch-x/precompute_matches.py --skillmatch ../skillmatch-ai
"""
import argparse
import json
import os
import subprocess
import sys
import types
from datetime import date

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "..", "src", "skillmatch-x", "data", "matches.json")

# Ölçüm günü sabit: deneyim süreleri kapalı aralık olduğundan bugüne bağlı değil,
# yine de bütün çıktı tek tarihe sabitlenir.
TODAY = date(2026, 10, 29)


class _Stub(types.ModuleType):
    """`models` yalnız tip ipucu ve veritabanı yolları için içe aktarılıyor;
    burada kullanılan saf fonksiyonlar ona dokunmaz."""
    def __getattr__(self, name):
        return type(name, (), {})


class Rec:
    def __init__(self, **kw):
        self.__dict__.update(kw)

    def __getattr__(self, name):
        return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--skillmatch", default=os.path.join(HERE, "..", "..", "..", "skillmatch-ai"))
    args = ap.parse_args()
    backend = os.path.abspath(os.path.join(args.skillmatch, "backend"))
    sys.path.insert(0, backend)
    sys.path.insert(0, HERE)
    sys.modules.setdefault("models", _Stub("models"))
    for name in ("database", "config"):
        sys.modules.setdefault(name, _Stub(name))

    from services import match_criteria_service as mcs
    from services import skill_match_service as sms
    from services import match_score_service as mss
    from services import candidate_profile_service as cps
    from services.experience_service import format_months, total_experience
    from services import talent_search_service as ts
    from services.candidate_pool import location_keys
    import dataset as ds

    try:
        commit = subprocess.check_output(["git", "-C", args.skillmatch, "rev-parse", "--short", "HEAD"],
                                         text=True).strip()
    except Exception:
        commit = None

    hotels = {h["id"]: h for h in ds.HOTELS}
    cands = [Rec(full_name=c["name"], **c) for c in ds.CANDIDATES]
    poss = [Rec(**p) for p in ds.POSITIONS]
    keys = [c["key"] for c in mcs.CATALOG]

    pairs = []
    for p in poss:
        ctx = {"position_city": hotels[p.hotel_id]["city"]}
        for c in cands:
            sig = {k: mcs.SIGNALS[k](c, p, ctx) for k in keys}
            sig = {k: (None if v is None else round(v, 1)) for k, v in sig.items()}
            fx = mcs.field_experience(c, p)
            req = sms.match_requirements(c, p.required_skills or [])
            pref = sms.match_requirements(c, p.preferred_skills or [])
            # Uygunluk kapısının skordan BAĞIMSIZ kısmı: skor eşiği tarayıcıda uygulanır.
            ok, reason = mss.eligibility(c, p, 100)
            strong, verify = cps._match_reasons(c, p)
            evidence = cps.match_evidence(c, p)
            default = mcs.score(c, p, dict(mcs.DEFAULT_WEIGHTS), ctx)
            pairs.append({
                "c": c.id, "p": p.id,
                "signals": sig,
                "title_match": mcs.title_in_candidate_text(c, p),
                "family_match": sms.role_family_match(c, p),
                "field": {"basis": fx["basis"], "family": fx.get("family_label"),
                          "entries": fx["entries"], "total": fx["total_entries"],
                          "years": fx["years"],
                          "label": format_months(int(round(fx["years"] * 12))) if fx["years"] else None},
                "required": [{"term": r["skill"], "matched": r["matched"], "tier": r.get("tier"),
                              "credit": round(r.get("credit") or 0, 3)} for r in req],
                "preferred": [{"term": r["skill"], "matched": r["matched"], "tier": r.get("tier")}
                              for r in pref],
                "gate": {"ok": ok, "reason": reason},
                "why_fit": strong, "to_verify": verify,
                "evidence": [{"term": e["term"], "found": e["found"], "section": e.get("section"),
                              "quote": e.get("quote"), "is_match": e["is_match"]} for e in evidence],
                "default_score": default["score"],
            })

    # Doğal dil aday araması girdileri (routers/ai_recruitment.talent_search ile aynı):
    # toplam deneyim yılı, lokasyon anahtarları ve aranabilir aday metni.
    search = {c.id: {"years": total_experience(c.experience or [])["years"] if c.experience else None,
                     "location_keys": location_keys(c), "text": ts._candidate_text(c)} for c in cands}
    out = {
        "source": {"repo": "skillmatch-ai", "commit": commit, "score_version": mss.SCORE_VERSION,
                   "generated_for": TODAY.isoformat(),
                   "modules": ["services/match_criteria_service.py", "services/skill_match_service.py",
                               "services/match_score_service.py", "services/candidate_profile_service.py",
                               "services/talent_search_service.py", "services/candidate_pool.py"]},
        "catalog": [{"key": c["key"], "label": c["label"], "default": c["default"], "hint": c["hint"]}
                    for c in mcs.CATALOG],
        "constants": {"title_bonus": mcs.TITLE_BONUS, "min_score": mss.RECOMMENDATION_MIN_SCORE,
                      "max_score": 98, "strong": 80},
        "hotels": ds.HOTELS, "positions": ds.POSITIONS, "candidates": ds.CANDIDATES,
        "pairs": pairs,
        "search": search,
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
    print(f"{len(pairs)} çift yazıldı -> {os.path.relpath(OUT)} (kaynak {commit})")


if __name__ == "__main__":
    main()
