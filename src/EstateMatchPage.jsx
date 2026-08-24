import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Rev, Faq, RoiCalc, SectionHead, usePageSeo, usePageSchema } from './pageParts.jsx'
import './ProductPage.css'
import './EstateCaseStudy.css'

/* ── Kurucu pilot programı: 4 haftalık görsel yolculuk ── */
const PILOT_WEEKS = [
  { w: '1. hafta', h: 'Operasyon analizi', icon: 'M4 12h4l2-7 4 14 2-7h4' },
  { w: '2. hafta', h: 'Veri ve portföy aktarımı', icon: 'M12 4v11m0 0-4-4m4 4 4-4M5 19h14' },
  { w: '3. hafta', h: 'Ekip kullanımı ve uyarlama', icon: 'M9 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7 8v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1m18 0v-1a4 4 0 0 0-3-3.87M14.5 5.13a4 4 0 0 1 0 7.75' },
  { w: '4. hafta', h: 'Sonuç ve kazanım raporu', icon: 'M4 20V10m6 10V4m6 16v-7' },
]

/* ── 3 sinematik ürün sahnesi — eski 9 modüllü carousel'in yerini alır ── */
const SCENES = [
  {
    id: 'scene-opportunity', n: 'Sahne 1', tag: 'opportunity',
    h: 'Doğru fırsat, artık gözden kaçmaz.',
    p: 'Talep ve portföy saniyeler içinde buluşur.',
    img: '/screens/match.png', alt: 'Müşteri talebi ve AI eşleştirme gerekçesi — canlı ürün',
  },
  {
    id: 'scene-day', n: 'Sahne 2', tag: 'day',
    h: 'Her danışman, güne ne yapacağını bilerek başlar.',
    img: '/screens/dashboard.png', alt: 'Danışman günlük paneli — canlı ürün',
  },
  {
    id: 'scene-team', n: 'Sahne 3', tag: 'team',
    h: 'Bütün satış operasyonu, tek bakışta.',
    img: '/screens/wide-reports.png', alt: 'Yönetici raporlar ekranı — canlı ürün',
  },
]

/* ── Yetenek şeridi ── */
const CAPS = [
  'AI Eşleştirme', 'Portföy Yönetimi', 'İlan İçerik Üretimi', 'İş Akışı Takibi',
  'Takvim & Takip', 'Raporlama', 'Danışman Performansı', 'Müşteri Talebi Analizi',
]

/* ── Problem aynası: dağınık veri vs tek ekran ── */
const CHAOS = [
  { t: 'WhatsApp', c: '"3+1 Beşiktaş arıyorum, bütçe 15M civarı"', rot: -4 },
  { t: 'Excel', c: '184 satır portföy, son güncelleme 3 hafta önce', rot: 3 },
  { t: 'Telefon notu', c: '"Salı arayacaktım, unutmuşum"', rot: -2 },
  { t: 'Kağıt not', c: '"Müşteri #291 — tekrar ara"', rot: 5 },
]

/* ── Bugünün önceliği: eşleşme kuyruğu ── */
const QUEUE = [
  { name: 'Müşteri #482', detail: '3+1 · Beşiktaş · ₺15M bütçe — 2 gündür yanıt bekliyor', score: '%91' },
  { name: 'Müşteri #317', detail: 'Yatırımlık daire · Kadıköy · ₺6-8M bütçe', score: '%84' },
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
  { h: 'İşlem kayıtları', p: 'Kim neyi ne zaman yaptı — her kritik aksiyon kayıt altına alınır.',
    ic: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></> },
  { h: 'Veri taşınabilirliği', p: 'Verinizi istediğiniz an dışa aktarabilir, silme talebinde bulunabilirsiniz; düzenli yedeklenir.',
    ic: <><path d="M12 3v12M7 10l5 5 5-5" /><path d="M4 21h16" /></> },
]

/* ── Fiyat paketleri ── */
const PLANS = [
  {
    n: 'Starter', h: 'Küçük ekipler',
    p: 'Temel operasyonu tek merkeze taşımak isteyen butik acenteler için.',
    ul: ['10 kullanıcı', '500 ilan', 'Adil kullanım kapsamında AI eşleştirme', 'Tüm temel modüller'],
    cta: 'Pilot demo planla',
  },
  {
    n: 'Professional', h: 'Büyüyen acenteler', best: true,
    p: 'Portföyü ve danışman ekibi hızla büyüyen emlak şirketleri için.',
    ul: ['25 kullanıcı', '2.500 ilan', 'Adil kullanım kapsamında AI eşleştirme', 'Gelişmiş raporlar ve yönetim'],
    cta: 'Ücretsiz demo planla',
  },
  {
    n: 'Enterprise', h: 'Kurumsal yapı',
    p: 'Çok şubeli, özel entegrasyon ve yüksek ölçek ihtiyacı olan kurumlar için.',
    ul: ['Esnek kullanıcı', 'Esnek portföy limiti', 'Özel entegrasyonlar', 'Kuruma özel çözümler'],
    cta: 'Kurumsal görüşme planla',
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
  { q: 'Kullandığımız CRM ile entegre çalışır mı?',
    a: 'Evet. EstateMatch mevcut CRM\'inizin yerini alabilir veya mevcut sisteminize entegre biçimde çalışabilir; hangisinin uygun olduğuna pilot görüşmesinde birlikte karar veririz.' },
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

/* ── Sahne 2: siyah-beyaz laptop açılışı → gerçek dashboard ──
   Bir kez, görünür olunca oynar; prefers-reduced-motion'da anında son duruma atlar. */
function LaptopBoot({ img, alt }) {
  const hostRef = useRef(null)
  const [step, setStep] = useState(0) // 0 kapalı, 1 uyanıyor, 2 logo, 3 marka, 4 dashboard

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) { setStep(4); return }
    let timers = []
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        io.disconnect()
        timers = [
          setTimeout(() => setStep(1), 150),
          setTimeout(() => setStep(2), 600),
          setTimeout(() => setStep(3), 1050),
          setTimeout(() => setStep(4), 1700),
        ]
      }
    }, { threshold: 0.4 })
    if (hostRef.current) io.observe(hostRef.current)
    return () => { io.disconnect(); timers.forEach(clearTimeout) }
  }, [])

  return (
    <div className={`ecs-boot ecs-boot--s${step}`} ref={hostRef}>
      <div className="ecs-boot__lid">
        <div className="ecs-boot__screen">
          <img className="ecs-boot__mono" src="/sryverse-badge-white.png" alt="" aria-hidden="true" />
          <div className="ecs-boot__brand">
            <span className="ecs-boot__name">EstateMatch AI</span>
            <span className="ecs-boot__by">by SRYVERSE</span>
          </div>
          <img className="ecs-boot__shot" src={img} alt={alt} />
        </div>
      </div>
      <div className="ecs-boot__base" />
    </div>
  )
}

/* ══════════════ SAYFA ══════════════ */
const SEO_TITLE = 'EstateMatch AI | Yapay Zekâ Destekli Emlak Satış ve Portföy Yönetimi'
const SEO_DESC = 'Müşteri taleplerini portföyünüzle otomatik eşleştirin, danışman takiplerini önceliklendirin ve emlak satış operasyonunuzu tek panelden yönetin.'

export default function EstateMatchPage({ goBack, onDemo }) {
  const [openFaq, setOpenFaq] = useState(0)
  const [progress, setProgress] = useState(0)
  const [scene1Shift, setScene1Shift] = useState(0)
  const scene1Ref = useRef(null)

  usePageSeo({
    title: SEO_TITLE,
    description: SEO_DESC,
    path: '/estatematch',
    ogImage: 'https://sryverse.com/screens/wide-dashboard.png',
  })

  const schema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'EstateMatch AI',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        description: SEO_DESC,
        url: 'https://sryverse.com/estatematch',
        publisher: { '@type': 'Organization', name: 'SRYVERSE' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQS.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  }), [])
  usePageSchema(schema)

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

  useEffect(() => {
    let raf = 0
    const measure = () => {
      raf = 0
      const el = scene1Ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight
      const total = r.height + vh
      const passed = vh - r.top
      setScene1Shift(Math.min(1, Math.max(0, passed / total)))
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
          <div className="ecs-hero__inner">
            <button className="ecs-hero__crumb" onClick={goBack}>Ana Sayfa <span>/</span> EstateMatch AI</button>

            <div className="ecs-hero__grid">
              <div className="ecs-hero__col">
                <div className="ecs-hero__badge">
                  <svg width="16" height="16" viewBox="0 0 30 30" fill="none">
                    <circle cx="15" cy="15" r="14" fill="#0F5132" />
                    <circle cx="19" cy="11" r="4.2" fill="#eafff2" />
                  </svg>
                  <span>EstateMatch AI</span>
                </div>
                <span className="ecs-hero__kicker">Emlak ekipleri için AI destekli satış işletim sistemi</span>
                <h1 className="ecs-hero__h1">Doğru müşteri. Doğru portföy. <em style={{ fontStyle: 'normal', color: 'var(--cs-brand)' }}>Doğru zaman.</em></h1>
                <p className="ecs-hero__sub">EstateMatch fırsatları bulur, gerekçelendirir ve ekibiniz için önceliklendirir.</p>
                <div className="ecs-hero__ctas">
                  <button className="ecs-btn ecs-btn--solid" onClick={demo}>Ücretsiz demo planla <span>→</span></button>
                  <a className="ecs-btn ecs-btn--ghost" href="https://estate.sryverse.com" target="_blank" rel="noopener noreferrer">
                    Ürünü keşfet <span>→</span>
                  </a>
                </div>
              </div>

              <div className="ecs-hero__stage">
                <Rev>
                  <div className="ecs-match">
                    <div className="ecs-match__req">
                      <span className="ecs-match__eye">Müşteri talebi</span>
                      <strong>3+1 · Beşiktaş · ₺15M bütçe</strong>
                    </div>
                    <div className="ecs-match__props">
                      <div className="ecs-match__prop">
                        <span className="ecs-match__pname">Teşvikiye Merkez Daire</span>
                        <span className="ecs-match__pscore">%74</span>
                      </div>
                      <div className="ecs-match__prop ecs-match__prop--win">
                        <span className="ecs-match__pname">Çengelköy Boğaz Yalısı</span>
                        <span className="ecs-match__pscore ecs-match__pscore--win">%91 uyum</span>
                      </div>
                      <div className="ecs-match__prop">
                        <span className="ecs-match__pname">Tarabya Deniz Manzaralı Villa</span>
                        <span className="ecs-match__pscore">%68</span>
                      </div>
                    </div>
                    <div className="ecs-match__approve">✓ Danışman onayı bekliyor</div>
                  </div>
                </Rev>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── KURUCU PİLOT PROGRAMI — 4 haftalık görsel yolculuk ── */}
      <section className="ecs ecs-pilot">
        <div className="wrap">
          <Rev>
            <SectionHead eyebrow="Kurucu pilot programı" note="İlk 5 emlak ekibiyle, 30 gün.">
              Birlikte <em>kuralım.</em>
            </SectionHead>
          </Rev>
          <Rev delay={100}>
            <div className="ecs-pilot__timeline">
              {PILOT_WEEKS.map((w, i) => (
                <div className="ecs-pilot__step" key={w.w}>
                  <div className="ecs-pilot__card">
                    <span className="ecs-pilot__ic">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={w.icon} /></svg>
                    </span>
                    <span className="ecs-pilot__w">{w.w}</span>
                    <h3 className="ecs-pilot__h">{w.h}</h3>
                  </div>
                  {i < PILOT_WEEKS.length - 1 && <span className="ecs-pilot__link" aria-hidden="true" />}
                </div>
              ))}
            </div>
          </Rev>
          <Rev delay={160}>
            <div className="ecs-pilot__foot">
              <button className="ecs-btn ecs-btn--solid" onClick={demo}>Kurucu pilot programına başvur <span>→</span></button>
              <p className="ecs-hero__trust" style={{ textAlign: 'left', margin: 0 }}>Kendi verinizi paylaşmadan örnek veriyle başlayabilirsiniz.</p>
            </div>
          </Rev>
        </div>
      </section>

      {/* ── YETENEK ŞERİDİ ── */}
      <section className="ecs">
        <div className="ecs-marquee" aria-hidden="true">
          <div className="ecs-marquee__track">
            {[...CAPS, ...CAPS].map((c, i) => (
              <span className="ecs-marquee__item" key={i}>{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEM AYNASI ── */}
      <section className="ecs">
        <div className="wrap ecs-problem">
          <Rev>
            <SectionHead eyebrow="Bugün nasıl çalışıyor">
              Müşteri talepleri WhatsApp'ta, portföy Excel'de — <em>gerçek fırsat kayıp gidiyor.</em>
            </SectionHead>
          </Rev>
          <Rev delay={100}>
            <div className="ecs-problem__grid">
              <div className="ecs-problem__chaos">
                {CHAOS.map(x => (
                  <div className="ecs-problem__note" key={x.t} style={{ '--rot': `${x.rot}deg` }}>
                    <span>{x.t}</span>
                    <p>{x.c}</p>
                  </div>
                ))}
              </div>
              <div className="ecs-problem__arrow" aria-hidden="true">→</div>
              <div className="ecs-problem__after">
                <span className="ecs-problem__aftertag">EstateMatch AI ile</span>
                <ul className="ecs-problem__afterlist">
                  <li>Tüm talepler tek ekranda toplanır</li>
                  <li>Öncelik otomatik sıralanır</li>
                  <li>Her öneri gerekçesiyle gelir</li>
                </ul>
              </div>
            </div>
          </Rev>
        </div>
      </section>

      {/* ── SAHNE 1 — Fırsatı bul (telefon, scroll ile içerik kayar) ── */}
      <section id="scene-opportunity" className="ecs">
        <div className="wrap ecs-scene" ref={scene1Ref}>
          <div className="ecs-scene__text">
            <span className="ecs__eye">{SCENES[0].n}</span>
            <h2 className="ecs__h2">{SCENES[0].h}</h2>
            <p className="ecs__p">{SCENES[0].p}</p>
          </div>
          <div className="ecs-scene__stage">
            <div className="ecs-scene__phone">
              <div className="ecs-scene__phonescreen">
                <img
                  src={SCENES[0].img} alt={SCENES[0].alt}
                  style={{ transform: `translateY(${-scene1Shift * 12}%)` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SAHNE 2 — Günü yönet (S-B laptop açılışı → gerçek panel) ── */}
      <section id="scene-day" className="ecs ecs-scene--dark">
        <div className="wrap ecs-scene ecs-scene--rev">
          <div className="ecs-scene__stage">
            <LaptopBoot img={SCENES[1].img} alt={SCENES[1].alt} />
          </div>
          <div className="ecs-scene__text">
            <span className="ecs__eye" style={{ color: 'var(--sage)' }}>{SCENES[1].n}</span>
            <h2 className="ecs__h2" style={{ color: '#fff' }}>{SCENES[1].h}</h2>
          </div>
        </div>
      </section>

      {/* ── SAHNE 3 — Ekibi büyüt (panel genişler) ── */}
      <section id="scene-team" className="ecs">
        <div className="wrap ecs-scene ecs-scene--wide">
          <div className="ecs-scene__text">
            <span className="ecs__eye">{SCENES[2].n}</span>
            <h2 className="ecs__h2">{SCENES[2].h}</h2>
          </div>
          <Rev>
            <div className="ecs-scene__panel">
              <div className="ecs-panel">
                <div className="ecs-panel__bar">
                  <span className="ecs-panel__dot" /><span className="ecs-panel__dot" /><span className="ecs-panel__dot" />
                  <span className="ecs-panel__url">estate.sryverse.com</span>
                </div>
                <div className="ecs-panel__screen">
                  <img src={SCENES[2].img} alt={SCENES[2].alt} />
                </div>
              </div>
            </div>
          </Rev>
        </div>
      </section>

      {/* ── DANIŞMAN VE YÖNETİCİ — birleşik bölüm ── */}
      <section id="manager" className="ecs">
        <div className="wrap ecs-mgr">
          <Rev>
            <SectionHead eyebrow="Danışman ve yönetici için">Sahadaki her ekip üyesi, <em>doğru bilgiye anında ulaşır.</em></SectionHead>
          </Rev>

          <Rev delay={80}>
            <div className="ecs-mgr__sub">
              <h3 className="ecs-mgr__subh">Danışmanın günü, otomatik sıralanır</h3>
              <p className="ecs__p">EstateMatch AI, en yüksek dönüşüm ihtimaline sahip görüşmeleri her sabah üst sıraya taşır. Karar her zaman danışmanda kalır.</p>
              <div className="ecs-queue__list ecs-queue__list--compact">
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
            </div>
          </Rev>

          <Rev delay={160}>
            <div className="ecs-quote ecs-quote--solo">
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
          </Rev>
        </div>
      </section>

      {/* ── GÜVENLİK VE ŞEFFAFLIK ── */}
      <section id="security" className="ecs">
        <div className="wrap ecs-trustwrap">
          <Rev>
            <SectionHead eyebrow="Güvenlik ve şeffaflık">Karar her zaman <em>danışmanda kalır.</em></SectionHead>
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
        </div>
      </section>

      {/* ── ROI ── */}
      <section className="esec ecs">
        <div className="wrap">
          <Rev>
            <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
              <SectionHead eyebrow="Örnek operasyon senaryosu" note="Değerleri kendi ekibinize göre değiştirin — sonuçlar bir örnek hesaplamadır.">
                Kazandırdığı <em>zamanı görün.</em>
              </SectionHead>
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
      <section id="pricing" className="esec ecs">
        <div className="wrap">
          <Rev>
            <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
              <SectionHead eyebrow="Büyümeye hazır">
                Ekibiniz neredeyse, <em>oradan başlayın.</em>
              </SectionHead>
            </div>
          </Rev>
          <div className="eplans">
            {PLANS.map((p, i) => (
              <Rev key={p.n} delay={i * 90}>
                <div className={`eplan${p.best ? ' eplan--best' : ''}`}>
                  {p.best && <span className="eplan__tag">En çok tercih edilen — 10-25 danışmanlı ekipler için</span>}
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

      {/* ── SSS + KAPANIS ── */}
      <section id="faq" className="esec esec--tint">
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

          <Rev delay={100}>
            <div className="ecta" style={{ marginTop: '2.6rem' }}>
              <div className="ecta__glow" />
              <div className="ecta__in">
                <h2 className="ecta__h">
                  Emlak operasyonunuzun<br /><em>yeni işletim sistemi.</em>
                </h2>
                <p className="ecta__p">
                  30 dakikalık görüşmede mevcut portföy ve müşteri takip sürecinizi birlikte
                  inceliyor, EstateMatch AI'nin ekibinize nasıl uygulanacağını gösteriyoruz.
                </p>
                <div className="ecta__row">
                  <button className="ebtn ebtn--solid" onClick={demo}>Ücretsiz demo planla <span>→</span></button>
                  <a
                    className="ebtn ebtn--ghost"
                    href="https://wa.me/905315178170?text=Merhaba%2C%20EstateMatch%20AI%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum."
                    target="_blank" rel="noopener noreferrer"
                  >
                    WhatsApp'tan yazın <span>→</span>
                  </a>
                </div>
                <p className="ecta__trust">Kendi verinizi paylaşmanız gerekmez · Kurulum ve ekip eğitimi dahildir</p>
              </div>
            </div>
          </Rev>
        </div>
      </section>
    </main>
  )
}
