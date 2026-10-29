/* Ön görüşme motoru işçisi: Pyodide + SkillMatch'in voice_screening
   modülleri (birebir kopya, engine/SOURCE.json). Ana iş parçacığını
   bloklamaz; yalnız ziyaretçi demoyu başlattığında oluşturulur. */
import engine from './engine/engine.py?raw'
import extraction from './engine/extraction.py?raw'
import qa from './engine/qa.py?raw'
import seed from './engine/seed.py?raw'
import runtime from './runtime.py?raw'

let rt = null
let booting = null

async function boot() {
  const base = `${self.location.origin}/pyodide/`
  const { loadPyodide } = await import(/* @vite-ignore */ `${base}pyodide.mjs`)
  const py = await loadPyodide({ indexURL: base })
  py.FS.mkdirTree('/app/services/voice_screening')
  py.FS.writeFile('/app/services/__init__.py', '')
  py.FS.writeFile('/app/services/voice_screening/__init__.py', '')
  // seed.py `import models` yapar (yalnız veritabanına yazan fonksiyonda kullanılır)
  py.FS.writeFile('/app/models.py', '')
  const files = { 'engine.py': engine, 'extraction.py': extraction, 'qa.py': qa, 'seed.py': seed }
  for (const [f, body] of Object.entries(files)) py.FS.writeFile(`/app/services/voice_screening/${f}`, body)
  py.FS.writeFile('/app/runtime.py', runtime)
  py.runPython("import sys; sys.path.insert(0, '/app'); import runtime")
  rt = py.pyimport('runtime')
}

self.onmessage = async ({ data }) => {
  const { id, op, arg } = data
  try {
    if (!rt) { booting = booting || boot(); await booting }
    let out = null
    if (op === 'boot') out = true
    else if (op === 'complete') out = rt.complete(arg)
    else if (op === 'start') out = JSON.parse(rt.start(JSON.stringify(arg)))
    else if (op === 'turn') out = JSON.parse(rt.turn(arg ?? ''))
    else if (['pause', 'human', 'summary'].includes(op)) out = JSON.parse(rt[op]())
    else throw new Error(`bilinmeyen işlem: ${op}`)
    self.postMessage({ id, ok: true, out })
  } catch (e) {
    self.postMessage({ id, ok: false, error: String(e && e.message || e).slice(0, 600) })
  }
}
