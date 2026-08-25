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

/* ── Akıllı Eşleştirme: talep + sıralı portföy önerileri ── */
const MATCH_REQUEST = { rooms: '3+1 daire', area: 'Fulya, Nişantaşı', budget: '₺22-28M', notes: 'Otopark, güvenlik, manzara' }
const PROPERTIES = [
  { name: 'Fulya\'da Lüks Residence',      rooms: '3+1', area: 180, floor: '2. Kat', price: '₺27.500.000', score: 91, img: '/screens/property-fulya.png' },
  { name: 'Nişantaşı\'nda Modern Daire',   rooms: '4+1', area: 160, floor: '4. Kat', price: '₺24.750.000', score: 84, img: '/screens/property-nisantasi.png' },
  { name: 'Maçka\'da Manzaralı Daire',     rooms: '3+1', area: 170, floor: '6. Kat', price: '₺22.900.000', score: 76, img: '/screens/property-macka.png' },
]

/* ── Yönetim Kontrolü ── */
const KPI = [
  { l: 'Toplam Gelir', value: 124.8, decimals: 1, prefix: '₺', suffix: 'M', d: '+%18,6' },
  { l: 'Aktif Talepler', value: 238, decimals: 0, prefix: '', suffix: '', d: '+%24,2' },
  { l: 'Kapanan Anlaşmalar', value: 42, decimals: 0, prefix: '', suffix: '', d: '+%13,3' },
  { l: 'Dönüşüm Oranı', value: 24.6, decimals: 1, prefix: '%', suffix: '', d: '+%6,7' },
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
    cta: 'Demo planla →',
  },
  {
    n: 'Professional', h: 'Büyüyen acenteler', best: true,
    p: 'Portföyü ve danışman ekibi hızla büyüyen emlak şirketleri için.',
    ul: ['25 kullanıcı', '2.500 ilan', 'Adil kullanım kapsamında AI eşleştirme', 'Gelişmiş raporlar ve yönetim'],
    cta: 'Demo planla →',
  },
  {
    n: 'Enterprise', h: 'Kurumsal yapı',
    p: 'Çok şubeli, özel entegrasyon ve yüksek ölçek ihtiyacı olan kurumlar için.',
    ul: ['Esnek kullanıcı', 'Esnek portföy limiti', 'Özel entegrasyonlar', 'Kuruma özel çözümler'],
    cta: 'Demo planla →',
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
    a: 'Excel/CSV dosyalarınızı doğrudan içe aktarırsınız; alan eşleştirmesini pilot sürecinde birlikte ayarlarız.' },
  { q: 'Kullandığımız CRM ile entegre çalışır mı?',
    a: 'Evet — CRM\'inizin yerini alabilir veya entegre çalışabilir; hangisi uygun, pilot görüşmesinde belirlenir.' },
  { q: 'Müşteri verilerimiz güvende mi?',
    a: 'Her acentenin verisi izole tutulur, kişisel bilgiler AI\'ye gönderilmeden maskelenir; erişimi yönetici belirler.' },
  { q: 'Yapay zekâ yanlış eşleştirme yaparsa ne olur?',
    a: 'Karar her zaman danışmanda kalır. Sistem gerekçeli önerir; onaylamak veya düzenlemek danışmana aittir.' },
  { q: 'Ekibimizin teknik bilgisi yok, kullanabilir miyiz?',
    a: 'Evet. Arayüz emlak diliyle çalışır, teknik bilgi gerektirmez; kurulum sonrası ekibinize eğitim veririz.' },
  { q: 'Pilot süreç nasıl işliyor?',
    a: 'Önce operasyonunuzu inceleriz, sonra sınırlı bir ekiple başlarız; aktarım ve eğitim bizim tarafımızdan yürütülür.' },
  { q: 'AI kullanımı maliyeti nasıl kontrol ediliyor?',
    a: 'Fiyatlandırma kullanıcı ve portföy büyüklüğüne göredir; AI eşleştirme kullanım limitiyle sınırlanmaz.' },
]

/* ── Sahnelere göre kısıtlı fare paralaksı: yalnızca hover edilen sahne içinde,
     dokunmatik ve prefers-reduced-motion'da devre dışı, doğrudan DOM'a yazar. ── */
function useMouseTilt(computeTransform, restTransform) {
  const stageRef = useRef(null)
  const targetRef = useRef(null)
  useEffect(() => {
    const stage = stageRef.current
    const target = targetRef.current
    if (!stage || !target) return
    if (window.matchMedia('(hover: none), (prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    let next = null
    const flush = () => { raf = 0; if (next) target.style.transform = next }
    const onMove = (e) => {
      const r = stage.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      next = computeTransform(px, py)
      if (!raf) raf = requestAnimationFrame(flush)
    }
    const onLeave = () => {
      next = restTransform
      if (!raf) raf = requestAnimationFrame(flush)
    }
    target.style.transform = restTransform
    stage.addEventListener('mousemove', onMove)
    stage.addEventListener('mouseleave', onLeave)
    return () => {
      stage.removeEventListener('mousemove', onMove)
      stage.removeEventListener('mouseleave', onLeave)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [computeTransform, restTransform])
  return { stageRef, targetRef }
}

/* ── Bir kez tetiklenen görünürlük gözlemcisi (Rev ile aynı davranış, boolean döner) ── */
function useInView(threshold = 0.35) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setInView(true); return }
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) { setInView(true); io.disconnect() }
    }, { threshold })
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])
  return [ref, inView]
}

/* ── inView olunca 0'dan hedefe sayan sayaç; Türkçe ondalık biçimlendirme destekler ── */
function useCountUp(target, inView, duration = 1200, decimals = 0) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!inView) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setValue(target); return }
    let raf = 0
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(target * eased)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, target, duration])
  return value.toLocaleString('tr-TR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

/* ── Akıllı Eşleştirme: tek bir portföy kartı, skor sırayla sayarak belirir ── */
function PropCard({ p, i, active, setRef }) {
  const [ref, inView] = useInView(0.4)
  const score = useCountUp(p.score, inView, 900 + i * 150, 0)
  return (
    <div
      ref={(el) => { ref.current = el; setRef(el) }}
      data-i={i}
      className={`ecs-prop2${active ? ' ecs-prop2--active' : ''}`}
    >
      <div className="ecs-prop2__photo">
        <img src={p.img} alt={p.name} loading="lazy" />
      </div>
      <span className="ecs-prop2__score">%{score} eşleşme</span>
      <div className="ecs-prop2__body">
        <strong>{p.name}</strong>
        <span>{p.rooms} · {p.area} m² · {p.floor}</span>
        <span className="ecs-prop2__price">{p.price}</span>
        <span className="ecs-prop2__note">Temsili görsel</span>
      </div>
      <span className="ecs-prop2__save" aria-hidden="true">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 3h12v18l-6-4-6 4V3z" /></svg>
      </span>
    </div>
  )
}

/* ══════════════ SAYFA ══════════════ */
const SEO_TITLE = 'EstateMatch AI | Yapay Zekâ Destekli Emlak Satış ve Portföy Yönetimi'
const SEO_DESC = 'Müşteri taleplerini portföyünüzle otomatik eşleştirin, danışman takiplerini önceliklendirin ve emlak satış operasyonunuzu tek panelden yönetin.'

export default function EstateMatchPage({ goBack, onDemo }) {
  const [openFaq, setOpenFaq] = useState(0)
  const [progress, setProgress] = useState(0)

  usePageSeo({
    title: SEO_TITLE,
    description: SEO_DESC,
    path: '/estatematch',
    ogImage: 'https://sryverse.com/screens/dashboard-main.png',
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

  const demo = useCallback(() => {
    if (onDemo) onDemo()
    else goBack?.()
  }, [onDemo, goBack])

  const laptopCompute = useCallback((px, py) => `rotateX(${5 - py * 6}deg) rotateY(${-13 + px * 6}deg)`, [])
  const { stageRef: laptopStageRef, targetRef: laptopUnitRef } = useMouseTilt(laptopCompute, 'rotateX(5deg) rotateY(-13deg)')

  const boardCompute = useCallback((px, py) => `translate3d(${px * 24}px, ${py * 16}px, 0)`, [])
  const { stageRef: boardStageRef, targetRef: boardRef } = useMouseTilt(boardCompute, 'translate3d(0,0,0)')

  // Akıllı Eşleştirme: en ortadaki kart "aktif" olarak öne gelir
  const [activeProp, setActiveProp] = useState(1)
  const propRefs = useRef([])
  useEffect(() => {
    const els = propRefs.current.filter(Boolean)
    if (!els.length) return
    const io = new IntersectionObserver((entries) => {
      let best = null
      entries.forEach(e => {
        if (!best || e.intersectionRatio > best.intersectionRatio) best = e
      })
      if (best && best.intersectionRatio > 0) {
        setActiveProp(Number(best.target.dataset.i))
      }
    }, { threshold: [0.3, 0.5, 0.7, 0.9] })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  // Sahada da aynı güç: üç telefonlu sahne — fareye göre kısıtlı derinlik paralaksı
  const fieldStageRef = useRef(null)
  useEffect(() => {
    const stage = fieldStageRef.current
    if (!stage) return
    if (window.matchMedia('(hover: none), (prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    let next = null
    const flush = () => {
      raf = 0
      if (!next) return
      stage.style.setProperty('--mx', next.x)
      stage.style.setProperty('--my', next.y)
    }
    const onMove = (e) => {
      const r = stage.getBoundingClientRect()
      next = { x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 }
      if (!raf) raf = requestAnimationFrame(flush)
    }
    const onLeave = () => { next = { x: 0, y: 0 }; if (!raf) raf = requestAnimationFrame(flush) }
    stage.style.setProperty('--mx', 0)
    stage.style.setProperty('--my', 0)
    stage.addEventListener('mousemove', onMove)
    stage.addEventListener('mouseleave', onLeave)
    return () => {
      stage.removeEventListener('mousemove', onMove)
      stage.removeEventListener('mouseleave', onLeave)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  // Yönetim Kontrolü: dashboard kabuğu görünür olunca sayaçlar ve grafikler canlanır
  const [dashRef, dashInView] = useInView(0.25)
  const kpiValues = [
    useCountUp(KPI[0].value, dashInView, 1300, KPI[0].decimals),
    useCountUp(KPI[1].value, dashInView, 1300, KPI[1].decimals),
    useCountUp(KPI[2].value, dashInView, 1300, KPI[2].decimals),
    useCountUp(KPI[3].value, dashInView, 1300, KPI[3].decimals),
  ]

  return (
    <main className="epage epage--estate">
      <div className="epage__progress" style={{ width: `${progress}%` }} />

      {/* ── HERO (koyu, laptop + yüzen cam kartlar) ── */}
      <section className="ecs-dark ecs-hero2">
        <div className="wrap">
          <button className="ecs-hero2__crumb" onClick={goBack}>← Ana Sayfa</button>
          <div className="ecs-hero2__badge"><span className="ecs-hero2__dot" />EstateMatch AI</div>
          <h1 className="ecs-hero2__h1">Satışın bir sonraki <em>hamlesini görün.</em></h1>
          <p className="ecs-hero2__sub">Doğru müşteri. Doğru portföy. Doğru zaman.</p>
          <div className="ecs-hero2__ctas">
            <button className="ecs-btn ecs-btn--solid" onClick={demo}>Ücretsiz demo planla <span>→</span></button>
          </div>

          <div className="ecs-hero2__ground" aria-hidden="true" />
          <div className="ecs-hero2__stage" ref={laptopStageRef}>
            <Rev>
              <div className="ecs-laptop">
                <div className="ecs-laptop__unit" ref={laptopUnitRef}>
                  <div className="ecs-laptop__lid">
                    <div className="ecs-laptop__screen">
                      <img src="/screens/dashboard-main.png" alt="EstateMatch AI panel — masaüstü görünümü" />
                    </div>
                  </div>
                  <div className="ecs-laptop__base" />
                </div>
              </div>
            </Rev>
            <Rev delay={250}>
              <div className="ecs-glass ecs-glass--a">
                <span className="ecs-glass__l">Bugün ara</span>
                <strong>12 <small>önerilen kişi</small></strong>
              </div>
            </Rev>
            <Rev delay={450}>
              <div className="ecs-glass ecs-glass--b">
                <span className="ecs-glass__l">Eşleşme</span>
                <strong>%91</strong>
                <svg className="ecs-glass__spark" width="72" height="26" viewBox="0 0 72 26" fill="none">
                  <polyline points="0,21 12,17 24,19 36,10 48,13 60,4 72,7" stroke="var(--sage)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </Rev>
          </div>
        </div>
      </section>

      {/* ── AKILLI PROSPECT ── */}
      <section id="prospect" className="ecs-dark ecs-prospect">
        <div className="wrap ecs-scene ecs-scene--rev">
          <div className="ecs-scene__stage" ref={boardStageRef}>
            <Rev>
              <div className="ecs-shot" ref={boardRef}>
                <img src="/screens/clients-list.png" alt="EstateMatch AI — müşteri önceliklendirme ve dönüşüm skoru" loading="lazy" />
              </div>
            </Rev>
          </div>
          <div className="ecs-scene__text">
            <span className="ecs__eye">Akıllı Prospect</span>
            <h2 className="ecs__h2">Kimi arayacağınızı <em>sistem söylesin.</em></h2>
            <p className="ecs__p">Veri, niyet ve zamanlama birleşir; en yüksek dönüşüm potansiyeline sahip kişiler her gün güncellenir.</p>
          </div>
        </div>
      </section>

      {/* ── AKILLI EŞLEŞTİRME ── */}
      <section id="matching" className="ecs-dark ecs-eslesme">
        <div className="wrap" style={{ textAlign: 'center' }}>
          <Rev>
            <div style={{ maxWidth: 560, margin: '0 auto' }}>
              <span className="ecs__eye">Akıllı Eşleştirme</span>
              <h2 className="ecs__h2">Doğru portföy <em>kendini göstersin.</em></h2>
              <p className="ecs__p">Her talep, yüzlerce kritere göre anında eşleştirilir.</p>
            </div>
          </Rev>
          <Rev delay={120}>
            <div className="ecs-req2">
              <span className="ecs-req2__tag">Müşteri Talebi</span>
              <strong>{MATCH_REQUEST.rooms}</strong>
              <span>{MATCH_REQUEST.area} · {MATCH_REQUEST.budget}</span>
              <span>{MATCH_REQUEST.notes}</span>
            </div>
          </Rev>
          <div className="ecs-props2">
            {PROPERTIES.map((p, i) => (
              <Rev key={p.name} delay={220 + i * 100}>
                <PropCard
                  p={p}
                  i={i}
                  active={activeProp === i}
                  setRef={(el) => { propRefs.current[i] = el }}
                />
              </Rev>
            ))}
          </div>
          <svg className="ecs-eslesme__lines" viewBox="0 0 1440 160" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0,30 C 300,50 500,10 800,32 S 1200,60 1440,38" fill="none" stroke="#F4F1EA" strokeWidth="1" />
            <path d="M0,80 C 320,105 560,60 860,86 S 1250,120 1440,92" fill="none" stroke="#F4F1EA" strokeWidth="1" />
            <path d="M0,128 C 340,150 580,110 880,132 S 1260,160 1440,138" fill="none" stroke="#F4F1EA" strokeWidth="1" />
          </svg>
        </div>
      </section>

      {/* ── SATIŞ OPERASYON MERKEZİ ── */}
      <section id="operations" className="ecs">
        <div className="wrap ecs-scene ecs-scene--rev">
          <div className="ecs-scene__stage">
            <Rev>
              <div className="ecs-shot">
                <img src="/screens/pipeline-board.png" alt="EstateMatch AI — satış iş süreçleri panosu" loading="lazy" />
              </div>
            </Rev>
          </div>
          <div className="ecs-scene__text">
            <span className="ecs__eye">Satış Operasyon Merkezi</span>
            <h2 className="ecs__h2">Tüm satış operasyonu. <em>Tek yerde.</em></h2>
            <p className="ecs__p">Pipeline, portföy, talepler ve yapay zekâ asistanı tek akışta birleşir.</p>
          </div>
        </div>
      </section>

      {/* ── SAHADA DA AYNI GÜÇ — üç telefonlu ürün ailesi ── */}
      <section id="field" className="ecs ecs-field-section">
        <div className="wrap ecs-field-grid">
          <div className="ecs-field-text">
            <span className="ecs__eye">Sahada da aynı güç</span>
            <h2 className="ecs__h2">Sahada da <em>aynı güç.</em></h2>
            <p className="ecs__p">Müşteri, portföy ve görevlerinize her yerden anında erişin.</p>
            <ul className="ecs-field-benefits">
              <li>Müşteri geçmişine sahada anında erişin</li>
              <li>Portföyü müşteriyle yerinde paylaşın</li>
              <li>Randevu ve notlar otomatik senkronlanır</li>
            </ul>
          </div>
          <div className="ecs-field-stage" ref={fieldStageRef}>
            <Rev delay={220}>
              <div className="ecs-phone ecs-phone--side ecs-phone--l" aria-hidden="true">
                <div className="ecs-phone__screen"><img src="/screens/mobile-clients.png" alt="" loading="lazy" /></div>
              </div>
            </Rev>
            <Rev delay={260}>
              <div className="ecs-phone ecs-phone--side ecs-phone--r" aria-hidden="true">
                <div className="ecs-phone__screen"><img src="/screens/mobile-portfolio.png" alt="" loading="lazy" /></div>
              </div>
            </Rev>
            <Rev delay={80}>
              <div className="ecs-phone ecs-phone--main">
                <div className="ecs-phone__screen"><img src="/screens/mobile-dashboard.png" alt="EstateMatch AI — mobil kontrol paneli" loading="lazy" /></div>
              </div>
            </Rev>
          </div>
        </div>
      </section>

      {/* ── YÖNETİM KONTROLÜ ── */}
      <section id="management" className="ecs ecs-mgmt-section">
        <div className="wrap">
          <Rev>
            <SectionHead eyebrow="Yönetim Kontrolü">Ekibin tamamı. <em>Tek bakışta.</em></SectionHead>
            <p className="ecs__p">Performans, hedefler ve gelir tek ekranda şeffaflaşır.</p>
          </Rev>
          <Rev delay={100}>
            <div className="ecs-stats" ref={dashRef}>
              {KPI.map((k, i) => (
                <div className="ecs-stats__item" key={k.l}>
                  <strong>{k.prefix}{kpiValues[i]}{k.suffix}</strong>
                  <span>{k.l} <em>{k.d}</em></span>
                </div>
              ))}
            </div>
          </Rev>
          <Rev delay={180}>
            <div className="ecs-shot ecs-mgmt-shot">
              <img src="/screens/reports-dashboard.png" alt="EstateMatch AI — satış ve ekip performans raporu" loading="lazy" />
            </div>
          </Rev>
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
                <span className="ecs-hero2__badge" style={{ marginBottom: '1.4rem' }}><span className="ecs-hero2__dot" />EstateMatch AI</span>
                <h2 className="ecta__h">
                  Bir ekran değil.<br /><em>Satış refleksi.</em>
                </h2>
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
