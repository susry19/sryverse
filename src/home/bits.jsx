/* Ana sayfa yapı taşları: görünürlükte giriş, ilerleme yardımcıları,
   ürün işareti, gerçek ekran kesiti ve ürün çerçevesi. */
import { useEffect, useRef } from 'react'
import { kapi, yumusa } from '../estate/scroll.js'

export const sm = (p, a, b) => yumusa(kapi(p, a, b))
export const mix = (a, b, t) => a + (b - a) * t

/* Görünürlükte bir kez `is-in` sınıfı; azaltılmış harekette anında. */
export function useIn(margin = '0px 0px -8% 0px') {
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
export function Mark({ name }) {
  return (
    <p className="h-mark">
      <img src="/sryverse-icon.png" alt="" width="20" height="20" />
      <span className="h-mark__n">{name}</span>
      <span className="h-mark__by">by SRYVERSE</span>
    </p>)
}

/* Gerçek ekran görüntüsünden seçilmiş bir bölge: (x, y, cw, ch) doğal
   boyutu (w, h) olan görselin içinden kesilir; çerçeve oranı cw/ch. */
export function Crop({ src, w, h, x, y, cw, ch, alt = '', priority = false, className = '' }) {
  return (
    <div className={`h-crop ${className}`} style={{ aspectRatio: `${cw} / ${ch}` }}>
      <img src={src} alt={alt} width={w} height={h} loading={priority ? 'eager' : 'lazy'} decoding="async" draggable="false"
        style={{ width: `${(w / cw * 100).toFixed(3)}%`, left: `${(-x / cw * 100).toFixed(3)}%`, top: `${(-y / ch * 100).toFixed(3)}%` }} />
    </div>)
}

/* Ürün çerçevesi: ince üst çubuk (ürün · ekran adı) ve gövde */
export function Frame({ title, className = '', children }) {
  return (
    <div className={`pf ${className}`}>
      <div className="pf__bar"><i aria-hidden="true" /><span>{title}</span></div>
      <div className="pf__body">{children}</div>
    </div>)
}

export const WA = 'https://wa.me/905315178170?text=Merhaba%2C%20SRYVERSE%20%C3%BCr%C3%BCnleri%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum.'
