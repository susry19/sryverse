/* Sahne 03 — SRYVERSE fikri: GÖR → BAĞLA → KARAR VER.
   Aynı nokta alanı üç aşamadan geçer: noktalar belirir ve birkaçı sinyal
   olarak öne çıkar; yakın noktalar arasında ilişkiler çizilir; tek bir
   anlamlı yol yeşile döner, düzleşir ve sahneden çıkan çizgi olarak
   ürünler bölümüne devam eder. Görsel, metin olmadan da fikri anlatır. */
import { useMemo, useRef, useState } from 'react'
import { useTrack, useStack } from '../estate/scroll.js'
import { sm, rnd, mix, In } from './bits.jsx'

const ADIM = [
  { n: '01', t: 'Gör', d: 'Sinyalleri fark et. Veri, not, davranış: her şey bir işaret taşır.' },
  { n: '02', t: 'Bağla', d: 'İlişkileri anla. Tek başına anlamsız görünen kayıtlar birlikte okununca konuşur.' },
  { n: '03', t: 'Karar ver', d: 'Bilgiyi anlamlı eyleme dönüştür. Sistem gerekçeyi gösterir; karar insanda kalır.' },
]
const ZINCIR = [5, 14, 22, 31] /* anlamlı yol */
const HEDEF = [[20, 30], [40, 30], [60, 30], [80, 30]]
const ETIKET = ['sinyal', 'bağlam', 'ilişki', 'karar']

function useField() {
  return useMemo(() => {
    const P = Array.from({ length: 36 }, (_, i) => ({ x: 6 + rnd(i + 3) * 88, y: 5 + rnd(i + 51) * 50, r: .38 + rnd(i + 99) * .4, t: rnd(i + 130) * .12 }))
    ZINCIR.forEach((k, i) => { P[k].x = 18 + i * 20 + rnd(k) * 10; P[k].y = 14 + rnd(k + 7) * 32 })
    const E = []
    for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
      const d = Math.hypot(P[i].x - P[j].x, P[i].y - P[j].y)
      if (d < 16) E.push({ a: i, b: j, d })
    }
    E.sort((u, v) => u.d - v.d)
    const edges = E.slice(0, 44)
    for (let i = 0; i < ZINCIR.length - 1; i++) {
      const a = ZINCIR[i], b = ZINCIR[i + 1]
      if (!edges.some(e => (e.a === a && e.b === b) || (e.a === b && e.b === a))) edges.push({ a, b, d: 0 })
    }
    edges.forEach((e, i) => { e.chain = ZINCIR.includes(e.a) && ZINCIR.includes(e.b) && Math.abs(ZINCIR.indexOf(e.a) - ZINCIR.indexOf(e.b)) === 1; e.t = .30 + (i / edges.length) * .2 })
    return { P, edges }
  }, [])
}

/* p: 0..1 — aynı alan, tek sayıdan okunur */
function Field({ p, P, edges, cls = '' }) {
  const sinyal = sm(p, .16, .28)
  const dim = sm(p, .64, .72)
  const duz = sm(p, .74, .86)
  const lbl = sm(p, .86, .94)
  const ext = sm(p, .90, 1)
  const pos = i => { const k = ZINCIR.indexOf(i); const q = P[i]; return k < 0 ? [q.x, q.y] : [mix(q.x, HEDEF[k][0], duz), mix(q.y, HEDEF[k][1], duz)] }
  return (
    <svg className={`hf-field ${cls}`} viewBox="0 0 100 60" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      {edges.map((e, i) => {
        const [x1, y1] = pos(e.a), [x2, y2] = pos(e.b)
        const draw = sm(p, e.t, e.t + .06)
        const o = e.chain ? draw : draw * (1 - dim)
        return <line key={i} className={e.chain ? 'is-chain' : ''} x1={x1} y1={y1} x2={x2} y2={y2} pathLength="1" style={{ strokeDashoffset: 1 - draw, opacity: o, stroke: e.chain && dim > 0 ? undefined : undefined }} data-hot={e.chain && dim > .5 ? '1' : undefined} />
      })}
      {P.map((q, i) => {
        const [x, y] = pos(i); const inChain = ZINCIR.includes(i)
        const base = sm(p, q.t, q.t + .06)
        const o = inChain ? base : base * (1 - dim * .9)
        return <circle key={i} cx={x} cy={y} r={inChain ? q.r * (1 + .4 * sinyal) : q.r} className={inChain ? 'is-sig' : ''} style={{ opacity: o, '--hot': dim }} />
      })}
      <line className="is-ext" x1="80" y1="30" x2="100" y2="30" pathLength="1" style={{ strokeDashoffset: 1 - ext, opacity: ext > 0 ? 1 : 0 }} />
      <line className="is-ext" x1="20" y1="30" x2="0" y2="30" pathLength="1" style={{ strokeDashoffset: 1 - ext, opacity: ext > 0 ? 1 : 0 }} />
      {HEDEF.map(([x, y], i) => <text key={i} x={x} y={y + 6.5} textAnchor="middle" style={{ opacity: lbl }}>{ETIKET[i]}</text>)}
    </svg>)
}

function Stacked({ P, edges }) {
  return (
    <section id="felsefe" className="hf hf--stack" data-theme="dark" aria-labelledby="hf-h">
      <div className="h-wrap">
        <In><p className="h-kicker h-kicker--dark">SRYVERSE fikri</p></In>
        <In delay={60}><h2 id="hf-h" className="hf__h">Karmaşığı basit hissettiren<br />bir düşünme biçimi.</h2></In>
        {ADIM.map((a, i) => (
          <In key={a.n} className="hf__blk">
            <Field p={[.27, .58, 1][i]} P={P} edges={edges} />
            <div className="hf__item is-on"><span className="hf__n">{a.n}</span><h3 className="hf__t">{a.t}</h3><p className="hf__d">{a.d}</p></div>
          </In>))}
      </div>
    </section>)
}

export default function Philosophy() {
  const stack = useStack()
  const ref = useRef(null)
  const [p, setP] = useState(0)
  const { P, edges } = useField()
  useTrack(ref, v => { const q = Math.round(v * 1000) / 1000; setP(x => x === q ? x : q) })
  if (stack) return <Stacked P={P} edges={edges} />
  const aktif = p < .30 ? 0 : p < .62 ? 1 : 2
  const head = sm(p, 0, .08)
  return (
    <section id="felsefe" className="hf" data-theme="dark" aria-labelledby="hf-h">
      <div className="hs-track" ref={ref} style={{ height: '400svh' }}>
        <div className="hs-stage">
          <div className="h-wrap hf__in">
            <div className="hf__side">
              <p className="h-kicker h-kicker--dark" style={{ opacity: head }}>SRYVERSE fikri</p>
              <h2 id="hf-h" className="hf__h" style={{ opacity: head }}>Karmaşığı basit hissettiren<br />bir düşünme biçimi.</h2>
              <ol className="hf__list">
                {ADIM.map((a, i) => (
                  <li key={a.n} className={`hf__item${i === aktif ? ' is-on' : i < aktif ? ' is-past' : ''}`}>
                    <span className="hf__n">{a.n}</span>
                    <h3 className="hf__t">{a.t}</h3>
                    <p className="hf__d">{a.d}</p>
                  </li>))}
              </ol>
            </div>
            <div className="hf__stage"><Field p={p} P={P} edges={edges} /></div>
          </div>
        </div>
      </div>
    </section>)
}
