import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '../lib/scroll.js'

/* Grafik kütüphanesi yok (ürünle aynı ilke: "Grafik kütüphanesi EKLENMEZ",
   app.js) — el yapımı SVG. Geçişler sayı dizilerinin ara değerlenmesiyle:
   çubuklar büyür/küçülür, çizgi bir şekilden ötekine akar, halka dilimleri döner.
   Renkler marka kiti (--viz-*). */

const VIZ = ['var(--viz-1)', 'var(--viz-2)', 'var(--viz-3)', 'var(--viz-4)', 'var(--viz-5)', 'var(--viz-6)']

function useTween(target, ms = 650) {
  const reduced = useReducedMotion()
  const [v, setV] = useState(target)
  const from = useRef(target), raf = useRef(0), cur = useRef(target)
  useEffect(() => {
    if (reduced) { setV(target); cur.current = target; return }
    from.current = cur.current
    const t0 = performance.now()
    cancelAnimationFrame(raf.current)
    const step = (now) => {
      const k = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - k, 3)
      const out = {}
      for (const key of Object.keys(target)) {
        const a = from.current[key] || [], b = target[key]
        out[key] = b.map((x, i) => (a[i] == null ? x * e : a[i] + (x - a[i]) * e))
      }
      cur.current = out; setV(out)
      if (k < 1) raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf.current)
  }, [JSON.stringify(target)])
  return v
}

const nice = (max) => { if (max <= 0) return 1; const p = Math.pow(10, Math.floor(Math.log10(max))); const n = max / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p }

export default function Chart({ type, rows, fmt, onPick, onHover, active, height = 340 }) {
  const box = useRef(null)
  const [w, setW] = useState(640)
  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width)); if (box.current) ro.observe(box.current)
    return () => ro.disconnect()
  }, [])
  const vals = rows.map((r) => r.value || 0)
  const max = nice(Math.max(...vals, 0))
  const N = rows.length
  const hb = type === 'hbar'
  const H = hb ? Math.max(height, N * 30 + 30) : height
  const padL = hb ? Math.min(180, w * 0.34) : 44, padR = 16, padT = 14, padB = hb ? 18 : 40
  const iw = Math.max(10, w - padL - padR), ih = H - padT - padB
  const geo = useTween({ v: vals.map((x) => x / max) })
  // ara değer dizisi bir kare eski uzunlukta kalabilir: satır sayısına hizala
  const vv = rows.map((_, i) => (geo.v[i] ?? vals[i] / max))
  const ticks = [0, 0.25, 0.5, 0.75, 1]

  if (type === 'donut') {
    const tot = vals.reduce((s, x) => s + x, 0) || 1
    let acc = 0
    const R = Math.min(w * 0.42, height / 2 - 10), r0 = R * 0.62, cx = Math.min(w * 0.42, R + 10), cy = height / 2
    const shown = rows.slice(0, 6), rest = rows.slice(6).reduce((s, x) => s + (x.value || 0), 0)
    const parts = rest ? [...shown, { label: 'Diğer', value: rest, key: '__other' }] : shown
    return (
      <div ref={box} className="ch ch--donut" style={{ height }}>
        <svg width={w} height={height} role="img" aria-label="Halka grafik">
          {parts.map((p, i) => {
            const a0 = (acc / tot) * Math.PI * 2 - Math.PI / 2; acc += p.value || 0
            const a1 = (acc / tot) * Math.PI * 2 - Math.PI / 2
            const large = a1 - a0 > Math.PI ? 1 : 0
            const pt = (a, r) => `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`
            const d = `M${pt(a0, R)} A${R},${R} 0 ${large} 1 ${pt(a1, R)} L${pt(a1, r0)} A${r0},${r0} 0 ${large} 0 ${pt(a0, r0)} Z`
            return <path key={p.key} d={d} fill={p.key === '__other' ? 'var(--line-2)' : VIZ[i % 6]} className={`ch-slice${active && active !== p.key ? ' is-dim' : ''}`}
              onClick={() => p.key !== '__other' && onPick?.(p.key)} onPointerEnter={() => onHover?.(p.key)} onPointerLeave={() => onHover?.(null)} />
          })}
          <text x={cx} y={cy - 2} textAnchor="middle" className="ch-big">{fmt(vals.reduce((s, x) => s + x, 0))}</text>
          <text x={cx} y={cy + 16} textAnchor="middle" className="ch-small">toplam</text>
        </svg>
        <ul className="ch-legend">
          {parts.map((p, i) => (
            <li key={p.key}><button onClick={() => p.key !== '__other' && onPick?.(p.key)} onPointerEnter={() => onHover?.(p.key)} onPointerLeave={() => onHover?.(null)}>
              <i style={{ background: p.key === '__other' ? 'var(--line-2)' : VIZ[i % 6] }} />{p.label}<b>{fmt(p.value)}</b><em>%{Math.round(((p.value || 0) / tot) * 100)}</em>
            </button></li>
          ))}
        </ul>
      </div>
    )
  }

  if (type === 'line' || type === 'area') {
    const x = (i) => padL + (N <= 1 ? iw / 2 : (i / (N - 1)) * iw)
    const y = (v) => padT + ih - v * ih
    const pts = vv.map((v, i) => [x(i), y(v)])
    const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
    const area = N ? `${line} L${x(N - 1)},${padT + ih} L${x(0)},${padT + ih} Z` : ''
    return (
      <div ref={box} className="ch" style={{ height: H }}>
        <svg width={w} height={H} role="img" aria-label="Zaman serisi">
          {ticks.map((t) => <g key={t}><line x1={padL} x2={padL + iw} y1={y(t)} y2={y(t)} className="ch-grid" /><text x={padL - 8} y={y(t) + 4} textAnchor="end" className="ch-ax">{fmt(Math.round(t * max * 10) / 10)}</text></g>)}
          {type === 'area' && <path d={area} className="ch-area" />}
          <path d={line} className="ch-line" />
          {pts.map((p, i) => (
            <g key={rows[i].key} className={`ch-pt${active === rows[i].key ? ' is-on' : ''}`} onClick={() => onPick?.(rows[i].key)} onPointerEnter={() => onHover?.(rows[i].key)} onPointerLeave={() => onHover?.(null)}>
              <circle cx={p[0]} cy={p[1]} r="12" fill="transparent" />
              <circle cx={p[0]} cy={p[1]} r="3.5" className="ch-dot" />
              {(active === rows[i].key || N <= 8) && <text x={p[0]} y={p[1] - 10} textAnchor="middle" className="ch-val">{fmt(rows[i].value)}</text>}
              <text x={p[0]} y={padT + ih + 22} textAnchor="middle" className="ch-ax">{rows[i].label}</text>
            </g>
          ))}
        </svg>
      </div>
    )
  }

  // çubuk / yatay çubuk
  return (
    <div ref={box} className="ch" style={{ height: H }}>
      <svg width={w} height={H} role="img" aria-label="Çubuk grafik">
        {hb
          ? ticks.map((t) => <g key={t}><line y1={padT} y2={padT + ih} x1={padL + t * iw} x2={padL + t * iw} className="ch-grid" /></g>)
          : ticks.map((t) => <g key={t}><line x1={padL} x2={padL + iw} y1={padT + ih - t * ih} y2={padT + ih - t * ih} className="ch-grid" /><text x={padL - 8} y={padT + ih - t * ih + 4} textAnchor="end" className="ch-ax">{fmt(Math.round(t * max * 10) / 10)}</text></g>)}
        {rows.map((r, i) => {
          const v = Math.max(0, vv[i] || 0)
          const on = active === r.key, dim = active && !on
          if (hb) {
            const bh = Math.min(22, ih / N - 6), yy = padT + i * (ih / N) + (ih / N - bh) / 2
            return (
              <g key={r.key} className={`ch-bar${dim ? ' is-dim' : ''}${on ? ' is-on' : ''}`} onClick={() => onPick?.(r.key)} onPointerEnter={() => onHover?.(r.key)} onPointerLeave={() => onHover?.(null)}>
                <rect x={0} y={yy - 3} width={w} height={bh + 6} fill="transparent" />
                <text x={padL - 10} y={yy + bh / 2 + 4} textAnchor="end" className="ch-cat">{r.label}</text>
                <rect x={padL} y={yy} width={Math.max(1, v * iw)} height={bh} rx="4" />
                <text x={padL + v * iw + 6} y={yy + bh / 2 + 4} className="ch-val">{fmt(r.value)}</text>
              </g>
            )
          }
          const slot = iw / N, bw = Math.min(46, slot * 0.64), xx = padL + i * slot + (slot - bw) / 2
          return (
            <g key={r.key} className={`ch-bar${dim ? ' is-dim' : ''}${on ? ' is-on' : ''}`} onClick={() => onPick?.(r.key)} onPointerEnter={() => onHover?.(r.key)} onPointerLeave={() => onHover?.(null)}>
              <rect x={padL + i * slot} y={padT} width={slot} height={ih + 30} fill="transparent" />
              <rect x={xx} y={padT + ih - v * ih} width={bw} height={Math.max(1, v * ih)} rx="4" />
              {(N <= 10 || on) && <text x={xx + bw / 2} y={padT + ih - v * ih - 6} textAnchor="middle" className="ch-val">{fmt(r.value)}</text>}
              <text x={xx + bw / 2} y={padT + ih + 18} textAnchor="middle" className="ch-ax">{r.label.length > 12 && N > 6 ? r.label.slice(0, 11) + '…' : r.label}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
