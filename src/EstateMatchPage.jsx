import { useState, useEffect, useCallback } from 'react'
import { Rev, ScreenTour, Faq, RoiCalc } from './pageParts.jsx'
import './ProductPage.css'
import './EstateCaseStudy.css'

/* ── Impact: öne çıkan 3 sonuç ── */
const IMPACT_STATS = [
  { tag: 'AI Eşleştirme', tagBg: '#e8f4ee', tagFg: '#0F5132', v: '%87', p: 'Güvenilir mülk–alıcı eşleşmeleri, gerekçesiyle satır satır puanlanır.', lit: 35 },
  { tag: 'İçerik AI', tagBg: '#fef3c7', tagFg: '#92400e', v: '5×', p: 'Tek bir ilan, saniyeler içinde beş hazır paylaşım formatına dönüşür.', lit: 20 },
  { tag: 'İş Akışı', tagBg: '#eff6ff', tagFg: '#1d4ed8', v: '6', p: 'Her fırsat aşamalandırılır, değerlenir ve kapanışa kadar izlenir.', lit: 24 },
]

/* ── Impact: eşleştirme akışı (asamalı, kaydırılmış çubuklar) ── */
const FLOW_LABELS = ['Kriter Toplama', 'AI Skorlama', 'Aday Sıralama', 'Danışman Onayı', 'Müşteri Eşleşmesi']
const FLOW_BARS = [
  { l: 'Alıcı tercihleri', left: '0%', top: 14, w: '37%', bg: '#0F5132' },
  { l: 'Veto → çarpan → taban → bonus', left: '16%', top: 62, w: '44%', bg: '#3f8f68' },
  { l: 'İlk 5, sıralı', left: '38%', top: 110, w: '34%', bg: '#a9d3bd', fg: '#12261d' },
  { l: 'Açıkla ve gönder', left: '64%', top: 14, w: '20%', bg: '#0F5132' },
  { l: 'Onaylandı', left: '80%', top: 62, w: '20%', bg: '#3f8f68' },
]

/* ── Bugünün önceliği: eşleşme kuyruğu ── */
const QUEUE = [
  { name: 'Müşteri #482', detail: '3+1 · Beşiktaş · ₺15M bütçe — 2 gündür yanıt bekliyor', score: '%91' },
  { name: 'Müşteri #317', detail: 'Yatırımlık daire · Kadıköy · ₺6-8M bütçe', score: '%84' },
  { name: 'Müşteri #205', detail: 'Villa · Sarıyer · Deniz manzaralı, havuzlu', score: '%79' },
  { name: 'Müşteri #143', detail: '2+1 · Merkeze yakın · Kiralık', score: '%73' },
]

/* ── Öncesi / sonrası karşılaştırma ── */
const COMPARE = [
  { label: 'Eşleştirme süresi', before: 'Elle arama, saatler sürer', after: 'AI önerisi, saniyeler içinde' },
  { label: 'Takip önceliği', before: 'Kimin aranacağı tahminle belirlenir', after: 'Otomatik sıralı öncelik listesi' },
  { label: 'İlan paylaşım içeriği', before: 'Her platform için elle yazılır', after: '5 formatta otomatik üretim' },
  { label: 'Karar gerekçesi', before: 'Sezgiyle, kayıt altına alınmaz', after: 'Puanlanmış, açıklanabilir gerekçe' },
  { label: 'Yönetici görünürlüğü', before: 'Haftalık elle hazırlanan rapor', after: 'Gerçek zamanlı panel' },
]

/* ── Güvenlik ve şeffaflık ── */
const TRUST = [
  { h: 'Veri izolasyonu', p: 'Her acentenin verisi birbirinden tamamen izole tutulur.',
    ic: <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" /> },
  { h: 'Kişisel veri maskeleme', p: "İsim, telefon ve e-posta, AI'ye gönderilmeden önce maskelenir.",
    ic: <><path d="M3 12c2-4 6-6 9-6s7 2 9 6c-2 4-6 6-9 6s-7-2-9-6z" /><circle cx="12" cy="12" r="2.4" /><path d="M4 4l16 16" /></> },
  { h: 'Rol bazlı yetkilendirme', p: 'Kimin neyi göreceğini yönetici belirler.',
    ic: <><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></> },
  { h: 'Açıklanabilir öneriler', p: 'AI karar vermez; gerekçeli önerir. Onay her zaman danışmanda kalır.',
    ic: <><path d="M4 5h16v10H9l-5 4V5z" /><path d="M8 9h8M8 12h5" /></> },
]
const ARCH = ['Veri toplama\n(maskelenmiş)', 'Kural bazlı\nön eleme', 'AI\nskorlama', 'Danışman\nincelemesi', 'Onaylı\neşleşme']

/* ── Ekran turu ── */
const SCREENS = [
  { key: 'dashboard', n: '01', t: 'Panel',          d: 'Aktif portföy, sıcak müşteri, dönüşüm oranı ve AI öngörüleri tek ekranda.', icon: '◱' },
  { key: 'portfolio', n: '02', t: 'Portföy',        d: 'Görsel ilan kartları, işlem türü, danışman ve AI uyum skoru aynı görünümde.', icon: '⌂' },
  { key: 'import',    n: '03', t: 'İlan Aktarımı',  d: 'Sahibinden, Hürriyet Emlak ve Emlakjet ilanlarını URL ile içe aktarın.', icon: '⇱' },
  { key: 'listing',   n: '04', t: 'İlan Detayı',    d: 'Tüm nitelikler ve o ilana uyan müşteriler skorlarıyla birlikte.', icon: '▤' },
  { key: 'match',     n: '05', t: 'AI Eşleştirme',  d: 'Dönüşüm olasılığı, risk skoru ve uyum puanı gerekçesiyle sunulur.', icon: '✦' },
  { key: 'pipeline',  n: '06', t: 'İş Akışı',       d: 'Talepten kapanışa kadar her fırsat sürükle-bırak Kanban üzerinde.', icon: '⇉' },
  { key: 'calendar',  n: '07', t: 'Takvim & Takip', d: 'Randevular, gösterimler ve AI önerili takip aramaları.', icon: '◷' },
  { key: 'generator', n: '08', t: 'İlan Üreteci',   d: 'Portföyden seçin, AI ile Sahibinden / Instagram / WhatsApp metni üretin.', icon: '✎' },
  { key: 'reports',   n: '09', t: 'Raporlar',       d: 'Ciro, satış hunisi, dönüşüm ve danışman performansı.', icon: '◲' },
].map(s => ({ ...s, src: `/screens/${s.key}.png` }))


/* ── Fiyat paketleri ── */
const PLANS = [
  {
    n: 'Starter', h: 'Küçük ekipler',
    p: 'Temel operasyonu tek merkeze taşımak isteyen butik acenteler için.',
    ul: ['10 kullanıcı', '500 ilan', 'Sınırsız AI eşleştirme', 'Tüm temel modüller'],
    cta: 'Demo planla',
  },
  {
    n: 'Professional', h: 'Büyüyen acenteler',
    p: 'Portföyü ve danışman ekibi hızla büyüyen emlak şirketleri için.',
    ul: ['25 kullanıcı', '2.500 ilan', 'Sınırsız AI eşleştirme', 'Gelişmiş raporlar ve yönetim'],
    cta: 'Demo talep et',
  },
  {
    n: 'Enterprise', h: 'Kurumsal yapı',
    p: 'Çok şubeli, özel entegrasyon ve yüksek ölçek ihtiyacı olan kurumlar için.',
    ul: ['Esnek kullanıcı', 'Esnek portföy limiti', 'Özel entegrasyonlar', 'Kuruma özel çözümler'],
    cta: 'Görüşelim',
  },
]

/* ── ROI ── */
const ROI_FIELDS = [
  { key: 'consultants', label: 'Danışman sayısı',                min: 1,   max: 80,   step: 1 },
  { key: 'leads',       label: 'Danışman başına aylık talep',    min: 5,   max: 150,  step: 1 },
  { key: 'minutes',     label: 'Eşleştirme süresi',              min: 10,  max: 240,  step: 5, unit: ' dk' },
  { key: 'hourly',      label: 'Danışmanın saatlik değeri',      min: 100, max: 2000, step: 50, prefix: '₺' },
]

function computeRoi({ consultants, leads, minutes, hourly }) {
  const hours = Math.round((consultants * leads * minutes) / 60)
  const monthly = hours * hourly
  return { hours, monthly, yearly: monthly * 12, days: Math.round(hours / 8) }
}

/* ── SSS ── */
const FAQS = [
  { q: 'Mevcut portföyümüzü sisteme nasıl aktarırız?',
    a: 'Excel ve CSV dosyalarınızı doğrudan içe aktarabilirsiniz. Pilot sürecinde portföy aktarımını birlikte yapıyor, alan eşleştirmesini sizin veri yapınıza göre ayarlıyoruz.' },
  { q: 'Müşteri verilerimiz güvende mi?',
    a: 'Her acentenin verisi birbirinden izole tutulur. İsim, telefon ve e-posta gibi kişisel bilgiler yapay zekâya gönderilmeden önce maskelenir. Rol bazlı yetkilendirme ile kimin neyi göreceğini yönetici belirler.' },
  { q: 'Yapay zekâ yanlış eşleştirme yaparsa ne olur?',
    a: 'Karar her zaman danışmanda kalır. Sistem önerir ve gerekçesini açıklar; danışman düzenler ve onaylar. Ayrıca şehir, mülk tipi ve bütçe gibi kritik uyumsuzluklar AI devreye girmeden önce elenir.' },
  { q: 'Ekibimizin teknik bilgisi yok, kullanabilir miyiz?',
    a: 'Evet. Arayüz danışmanın günlük iş akışına göre tasarlandı; teknik terim yerine emlak diliyle çalışır. Kurulum sonrası ekibinize eğitim veriyoruz.' },
  { q: 'Pilot süreç nasıl işliyor?',
    a: 'Önce operasyonunuzu birlikte inceliyoruz, ardından sınırlı bir ekiple pilot başlatıyoruz. Pilot süresince portföy aktarımı, eğitim ve süreç uyarlaması bizim tarafımızdan yürütülür.' },
  { q: 'AI kullanımı maliyeti nasıl kontrol ediliyor?',
    a: 'Fiyatlandırma kullanıcı ve portföy büyüklüğüne göredir; AI eşleştirme kullanım limitiyle sınırlanmaz. Ön eleme ve önbellekleme sayesinde sistem her sorguda yeniden hesaplama yapmaz, maliyeti öngörülebilir tutar.' },
]

/* ══════════════ SAYFA ══════════════ */
export default function EstateMatchPage({ goBack, onDemo }) {
  const [openFaq, setOpenFaq] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => { window.scrollTo(0, 0) }, [])

  useEffect(() => {
    let raf = 0
    const measure = () => {
      raf = 0
      const h = document.documentElement.scrollHeight - window.innerHeight
      setProgress(h > 0 ? Math.min(100, (window.scrollY / h) * 100) : 0)
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure) }
    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const demo = useCallback(() => {
    if (onDemo) onDemo()
    else goBack?.()
  }, [onDemo, goBack])

  return (
    <main className="epage epage--estate">
      <div className="epage__progress" style={{ width: `${progress}%` }} />

      {/* ── HERO (açık tema, vaka çalışması dili) ── */}
      <section className="ecs">
        <div className="ecs-hero">
          <button className="ecs-hero__back" onClick={goBack}>← Ana sayfaya dön</button>
          <div className="ecs-hero__brand">
            <svg width="28" height="28" viewBox="0 0 30 30" fill="none">
              <circle cx="15" cy="15" r="14" fill="#0F5132" />
              <circle cx="19" cy="11" r="4.2" fill="#eafff2" />
            </svg>
            <span>EstateMatch AI</span>
          </div>

          <div className="ecs-hero__mid">
            <h1 className="ecs-hero__h1">Bugün hangi müşteriyi arayacağınızı, <em style={{ fontStyle: 'normal', color: 'var(--cs-brand)' }}>AI söylesin.</em></h1>
            <p className="ecs-hero__sub">EstateMatch AI, portföyünüzü ve müşteri taleplerinizi karşılaştırır; en yüksek ihtimalli eşleşmeleri gerekçesiyle sıralar. Danışman onaylamadan hiçbir eşleşme müşteriye gitmez.</p>
            <div className="ecs-hero__ctas">
              <a className="ecs-btn ecs-btn--solid" href="https://estate.sryverse.com" target="_blank" rel="noopener noreferrer">
                Canlı ürünü keşfet <span>→</span>
              </a>
              <button className="ecs-btn ecs-btn--ghost" onClick={demo}>Demo planla <span>→</span></button>
            </div>
          </div>

          <div className="ecs-hero__stage ecs-hero__stage--panel">
            <div className="ecs-panel">
              <div className="ecs-panel__bar">
                <span className="ecs-panel__dot" /><span className="ecs-panel__dot" /><span className="ecs-panel__dot" />
                <span className="ecs-panel__url">estate.sryverse.com</span>
              </div>
              <div className="ecs-panel__screen">
                <img src="/screens/wide-dashboard.png" alt="EstateMatch AI panel — masaüstü görünümü" />
              </div>
            </div>
            <div className="ecs-float ecs-float--a">
              <span className="ecs-float__eye">Müşteri talebi</span>
              <strong>3+1 · Beşiktaş · ₺15M bütçe</strong>
            </div>
            <div className="ecs-float ecs-float--b">
              <span className="ecs-float__eye">AI uyum skoru</span>
              <strong className="ecs-float__gold">%91</strong>
            </div>
            <div className="ecs-float ecs-float--c">
              <span className="ecs-float__eye">Önerilen aksiyon</span>
              <strong>Bugün ara — Müşteri #482</strong>
            </div>
            <div className="ecs-hero__fade" />
          </div>
        </div>
      </section>

      {/* ── POSTER — marka duruşu ── */}
      <section className="ecs-poster">
        <div className="ecs-poster__word" aria-hidden="true"><span>ESTATEMATCH</span></div>
        <span className="ecs-poster__eye">EstateMatch AI — <b>AI Destekli Emlak CRM</b></span>
        <div className="ecs-laptop">
          <div className="ecs-laptop__lid">
            <div className="ecs-laptop__screen">
              <img src="/screens/wide-dashboard.png" alt="EstateMatch AI panel — geniş ekran görünümü" />
            </div>
          </div>
          <div className="ecs-laptop__base" />
          <div className="ecs-laptop__foot" />
        </div>
      </section>

      {/* ── CANLI ÖRNEK — AI eşleştirme gerekçesi ── */}
      <section className="ecs ecs-live">
        <div className="wrap">
          <Rev>
            <span className="ecs__eye" style={{ color: 'var(--sage)' }}>Örnek eşleştirme</span>
            <h2 className="ecs__h2" style={{ color: '#fff' }}>AI, bir eşleşmeye <em style={{ fontStyle: 'normal', color: 'var(--sage)' }}>nasıl karar veriyor?</em></h2>
            <p className="ecs__p" style={{ color: 'rgba(255,255,255,.65)' }}>Gerçek bir müşteri talebi üzerinden, EstateMatch AI'nin adım adım gerekçelendirmesi.</p>
          </Rev>
          <Rev delay={100}>
            <div className="ecs-live__grid">
              <div className="ecs-live__req">
                <span className="ecs-live__tag">Müşteri talebi</span>
                <p>"Lara'da deniz manzaralı, 3+1, bütçe 12-15M, kapalı otopark şart."</p>
              </div>
              <div className="ecs-live__match">
                <div className="ecs-live__matchhead">
                  <span>Aday ilan: Lara Deniz Manzaralı Rezidans</span>
                  <span className="ecs-live__score">%91</span>
                </div>
                <ul className="ecs-live__reasons">
                  <li><span>Konum</span><b>+38</b><em>Lara, deniz manzarası kriteriyle birebir uyumlu</em></li>
                  <li><span>Bütçe</span><b>+27</b><em>₺13,4M — aralığın ortasında</em></li>
                  <li><span>Oda sayısı</span><b>+18</b><em>3+1, tam eşleşme</em></li>
                  <li><span>Otopark</span><b>+8</b><em>Kapalı otopark mevcut</em></li>
                </ul>
                <div className="ecs-live__actions">
                  <button className="ecs-btn ecs-btn--solid">Danışmana gönder <span>→</span></button>
                  <button className="ecs-btn ecs-btn--ghost-dark">Müşteriyle paylaş <span>→</span></button>
                  <button className="ecs-btn ecs-btn--ghost-dark">Alternatif öner <span>→</span></button>
                </div>
              </div>
            </div>
          </Rev>
        </div>
      </section>

      {/* ── BUGÜNÜN ÖNCELİĞİ — takip kuyruğu ── */}
      <section className="ecs">
        <div className="wrap ecs-queue">
          <Rev>
            <span className="ecs__eye">Bugünün önceliği</span>
            <h2 className="ecs__h2">Danışmanın günü, <em>otomatik sıralanır.</em></h2>
            <p className="ecs__p">EstateMatch AI, en yüksek dönüşüm ihtimaline sahip görüşmeleri her sabah üst sıraya taşır. Karar her zaman danışmanda kalır.</p>
          </Rev>
          <Rev delay={100}>
            <div className="ecs-queue__list">
              {QUEUE.map((q, i) => (
                <div className="ecs-qrow" key={q.name}>
                  <span className="ecs-qrow__rank">{i + 1}</span>
                  <div className="ecs-qrow__body">
                    <strong>{q.name}</strong>
                    <span>{q.detail}</span>
                  </div>
                  <span className="ecs-qrow__score" style={{ color: i === 0 ? 'var(--gold)' : 'var(--green)' }}>{q.score}</span>
                  <button className="ecs-qrow__cta">Bugün ara <span>→</span></button>
                </div>
              ))}
            </div>
          </Rev>
        </div>
      </section>

      {/* ── EKRAN TURU ── */}
      <section className="esec esec--tint">
        <div className="wrap">
          <Rev>
            <div className="esec__head">
              <span className="eeye">Ürün turu</span>
              <h2 className="eh2">Danışmanın bütün günü, <em>tek akışta.</em></h2>
              <p className="ep">
                Her modül ayrı bir araç değil; müşteri kazanımını hızlandıran aynı sistemin parçası.
              </p>
            </div>
          </Rev>
          <Rev delay={100}>
            <ScreenTour
              screens={SCREENS}
              domain="estate.sryverse.com"
              product="EstateMatch AI"
            />
          </Rev>
        </div>
      </section>

      {/* ── IMPACT — sonuç ve akış ── */}
      <section className="ecs">
        <div className="wrap ecs-impact">
          <Rev>
            <span className="ecs__eye">Etki</span>
            <h2 className="ecs__h2">Emlak ekiplerinin gerçekten <em>nasıl çalıştığına göre kuruldu.</em></h2>
          </Rev>

          <div className="ecs-impact__stats">
            {IMPACT_STATS.map((s, i) => (
              <Rev key={s.tag} delay={i * 90}>
                <div className="ecs-stat">
                  <span className="ecs-stat__tag" style={{ background: s.tagBg, color: s.tagFg }}>{s.tag}</span>
                  <p className="ecs-stat__p">{s.p}</p>
                  <div className="ecs-stat__v">{s.v}</div>
                  <div className="ecs-dots">
                    {Array.from({ length: 40 }, (_, j) => (
                      <i key={j} style={{ background: j < s.lit ? s.tagFg : undefined }} />
                    ))}
                  </div>
                </div>
              </Rev>
            ))}
          </div>

          <Rev delay={120}>
            <div className="ecs-flow">
              <h3 className="ecs-flow__h">EstateMatch doğru eşleşmeyi nasıl buluyor.</h3>
              <div className="ecs-flow__labels">
                {FLOW_LABELS.map(l => <span key={l}>{l}</span>)}
              </div>
              <div className="ecs-flow__bars">
                {FLOW_BARS.map((b, i) => (
                  <div key={i} className="ecs-flow__bar" style={{ left: b.left, top: b.top, width: b.w, background: b.bg, color: b.fg || '#fff' }}>
                    {b.l}
                  </div>
                ))}
              </div>
            </div>
          </Rev>
        </div>
      </section>

      {/* ── GRID — eşleşme özeti + portföy ── */}
      <section className="ecs ecs-grid">
        <div className="wrap">
          <Rev>
            <span className="ecs__eye">Uygulamadan</span>
            <h2 className="ecs__h2">Her eşleşmenin arkasında <em>okunabilir bir gerekçe var.</em></h2>
          </Rev>

          <Rev delay={100}>
            <div className="ecs-grid__row">
              <div className="ecs-grid__phone">
                <div className="ecs-grid__phone-screen">
                  <img src="/screens/match.png" alt="Müşteri eşleştirme ekranı" />
                </div>
              </div>

              <div className="ecs-summary">
                <div className="ecs-summary__h">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F5132" strokeWidth="1.8"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M8 4v2M16 4v2" /></svg>
                  Eşleşme özeti
                </div>
                <div className="ecs-summary__grid">
                  <div><div className="ecs-summary__v">17</div><div className="ecs-summary__l">Aktif ilan</div></div>
                  <div><div className="ecs-summary__v">₺156M</div><div className="ecs-summary__l">Portföy değeri</div></div>
                </div>
                <div>
                  <div className="ecs-summary__v">%87</div>
                  <div className="ecs-summary__l">Bu haftanın en yüksek AI uyum skoru</div>
                </div>
                <div className="ecs-summary__warn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}><path d="M12 9v4M12 17h.01M10.3 3.9L2.7 18a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></svg>
                  <span>Bir aday ilan, alıcıya gönderilmeden önce danışman incelemesi bekliyor.</span>
                </div>
              </div>
            </div>
          </Rev>

          <Rev delay={160}>
            <div className="ecs-grid__wide">
              <img src="/screens/wide-portfolio.png" alt="Portföy kartları" />
            </div>
          </Rev>
        </div>
      </section>

      {/* ── YÖNETİCİ GÖRÜNÜMÜ ── */}
      <section className="ecs">
        <div className="wrap ecs-mgr">
          <Rev>
            <div className="ecs-mgr__grid">
              <div className="ecs-mgr__visual">
                <div className="ecs-panel">
                  <div className="ecs-panel__bar">
                    <span className="ecs-panel__dot" /><span className="ecs-panel__dot" /><span className="ecs-panel__dot" />
                    <span className="ecs-panel__url">estate.sryverse.com/raporlar</span>
                  </div>
                  <div className="ecs-panel__screen">
                    <img src="/screens/wide-reports.png" alt="Yönetici raporlar ekranı" />
                  </div>
                </div>
              </div>
              <div className="ecs-mgr__text">
                <span className="ecs__eye">Yöneticiler için</span>
                <h2 className="ecs__h2">Sahadaki her danışmanın performansı, <em>tek panelde.</em></h2>
                <p className="ecs__p">Portföy sağlığı, danışman performansı ve pipeline aynı ekranda; müşterilerin kişisel verilerine dokunmadan.</p>
                <ul className="ecs-mgr__list">
                  <li><b>₺62,4M</b><span>Yıllık ciro</span></li>
                  <li><b>%13,6</b><span>Ortalama dönüşüm oranı</span></li>
                  <li><b>4 / 12</b><span>Danışman hedefin üzerinde</span></li>
                </ul>
              </div>
            </div>
          </Rev>
        </div>
      </section>

      {/* ── ÖNCESİ / SONRASI ── */}
      <section className="ecs">
        <div className="wrap ecs-cmpwrap">
          <Rev>
            <span className="ecs__eye">Fark</span>
            <h2 className="ecs__h2">Eskisi <em>ile yenisi.</em></h2>
          </Rev>
          <Rev delay={100}>
            <div className="ecs-cmp">
              <div className="ecs-cmp__row ecs-cmp__row--head">
                <span className="ecs-cmp__label" />
                <span className="ecs-cmp__before ecs-cmp__before--h">Öncesi</span>
                <span className="ecs-cmp__after ecs-cmp__after--h">EstateMatch AI ile</span>
              </div>
              {COMPARE.map(row => (
                <div className="ecs-cmp__row" key={row.label}>
                  <span className="ecs-cmp__label">{row.label}</span>
                  <span className="ecs-cmp__before"><i>✕</i>{row.before}</span>
                  <span className="ecs-cmp__after"><i>✓</i>{row.after}</span>
                </div>
              ))}
            </div>
          </Rev>
        </div>
      </section>

      {/* ── CLOSING — güven ── */}
      <section className="ecs">
        <div className="ecs-closing">
          <Rev>
            <h2 className="ecs-closing__h">Bu platform, her eşleşmeye ve her anlaşmaya <em style={{ fontStyle: 'normal', color: 'var(--cs-brand)' }}>netlik kazandırır.</em></h2>
          </Rev>

          <Rev delay={80}>
            <div className="ecs-phone" style={{ marginTop: '2.5rem', width: 260 }}>
              <div className="ecs-phone__notch" />
              <div className="ecs-phone__screen">
                <div className="ecs-phone__scroll">
                  <img className="ecs-phone__img" src="/screens/reports.png" alt="EstateMatch AI raporlar ekranı" />
                </div>
              </div>
            </div>
          </Rev>

          <Rev delay={140}>
            <div className="ecs-closing__row">
              <div className="ecs-quote">
                <svg width="24" height="18" viewBox="0 0 32 24" fill="none"><path d="M0 24V13.5C0 6 4.5 0.8 12 0v5.5C7.8 6.3 5.5 9 5.3 13H12V24H0Z" fill="#eafff2" opacity=".85" /><path d="M20 24V13.5C20 6 24.5 0.8 32 0v5.5C27.8 6.3 25.5 9 25.3 13H32V24H20Z" fill="#eafff2" opacity=".85" /></svg>
                <p>"Boğaz'da kaç satılık yalım var?" — sorulur, ilgili ilanlarla birlikte anında yanıtlanır.</p>
                <div className="ecs-quote__row">
                  <div style={{ display: 'flex' }}>
                    <span className="ecs-quote__av" style={{ background: '#e8f4ee', color: '#0F5132' }}>DE</span>
                    <span className="ecs-quote__av" style={{ background: '#3f8f68', color: '#fff', marginLeft: -8 }}>AI</span>
                  </div>
                  <span className="ecs-quote__cap">Danışman ve AI, aynı listede birlikte çalışıyor</span>
                </div>
              </div>

              <div className="ecs-closing__phone">
                <div className="ecs-closing__phone-screen">
                  <img src="/screens/portfolio.png" alt="Portföy ekranı" />
                </div>
              </div>
            </div>
          </Rev>
        </div>
      </section>

      {/* ── GÜVENLİK VE ŞEFFAFLIK ── */}
      <section className="ecs">
        <div className="wrap ecs-trustwrap">
          <Rev>
            <span className="ecs__eye">Güvenlik ve şeffaflık</span>
            <h2 className="ecs__h2">Karar her zaman <em>danışmanda kalır.</em></h2>
            <p className="ecs__p">EstateMatch AI karar vermez; puanlar, gerekçelendirir ve önerir. Onaylamak, göndermek ya da reddetmek — hepsi danışmanın elinde.</p>
          </Rev>

          <Rev delay={100}>
            <div className="ecs-trust__grid">
              {TRUST.map(t => (
                <div className="ecs-trust__card" key={t.h}>
                  <svg className="ecs-trust__ic" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{t.ic}</svg>
                  <h3>{t.h}</h3>
                  <p>{t.p}</p>
                </div>
              ))}
            </div>
          </Rev>

          <Rev delay={160}>
            <div className="ecs-arch">
              <span className="ecs-arch__h">Bir talebin AI'dan geçiş yolu</span>
              <div className="ecs-arch__row">
                {ARCH.map((a, i) => (
                  <div className="ecs-arch__step" key={a}>
                    <span className="ecs-arch__n">{i + 1}</span>
                    <span className="ecs-arch__l">{a.split('\n').map((ln, j) => <span key={j}>{ln}</span>)}</span>
                  </div>
                ))}
              </div>
            </div>
          </Rev>
        </div>
      </section>

      {/* ── ROI ── */}
      <section className="esec esec--tint">
        <div className="wrap">
          <Rev>
            <div className="esec__head esec__head--mid">
              <span className="eeye">Örnek operasyon senaryosu</span>
              <h2 className="eh2">Kazandırdığı <em>zamanı görün.</em></h2>
              <p className="ep">
                Değerleri kendi ekibinize göre değiştirin. Aşağıdaki sonuçlar bir örnek hesaplamadır; gerçek kazanım operasyonunuza göre değişir.
              </p>
            </div>
          </Rev>
          <Rev delay={100}>
            <RoiCalc
              fields={ROI_FIELDS}
              initial={{ consultants: 10, leads: 30, minutes: 120, hourly: 400 }}
              compute={computeRoi}
              note="Örnek senaryo: yalnızca portföy arama süresini temel alır; takip, ilan üretimi, raporlama ve iletişim kazanımları dahil değildir."
            />
          </Rev>
        </div>
      </section>

      {/* ── FIYATLANDIRMA ── */}
      <section className="esec">
        <div className="wrap">
          <Rev>
            <div className="esec__head esec__head--mid">
              <span className="eeye">Büyümeye hazır</span>
              <h2 className="eh2">Ekibiniz neredeyse, <em>oradan başlayın.</em></h2>
            </div>
          </Rev>
          <div className="eplans">
            {PLANS.map((p, i) => (
              <Rev key={p.n} delay={i * 90}>
                <div className={`eplan${p.best ? ' eplan--best' : ''}`}>
                  {p.best && <span className="eplan__tag">En çok tercih edilen</span>}
                  <span className="eplan__n">{p.n}</span>
                  <h3 className="eplan__h">{p.h}</h3>
                  <p className="eplan__p">{p.p}</p>
                  <ul className="eplan__ul">
                    {p.ul.map((li, j) => <li key={j}>{li}</li>)}
                  </ul>
                  <button className="eplan__btn" onClick={demo}>{p.cta}</button>
                </div>
              </Rev>
            ))}
          </div>
        </div>
      </section>

      {/* ── SSS ── */}
      <section className="esec esec--tint">
        <div className="wrap">
          <Rev>
            <div className="esec__head esec__head--mid">
              <span className="eeye">Sık sorulanlar</span>
              <h2 className="eh2">Merak edilenler.</h2>
            </div>
          </Rev>
          <Rev delay={80}>
            <div className="efaqs">
              {FAQS.map((f, i) => (
                <Faq
                  key={i}
                  q={f.q}
                  a={f.a}
                  open={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? -1 : i)}
                />
              ))}
            </div>
          </Rev>
        </div>
      </section>

      {/* ── KAPANIS ── */}
      <section className="esec">
        <div className="wrap">
          <Rev>
            <div className="ecta">
              <div className="ecta__glow" />
              <div className="ecta__in">
                <h2 className="ecta__h">
                  Emlak operasyonunuzun<br /><em>yeni işletim sistemi.</em>
                </h2>
                <p className="ecta__p">
                  Doğru müşteri. Doğru portföy. Doğru zaman. Pilot programa katılın, sürecinizi
                  birlikte kuralım.
                </p>
                <div className="ecta__row">
                  <button className="ebtn ebtn--solid" onClick={demo}>Pilot programa katıl <span>→</span></button>
                  <a
                    className="ebtn ebtn--ghost"
                    href="https://wa.me/905315178170?text=Merhaba%2C%20EstateMatch%20AI%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum."
                    target="_blank" rel="noopener noreferrer"
                  >
                    WhatsApp'tan yazın <span>→</span>
                  </a>
                </div>
              </div>
            </div>
          </Rev>
        </div>
      </section>
    </main>
  )
}
