import { useEffect, useState } from 'react'

/* Süreç rayı: ziyaretçi hikâyenin neresinde, ürünün akışında hangi adımda. */
export default function Rail({ acts, go }) {
  const [cur, setCur] = useState(acts[0].id)
  useEffect(() => {
    const els = acts.map((a) => document.querySelector(`[data-act="${a.id}"]`))
    const seen = new Map()
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => seen.set(e.target.dataset.act, e.isIntersecting ? e.intersectionRatio : 0))
      let best = null, r = 0
      acts.forEach((a) => { const v = seen.get(a.id) || 0; if (v > r) { r = v; best = a.id } })
      if (best) setCur(best)
    }, { threshold: [0, 0.15, 0.3, 0.5, 0.7], rootMargin: '-35% 0px -35% 0px' })
    const watch = () => document.querySelectorAll('[data-act]').forEach((el) => io.observe(el))
    watch()
    const mo = new MutationObserver(watch)
    mo.observe(document.querySelector('.sx main') || document.body, { childList: true, subtree: true })
    return () => { io.disconnect(); mo.disconnect() }
  }, [acts])
  const idx = acts.findIndex((a) => a.id === cur)
  return (
    <nav className="sx-rail" aria-label="Süreç adımları">
      <ol>
        {acts.map((a, i) => (
          <li key={a.id} className={i === idx ? 'is-cur' : i < idx ? 'is-done' : ''}>
            <a href={`#${a.id}`} onClick={(e) => { e.preventDefault(); go(a.id) }} aria-current={i === idx ? 'step' : undefined}>
              <i aria-hidden="true" /><span>{a.label}</span>
            </a>
          </li>
        ))}
      </ol>
      <div className="sx-rail__bar" aria-hidden="true"><i style={{ width: `${(idx / (acts.length - 1)) * 100}%` }} /></div>
    </nav>
  )
}
