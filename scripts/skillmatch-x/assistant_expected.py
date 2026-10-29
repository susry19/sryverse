"""verify-assistant.mjs için Python beklenen çıktıları (SkillMatch kaynak kodundan)."""
import json, os, sys, types
HERE = os.path.dirname(os.path.abspath(__file__))
backend = os.path.abspath(os.path.join(sys.argv[1], "backend"))
sys.path.insert(0, backend); sys.path.insert(0, HERE)
sys.modules.setdefault("models", types.ModuleType("models"))
from services import talent_search_service as ts, system_guide, legal_guide
import ast
src = open(os.path.join(backend, "services/ai_agent/intent.py"), encoding="utf-8").read()
tree = ast.parse(src); INTENTS = ORDER = None
for n in tree.body:
    if isinstance(n, (ast.Assign, ast.AnnAssign)):
        names = [t.id for t in (n.targets if isinstance(n, ast.Assign) else [n.target]) if isinstance(t, ast.Name)]
        if "INTENTS" in names: INTENTS = ast.literal_eval(n.value)
        if "_ORDER" in names: ORDER = ast.literal_eval(n.value)
def classify(text):
    low = (text or "").lower().replace("i̇", "i")
    hits = []
    for i, name in enumerate(ORDER):
        kw = next((k for k in INTENTS[name]["kw"] if k.lower().replace("i̇", "i") in low), None)
        if kw: hits.append((name, kw, i))
    if not hits: return None
    hits.sort(key=lambda h: (-len(h[1]), h[2]))
    return hits[0][0]
data = json.load(open(os.path.join(HERE, "../../src/skillmatch-x/data/matches.json")))
queries = json.load(sys.stdin)
class Rec:
    def __init__(self, d): self.__dict__.update(d)
    def __getattr__(self, n): return None
out = []
for q in queries:
    crit = ts.parse_query(q)
    rows = []
    for c in data["candidates"]:
        s = data["search"][str(c["id"])]
        ev = ts.evaluate(Rec(c), crit, s["years"], s["location_keys"])
        rows.append({"id": c["id"], "passes": ev["passes"], "score": ev["score"], "criteria": ev["criteria"]})
    out.append({"q": q, "crit": crit, "describe": ts.describe(crit), "rows": rows, "intent": classify(q),
                "guide": [s["anchor"] for s in system_guide.find_sections(q)], "legal": [r["id"] for r in legal_guide.find_rules(q)]})
print(json.dumps(out, ensure_ascii=False))
