# SkillMatch · Engineered Serendipity — deneyim önizlemesi

Adres: **`/skillmatch/deneyim`** (eski adlar: `/skillmatch/experience`). Mevcut
`/skillmatch` sayfasına ve ana siteye dokunmaz; kendi yığınında tembel yüklenir,
sitenin başlık/alt bilgi kabuğunu kullanmaz, `noindex` taşır.

Ziyaretçi ürünü okumaz, kullanır: bir sezonun işe alımını kadro açığından
ön görüşme özetine ve rapora kadar kendi kararlarıyla yürütür.

## 1. Envanter: ürünün gerçek yetenekleri → sahne

| Ürün yeteneği (skillmatch-ai) | Sahnede | Tür |
|---|---|---|
| Kadro Planlama satırı, net açık, durum etiketi (`routers/order_taker.py`) | İhtiyaç konsolu | Canlı kural |
| Bütçe içi / dışı sınıflandırma ve kontrol metni (`staffing_approval_service`) | İhtiyaç konsolu | Canlı kural |
| Onay zinciri DM → FC → GM, DM'nin kendi talebi doğrudan İK, gerekçe kodları, red/revizyon notu, SLA 2/3 iş günü (`staffing_needs.py`, `sla_service.py`) | Onay konsolu | Canlı kural |
| Pozisyon açma, QR, kanal (`staffing_needs.open_position`) | İlan konsolu | Canlı kural (QR temsilî) |
| Aday kilidi 10 gün, etkinlikte 7 güne yenileme, 2 gün uyarı, 3 uzatma, süre dolunca ortak havuz, başka otel engeli (`applications.py`, `ownership_service`) | Kilit zaman çizelgesi | Canlı kural |
| 15 rol ailesi, uygunluk kapısı, %50 öneri eşiği, rule-2 skor, kanıt kademesi (`skill_match_service`, `match_criteria_service`, `match_score_service`) | Açılış alanı + eşleşme ağı | **Ürün kodu** (önceden hesaplanmış sinyal) |
| Eşleşme kriter ağırlıkları (Pozisyon > Eşleşme kriterleri) | Ağırlık kaydırıcıları | Canlı kural |
| AI Ön Görüşme soru motoru, çıkarım, aday soruları, özet (`services/voice_screening/`) | Ön görüşme | **Ürün kodu** (tarayıcıda Pyodide) |
| VAD, konuşma sonu, araya girme parametreleri (`static/voice-screening.js`) | Ön görüşme ses katmanı | Port (aynı sabitler) |
| Rapor Oluşturucu: veri alanı, boyut, ölçü, hesaplama, grafik türleri, drill-down, sonuç kartları, huni (`report_builder_service`, `report_dashboards`) | Rapor tuvali | Canlı kural, sentetik veri |
| AI asistan niyet tablosu, sistem rehberi, mevzuat notları, onay kartı (`services/ai_agent/`, `system_guide`, `legal_guide`) | Asistan | Ürün tabloları + port |
| Doğal dille aday araması, korunan nitelik kuralı (`talent_search_service`) | AI arama | Ürün tabloları + port (birebir doğrulandı) |

Bilinçli olarak sahnede olmayanlar (prototip kapsamı dışı): Extra Personel,
Değerlendirme Testleri, Karar Merkezi mülakat akışı, Teklif onayı, İşe giriş
belgeleri, Telefon kanalı (üründe de yalnız tasarım).

## 2. Hikâye ve sahne mimarisi

Tek iplik: **Belek Premium'da sezon öncesi iki garson eksik.** Her sahne bir
öncekinin sonucuyla açılır; `lib/journey.js` seçilen pozisyonu ve adayı
sahneler arasında taşır (eşleşmede seçilen aday ön görüşmenin adayıdır).

0. **Açılış** — ürünün giriş ekranındaki marka şeridi (“Değer, keşfedilmeyi
   bekler.”) kaydırmayla çözülür. Şeridin merkez çizgisinden doğan parçacıklar
   eşleştirme mantığını sırayla anlatır: havuz → 15 rol ailesi → kapı → gerçek
   skorlarıyla adlı adaylar ve %50 eşik çemberi. Süs değil; eşleştirmenin şeması.
1. **İhtiyaç · Onay · İlan ve kilit** — yapışkan konsol, üç bölüm. Ziyaretçi
   talebi kimin açtığını ve kaç kişi istendiğini değiştirir; sınıflandırma, onay
   yolu, SLA ve kilit kuralları sonucu değiştirir.
2. **Eşleşme** — yaşayan ağ: merkezde ilan, iç halkada zorunlu yetkinlikler,
   adaylar skorlarıyla orantılı uzaklıkta; kenarlar kanıt kademesi. Ağırlık
   değişince ağ yeniden kurulur. “Adaya göre” görünümü tersini gösterir.
3. **Ön görüşme** — ziyaretçi adaydır; sesli ya da yazılı.
4. **Rapor ve asistan** — rapor tuvali, asistan ve AI arama aynı sentetik sezonu
   okur; asistanın cevapları “Raporda aç” ile tuvali yönlendirir.

Süreç rayı (sağda; dar ekranda altta ilerleme çubuğu) ziyaretçinin akışta
nerede olduğunu gösterir.

## 3. Gerçek olan / simüle olan

* **Ön görüşme soru akışı gerçektir.** `voice/engine/*.py` SkillMatch'teki
  `engine.py`, `extraction.py`, `qa.py`, `seed.py` dosyalarının birebir kopyasıdır
  (`SOURCE.json`: commit + özet). Tarayıcıda Pyodide (Web Worker) içinde
  çalışır; `voice/runtime.py` yalnız `service.py`'nin veritabanına dokunmayan
  orkestrasyonunu taklit eder. LLM çağrılmaz: üründe anahtar yokken geçerli olan
  kural katmanıdır.
* **Ses tanıma ve asistan sesi bu demoda tarayıcınındır** (Web Speech API).
  Üründe yazıya dökme ve ses SkillMatch sunucusunda (Gemini) üretilir. Bu fark
  izin ekranında açıkça yazılır. Türkçe ses yoksa ürünle aynı kural: altyazı.
  Konuşma tanıma yoksa ya da servise ulaşılamazsa görüşme yazılı sürer.
* **Eşleşme sinyalleri gerçektir.** `scripts/skillmatch-x/precompute_matches.py`
  SkillMatch'in kendi fonksiyonlarını sentetik adaylar üzerinde çalıştırır;
  tarayıcı yalnız ağırlıklı ortalamayı uygular. `verify-scores.mjs` varsayılan
  ağırlıkta 160 çiftin hepsinde ürünün skorunu birebir verdiğini doğrular.
* **Asistan ve AI arama:** niyet tablosu, rehber, mevzuat notları ve arama
  sözlükleri üründen dışa aktarılır (`export_assistant_data.py`); eşleştirme
  fonksiyonları JS'e taşındı ve `verify-assistant.mjs` Python sonucuyla
  karşılaştırır (21 sorgu × 20 aday, fark 0). Kart içerikleri sentetik veriden.
* **Rapor verisi sentetiktir** ama rastgele değildir: sabit tohumla bir kez
  üretilir; her seçim aynı kayıtları yeniden toplar.
* **Operasyon konsolu** kuralları `lib/ops.js`'te kaynak referanslarıyla yazılı;
  sunucu yok.

## 4. Veri ve gizlilik

* Kişisel veri yok: adaylar uydurma (ad + soyadın baş harfi), CV yok, kayıt yok.
* Otel adları **anonimleştirildi** (Belek Premium, Tekirova Premium, Bodrum
  Premium, Göcek Suites, Downtown Antalya, Beldibi Resort): ürünün çalıştığı
  coğrafya ve tesis yapısı korunur, müşteri markası yayınlanmaz. Müşteri izni
  alınırsa adlar tek yerde değişir: `scripts/skillmatch-x/dataset.py` ve
  `lib/reports.js` `HOTELS` → `npm run skillmatch-x:sync`.
* Ön görüşme demosu hiçbir SRYVERSE/SkillMatch sunucusuna istek atmaz. Ses
  kaydı yok. Tarayıcı konuşma tanıması (Chrome/Edge) sesi kendi servisine
  gönderir — izin ekranında yazılı.

## 5. Kötüye kullanım ve kota

Herkese açık uçta sunucu tarafı AI çağrısı yok; maliyet ve istem enjeksiyonu
yüzeyi yok. Yine de: görüşme en çok 8 dakika (süre dolunca ürünün “ara ver”
metniyle biter), tarayıcı başına günde 5 görüşme (`localStorage`, yumuşak
sınır), aday sorusu en çok 10 (motorun kendi sınırı), girişler 300–400 karakter.
**Canlı sunucu sesine bağlanılırsa** (bkz. §8) IP + oturum başına sunucu
tarafı hız sınırı, kısa ömürlü demo jetonu ve günlük bütçe zorunludur.

## 6. Teknik mimari

| Amaç | Seçim | Neden |
|---|---|---|
| Kaydırma anlatısı | CSS `sticky` + tek rAF kaydırma sürücüsü (`lib/scroll.js`) | GSAP/ScrollTrigger gerekmedi; geri kaydırma aynı kareyi üretir |
| Marka şeridi | Ürünün `login-scene.js` WebGL kodu (`world/ribbon.js`) | Aynı geometri, rampa, ışık; yeni 3B kütüphane yok |
| Parçacık alanı | Canvas 2D (`world/field.js`) | Three.js gereksiz; mobilde 260, masaüstünde 620 parçacık |
| Eşleşme ağı | SVG + `d3-force` (~15 kB) | Çarpışma/yerleşim; kaydırıcıyla akıcı yeniden kurulum |
| Grafikler | El yapımı SVG + dizi ara değerleme (`ui/Chart.jsx`) | Ürünle aynı ilke: grafik kütüphanesi yok |
| Ön görüşme | Pyodide 0.27 (Worker, `/pyodide/` kendi alanımızdan) | Ürünün Python motoru değiştirilmeden; yalnız “başlat”ta iner (~3 MB sıkıştırılmış) |
| Ses | Web Audio (VAD, dalga formu) + Web Speech (STT/TTS) | Ek bağımlılık yok |

Ana site paketi değişmedi (+1,6 kB yönlendirme). Deneyim yığını ~42 kB gzip,
rapor/asistan ~30 kB, ön görüşme arayüzü ~11 kB + işçi; Pyodide yalnız demo
başlatılınca.

## 7. Mobil ve erişilebilirlik

* Mobilde canlı WebGL şerit yerine sabit görsel (ürünle aynı kural), daha az
  parçacık, DPR ≤ 2; konsol bölümleri satır içi, eşleşme listesi yatay kaydırılır.
* `prefers-reduced-motion`: yapışkan açılış kapanır, adımlar akışta; parçacık
  alanı son karesini durağan çizer; kelime animasyonları kapalı.
* Kinetik metin ekran okuyucuya bütün olarak verilir; düğümler klavyeyle
  seçilebilir (`role=button`, Enter/Boşluk); durumlar `aria-live` ile duyurulur.
* Ön görüşmenin her işlevi yazarak da kullanılabilir.

## 8. Sonraki adımlar (önerilen)

1. Ürün ekran görüntüleri (sentetik veriyle yerel kurulumdan) sahne
   açılışlarına katmanlı perspektif kompozisyon olarak yerleşir.
2. Canlı ses (isteğe bağlı): SkillMatch'e **yalnız demo** için ayrı, kayıt
   yazmayan bir uç (`templates/{id}/sandbox` mantığı, kimliksiz, kotalı) eklenirse
   ses tanıma ve asistan sesi ürününkine geçer. Bu bir backend değişikliğidir;
   bu çalışmada yapılmadı.
3. Gerçek otel adları için müşteri onayı.

## 9. Bakım

```
npm run skillmatch-x:sync     # motor kopyası + eşleşme sinyalleri + asistan tabloları (../skillmatch-ai)
npm run skillmatch-x:verify   # skor, ön görüşme motoru ve asistan paritesi
```
`precompute_matches.py` SkillMatch'in bağımlılıklarını (SQLAlchemy) ister:
`PYTHON=../skillmatch-ai/venv/bin/python npm run skillmatch-x:sync`.
