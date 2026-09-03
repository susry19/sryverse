/* Sahne 02 — Sorun.
   Noktalar birikir (daha çok veri, araç, sinyal), sonra sahne boşalır;
   iki nokta kalır ve aralarındaki çizgi çekilir: cevap vardı, bağlantı yoktu.
   Tek ilerleme kaynağı: kaydırma. Mobil ve azaltılmış harekette akışta. */
import { useMemo, useRef, useState } from 'react'
import { useTrack, useStack } from '../estate/scroll.js'
import { sm, rnd, ty, In } from './bits.jsx'

function usePts() {
  return useMemo(() => Array.from({ length: 64 }, (_, i) => ({
    x: 4 + rnd(i) * 92, y: 6 + rnd(i + 70) * 88, r: .1 + rnd(i + 140) * .22, t: .02 + rnd(i + 210) * .38,
  })), [])
}

function Stacked() {
  return (
    <section id="sorun" className="hp hp--stack" data-theme="dark" aria-label="Sorun">
      <div className="h-wrap">
        <In className="hp__blk">
          <p>Daha çok veri.</p><p>Daha çok araç.</p><p>Daha çok sinyal.</p>
          <p className="hp__but">Ama her zaman daha iyi kararlar değil.</p>
        </In>
        <In className="hp__blk">
          <p>Bazen cevap zaten vardır.</p>
        </In>
        <In className="hp__blk hp__blk--con">
          <svg viewBox="0 0 100 24" aria-hidden="true" className="hp__mini">
            <circle cx="10" cy="12" r="1.4" /><circle cx="90" cy="12" r="1.4" />
            <path d="M10 12 C40 12, 60 12, 90 12" pathLength="1" />
          </svg>
          <p>Eksik olan <em>bağlantıdır.</em></p>
        </In>
      </div>
    </section>)
}

export default function Problem() {
  const stack = useStack()
  const ref = useRef(null)
  const [p, setP] = useState(0)
  const pts = usePts()
  useTrack(ref, v => { const q = Math.round(v * 1000) / 1000; setP(x => x === q ? x : q) })
  if (stack) return <Stacked />

  const l = [sm(p, .03, .09), sm(p, .10, .16), sm(p, .17, .23), sm(p, .28, .36)]
  const out = 1 - sm(p, .46, .54)
  const c1 = sm(p, .58, .66)
  const c2 = sm(p, .80, .88)
  const dots = sm(p, .56, .62)
  const draw = sm(p, .84, .97)

  return (
    <section id="sorun" className="hp" data-theme="dark" aria-label="Sorun">
      <div className="hs-track" ref={ref} style={{ height: '340svh' }}>
        <div className="hs-stage">
          <svg className="hp__field" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            {pts.map((q, i) => <circle key={i} cx={q.x} cy={q.y} r={q.r} style={{ opacity: sm(p, q.t, q.t + .05) * out * .6 }} />)}
            <g className="hp__pair" style={{ opacity: dots }}>
              <circle cx="31" cy="50" r=".38" /><circle cx="69" cy="50" r=".38" />
              <path d="M31 50 C45 50, 55 50, 69 50" pathLength="1" style={{ strokeDashoffset: 1 - draw, opacity: draw > 0 ? 1 : 0 }} />
              <circle className="is-on" cx="69" cy="50" r=".38" style={{ opacity: sm(p, .95, 1) }} />
            </g>
          </svg>
          <div className="hp__txt">
            <div className="hp__a" style={{ opacity: out }} aria-hidden={out < .5}>
              <p style={{ opacity: l[0], transform: ty(l[0]) }}>Daha çok veri.</p>
              <p style={{ opacity: l[1], transform: ty(l[1]) }}>Daha çok araç.</p>
              <p style={{ opacity: l[2], transform: ty(l[2]) }}>Daha çok sinyal.</p>
              <p className="hp__but" style={{ opacity: l[3], transform: ty(l[3]) }}>Ama her zaman daha iyi kararlar değil.</p>
            </div>
            <div className="hp__b" aria-hidden={c1 < .5}>
              <p style={{ opacity: c1, transform: ty(c1) }}>Bazen cevap zaten vardır.</p>
              <p className="hp__con" style={{ opacity: c2, transform: ty(c2) }}>Eksik olan <em>bağlantıdır.</em></p>
            </div>
          </div>
        </div>
      </div>
    </section>)
}
