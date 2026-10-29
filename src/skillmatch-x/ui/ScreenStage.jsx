import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../lib/scroll.js'
import { asset } from '../lib/asset.js'

/* Gerçek ürün ekranları, katmanlı derinlik kompozisyonu. Sahne görünür
   alana girerken arka katman uzakta ve eğik durur; kaydırdıkça ekranlar
   düzleşir, öne gelir ve birbirinden ayrılır. Ardından aynı ekranın
   etkileşimli hâli (bir sonraki sahne) başlar. Görseller yerel SkillMatch
   kurulumundan, sentetik veriyle alındı. */
export default function ScreenStage({ shots, caption }) {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  useEffect(() => {
    const el = ref.current; if (!el || reduced) return
    let raf = 0
    const f = () => {
      raf = 0
      const r = el.getBoundingClientRect(), vh = window.innerHeight
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height * 0.6)))
      el.style.setProperty('--p', p.toFixed(3))
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(f) }
    window.addEventListener('scroll', on, { passive: true }); window.addEventListener('resize', on); f()
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf) }
  }, [reduced])
  return (
    <figure ref={ref} className={`ss${reduced ? ' ss--still' : ''}`} style={{ '--n': shots.length }}>
      <div className="ss__stage">
        {shots.map((s, i) => (
          <div key={s.name} className="ss__layer" style={{ '--i': i }}>
            <div className="ss__chrome" aria-hidden="true"><i /><i /><i /><span>skillmatch.sryverse.com{s.path || ''}</span></div>
            <img src={asset(`skillmatch-x/screens/${s.name}-1600.webp`)} srcSet={`${asset(`skillmatch-x/screens/${s.name}-960.webp`)} 960w, ${asset(`skillmatch-x/screens/${s.name}-1600.webp`)} 1600w`}
              sizes="(max-width: 760px) 92vw, min(82vw, 1040px)" alt={s.alt} loading="lazy" decoding="async" width="1600" height="1000" />
          </div>
        ))}
      </div>
      {caption && <figcaption className="ss__cap">{caption}</figcaption>}
    </figure>
  )
}
