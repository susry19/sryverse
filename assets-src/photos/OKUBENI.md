# Kaynak konut fotoğrafları

Bu klasör **yayına gitmez** (public/ dışında). Buradaki yüksek çözünürlüklü
PNG'ler yalnızca kaynak dosyalardır.

Siteye giden hâlleri `public/screens/` içinde WebP olarak durur:

    property-fulya-640.webp / -1024.webp / -1600.webp
    property-nisantasi-640.webp / -1024.webp
    property-macka-640.webp / -1024.webp / -1600.webp

## Yeni fotoğraf eklerken

1. Kaynak PNG/JPG'yi bu klasöre koy.
2. Şu komutla WebP türevlerini üret:

```bash
python3 - <<'PY'
from PIL import Image
name = 'property-fulya'          # dosya adı (uzantısız)
im = Image.open(f'assets-src/photos/{name}.png').convert('RGB')
for w in (640, 1024, 1600):
    if w > im.size[0] * 1.05: continue
    h = round(im.size[1] * w / im.size[0])
    im.resize((w, h), Image.LANCZOS).save(f'public/screens/{name}-{w}.webp', 'WEBP', quality=82, method=6)
PY
```

3. Üretilmeyen genişlik varsa `src/EstateMatchPage.jsx` içindeki
   `PHOTO_WIDTHS` listesini güncelle.
