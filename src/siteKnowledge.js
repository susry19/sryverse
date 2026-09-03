/* ══════════════════════════════════════════════════════
   SITE BİLGİ TABANI — SiteAssistant tarafından kullanılır.
   Not: burada yapay zekâ / harici API çağrısı YOK. Sadece anahtar kelime
   eşleşmesiyle bu sabit içerikten yanıt seçilir.
   ══════════════════════════════════════════════════════ */

export const KB = [
  {
    id: 'skillmatch',
    label: 'SkillMatch nasıl çalışır?',
    keywords: ['skillmatch', 'ise alim', 'işe alım', 'cv', 'aday', 'recruitment', 'yetenek'],
    answer: `SkillMatch AI, işe alım süreçlerini yapay zekâ ile hızlandıran ve daha doğru aday kararları alınmasını sağlayan bir platformdur.

Sistem önce aday CV'lerini analiz eder ve tüm bilgileri yapılandırılmış verilere dönüştürür. Daha sonra pozisyon gereksinimlerini inceleyerek adayların deneyim, yetkinlik, eğitim ve becerilerini karşılaştırır.

Eşleştirme motoru her aday için uyum skorları oluşturur, güçlü ve gelişime açık yönleri belirler ve işe alım ekiplerine veri destekli öneriler sunar — nihai karar her zaman işe alım ekibinde kalır.`,
  },
  {
    id: 'estatematch',
    label: 'EstateMatch nedir?',
    keywords: ['estatematch', 'emlak', 'gayrimenkul', 'portfoy', 'portföy', 'mülk', 'mulk', 'ilan'],
    answer: `EstateMatch AI, gayrimenkul firmaları için geliştirilen portföy ve müşteri yönetim platformudur.

Sistem emlak portföylerini analiz eder, müşteri ihtiyaçlarını yorumlar ve en uygun eşleşmeleri gerekçesiyle önerir.

EstateMatch AI; portföy yönetimi, akıllı müşteri eşleştirme, ilan içeriği üretimi, satış/kiralama takibi ve müşteri analizlerini tek platformda birleştirir.`,
  },
  {
    id: 'metraj',
    label: 'Metraj AI ne zaman geliyor?',
    keywords: ['metraj', 'quantity surveying', 'mimari', 'insaat', 'inşaat'],
    answer: `Metraj AI, mimari projelerden otomatik metraj çıkarma üzerine çalıştığımız yeni ürünümüz — şu anda private beta aşamasında.

Erken erişim veya güncellemeler için demo talep formunu doldurabilir ya da WhatsApp'tan bize ulaşabilirsiniz.`,
  },
  {
    id: 'approach',
    label: 'SRYVERSE yaklaşımı',
    keywords: ['yaklasim', 'yaklaşım', 'metodoloji', 'metod', 'nasil calisiyor', 'nasıl çalışıyor', 'süreç', 'surec'],
    answer: `SRYVERSE'in yaklaşımı yalnızca yazılım geliştirmek değildir. Önce iş süreçlerini anlamaya, ölçmeye ve modellemeye odaklanır; sonra yapay zekâ ve otomasyon teknolojileriyle bu süreçleri akıllı hale getiririz.

5 adımlı metodoloji:
  01. Gözlemle — süreci ve darboğazı tespit et
  02. Modelle — veriyi ölçülebilir hale getir
  03. Optimize Et — kritik karar noktalarını belirle
  04. Otomatize — tekrarlayan işleri AI ile otomatikleştir
  05. Ölçeklendir — SaaS ürünü olarak devreye al`,
  },
  {
    id: 'problems',
    label: 'Hangi sorunları çözer?',
    keywords: ['sorun', 'problem', 'ne cozer', 'ne çözer', 'fayda', 'neden'],
    answer: `SRYVERSE ürünleri işletmelerin en yaygın operasyonel problemlerini çözmek için tasarlanmıştır:

  • Manuel ve zaman alan süreçler
  • Dağınık veri kaynakları
  • Yavaş karar alma mekanizmaları
  • Verimsiz işe alım süreçleri
  • Emlak portföy yönetim karmaşası
  • Raporlama ve analiz eksiklikleri
  • Ölçeklenemeyen iş süreçleri

Kısacası: karmaşık operasyonları akıllı sistemlere dönüştürüyoruz.`,
  },
  {
    id: 'pricing',
    label: 'Fiyatlandırma ve demo',
    keywords: ['fiyat', 'ucret', 'ücret', 'demo', 'pilot', 'satin al', 'satın al', 'paket'],
    answer: `Fiyatlandırma ekibinizin büyüklüğüne ve kullanım hacmine göre değişir; bu yüzden genel bir liste yerine önce kısa bir demo/pilot görüşmesi yapıyoruz.

"Demo Talep Et" formunu doldurun ya da WhatsApp'tan yazın — 24 saat içinde dönüş yapıyoruz.`,
  },
  {
    id: 'privacy',
    label: 'Verilerim güvende mi?',
    keywords: ['kvkk', 'veri', 'gizlilik', 'guvenlik', 'güvenlik', 'kisisel', 'kişisel', 'mahremiyet'],
    answer: `Ürünlerimiz kişisel verileri işlerken KVKK'ya duyarlı bir yaklaşım benimser: isim, telefon ve e-posta gibi alanlar yapay zekâ katmanına gönderilmeden önce maskelenir, veriye erişim rol bazlı yetkilendirmeyle sınırlandırılır.

Sözleşme, veri işleme ve saklama süreleri gibi kurumsal detaylar için lütfen bizimle doğrudan iletişime geçin — pilot görüşmesinde bu konuları netleştiriyoruz.`,
  },
  {
    id: 'contact',
    label: 'İletişim',
    keywords: ['iletisim', 'iletişim', 'whatsapp', 'telefon', 'mail', 'e-posta', 'ulasmak', 'ulaşmak'],
    answer: `Bize İletişim bölümündeki formdan ya da doğrudan WhatsApp üzerinden ulaşabilirsiniz: +90 531 517 8170.

Ortalama yanıt süremiz 24 saattir.`,
  },
]

const norm = (s) =>
  (s || '')
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g')
    .replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c')

/** Serbest metni anahtar kelimelerle KB'ye eşler; yapay zekâ kullanmaz. */
export function matchKB(text) {
  const q = norm(text)
  if (!q.trim()) return null
  let best = null, bestScore = 0
  for (const item of KB) {
    let score = 0
    for (const k of item.keywords) if (q.includes(norm(k))) score++
    if (score > bestScore) { bestScore = score; best = item }
  }
  return bestScore > 0 ? best : null
}
