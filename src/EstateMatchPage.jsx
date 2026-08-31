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

/* ── Hero: 3 katman — arka dashboard, orta ürün kartları, ön AI sonuçları ── */
const HERO_FLOW = ['Müşteri', 'AI Analizi', 'Akıllı Eşleşme', 'Takip', 'Satış']
const HERO_PROOF = ['Çok kullanıcılı', 'Rol bazlı erişim', 'Güvenli', 'Bulut tabanlı', 'AI destekli', 'Ölçeklenebilir']

/* ── "Bir müşteri geldi." hikâyesi ── */
const REQ_TEXT = 'Nişantaşı veya Fulya düşünüyorum. 2+1 olsun. Yeni bina tercih ederim. 20 milyonu geçmesin.'
const REQ_TAGS = [
  { k: 'LOCATION', v: 'Nişantaşı · Fulya' },
  { k: 'PROPERTY', v: '2+1' },
  { k: 'BUDGET', v: '≤ ₺20M' },
  { k: 'PREFERENCE', v: 'Yeni bina' },
]
const SCAN_SEQ = [247, 182, 61, 12, 3]
const MATCH_CHECKS = ['Bütçe', 'Konum', 'Oda tipi', 'Bina yaşı', 'Ulaşım']

/* ── CRM değil — karar motoru ── */
const VS_ROWS = [
  { crm: 'müşteri saklar.', em: 'müşteriyi anlar.' },
  { crm: 'portföy saklar.', em: 'doğru portföyü bulur.' },
  { crm: 'aktivite kaydeder.', em: 'sonraki aksiyonu önerir.' },
]

/* ── Ürün turu — PROBLEM → AKSİYON → SONUÇ; her ekranda tek mesaj ── */
const TOUR = [
  { key: 'panel',     tag: 'Panel',       img: '/screens/dashboard.png',         h: 'Güne "bugün ne yapsam?" diye başlamayın.',  p: 'Metrikler, aktivite ve AI öngörüleri tek ekranda — öncelikleriniz hazır.' },
  { key: 'clients',   tag: 'Müşteriler',  img: '/screens/clients-list.png',      h: 'Kimi arayacağınızı tahmin etmeyin.',        p: 'AI, dönüşüm ihtimaline göre arama listenizi her sabah yeniler.' },
  { key: 'matching',  tag: 'AI Matching', img: '/screens/ai-matches.png',        h: '200 portföyü elle taramayın.',              p: 'Talebi girin — en güçlü adaylar gerekçeleriyle saniyeler içinde önünüzde.' },
  { key: 'portfolio', tag: 'Portföy',     img: '/screens/portfolio-grid.png',    h: 'Hangi ilan kime gider — tahmin işi değil.', p: 'Portföyünüz AI skorlarıyla sürekli analizde; talep görmeyen ilan uyarır.' },
  { key: 'pipeline',  tag: 'Takip',       img: '/screens/pipeline-board.png',    h: 'Fırsatlar arada kaybolmasın.',              p: "Lead'den satışa her adım tek akışta; AI bekleyen adımı hatırlatır." },
  { key: 'analytics', tag: 'Analytics',   img: '/screens/reports-dashboard.png', h: 'Ay sonu raporunu beklemeyin.',              p: 'Ciro, huni ve danışman performansı gerçek zamanlı şeffaf.' },
]

/* ── Ekosistem: tek zekâ katmanı ── */
const LAYER_NODES = [
  { k: 'client',    t: 'CLIENT',    x: 120, y: 70 },
  { k: 'match',     t: 'MATCH',     x: 300, y: 42 },
  { k: 'portfolio', t: 'PORTFOLIO', x: 480, y: 70 },
  { k: 'pipeline',  t: 'PIPELINE',  x: 300, y: 306 },
  { k: 'analytics', t: 'ANALYTICS', x: 300, y: 384 },
]

/* ── AI Asistan: 3 perdelik canlı demo — sorgu → liste → sırala → eşleştir ── */
const ASK_CLIENTS = [
  { id: 'mert',  n: 'Mert Yılmaz',  s: 'Teklif aşaması',      prob: 86, match: '%94 · Fulya Residence' },
  { id: 'zey',   n: 'Zeynep Kaya',  s: '2. görüşme planlandı', prob: 74, match: '%88 · Nişantaşı Loft' },
  { id: 'ahmet', n: 'Ahmet Özgen',  s: '5 portföy inceledi',   prob: 91, match: '%90 · Maçka Panorama' },
  { id: 'seval', n: 'Seval Öztürk', s: 'Kredi onayı aldı',     prob: 68, match: '%82 · Fulya Park' },
]
const ASK_ACTS = [
  { q: 'Bu hafta takip etmem gereken müşterileri göster.', a: '12 müşteri buldum. En kritik dördü:' },
  { q: 'Satış ihtimali en yüksek olanları sırala.',        a: 'Satış ihtimaline göre sıralandı.' },
  { q: 'Uygun portföylerini getir.',                       a: 'Her müşteri için en güçlü eşleşme:' },
]

/* ── Explore modülleri — bento düzeni: 2 büyük sahne + 4 kompakt kart ── */
const MODULES = [
  { k: 'AI Matching', size: 'big', area: 'm0', tr: '200 portföy arasında manuel arama yapmayın.', img: '/screens/ai-matches.png',
    how: 'Talep kriterleri yüzlerce portföyle karşılaştırılır; her eşleşme gerekçesiyle puanlanır.',
    who: 'Danışmanlar ve satış ekipleri', gain: 'Portföy arama dakikalardan saniyelere iner.',
    steps: ['Müşteri profili', 'Tercih analizi', 'Portföy filtreleme', 'AI skorlama', 'Açıklanabilir eşleşme', 'Öneri'] },
  { k: 'Client 360°', area: 'm1', tr: 'Tek ekranda müşteri geçmişi', img: '/screens/match.png',
    how: 'Görüşmeler, tercihler, bütçe ve davranış sinyalleri tek profilde birleşir.',
    who: 'Tüm satış ekibi', gain: 'Müşteriyi aramadan önce her şeyi bilirsiniz.' },
  { k: 'Management Analytics', area: 'm2', tr: 'Danışman ve ekip performansı', img: '/screens/reports.png',
    how: 'Ciro, dönüşüm ve aktivite metrikleri gerçek zamanlı toplanır.',
    who: 'Yöneticiler ve acente sahipleri', gain: 'Ekibi veriye dayanarak yönetirsiniz.' },
  { k: 'AI Assistant', size: 'big', area: 'm3', tr: 'Rapor beklemeyin; doğal dille sorun.', img: '/screens/mobile-chatbot.png',
    how: 'Sorunuzu yazarsınız; asistan veriyi tarar, listeler ve aksiyon önerir.',
    who: 'Danışmanlar ve yöneticiler', gain: 'Rapor beklemek yerine sorup öğrenirsiniz.' },
  { k: 'Portfolio Intelligence', area: 'm4', tr: 'Portföy yönetimi ve analiz', img: '/screens/portfolio.png',
    how: 'İlanlar AI skorları, hareketsizlik ve fiyat sinyalleriyle sürekli analiz edilir.',
    who: 'Danışmanlar ve broker’lar', gain: 'Hangi ilanın ilgi göreceğini önceden görürsünüz.' },
  { k: 'Sales Pipeline', area: 'm5', tr: 'Lead → görüşme → satış', img: '/screens/pipeline.png',
    how: 'Her fırsat aşamasıyla izlenir; AI bekleyen adımları hatırlatır.',
    who: 'Satış ekipleri', gain: 'Takipsiz kalan fırsat kalmaz.' },
]

/* ── Derine inmek isteyenler için teknik başlıklar ── */
const TECH = [
  { h: 'Eşleştirme metodolojisi', p: 'Kriter ağırlıklama + davranış sinyalleri; her skorun gerekçesi görülebilir.' },
  { h: 'Rol bazlı erişim (RBAC)', p: 'Danışman, yönetici ve acente rolleri; görünürlük yöneticinin elinde.' },
  { h: 'Multi-tenant mimari', p: 'Her acentenin verisi ayrı; izolasyon altyapı seviyesinde.' },
  { h: 'Veri yapısı', p: 'Müşteri, portföy ve aktivite tek modelde ilişkilendirilir; dışa aktarılabilir.' },
  { h: 'Güvenlik', p: 'Maskeleme, işlem kayıtları ve düzenli yedekleme standarttır.' },
  { h: 'Entegrasyonlar', p: 'İlan platformlarından içe aktarım; CRM ile birlikte veya yerine çalışır.' },
]

/* ── Kişiye göre değer önerisi ── */
const WHO = [
  { h: 'Danışmanlar', big: 'Daha az arayın.\nDaha çok satın.', lines: ['Müşterinizi girin.', 'EstateMatch uygun portföyleri bulsun.', 'Takiplerinizi yönetsin.'] },
  { h: 'Yöneticiler', big: 'Tüm operasyonu\ngörün.', lines: ['Hangi danışman aktif?', 'Hangi müşteri bekliyor?', 'Hangi portföy hareketsiz?', 'Fırsatlar nerede?'] },
  { h: 'Acenteler', big: 'Tek işletim\nsistemi.', lines: ['Müşteri. Portföy. Danışman.', 'Satış. AI.', 'Tek platform.'] },
]

/* ── Değer şeridi — rakam uydurmadan ── */
const VALUES = [
  { big: 'DAHA AZ',    t: 'manuel portföy arama' },
  { big: 'DAHA HIZLI', t: 'müşteri dönüşü' },
  { big: 'DAHA AKILLI', t: 'portföy önerileri' },
  { big: 'DAHA FAZLA', t: 'satış fırsatı' },
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

/* ════════════════ HERO ════════════════ */
function Hero({ goBack, onSeeStory, demo }) {
  const stageRef = useRef(null)
  const [flowStep, setFlowStep] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setFlowStep(s => (s + 1) % HERO_FLOW.length), 1800)
    return () => clearInterval(t)
  }, [])

  /* 3 katmanlı paralaks: --px/--py değişkenleri katmanlara farklı hızda uygulanır */
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    if (window.matchMedia('(hover: none), (prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    let next = null
    const flush = () => {
      raf = 0
      if (!next) return
      stage.style.setProperty('--px', next.x)
      stage.style.setProperty('--py', next.y)
    }
    const onMove = (e) => {
      const r = stage.getBoundingClientRect()
      next = { x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 }
      if (!raf) raf = requestAnimationFrame(flush)
    }
    const onLeave = () => { next = { x: 0, y: 0 }; if (!raf) raf = requestAnimationFrame(flush) }
    stage.style.setProperty('--px', 0)
    stage.style.setProperty('--py', 0)
    stage.addEventListener('mousemove', onMove)
    stage.addEventListener('mouseleave', onLeave)
    return () => {
      stage.removeEventListener('mousemove', onMove)
      stage.removeEventListener('mouseleave', onLeave)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <section className="em-hero">
      <div className="em-hero__glow" aria-hidden="true" />
      <div className="em-wrap">
        <button className="em-crumb" onClick={goBack}>← Ana Sayfa</button>
        <div className="em-hero__center">
          <span className="em-eyebrow"><i aria-hidden="true">✦</i>EstateMatch <em>by SRYVERSE</em></span>
          <h1 className="em-hero__h1">Gayrimenkulde doğru eşleşme,<br />artık tesadüf değil.</h1>
          <p className="em-hero__sub">
            Müşteriyi anlayan, portföyü tarayan ve satış ekibine
            sonraki en doğru adımı gösteren yapay zekâ.
          </p>
          <div className="em-hero__ctas">
            <button className="em-btn em-btn--mint" onClick={demo}>Demo İste <span>→</span></button>
            <button className="em-btn em-btn--ghost" onClick={onSeeStory}>Ürünü Keşfet <span>↓</span></button>
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
          {/* katman 1 — dashboard */}
          <Rev>
            <div className="em-shot em-hero__back">
              <div className="em-shot__bar" aria-hidden="true"><i /><i /><i /></div>
              <img src="/screens/dashboard-main.png" alt="EstateMatch AI panel" />
            </div>
          </Rev>
          {/* katman 2 — ürün kartları (müşteri + portföy) */}
          <Rev delay={220}>
            <div className="em-mini em-mini--client em-hero__mid">
              <span className="em-mini__lbl">Müşteri</span>
              <div className="em-mini__row">
                <i className="em-mini__ava" aria-hidden="true">MY</i>
                <div><strong>Mert Yılmaz</strong><span>Niyet skoru · 91</span></div>
              </div>
            </div>
          </Rev>
          <Rev delay={340}>
            <div className="em-mini em-mini--prop em-hero__mid">
              <span className="em-mini__lbl">Portföy</span>
              <img src="/screens/property-fulya.png" alt="" loading="lazy" />
              <div><strong>Fulya Residence</strong><span>2+1 · ₺18,4M</span></div>
            </div>
          </Rev>
          {/* katman 3 — AI sonuçları */}
          <Rev delay={480}>
            <div className="em-float em-float--m1 em-hero__front">
              <span className="em-float__pct">%94 MATCH</span>
              <strong>Fulya Residence</strong>
            </div>
          </Rev>
          <Rev delay={620}>
            <div className="em-float em-float--insight em-hero__front">
              <span className="em-float__lbl">AI Insight</span>
              <p>Bu müşteri yatırım amaçlı portföylere <b>%31</b> daha fazla ilgi gösteriyor.</p>
            </div>
          </Rev>
        </div>

        <Rev delay={300}>
          <div className="em-proof">
            <span className="em-proof__t">Gerçek emlak operasyonu için kuruldu</span>
            <div className="em-proof__chips">
              {HERO_PROOF.map(c => <span key={c}>{c}</span>)}
            </div>
          </div>
        </Rev>
      </div>
    </section>
  )
}

/* ════════════════ "BİR MÜŞTERİ GELDİ." ════════════════ */
function Story({ demo }) {
  const wrapRef = useRef(null)
  const p = useScrollProgress(wrapRef)
  const reduced = useReducedMotion()

  const scanIdx = Math.min(SCAN_SEQ.length - 1, Math.floor(seg(p, 0.56, 0.72) * SCAN_SEQ.length))
  const pct = Math.round(32 + 62 * seg(p, 0.75, 0.92))
  const resultOn = p > 0.75

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
          <div className="em-bubble"><i aria-hidden="true">M</i><p>{REQ_TEXT}</p></div>
          <div className="em-tags">{REQ_TAGS.map(t => <div key={t.k}><span>{t.k}</span><strong>{t.v}</strong></div>)}</div>
          <p className="em-scan__t"><b>247</b> portföy tarandı → <b>3</b> eşleşme.</p>
          <StoryResult pct={94} on demo={demo} />
        </div>
      </section>
    )
  }

  return (
    <section id="story" className="em-story" ref={wrapRef}>
      <div className="em-story__sticky">
        <div className="em-story__layer" style={layer(0, 0.05, 0.1, 0.15)}>
          <h2 className="em-story__title">Bir müşteri geldi.</h2>
        </div>

        {/* müşteri mesaj balonu + AI pulse */}
        <div className="em-story__layer" style={layer(0.13, 0.19, 0.4, 0.45)}>
          <div className="em-bubble" style={{ transform: `translateY(${(1 - seg(p, 0.13, 0.19)) * 18}px)` }}>
            <i aria-hidden="true">M</i>
            <p>{REQ_TEXT}</p>
          </div>
          <div className="em-analyzing" style={{ opacity: seg(p, 0.28, 0.34) }}>
            <span className="em-analyzing__pulse" aria-hidden="true" />
            Analyzing request<span className="em-scan__dots" aria-hidden="true" />
          </div>
        </div>

        {/* ayrıştırılmış etiketler */}
        <div className="em-story__layer" style={layer(0.44, 0.5, 0.53, 0.57)}>
          <div className="em-tags">
            {REQ_TAGS.map((t, i) => (
              <div key={t.k} style={{ opacity: seg(p, 0.445 + i * 0.02, 0.48 + i * 0.02), transform: `translateY(${(1 - seg(p, 0.445 + i * 0.02, 0.48 + i * 0.02)) * 12}px)` }}>
                <span>{t.k}</span><strong>{t.v}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* dev tipografili geri sayım: 247 → 182 → 61 → 12 → 3 */}
        <div className="em-story__layer" style={layer(0.555, 0.6, 0.7, 0.735)}>
          <div className="em-scanbig">
            <span className="em-scanbig__lbl">Portföy taranıyor</span>
            <strong key={scanIdx}>{SCAN_SEQ[scanIdx]}</strong>
            <div className="em-scan__line" aria-hidden="true" />
          </div>
        </div>

        <div className="em-story__layer em-story__layer--result" style={{ ...layer(0.75, 0.83, 2, 3), pointerEvents: resultOn ? 'auto' : 'none' }}>
          <StoryResult pct={pct} on={resultOn} demo={demo} />
        </div>
      </div>
    </section>
  )
}

function StoryResult({ pct, on, demo }) {
  return (
    <div className="em-result">
      <div className="em-result__card">
        <div className="em-result__photo"><img src="/screens/property-fulya.png" alt="Fulya Residence — temsili görsel" loading="lazy" /></div>
        <div className="em-result__body">
          <span className="em-result__pct">%{pct}<em>MATCH</em></span>
          <strong>Fulya Residence</strong>
          <span className="em-result__s">2+1 · 146 m² · Metro 420 m</span>
        </div>
      </div>
      <div className={`em-result__checks${on ? ' on' : ''}`}>
        {MATCH_CHECKS.map((c, i) => (
          <span key={c} style={{ transitionDelay: `${0.15 + i * 0.12}s` }}>✓ {c}</span>
        ))}
      </div>
      <button className={`em-result__cta${on ? ' on' : ''}`} onClick={demo}>EstateMatch'i canlı görün →</button>
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
            <strong>{n3}</strong><span>doğru eşleşme</span>
          </div>
        </Rev>
        <Rev delay={380}><p className="em-counts__final">Saniyeler içinde.</p></Rev>
        <Rev delay={480}><p className="em-counts__note">Portföy aramak yerine müşterinizle ilgilenin.</p></Rev>
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

/* ════════════════ DON'T SEARCH. JUST ASK. ════════════════ */
function Ask() {
  const [ref, on] = useInView(0.35)
  const reduced = useReducedMotion()
  const [run, setRun] = useState(0)
  const [act, setAct] = useState(0)          // 0..2
  const [phase, setPhase] = useState('idle') // idle → q → think → a → dwell → done
  const [qLen, setQLen] = useState(0)
  const [sorted, setSorted] = useState(false)   // 2. perde: sıralama
  const [matched, setMatched] = useState(false) // 3. perde: eşleşmeler

  useEffect(() => {
    if (!on) return
    if (reduced) { setAct(2); setPhase('done'); setSorted(true); setMatched(true); setQLen(ASK_ACTS[2].q.length); return }
    let cancelled = false
    const timers = []
    const wait = (ms) => new Promise(r => timers.push(setTimeout(r, ms)))
    const type = (text) => new Promise(resolve => {
      let i = 0
      const t = setInterval(() => {
        if (cancelled) { clearInterval(t); return }
        i++
        setQLen(i)
        if (i >= text.length) { clearInterval(t); resolve() }
      }, 26)
      timers.push(t)
    })
    const play = async () => {
      setSorted(false); setMatched(false)
      for (let a = 0; a < ASK_ACTS.length; a++) {
        if (cancelled) return
        setAct(a); setQLen(0); setPhase('q')
        await type(ASK_ACTS[a].q)
        if (cancelled) return
        setPhase('think'); await wait(650)
        if (cancelled) return
        setPhase('a')
        if (a === 1) setSorted(true)
        if (a === 2) setMatched(true)
        await wait(a < ASK_ACTS.length - 1 ? 2100 : 400)
      }
      if (!cancelled) setPhase('done')
    }
    play()
    return () => { cancelled = true; timers.forEach(t => { clearTimeout(t); clearInterval(t) }) }
  }, [on, run, reduced])

  const order = useMemo(() => {
    const idx = ASK_CLIENTS.map((c, i) => i)
    if (!sorted) return idx
    return idx.sort((a, b) => ASK_CLIENTS[b].prob - ASK_CLIENTS[a].prob)
  }, [sorted])
  const posOf = (i) => order.indexOf(i)

  const chat = ASK_ACTS[act]
  return (
    <section id="assistant" className="em-ask" ref={ref}>
      <div className="em-wrap">
        <Rev>
          <span className="em-eyebrow"><i aria-hidden="true">✦</i>AI Assistant</span>
          <h2 className="em-h2 em-h2--ivory" lang="en">Don't search.<br /><em>Just ask.</em></h2>
          <p className="em-sub em-sub--ivory">Aramayın; sorun. EstateMatch veriyi tarar, sıralar ve eşleştirir — siz izlerken.</p>
        </Rev>
        <Rev delay={120}>
          <div className="em-chat">
            <div className="em-chat__head">
              <i aria-hidden="true" />EstateMatch AI Asistan
              <span className="em-chat__acts" aria-hidden="true">{ASK_ACTS.map((_, i) => <b key={i} className={i <= act ? 'on' : ''} />)}</span>
            </div>
            <div className="em-chat__body">
              <div className="em-chat__q">{chat.q.slice(0, qLen)}{phase === 'q' && <b className="em-caret" aria-hidden="true" />}</div>
              {phase === 'think' && <div className="em-chat__think" aria-label="yanıt hazırlanıyor"><i /><i /><i /></div>}
              {(phase === 'a' || phase === 'dwell' || phase === 'done') && (
                <div className="em-chat__a">{chat.a}</div>
              )}
              <div className={`em-clients${phase === 'q' && act === 0 ? ' em-clients--hide' : ''}`} style={{ '--rows': ASK_CLIENTS.length }}>
                {ASK_CLIENTS.map((c, i) => (
                  <div key={c.id} className="em-client" style={{ '--pos': posOf(i) }}>
                    <i className="em-mini__ava" aria-hidden="true">{c.n.split(' ').map(w => w[0]).join('')}</i>
                    <div className="em-client__mid">
                      <strong>{c.n}</strong>
                      <span>{c.s}</span>
                    </div>
                    <em className={`em-client__prob${sorted ? ' on' : ''}`}>%{c.prob}</em>
                    <b className={`em-client__match${matched ? ' on' : ''}`}>{c.match}</b>
                  </div>
                ))}
              </div>
            </div>
            <div className="em-chat__foot">
              {phase === 'done'
                ? <button className="em-chat__replay" onClick={() => setRun(r => r + 1)}>↺ Yeniden oynat</button>
                : <span className="em-chat__hint">Canlı demo oynuyor…</span>}
            </div>
          </div>
        </Rev>
      </div>
    </section>
  )
}

/* ════════════════ TEK ZEKÂ KATMANI — ekosistem diyagramı ════════════════ */
function Layer() {
  const [ref, on] = useInView(0.35)
  return (
    <section className="em-layer" ref={ref}>
      <div className="em-wrap em-layer__in">
        <Rev>
          <span className="em-eyebrow"><i aria-hidden="true">✦</i>Platform</span>
          <h2 className="em-h2 em-h2--ivory" lang="en">One intelligence layer.</h2>
          <p className="em-sub em-sub--ivory">Tüm satış operasyonunuz — müşteri, eşleşme, portföy, takip ve analitik — tek zekâ katmanının üzerinde çalışır.</p>
        </Rev>
        <Rev delay={140}>
          <svg className={`em-layer__svg${on ? ' on' : ''}`} viewBox="0 0 600 430" aria-hidden="true">
            {LAYER_NODES.slice(0, 3).map(n => (
              <line key={n.k} x1={n.x} y1={n.y + 16} x2="300" y2="186" className="em-layer__wire" />
            ))}
            <line x1="300" y1="216" x2="300" y2="290" className="em-layer__wire" />
            <line x1="300" y1="322" x2="300" y2="368" className="em-layer__wire" />
            <circle cx="300" cy="200" r="15" className="em-layer__core" />
            <circle cx="300" cy="200" r="26" className="em-layer__ring" />
            <text x="300" y="243" className="em-layer__coreLbl">ESTATEMATCH AI</text>
            {LAYER_NODES.map(n => (
              <g key={n.k}>
                <circle cx={n.x} cy={n.y} r="5" className="em-layer__dot" />
                <text x={n.x} y={n.y - 14} className="em-layer__lbl">{n.t}</text>
              </g>
            ))}
          </svg>
        </Rev>
      </div>
    </section>
  )
}

/* ════════════════ EXPLORE — bento product explorer ════════════════ */
function Explore() {
  const [open, setOpen] = useState(-1)
  const [tech, setTech] = useState(false)
  const mod = open >= 0 ? MODULES[open] : null
  return (
    <section id="explore" className="em-explore em-light">
      <div className="em-wrap">
        <Rev>
          <span className="em-eyebrow em-eyebrow--dark"><i aria-hidden="true">✦</i>Explore EstateMatch</span>
          <h2 className="em-h2">Platformu keşfedin.</h2>
          <p className="em-sub">Herkes ürünü anlasın; isteyen derine insin. Tıklayın — sayfadan çıkmadan.</p>
        </Rev>
        <div className="em-mods">
          {MODULES.map((m, i) => (
            <Rev key={m.k} delay={i * 60}>
              <button
                className={`em-mod${m.size === 'big' ? ' em-mod--big' : ''}${open === i ? ' em-mod--open' : ''}`}
                style={{ gridArea: m.area }}
                onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}
              >
                <div className="em-mod__prev" aria-hidden="true"><img src={m.img} alt="" loading="lazy" /></div>
                <strong lang="en">{m.k}</strong>
                <span>{m.tr}</span>
                <em className="em-mod__cta">Nasıl çalışır →</em>
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
              {mod.steps && (
                <ol className="em-mod__steps">
                  {mod.steps.map((s, j) => <li key={s}><i>{String(j + 1).padStart(2, '0')}</i>{s}</li>)}
                </ol>
              )}
              <button className="em-mod__close" onClick={() => setOpen(-1)}>Kapat ✕</button>
            </div>
          </div>
        )}
        <div className="em-tech">
          <button className="em-tech__toggle" onClick={() => setTech(t => !t)} aria-expanded={tech}>
            Teknik detayları görüntüle <b style={{ transform: tech ? 'rotate(180deg)' : 'none' }}>▾</b>
          </button>
          {tech && (
            <div className="em-tech__grid">
              {TECH.map(t => (
                <div key={t.h} className="em-tech__c"><h4>{t.h}</h4><p>{t.p}</p></div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/* ════════════════ EDITORIAL — konut fotoğrafı + dijital zekâ katmanı ════════════════ */
function Editorial() {
  const [ref, on] = useInView(0.35)
  const pct = useCountUp(94, on, 1400)
  return (
    <section className="em-edit" ref={ref}>
      <img className="em-edit__photo" src="/screens/property-fulya.png" alt="Fulya'da modern konut — temsili görsel" loading="lazy" />
      <div className="em-edit__veil" aria-hidden="true" />
      <div className="em-wrap em-edit__in">
        <div className="em-edit__meta">
          <span className="em-edit__loc">İstanbul / Fulya</span>
          <strong className="em-edit__price">₺18.450.000</strong>
          <span className="em-edit__spec">2+1 · 142 m² · 7 yaşında</span>
          <span className="em-edit__note">Temsili görsel</span>
        </div>
        <div className="em-edit__intel">
          <div className={`em-edit__match${on ? ' on' : ''}`}>
            <span>%{pct}</span> MATCH
          </div>
          <div className={`em-edit__signal${on ? ' on' : ''}`}>
            <span>AI Signal</span>
            Yatırım uyumluluğu yüksek
          </div>
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

/* ════════════════ KİŞİYE GÖRE DEĞER ÖNERİSİ ════════════════ */
function WhoFor({ demo }) {
  return (
    <section className="em-who">
      <div className="em-wrap">
        <Rev>
          <span className="em-eyebrow"><i aria-hidden="true">✦</i>Kimler için</span>
          <h2 className="em-h2 em-h2--ivory">Sayfada kendinizi görün.</h2>
        </Rev>
        <div className="em-who__grid">
          {WHO.map((w, i) => (
            <Rev key={w.h} delay={i * 110}>
              <div className="em-who__c">
                <span className="em-who__role">{w.h}</span>
                <h3>{w.big.split('\n').map(l => <span key={l}>{l}<br /></span>)}</h3>
                <ul>{w.lines.map(l => <li key={l}>{l}</li>)}</ul>
              </div>
            </Rev>
          ))}
        </div>
        <Rev delay={340}>
          <button className="em-who__cta" onClick={demo}>EstateMatch'i canlı görün →</button>
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
          <span className="em-eyebrow"><i aria-hidden="true">✦</i>Güvenlik</span>
          <h2 className="em-h2 em-h2--ivory">Kurum için güvenli.</h2>
        </Rev>
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

/* ════════════════ FİNAL — eşleşme ağı; CTA hover'ında noktalar birleşir ════════════════ */
function NetworkBg({ boostRef }) {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = canvas.getContext('2d')
    let raf = 0, running = false, w = 0, h = 0
    let boost = 0 // 0..1 — CTA hover'ında yumuşakça 1'e gider
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
      boost += (((boostRef?.current) ? 1 : 0) - boost) * 0.06
      const reach = 170 + boost * 110
      const glow = 1 + boost * 1.6
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
          if (d < reach) {
            ctx.beginPath()
            ctx.moveTo(nodes[i].x * w, nodes[i].y * h)
            ctx.lineTo(nodes[j].x * w, nodes[j].y * h)
            ctx.strokeStyle = `rgba(159, 214, 183, ${0.14 * glow * (1 - d / reach)})`
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
      }
      for (const n of nodes) {
        ctx.beginPath()
        ctx.arc(n.x * w, n.y * h, n.r * (1 + boost * 0.4), 0, Math.PI * 2)
        ctx.fillStyle = `rgba(159, 214, 183, ${0.35 * glow})`
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
  }, [boostRef])
  return <canvas ref={canvasRef} className="em-final__net" aria-hidden="true" />
}

function Final({ demo }) {
  const boostRef = useRef(false)
  return (
    <section className="em-final">
      <NetworkBg boostRef={boostRef} />
      <div className="em-wrap em-final__in">
        <Rev>
          <h2 className="em-final__h">
            Sıradaki satışınız,<br />belki de çoktan<br /><em>portföyünüzde.</em>
          </h2>
        </Rev>
        <Rev delay={900}>
          <p className="em-final__sub">EstateMatch bağlantıyı bulur.</p>
        </Rev>
        <Rev delay={1200}>
          <div className="em-final__row">
            <button
              className="em-btn em-btn--ivory em-final__btn" onClick={demo}
              onMouseEnter={() => { boostRef.current = true }}
              onMouseLeave={() => { boostRef.current = false }}
              onFocus={() => { boostRef.current = true }}
              onBlur={() => { boostRef.current = false }}
            >
              Demo Talep Et <span>→</span>
            </button>
          </div>
        </Rev>
        <Rev delay={1400}>
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
      <Hero goBack={goBack} onSeeStory={() => goTo('#story')} demo={demo} />
      <Story demo={demo} />
      <Vs />
      <Counts />
      <Tour />
      <Layer />
      <Ask />
      <Explore />
      <Editorial />
      <Value />
      <WhoFor demo={demo} />
      <Secure />
      <Final demo={demo} />
    </main>
  )
}
