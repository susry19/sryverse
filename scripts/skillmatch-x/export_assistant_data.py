"""SkillMatch asistanının deterministik veri tablolarını JSON'a aktarır.

Asistan cevaplarını sayfa uydurmaz: niyet tablosu (ai_agent/intent.py),
sistem kullanım rehberi (system_guide.py), iş hukuku notları
(legal_guide.py) ve doğal dil aday araması sözlükleri
(talent_search_service.py) ürünün kendi kaynaklarından okunur. Tarayıcı
yalnız bu tabloların üstündeki küçük eşleştirme fonksiyonlarını uygular;
verify-assistant.mjs aynı sorgularda Python sonucuyla birebir karşılaştırır.

Çalıştırma (sryverse kökünden):
  python3 scripts/skillmatch-x/export_assistant_data.py --skillmatch ../skillmatch-ai
"""
import argparse
import ast
import json
import os
import subprocess
import sys
import types

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "..", "src", "skillmatch-x", "data", "assistant.json")


def literal(src: str, name: str):
    tree = ast.parse(src)
    for node in tree.body:
        targets = []
        if isinstance(node, ast.Assign):
            targets = [t.id for t in node.targets if isinstance(t, ast.Name)]
        elif isinstance(node, ast.AnnAssign) and isinstance(node.target, ast.Name):
            targets = [node.target.id]
        if name in targets:
            return ast.literal_eval(node.value)
    raise KeyError(name)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--skillmatch", default=os.path.join(HERE, "..", "..", "..", "skillmatch-ai"))
    args = ap.parse_args()
    backend = os.path.abspath(os.path.join(args.skillmatch, "backend"))
    sys.path.insert(0, backend)
    sys.modules.setdefault("models", types.ModuleType("models"))

    from services import system_guide, legal_guide, talent_search_service as ts

    intent_src = open(os.path.join(backend, "services", "ai_agent", "intent.py"), encoding="utf-8").read()
    intents = literal(intent_src, "INTENTS")
    order = literal(intent_src, "_ORDER")
    try:
        commit = subprocess.check_output(["git", "-C", args.skillmatch, "rev-parse", "--short", "HEAD"], text=True).strip()
    except Exception:
        commit = None

    out = {
        "source": {"repo": "skillmatch-ai", "commit": commit,
                   "modules": ["services/ai_agent/intent.py", "services/system_guide.py",
                               "services/legal_guide.py", "services/talent_search_service.py"]},
        "intents": {k: {"agent": v["agent"], "kw": v["kw"]} for k, v in intents.items()},
        "order": order,
        "guide": [{k: s[k] for k in ("anchor", "title", "path", "body", "who", "keywords")} for s in system_guide.SECTIONS],
        "legal": {"rules": [{k: r.get(k) for k in ("id", "title", "source", "text", "keywords", "protected")}
                            for r in legal_guide.RULES],
                  "disclaimer": legal_guide.DISCLAIMER, "reviewed": legal_guide.LAST_REVIEWED},
        "search": {
            "languages": ts.LANGUAGES, "level_order": ts.LEVEL_ORDER, "level_words": ts._LEVEL_WORDS,
            "cities": ts.CITIES, "districts": ts.DISTRICTS,
            "protected": [{"pattern": rx.pattern, "label": label} for rx, label in ts._PROTECTED],
            "protected_reason": ts.PROTECTED_REASON, "stopwords": sorted(ts._STOPWORDS), "seniority": ts._SENIORITY,
        },
        # Arayüz metinleri (static/app.js, services/ai_agent/gateway.py, dialog.py)
        "ui": {
            "greeting": "Merhaba! Ben SkillMatch AI asistanıyım. Yetkileriniz kapsamında aday, pozisyon, mülakat, onay ve kadro sorularınızı yanıtlar; işlem gerekiyorsa önce onayınızı isterim.",
            "placeholder": "Ne yapmak istersiniz?",
            "fallback": "Tam anlayamadım. Şunlardan birini mi yapmak istersiniz? Ya da isteğinizi bir cümleyle yazın (örn. “Lale'ye mesaj at”).",
            "search_placeholder": "Örn: Antalya'da 3+ yıl deneyimli, İngilizce B2 bilen garson",
        },
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
    print(f"asistan verisi yazıldı -> {os.path.relpath(OUT)} ({len(out['intents'])} niyet, {len(out['guide'])} rehber bölümü, kaynak {commit})")


if __name__ == "__main__":
    main()
