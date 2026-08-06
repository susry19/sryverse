# Ekran Görüntüleri

EstateMatch detay sayfasındaki "Ürün turu" bölümü bu klasördeki görselleri kullanır.

## Mevcut dosyalar

| Dosya | Ekran |
|---|---|
| `dashboard.png` | Panel — metrikler, aktivite trendi, AI öngörüleri |
| `portfolio.png` | Portföy — ilan kartları, AI skorları |
| `import.png` | İlan aktarımı — Sahibinden / Hürriyet Emlak / Emlakjet |
| `listing.png` | İlan detayı — nitelikler + eşleşen müşteriler |
| `match.png` | Müşteri detayı — dönüşüm, risk, AI eşleşme skoru |
| `pipeline.png` | İş akışı — Kanban satış hunisi |
| `calendar.png` | Takvim — randevular ve takip araması |
| `generator.png` | İlan üreteci — AI ile çoklu mecra içeriği |
| `reports.png` | Raporlar — ciro, huni, danışman performansı |

Sıra ve açıklamalar `src/EstateMatchPage.jsx` içindeki `SCREENS` dizisinde tanımlı.

## Görselleri değiştirmek

Aynı dosya adıyla üzerine yaz, sayfayı yenile. Dosya adları birebir eşleşmeli.

Yeni ekran eklemek için `SCREENS` dizisine bir satır ekle ve görseli
`<key>.png` adıyla bu klasöre koy.

## Optimizasyon

Görseller 1600px genişliğe ölçeklenip 200 renkli palete indirildi
(3.2 MB → 939 KB). Yeni görsel eklerken benzer bir optimizasyon iyi olur;
istersen bunu ben yapabilirim.

## Gizlilik notu

Bu görseller yayına gidiyor. Yeni görsel eklerken gerçek müşteri
isim/telefon/e-postalarının demo veri olduğundan emin ol.

Mevcut görsellerde "Demo Gayrimenkul" hesabı kullanılmış; yine de
`match.png` ve `pipeline.png` içinde görünen telefon numaralarını
kontrol etmende fayda var.

## Dosya yoksa ne oluyor?

Sayfa kırılmaz — o sekmede animasyonlu bir yer tutucu görünür.

---

# SkillMatch AI ekranları

SkillMatch detay sayfası için **henüz görsel yok**. Aşağıdaki dosyaları
bu klasöre koyunca tur bölümü otomatik canlanır.

| Dosya | Ekran |
|---|---|
| `skill-dashboard.png` | Panel — açık pozisyonlar, işe alım hunisi |
| `skill-positions.png` | Pozisyonlar listesi |
| `skill-pool.png` | Aday havuzu |
| `skill-cv.png` | CV analizi / ayrıştırma |
| `skill-match.png` | AI eşleştirme — uyum puanı ve gerekçe |
| `skill-pipeline.png` | İşe alım akışı (Kanban) |
| `skill-interview.png` | Mülakat & takvim |
| `skill-reports.png` | Raporlar |

Sıra ve açıklamalar `src/SkillMatchPage.jsx` içindeki `SCREENS` dizisinde.

**Önemli:** İçerik gerçek panele göre tahmin edilerek yazıldı. Görselleri
ekledikten sonra modül adlarını ve açıklamaları gerçeğe göre düzeltmemi
söylemen yeterli.

Aday isim/telefon/e-postalarının demo veri olduğundan emin ol.
