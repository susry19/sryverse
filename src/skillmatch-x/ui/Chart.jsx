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

// Yalnız veri ucu yuvarlak (4px), taban düz: çubuk eksene oturur
const hBarPath = (x, y, len, h) => { const r = Math.min(4, h / 2, len); return `M${x},${y}H${x + len - r}A${r},${r} 0 0 1 ${x + len},${y + r}V${y + h - r}A${r},${r} 0 0 1 ${x + len - r},${y + h}H${x}Z` }
const vBarPath = (x, base, w, len) => { const r = Math.min(4, w / 2, len); const t = base - len; return `M${x},${base}V${t + r}A${r},${r} 0 0 1 ${x + r},${t}H${x + w - r}A${r},${r} 0 0 1 ${x + w},${t + r}V${base}Z` }

function Tip({ tip, w }) {
  if (!tip) return null
  return (
    <div className="ch-tip" style={{ left: Math.max(8, Math.min(w - 180, tip.x - 90)), top: Math.max(0, tip.y - 64) }} aria-hidden="true">
      <span>{tip.label}</span><b>{tip.value}</b>{tip.share != null && <em>toplamın %{tip.share}'i</em>}
    </div>
  )
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
  const padL = hb ? Math.min(180, w * 0.34) : 44, padR = hb ? 44 : 16, padT = 14, padB = hb ? 18 : 40
  const iw = Math.max(10, w - padL - padR), ih = H - padT - padB
  const geo = useTween({ v: vals.map((x) => x / max) })
  // ara değer dizisi bir kare eski uzunlukta kalabilir: satır sayısına hizala
  const vv = rows.map((_, i) => (geo.v[i] ?? vals[i] / max))
  const ticks = [0, 0.25, 0.5, 0.75, 1]
  const [tip, setTip] = useState(null)
  // veri ya da grafik türü değişince eski ipucu kalmasın
  const sig = `${type}|${rows.map((r) => r.key).join(',')}`
  useEffect(() => setTip(null), [sig])
  const sum = vals.reduce((a, b) => a + b, 0) || 1
  const enter = (r, x, y) => { onHover?.(r.key); setTip({ key: r.key, x, y, label: r.label, value: fmt(r.value), share: Math.round(((r.value || 0) / sum) * 100) }) }
  const leave = () => { onHover?.(null); setTip(null) }

  if (type === 'donut') {
    const tot = vals.reduce((s, x) => s + x, 0) || 1
    let acc = 0
    const R = Math.min(w * 0.42, height / 2 - 10), r0 = R * 0.74, cx = Math.min(w * 0.42, R + 10), cy = height / 2
    const shown = rows.slice(0, 6), rest = rows.slice(6).reduce((s, x) => s + (x.value || 0), 0)
    const parts = rest ? [...shown, { label: 'Diğer', value: rest, key: '__other' }] : shown
    return (
      <div ref={box} className="ch ch--donut" style={{ height }}>
        <svg width={cx + R + 10} height={height} role="img" aria-label="Halka grafik">
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
          <defs><linearGradient id="chAreaG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" className="ch-area-a" /><stop offset="1" className="ch-area-b" /></linearGradient></defs>
          {[0.5, 1].map((t) => <g key={t}><line x1={padL} x2={padL + iw} y1={y(t)} y2={y(t)} className="ch-grid" /><text x={padL - 10} y={y(t) + 4} textAnchor="end" className="ch-ax">{fmt(Math.round(t * max * 10) / 10)}</text></g>)}
          <line x1={padL} x2={padL + iw} y1={y(0)} y2={y(0)} className="ch-base" />
          {type === 'area' && <path d={area} fill="url(#chAreaG)" />}
          {tip && pts[rows.findIndex((r) => r.key === tip.key)] && <line className="ch-cross" x1={pts[rows.findIndex((r) => r.key === tip.key)][0]} x2={pts[rows.findIndex((r) => r.key === tip.key)][0]} y1={padT} y2={padT + ih} />}
          <path d={line} className="ch-line" />
          {pts.map((p, i) => (
            <g key={rows[i].key} className={`ch-pt${active === rows[i].key ? ' is-on' : ''}`} onClick={() => onPick?.(rows[i].key)} onPointerEnter={() => enter(rows[i], p[0], p[1])} onPointerLeave={leave}>
              <rect x={p[0] - Math.max(8, iw / N / 2)} y={padT} width={Math.max(16, iw / N)} height={ih + 30} fill="transparent" />
              <circle cx={p[0]} cy={p[1]} r="4" className="ch-dot" />
              {(i === N - 1 || vals[i] === Math.max(...vals)) && <text x={p[0]} y={p[1] - 12} textAnchor="middle" className="ch-val">{fmt(rows[i].value)}</text>}
              {(N <= 8 || i % Math.ceil(N / 8) === 0) && <text x={p[0]} y={padT + ih + 22} textAnchor="middle" className="ch-ax">{rows[i].label}</text>}
            </g>
          ))}
        </svg>
        <Tip tip={tip} w={w} />
      </div>
    )
  }

  // çubuk / yatay çubuk
  return (
    <div ref={box} className="ch" style={{ height: H }}>
      <svg width={w} height={H} role="img" aria-label="Çubuk grafik">
        {hb
          ? <line y1={padT} y2={padT + ih} x1={padL} x2={padL} className="ch-base" />
          : <>
            {[0.5, 1].map((t) => <g key={t}><line x1={padL} x2={padL + iw} y1={padT + ih - t * ih} y2={padT + ih - t * ih} className="ch-grid" /><text x={padL - 10} y={padT + ih - t * ih + 4} textAnchor="end" className="ch-ax">{fmt(Math.round(t * max * 10) / 10)}</text></g>)}
            <line x1={padL} x2={padL + iw} y1={padT + ih} y2={padT + ih} className="ch-base" />
          </>}
        {rows.map((r, i) => {
          const v = Math.max(0, vv[i] || 0)
          const on = active === r.key, dim = active && !on
          if (hb) {
            const bh = Math.min(14, ih / N - 10), yy = padT + i * (ih / N) + (ih / N - bh) / 2
            return (
              <g key={r.key} className={`ch-bar${dim ? ' is-dim' : ''}${on ? ' is-on' : ''}${tip?.key === r.key ? ' is-hover' : ''}`} onClick={() => onPick?.(r.key)} onPointerEnter={() => enter(r, padL + v * iw, yy)} onPointerLeave={leave}>
                <rect x={0} y={padT + i * (ih / N)} width={w} height={ih / N} fill="transparent" />
                <text x={padL - 12} y={yy + bh / 2 + 4} textAnchor="end" className="ch-cat">{r.label}</text>
                <rect x={padL} y={yy} width={iw} height={bh} rx={bh / 2} className="ch-track" />
                <path d={hBarPath(padL, yy, Math.max(1, v * iw), bh)} className="ch-fill" />
                <text x={padL + v * iw + 8} y={yy + bh / 2 + 4} className="ch-val">{fmt(r.value)}</text>
              </g>
            )
          }
          const slot = iw / N, bw = Math.min(28, slot * 0.5), xx = padL + i * slot + (slot - bw) / 2
          return (
            <g key={r.key} className={`ch-bar${dim ? ' is-dim' : ''}${on ? ' is-on' : ''}${tip?.key === r.key ? ' is-hover' : ''}`} onClick={() => onPick?.(r.key)} onPointerEnter={() => enter(r, xx + bw / 2, padT + ih - v * ih)} onPointerLeave={leave}>
              <rect x={padL + i * slot} y={padT} width={slot} height={ih + 30} fill="transparent" />
              <path d={vBarPath(xx, padT + ih, bw, Math.max(1, v * ih))} className="ch-fill" />
              {(N <= 10 || on) && <text x={xx + bw / 2} y={padT + ih - v * ih - 6} textAnchor="middle" className="ch-val">{fmt(r.value)}</text>}
              <text x={xx + bw / 2} y={padT + ih + 18} textAnchor="middle" className="ch-ax">{r.label.length > 12 && N > 6 ? r.label.slice(0, 11) + '…' : r.label}</text>
            </g>
          )
        })}
      </svg>
      <Tip tip={tip} w={w} />
    </div>
  )
}
