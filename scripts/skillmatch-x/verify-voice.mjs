// Ön görüşme demosunun motor katmanını Node'da Pyodide ile çalıştırır ve
// ürünün dallanma kurallarını doğrular (çalışmayan adaya ihbar sorulmaz,
// cevabın içinde söylenen bilgi tekrar sorulmaz, ücret söylenmez, özet kuralla).
import fs from 'fs'
import { loadPyodide } from 'pyodide'
const E = new URL('../../src/skillmatch-x/voice/', import.meta.url)
const py = await loadPyodide()
py.FS.mkdirTree('/app/services/voice_screening')
py.FS.writeFile('/app/services/__init__.py', ''); py.FS.writeFile('/app/services/voice_screening/__init__.py', ''); py.FS.writeFile('/app/models.py', '')
for (const f of ['engine.py', 'extraction.py', 'qa.py', 'seed.py']) py.FS.writeFile('/app/services/voice_screening/' + f, fs.readFileSync(new URL('engine/' + f, E), 'utf8'))
py.FS.writeFile('/app/runtime.py', fs.readFileSync(new URL('runtime.py', E), 'utf8'))
py.runPython("import sys; sys.path.insert(0,'/app'); import runtime")
const rt = py.pyimport('runtime')
const ctx = { first_name: 'Elif', hotel: { id: 1, name: 'Belek Premium', city: 'Antalya', offers_accommodation: true }, position: { title: 'Garson', department: 'Yiyecek ve İçecek', employment_type: 'Sezonluk' }, cfg: { qa_enabled: true, qa_max_questions: 10, max_silence_reprompts: 2 }, prefill: {} }
const fails = []
const check = (ok, msg) => { if (!ok) fails.push(msg) }
let r = JSON.parse(rt.start(JSON.stringify(ctx)))
check(r.text.includes('yapay zekâ asistanıyım'), 'AI kimliği açıklanmadı')
const answers = ['Hayır, geçen ay ayrıldım. Hemen başlayabilirim ama gece vardiyası istemiyorum.', 'Evet olur.', 'Maaş ne kadar?', 'Evet uygun.', 'Hayır.', 'Evet, servis lazım.', 'Üç yıl.', 'İngilizce iyi.', 'Yok.', 'Fark etmez.', 'Evet.', 'Evet.']
const asked = []
for (const a of answers) {
  if (r.ended) break
  if (r.question) asked.push(r.question.field_key)
  r = JSON.parse(rt.turn(a))
  if (a === 'Maaş ne kadar?') check(/İK ekibi sizinle görüşecek/.test(r.text) && !/\d{2}\.\d{3}/.test(r.text), 'ücret politikası uygulanmadı')
}
check(r.ended && r.end_reason === 'completed', `görüşme tamamlanmadı: ${r.end_reason}`)
check(!asked.includes('notice_period'), 'çalışmayan adaya ihbar süresi soruldu')
check(!asked.includes('earliest_start_date') && !asked.includes('shift_availability'), 'cevabın içinde verilen bilgi yeniden soruldu')
const s = JSON.parse(rt.summary())
check(s.lines.some((l) => l.startsWith('Mevcut çalışma durumu: Çalışmıyor')), 'özet satırı eksik')
check(s.candidate_questions.some((q) => !q.answered), 'ücret sorusu İK\'ya iletilmedi')
console.log(fails.length ? 'HATA:\n- ' + fails.join('\n- ') : `ön görüşme motoru: ${asked.length} soru soruldu, dallanma kuralları doğrulandı`)
process.exit(fails.length ? 1 : 0)
