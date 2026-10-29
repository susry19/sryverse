// Asistan ve AI arama portunun SkillMatch Python koduyla birebir aynı sonucu verdiğini doğrular.
// Kullanım: node scripts/skillmatch-x/verify-assistant.mjs ../skillmatch-ai
import fs from 'fs'
import { execFileSync } from 'child_process'
import { makeAssistant } from '../../src/skillmatch-x/lib/assistant.js'
const repo = process.argv[2] || '../skillmatch-ai'
const py = process.env.PYTHON || 'python3'
const A = JSON.parse(fs.readFileSync(new URL('../../src/skillmatch-x/data/assistant.json', import.meta.url)))
const M = JSON.parse(fs.readFileSync(new URL('../../src/skillmatch-x/data/matches.json', import.meta.url)))
const Q = [
  "Antalya'da 3+ yıl deneyimli, İngilizce B2 bilen garson", 'Rusça bilen resepsiyonist', 'Belek\'te 5 yıldızlı otel deneyimi olan, Rusça bilen resepsiyonist',
  'HACCP sertifikalı, sezonluk çalışabilecek aşçı yardımcısı', "Antalya'da yaşayan, lojman istemeyen kat görevlisi", 'İngilizce B2, 2+ yıl a la carte deneyimli garson',
  '25-35 yaş arası bayan resepsiyonist', 'Muğla barmen kokteyl', 'kıdemli teknisyen elektrik 5 yıl', 'Almanca akıcı konsiyerj Bodrum', 'masaj terapist rusça',
  'Bu hafta kaç başvuru geldi?', 'Pipeline özeti', 'Kadro durumu nedir?', 'Bekleyen onaylarım neler?', 'İşe alım performans raporu',
  "SkillMatch'te pozisyon nasıl açılır?", 'Elif K. için mülakat planla', 'evli adayları elemek istiyorum', 'Garson için en uygun aday kim?', 'ilanı nereden yayınlarım',
]
const exp = JSON.parse(execFileSync(py, ['scripts/skillmatch-x/assistant_expected.py', repo], { input: JSON.stringify(Q) }).toString())
const a = makeAssistant(A)
let bad = 0
const same = (x, y) => JSON.stringify(x) === JSON.stringify(y)
for (const e of exp) {
  const crit = a.parseQuery(e.q)
  if (!same(crit, e.crit)) { bad++; console.log('CRIT', e.q, JSON.stringify(crit), JSON.stringify(e.crit)) }
  if (a.describe(crit) !== e.describe) { bad++; console.log('DESC', e.q) }
  for (const r of e.rows) {
    const c = M.candidates.find((x) => x.id === r.id), s = M.search[String(r.id)]
    const ev = a.evaluate(c, crit, s.years, s.location_keys, s.text)
    if (ev.passes !== r.passes || ev.score !== r.score || !same(ev.criteria, r.criteria)) { bad++; console.log('EVAL', e.q, r.id, JSON.stringify(ev.criteria), JSON.stringify(r.criteria)) }
  }
  const it = a.classify(e.q)?.name || null
  if (it !== e.intent) { bad++; console.log('INTENT', e.q, it, e.intent) }
  const g = a.findSections(e.q).map((s) => s.anchor)
  if (!same(g, e.guide)) { bad++; console.log('GUIDE', e.q, g, e.guide) }
  const l = a.findRules(e.q).map((r) => r.id)
  if (!same(l, e.legal)) { bad++; console.log('LEGAL', e.q, l, e.legal) }
}
console.log(`${Q.length} sorgu × ${M.candidates.length} aday, ${bad} fark`)
process.exit(bad ? 1 : 0)
