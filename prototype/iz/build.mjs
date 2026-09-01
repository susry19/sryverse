/* İki çıktı, tek kaynak:
   dist.html     — bağımsız, tam sayfa (yerel çalıştırma ve test)
   artifact.html — Artifact iskeleti için sarmalayıcısız gövde */
import fs from 'fs'
const rd = f => fs.readFileSync(f, 'utf8')
const html = rd('index.html')
const app = rd('iz.js')
const three = rd('three.min.js')
const atlas = fs.readFileSync('atlas.webp').toString('base64')
const atlasTag = `<script>window.IZ_ATLAS="data:image/webp;base64,${atlas}";</script>`

// DİKKAT: replace'in string biçimi $& $` $' gibi dizileri yorumlar ve
// küçültülmüş kaynağı bozar. Her zaman fonksiyon biçimi kullanılır.
const koy = (s, im, yeni) => s.replace(im, () => yeni)
const yap = (fontBlok) => koy(
  koy(koy(html, '<!--FONTS-->', fontBlok),
      '<!--THREE-->', atlasTag + '\n<script>' + three + '</script>'),
  '<!--APP-->', '<script>' + app + '</script>')

// 1) Yerel: yazı tipleri gömülü, dış bağımlılık sıfır
fs.writeFileSync('dist.html', yap(`<style>${rd('fonts.css')}</style>`))

// 2) Artifact: yazı tipleri Google Fonts'tan (izinli), gövde sarmalayıcısız
const art = yap(
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
  '<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=Inter:wght@400;500&family=DM+Mono:wght@400&display=swap" rel="stylesheet">'
)
const govde = art
  .replace(/^[\s\S]*?<head>/, '')
  .replace(/<\/head>\s*<body>/, '')
  .replace(/<\/body>\s*<\/html>\s*$/, '')
  .replace(/<meta charset[^>]*>\s*/, '')
  .replace(/<meta name="viewport"[^>]*>\s*/, '')
fs.writeFileSync('artifact.html', govde.trim() + '\n')

const kb = f => Math.round(fs.statSync(f).size / 1024)
console.log(`dist.html ${kb('dist.html')} KB · artifact.html ${kb('artifact.html')} KB`)
