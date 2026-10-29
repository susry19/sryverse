// SkillMatch AI ön görüşme motorunu (saf Python) deneyim sayfasına kopyalar.
// Motor yeniden yazılmaz: dosyalar birebir alınır, kaynağın commit'i ve
// özetleri SOURCE.json'a yazılır. Kullanım (sryverse kökünden):
//   node scripts/skillmatch-x/sync-voice-engine.mjs ../skillmatch-ai
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { execSync } from 'child_process'

const repo = path.resolve(process.argv[2] || '../skillmatch-ai')
const src = path.join(repo, 'backend/services/voice_screening')
const out = path.resolve('src/skillmatch-x/voice/engine')
const FILES = ['engine.py', 'extraction.py', 'qa.py', 'seed.py']
fs.mkdirSync(out, { recursive: true })
const files = {}
for (const f of FILES) {
  const body = fs.readFileSync(path.join(src, f))
  fs.writeFileSync(path.join(out, f), body)
  files[f] = crypto.createHash('sha256').update(body).digest('hex').slice(0, 16)
}
let commit = null
try { commit = execSync(`git -C "${repo}" rev-parse --short HEAD`).toString().trim() } catch {}
fs.writeFileSync(path.join(out, 'SOURCE.json'), JSON.stringify({
  repo: 'skillmatch-ai', path: 'backend/services/voice_screening', commit, files,
  note: 'Birebir kopya; düzenlemeyin. Güncellemek için sync-voice-engine.mjs çalıştırın.',
}, null, 2) + '\n')
console.log(`${FILES.length} dosya kopyalandı (kaynak ${commit})`)
