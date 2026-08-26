import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Sayfaya ozel SEO/meta enjeksiyonu — SPA oldugu icin sayfa gecislerinde
 * document.title, meta description, canonical, OG/Twitter etiketlerini
 * gunceller ve component unmount olunca oncesindeki degerlere geri doner
 * (mevcut etiketleri silmez, yalnizca kendi eklediklerini kaldirir).
 */
export function usePageSeo({ title, description, path, ogImage }) {
  useEffect(() => {
    const prevTitle = document.title
    document.title = title

    const upsert = (selector, makeEl, attr, value) => {
      let el = document.head.querySelector(selector)
      const existed = !!el
      const prevValue = existed ? el.getAttribute(attr) : null
      if (!el) { el = makeEl(); document.head.appendChild(el) }
      el.setAttribute(attr, value)
      return { el, existed, prevValue, attr }
    }

    const url = `https://sryverse.com${path}`
    const records = [
      upsert('meta[name="description"]', () => { const m = document.createElement('meta'); m.setAttribute('name', 'description'); return m }, 'content', description),
      upsert('link[rel="canonical"]', () => { const l = document.createElement('link'); l.setAttribute('rel', 'canonical'); return l }, 'href', url),
      upsert('meta[property="og:title"]', () => { const m = document.createElement('meta'); m.setAttribute('property', 'og:title'); return m }, 'content', title),
      upsert('meta[property="og:description"]', () => { const m = document.createElement('meta'); m.setAttribute('property', 'og:description'); return m }, 'content', description),
      upsert('meta[property="og:type"]', () => { const m = document.createElement('meta'); m.setAttribute('property', 'og:type'); return m }, 'content', 'website'),
      upsert('meta[property="og:url"]', () => { const m = document.createElement('meta'); m.setAttribute('property', 'og:url'); return m }, 'content', url),
      upsert('meta[name="twitter:card"]', () => { const m = document.createElement('meta'); m.setAttribute('name', 'twitter:card'); return m }, 'content', 'summary_large_image'),
      upsert('meta[name="twitter:title"]', () => { const m = document.createElement('meta'); m.setAttribute('name', 'twitter:title'); return m }, 'content', title),
      upsert('meta[name="twitter:description"]', () => { const m = document.createElement('meta'); m.setAttribute('name', 'twitter:description'); return m }, 'content', description),
      ...(ogImage ? [upsert('meta[property="og:image"]', () => { const m = document.createElement('meta'); m.setAttribute('property', 'og:image'); return m }, 'content', ogImage)] : []),
    ]

    return () => {
      document.title = prevTitle
      records.forEach(({ el, existed, prevValue, attr }) => {
        if (existed) el.setAttribute(attr, prevValue)
        else el.remove()
      })
    }
  }, [title, description, path, ogImage])
}

/** Sayfaya JSON-LD structured data ekler; unmount olunca kaldirir. */
export function usePageSchema(schema) {
  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(schema)
    document.head.appendChild(script)
    return () => script.remove()
  }, [schema])
}

/** Tekrarlayan "kucuk etiket + baslik" bolum girisi (ecs__eye + ecs__h2). */
export function SectionHead({ eyebrow, children, note }) {
  return (
    <>
      <span className="ecs__eye">{typeof eyebrow === 'string' ? eyebrow.toLocaleUpperCase('tr-TR') : eyebrow}</span>
      <h2 className="ecs__h2">{children}</h2>
      {note && <p className="ecs__p" style={{ marginTop: '.6rem', fontSize: '.85rem' }}>{note}</p>}
    </>
  )
}

/* Scroll ile beliren sarmalayici */
export function Rev({ children, delay = 0 }) {
  const ref = useRef(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setOn(true); io.disconnect() }
    }, { threshold: 0.15 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={ref} className={`erev${on ? ' erev--on' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

/* Gorunurken sayarak yukselen deger */
export function Count({ value }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(value)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const m = String(value).match(/^(\D*)([\d.,]+)(.*)$/s)
    if (!m || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const [, pre, numRaw, post] = m
    const decimals = numRaw.includes('.') ? (numRaw.split('.')[1] || '').length : 0
    const target = parseFloat(numRaw.replace(/,/g, ''))
    if (!isFinite(target)) return

    let raf = 0, start = 0
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const step = (ts) => {
        if (!start) start = ts
        const p = Math.min(1, (ts - start) / 1300)
        const v = target * (1 - Math.pow(1 - p, 3))
        setShown(pre + v.toFixed(decimals) + post)
        if (p < 1) raf = requestAnimationFrame(step)
      }
      raf = requestAnimationFrame(step)
    }, { threshold: 0.5 })
    io.observe(el)
    return () => { io.disconnect(); if (raf) cancelAnimationFrame(raf) }
  }, [value])

  return <span ref={ref}>{shown}</span>
}

/* Animasyonlu arka plan sahnesi — telefon/laptop maketlerinin uzerinde durdugu zemin */
export function DeviceStage({ children, className = '' }) {
  return (
    <div className={`eshot-stage${className ? ' ' + className : ''}`}>
      <div className="eshot-stage__glow" aria-hidden="true" />
      <div className="eshot-stage__glow eshot-stage__glow--b" aria-hidden="true" />
      <div className="eshot-stage__glow eshot-stage__glow--c" aria-hidden="true" />
      {children}
    </div>
  )
}

/**
 * Yuzen telefon maketi — kaydiran ekran, cam parlamasi, fare ile 3D egim.
 * `chips`: cihazin yaninda yuzen rozet(ler) icin JSX (opsiyonel).
 */
export function DeviceMock({ src, alt, domain, missing, icon, title, onImgError, chips, className = '' }) {
  const frameRef = useRef(null)

  const onMove = useCallback((e) => {
    const el = frameRef.current
    if (!el || window.matchMedia('(max-width: 900px)').matches) return
    const r = el.getBoundingClientRect()
    const mx = (e.clientX - r.left) / r.width - .5
    const my = (e.clientY - r.top) / r.height - .5
    el.style.setProperty('--etx', `${(-my * 6).toFixed(2)}deg`)
    el.style.setProperty('--ety', `${(mx * 8).toFixed(2)}deg`)
  }, [])
  const onLeave = useCallback(() => {
    const el = frameRef.current
    if (!el) return
    el.style.setProperty('--etx', '2deg')
    el.style.setProperty('--ety', '-5deg')
  }, [])

  return (
    <div
      className={`ephone${className ? ' ' + className : ''}`}
      ref={frameRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {domain && <span className="ephone__badge">{domain}</span>}
      <div className="ephone__body">
        <div className="ephone__notch" />
        <div className="ephone__screen">
          {!missing && (
            <div className="ephone__scroll" key={src}>
              <img className="ephone__img" src={src} alt={alt} loading="lazy" onError={onImgError} />
            </div>
          )}
          {missing && (
            <div className="eshot__ph">
              <div className="eshot__phgrid" />
              <div className="eshot__phscan" />
              <span className="eshot__phicon">{icon}</span>
              <span className="eshot__phtitle">{title}</span>
              <span className="eshot__phnote">Ekran görüntüsü yakında</span>
            </div>
          )}
          <div className="ephone__sheen" />
        </div>
        <div className="ephone__home" />
      </div>
      {chips}
    </div>
  )
}

const PER_PAGE = 3

/**
 * Ekran turu — 3'erli sayfalarda kayan liste + secili ekranin goruntusu.
 * `screens`: [{ key, n, t, d, icon }]
 * `domain`: cerceve ust cubugunda gosterilen adres
 * `product`: gorsel alt metni icin urun adi
 * `groups` (opsiyonel): [{ label, keys: [screenKey, ...] }] — verilirse
 *   ekranlar kategori sekmelerine gruplanir; verilmezse eski sabit
 *   3'erli sayfalama davranisi degismeden calisir (SkillMatch icin).
 */
export function ScreenTour({ screens, domain, product, groups }) {
  const [active, setActive] = useState(() => groups ? Math.max(0, screens.findIndex(x => x.key === groups[0].keys[0])) : 0)
  const [failed, setFailed] = useState(() => new Set())
  const s = screens[active]
  const missing = failed.has(s.key)

  const prev = useCallback(() => {
    setActive(a => (a - 1 + screens.length) % screens.length)
  }, [screens.length])
  const next = useCallback(() => {
    setActive(a => (a + 1) % screens.length)
  }, [screens.length])
  const pages = Math.ceil(screens.length / PER_PAGE)
  const goPage = useCallback((p) => {
    const nextPage = ((p % pages) + pages) % pages
    setActive(nextPage * PER_PAGE)
  }, [pages])

  if (groups) {
    const activeGroupIdx = Math.max(0, groups.findIndex(g => g.keys.includes(s.key)))
    const activeGroup = groups[activeGroupIdx]

    return (
      <div className="etour etour--grouped">
        <div className="etour__nav">
          <div className="etour__tabs" role="tablist">
            {groups.map((g, gi) => (
              <button
                key={g.label}
                className={`etour__tab${gi === activeGroupIdx ? ' etour__tab--on' : ''}`}
                role="tab"
                aria-selected={gi === activeGroupIdx}
                onClick={() => setActive(screens.findIndex(x => x.key === g.keys[0]))}
              >
                {g.label}
              </button>
            ))}
          </div>
          <div className="etour__grid">
            {activeGroup.keys.map(k => {
              const i = screens.findIndex(x => x.key === k)
              const x = screens[i]
              return (
                <button
                  key={k}
                  className={`etour__btn${i === active ? ' etour__btn--on' : ''}`}
                  onClick={() => setActive(i)}
                  aria-current={i === active}
                >
                  <span className="etour__n">{x.n}</span>
                  <span className="etour__t">{x.t}</span>
                  <span className="etour__d">{x.d}</span>
                </button>
              )
            })}
          </div>
          <div className="etour__ctrl">
            <button className="etour__arrow" onClick={prev} aria-label="Önceki ekran">‹</button>
            <span className="etour__count">
              {String(active + 1).padStart(2, '0')} / {String(screens.length).padStart(2, '0')}
            </span>
            <button className="etour__arrow" onClick={next} aria-label="Sonraki ekran">›</button>
          </div>
        </div>

        <DeviceStage>
          <DeviceMock
            src={s.src}
            alt={`${product} — ${s.t} ekranı`}
            domain={domain}
            missing={missing}
            icon={s.icon}
            title={s.t}
            onImgError={() => setFailed(prev => new Set(prev).add(s.key))}
            chips={<>
              <span className="ephone__chip ephone__chip--live"><i />Canlı ürün</span>
              <span className="ephone__chip ephone__chip--ai">✦ AI destekli</span>
            </>}
          />
        </DeviceStage>
      </div>
    )
  }

  const page = Math.floor(active / PER_PAGE)

  return (
    <div className="etour">
      <div className="etour__nav">
        <div className="etour__viewport">
          <div className="etour__track" style={{ transform: `translateX(-${page * 100}%)` }}>
            {Array.from({ length: pages }, (_, p) => (
              <div className="etour__page" key={p}>
                {screens.slice(p * PER_PAGE, p * PER_PAGE + PER_PAGE).map((x) => {
                  const i = screens.indexOf(x)
                  return (
                    <button
                      key={x.key}
                      className={`etour__btn${i === active ? ' etour__btn--on' : ''}`}
                      onClick={() => setActive(i)}
                      aria-current={i === active}
                      tabIndex={p === page ? 0 : -1}
                    >
                      <span className="etour__n">{x.n}</span>
                      <span className="etour__t">{x.t}</span>
                      <span className="etour__d">{x.d}</span>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="etour__ctrl">
          <button className="etour__arrow" onClick={prev} aria-label="Önceki ekran">‹</button>
          <div className="etour__dots">
            {Array.from({ length: pages }, (_, p) => (
              <button
                key={p}
                className={`etour__dot${p === page ? ' etour__dot--on' : ''}`}
                onClick={() => goPage(p)}
                aria-label={`${p + 1}. grup`}
              />
            ))}
          </div>
          <span className="etour__count">
            {String(active + 1).padStart(2, '0')} / {String(screens.length).padStart(2, '0')}
          </span>
          <button className="etour__arrow" onClick={next} aria-label="Sonraki ekran">›</button>
        </div>
      </div>

      <DeviceStage>
        <DeviceMock
          src={s.src}
          alt={`${product} — ${s.t} ekranı`}
          domain={domain}
          missing={missing}
          icon={s.icon}
          title={s.t}
          onImgError={() => setFailed(prev => new Set(prev).add(s.key))}
          chips={<>
            <span className="ephone__chip ephone__chip--live"><i />Canlı ürün</span>
            <span className="ephone__chip ephone__chip--ai">✦ AI destekli</span>
          </>}
        />
      </DeviceStage>
    </div>
  )
}

/* Acilir kapanir SSS satiri */
export function Faq({ q, a, open, onToggle }) {
  return (
    <div className={`efaq${open ? ' efaq--on' : ''}`}>
      <button className="efaq__q" onClick={onToggle} aria-expanded={open}>
        {q}
        <span className="efaq__ico" />
      </button>
      <div className="efaq__a"><p>{a}</p></div>
    </div>
  )
}

export const TRY = new Intl.NumberFormat('tr-TR')

/**
 * ROI hesaplayici — alanlar urune gore parametrik.
 * `fields`: [{ key, label, min, max, step, unit }]
 * `compute(values)` -> { hours, monthly, yearly, days }
 */
export function RoiCalc({ fields, initial, compute, note }) {
  const [v, setV] = useState(initial)
  const set = (k, n) => setV(prev => ({ ...prev, [k]: n }))
  const out = compute(v)

  return (
    <div className="eroi">
      <div className="eroi__ctrls">
        {fields.map(f => (
          <div className="eroi__f" key={f.key}>
            <label>
              {f.label.toLocaleUpperCase('tr-TR')} <b>{f.prefix || ''}{TRY.format(v[f.key])}{f.unit || ''}</b>
            </label>
            <input
              type="range"
              min={f.min} max={f.max} step={f.step || 1}
              value={v[f.key]}
              onChange={e => set(f.key, +e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="eroi__out">
        <span className="eroi__lbl">Aylık tahmini zaman kazanımı</span>
        <div className="eroi__big">{TRY.format(out.hours)} saat</div>
        <p className="eroi__sub">≈ ₺{TRY.format(out.monthly)} değerinde zaman</p>
        <div className="eroi__div" />
        <div className="eroi__row">
          <span className="eroi__lbl">Yıllık karşılığı</span>
          <span className="eroi__rv">₺{TRY.format(out.yearly)}</span>
        </div>
        <div className="eroi__row">
          <span className="eroi__lbl">İş günü / ay</span>
          <span className="eroi__rv">{TRY.format(out.days)} gün</span>
        </div>
        <p className="eroi__note">{note}</p>
      </div>
    </div>
  )
}
