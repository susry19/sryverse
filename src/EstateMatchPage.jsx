import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Rev, usePageSeo, usePageSchema } from './pageParts.jsx'
import './ProductPage.css'
import './EstateCaseStudy.css'

/* ════════════════════════════════════════════════════════════
   ESTATEMATCH — hikâye akışlı, AI-öncelikli ürün sayfası.
   Anlatım sırası: Hero → "Bir müşteri geldi." → CRM değil →
   247/1/3 → Ürün turu → AI Asistan → Explore → Editorial →
   Değer → Kimler için + Güvenlik → Final CTA.
   ════════════════════════════════════════════════════════════ */

/* ── Hero: yüzen AI sonuç kartları ── */
const HERO_FLOATS = [
  { k: 'm1', pct: 94, t: 'Fulya Residence' },
  { k: 'm2', pct: 89, t: 'Nişantaşı Loft' },
]
const HERO_FLOW = ['Müşteri', 'AI Analizi', 'Akıllı Eşleşme', 'Takip', 'Satış']

/* ── "Bir müşteri geldi." hikâyesi ── */
const REQ_LINES = ['“Nişantaşı veya Fulya olabilir.', '2+1.', 'Modern bina.', 'Metroya yakın.', 'Maksimum 18 milyon.”']
const REQ_TAGS = [
  { k: 'LOCATION', v: 'Nişantaşı · Fulya' },
  { k: 'TYPE', v: '2+1' },
  { k: 'BUDGET', v: '≤ ₺18M' },
  { k: 'PRIORITY', v: 'Metro yakınlığı' },
]
const MATCH_REASONS = [
  { ok: true, t: 'Bütçe uyumu' },
  { ok: true, t: 'Bölge uyumu' },
  { ok: true, t: '2+1' },
  { ok: true, t: 'Metro 420 m' },
  { ok: true, t: 'Modern yapı' },
  { ok: false, t: 'Balkon tercihi karşılanmıyor' },
]

/* ── CRM değil — karar motoru ── */
const VS_ROWS = [
  { crm: 'müşteri saklar.', em: 'müşteriyi anlar.' },
  { crm: 'portföy saklar.', em: 'doğru portföyü bulur.' },
  { crm: 'aktivite kaydeder.', em: 'sonraki aksiyonu önerir.' },
]

/* ── Ürün turu — her ekranda tek mesaj ── */
const TOUR = [
  { key: 'panel',     tag: 'Panel',       img: '/screens/dashboard.png',         h: 'Günün fotoğrafı. Tek ekranda.',            p: 'Metrikler, aktivite ve AI öngörüleri — güne nereden başlayacağınız belli.' },
  { key: 'clients',   tag: 'Müşteriler',  img: '/screens/clients-list.png',      h: 'Kimi arayacağınızı AI önceliklendirir.',   p: 'Dönüşüm skoru ve niyet sinyalleri her gün yeniden hesaplanır.' },
  { key: 'matching',  tag: 'AI Matching', img: '/screens/ai-matches.png',        h: 'Talep girin. Eşleşmeler saniyeler içinde.', p: 'Her öneri gerekçesiyle gelir; karar danışmanda kalır.' },
  { key: 'portfolio', tag: 'Portföy',     img: '/screens/portfolio-grid.png',    h: 'Portföyünüz, AI skorlarıyla.',             p: 'Hangi ilan hangi müşteriye gider — bakışta görünür.' },
  { key: 'pipeline',  tag: 'Takip',       img: '/screens/pipeline-board.png',    h: "Lead'den satışa tek akış.",                p: 'Görüşme, teklif, kapanış — hiçbir fırsat arada kaybolmaz.' },
  { key: 'analytics', tag: 'Analytics',   img: '/screens/reports-dashboard.png', h: 'Yönetim, tek bakışta.',                    p: 'Ciro, huni ve danışman performansı şeffaflaşır.' },
]

/* ── AI Asistan demo senaryoları ── */
const CHATS = [
  {
    q: "Fulya'da 20 milyon altındaki yatırım müşterilerime uygun portföyleri göster.",
    a: '14 müşteri ve 8 uygun portföy buldum. En yüksek eşleşme: Fulya Residence — %94.',
    cards: [
      { pct: 94, t: 'Fulya Residence', s: '3+1 · ₺18,4M' },
      { pct: 87, t: 'Fulya Park Evleri', s: '2+1 · ₺16,9M' },
    ],
  },
  { q: 'Bu hafta takip etmem gereken müşteriler', a: '6 müşteri takip bekliyor. En kritik: Mert Yılmaz — teklif aşamasında, 3 gündür yanıtsız.' },
  { q: 'En iyi performans gösteren danışman', a: 'Bu ay: Ece Aydın — ₺41,2M ciro, %28 dönüşüm oranı.' },
  { q: '30 gündür işlem görmeyen portföyler', a: '11 portföy 30+ gündür hareketsiz. Üçü için fiyat güncellemesi önerdim.' },
  { q: 'Satış ihtimali yüksek müşteriler', a: '9 müşteri %80 üzeri satış ihtimalinde. İlk üçünü bugünkü arama listenize ekledim.' },
]

/* ── Explore modülleri ── */
const MODULES = [
  { k: 'AI Matching',          tr: 'Müşteri–portföy eşleştirme',      img: '/screens/ai-matches.png',
    how: 'Talep kriterleri yüzlerce portföyle karşılaştırılır; her eşleşme gerekçesiyle puanlanır.',
    who: 'Danışmanlar ve satış ekipleri', gain: 'Portföy arama dakikalardan saniyelere iner.' },
  { k: 'Portfolio Intelligence', tr: 'Portföy yönetimi ve analiz',    img: '/screens/portfolio.png',
    how: 'İlanlar AI skorları, hareketsizlik ve fiyat sinyalleriyle sürekli analiz edilir.',
    who: 'Danışmanlar ve broker’lar', gain: 'Hangi ilanın ilgi göreceğini önceden görürsünüz.' },
  { k: 'Client 360°',          tr: 'Tek ekranda müşteri geçmişi',     img: '/screens/match.png',
    how: 'Görüşmeler, tercihler, bütçe ve davranış sinyalleri tek profilde birleşir.',
    who: 'Tüm satış ekibi', gain: 'Müşteriyi aramadan önce her şeyi bilirsiniz.' },
  { k: 'AI Assistant',         tr: 'Doğal dille veri sorgulama',      img: '/screens/mobile-chatbot.png',
    how: 'Sorunuzu yazarsınız; asistan veriyi tarar, listeler ve aksiyon önerir.',
    who: 'Danışmanlar ve yöneticiler', gain: 'Rapor beklemek yerine sorup öğrenirsiniz.' },
  { k: 'Sales Pipeline',       tr: 'Lead → görüşme → satış',          img: '/screens/pipeline.png',
    how: 'Her fırsat aşamasıyla izlenir; AI bekleyen adımları hatırlatır.',
    who: 'Satış ekipleri', gain: 'Takipsiz kalan fırsat kalmaz.' },
  { k: 'Management Analytics', tr: 'Danışman ve ekip performansı',    img: '/screens/reports.png',
    how: 'Ciro, dönüşüm ve aktivite metrikleri gerçek zamanlı toplanır.',
    who: 'Yöneticiler ve acente sahipleri', gain: 'Ekibi veriye dayanarak yönetirsiniz.' },
]

/* ── Değer şeridi — rakam uydurmadan ── */
const VALUES = [
  { big: 'DAHA AZ',    t: 'manuel portföy arama' },
  { big: 'DAHA HIZLI', t: 'müşteri dönüşü' },
  { big: 'DAHA AKILLI', t: 'portföy önerileri' },
  { big: 'DAHA FAZLA', t: 'satış fırsatı' },
]

const BUILT_FOR = [
  { h: 'Danışmanlar',  p: 'Her sabah kimi arayacağınız ve hangi portföyü sunacağınız hazır.' },
  { h: 'Yöneticiler',  p: 'Ekip, huni ve ciro tek ekranda; kararlar veriyle alınır.' },
  { h: 'Acenteler',    p: 'Tüm ofis tek sistemde — bilgi danışmanla birlikte kaybolmaz.' },
]

/* ── Güvenlik ── */
const TRUST = [
  { h: 'Veri izolasyonu', p: 'Her acentenin verisi birbirinden tamamen izole tutulur.',
    ic: <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" /> },
  { h: 'Kişisel veri maskeleme', p: "İsim, telefon ve e-posta, AI'ye gönderilmeden önce maskelenir.",
    ic: <><path d="M3 12c2-4 6-6 9-6s7 2 9 6c-2 4-6 6-9 6s-7-2-9-6z" /><circle cx="12" cy="12" r="2.4" /><path d="M4 4l16 16" /></> },
  { h: 'Rol bazlı yetkilendirme', p: 'Kimin neyi göreceğini yönetici belirler.',
    ic: <><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></> },
  { h: 'Açıklanabilir öneriler', p: 'AI karar vermez; gerekçeli önerir. Onay her zaman danışmanda kalır.',
    ic: <><path d="M4 5h16v10H9l-5 4V5z" /><path d="M8 9h8M8 12h5" /></> },
  { h: 'İşlem kayıtları', p: 'Kim neyi ne zaman yaptı — her kritik aksiyon kayıt altında.',
    ic: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></> },
  { h: 'Veri taşınabilirliği', p: 'Verinizi istediğiniz an dışa aktarabilirsiniz; düzenli yedeklenir.',
    ic: <><path d="M12 3v12M7 10l5 5 5-5" /><path d="M4 21h16" /></> },
]

/* ════════════════ yardımcı kancalar ════════════════ */

const clamp01 = v => Math.min(1, Math.max(0, v))
const seg = (p, a, b) => clamp01((p - a) / (b - a))

function useReducedMotion() {
  return useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, [])
}

/* Uzun bir sarmalayıcının içinden geçilen mesafeyi 0..1 olarak verir */
function useScrollProgress(ref) {
  const [p, setP] = useState(0)
  useEffect(() => {
    let raf = 0
    const measure = () => {
      raf = 0
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const total = Math.max(1, el.offsetHeight - window.innerHeight)
      setP(clamp01(-r.top / total))
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(measure) }
    measure()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on, { passive: true })
    return () => {
      window.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [ref])
  return p
}

function useInView(threshold = 0.3) {
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

function useCountUp(target, inView, duration = 1200, decimals = 0) {
  const [value, setValue] = useState(0)
  const curRef = useRef(0)
  useEffect(() => {
    if (!inView) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { curRef.current = target; setValue(target); return }
    let raf = 0
    const from = curRef.current
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      const v = from + (target - from) * eased
      curRef.current = v
      setValue(v)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, target, duration])
  return value.toLocaleString('tr-TR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

/* Fare paralaksı — hover yok / hareket azaltılmışsa devre dışı */
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
    const onLeave = () => { next = restTransform; if (!raf) raf = requestAnimationFrame(flush) }
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

/* ════════════════ HERO ════════════════ */
function Hero({ goBack, onSeeMatch, onExplore }) {
  const compute = useCallback((px, py) => `perspective(2000px) rotateX(${8 - py * 5}deg) rotateY(${px * 6}deg)`, [])
  const { stageRef, targetRef } = useMouseTilt(compute, 'perspective(2000px) rotateX(8deg) rotateY(0deg)')
  const [flowStep, setFlowStep] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setFlowStep(s => (s + 1) % HERO_FLOW.length), 1800)
    return () => clearInterval(t)
  }, [])

  return (
    <section className="em-hero">
      <div className="em-hero__glow" aria-hidden="true" />
      <div className="em-wrap">
        <button className="em-crumb" onClick={goBack}>← Ana Sayfa</button>
        <div className="em-hero__center">
          <span className="em-eyebrow"><i aria-hidden="true">✦</i>EstateMatch <em>by SRYVERSE</em></span>
          <h1 className="em-hero__h1">Portföyünüzü değil,<br />doğru eşleşmeyi yönetin.</h1>
          <p className="em-hero__sub">
            Yapay zekâ müşterinizin beklentilerini analiz eder, yüzlerce portföy arasından
            en uygun seçenekleri saniyeler içinde bulur.
          </p>
          <div className="em-hero__ctas">
            <button className="em-btn em-btn--mint" onClick={onSeeMatch}>AI ile Eşleşmeyi Gör <span>→</span></button>
            <button className="em-btn em-btn--ghost" onClick={onExplore}>Ürünü Keşfet</button>
          </div>
          <div className="em-hero__flow" aria-label="Müşteriden satışa akış">
            {HERO_FLOW.map((s, i) => (
              <span key={s} className={i === flowStep ? 'on' : ''}>
                {s}{i < HERO_FLOW.length - 1 && <b aria-hidden="true">→</b>}
              </span>
            ))}
          </div>
        </div>

        <div className="em-hero__stage" ref={stageRef}>
          <Rev>
            <div className="em-shot" ref={targetRef}>
              <div className="em-shot__bar" aria-hidden="true"><i /><i /><i /></div>
              <img src="/screens/dashboard-main.png" alt="EstateMatch AI panel" />
            </div>
          </Rev>
          {HERO_FLOATS.map((f, i) => (
            <Rev key={f.k} delay={300 + i * 160}>
              <div className={`em-float em-float--${f.k}`}>
                <span className="em-float__pct">%{f.pct} MATCH</span>
                <strong>{f.t}</strong>
              </div>
            </Rev>
          ))}
          <Rev delay={640}>
            <div className="em-float em-float--insight">
              <span className="em-float__lbl">AI Insight</span>
              <p>Bu müşteri yatırım amaçlı portföylere <b>%31</b> daha fazla ilgi gösteriyor.</p>
            </div>
          </Rev>
        </div>
      </div>
    </section>
  )
}

/* ════════════════ "BİR MÜŞTERİ GELDİ." ════════════════ */
function Story() {
  const wrapRef = useRef(null)
  const p = useScrollProgress(wrapRef)
  const reduced = useReducedMotion()
  const [why, setWhy] = useState(false)

  const scanN = Math.round(247 * seg(p, 0.58, 0.72))
  const pct = Math.round(32 + 62 * seg(p, 0.76, 0.94))

  const layer = (a1, a2, b1, b2) => {
    const o = reduced ? 1 : Math.min(seg(p, a1, a2), 1 - seg(p, b1, b2))
    return { opacity: o, visibility: o < 0.02 ? 'hidden' : 'visible' }
  }

  if (reduced) {
    /* hareket azaltılmışsa: hikâye statik bloklar hâlinde akar */
    return (
      <section id="story" className="em-story em-story--static">
        <div className="em-wrap">
          <h2 className="em-story__title">Bir müşteri geldi.</h2>
          <div className="em-story__quote">{REQ_LINES.map(l => <p key={l}>{l}</p>)}</div>
          <div className="em-tags">{REQ_TAGS.map(t => <div key={t.k}><span>{t.k}</span><strong>{t.v}</strong></div>)}</div>
          <p className="em-scan__t">EstateMatch <b>247</b> portföyü taradı.</p>
          <StoryResult pct={94} why={why} setWhy={setWhy} />
        </div>
      </section>
    )
  }

  return (
    <section id="story" className="em-story" ref={wrapRef}>
      <div className="em-story__sticky">
        <div className="em-story__layer" style={layer(0, 0.05, 0.1, 0.16)}>
          <h2 className="em-story__title">Bir müşteri geldi.</h2>
        </div>

        <div className="em-story__layer" style={layer(0.13, 0.2, 0.38, 0.44)}>
          <div className="em-story__quote">
            {REQ_LINES.map((l, i) => (
              <p key={l} style={{ opacity: seg(p, 0.14 + i * 0.035, 0.18 + i * 0.035), transform: `translateY(${(1 - seg(p, 0.14 + i * 0.035, 0.18 + i * 0.035)) * 14}px)` }}>{l}</p>
            ))}
          </div>
        </div>

        <div className="em-story__layer" style={layer(0.42, 0.48, 0.55, 0.6)}>
          <span className="em-story__lbl">AI talebi ayrıştırıyor</span>
          <div className="em-tags">
            {REQ_TAGS.map((t, i) => (
              <div key={t.k} style={{ opacity: seg(p, 0.43 + i * 0.025, 0.47 + i * 0.025), transform: `translateY(${(1 - seg(p, 0.43 + i * 0.025, 0.47 + i * 0.025)) * 12}px)` }}>
                <span>{t.k}</span><strong>{t.v}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="em-story__layer" style={layer(0.57, 0.62, 0.7, 0.74)}>
          <div className="em-scan">
            <div className="em-scan__line" aria-hidden="true" />
            <p className="em-scan__t">EstateMatch <b>{scanN}</b> portföyü tarıyor<span className="em-scan__dots" aria-hidden="true" /></p>
          </div>
        </div>

        <div className="em-story__layer em-story__layer--result" style={{ ...layer(0.76, 0.84, 2, 3), pointerEvents: p > 0.76 ? 'auto' : 'none' }}>
          <StoryResult pct={pct} why={why} setWhy={setWhy} />
        </div>
      </div>
    </section>
  )
}

function StoryResult({ pct, why, setWhy }) {
  return (
    <div className="em-result">
      <div className="em-result__card">
        <div className="em-result__photo"><img src="/screens/property-fulya.png" alt="Fulya Residence — temsili görsel" loading="lazy" /></div>
        <div className="em-result__body">
          <span className="em-result__pct">%{pct}<em>MATCH</em></span>
          <strong>Fulya Residence</strong>
          <span className="em-result__s">2+1 · 146 m² · Metro 420 m</span>
          <button className="em-result__why" onClick={() => setWhy(w => !w)} aria-expanded={why}>
            Neden eşleşti? <b style={{ transform: why ? 'rotate(180deg)' : 'none' }}>▾</b>
          </button>
        </div>
      </div>
      <div className={`em-result__reasons${why ? ' on' : ''}`}>
        {MATCH_REASONS.map(r => (
          <span key={r.t} className={r.ok ? 'ok' : 'warn'}>{r.ok ? '✓' : '△'} {r.t}</span>
        ))}
      </div>
    </div>
  )
}

/* ════════════════ CRM DEĞİL ════════════════ */
function Vs() {
  return (
    <section className="em-vs em-light">
      <div className="em-wrap">
        <Rev>
          <span className="em-eyebrow em-eyebrow--dark"><i aria-hidden="true">✦</i>Pozisyon</span>
          <h2 className="em-h2">EstateMatch bir CRM değil.</h2>
          <p className="em-sub">Gayrimenkul satış ekipleri için yapay zekâ karar motoru.</p>
        </Rev>
        <div className="em-vs__rows">
          {VS_ROWS.map((r, i) => (
            <Rev key={r.crm} delay={i * 120}>
              <div className="em-vs__row">
                <div className="em-vs__crm"><span>CRM</span>{r.crm}</div>
                <b aria-hidden="true">→</b>
                <div className="em-vs__em"><span>EstateMatch</span>{r.em}</div>
              </div>
            </Rev>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ════════════════ 247 → 1 → 3 ════════════════ */
function Counts() {
  const [ref, on] = useInView(0.3)
  const n1 = useCountUp(247, on, 1400)
  const n3 = useCountUp(3, on, 900)
  return (
    <section className="em-counts" ref={ref}>
      <div className="em-wrap em-counts__in">
        <Rev><div className="em-count"><strong>{n1}</strong><span>portföy</span></div></Rev>
        <Rev delay={150}><div className="em-count"><strong>1</strong><span>müşteri</span></div></Rev>
        <Rev delay={280}>
          <div className="em-count em-count--hot">
            <i className="em-count__pulse" aria-hidden="true" />
            <strong>{n3}</strong><span>doğru eşleşme</span><em>saniyeler içinde</em>
          </div>
        </Rev>
        <Rev delay={420}><p className="em-counts__note">Portföy aramak yerine müşterinizle ilgilenin.</p></Rev>
      </div>
    </section>
  )
}

/* ════════════════ ÜRÜN TURU ════════════════ */
function Tour() {
  const wrapRef = useRef(null)
  const p = useScrollProgress(wrapRef)
  const reduced = useReducedMotion()
  const active = Math.min(TOUR.length - 1, Math.floor(p * TOUR.length))

  if (reduced) {
    return (
      <section id="tour" className="em-tour em-tour--static">
        <div className="em-wrap">
          <TourHead />
          {TOUR.map(t => (
            <figure key={t.key} className="em-tour__fig">
              <div className="em-shot"><img src={t.img} alt={`EstateMatch — ${t.tag}`} loading="lazy" /></div>
              <figcaption><b>{t.h}</b> {t.p}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section id="tour" className="em-tour" ref={wrapRef} style={{ height: `${TOUR.length * 100 + 60}vh` }}>
      <div className="em-tour__sticky">
        <TourHead />
        <div className="em-tour__screen">
          <div className="em-shot em-shot--tour">
            {TOUR.map((t, i) => (
              <img key={t.key} src={t.img} alt={`EstateMatch — ${t.tag}`} loading={i === 0 ? 'eager' : 'lazy'}
                style={{ opacity: i === active ? 1 : 0 }} />
            ))}
          </div>
          <div className="em-tour__cap" key={active}>
            <b>{TOUR[active].h}</b>
            <span>{TOUR[active].p}</span>
          </div>
        </div>
        <div className="em-tour__steps" role="list">
          {TOUR.map((t, i) => (
            <span key={t.key} role="listitem" className={i === active ? 'on' : i < active ? 'done' : ''}>{t.tag}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
function TourHead() {
  return (
    <div className="em-tour__head">
      <span className="em-eyebrow"><i aria-hidden="true">✦</i>Ürün</span>
      <div className="em-tour__flowline" aria-hidden="true">MÜŞTERİ → AI → EŞLEŞME → TAKİP → SATIŞ</div>
    </div>
  )
}

/* ════════════════ JUST ASK ESTATEMATCH ════════════════ */
function Ask() {
  const [ref, on] = useInView(0.35)
  const [sel, setSel] = useState(0)
  const [run, setRun] = useState(0)      // her seçimde animasyonu baştan oynat
  const [qLen, setQLen] = useState(0)
  const [phase, setPhase] = useState('idle') // idle → q → think → a → done
  const [aLen, setALen] = useState(0)
  const chat = CHATS[sel]
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!on) return
    if (reduced) { setQLen(chat.q.length); setALen(chat.a.length); setPhase('done'); return }
    setQLen(0); setALen(0); setPhase('q')
    const timers = []
    const qT = setInterval(() => {
      setQLen(v => {
        if (v >= chat.q.length) { clearInterval(qT); setPhase('think'); timers.push(setTimeout(() => setPhase('a'), 700)); return v }
        return v + 1
      })
    }, 24)
    timers.push(qT)
    return () => timers.forEach(t => { clearInterval(t); clearTimeout(t) })
  }, [on, sel, run, chat.q, reduced])

  useEffect(() => {
    if (phase !== 'a' || reduced) return
    const aT = setInterval(() => {
      setALen(v => {
        if (v >= chat.a.length) { clearInterval(aT); setPhase('done'); return v }
        return v + 1
      })
    }, 14)
    return () => clearInterval(aT)
  }, [phase, chat.a, reduced])

  const pick = (i) => { setSel(i); setRun(r => r + 1) }

  return (
    <section id="assistant" className="em-ask" ref={ref}>
      <div className="em-wrap">
        <Rev>
          <span className="em-eyebrow"><i aria-hidden="true">✦</i>AI Assistant</span>
          <h2 className="em-h2 em-h2--ivory">Just ask EstateMatch.</h2>
          <p className="em-sub em-sub--ivory">Rapor beklemeyin. Sorun, saniyeler içinde yanıt alın.</p>
        </Rev>
        <Rev delay={120}>
          <div className="em-chat">
            <div className="em-chat__head"><i aria-hidden="true" />EstateMatch AI Asistan</div>
            <div className="em-chat__body">
              <div className="em-chat__q">{chat.q.slice(0, qLen)}{phase === 'q' && <b className="em-caret" aria-hidden="true" />}</div>
              {phase === 'think' && <div className="em-chat__think" aria-label="yanıt hazırlanıyor"><i /><i /><i /></div>}
              {(phase === 'a' || phase === 'done') && (
                <div className="em-chat__a">
                  {chat.a.slice(0, aLen)}{phase === 'a' && <b className="em-caret" aria-hidden="true" />}
                  {phase === 'done' && chat.cards && (
                    <div className="em-chat__cards">
                      {chat.cards.map(c => (
                        <div key={c.t}><span>%{c.pct} MATCH</span><strong>{c.t}</strong><em>{c.s}</em></div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="em-chat__prompts">
              {CHATS.map((c, i) => (
                <button key={c.q} className={i === sel ? 'on' : ''} onClick={() => pick(i)}>{c.q}</button>
              ))}
            </div>
          </div>
        </Rev>
      </div>
    </section>
  )
}

/* ════════════════ EXPLORE THE PLATFORM ════════════════ */
function Explore() {
  const [open, setOpen] = useState(-1)
  const mod = open >= 0 ? MODULES[open] : null
  return (
    <section id="explore" className="em-explore em-light">
      <div className="em-wrap">
        <Rev>
          <span className="em-eyebrow em-eyebrow--dark"><i aria-hidden="true">✦</i>Explore</span>
          <h2 className="em-h2">Platformu keşfedin.</h2>
          <p className="em-sub">Altı modül, tek sistem. Detayı merak eden tıklasın — sayfadan çıkmadan.</p>
        </Rev>
        <div className="em-mods">
          {MODULES.map((m, i) => (
            <Rev key={m.k} delay={i * 70}>
              <button className={`em-mod${open === i ? ' em-mod--open' : ''}`} onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
                <div className="em-mod__prev" aria-hidden="true"><img src={m.img} alt="" loading="lazy" /></div>
                <strong lang="en">{m.k}</strong>
                <span>{m.tr}</span>
                <b aria-hidden="true">{open === i ? '−' : '+'}</b>
              </button>
            </Rev>
          ))}
        </div>
        {mod && (
          <div className="em-mod__detail" key={mod.k}>
            <div className="em-mod__shot"><img src={mod.img} alt={`${mod.k} ekranı`} loading="lazy" /></div>
            <div className="em-mod__info">
              <h3 lang="en">{mod.k}</h3>
              <dl>
                <dt>Nasıl çalışır?</dt><dd>{mod.how}</dd>
                <dt>Kim kullanır?</dt><dd>{mod.who}</dd>
                <dt>Ne kazandırır?</dt><dd>{mod.gain}</dd>
              </dl>
              <button className="em-mod__close" onClick={() => setOpen(-1)}>Kapat ✕</button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

/* ════════════════ EDITORIAL — lüks konut + minimal UI ════════════════ */
function Editorial() {
  const [ref, on] = useInView(0.35)
  const pct = useCountUp(94, on, 1400)
  return (
    <section className="em-edit" ref={ref}>
      <img className="em-edit__photo" src="/screens/property-nisantasi.png" alt="Nişantaşı'nda modern bina — temsili görsel" loading="lazy" />
      <div className="em-edit__veil" aria-hidden="true" />
      <div className="em-wrap em-edit__in">
        <div className="em-edit__meta">
          <span className="em-edit__loc">Nişantaşı</span>
          <strong className="em-edit__price">₺17.850.000</strong>
          <span className="em-edit__spec">2+1 · 146 m²</span>
          <span className="em-edit__note">Temsili görsel</span>
        </div>
        <div className={`em-edit__match${on ? ' on' : ''}`}>
          <span>%{pct}</span> MATCH
        </div>
      </div>
    </section>
  )
}

/* ════════════════ DEĞER + KİMLER İÇİN + GÜVENLİK ════════════════ */
function Value() {
  return (
    <section className="em-value em-light">
      <div className="em-wrap">
        <div className="em-value__grid">
          {VALUES.map((v, i) => (
            <Rev key={v.big} delay={i * 90}>
              <div className="em-value__cell"><strong>{v.big}</strong><span>{v.t}</span></div>
            </Rev>
          ))}
        </div>
        <Rev delay={300}>
          <p className="em-value__note">Rakamlar mı? Uydurmuyoruz — lansmanla birlikte bu alanlar gerçek kullanım verisiyle ölçülür.</p>
        </Rev>
      </div>
    </section>
  )
}

function Secure() {
  return (
    <section id="security" className="em-secure">
      <div className="em-wrap">
        <Rev>
          <span className="em-eyebrow"><i aria-hidden="true">✦</i>Kimler için · Güvenlik</span>
          <h2 className="em-h2 em-h2--ivory">Ekip için kuruldu.<br />Kurum için güvenli.</h2>
        </Rev>
        <div className="em-built">
          {BUILT_FOR.map((b, i) => (
            <Rev key={b.h} delay={i * 100}>
              <div className="em-built__c"><h3>{b.h}</h3><p>{b.p}</p></div>
            </Rev>
          ))}
        </div>
        <div className="em-trust">
          {TRUST.map((t, i) => (
            <Rev key={t.h} delay={i * 60}>
              <div className="em-trust__c">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{t.ic}</svg>
                <h4>{t.h}</h4>
                <p>{t.p}</p>
              </div>
            </Rev>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ════════════════ FİNAL — eşleşme ağı ════════════════ */
function NetworkBg() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = canvas.getContext('2d')
    let raf = 0, running = false, w = 0, h = 0
    const nodes = Array.from({ length: 26 }, () => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00035, vy: (Math.random() - 0.5) * 0.00035,
      r: Math.random() * 1.6 + 1,
    }))
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = rect.width; h = rect.height
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const draw = () => {
      raf = 0
      ctx.clearRect(0, 0, w, h)
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy
        if (n.x < 0 || n.x > 1) n.vx *= -1
        if (n.y < 0 || n.y > 1) n.vy *= -1
      }
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = (nodes[i].x - nodes[j].x) * w
          const dy = (nodes[i].y - nodes[j].y) * h
          const d = Math.hypot(dx, dy)
          if (d < 170) {
            ctx.beginPath()
            ctx.moveTo(nodes[i].x * w, nodes[i].y * h)
            ctx.lineTo(nodes[j].x * w, nodes[j].y * h)
            ctx.strokeStyle = `rgba(159, 214, 183, ${0.14 * (1 - d / 170)})`
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
      }
      for (const n of nodes) {
        ctx.beginPath()
        ctx.arc(n.x * w, n.y * h, n.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(159, 214, 183, .35)'
        ctx.fill()
      }
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
  return <canvas ref={canvasRef} className="em-final__net" aria-hidden="true" />
}

function Final({ demo }) {
  return (
    <section className="em-final">
      <NetworkBg />
      <div className="em-wrap em-final__in">
        <Rev>
          <h2 className="em-final__h">
            Sıradaki eşleşme,<br />belki de çoktan<br /><em>portföyünüzde.</em>
          </h2>
        </Rev>
        <Rev delay={140}>
          <p className="em-final__sub">EstateMatch onu bulsun.</p>
        </Rev>
        <Rev delay={220}>
          <div className="em-final__row">
            <button className="em-btn em-btn--ivory" onClick={demo}>Demo Planla <span>→</span></button>
            <a className="em-btn em-btn--ghost" href="https://wa.me/905315178170?text=Merhaba%2C%20EstateMatch%20AI%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum." target="_blank" rel="noopener noreferrer">
              WhatsApp'tan yazın <span>→</span>
            </a>
          </div>
        </Rev>
        <Rev delay={300}>
          <p className="em-final__trust">Kendi verinizi paylaşmanız gerekmez · Kurulum ve ekip eğitimi dahildir</p>
        </Rev>
      </div>
    </section>
  )
}

/* ════════════════ SAYFA ════════════════ */
const SEO_TITLE = 'EstateMatch AI | Gayrimenkul Satış Ekipleri için AI Karar Motoru'
const SEO_DESC = 'EstateMatch bir CRM değil: yapay zekâ müşteriyi analiz eder, portföyü tarar ve en doğru gayrimenkulleri saniyeler içinde eşleştirir.'

export default function EstateMatchPage({ goBack, onDemo }) {
  const [progress, setProgress] = useState(0)

  usePageSeo({
    title: SEO_TITLE,
    description: SEO_DESC,
    path: '/estatematch',
    ogImage: 'https://sryverse.com/screens/dashboard-main.png',
  })
  const schema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'EstateMatch AI',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: SEO_DESC,
    url: 'https://sryverse.com/estatematch',
    publisher: { '@type': 'Organization', name: 'SRYVERSE' },
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

  const demo = useCallback(() => { onDemo ? onDemo() : goBack?.() }, [onDemo, goBack])
  const goTo = useCallback((sel) => { document.querySelector(sel)?.scrollIntoView({ behavior: 'smooth' }) }, [])

  return (
    <main className="epage epage--estate em-page">
      <div className="epage__progress" style={{ width: `${progress}%` }} />
      <Hero goBack={goBack} onSeeMatch={() => goTo('#story')} onExplore={() => goTo('#tour')} />
      <Story />
      <Vs />
      <Counts />
      <Tour />
      <Ask />
      <Explore />
      <Editorial />
      <Value />
      <Secure />
      <Final demo={demo} />
    </main>
  )
}
