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

/* ── Akıllı Prospect: cam pano satırları + çevresindeki sinyal kartları ── */
const PROSPECTS = [
  { n: 'Mert Yılmaz',  s: 'Fulya bölgesi · 3+1 arıyor',      score: 91, match: 91, act: 'Bugün ara' },
  { n: 'Zeynep Kaya',  s: 'Bütçesini güncelledi',            score: 87, match: 88, act: 'Bugün ara' },
  { n: 'Ahmet Özgen',  s: "Web'de 5 portföy inceledi",       score: 82, match: 76, act: 'Bugün ara' },
  { n: 'Seval Öztürk', s: 'Kredi ön onayı aldı',             score: 78, match: 72, act: 'Yarın ara' },
]
const SIGNALS = [
  { k: 'a', h: 'Bölge ilgisi',      p: 'Fulya / Nişantaşı bölgesine odaklı',
    ic: <><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" /><circle cx="12" cy="10" r="2.6" /></> },
  { k: 'b', h: 'Web davranışı',     p: 'Son 7 günde 5 kez portföy inceledi',
    ic: <><rect x="3" y="5" width="18" height="13" rx="2" /><path d="M9 21h6M12 18v3" /></> },
  { k: 'c', h: 'Finansal uygunluk', p: 'Krediye uygunluk olumlu',
    ic: <><rect x="3" y="7" width="18" height="11" rx="2" /><circle cx="12" cy="12.5" r="2.4" /><path d="M6 10.5h.01M18 15h.01" /></> },
  { k: 'd', h: 'Yaşam evresi',      p: 'Taşınma ihtimali yüksek',
    ic: <><path d="M4 12a8 8 0 0 1 14-5" /><path d="M18 3v4h-4" /><path d="M20 12a8 8 0 0 1-14 5" /><path d="M6 21v-4h4" /></> },
]

/* ── Akıllı Eşleştirme: talep + sıralı portföy önerileri ── */
const MATCH_REQUEST = { rooms: '3+1 daire', area: 'Fulya, Nişantaşı', budget: 'Bütçe: ₺22-28M', notes: 'Otopark, güvenlik, manzara' }
const PROPERTIES = [
  { name: 'Fulya\'da Lüks Residence',      rooms: '3+1', area: 185, floor: '2. Kat', price: '₺27.500.000', score: 91, img: '/screens/property-fulya.png' },
  { name: 'Nişantaşı\'nda Modern Daire',   rooms: '4+1', area: 160, floor: '4. Kat', price: '₺24.750.000', score: 84, img: '/screens/property-nisantasi.png' },
  { name: 'Maçka\'da Manzaralı Daire',     rooms: '3+1', area: 170, floor: '6. Kat', price: '₺22.900.000', score: 76, img: '/screens/property-macka.png' },
]

/* ── Satış Operasyon Merkezi: üç tablet ── */
const PIPE_ROWS = [
  { n: 'Mert Yılmaz',  st: 'Görüşme', v: '₺27,5M' },
  { n: 'Zeynep Kaya',  st: 'Teklif',  v: '₺24,7M' },
  { n: 'Ahmet Özgen',  st: 'Yeni',    v: '₺22,9M' },
  { n: 'Kerem Demir',  st: 'Kapanış', v: '₺31,2M' },
]

/* ── Yönetim Kontrolü ── */
const KPI = [
  { l: 'Toplam Gelir', value: 124.8, decimals: 1, prefix: '₺', suffix: 'M', d: '+%18,6' },
  { l: 'Aktif Talepler', value: 238, decimals: 0, prefix: '', suffix: '', d: '+%24,2' },
  { l: 'Kapanan Anlaşmalar', value: 42, decimals: 0, prefix: '', suffix: '', d: '+%13,3' },
  { l: 'Dönüşüm Oranı', value: 24.6, decimals: 1, prefix: '%', suffix: '', d: '+%6,7' },
]
const TREND = [8, 13, 10, 16, 14, 20, 17, 24.6]
const TEAM = [
  { n: 'Ece Aydın',   v: '₺41,2M', w: 92 },
  { n: 'Bora Demir',  v: '₺33,8M', w: 76 },
  { n: 'Selin Kaya',  v: '₺28,4M', w: 63 },
  { n: 'Mert Aslan',  v: '₺21,4M', w: 48 },
]
const TOPS = [
  { n: "Fulya'da Lüks Residence",     v: '₺27,5M' },
  { n: "Nişantaşı'nda Modern Daire",  v: '₺24,7M' },
  { n: "Maçka'da Manzaralı Daire",    v: '₺22,9M' },
]
const SOURCES = [
  { n: 'Web',      pct: 40, c: '#0B6B57' },
  { n: 'Referans', pct: 30, c: '#2E8C6F' },
  { n: 'İlan',     pct: 20, c: '#AFC8BE' },
  { n: 'Diğer',    pct: 10, c: '#D8CFBE' },
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

/* ── Akıllı Eşleştirme arka planı: koyudan aydınlığa süzülen ışıltılı
     parçacık/dalga alanı. Görünür değilken çizim yapmaz. ── */
function AuroraField() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = canvas.getContext('2d')
    let raf = 0
    let running = false
    let w = 0, h = 0
    const dots = Array.from({ length: 150 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.7 + 0.4,
      vx: (Math.random() - 0.5) * 0.00022,
      vy: -(Math.random() * 0.00025 + 0.00006),
      tw: Math.random() * Math.PI * 2,
    }))
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = rect.width; h = rect.height
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const draw = (t) => {
      raf = 0
      ctx.clearRect(0, 0, w, h)
      // yumuşak dalga bantları
      ctx.globalCompositeOperation = 'lighter'
      for (let b = 0; b < 3; b++) {
        ctx.beginPath()
        const baseY = h * (0.42 + b * 0.14)
        for (let x = 0; x <= w; x += 14) {
          const y = baseY + Math.sin(x * 0.004 + t * 0.00035 + b * 1.9) * 26 + Math.sin(x * 0.011 - t * 0.00022 + b) * 12
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.strokeStyle = `rgba(159, 214, 183, ${0.10 - b * 0.02})`
        ctx.lineWidth = 34 - b * 8
        ctx.stroke()
      }
      // ışıltılı parçacıklar
      for (const d of dots) {
        d.x += d.vx; d.y += d.vy; d.tw += 0.02
        if (d.y < -0.02) { d.y = 1.02; d.x = Math.random() }
        if (d.x < -0.02) d.x = 1.02
        if (d.x > 1.02) d.x = -0.02
        const a = (0.24 + Math.sin(d.tw) * 0.18) * (0.35 + d.y * 0.65)
        ctx.beginPath()
        ctx.arc(d.x * w, d.y * h, d.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(199, 235, 214, ${a})`
        ctx.fill()
      }
      ctx.globalCompositeOperation = 'source-over'
      if (running) raf = requestAnimationFrame(draw)
    }
    const io = new IntersectionObserver(([e]) => {
      running = e.isIntersecting
      if (running && !raf) { resize(); raf = requestAnimationFrame(draw) }
      if (!running && raf) { cancelAnimationFrame(raf); raf = 0 }
    }, { threshold: 0.05 })
    io.observe(canvas)
    window.addEventListener('resize', resize)
    resize()
    return () => {
      io.disconnect()
      window.removeEventListener('resize', resize)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])
  return <canvas ref={canvasRef} className="ecs-aurora" aria-hidden="true" />
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

/* ── Baş harflerden avatar rozeti ── */
function Avatar({ name, tone = 0 }) {
  const initials = name.split(' ').map(p => p[0]).join('').slice(0, 2)
  return <span className={`ecs-ava ecs-ava--${tone % 4}`} aria-hidden="true">{initials}</span>
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

  const laptopCompute = useCallback((px, py) => `rotateX(${6 - py * 5}deg) rotateY(${-10 + px * 6}deg)`, [])
  const { stageRef: laptopStageRef, targetRef: laptopUnitRef } = useMouseTilt(laptopCompute, 'rotateX(6deg) rotateY(-10deg)')

  const boardCompute = useCallback((px, py) => `perspective(1800px) rotateX(${7 - py * 4}deg) rotateY(${-11 + px * 5}deg)`, [])
  const { stageRef: boardStageRef, targetRef: boardRef } = useMouseTilt(boardCompute, 'perspective(1800px) rotateX(7deg) rotateY(-11deg)')

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

  // Sahada da aynı güç: telefon + yan kartlar — fareye göre kısıtlı derinlik paralaksı
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

  // Yönetim Kontrolü: bölüm görünür olunca sayaçlar ve grafikler canlanır
  const [dashRef, dashInView] = useInView(0.2)
  const kpiValues = [
    useCountUp(KPI[0].value, dashInView, 1300, KPI[0].decimals),
    useCountUp(KPI[1].value, dashInView, 1300, KPI[1].decimals),
    useCountUp(KPI[2].value, dashInView, 1300, KPI[2].decimals),
    useCountUp(KPI[3].value, dashInView, 1300, KPI[3].decimals),
  ]

  // Gelir trendi çizgisi — noktalar sabit veriden türetilir
  const trendPath = useMemo(() => {
    const W = 320, H = 130, max = 28
    const pts = TREND.map((v, i) => [14 + (i * (W - 28)) / (TREND.length - 1), H - 16 - (v / max) * (H - 34)])
    const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
    return { pts, line, area: `${line} L${pts[pts.length - 1][0].toFixed(1)},${H - 6} L${pts[0][0].toFixed(1)},${H - 6} Z` }
  }, [])

  // Donut dilimleri
  const donut = useMemo(() => {
    const C = 2 * Math.PI * 34
    let off = 0
    return SOURCES.map(s => {
      const seg = { ...s, dash: `${(s.pct / 100) * C} ${C}`, off: -off }
      off += (s.pct / 100) * C
      return seg
    })
  }, [])

  return (
    <main className="epage epage--estate">
      <div className="epage__progress" style={{ width: `${progress}%` }} />

      {/* ── HERO — koyu sahne: sol metin, sağda laptop, kaya silüeti, cam kartlar ── */}
      <section className="ecs-dark ecs-hero2">
        <div className="ecs-hero2__rock" aria-hidden="true" />
        <div className="wrap">
          <div className="ecs-hero2__grid">
            <div className="ecs-hero2__copy">
              <button className="ecs-hero2__crumb" onClick={goBack}>← Ana Sayfa</button>
              <div className="ecs-hero2__badge"><span className="ecs-hero2__spark" aria-hidden="true">✦</span>EstateMatch AI</div>
              <h1 className="ecs-hero2__h1">Satışın bir sonraki hamlesini görün.</h1>
              <p className="ecs-hero2__sub">Doğru müşteri. Doğru portföy. Doğru zaman.</p>
              <div className="ecs-hero2__ctas">
                <button className="ecs-btn ecs-btn--light" onClick={demo}>Ücretsiz demo planla <span>→</span></button>
              </div>
            </div>

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
                  <div className="ecs-glass__row">
                    <div>
                      <span className="ecs-glass__l">Bugün ara</span>
                      <strong>12 <small>önerilen kişi</small></strong>
                    </div>
                    <span className="ecs-glass__ic" aria-hidden="true">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M4 12a8 8 0 0 1 14-5M18 3v4h-4M20 12a8 8 0 0 1-14 5M6 21v-4h4" /></svg>
                    </span>
                  </div>
                </div>
              </Rev>
              <Rev delay={450}>
                <div className="ecs-glass ecs-glass--b">
                  <strong className="ecs-glass__big">%91</strong>
                  <span className="ecs-glass__l">eşleşme</span>
                  <svg className="ecs-glass__spark2" width="86" height="26" viewBox="0 0 86 26" fill="none" aria-hidden="true">
                    <polyline points="0,22 14,17 28,19 42,10 56,13 72,4 86,7" stroke="#9FD6B7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </Rev>
            </div>
          </div>
        </div>
      </section>

      {/* ── AKILLI PROSPEKT — cam pano + çevresindeki sinyal kartları ── */}
      <section id="prospect" className="ecs-dark ecs-prospect">
        <div className="wrap ecs-prospect__grid">
          <div className="ecs-scene__text">
            <span className="ecs__eye">{'Akıllı Prospekt'.toLocaleUpperCase('tr-TR')}</span>
            <h2 className="ecs__h2">Kimi arayacağınızı sistem söylesin.</h2>
            <p className="ecs__p">Veri + niyet + zamanlama.<br />En yüksek dönüşüm potansiyeline sahip kişiler, her gün güncellenir.</p>
          </div>

          <div className="ecs-prospect__stage" ref={boardStageRef}>
            <svg className="ecs-prospect__wires" viewBox="0 0 760 560" preserveAspectRatio="none" aria-hidden="true">
              <path d="M600,80 C 640,80 660,96 664,128" />
              <path d="M118,236 C 160,236 186,244 210,262" />
              <path d="M190,468 C 240,462 268,442 292,414" />
              <path d="M614,470 C 580,462 556,440 540,412" />
              <circle cx="664" cy="128" r="3" />
              <circle cx="210" cy="262" r="3" />
              <circle cx="292" cy="414" r="3" />
              <circle cx="540" cy="412" r="3" />
            </svg>

            <Rev>
              <div className="ecs-board" ref={boardRef}>
                <div className="ecs-board__head">
                  <strong>Prospekt Önerileri</strong>
                  <div className="ecs-board__cols"><span>Niyet skoru</span><span>Eşleşme</span><span>Aksiyon</span></div>
                </div>
                {PROSPECTS.map((p, i) => (
                  <div className="ecs-board__row" key={p.n} style={{ animationDelay: `${i * 0.9}s` }}>
                    <div className="ecs-board__who">
                      <Avatar name={p.n} tone={i} />
                      <div><strong>{p.n}</strong><span>{p.s}</span></div>
                    </div>
                    <span className="ecs-board__score">{p.score}</span>
                    <div className="ecs-board__match">
                      <i><b style={{ width: `${p.match}%` }} /></i>
                      <span>%{p.match}</span>
                    </div>
                    <button className="ecs-board__act" onClick={demo}>{p.act}</button>
                  </div>
                ))}
              </div>
            </Rev>

            {SIGNALS.map((s, i) => (
              <Rev key={s.k} delay={260 + i * 120}>
                <div className={`ecs-signal ecs-signal--${s.k}`}>
                  <span className="ecs-signal__ic" aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{s.ic}</svg>
                  </span>
                  <div><strong>{s.h}</strong><span>{s.p}</span></div>
                </div>
              </Rev>
            ))}
          </div>
        </div>
      </section>

      {/* ── AKILLI EŞLEŞTİRME — talep kartından portföylere inen ışıklı geçiş ── */}
      <section id="matching" className="ecs-dark ecs-eslesme">
        <AuroraField />
        <div className="wrap ecs-eslesme__in">
          <div className="ecs-eslesme__grid">
            <div className="ecs-eslesme__copy">
              <span className="ecs__eye">{'Akıllı Eşleştirme'.toLocaleUpperCase('tr-TR')}</span>
              <h2 className="ecs__h2">Doğru portföy kendini göstersin.</h2>
              <p className="ecs__p">Her talep, yüzlerce kritere göre anında eşleştirilir.</p>
            </div>
            <Rev delay={120}>
              <div className="ecs-req2">
                <span className="ecs-req2__tag">{'Müşteri Talebi'.toLocaleUpperCase('tr-TR')}</span>
                <strong>{MATCH_REQUEST.rooms}</strong>
                <span>{MATCH_REQUEST.area}</span>
                <span>{MATCH_REQUEST.budget}</span>
                <span>{MATCH_REQUEST.notes}</span>
                <span className="ecs-req2__ic" aria-hidden="true">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /></svg>
                </span>
              </div>
            </Rev>
          </div>

          <svg className="ecs-eslesme__branch" viewBox="0 0 1200 90" preserveAspectRatio="none" aria-hidden="true">
            <path d="M780,0 C 780,55 200,30 200,90" />
            <path d="M790,0 C 790,60 600,40 600,90" />
            <path d="M800,0 C 800,55 1000,30 1000,90" />
          </svg>

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
        </div>
      </section>

      {/* ── SATIŞ OPERASYON MERKEZİ — üç tabletli ürün sahnesi ── */}
      <section id="operations" className="ecs ecs-ops">
        <div className="wrap ecs-ops__grid">
          <div className="ecs-scene__text">
            <span className="ecs__eye">{'Satış Operasyon Merkezi'.toLocaleUpperCase('tr-TR')}</span>
            <h2 className="ecs__h2">Tüm satış operasyonu. Tek yerde.</h2>
            <p className="ecs__p">Pipeline, portföy, talepler ve yapay zekâ asistanı tek akışta birleşir.</p>
          </div>

          <div className="ecs-ops__stage">
            <Rev delay={140}>
              <div className="ecs-tab ecs-tab--l" aria-hidden="true">
                <div className="ecs-tab__screen">
                  <header>Pipeline</header>
                  <div className="ecs-tab__chips"><i className="on">Tümü</i><i>Görüşme</i><i>Teklif</i></div>
                  {PIPE_ROWS.map((r, i) => (
                    <div className="ecs-tab__prow" key={r.n}>
                      <Avatar name={r.n} tone={i} />
                      <div><strong>{r.n}</strong><span>{r.v}</span></div>
                      <em>{r.st}</em>
                    </div>
                  ))}
                </div>
              </div>
            </Rev>
            <Rev delay={40}>
              <div className="ecs-tab ecs-tab--m" aria-hidden="true">
                <div className="ecs-tab__screen">
                  <header>Portföy</header>
                  <div className="ecs-tab__chips"><i className="on">Tümü</i><i>Daire</i><i>Residence</i><i>Villa</i></div>
                  {PROPERTIES.map(p => (
                    <div className="ecs-tab__frow" key={p.name}>
                      <img src={p.img} alt="" loading="lazy" />
                      <div><strong>{p.name}</strong><span>{p.rooms} · {p.area} m²</span></div>
                      <b>{p.price}</b>
                    </div>
                  ))}
                  <div className="ecs-tab__stats">
                    <div><strong>238</strong><span>aktif talep</span></div>
                    <div><strong>%24,6</strong><span>dönüşüm</span></div>
                    <div><strong>42</strong><span>kapanış</span></div>
                  </div>
                </div>
              </div>
            </Rev>
            <Rev delay={240}>
              <div className="ecs-tab ecs-tab--r" aria-hidden="true">
                <div className="ecs-tab__screen">
                  <header>AI Asistan</header>
                  <p className="ecs-tab__hi">Merhaba, Ece.<br />Bugün sizin için 12 aksiyon hazırladım.</p>
                  <div className="ecs-tab__ai">
                    <span>{'Öncelikli aksiyon'.toLocaleUpperCase('tr-TR')}</span>
                    <strong>Mert Yılmaz'ı ara</strong>
                    <em>Eşleşme %91</em>
                    <i aria-hidden="true">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></svg>
                    </i>
                  </div>
                  <p className="ecs-tab__note"><b>Piyasa özeti</b><br />Fulya bölgesinde fiyatlar %4,2 arttı.</p>
                  <div className="ecs-tab__mini">
                    <span>Bugünkü program</span>
                    <div><i style={{ height: '38%' }} /><i style={{ height: '62%' }} /><i style={{ height: '48%' }} /><i style={{ height: '84%' }} /><i style={{ height: '58%' }} /><i style={{ height: '70%' }} /></div>
                  </div>
                  <span className="ecs-tab__link">Raporu görüntüle →</span>
                </div>
              </div>
            </Rev>
          </div>
        </div>
      </section>

      {/* ── SAHADA DA AYNI GÜÇ — merkez telefon + iki açık yan kart ── */}
      <section id="field" className="ecs ecs-field-section">
        <div className="wrap ecs-field-grid">
          <div className="ecs-field-text">
            <span className="ecs__eye">{'Sahada yanında'.toLocaleUpperCase('tr-TR')}</span>
            <h2 className="ecs__h2">Sahada da aynı güç.</h2>
            <p className="ecs__p">Müşteri, portföy ve görevlerinize her yerden anında erişin.</p>
            <ul className="ecs-field-benefits">
              <li>Müşteri geçmişine sahada anında erişin</li>
              <li>Portföyü müşteriyle yerinde paylaşın</li>
              <li>Randevu ve notlar otomatik senkronlanır</li>
            </ul>
          </div>

          <div className="ecs-field-stage" ref={fieldStageRef}>
            <Rev delay={220}>
              <div className="ecs-pane ecs-pane--l" aria-hidden="true">
                <header>Müşteri</header>
                <div className="ecs-pane__who">
                  <Avatar name="Mert Yılmaz" tone={0} />
                  <div><strong>Mert Yılmaz</strong><span>Niyet skoru · 91</span></div>
                </div>
                <span className="ecs-pane__lbl">Eşleşme</span>
                <strong className="ecs-pane__big">%91</strong>
                <span className="ecs-pane__lbl">İlgili portföyler</span>
                <div className="ecs-pane__thumbs">
                  <img src="/screens/property-fulya.png" alt="" loading="lazy" />
                  <img src="/screens/property-nisantasi.png" alt="" loading="lazy" />
                </div>
              </div>
            </Rev>

            <Rev delay={300}>
              <div className="ecs-pane ecs-pane--r" aria-hidden="true">
                <header>Portföy</header>
                <img className="ecs-pane__photo" src="/screens/property-fulya.png" alt="" loading="lazy" />
                <strong className="ecs-pane__t">Fulya'da Lüks Residence</strong>
                <span className="ecs-pane__specs">3+1 · 185 m² · 2. Kat</span>
                <div className="ecs-pane__map">
                  <span className="ecs-pane__pin" />
                </div>
              </div>
            </Rev>

            <Rev delay={80}>
              <div className="ecs-phone ecs-phone--main">
                <div className="ecs-phone__screen ecs-mobile">
                  <div className="ecs-mobile__top">
                    <span className="ecs-mobile__hi">Merhaba, Ece 👋</span>
                    <span className="ecs-mobile__l">Bugün ara</span>
                    <div className="ecs-mobile__cta">
                      <strong>12</strong>
                      <span>önerilen kişi</span>
                      <i aria-hidden="true">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></svg>
                      </i>
                    </div>
                  </div>
                  <div className="ecs-mobile__body">
                    <span className="ecs-mobile__sec">Yaklaşan görüşler</span>
                    {[
                      { n: "Mert Yılmaz'ı ara", d: 'Fulya · 3+1', t: '15:30' },
                      { n: 'Zeynep Kaya ile görüş', d: 'Teklif', t: '14:30' },
                      { n: 'Portföy sunumu hazırla', d: 'Nişantaşı', t: '16:00' },
                    ].map((r, i) => (
                      <div className="ecs-mobile__row" key={r.n}>
                        <Avatar name={r.n} tone={i} />
                        <div><strong>{r.n}</strong><span>{r.d}</span></div>
                        <em>{r.t}</em>
                      </div>
                    ))}
                  </div>
                  <div className="ecs-mobile__tabs" aria-hidden="true">
                    {['Ana Sayfa', 'Prospekt', 'Portföy', 'Görevler', 'Ayarlar'].map((t, i) => (
                      <span key={t} className={i === 0 ? 'on' : ''}>
                        <i />
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Rev>
          </div>
        </div>
      </section>

      {/* ── YÖNETİM KONTROLÜ — canlı KPI + grafik kartları ── */}
      <section id="management" className="ecs ecs-mgmt-section">
        <div className="wrap" ref={dashRef}>
          <div className={`ecs-mgmt${dashInView ? ' ecs-mgmt--on' : ''}`}>
            <Rev>
              <div className="ecs-mgmt__kpis">
                {KPI.map((k, i) => (
                  <div className="ecs-kpi" key={k.l}>
                    <span>{k.l}</span>
                    <strong>{k.prefix}{kpiValues[i]}{k.suffix}</strong>
                    <em>{k.d}</em>
                  </div>
                ))}
              </div>
            </Rev>

            <div className="ecs-mgmt__grid">
              <div className="ecs-mgmt__text">
                <span className="ecs__eye">{'Yönetim Kontrolü'.toLocaleUpperCase('tr-TR')}</span>
                <h2 className="ecs__h2">Ekibin tamamı. Tek bakışta.</h2>
                <p className="ecs__p">Performans, hedefler ve gelir tek ekranda şeffaflaşır.</p>
                <button className="ecs-mgmt__link" onClick={demo}>Raporu görüntüle →</button>
              </div>

              <Rev delay={100}>
                <div className="ecs-chart ecs-chart--trend">
                  <header>Gelir Trendi</header>
                  <div className="ecs-chart__tip">Mayıs 2026<br /><b>₺24,6M</b></div>
                  <svg viewBox="0 0 320 130" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="ecsTrendFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#0B6B57" stopOpacity=".2" />
                        <stop offset="1" stopColor="#0B6B57" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path className="ecs-chart__area" d={trendPath.area} fill="url(#ecsTrendFill)" />
                    <path className="ecs-chart__line" d={trendPath.line} />
                    {trendPath.pts.map((p, i) => (
                      <circle key={i} cx={p[0]} cy={p[1]} r={i === TREND.length - 1 ? 4 : 2.6} className={i === TREND.length - 1 ? 'ecs-chart__dot ecs-chart__dot--hot' : 'ecs-chart__dot'} />
                    ))}
                  </svg>
                  <div className="ecs-chart__x"><span>Oca</span><span>Şub</span><span>Mar</span><span>Nis</span><span>May</span><span>Haz</span><span>Tem</span><span>Ağu</span></div>
                </div>
              </Rev>

              <Rev delay={180}>
                <div className="ecs-chart ecs-chart--team">
                  <header>Ekip Performansı</header>
                  {TEAM.map((m, i) => (
                    <div className="ecs-team" key={m.n}>
                      <Avatar name={m.n} tone={i} />
                      <div className="ecs-team__mid">
                        <strong>{m.n}</strong>
                        <i><b style={{ '--w': `${m.w}%`, transitionDelay: `${0.3 + i * 0.12}s` }} /></i>
                      </div>
                      <em>{m.v}</em>
                    </div>
                  ))}
                </div>
              </Rev>

              <Rev delay={140}>
                <div className="ecs-chart ecs-chart--tops">
                  <header>En iyi portföyler</header>
                  {TOPS.map((t, i) => (
                    <div className="ecs-top" key={t.n}>
                      <span>{i + 1}</span>
                      <strong>{t.n}</strong>
                      <em>{t.v}</em>
                    </div>
                  ))}
                </div>
              </Rev>

              <Rev delay={220}>
                <div className="ecs-chart ecs-chart--src">
                  <header>Taleplerin Kaynağı</header>
                  <div className="ecs-src">
                    <svg viewBox="0 0 90 90" className="ecs-src__donut">
                      {donut.map(s => (
                        <circle key={s.n} cx="45" cy="45" r="34" fill="none" stroke={s.c} strokeWidth="13"
                          strokeDasharray={s.dash} strokeDashoffset={s.off} transform="rotate(-90 45 45)" />
                      ))}
                    </svg>
                    <div className="ecs-src__legend">
                      {SOURCES.map(s => (
                        <div key={s.n}><i style={{ background: s.c }} /><span>{s.n}</span><em>%{s.pct}</em></div>
                      ))}
                    </div>
                  </div>
                </div>
              </Rev>
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
                  {p.best && <span className="eplan__tag">{'En çok tercih edilen — 10-25 danışmanlı ekipler için'.toLocaleUpperCase('tr-TR')}</span>}
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
              <span className="eeye">{'Sık sorulanlar'.toLocaleUpperCase('tr-TR')}</span>
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
              <div className="ecta__beams" aria-hidden="true"><i /><i /><i /></div>
              <div className="ecta__in">
                <span className="ecs-hero2__badge" style={{ marginBottom: '1.4rem' }}><span className="ecs-hero2__spark" aria-hidden="true">✦</span>EstateMatch AI</span>
                <h2 className="ecta__h">
                  Bir ekran değil.<br />Satış refleksi.
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
