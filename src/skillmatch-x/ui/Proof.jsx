import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from '../lib/scroll.js'

/* Dev rakamlar: görünür olunca sıfırdan sayar. Her rakam ürünün kendi
   sabiti ya da bu sayfanın doğrulanmış bir ölçümüdür. */
function Count({ to, run }) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!run) return
    let raf = 0; const t0 = performance.now()
    const f = (t) => { const k = Math.min(1, (t - t0) / 1400); setV(Math.round(to * (1 - Math.pow(1 - k, 3)))); if (k < 1) raf = requestAnimationFrame(f) }
    raf = requestAnimationFrame(f)
    return () => cancelAnimationFrame(raf)
  }, [run, to])
  return v
}

export default function Proof({ eyebrow, title, stats }) {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const v = useInView(ref, { margin: '0px 0px -25% 0px' })
  return (
    <section ref={ref} className="pf" aria-label={eyebrow}>
      <div className="sx-wrap">
        <span className="sx-eyebrow sx-eyebrow--on">{eyebrow}</span>
        <h2 className="pf__h">{title}</h2>
        <ul className="pf__grid">
          {stats.map((s) => (
            <li key={s.label}>
              <span className="pf__n" aria-label={`${s.value}${s.unit || ''}`}>
                <span aria-hidden="true">{reduced ? s.value : <Count to={s.value} run={v} />}{s.unit && <small>{s.unit}</small>}</span>
              </span>
              <p className="pf__l"><b>{s.label}</b>{s.note}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
