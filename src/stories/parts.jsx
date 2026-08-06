import { useState, useEffect, useRef } from 'react'

/* Scroll ile beliren sarmalayıcı */
export function Fx({ children, delay = 0, threshold = 0.15 }) {
  const ref = useRef(null)
  const [on, setOn] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setOn(true); io.disconnect() }
    }, { threshold })
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])

  return (
    <div ref={ref} className={`pfx${on ? ' pfx--on' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

/**
 * Koyu sahne paneli — scroll'a göre derinlikte eğilir.
 * Görüş alanına girerken hafifçe yatık ve küçük, merkeze gelince
 * tam doğrulur, çıkarken geri yatar. Ölçüm rAF'ta yapılır.
 */
export function Scene({ children }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.matchMedia('(max-width: 900px)').matches) return

    let raf = 0
    let visible = false

    const apply = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight
      // Sahnenin merkezinin ekran ortasına uzaklığı: -1 (üstte) → 0 (ortada) → 1 (altta)
      const center = (r.top + r.height / 2 - vh / 2) / vh
      const c = Math.max(-1.2, Math.min(1.2, center))
      const away = Math.abs(c)

      const rotX = -c * 7                       // yaklaşırken doğrul, uzaklaşırken yat
      const scale = 1 - away * 0.055
      const ty = c * 26
      const op = 1 - away * 0.45

      el.style.transform = `perspective(1600px) rotateX(${rotX.toFixed(2)}deg) scale(${scale.toFixed(3)}) translateY(${ty.toFixed(1)}px)`
      el.style.opacity = Math.max(0.25, op).toFixed(3)
    }

    const onScroll = () => { if (visible && !raf) raf = requestAnimationFrame(apply) }

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible) apply()
    }, { rootMargin: '120px 0px' })
    io.observe(el)

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      if (raf) cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div className="pstory__unit">
      <div className="pscene" ref={ref}>
        <div className="pscene__grid" />
        <div className="pscene__glow" />
        <div className="pscene__edge" />
        <div className="pscene__in">{children}</div>
      </div>
    </div>
  )
}

export const Eye = ({ children }) => <span className="pscene__eye">{children}</span>
export const P = ({ children }) => <p className="pscene__p">{children}</p>

/* Başlık — kelimeler sırayla aşağıdan yükselir */
export function H({ children }) {
  const ref = useRef(null)
  const [on, setOn] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setOn(true); io.disconnect() }
    }, { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return <h3 ref={ref} className={`pscene__h${on ? ' pscene__h--on' : ''}`}>{children}</h3>
}

/**
 * Görünür olunca hedef değere sayarak yükselen metin.
 * Sayı olmayan kısımları (%, sn, ₺, +) olduğu gibi korur.
 */
function useCountUp(text, duration = 1400) {
  const ref = useRef(null)
  const [shown, setShown] = useState(text)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const m = String(text).match(/^(\D*)([\d.,]+)(.*)$/s)
    if (!m || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(text)
      return
    }

    const [, pre, numRaw, post] = m
    // "6.2" gibi ondalıklar: nokta ondalık ayırıcı, virgül binlik
    const decimals = numRaw.includes('.') ? (numRaw.split('.')[1] || '').length : 0
    const target = parseFloat(numRaw.replace(/,/g, ''))
    if (!isFinite(target)) { setShown(text); return }

    let raf = 0, start = 0
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const step = (ts) => {
        if (!start) start = ts
        const p = Math.min(1, (ts - start) / duration)
        const eased = 1 - Math.pow(1 - p, 3)
        const v = target * eased
        setShown(pre + v.toFixed(decimals) + post)
        if (p < 1) raf = requestAnimationFrame(step)
      }
      raf = requestAnimationFrame(step)
    }, { threshold: 0.5 })

    io.observe(el)
    return () => { io.disconnect(); if (raf) cancelAnimationFrame(raf) }
  }, [text, duration])

  return [ref, shown]
}

function Metric({ v, l }) {
  const [ref, shown] = useCountUp(v)
  return (
    <div className="pmetric">
      <div className="pmetric__v" ref={ref}>{shown}</div>
      <span className="pmetric__l">{l}</span>
      <div className="pmetric__spark" />
    </div>
  )
}

/* Metrik şeridi */
export function Metrics({ items }) {
  return (
    <div className="pmetrics">
      {items.map((m, i) => <Metric key={i} v={m.v} l={m.l} />)}
    </div>
  )
}

/* Sahne sonu eylem satırı */
export function CtaRow({ href, label, onDemo }) {
  return (
    <div className="pcta-row">
      {href && (
        <a className="pbtn pbtn--solid" href={href} target="_blank" rel="noopener noreferrer">
          {label} <span>→</span>
        </a>
      )}
      <button className="pbtn pbtn--ghost" onClick={onDemo}>
        Demo Talep Et <span>→</span>
      </button>
    </div>
  )
}
