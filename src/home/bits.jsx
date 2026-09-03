/* Ana sayfa yapı taşları: görünürlükte giriş, ilerleme yardımcıları, ürün işareti. */
import { useEffect, useRef } from 'react'
import { kapi, yumusa } from '../estate/scroll.js'

export const sm = (p, a, b) => yumusa(kapi(p, a, b))
export const win = (p, a, b, f = .05) => sm(p, a, a + f) * (1 - sm(p, b - f, b))
export const mix = (a, b, t) => a + (b - a) * t
/* Deterministik sözde rastgele: her yenilemede aynı kompozisyon */
export const rnd = s => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x) }
export const ty = (o, d = 14) => `translate3d(0, ${((1 - o) * d).toFixed(1)}px, 0)`

/* Görünürlükte bir kez `is-in` sınıfı; azaltılmış harekette anında. */
export function useIn(margin = '0px 0px -10% 0px') {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current; if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.classList.add('is-in'); return }
    const io = new IntersectionObserver(es => { es.forEach(e => { if (e.isIntersecting) { el.classList.add('is-in'); io.disconnect() } }) }, { rootMargin: margin })
    io.observe(el); return () => io.disconnect()
  }, [margin])
  return ref
}
export function In({ as: Tag = 'div', className = '', delay = 0, children, ...rest }) {
  const ref = useIn()
  return <Tag ref={ref} className={`h-in ${className}`} style={delay ? { '--d': `${delay}ms` } : undefined} {...rest}>{children}</Tag>
}

/* Ürün işareti: "EstateMatch · by SRYVERSE" */
export function Mark({ name, tag }) {
  return (
    <p className="h-mark">
      <img src="/sryverse-icon.png" alt="" width="18" height="18" />
      <span className="h-mark__n">{name}</span>
      <span className="h-mark__by">by SRYVERSE</span>
      {tag && <span className="h-mark__tag">{tag}</span>}
    </p>)
}

export const WA = 'https://wa.me/905315178170?text=Merhaba%2C%20SRYVERSE%20%C3%BCr%C3%BCnleri%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum.'
