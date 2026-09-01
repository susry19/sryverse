import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { usePageSeo, usePageSchema } from './pageParts.jsx'
import './EstateMatch.css'

/* ═══════════════════════════════════════════════════════════════
   ESTATEMATCH — İnsan ↔ Yer
   "EstateMatch mülk aramaz; insanlarla yerler arasındaki ilişkiyi anlar."

   Anlatı: kişi ve yer ayrı başlar → veri belirir → bağlam oluşur →
   ilişkiler görünür olur → karmaşıklık azalır → motor açığa çıkar →
   eylem mümkün olur → kişi ve yer bağlanır.

   Hareket sözlüğü: CONNECT · REVEAL · FLOW · RESOLVE · FOCUS ·
   FILTER · CONVERGE. Dekoratif hareket yok.
   ═══════════════════════════════════════════════════════════════ */

/* ── Görsel altyapısı (WebP + srcset) ── */
const PHOTO_W = {
  'property-fulya': [640, 1024, 1600],
  'property-nisantasi': [640, 1024],
  'property-macka': [640, 1024, 1600],
}
const photoSrc = name => {
  const ws = PHOTO_W[name] || [1024]
  return { src: `/screens/${name}-${ws.at(-1)}.webp`, srcSet: ws.map(w => `/screens/${name}-${w}.webp ${w}w`).join(', ') }
}
function Photo({ name, alt, sizes = '100vw', className, ratio = '16 / 10', eager = false }) {
  const { src, srcSet } = photoSrc(name)
  return (
    <img className={className} src={src} srcSet={srcSet} sizes={sizes} alt={alt}
      style={{ aspectRatio: ratio }} loading={eager ? 'eager' : 'lazy'} decoding={eager ? 'sync' : 'async'} />
  )
}

/* ── Veri: gerçek EstateMatch yeteneklerinden türetilmiş temsili senaryo ── */
const PERSON = {
  name: 'Fulya',
  context: ['İstanbul', 'Aile', 'Yatırım', 'Okula yakınlık', 'Yürünebilirlik', '≤ ₺18M'],
}
const PLACE = {
  name: 'Maçka Residence',
  photo: 'property-macka',
  meta: [
    ['41.0471° K', '28.9948° D'],
    ['142 m²', '2+1'],
    ['Okul', '7 dk'],
    ['Metro', '4 dk'],
  ],
  price: '₺17,8M',
}
const MATCH = '94,2'
const DIMENSIONS = [
  { k: 'Lokasyon', v: 98 },
  { k: 'Bütçe', v: 96 },
  { k: 'Yaşam biçimi', v: 91 },
  { k: 'Ulaşılabilirlik', v: 94 },
  { k: 'Yatırım potansiyeli', v: 89 },
]
const CONTEXT_LINKS = ['Lokasyon', 'Yaşam biçimi', 'Bütçe', 'Hareketlilik', 'Davranış', 'Niyet']
/* Geometri sahnesinin küçük ekran karşılığı: aynı ilişkiler, okunabilir satırlar */
const PAIRS = [
  ['İstanbul', 'Konum', 1], ['Aile', '2+1', .75], ['Yatırım', '₺17,8M', .95],
  ['Okula yakınlık', 'Okul 7 dk', .9], ['Yürünebilirlik', 'Metro 4 dk', .8], ['≤ ₺18M', '₺17,8M', 1],
]
const FUNNEL = ['106.722', '4.281', '326', '42', '3']

const ENGINE_IN = ['Müşteri bağlamı', 'Portföy verisi', 'Lokasyon', 'Davranış', 'Etkileşim geçmişi', 'Tercihler', 'Niyet']
const ENGINE_OUT = ['Eşleştirme', 'Sıralama', 'Öneri', 'Sonraki en iyi adım']

const FRAGMENTS = [
  'WhatsApp mesajı', 'İncelenen portföy', 'Bütçe değişikliği',
  'Bölge tercihi', 'Görüşme notu', 'Reddedilen ilan', 'Aile durumu',
]
const PORTFOLIO_UNITS = [
  { n: 'Maçka Residence', s: 94 }, { n: 'Nişantaşı Loft', s: 88 }, { n: 'Fulya Park', s: 81 },
  { n: 'Teşvikiye Apart', s: 64 }, { n: 'Bomonti Rezidans', s: 52 }, { n: 'Şişli Ofis', s: 31 },
]
const ACTIONS = [
  { a: 'Fulya’yı ara', w: 'Teklif aşamasında, 3 gündür yanıt yok' },
  { a: 'Maçka Residence’ı paylaş', w: '%94,2 eşleşme — henüz gönderilmedi' },
  { a: 'Yarın takip et', w: 'Zeynep K. ikinci görüşmeyi bekliyor' },
]
const CONVO = [
  { q: 'Son 30 gündür iletişim kurmadığım, satın alma ihtimali yüksek müşterileri göster.', a: '12 müşteri', d: 'Niyet skoru ≥ 80 · son temas > 30 gün' },
  { q: 'Maçka’daki yeni portföye uygun olanlar?', a: '3 müşteri', d: 'Bütçe, bölge ve yaşam biçimi uyumu' },
  { q: 'En güçlü eşleşmeyi göster.', a: 'Fulya · %94,2', d: 'Maçka Residence' },
  { q: 'İletişim önerisi hazırla.', a: 'Taslak hazır', d: 'Danışman onayına açık' },
]
const BEFORE_TOOLS = ['WhatsApp', 'Excel', 'CRM', 'Notlar', 'Aramalar', 'Hafıza', 'PDF’ler']
const AFTER_LAYERS = ['Müşteri', 'Portföy', 'Bağlam', 'Zekâ', 'Eylem']
const ENTERPRISE = [
  { h: 'Rol bazlı erişim', p: 'Danışman, yönetici ve acente rolleri; görünürlüğü yönetici belirler.' },
  { h: 'Veri sahipliği', p: 'Veriniz sizindir; istediğiniz an dışa aktarabilirsiniz.' },
  { h: 'İzlenebilirlik', p: 'Kritik aksiyonlar kim, ne zaman bilgisiyle kayıt altına alınır.' },
  { h: 'Veri izolasyonu', p: 'Her acentenin verisi diğerlerinden ayrı tutulur.' },
  { h: 'Entegrasyon', p: 'İlan platformlarından içe aktarım; mevcut CRM ile birlikte çalışabilir.' },
  { h: 'Ölçeklenebilir mimari', p: 'Ekip ve portföy büyüdükçe aynı sistem üzerinde ölçeklenir.' },
]

/* ── Yardımcılar ── */
const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v)
const seg = (p, a, b) => clamp01((p - a) / (b - a))
const isReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function useInView(threshold = 0.28) {
  const ref = useRef(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (isReduced()) { setOn(true); return }
    const io = new IntersectionObserver(e => { if (e[0].isIntersecting) { setOn(true); io.disconnect() } }, { threshold })
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])
  return [ref, on]
}

/* Uzun sahnelerde geçilen mesafeyi 0..1 verir (rAF ile, layout thrash yok) */
function useScrollProgress(ref) {
  const [p, setP] = useState(0)
  useEffect(() => {
    let raf = 0
    const measure = () => {
      raf = 0
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      setP(clamp01(-r.top / Math.max(1, el.offsetHeight - window.innerHeight)))
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure) }
    measure()
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', onScroll, { passive: true })
    return () => { removeEventListener('scroll', onScroll); removeEventListener('resize', onScroll); if (raf) cancelAnimationFrame(raf) }
  }, [ref])
  return p
}

function useCountUp(target, run, duration = 1200) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!run) return
    if (isReduced()) { setV(target); return }
    let raf = 0
    const t0 = performance.now()
    const tick = now => {
      const t = Math.min(1, (now - t0) / duration)
      setV(target * (1 - Math.pow(1 - t, 3)))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [run, target, duration])
  return v
}

/* Yalnızca opacity ile beliren sarmalayıcı — CLS yok */
function Reveal({ children, delay = 0, threshold = 0.2, className = '' }) {
  const [ref, on] = useInView(threshold)
  return (
    <div ref={ref} className={`em-rv${on ? ' is-on' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

/* ═══ ORTAM ALANI — "sistemin içinden geçen zekâ"
   Tek sabit katman; scroll ile çok yavaş ilerler, zekâ anlarında
   yoğunlaşır. Yalnızca transform + opacity. ═══ */
function AmbientField() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || isReduced()) return
    let raf = 0
    const zones = ['#geometry', '#complexity', '#match', '#engineering', '#intelligence']
    const measure = () => {
      raf = 0
      const vh = innerHeight
      const y = scrollY
      const doc = Math.max(1, document.body.scrollHeight - vh)
      // yoğunluk: zekâ sahnelerine yaklaştıkça artar
      let intensity = 0.28
      for (const s of zones) {
        const n = document.querySelector(s)
        if (!n) continue
        const r = n.getBoundingClientRect()
        const centre = r.top + r.height / 2 - vh / 2
        const near = 1 - clamp01(Math.abs(centre) / (vh * 1.15))
        if (near > intensity) intensity = near
      }
      el.style.setProperty('--amb-shift', `${(y / doc) * 46 - 23}%`)
      el.style.setProperty('--amb-i', (0.24 + intensity * 0.76).toFixed(3))
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure) }
    measure()
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', onScroll, { passive: true })
    return () => { removeEventListener('scroll', onScroll); removeEventListener('resize', onScroll); if (raf) cancelAnimationFrame(raf) }
  }, [])
  return <div className="em-ambient" ref={ref} aria-hidden="true" />
}

/* ═══ 01 · HERO — kişi → zekâ → yer, tek kompozisyon ═══ */
function HeroScene({ onDemo, onExplore }) {
  const [ref, on] = useInView(0.1)
  const [phase, setPhase] = useState(0) // 0 kişi · 1 tercihler · 2 yer · 3 nitelikler · 4 bağlantı · 5 skor
  useEffect(() => {
    if (!on) return
    if (isReduced()) { setPhase(5); return }
    const steps = [180, 620, 1120, 1600, 2050, 2500]
    const ts = steps.map((ms, i) => setTimeout(() => setPhase(i), ms))
    return () => ts.forEach(clearTimeout)
  }, [on])
  const score = useCountUp(94.2, phase >= 5, 1100)

  return (
    <section className="em-hero" ref={ref} data-phase={phase}>
      <div className="em-shell em-hero__in">
        <header className="em-hero__copy">
          <p className="em-eyebrow">EstateMatch <span>by SRYVERSE</span></p>
          <h1 className="em-hero__h1">Gayrimenkulde<br />doğru eşleşme.</h1>
          <p className="em-hero__lede">
            İnsanlar yer arar. Biz aradaki ilişkiyi arıyoruz.
          </p>
          <div className="em-hero__cta">
            <button className="em-btn em-btn--primary" onClick={onDemo}>Demo İste</button>
            <button className="em-btn em-btn--quiet" onClick={onExplore}>Ürünü Keşfet</button>
          </div>
        </header>

        <figure className="em-hero__scene" aria-label={`${PERSON.name} ile ${PLACE.name} arasında %${MATCH} eşleşme`}>
          {/* kişi */}
          <div className="em-node em-node--person">
            <span className="em-node__label">Kişi</span>
            <strong className="em-node__name">{PERSON.name}</strong>
            <span className="em-node__sub">İstanbul</span>
            <ul className="em-node__ctx">
              {PERSON.context.slice(1, 5).map((c, i) => (
                <li key={c} style={{ transitionDelay: `${i * 90}ms` }}>{c}</li>
              ))}
            </ul>
          </div>

          {/* zekâ */}
          <div className="em-link">
            <i className="em-link__wire em-link__wire--a" />
            <div className="em-link__score">
              <strong>{score.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}<em>%</em></strong>
              <span>eşleşme</span>
            </div>
            <i className="em-link__wire em-link__wire--b" />
          </div>

          {/* yer */}
          <div className="em-node em-node--place">
            <span className="em-node__label">Yer</span>
            <div className="em-node__photo">
              <Photo name={PLACE.photo} alt={`${PLACE.name} — temsili görsel`} ratio="4 / 3"
                sizes="(max-width: 900px) 88vw, 34vw" eager />
            </div>
            <strong className="em-node__name">{PLACE.name}</strong>
            <span className="em-node__sub">2+1 · 142 m² · {PLACE.price}</span>
          </div>
        </figure>
      </div>
    </section>
  )
}

/* ═══ 02 · ÜÇ PERDE — insanlar yer arar / yerler de veridir / bağlam ═══ */
function ChapterScene() {
  const wrap = useRef(null)
  const p = useScrollProgress(wrap)
  const red = useMemo(isReduced, [])
  const act = red ? 2 : p < 0.33 ? 0 : p < 0.66 ? 1 : 2

  const fade = (a, b, c, d) => red ? 1 : Math.min(seg(p, a, b), 1 - seg(p, c, d))

  return (
    <section id="chapters" className="em-chapters" ref={wrap}>
      <div className="em-chapters__stage">
        <div className="em-shell em-chapters__in">

          {/* perde 1 */}
          <div className="em-act" style={{ opacity: fade(0, 0.04, 0.28, 0.33) }} aria-hidden={act !== 0}>
            <h2 className="em-act__h">İnsanlar yer arar.</h2>
            <div className="em-person">
              <strong>{PERSON.name}</strong>
              <ul>
                {PERSON.context.map((c, i) => (
                  <li key={c} style={{ opacity: red ? 1 : seg(p, 0.06 + i * 0.026, 0.1 + i * 0.026) }}>{c}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* perde 2 */}
          <div className="em-act" style={{ opacity: fade(0.34, 0.39, 0.62, 0.67) }} aria-hidden={act !== 1}>
            <h2 className="em-act__h">Yerler de veridir.</h2>
            <div className="em-place">
              <div className="em-place__photo">
                <Photo name="property-nisantasi" alt="Nişantaşı’nda mimari — temsili görsel" ratio="3 / 2" sizes="(max-width: 900px) 88vw, 46vw" />
              </div>
              <dl className="em-place__meta">
                {PLACE.meta.map(([k, v], i) => (
                  <div key={k} style={{ opacity: red ? 1 : seg(p, 0.42 + i * 0.03, 0.47 + i * 0.03) }}>
                    <dt>{k}</dt><dd>{v}</dd>
                  </div>
                ))}
                <div style={{ opacity: red ? 1 : seg(p, 0.54, 0.58) }}>
                  <dt>Yatırım potansiyeli</dt><dd>Yüksek</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* perde 3 */}
          <div className="em-act em-act--ctx" style={{ opacity: fade(0.68, 0.73, 2, 3) }} aria-hidden={act !== 2}>
            <h2 className="em-act__h">
              Ama veri tek başına eşleşme yaratmaz.<br />
              <em>Bağlam yaratır.</em>
            </h2>
            <ul className="em-ctxlist">
              {CONTEXT_LINKS.map((c, i) => (
                <li key={c} style={{ opacity: red ? 1 : seg(p, 0.76 + i * 0.028, 0.8 + i * 0.028) }}>{c}</li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </section>
  )
}

/* ═══ 03 · THE GEOMETRY OF FIT ═══ */
function GeometryScene() {
  const [ref, on] = useInView(0.3)
  /* iki yay üzerinde düğümler; aralarında ağırlığı farklı ilişki çizgileri */
  const { left, right, links } = useMemo(() => {
    const L = PERSON.context.map((c, i) => {
      const t = (i / (PERSON.context.length - 1)) * Math.PI - Math.PI / 2
      return { c, x: 340 + Math.cos(t + Math.PI) * 82, y: 200 + Math.sin(t) * 152 }
    })
    const R = ['Konum', '142 m²', '2+1', 'Okul 7 dk', 'Metro 4 dk', '₺17,8M'].map((c, i) => {
      const t = (i / 5) * Math.PI - Math.PI / 2
      return { c, x: 660 - Math.cos(t + Math.PI) * 82, y: 200 + Math.sin(t) * 152 }
    })
    const pairs = [[0, 0, 1], [0, 3, .55], [1, 2, .75], [2, 5, .95], [3, 3, .9], [3, 4, .7], [4, 4, .8], [5, 5, 1], [1, 1, .5], [4, 0, .45]]
    return { left: L, right: R, links: pairs.map(([a, b, w]) => ({ a: L[a], b: R[b], w })) }
  }, [])

  return (
    <section id="geometry" className="em-geo" ref={ref}>
      <div className="em-shell">
        <div className="em-geo__head">
          <p className="em-kicker">The Geometry of Fit</p>
          <h2 className="em-h2">Uyum tek bir kriter değildir.</h2>
          <p className="em-lede">Birbirini anlamlı kılan ilişkilerin geometrisidir.</p>
        </div>

        {/* küçük ekran: aynı ilişkiler okunabilir satırlar hâlinde */}
        <ul className={`em-geo__pairs${on ? ' is-on' : ''}`}>
          {PAIRS.map((p, i) => (
            <li key={p[0]} style={{ '--w': p[2], transitionDelay: `${i * 90}ms` }}>
              <span>{p[0]}</span><i aria-hidden="true" /><span>{p[1]}</span>
            </li>
          ))}
        </ul>

        <div className={`em-geo__plot${on ? ' is-on' : ''}`} aria-hidden="true">
          <svg viewBox="0 0 1000 400" role="img" aria-label="Kişi nitelikleri ile yer nitelikleri arasındaki ilişki geometrisi">
            <g className="em-geo__links">
              {links.map((l, i) => (
                <line key={i} x1={l.a.x} y1={l.a.y} x2={l.b.x} y2={l.b.y}
                  strokeWidth={0.4 + l.w * 1.1} style={{ '--w': l.w, animationDelay: `${300 + i * 90}ms` }} />
              ))}
            </g>
            {[...left, ...right].map((n, i) => (
              <g key={i} className="em-geo__node" style={{ animationDelay: `${i * 70}ms` }}>
                <circle cx={n.x} cy={n.y} r="3.2" />
                <text x={n.x < 500 ? n.x - 14 : n.x + 14} y={n.y + 4} textAnchor={n.x < 500 ? 'end' : 'start'}>{n.c}</text>
              </g>
            ))}
            <text className="em-geo__axis" x="340" y="372" textAnchor="middle">KİŞİ</text>
            <text className="em-geo__axis" x="660" y="372" textAnchor="middle">YER</text>
          </svg>
        </div>
      </div>
    </section>
  )
}

/* ═══ 04 · KARMAŞIKLIK — 106.722 → 3 ═══ */
function ComplexityScene() {
  const wrap = useRef(null)
  const p = useScrollProgress(wrap)
  const red = useMemo(isReduced, [])
  const step = red ? FUNNEL.length - 1 : Math.min(FUNNEL.length - 1, Math.floor(seg(p, 0.34, 0.9) * FUNNEL.length))

  return (
    <section id="complexity" className="em-cx" ref={wrap}>
      <div className="em-cx__stage">
        <div className="em-shell em-cx__in">
          <div className="em-cx__eq" style={{ opacity: red ? 1 : Math.min(seg(p, 0, 0.05), 1 - seg(p, 0.3, 0.36)) }}>
            <div><strong>126</strong><span>aktif müşteri</span></div>
            <i aria-hidden="true">×</i>
            <div><strong>847</strong><span>portföy</span></div>
            <i aria-hidden="true">=</i>
            <div><strong>106.722</strong><span>olası ilişki</span></div>
          </div>

          <div className="em-cx__funnel" style={{ opacity: red ? 1 : seg(p, 0.32, 0.4) }}>
            <strong key={step} className={step === FUNNEL.length - 1 ? 'is-final' : ''}>{FUNNEL[step]}</strong>
            <span>{step === FUNNEL.length - 1 ? 'dikkatinize değer ilişki.' : 'ilişki değerlendiriliyor'}</span>
          </div>

          <p className="em-note" style={{ opacity: red ? 1 : seg(p, 0.9, 0.97) }}>
            Örnek operasyon senaryosu — gerçek müşteri verisi değildir.
          </p>
        </div>
      </div>
    </section>
  )
}

/* ═══ 05 · EŞLEŞME ANI + AÇIKLANABİLİR EŞLEŞTİRME ═══ */
function MatchScene() {
  const [ref, on] = useInView(0.3)
  const score = useCountUp(94.2, on, 1400)
  return (
    <section id="match" className="em-match" ref={ref}>
      <div className="em-shell em-match__in">
        <div className="em-match__visual">
          <Photo name={PLACE.photo} alt={`${PLACE.name} — temsili görsel`} ratio="4 / 3"
            sizes="(max-width: 900px) 88vw, 44vw" className="em-match__photo" />
          <div className="em-match__badge">
            <strong>{score.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}<em>%</em></strong>
            <span>eşleşme</span>
          </div>
        </div>

        <div className="em-match__body">
          <p className="em-kicker">Explainable Matching · Açıklanabilir eşleştirme</p>
          <h2 className="em-h2">{PLACE.name}</h2>
          <p className="em-lede">
            {PERSON.name} için değerlendirilen 847 portföy içinden en güçlü ilişki.
            Skor bir kutu değil: neyin neden uyduğu görünür.
          </p>

          <dl className={`em-dims${on ? ' is-on' : ''}`}>
            {DIMENSIONS.map((d, i) => (
              <div className="em-dim" key={d.k} style={{ '--v': d.v, '--i': i }}>
                <dt>{d.k}</dt>
                <dd>
                  <span className="em-dim__rail" aria-hidden="true"><i /></span>
                  <b>{d.v}</b>
                </dd>
              </div>
            ))}
          </dl>
          <p className="em-note">Temsili görsel ve örnek senaryo.</p>
        </div>
      </div>
    </section>
  )
}

/* ═══ 06 · MÜHENDİSLİK ═══ */
function EngineeringScene() {
  const [ref, on] = useInView(0.25)
  return (
    <section id="engineering" className="em-eng" ref={ref}>
      <div className="em-shell">
        <div className="em-eng__head">
          <p className="em-kicker">Şimdi, mühendislik</p>
          <h2 className="em-h2 em-h2--light">Veride saklı ilişkileri<br />mühendislikle görünür kılıyoruz.</h2>
        </div>

        <div className={`em-eng__sys${on ? ' is-on' : ''}`}>
          <div className="em-eng__col em-eng__col--in">
            <p className="em-lbl">Girdi</p>
            <ul>{ENGINE_IN.map((x, i) => <li key={x} style={{ transitionDelay: `${i * 70}ms` }}>{x}</li>)}</ul>
          </div>

          <div className="em-eng__core" aria-hidden="true">
            <span className="em-eng__ring" />
            <span className="em-eng__ring em-eng__ring--2" />
            <p>EstateMatch<br />Intelligence Engine</p>
          </div>

          <div className="em-eng__col em-eng__col--out">
            <p className="em-lbl">Çıktı</p>
            <ul>{ENGINE_OUT.map((x, i) => <li key={x} style={{ transitionDelay: `${400 + i * 90}ms` }}>{x}</li>)}</ul>
            <p className="em-eng__action">→ Eylem</p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ═══ 07 · YETENEKLER — her biri kendi görsel metaforuyla ═══ */
function MatchingIntelligence() {
  const [ref, on] = useInView(0.35)
  const dots = useMemo(() => Array.from({ length: 42 }, (_, i) => ({
    x: 8 + ((i * 37) % 92), y: 10 + ((i * 61) % 80), keep: [4, 17, 29].includes(i),
  })), [])
  return (
    <article className="em-cap" ref={ref}>
      <div className="em-cap__text">
        <p className="em-kicker">Matching Intelligence</p>
        <h3 className="em-h3">Daha fazlasını değil,<br />önemli olanı gösterir.</h3>
        <p className="em-body">Bir müşteri, yüzlerce portföy. EstateMatch ilgisiz olanı eler; geriye konuşmaya değer olanlar kalır.</p>
      </div>
      <div className={`em-cap__art em-swarm${on ? ' is-on' : ''}`} aria-hidden="true">
        {dots.map((d, i) => (
          <i key={i} className={d.keep ? 'is-keep' : ''} style={{ left: `${d.x}%`, top: `${d.y}%`, transitionDelay: `${(i % 12) * 45}ms` }} />
        ))}
      </div>
    </article>
  )
}

function CustomerIntelligence() {
  const [ref, on] = useInView(0.35)
  return (
    <article className="em-cap em-cap--rev" ref={ref}>
      <div className="em-cap__text">
        <p className="em-kicker">Customer Intelligence</p>
        <h3 className="em-h3">Dağınık bilgi,<br />tek bağlam olur.</h3>
        <p className="em-body">Mesaj, not, incelenen ilan, değişen bütçe — hepsi tek müşteri bağlamında birleşir. Sistem, tek tek akışların unuttuğunu hatırlar.</p>
      </div>
      <div className={`em-cap__art em-converge${on ? ' is-on' : ''}`} aria-hidden="true">
        {FRAGMENTS.map((f, i) => (
          <span key={f} style={{ '--i': i, '--n': FRAGMENTS.length, transitionDelay: `${i * 80}ms` }}>{f}</span>
        ))}
        <b>Müşteri bağlamı</b>
      </div>
    </article>
  )
}

function PortfolioIntelligence() {
  const [ref, on] = useInView(0.35)
  return (
    <article className="em-cap" ref={ref}>
      <div className="em-cap__text">
        <p className="em-kicker">Portfolio Intelligence</p>
        <h3 className="em-h3">Portföy bir depo değil,<br />canlı bir veri alanıdır.</h3>
        <p className="em-body">İlanlar talebe, uyuma ve hareketliliğe göre kendini düzenler. Hangi portföyün ilgi göreceği önceden görünür.</p>
      </div>
      <div className={`em-cap__art em-land${on ? ' is-on' : ''}`} aria-hidden="true">
        {PORTFOLIO_UNITS.map((u, i) => (
          <div key={u.n} style={{ '--s': u.s, transitionDelay: `${i * 90}ms` }}>
            <span>{u.n}</span><b>{u.s}</b>
          </div>
        ))}
      </div>
    </article>
  )
}

function NextBestAction() {
  const [ref, on] = useInView(0.35)
  return (
    <article className="em-cap em-cap--rev" ref={ref}>
      <div className="em-cap__text">
        <p className="em-kicker">Next Best Action</p>
        <h3 className="em-h3">“Ne uyuyor?” değil,<br />“şimdi ne yapmalıyım?”</h3>
        <p className="em-body">EstateMatch bir veri tabanı değil, karar desteğidir. Gün, yapılacak işle başlar — gerekçesiyle birlikte.</p>
      </div>
      <ol className={`em-cap__art em-actions${on ? ' is-on' : ''}`}>
        {ACTIONS.map((a, i) => (
          <li key={a.a} style={{ transitionDelay: `${i * 130}ms` }}>
            <strong>{a.a}</strong>
            <span>{a.w}</span>
          </li>
        ))}
      </ol>
    </article>
  )
}

/* ═══ 08 · ESTATE INTELLIGENCE (konuşma) ═══ */
function IntelligenceScene() {
  const [ref, on] = useInView(0.3)
  const red = useMemo(isReduced, [])
  const [turn, setTurn] = useState(red ? CONVO.length : 0)
  useEffect(() => {
    if (!on || red) return
    setTurn(0)
    const ts = CONVO.map((_, i) => setTimeout(() => setTurn(i + 1), 500 + i * 1150))
    return () => ts.forEach(clearTimeout)
  }, [on, red])

  return (
    <section id="intelligence" className="em-intel" ref={ref}>
      <div className="em-shell em-intel__in">
        <div className="em-intel__head">
          <p className="em-kicker">Estate Intelligence</p>
          <h2 className="em-h2 em-h2--light">Aramayın. Sorun.</h2>
          <p className="em-lede em-lede--light">
            Operasyonunuzu bilen bir sistemle konuşuyorsunuz — genel amaçlı bir sohbet robotuyla değil.
          </p>
        </div>
        <ol className="em-convo">
          {CONVO.map((c, i) => (
            <li key={c.q} className={turn > i ? 'is-on' : ''}>
              <p className="em-convo__q">{c.q}</p>
              <p className="em-convo__a"><strong>{c.a}</strong><span>{c.d}</span></p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ═══ 09 · İNSAN MOLASI ═══ */
function HumanInterlude() {
  return (
    <section className="em-human">
      <Photo name="property-fulya" alt="" ratio="16 / 9" sizes="100vw" className="em-human__bg" />
      <div className="em-human__veil" aria-hidden="true" />
      <div className="em-shell em-human__in">
        <Reveal>
          <h2 className="em-human__h">Çünkü kimse<br />filtrelerle hayal kurmaz.</h2>
        </Reveal>
        <Reveal delay={220}>
          <p className="em-human__p">İnsanlar metrekare aramaz. Orada anlam kazanacak bir hayat arar.</p>
        </Reveal>
      </div>
    </section>
  )
}

/* ═══ 10 · DÖNÜŞÜM + KURUMSAL HAFIZA ═══ */
function TransformationScene() {
  const wrap = useRef(null)
  const p = useScrollProgress(wrap)
  const red = useMemo(isReduced, [])
  const merge = red ? 1 : seg(p, 0.25, 0.68)

  return (
    <section id="transformation" className="em-tr" ref={wrap}>
      <div className="em-tr__stage">
        <div className="em-shell em-tr__in">
          <p className="em-kicker" style={{ opacity: red ? 1 : 1 - seg(p, 0.55, 0.7) }}>EstateMatch’ten önce</p>

          <div className="em-tr__field" style={{ '--merge': merge }}>
            {BEFORE_TOOLS.map((t, i) => (
              <span key={t} className="em-tr__tool" style={{ '--i': i, '--n': BEFORE_TOOLS.length }}>{t}</span>
            ))}
            <div className="em-tr__system" style={{ opacity: red ? 1 : seg(p, 0.6, 0.76) }}>
              {AFTER_LAYERS.map(l => <span key={l}>{l}</span>)}
            </div>
          </div>

          <div className="em-tr__msg" style={{ opacity: red ? 1 : seg(p, 0.74, 0.86) }}>
            <h2 className="em-h2">Aramaktan anlamaya.</h2>
            <p className="em-lede">
              Müşteri bilgisi tek tek danışmanlarda değil, kurumda birikir.
              Danışman değişir; bağlam kalır.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ═══ 11 · KURUMSAL ═══ */
function EnterpriseScene() {
  return (
    <section id="platform" className="em-ent">
      <div className="em-shell">
        <div className="em-ent__head">
          <p className="em-kicker">Platform</p>
          <h2 className="em-h2">Ekip için tasarlandı.<br />Kurum için kuruldu.</h2>
        </div>
        <div className="em-ent__grid">
          {ENTERPRISE.map((e, i) => (
            <Reveal key={e.h} delay={i * 60}>
              <div className="em-ent__cell">
                <h3>{e.h}</h3>
                <p>{e.p}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══ 12 · FİNAL — iki nokta birleşir ═══ */
function FinalScene({ onDemo, onFeatures }) {
  const [ref, on] = useInView(0.35)
  return (
    <section className="em-final" ref={ref}>
      <div className="em-shell em-final__in">
        <div className={`em-final__pair${on ? ' is-on' : ''}`} aria-hidden="true">
          <i className="em-final__dot" />
          <i className="em-final__line" />
          <i className="em-final__dot" />
        </div>
        <h2 className="em-final__h">Doğru yer,<br />hep oradaydı.</h2>
        <p className="em-final__p">EstateMatch bağlantıyı görünür kılar.</p>
        <div className="em-final__cta">
          <button className="em-btn em-btn--light" onClick={onDemo}>Demo Planla</button>
          <button className="em-btn em-btn--ghost" onClick={onFeatures}>Tüm özellikler</button>
        </div>
        <p className="em-final__sig">EstateMatch <span>by SRYVERSE</span></p>
      </div>
    </section>
  )
}

/* ═══════════════ SAYFA ═══════════════ */
const SEO_TITLE = 'EstateMatch AI | Yapay Zekâ Destekli Gayrimenkul CRM ve Eşleştirme Platformu'
const SEO_DESC = 'EstateMatch AI; emlak şirketlerinin müşterilerini, portföylerini, satış süreçlerini ve danışman performansını tek platformdan yönetmesini sağlayan yapay zekâ destekli gayrimenkul satış platformudur.'

export default function EstateMatchPage({ goBack, onDemo, onFeatures }) {
  usePageSeo({
    title: SEO_TITLE, description: SEO_DESC, path: '/estatematch',
    ogImage: 'https://sryverse.com/screens/property-macka-1600.webp',
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

  /* LCP görselini erkenden çöz */
  useEffect(() => {
    const { src, srcSet } = photoSrc(PLACE.photo)
    const l = document.createElement('link')
    l.rel = 'preload'; l.as = 'image'; l.href = src
    l.setAttribute('imagesrcset', srcSet)
    l.setAttribute('imagesizes', '(max-width: 900px) 88vw, 34vw')
    l.setAttribute('fetchpriority', 'high')
    document.head.appendChild(l)
    return () => l.remove()
  }, [])

  const demo = useCallback(() => { onDemo ? onDemo() : goBack?.() }, [onDemo, goBack])
  const explore = useCallback(() => {
    document.querySelector('#geometry')?.scrollIntoView({ behavior: isReduced() ? 'auto' : 'smooth' })
  }, [])

  return (
    <main className="em">
      <AmbientField />
      <HeroScene onDemo={demo} onExplore={explore} />
      <ChapterScene />
      <GeometryScene />
      <ComplexityScene />
      <MatchScene />
      <EngineeringScene />
      <div className="em-caps">
        <MatchingIntelligence />
        <CustomerIntelligence />
        <PortfolioIntelligence />
        <NextBestAction />
      </div>
      <IntelligenceScene />
      <HumanInterlude />
      <TransformationScene />
      <EnterpriseScene />
      <FinalScene onDemo={demo} onFeatures={onFeatures} />
    </main>
  )
}
