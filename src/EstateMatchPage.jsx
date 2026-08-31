import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { usePageSeo, usePageSchema } from './pageParts.jsx'
import './ProductPage.css'
import './EstateCaseStudy.css'

/* ════════════════════════════════════════════════════════════
   ESTATEMATCH — "Find the match."
   Tek metafor: MÜŞTERİ — çizgi — PORTFÖY. Işık-öncelikli
   editorial tasarım (%70 beyaz · %20 siyah · %10 yeşil).
   Hareket kuralı: bir animasyon ürünü anlamayı artırmıyorsa yoktur.
   İzin verilen hareketler: bağlanma, eşleşme, filtreleme, sıralama,
   AI yanıtı, durum geçişi.
   ════════════════════════════════════════════════════════════ */

/* ── Try the Match: örnek sonuçlar (demo verisi) ── */
const TRY_PLACEHOLDER = "Nişantaşı veya Fulya'da, 20 milyon altında, yeni binada 2+1 arıyorum."
const TRY_RESULTS = [
  { pct: 94, t: 'Fulya Residence',   s: '2+1 · 142 m² · Yeni bina', p: '₺18,4M', img: '/screens/property-fulya.png' },
  { pct: 89, t: 'Nişantaşı Modern',  s: '2+1 · 128 m² · 3 yaşında', p: '₺17,2M', img: '/screens/property-nisantasi.png' },
  { pct: 83, t: 'Bomonti Residence', s: '2+1 · 118 m² · Yeni bina', p: '₺15,9M', img: '/screens/property-macka.png' },
]

/* ── 247 → 3 ── */
const SHRINK_SEQ = [247, 83, 24, 7]

/* ── Nasıl çalışır: 3 annotation ── */
const HOW_NOTES = [
  { n: '01', t: 'Müşteriyi ekle' },
  { n: '02', t: 'Eşleşmeleri gör' },
  { n: '03', t: 'Takip et' },
]

/* ── Explore: 4 satır ── */
const EXPLORE_ROWS = [
  { k: 'Eşleştir',  s: 'Müşteri × Portföy',                    panel: 'match' },
  { k: 'Yönet',     s: 'Müşteri × Takip × Süreç',              panel: 'manage' },
  { k: 'Analiz Et', s: 'Danışman × Portföy × Performans',      panel: 'analyze' },
  { k: 'Sor',       s: 'EstateMatch AI Assistant',             panel: 'chat' },
]

/* ── Before → After ── */
const BEFORE_STEPS = [
  'Müşteri geldi.', 'CRM açıldı.', 'Filtre uygulandı.', 'Portföy arandı.',
  'Danışmana soruldu.', 'WhatsApp kontrol edildi.', 'Excel kontrol edildi.', 'Müşteriye dönüldü.',
]

/* ── Kime satıyoruz ── */
const WHO_ROWS = [
  { k: 'Danışman',      p: 'Portföy aramakla değil, müşterinizle ilgilenin.' },
  { k: 'Yönetici',      p: 'Ekibinizde neler olduğunu tek bakışta görün.' },
  { k: 'Emlak Şirketi', p: 'Müşteri, portföy ve satış operasyonunu tek sistemde yönetin.' },
]

/* ── Ask: 2 soruluk demo ── */
const ASK_PEOPLE = [
  { n: 'Mert Yılmaz',  s: 'Teklif aşaması',    m: '%94 · Fulya Residence' },
  { n: 'Zeynep Kaya',  s: '2. görüşme',        m: '%88 · Nişantaşı Modern' },
  { n: 'Ahmet Özgen',  s: '5 portföy inceledi', m: '%90 · Bomonti Residence' },
]

/* ════════════════ yardımcılar ════════════════ */
const clamp01 = v => Math.min(1, Math.max(0, v))
const seg = (p, a, b) => clamp01((p - a) / (b - a))

function useReducedMotion() {
  return useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, [])
}

function useInView(threshold = 0.3, once = true) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setInView(true); return }
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) { setInView(true); if (once) io.disconnect() }
      else if (!once) setInView(false)
    }, { threshold })
    io.observe(el)
    return () => io.disconnect()
  }, [threshold, once])
  return [ref, inView]
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

function useCountUp(target, run, duration = 1000) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!run) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setV(target); return }
    let raf = 0
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      setV(Math.round(target * (1 - Math.pow(1 - t, 3))))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [run, target, duration])
  return v
}

/* Basit görünürlük sarmalayıcı — yalnızca fade (dekoratif kayma yok) */
function Fade({ children, delay = 0, threshold = 0.25 }) {
  const [ref, on] = useInView(threshold)
  return (
    <div ref={ref} className={`mx-fade${on ? ' on' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

/* ════════════════ 01 · HERO — THE MATCH LINE ════════════════ */
function Hero({ goBack }) {
  const [ref, on] = useInView(0.2)
  const [pctGo, setPctGo] = useState(false)
  useEffect(() => {
    if (!on) return
    const t = setTimeout(() => setPctGo(true), 1000) // sayaç, çizgi düğüme ulaştığında başlar
    return () => clearTimeout(t)
  }, [on])
  const shown = useCountUp(94, pctGo, 900)

  return (
    <section className="mx-hero" ref={ref}>
      <div className="mx-wrap">
        <div className="mx-hero__top">
          <button className="mx-crumb" onClick={goBack}>← Ana Sayfa</button>
          <span className="mx-lockup">estatematch <em>by SRYVERSE</em></span>
        </div>
        <h1 className="mx-hero__h1">Her müşteri için<br />doğru portföy.</h1>
        <p className="mx-hero__sub">
          EstateMatch, müşterinizin ihtiyaçlarını anlayıp yüzlerce portföy arasından
          en güçlü eşleşmeleri saniyeler içinde bulur.
        </p>
        <a
          className="mx-link" href="#how"
          onClick={e => { e.preventDefault(); document.querySelector('#shrink')?.scrollIntoView({ behavior: 'smooth' }) }}
        >
          EstateMatch'i keşfet ↓
        </a>

        {/* imza görsel: müşteri — çizgi — portföy */}
        <div className={`mx-match${on ? ' go' : ''}`} aria-label="Müşteri ile portföy arasında yüzde 94 eşleşme">
          <span className="mx-match__lbl mx-match__s1">Müşteri</span>
          <span className="mx-match__chip mx-match__s1">"Fulya · 2+1 · ≤ ₺20M"</span>
          <span className="mx-match__line mx-match__l1" aria-hidden="true" />
          <span className="mx-match__node mx-match__s2"><b>%{shown}</b></span>
          <span className="mx-match__line mx-match__l2" aria-hidden="true" />
          <span className="mx-match__chip mx-match__chip--prop mx-match__s3">Fulya Residence</span>
          <span className="mx-match__lbl mx-match__s3">Portföy</span>
        </div>
      </div>
    </section>
  )
}

/* ════════════════ 02 · 247 → 3 ════════════════ */
function Shrink() {
  const wrapRef = useRef(null)
  const p = useScrollProgress(wrapRef)
  const reduced = useReducedMotion()

  if (reduced) {
    return (
      <section id="shrink" className="mx-shrink mx-shrink--static">
        <div className="mx-wrap">
          <p className="mx-shrink__q">247 portföy arasından mı?</p>
          <div className="mx-shrink__final"><strong>3</strong><span>en güçlü eşleşme.</span></div>
          <p className="mx-shrink__note">EstateMatch saniyeler içinde sizin için filtreler, değerlendirir ve sıralar.</p>
        </div>
      </section>
    )
  }

  const qOp = Math.min(seg(p, 0, 0.06), 1 - seg(p, 0.1, 0.16))
  const stageIdx = Math.min(SHRINK_SEQ.length - 1, Math.floor(seg(p, 0.14, 0.66) * SHRINK_SEQ.length))
  const numOn = p > 0.13 && p < 0.7
  const finalOn = p >= 0.7
  // rakam küçüldükçe punto da küçülür — filtreleme hissi
  const scale = 1 - stageIdx * 0.16

  return (
    <section id="shrink" className="mx-shrink" ref={wrapRef}>
      <span className="mx-vline" aria-hidden="true" />
      <div className="mx-shrink__sticky">
        <p className="mx-shrink__q" style={{ opacity: qOp }}>247 portföy arasından mı?</p>
        {numOn && (
          <strong key={stageIdx} className="mx-shrink__num" style={{ transform: `scale(${scale})` }}>
            {SHRINK_SEQ[stageIdx]}
          </strong>
        )}
        <div className="mx-shrink__final" style={{ opacity: finalOn ? 1 : 0 }}>
          <strong>3</strong>
          <span>en güçlü eşleşme.</span>
          <p className="mx-shrink__note" style={{ opacity: p > 0.82 ? 1 : 0 }}>
            EstateMatch saniyeler içinde sizin için filtreler, değerlendirir ve sıralar.
          </p>
        </div>
      </div>
    </section>
  )
}

/* ════════════════ marka diliyle çizilmiş ürün arayüzü ════════════════
   Ekran görüntüsü değil: öne çıkarmak istediğimiz akışı gösteren,
   tasarım sistemine uygun temsili arayüz. */
function MockDashboard() {
  return (
    <div className="mxu" role="img" aria-label="EstateMatch arayüzü — müşteri ekle, eşleşmeleri gör, takip et">
      <div className="mxu__bar"><i /><span>EstateMatch</span><em>Eşleşmeler</em></div>
      <div className="mxu__body">
        <aside className="mxu__nav" aria-hidden="true">
          {['Panel', 'Müşteriler', 'Eşleşmeler', 'Portföy', 'Takip', 'Raporlar'].map((n, i) => (
            <span key={n} className={i === 2 ? 'on' : ''}>{n}</span>
          ))}
        </aside>
        <div className="mxu__client" data-note="01">
          <span className="mxu__lbl">Müşteri</span>
          <div className="mxu__who"><i>MY</i><div><strong>Mert Yılmaz</strong><span>Yatırım amaçlı</span></div></div>
          <div className="mxu__chips"><span>Fulya</span><span>2+1</span><span>≤ ₺20M</span><span>Yeni bina</span></div>
          <button className="mxu__btn" tabIndex={-1}>Eşleştir</button>
        </div>
        <div className="mxu__matches" data-note="02">
          <span className="mxu__lbl">Eşleşmeler</span>
          {TRY_RESULTS.map(r => (
            <div className="mxu__row" key={r.t}>
              <img src={r.img} alt="" loading="lazy" />
              <div><strong>{r.t}</strong><span>{r.s}</span></div>
              <em>%{r.pct}</em>
            </div>
          ))}
        </div>
        <div className="mxu__pipe" data-note="03">
          <span className="mxu__lbl">Takip</span>
          <div className="mxu__stages">
            <span className="done">Görüşme</span><i /><span className="on">Teklif</span><i /><span>Kapanış</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Panel({ kind }) {
  if (kind === 'match') {
    return (
      <div className="mxp" key="match">
        <span className="mxu__lbl">Eşleşmeler</span>
        {TRY_RESULTS.map(r => (
          <div className="mxu__row" key={r.t}>
            <img src={r.img} alt="" loading="lazy" />
            <div><strong>{r.t}</strong><span>{r.s}</span></div>
            <em>%{r.pct}</em>
          </div>
        ))}
      </div>
    )
  }
  if (kind === 'manage') {
    return (
      <div className="mxp" key="manage">
        <span className="mxu__lbl">Takip panosu</span>
        <div className="mxp__kanban">
          {[['Yeni', ['Seval Ö.', 'Kerem D.']], ['Görüşme', ['Zeynep K.']], ['Teklif', ['Mert Y.', 'Ahmet Ö.']]].map(([col, items]) => (
            <div key={col}><span>{col}</span>{items.map(x => <i key={x}>{x}</i>)}</div>
          ))}
        </div>
      </div>
    )
  }
  if (kind === 'analyze') {
    return (
      <div className="mxp" key="analyze">
        <span className="mxu__lbl">Performans</span>
        <div className="mxp__bars">
          {[['Ece A.', 92], ['Bora D.', 74], ['Selin K.', 61], ['Mert A.', 48]].map(([n, w]) => (
            <div key={n}><span>{n}</span><i><b style={{ width: `${w}%` }} /></i></div>
          ))}
        </div>
        <div className="mxp__stat"><strong>%24,6</strong><span>dönüşüm</span><strong>42</strong><span>kapanış</span></div>
      </div>
    )
  }
  return (
    <div className="mxp" key="chat">
      <span className="mxu__lbl">AI Asistan</span>
      <div className="mxp__q">30 gündür işlem görmeyen portföyler?</div>
      <div className="mxp__a">11 portföy hareketsiz. Üçü için fiyat güncellemesi önerdim.</div>
    </div>
  )
}

/* ════════════════ 03 · NASIL ÇALIŞIR ════════════════ */
function How() {
  return (
    <section id="how" className="mx-how">
      <span className="mx-vline" aria-hidden="true" />
      <div className="mx-wrap">
        <Fade>
          <h2 className="mx-h2">Karmaşık değil.<br />İşinizi kolaylaştırmak için var.</h2>
        </Fade>
        <Fade delay={150}>
          <div className="mx-how__stage">
            <MockDashboard />
            <div className="mx-how__notes">
              {HOW_NOTES.map((h, i) => (
                <span key={h.n} className={`mx-note mx-note--${i}`}><b>{h.n}</b>{h.t}</span>
              ))}
            </div>
          </div>
        </Fade>
        <p className="mx-tiny">Temsili arayüz — akış birebir üründeki gibidir.</p>
      </div>
    </section>
  )
}

/* ════════════════ 04 · TRY THE MATCH ════════════════ */
function parseQuery(t) {
  const lower = t.toLocaleLowerCase('tr-TR')
  const areas = ['Fulya', 'Nişantaşı', 'Bomonti', 'Maçka', 'Beşiktaş', 'Levent', 'Kadıköy']
    .filter(a => lower.includes(a.toLocaleLowerCase('tr-TR')))
  const rooms = (t.match(/(\d)\s*\+\s*(\d)/) || [])[0]
  const bm = t.match(/(\d+)\s*(milyon|m(?![²a-z]))/i)
  return {
    areas: areas.length ? areas.join(' · ') : 'Tüm bölgeler',
    rooms: rooms || 'Tüm tipler',
    budget: bm ? `≤ ₺${bm[1]}M` : 'Esnek bütçe',
  }
}

function TryMatch() {
  const [ref, on] = useInView(0.35)
  const reduced = useReducedMotion()
  const [text, setText] = useState('')
  const [touched, setTouched] = useState(false)
  const [state, setState] = useState('idle') // idle → scan → done
  const [tags, setTags] = useState(null)

  /* örnek cümle kendini yazar; kullanıcı dokununca otomatik yazım durur */
  useEffect(() => {
    if (!on || touched) return
    if (reduced) { setText(TRY_PLACEHOLDER); return }
    let i = 0
    const t = setInterval(() => {
      i++
      setText(TRY_PLACEHOLDER.slice(0, i))
      if (i >= TRY_PLACEHOLDER.length) clearInterval(t)
    }, 22)
    return () => clearInterval(t)
  }, [on, touched, reduced])

  const match = useCallback(() => {
    const q = text.trim() || TRY_PLACEHOLDER
    setTags(parseQuery(q))
    setState('scan')
    const t = setTimeout(() => setState('done'), reduced ? 0 : 1100)
    return () => clearTimeout(t)
  }, [text, reduced])

  return (
    <section id="try" className="mx-try" ref={ref}>
      <span className="mx-vline" aria-hidden="true" />
      <div className="mx-wrap">
        <Fade><h2 className="mx-h2">Bir müşteri deneyelim.</h2></Fade>
        <Fade delay={120}>
          <div className="mx-try__box">
            <label className="mxu__lbl" htmlFor="mx-try-input">Müşteriniz ne arıyor?</label>
            <div className="mx-try__row">
              <input
                id="mx-try-input" type="text" value={text}
                onFocus={() => setTouched(true)}
                onChange={e => { setTouched(true); setText(e.target.value) }}
                onKeyDown={e => { if (e.key === 'Enter') match() }}
                placeholder={TRY_PLACEHOLDER}
                autoComplete="off"
              />
              <button className="mx-btn" onClick={match}>Eşleştir →</button>
            </div>

            {state !== 'idle' && tags && (
              <div className="mx-try__tags">
                <span>{tags.areas}</span><span>{tags.rooms}</span><span>{tags.budget}</span>
              </div>
            )}

            {state === 'scan' && (
              <div className="mx-try__scan"><i aria-hidden="true" />247 portföy taranıyor…</div>
            )}

            {state === 'done' && (
              <div className="mx-try__results">
                {TRY_RESULTS.map((r, i) => (
                  <div className="mx-res" key={r.t} style={{ animationDelay: `${i * 0.12}s` }}>
                    <img src={r.img} alt={`${r.t} — temsili görsel`} loading="lazy" />
                    <div className="mx-res__body">
                      <em>%{r.pct}</em>
                      <strong>{r.t}</strong>
                      <span>{r.s}</span>
                      <span className="mx-res__p">{r.p}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="mx-tiny">Örnek portföy verisiyle çalışan demo — kendi cümlenizi de yazabilirsiniz.</p>
          </div>
        </Fade>
      </div>
    </section>
  )
}

/* ════════════════ 05 · 94% MATCH — editorial ════════════════ */
function Editorial() {
  const [ref, on] = useInView(0.4)
  const pct = useCountUp(94, on, 1200)
  return (
    <section className="mx-edit" ref={ref}>
      <img className="mx-edit__photo" src="/screens/property-fulya.png" alt="Fulya'da modern konut — temsili görsel" loading="lazy" />
      <div className="mx-edit__veil" aria-hidden="true" />
      <div className="mx-wrap mx-edit__in">
        <div className="mx-edit__l">
          <span className="mx-edit__loc">Fulya / İstanbul</span>
          <div className="mx-edit__big"><strong>%{pct}</strong><span>match</span></div>
        </div>
        <div className="mx-edit__r">
          <strong>₺18,4M</strong>
          <span>2+1</span>
          <span>142 m²</span>
          <div className={`mx-edit__why${on ? ' on' : ''}`}>
            <b>Neden eşleşti?</b>
            {['Lokasyon', 'Bütçe', 'Oda sayısı', 'Bina yaşı', 'Yatırım tercihi'].map((w, i) => (
              <span key={w} style={{ transitionDelay: `${0.4 + i * 0.12}s` }}>✓ {w}</span>
            ))}
          </div>
          <span className="mx-tiny mx-tiny--ivory">Temsili görsel</span>
        </div>
      </div>
    </section>
  )
}

/* ════════════════ nefes ════════════════ */
function Breath() {
  return (
    <section className="mx-breath">
      <Fade threshold={0.5}>
        <p>Daha az ara.<br />Daha çok eşleş.</p>
      </Fade>
    </section>
  )
}

/* ════════════════ 06 · EXPLORE ════════════════ */
function Explore() {
  const [active, setActive] = useState(0)
  return (
    <section id="explore" className="mx-explore">
      <span className="mx-vline" aria-hidden="true" />
      <div className="mx-wrap">
        <Fade><h2 className="mx-h2">EstateMatch ile<br />yapabilecekleriniz.</h2></Fade>
        <div className="mx-explore__grid">
          <div className="mx-explore__rows" role="tablist" aria-label="Modüller">
            {EXPLORE_ROWS.map((r, i) => (
              <button
                key={r.k} role="tab" aria-selected={i === active}
                className={`mx-erow${i === active ? ' on' : ''}`}
                onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onClick={() => setActive(i)}
              >
                <strong>{r.k}</strong>
                <span>{r.s}</span>
              </button>
            ))}
          </div>
          <div className="mx-explore__panel">
            <Panel kind={EXPLORE_ROWS[active].panel} />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ════════════════ AI · ARAMAYIN. SORUN. ════════════════ */
function Ask() {
  const [ref, on] = useInView(0.4)
  const reduced = useReducedMotion()
  const [step, setStep] = useState(reduced ? 4 : 0)
  // 0: boş → 1: q1 → 2: a1 → 3: q2 → 4: a2 (eşleşmeler görünür)
  useEffect(() => {
    if (!on || reduced) return
    const times = [400, 1400, 2600, 3800]
    const timers = times.map((ms, i) => setTimeout(() => setStep(i + 1), ms))
    return () => timers.forEach(clearTimeout)
  }, [on, reduced])

  return (
    <section id="ask" className="mx-ask" ref={ref}>
      <span className="mx-vline" aria-hidden="true" />
      <div className="mx-wrap">
        <Fade><h2 className="mx-h2">Aramayın. Sorun.</h2></Fade>
        <Fade delay={120}>
          <div className="mx-ask__box">
            <div className={`mx-ask__q${step >= 1 ? ' on' : ''}`}>"Bu hafta ilgilenmem gereken müşteriler kim?"</div>
            <div className={`mx-ask__a${step >= 2 ? ' on' : ''}`}>
              <b>12 müşteri öncelikli görünüyor.</b>
              <div className="mx-ask__people">
                {ASK_PEOPLE.map(pp => (
                  <div key={pp.n} className="mx-ask__p">
                    <i>{pp.n.split(' ').map(w => w[0]).join('')}</i>
                    <div><strong>{pp.n}</strong><span>{pp.s}</span></div>
                    <em className={step >= 4 ? 'on' : ''}>{pp.m}</em>
                  </div>
                ))}
              </div>
            </div>
            <div className={`mx-ask__q${step >= 3 ? ' on' : ''}`}>"Hangilerinin uygun portföyü var?"</div>
            <div className={`mx-ask__a${step >= 4 ? ' on' : ''}`}><b>8 müşterinin güçlü eşleşmesi var.</b></div>
          </div>
        </Fade>
      </div>
    </section>
  )
}

/* ════════════════ 07 · BEFORE → AFTER ════════════════ */
function BeforeAfter() {
  const [ref, on] = useInView(0.25)
  return (
    <section className="mx-ba" ref={ref}>
      <div className="mx-wrap">
        <div className="mx-ba__grid">
          <div className="mx-ba__col">
            <span className="mx-ba__t">EstateMatch'ten önce</span>
            <div className={`mx-ba__steps${on ? ' on' : ''}`}>
              {BEFORE_STEPS.map((s, i) => (
                <span key={s} style={{ transitionDelay: `${i * 0.14}s` }}>{s}{i < BEFORE_STEPS.length - 1 && <b aria-hidden="true">↓</b>}</span>
              ))}
            </div>
          </div>
          <span className="mx-ba__line" aria-hidden="true" />
          <div className="mx-ba__col">
            <span className="mx-ba__t">EstateMatch ile</span>
            <div className={`mx-ba__after${on ? ' on' : ''}`}>
              <span>Müşteri geldi.</span>
              <b aria-hidden="true">↓</b>
              <strong>MATCH.</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ════════════════ KİME SATIYORUZ ════════════════ */
function Who() {
  const goHow = (e) => { e.preventDefault(); document.querySelector('#how')?.scrollIntoView({ behavior: 'smooth' }) }
  return (
    <section id="who" className="mx-who">
      <div className="mx-wrap">
        {WHO_ROWS.map((w, i) => (
          <Fade key={w.k} delay={i * 100}>
            <div className="mx-who__row">
              <strong>{w.k}</strong>
              <p>{w.p}</p>
              <a href="#how" className="mx-link" onClick={goHow}>Nasıl çalışır →</a>
            </div>
          </Fade>
        ))}
      </div>
    </section>
  )
}

/* ════════════════ 08 · FİNAL ════════════════ */
function Final({ demo }) {
  const [ref, on] = useInView(0.35)
  return (
    <section className="mx-final" ref={ref}>
      <div className="mx-wrap">
        <span className={`mx-final__line${on ? ' on' : ''}`} aria-hidden="true"><i /></span>
        <Fade delay={500}>
          <h2 className="mx-final__h">Sıradaki eşleşme,<br />çoktan orada.</h2>
        </Fade>
        <Fade delay={800}>
          <p className="mx-final__sub">EstateMatch onu bulur.</p>
        </Fade>
        <Fade delay={1100}>
          <button className="mx-btn mx-btn--big" onClick={demo}>Demo Talep Et →</button>
        </Fade>
        <Fade delay={1300}>
          <p className="mx-tiny mx-tiny--dim">Kendi verinizi paylaşmanız gerekmez · Kurulum ve ekip eğitimi dahildir</p>
        </Fade>
      </div>
    </section>
  )
}

/* ════════════════ SAYFA ════════════════ */
const SEO_TITLE = 'EstateMatch AI | Her Müşteri İçin Doğru Portföy'
const SEO_DESC = 'EstateMatch, müşterinizin ihtiyaçlarını anlayıp yüzlerce portföy arasından en güçlü eşleşmeleri saniyeler içinde bulur.'

export default function EstateMatchPage({ goBack, onDemo }) {
  usePageSeo({
    title: SEO_TITLE,
    description: SEO_DESC,
    path: '/estatematch',
    ogImage: 'https://sryverse.com/screens/property-fulya.png',
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
  const demo = useCallback(() => { onDemo ? onDemo() : goBack?.() }, [onDemo, goBack])

  return (
    <main className="mx-page">
      <Hero goBack={goBack} />
      <Shrink />
      <How />
      <TryMatch />
      <Editorial />
      <Breath />
      <Explore />
      <Ask />
      <BeforeAfter />
      <Who />
      <Final demo={demo} />
    </main>
  )
}
