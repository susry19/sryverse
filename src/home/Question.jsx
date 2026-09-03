/* Sahne 08 — Merkezi soru. Neredeyse hiç arayüz yok: tipografi, boşluk ve
   giriş sahnesindeki tek yeşil sinyalin geri dönüşü. */
import { useRef, useState } from 'react'
import { useTrack, useStack } from '../estate/scroll.js'
import { sm, win, ty, In } from './bits.jsx'

export default function Question() {
  const stack = useStack()
  const ref = useRef(null)
  const [p, setP] = useState(0)
  useTrack(ref, v => { const q = Math.round(v * 1000) / 1000; setP(x => x === q ? x : q) })

  if (stack) return (
    <section id="soru" className="hq hq--stack" data-theme="dark" aria-label="Aynı soru">
      <div className="h-wrap">
        <In><p className="hq__l">Farklı sektörler.</p><p className="hq__l">Aynı soru.</p></In>
        <In className="hq__ask" delay={120}><i className="hq__dot" aria-hidden="true" /><p>Neyi gözden kaçırıyoruz?</p></In>
      </div>
    </section>)

  const q1 = win(p, .06, .50, .08), q2 = win(p, .16, .50, .08)
  const ask = sm(p, .60, .72)
  const ring = sm(p, .62, 1)
  return (
    <section id="soru" className="hq" data-theme="dark" aria-label="Aynı soru">
      <div className="hs-track" ref={ref} style={{ height: '260svh' }}>
        <div className="hs-stage">
          <svg className="hq__field" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <circle className="hq__ring" cx="50" cy="50" r={2 + ring * 24} style={{ opacity: (1 - ring) * .5 * (ask > 0 ? 1 : 0) }} />
            <circle className="hq__sig" cx="50" cy="50" r=".7" style={{ opacity: ask }} />
          </svg>
          <div className="hq__txt">
            <p className="hq__l" style={{ opacity: q1, transform: ty(q1) }} aria-hidden={q1 < .5}>Farklı sektörler.</p>
            <p className="hq__l" style={{ opacity: q2, transform: ty(q2) }} aria-hidden={q2 < .5}>Aynı soru.</p>
            <p className="hq__q" style={{ opacity: ask, transform: ty(ask, 18) }} aria-hidden={ask < .5}>Neyi gözden kaçırıyoruz?</p>
          </div>
        </div>
      </div>
    </section>)
}
