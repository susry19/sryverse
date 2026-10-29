// JS ağırlıklama adımı, SkillMatch'in varsayılan ağırlıklarla verdiği skoru birebir üretmeli.
import fs from 'fs'
import { makeScorer } from '../../src/skillmatch-x/lib/score.js'
const data = JSON.parse(fs.readFileSync(new URL('../../src/skillmatch-x/data/matches.json', import.meta.url)))
const m = makeScorer(data)
let bad = 0
for (const p of data.pairs) { const s = m.score(p, m.DEFAULT_WEIGHTS).score; if (s !== p.default_score) { bad++; console.log('FARK', p.c, p.p, s, p.default_score) } }
console.log(`${data.pairs.length} çift, ${bad} fark (kaynak ${data.source.commit})`)
process.exit(bad ? 1 : 0)
