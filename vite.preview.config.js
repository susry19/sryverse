import { defineConfig, mergeConfig } from 'vite'
import fs from 'fs'
import path from 'path'
import base from './vite.config.js'

/* SkillMatch deneyiminin tek başına, göreli yollu önizleme paketi
   (sitenin derlemesini etkilemez): npm run build:skillmatch-preview
   Çıktı dist-preview/ — herhangi bir statik barındırmada ya da Artifact
   olarak açılır. Artifact .zip sunmadığından Pyodide standart kütüphanesi
   base64 metin dosyasına çevrilir (worker çözer). */
function stdlibAsText() {
  return {
    name: 'pyodide-stdlib-b64',
    apply: 'build',
    closeBundle() {
      const dir = path.resolve('dist-preview/pyodide')
      const zip = path.join(dir, 'python_stdlib.zip')
      if (!fs.existsSync(zip)) return
      fs.writeFileSync(path.join(dir, 'python_stdlib.b64.txt'), fs.readFileSync(zip).toString('base64'))
      fs.unlinkSync(zip)
    },
  }
}

export default mergeConfig(base, defineConfig({
  base: './',
  plugins: [stdlibAsText()],
  define: { 'import.meta.env.VITE_PYODIDE_STDLIB_B64': 'true' },
  build: { outDir: 'dist-preview', emptyOutDir: true, rollupOptions: { input: 'skillmatch-deneyim.html' } },
}))
