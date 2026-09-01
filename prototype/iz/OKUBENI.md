# İZ · EstateMatch deneyim prototipi

Binlerce ihtimalin içinden bir izin nasıl çıktığını ziyaretçiye anlatan değil,
**yaşatan** tek dünyalı WebGL deneyimi. Üretim sayfasına dokunmaz.

## Çalıştırma
```
node ../../scripts/serve.mjs .        # ya da herhangi bir statik sunucu
# tarayıcıda dist.html
```

## Kaynak ve çıktı
| Dosya | Rol |
|---|---|
| `index.html` | İskelet, sanat yönetimi, tüm metin (tek kaynak) |
| `iz.js` | Motor: alan, iz, ilişkiler, kamera, grad, durgun sürüm |
| `atlas.webp` | Gerçek mülk fotoğraflarından 1024² atlas (kırıklar buradan beslenir) |
| `fonts.css` | Marka yazı tipleri gömülü (yalnızca yerel test çıktısı için) |
| `three.min.js` | r150 UMD, depodan; CDN bağımlılığı yok |
| `build.mjs` | İki çıktı üretir |
| `dist.html` | Bağımsız tam sayfa, sıfır dış bağımlılık |
| `artifact.html` | Artifact iskeleti için sarmalayıcısız gövde |

`node build.mjs` ile iki çıktı da yeniden üretilir. `dist.html` ve
`artifact.html` türetilmiş dosyalardır; elle düzenlenmez.

## Sistem
- **Alan**: cephe, plan glifi, mesafe halkası, sinyal zerresi ve gerçek
  fotoğraf kırığı. Her öğe gerçek bir EstateMatch bilgi kategorisidir.
- **İz**: ziyaretçinin yönlendirdiği niyet ipliği. Halat kısıtıyla çözülür,
  bu yüzden kare hızından ve scroll hızından bağımsız olarak hep aynı
  uzunlukta bir filament kalır. Yakınından geçtiği kanıtları kaydeder.
- **Eşik**: 28 kırık tek bir mülke kilitlenir; gerekçe, ziyaretçinin geçtiği
  kanıtlarla EstateMatch'in bulduğu ama ziyaretçinin hiç geçmediği kanıtlardan
  birlikte kurulur. Karşılanmayanlar gizlenmez.
- **Durgun sürüm**: WebGL yoksa ya da hareket azaltılmışsa aynı sekiz perde,
  aynı metin, SVG figürlerle akışta. Kırık sayfa ya da uyarı yok.
