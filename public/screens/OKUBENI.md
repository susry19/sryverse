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

| Dosya | Ekran |
|---|---|
| `skill-dashboard.png` | Genel Bakış — aktif pozisyonlar, günün programı, AI asistan |
| `skill-workforce.png` | Kadro İhtiyaçları — FTE açığı, bütçe, aksiyon planı |
| `skill-wizard.png` | Pozisyon Açma — 6 adımlı akış |
| `skill-positions.png` | Pozisyon Yönetimi — açık kadrolar ve pipeline |
| `skill-pool.png` | Aday Havuzu — yetkinlikler ve AI uyum oranı |
| `skill-profile.png` | Aday Profili — özet, yetkinlik haritası, AI mesaj taslakları |

Sıra ve açıklamalar `src/SkillMatchPage.jsx` içindeki `SCREENS` dizisinde.

## ⚠️ Bu görsellerde gerçek kişisel veri var

`skill-pool.png` ve `skill-profile.png` içinde **gerçek görünen aday
isimleri, e-posta adresleri ve telefon numaraları** bulunuyor:

- Aday havuzunda tam ad + gmail adresleri (10+ kişi)
- Aday profilinde ad, e-posta ve cep telefonu birlikte

Bu sayfa yayına gidecek. Yayın öncesi bu iki görseli demo veriyle
yeniden alman ya da kişisel alanları bulanıklaştırman gerekiyor —
istersen bulanıklaştırmayı ben yapabilirim.

Diğer dört ekranda kişisel veri görünmüyor.

## Optimizasyon

1600px genişlik, 200 renkli palet: 1.37 MB → 667 KB.
