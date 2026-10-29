import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

/* SkillMatch deneyim sayfasının ön görüşme demosu, ürünün Python soru
   motorunu tarayıcıda Pyodide ile çalıştırır. Pyodide çekirdeği CDN'den
   değil sitenin kendisinden (/pyodide/) verilir: geliştirmede node_modules'tan
   sunulur, derlemede dist/pyodide'a kopyalanır. Yalnız demo başlatılınca indirilir. */
const PYODIDE_FILES = ['pyodide.mjs', 'pyodide.asm.js', 'pyodide.asm.wasm', 'python_stdlib.zip', 'pyodide-lock.json']
const TYPES = { '.mjs': 'text/javascript', '.js': 'text/javascript', '.wasm': 'application/wasm', '.zip': 'application/zip', '.json': 'application/json' }

function pyodideAssets() {
  const dir = path.resolve('node_modules/pyodide')
  return {
    name: 'pyodide-assets',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const m = req.url && req.url.match(/^\/pyodide\/([^?#]+)/)
        if (!m || !PYODIDE_FILES.includes(m[1])) return next()
        res.setHeader('Content-Type', TYPES[path.extname(m[1])] || 'application/octet-stream')
        fs.createReadStream(path.join(dir, m[1])).pipe(res)
      })
    },
    writeBundle(opts) {
      const out = path.join(opts.dir || 'dist', 'pyodide')
      fs.mkdirSync(out, { recursive: true })
      for (const f of PYODIDE_FILES) fs.copyFileSync(path.join(dir, f), path.join(out, f))
    },
  }
}

export default defineConfig({
  plugins: [react(), pyodideAssets()],
  worker: { format: 'es' },
})
