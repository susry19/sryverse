import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { usePageSeo, usePageSchema } from './pageParts.jsx'
import './ProductPage.css'
import './EstateCaseStudy.css'

/* ════════════════════════════════════════════════════════════
   ESTATEMATCH — 8 signature sahne.
   Premium Real Estate × Clean Technology × Intelligent Matching.
   Palet: %70 kırık beyaz · %20 siyah · %10 SRYVERSE yeşili.
   Hareket kuralı: yalnızca ürün davranışı animasyona değer —
   match skoru, AI sorgusu, grafik çizimi, sonuç kartı, durum geçişi.
   ════════════════════════════════════════════════════════════ */

/* ── Fotoğraf altyapısı: WebP + srcset. Yeni görseller aynı adla
     public/screens/<ad>-<genişlik>.webp olarak bırakılınca devreye girer. ── */
const PHOTO_WIDTHS = {
  'property-fulya': [640, 1024, 1600],
  'property-nisantasi': [640, 1024],
  'property-macka': [640, 1024, 1600],
}
function photoSrcSet(name) {
  const ws = PHOTO_WIDTHS[name] || [1024]
  return {
    src: `/screens/${name}-${ws[ws.length - 1]}.webp`,
    srcSet: ws.map(w => `/screens/${name}-${w}.webp ${w}w`).join(', '),
  }
}
function Photo({ name, alt, sizes = '100vw', className, eager = false }) {
  const { src, srcSet } = photoSrcSet(name)
  return (
    <img className={className} src={src} srcSet={srcSet} sizes={sizes} alt={alt}
      loading={eager ? 'eager' : 'lazy'} decoding={eager ? 'sync' : 'async'} />
  )
}
/* LCP görselini erkenden indir */
function usePreloadPhoto(name) {
  useEffect(() => {
    const { src, srcSet } = photoSrcSet(name)
    const l = document.createElement('link')
    l.rel = 'preload'; l.as = 'image'; l.href = src
    l.setAttribute('imagesrcset', srcSet)
    l.setAttribute('imagesizes', '(max-width: 900px) 90vw, 560px')
    l.setAttribute('fetchpriority', 'high')
    document.head.appendChild(l)
    return () => l.remove()
  }, [name])
}

/* ── Veri ── */
const HERO_MATCH = {
  client: { area: 'Fulya, İstanbul', rooms: '2+1', budget: '≤ ₺20M' },
  prop: { photo: 'property-fulya', name: 'Fulya Residence', price: '₺18.450.000' },
}
const REQUEST = 'Fulya veya Nişantaşı\'nda, 20 milyon altında, yeni binada 2+1 arıyorum.'
const REQ_TAGS = ['FULYA', 'NİŞANTAŞI', '2+1', 'YENİ BİNA', '≤ ₺20M']
const SCAN_SEQ = [247, 83, 24, 7]
const WHY = ['Bütçesine uygun', 'İstediği lokasyonda', 'Oda tercihi uygun', 'Yatırım beklentisi yüksek']

const TRY_RESULTS = [
  { pct: 94, photo: 'property-fulya', t: 'Fulya Residence', s: '2+1 · 142 m² · Yeni bina', p: '₺18,4M' },
  { pct: 89, photo: 'property-nisantasi', t: 'Nişantaşı Modern', s: '2+1 · 128 m² · 3 yaşında', p: '₺17,2M' },
  { pct: 83, photo: 'property-macka', t: 'Bomonti Residence', s: '2+1 · 118 m² · Yeni bina', p: '₺15,9M' },
]

const FLOW = ['Müşteri', 'Eşleştirme', 'Portföy', 'Takip', 'Satış', 'Analiz']

const ASK_PEOPLE = [
  { n: 'Tolga Şen', pct: 92 },
  { n: 'Gül Ekinci', pct: 88 },
  { n: 'Volkan Erdem', pct: 83 },
]

const REPORT_BARS = [
  { n: 'Selin Kaya', v: 56 },
  { n: 'Burak Aydın', v: 42 },
  { n: 'Deniz Aksoy', v: 38 },
]
const REPORT_TREND = [42, 51, 47, 63, 58, 76, 71, 92]

const BEFORE_STEPS = ['Müşteri geldi.', 'CRM açıldı.', 'Filtre uygulandı.', 'Portföy arandı.',
  'Danışmana soruldu.', 'WhatsApp kontrol edildi.', 'Excel kontrol edildi.', 'Müşteriye dönüldü.']

/* ── Yardımcılar ── */
const clamp01 = v => Math.min(1, Math.max(0, v))
const seg = (p, a, b) => clamp01((p - a) / (b - a))
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function useInView(threshold = 0.3) {
  const ref = useRef(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reduced()) { setOn(true); return }
    const io = new IntersectionObserver(e => { if (e[0].isIntersecting) { setOn(true); io.disconnect() } }, { threshold })
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])
  return [ref, on]
}

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
    const on = () => { if (!raf) raf = requestAnimationFrame(measure) }
    measure()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on, { passive: true })
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); if (raf) cancelAnimationFrame(raf) }
  }, [ref])
  return p
}

function useCountUp(target, run, duration = 1100) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!run) return
    if (reduced()) { setV(target); return }
    let raf = 0
    const start = performance.now()
    const tick = now => {
      const t = Math.min(1, (now - start) / duration)
      setV(target * (1 - Math.pow(1 - t, 3)))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [run, target, duration])
  return v
}

function Fade({ children, delay = 0, threshold = 0.25, as: Tag = 'div', className = '' }) {
  const [ref, on] = useInView(threshold)
  return (
    <Tag ref={ref} className={`mx-fade${on ? ' on' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </Tag>
  )
}

/* ════════════════ 01 · HERO ════════════════ */
function Hero({ goBack, demo, onExplore }) {
  const [ref, on] = useInView(0.15)
  const [scoreGo, setScoreGo] = useState(false)
  useEffect(() => {
    if (!on) return
    const t = setTimeout(() => setScoreGo(true), 900)
    return () => clearTimeout(t)
  }, [on])
  const score = Math.round(useCountUp(94, scoreGo, 900))

  return (
    <section className="mx-hero" ref={ref}>
      <div className="mx-wrap">
        <div className="mx-hero__top">
          <button className="mx-crumb" onClick={goBack}>← Ana Sayfa</button>
          <span className="mx-lockup">estatematch <em>by SRYVERSE</em></span>
        </div>

        <div className="mx-hero__grid">
          <div className="mx-hero__copy">
            <h1 className="mx-hero__h1">Gayrimenkulde<br />doğru eşleşme.</h1>
            <p className="mx-hero__sub">
              Müşterinizi anlayan, portföyünüzü tarayan ve en doğru eşleşmeleri
              saniyeler içinde bulan AI destekli gayrimenkul satış platformu.
            </p>
            <div className="mx-hero__ctas">
              <button className="mx-btn" onClick={demo}>Demo İste →</button>
              <button className="mx-btn mx-btn--ghost" onClick={onExplore}>Ürünü Keşfet</button>
            </div>
          </div>

          {/* imza kompozisyon: müşteri ─ %94 MATCH ─ portföy */}
          <div className={`mx-hm${on ? ' go' : ''}`}>
            <div className="mx-hm__side">
              <span className="mx-hm__lbl">Müşteri</span>
              <div className="mx-hm__client">
                <span>{HERO_MATCH.client.area}</span>
                <span>{HERO_MATCH.client.rooms}</span>
                <span>{HERO_MATCH.client.budget}</span>
              </div>
            </div>

            <div className="mx-hm__mid">
              <i className="mx-hm__wire mx-hm__wire--l" aria-hidden="true" />
              <div className="mx-hm__score">
                <strong>{score}<em>%</em></strong>
                <span>MATCH</span>
              </div>
              <i className="mx-hm__wire mx-hm__wire--r" aria-hidden="true" />
            </div>

            <div className="mx-hm__side mx-hm__side--prop">
              <span className="mx-hm__lbl">Portföy</span>
              <figure className="mx-hm__prop">
                <Photo name={HERO_MATCH.prop.photo} alt="Fulya Residence — temsili görsel"
                  sizes="(max-width: 900px) 90vw, 460px" eager />
                <figcaption>
                  <strong>{HERO_MATCH.prop.name}</strong>
                  <span>{HERO_MATCH.prop.price}</span>
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ════════════════ 02 · PROBLEM → MATCH ════════════════ */
function parseQuery(t) {
  const l = t.toLocaleLowerCase('tr-TR')
  const found = ['Fulya', 'Nişantaşı', 'Bomonti', 'Maçka', 'Beşiktaş', 'Levent', 'Kadıköy', 'Antalya']
    .filter(a => l.includes(a.toLocaleLowerCase('tr-TR')))
  const rooms = (t.match(/(\d)\s*\+\s*(\d)/) || [])[0]
  const b = t.match(/(\d+)\s*milyon/i)
  const tags = [...found.map(f => f.toLocaleUpperCase('tr-TR'))]
  if (rooms) tags.push(rooms)
  if (/yeni\s*bina/i.test(t)) tags.push('YENİ BİNA')
  if (/havuz/i.test(t)) tags.push('HAVUZLU')
  if (/villa/i.test(t)) tags.push('VİLLA')
  if (b) tags.push(`≤ ₺${b[1]}M`)
  return tags.length ? tags : ['TÜM BÖLGELER', 'TÜM TİPLER']
}

function Problem() {
  const wrapRef = useRef(null)
  const p = useScrollProgress(wrapRef)
  const isReduced = useMemo(reduced, [])

  const [text, setText] = useState('')
  const [touched, setTouched] = useState(false)
  const [state, setState] = useState('idle')
  const [tags, setTags] = useState(null)

  useEffect(() => {
    if (touched) return
    if (isReduced) { setText(REQUEST); return }
    if (p < 0.06) return
    let i = 0
    const t = setInterval(() => {
      i++
      setText(REQUEST.slice(0, i))
      if (i >= REQUEST.length) clearInterval(t)
    }, 22)
    return () => clearInterval(t)
  }, [p >= 0.06, touched, isReduced]) // eslint-disable-line react-hooks/exhaustive-deps

  const run = useCallback(() => {
    setTags(parseQuery(text.trim() || REQUEST))
    setState('scan')
    const t = setTimeout(() => setState('done'), isReduced ? 0 : 1200)
    return () => clearTimeout(t)
  }, [text, isReduced])

  const scanIdx = Math.min(SCAN_SEQ.length - 1, Math.floor(seg(p, 0.34, 0.72) * SCAN_SEQ.length))
  const showTags = p > 0.2
  const showScan = p > 0.33 && p < 0.74
  const showThree = p >= 0.74

  return (
    <section id="problem" className="mx-problem" ref={wrapRef}>
      <div className="mx-problem__sticky">
        <div className="mx-wrap mx-problem__in">
          <p className="mx-problem__t" style={{ opacity: isReduced ? 1 : Math.min(seg(p, 0, 0.05), 1 - seg(p, 0.78, 0.86)) }}>
            Bir müşteri geldi.
          </p>

          <div className="mx-bubble" style={{ opacity: isReduced ? 1 : Math.min(seg(p, 0.05, 0.1), 1 - seg(p, 0.78, 0.86)) }}>
            <i aria-hidden="true">M</i>
            <p>{text || REQUEST}</p>
          </div>

          <div className="mx-ptags" style={{ opacity: isReduced ? 1 : Math.min(seg(p, 0.2, 0.26), 1 - seg(p, 0.78, 0.86)) }}>
            {REQ_TAGS.map((t, i) => (
              <span key={t} style={{ opacity: isReduced || !showTags ? (isReduced ? 1 : 0) : seg(p, 0.2 + i * 0.018, 0.24 + i * 0.018) }}>{t}</span>
            ))}
          </div>

          <div className="mx-count" aria-live="polite">
            {isReduced ? (
              <><strong className="mx-count__n">247</strong><span>portföy tarandı → <b>3</b> eşleşme</span></>
            ) : showThree ? (
              <><strong className="mx-count__n mx-count__n--hit">3</strong><span>en güçlü eşleşme.</span></>
            ) : showScan ? (
              <><strong key={scanIdx} className="mx-count__n">{SCAN_SEQ[scanIdx]}</strong><span>portföy taranıyor…</span></>
            ) : <span className="mx-count__ph" aria-hidden="true" />}
          </div>
        </div>
      </div>

      {/* kendi cümlenizi deneyin */}
      <div className="mx-wrap mx-try">
        <Fade>
          <div className="mx-try__box">
            <label className="mx-lbl" htmlFor="mx-q">Siz deneyin — müşteriniz ne arıyor?</label>
            <div className="mx-try__row">
              <input id="mx-q" type="text" value={text} placeholder={REQUEST} autoComplete="off"
                onFocus={() => setTouched(true)}
                onChange={e => { setTouched(true); setText(e.target.value) }}
                onKeyDown={e => { if (e.key === 'Enter') run() }} />
              <button className="mx-btn" onClick={run}>Eşleştir →</button>
            </div>

            {tags && (
              <div className="mx-try__tags">{tags.map(t => <span key={t}>{t}</span>)}</div>
            )}
            {state === 'scan' && <div className="mx-try__scan"><i aria-hidden="true" />247 portföy taranıyor…</div>}
            {state === 'done' && (
              <div className="mx-try__res">
                {TRY_RESULTS.map((r, i) => (
                  <article className="mx-card" key={r.t} style={{ animationDelay: `${i * 0.1}s` }}>
                    <Photo name={r.photo} alt={`${r.t} — temsili görsel`} sizes="(max-width: 900px) 90vw, 300px" />
                    <div className="mx-card__b">
                      <em>%{r.pct}</em>
                      <strong>{r.t}</strong>
                      <span>{r.s}</span>
                      <span className="mx-card__p">{r.p}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
            <p className="mx-tiny">Örnek portföy verisiyle çalışan demo.</p>
          </div>
        </Fade>
      </div>
    </section>
  )
}

/* ════════════════ 03 · 94% MATCH — star sahne ════════════════ */
function Star() {
  const [ref, on] = useInView(0.35)
  const pct = Math.round(useCountUp(94, on, 1300))
  return (
    <section id="match" className="mx-star" ref={ref}>
      <Photo name="property-fulya" className="mx-star__bg" alt="Fulya Residence — temsili görsel" sizes="100vw" />
      <div className="mx-star__veil" aria-hidden="true" />
      <div className="mx-wrap mx-star__in">
        <div className="mx-star__score">
          <strong>{pct}</strong>
          <span>%</span>
          <em>MATCH</em>
        </div>
        <div className="mx-star__meta">
          <h2>Fulya Residence</h2>
          <p className="mx-star__loc">İstanbul / Fulya</p>
          <div className="mx-star__specs"><span>2+1</span><span>142 m²</span><strong>₺18.450.000</strong></div>
          <div className={`mx-star__why${on ? ' on' : ''}`}>
            <b>Neden bu portföy?</b>
            {WHY.map((w, i) => <span key={w} style={{ transitionDelay: `${400 + i * 130}ms` }}>✓ {w}</span>)}
          </div>
          <p className="mx-tiny mx-tiny--light">Temsili görsel</p>
        </div>
      </div>
    </section>
  )
}

/* ════════════════ 04 · ÜRÜN ════════════════ */
function Product({ onFeatures }) {
  return (
    <section id="product" className="mx-product">
      <div className="mx-wrap">
        <Fade>
          <h2 className="mx-h2">Tek platform.<br />Tüm satış operasyonunuz.</h2>
        </Fade>
        <Fade delay={120}>
          <div className="mx-frame">
            <div className="mx-frame__bar" aria-hidden="true"><i /><i /><i /><span>EstateMatch — AI Eşleştirme</span></div>
            <div className="mx-frame__shot">
              <img src="/screens/ai-matches.webp" alt="EstateMatch AI eşleştirme ekranı" loading="lazy" decoding="async" />
            </div>
          </div>
        </Fade>
        <Fade delay={180}>
          <ol className="mx-flow">
            {FLOW.map((f, i) => (
              <li key={f}><span>{f}</span>{i < FLOW.length - 1 && <i aria-hidden="true">→</i>}</li>
            ))}
          </ol>
        </Fade>
        <Fade delay={240}>
          <p className="mx-flow__note"><b>EstateMatch AI</b> hepsini birbirine bağlıyor.</p>
        </Fade>
        <Fade delay={300}>
          <button className="mx-link" onClick={onFeatures}>Tüm özellikleri keşfet →</button>
        </Fade>
      </div>
    </section>
  )
}

/* ════════════════ 05 · AI ASSISTANT ════════════════ */
function Assistant() {
  const [ref, on] = useInView(0.35)
  const isReduced = useMemo(reduced, [])
  const [step, setStep] = useState(0)
  const [run, setRun] = useState(0)

  useEffect(() => {
    if (!on) return
    if (isReduced) { setStep(6); return }
    setStep(0)
    const times = [300, 1200, 2200, 3200, 4200, 5200]
    const ts = times.map((ms, i) => setTimeout(() => setStep(i + 1), ms))
    return () => ts.forEach(clearTimeout)
  }, [on, run, isReduced])

  return (
    <section id="assistant" className="mx-ask" ref={ref}>
      <div className="mx-wrap">
        <Fade><h2 className="mx-h2">Aramayın. Sorun.</h2></Fade>
        <Fade delay={100}>
          <p className="mx-sub">EstateMatch AI yalnızca cevap vermez — sistemde işlem yapar.</p>
        </Fade>

        <div className="mx-ask__grid">
          <div className="mx-ask__chat">
            <div className={`mx-q${step >= 1 ? ' on' : ''}`}>Bu hafta ilgilenmem gereken müşteriler kim?</div>
            <div className={`mx-a${step >= 2 ? ' on' : ''}`}>12 öncelikli müşteri buldum.</div>
            <div className={`mx-q${step >= 3 ? ' on' : ''}`}>Satış ihtimali en yüksek olanları göster.</div>
            <div className={`mx-a${step >= 4 ? ' on' : ''}`}>
              <div className="mx-ask__people">
                {ASK_PEOPLE.map((pp, i) => (
                  <div key={pp.n} style={{ transitionDelay: `${i * 120}ms` }}>
                    <span>{pp.n}</span><em>%{pp.pct}</em>
                  </div>
                ))}
              </div>
            </div>
            <div className={`mx-q${step >= 5 ? ' on' : ''}`}>Uygun portföylerini getir.</div>
            {step >= 6 && !isReduced && (
              <button className="mx-replay" onClick={() => setRun(r => r + 1)}>↺ Yeniden oynat</button>
            )}
          </div>

          <div className="mx-ask__res" aria-live="polite">
            {TRY_RESULTS.map((r, i) => (
              <article key={r.t} className={`mx-card mx-card--row${step >= 6 ? ' on' : ''}`} style={{ transitionDelay: `${i * 140}ms` }}>
                <Photo name={r.photo} alt={`${r.t} — temsili görsel`} sizes="140px" />
                <div className="mx-card__b">
                  <em>%{r.pct}</em>
                  <strong>{r.t}</strong>
                  <span>{r.p}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ════════════════ 06 · RAPORLAR ════════════════ */
function Reports() {
  const [ref, on] = useInView(0.3)
  const rev = useCountUp(105.6, on, 1600)
  const trend = useMemo(() => {
    const W = 320, H = 120, max = 100
    const pts = REPORT_TREND.map((v, i) => [10 + i * ((W - 20) / (REPORT_TREND.length - 1)), H - 12 - (v / max) * (H - 26)])
    return pts.map((pt, i) => `${i ? 'L' : 'M'}${pt[0].toFixed(1)},${pt[1].toFixed(1)}`).join(' ')
  }, [])

  return (
    <section id="reports" className="mx-rep" ref={ref}>
      <div className="mx-wrap">
        <Fade><h2 className="mx-h2">Yönetici için tek ekran.</h2></Fade>
        <div className={`mx-rep__card${on ? ' on' : ''}`}>
          <div className="mx-rep__head">
            <div>
              <span className="mx-lbl">Toplam ciro · bu yıl</span>
              <strong className="mx-rep__big">₺{rev.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M</strong>
            </div>
            <span className="mx-rep__delta">↑ %14</span>
          </div>

          <div className="mx-rep__grid">
            <div className="mx-rep__chart">
              <span className="mx-lbl">Aylık satış trendi</span>
              <svg viewBox="0 0 320 120" preserveAspectRatio="none" role="img" aria-label="Aylık satış trendi yükseliyor">
                <path className="mx-rep__line" d={trend} />
              </svg>
            </div>
            <div className="mx-rep__bars">
              <span className="mx-lbl">Danışman performansı</span>
              {REPORT_BARS.map((b, i) => (
                <div key={b.n} className="mx-bar">
                  <span>{b.n}</span>
                  <i><b style={{ width: on ? `${b.v}%` : 0, transitionDelay: `${400 + i * 160}ms` }} /></i>
                  <em>{b.v}</em>
                </div>
              ))}
            </div>
          </div>

          <div className="mx-rep__ai">
            <i aria-hidden="true">✦</i>
            <span>Satış dönüşümü geçen aya göre <b>%14 arttı.</b> En güçlü büyüme Fulya bölgesinde.</span>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ════════════════ 07 · BEFORE → AFTER ════════════════ */
function BeforeAfter() {
  const [ref, on] = useInView(0.25)
  return (
    <section className="mx-ba" ref={ref}>
      <div className="mx-wrap mx-ba__grid">
        <div className="mx-ba__col">
          <span className="mx-lbl">EstateMatch'ten önce</span>
          <div className={`mx-ba__steps${on ? ' on' : ''}`}>
            {BEFORE_STEPS.map((s, i) => (
              <span key={s} style={{ transitionDelay: `${i * 130}ms` }}>{s}</span>
            ))}
          </div>
        </div>
        <i className="mx-ba__line" aria-hidden="true" />
        <div className="mx-ba__col mx-ba__col--after">
          <span className="mx-lbl">EstateMatch ile</span>
          <div className={`mx-ba__after${on ? ' on' : ''}`}>
            <span>Müşteri geldi.</span>
            <strong>MATCH.</strong>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ════════════════ 08 · FİNAL ════════════════ */
function Final({ demo }) {
  const [ref, on] = useInView(0.3)
  return (
    <section className="mx-final" ref={ref}>
      <Photo name="property-macka" className="mx-final__bg" alt="" sizes="100vw" />
      <div className="mx-final__veil" aria-hidden="true" />
      <div className="mx-wrap mx-final__in">
        <span className={`mx-final__wire${on ? ' on' : ''}`} aria-hidden="true"><i /></span>
        <h2 className="mx-final__h">Sıradaki eşleşme,<br />çoktan portföyünüzde.</h2>
        <p className="mx-final__sub">EstateMatch onu bulur.</p>
        <button className="mx-btn mx-btn--big" onClick={demo}>Demo Talep Et →</button>
        <p className="mx-tiny mx-tiny--light">Kendi verinizi paylaşmanız gerekmez · Kurulum ve ekip eğitimi dahildir</p>
      </div>
    </section>
  )
}

/* ════════════════ SAYFA ════════════════ */
const SEO_TITLE = 'EstateMatch AI | Yapay Zekâ Destekli Gayrimenkul CRM ve Eşleştirme Platformu'
const SEO_DESC = 'EstateMatch AI; emlak şirketlerinin müşterilerini, portföylerini, satış süreçlerini ve danışman performansını tek platformdan yönetmesini sağlayan yapay zekâ destekli gayrimenkul satış platformudur.'

export default function EstateMatchPage({ goBack, onDemo, onFeatures }) {
  usePageSeo({
    title: SEO_TITLE,
    description: SEO_DESC,
    path: '/estatematch',
    ogImage: 'https://sryverse.com/screens/property-fulya-1600.webp',
  })
  usePreloadPhoto('property-fulya')

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
  const demo = useCallback(() => { onDemo ? onDemo() : goBack?.() }, [onDemo, goBack])
  const goProduct = useCallback(() => document.querySelector('#product')?.scrollIntoView({ behavior: 'smooth' }), [])

  return (
    <main className="mx-page">
      <Hero goBack={goBack} demo={demo} onExplore={goProduct} />
      <Problem />
      <Star />
      <Product onFeatures={onFeatures} />
      <Assistant />
      <Reports />
      <BeforeAfter />
      <Final demo={demo} />
    </main>
  )
}
