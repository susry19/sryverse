import { useEffect, useRef, useState } from 'react'
import { useTrack, useReducedMotion, useCompact, smooth, clamp01 } from '../lib/scroll.js'
import Kinetic from './Kinetic.jsx'
import { asset } from '../lib/asset.js'

/* Sinematik bölüm açılışı: ekrana yapışan bir sahne. Kaydırdıkça
   1) başlık açılır, 2) gerçek ürün ekranları eğik ve uzaktan gelip
   düzleşir, 3) arka ekranlar çekilir, 4) kamera ön ekrandaki her kurala
   sırayla yaklaşır ve yanında kuralın açıklaması belirir, 5) geri çekilir.
   Tüm hareket CSS değişkenleriyle doğrudan yazılır; React yalnız etkin
   işaret değişince çizer. Görseller yerel SkillMatch kurulumundan,
   sentetik veriyle alındı. */

const lerp = (a, b, t) => a + (b - a) * t
const seg = (p, a, b) => clamp01((p - a) / (b - a))

const RISE = [0.06, 0.3]      // ekranlar gelir ve düzleşir
const CLEAR = [0.3, 0.38]     // arka ekranlar çekilir
const TOUR = [0.38, 0.93]     // işaretler arası yakınlaşma

function src(name, w) { return asset(`skillmatch-x/screens/${name}-${w}.webp`) }

function Shot({ s, className = '', style, front }) {
  return (
    <div className={`cine__shot ${className}`} style={style}>
      <div className="cine__chrome" aria-hidden="true"><i /><i /><i /><span>skillmatch.sryverse.com{s.path || ''}</span></div>
      <img src={src(s.name, 1600)} srcSet={`${src(s.name, 960)} 960w, ${src(s.name, 1600)} 1600w`}
        sizes={front ? '(max-width: 760px) 92vw, 80vw' : '40vw'} alt={s.alt} loading="lazy" decoding="async" width="1600" height="1000" />
    </div>
  )
}

export default function CineScene({ n, act, kicker, line, shots, caption }) {
  const track = useRef(null)
  const stage = useRef(null)
  const cam = useRef(null)
  const reduced = useReducedMotion()
  const compact = useCompact()
  const front = shots[shots.length - 1]
  const back = shots.slice(0, -1)
  const pins = front.pins || []
  const [active, setActive] = useState(-1)
  const [title, setTitle] = useState(false)
  const geo = useRef(null)

  // Ön ekranın yerleşimi: sahne ortasında, ekrana sığan en büyük boy
  useEffect(() => {
    if (reduced) return
    const f = () => {
      const vw = window.innerWidth, vh = window.innerHeight
      const W = compact ? vw * 0.92 : Math.min(vw * 0.8, (vh - 150) * 1.6, 1360)
      const H = W / 1.6 + 26
      geo.current = { vw, vh, W, H, L: (vw - W) / 2, T: (vh - H) / 2 + (compact ? -20 : 18) }
      const el = stage.current
      if (el) { el.style.setProperty('--W', `${W}px`); el.style.setProperty('--L', `${geo.current.L}px`); el.style.setProperty('--T', `${geo.current.T}px`) }
    }
    f(); window.addEventListener('resize', f)
    return () => window.removeEventListener('resize', f)
  }, [reduced, compact])

  useTrack(track, (p, rect) => {
    const el = stage.current, g = geo.current
    if (!el || !g || reduced) return
    if (rect.top < window.innerHeight * 0.55) setTitle(true)
    // başlık: önde büyük, ekranlar gelirken yukarı süzülür ve söner
    const tOut = smooth(seg(p, 0.1, 0.24))
    el.style.setProperty('--title-y', `${-tOut * 22}vh`)
    el.style.setProperty('--title-o', (1 - tOut).toFixed(3))
    el.style.setProperty('--title-s', (1 - tOut * 0.08).toFixed(3))
    // yükseliş: eğik, küçük ve aşağıda → düz ve ortada
    const r = smooth(seg(p, RISE[0], RISE[1]))
    el.style.setProperty('--rise', r.toFixed(4))
    el.style.setProperty('--fan', smooth(seg(p, RISE[0] + 0.06, RISE[1])).toFixed(4))
    el.style.setProperty('--clear', smooth(seg(p, CLEAR[0], CLEAR[1])).toFixed(4))
    el.style.setProperty('--glow', (r * (1 - 0.35 * seg(p, TOUR[0], TOUR[1]))).toFixed(3))

    // kamera turu: tam görünüm → işaret 1 → … → tam görünüm
    let s = 1, tx = 0, ty = 0, idx = -1
    if (pins.length) {
      const span = (TOUR[1] - TOUR[0]) / (pins.length + 0.6)
      const zoom = compact ? 2.3 : 2.05
      const aim = compact ? { x: g.vw * 0.5, y: g.vh * 0.34 } : { x: g.vw * 0.36, y: g.vh * 0.5 }
      const state = (k) => {
        if (k < 0 || k >= pins.length) return { s: 1, tx: 0, ty: 0 }
        const px = (pins[k].x / 100) * g.W, py = 26 + (pins[k].y / 100) * (g.W / 1.6)
        return { s: zoom, tx: aim.x - g.L - zoom * px, ty: aim.y - g.T - zoom * py }
      }
      const q = p - TOUR[0]
      let a = -1, b = -1, t = 0
      if (q <= 0) { a = b = -1 }
      else if (q >= span * pins.length) { a = pins.length - 1; b = pins.length; t = smooth(seg(q, span * pins.length, span * (pins.length + 0.6))) }
      else {
        const k = Math.floor(q / span), w = (q - k * span) / span
        a = k - 1; b = k; t = smooth(seg(w, 0, 0.42))
        idx = w > 0.3 ? k : k - 1
      }
      if (q >= span * pins.length) idx = t < 0.35 ? pins.length - 1 : -1
      const A = state(a), B = state(b)
      s = lerp(A.s, B.s, t); tx = lerp(A.tx, B.tx, t); ty = lerp(A.ty, B.ty, t)
    }
    if (cam.current) {
      cam.current.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) scale(${s.toFixed(4)})`
      cam.current.style.setProperty('--inv', (1 / s).toFixed(4))
    }
    el.style.setProperty('--end', smooth(seg(p, 0.93, 1)).toFixed(3))
    setActive(idx)
  })

  if (reduced) {
    return (
      <section data-act={act} className="cine cine--still" aria-label={kicker}>
        <div className="sx-wrap">
          <div className="cine__meta">{n && <b>Bölüm {n}</b>}<i aria-hidden="true" /><span className="sx-eyebrow sx-eyebrow--on">{kicker}</span></div>
          <p className="cine__line">{line}</p>
          <div className="cine__still">
            <div className="cine__stillshot">
              <Shot s={front} front />
              <div className="cine__dots" aria-hidden="true">
                {pins.map((pn, k) => <span key={k} className="cine__dot" style={{ left: `${pn.x}%`, top: `${pn.y}%` }}>{k + 1}</span>)}
              </div>
            </div>
            <ol className="cine__notes">{pins.map((pn, k) => <li key={k}><b>{pn.t}</b><span>{pn.d}</span></li>)}</ol>
          </div>
          {caption && <p className="cine__cap">{caption}</p>}
        </div>
      </section>
    )
  }

  return (
    <section ref={track} data-act={act} className="cine" style={{ '--pins': pins.length, '--n': back.length }} aria-label={kicker}>
      <div ref={stage} className="cine__stage">
        <div className="cine__aurora" aria-hidden="true"><i /><i /><i /></div>
        {n && <span className="cine__big" aria-hidden="true">{n}</span>}

        <div className="cine__title">
          <div className="cine__meta">{n && <b>Bölüm {n}</b>}<i aria-hidden="true" /><span className="sx-eyebrow sx-eyebrow--on">{kicker}</span></div>
          <p className="cine__line"><Kinetic text={line} play={title} step={46} /></p>
        </div>

        <div className="cine__world">
          {back.map((s, i) => (
            <Shot key={s.name} s={s} className="cine__back" style={{ '--i': i, '--side': i % 2 ? 1 : -1, '--rank': Math.floor(i / 2) + 1 }} />
          ))}
          <div className="cine__frontwrap">
            <div ref={cam} className="cine__cam">
              <Shot s={front} className="cine__front" front />
              {pins.map((pn, k) => (
                <span key={k} className={`cine__ring${active === k ? ' is-on' : ''}`} style={{ left: `${pn.x}%`, top: `calc(26px + ${pn.y / 100} * (var(--W) / 1.6))` }} aria-hidden="true" />
              ))}
            </div>
          </div>
        </div>

        {pins.length > 0 && (
          <div className="cine__callout" aria-live="polite">
            {pins.map((pn, k) => (
              <div key={k} className={`cine__note${active === k ? ' is-on' : ''}`} aria-hidden={active !== k}>
                <span className="cine__count">{String(k + 1).padStart(2, '0')} <i>/ {String(pins.length).padStart(2, '0')}</i></span>
                <b>{pn.t}</b>
                <p>{pn.d}</p>
              </div>
            ))}
          </div>
        )}
        {caption && <p className="cine__cap">{caption}</p>}
      </div>
    </section>
  )
}
