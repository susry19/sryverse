import { useState, useEffect, useRef, useCallback } from 'react'

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

const PER_PAGE = 3

/**
 * Ekran turu — 3'erli sayfalarda kayan liste + secili ekranin goruntusu.
 * `screens`: [{ key, n, t, d, icon }]
 * `domain`: cerceve ust cubugunda gosterilen adres
 * `product`: gorsel alt metni icin urun adi
 */
export function ScreenTour({ screens, domain, product }) {
  const [active, setActive] = useState(0)
  const [failed, setFailed] = useState(() => new Set())
  const pages = Math.ceil(screens.length / PER_PAGE)
  const s = screens[active]
  const missing = failed.has(s.key)
  const page = Math.floor(active / PER_PAGE)

  const goPage = useCallback((p) => {
    const next = ((p % pages) + pages) % pages
    setActive(next * PER_PAGE)
  }, [pages])

  const prev = useCallback(() => {
    setActive(a => (a - 1 + screens.length) % screens.length)
  }, [screens.length])
  const next = useCallback(() => {
    setActive(a => (a + 1) % screens.length)
  }, [screens.length])

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

      <div className="eshot">
        <div className="eshot__bar">
          <span className="eshot__dot" /><span className="eshot__dot" /><span className="eshot__dot" />
          <span className="eshot__url">{domain} — {s.t}</span>
        </div>
        <div className="eshot__frame">
          {!missing && (
            <img
              key={s.key}
              className="eshot__img"
              src={s.src}
              alt={`${product} — ${s.t} ekranı`}
              loading="lazy"
              onError={() => setFailed(prev => new Set(prev).add(s.key))}
            />
          )}
          {missing && (
            <div className="eshot__ph">
              <div className="eshot__phgrid" />
              <div className="eshot__phscan" />
              <span className="eshot__phicon">{s.icon}</span>
              <span className="eshot__phtitle">{s.t}</span>
              <span className="eshot__phnote">Ekran görüntüsü yakında</span>
            </div>
          )}
        </div>
      </div>
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
              {f.label} <b>{f.prefix || ''}{TRY.format(v[f.key])}{f.unit || ''}</b>
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
