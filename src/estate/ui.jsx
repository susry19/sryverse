/* Paylaşılan bileşenler: her bölümde aynı düğme, etiket, kayıt, sinyal, metrik, grafik. */
import { useState } from 'react'

export const FOTO = {
  macka: { alt: 'Maçka, teraslı yeni yapı, temsili görsel', src: n => `/screens/property-macka-${n}.webp` },
  fulya: { alt: 'Fulya, yeni yapı, temsili görsel', src: n => `/screens/property-fulya-${n}.webp` },
  nisantasi: { alt: 'Nişantaşı, teraslı daire, temsili görsel', src: n => `/screens/property-nisantasi-${n}.webp` },
  detail: { alt: 'Teşvikiye, tarihi yapı detayı, temsili görsel', src: n => `/screens/property-detail-${n}.webp` },
}
export function Foto({ k = 'macka', size = 640, className, style, alt, loading = 'lazy', pos }) {
  const f = FOTO[k]
  const srcSet = k === 'nisantasi' ? `${f.src(640)} 640w, ${f.src(1024)} 1024w` : `${f.src(640)} 640w, ${f.src(1024)} 1024w, ${f.src(1600)} 1600w`
  return <img className={className} src={f.src(size)} srcSet={srcSet} sizes="(max-width:767px) 90vw, 40vw" alt={alt === undefined ? f.alt : alt}
    loading={loading} decoding="async" width="640" height="480" style={{ objectPosition: pos, ...style }} />
}

export function Btn({ p, s, sm, xs, on, ok, busy, icon, as: As = 'button', className = '', children, ...rest }) {
  const cls = ['em-btn', p && 'em-btn--p', s && 'em-btn--s', sm && 'em-btn--sm', xs && 'em-btn--xs', on && 'is-on', ok && 'is-ok', busy && 'em-btn--busy', className].filter(Boolean).join(' ')
  const props = As === 'button' ? { type: 'button', ...rest } : rest
  return <As className={cls} {...props}>{children}{icon && <i aria-hidden="true">{icon}</i>}</As>
}
export const Status = ({ k, children }) => <span className={`em-status${k ? ' em-status--' + k : ''}`}>{children}</span>
export const Chapter = ({ n, children }) => <span className="em-chapter">{n && <b>{n}</b>}{children}</span>
export const Eyebrow = ({ children }) => <p className="em-eyebrow">{children}</p>

export function Signal({ t, sub, level, k }) {
  return <div className="em-signal"><b>{t}</b>{sub && <small>{sub}</small>}<Status k={k}>{level}</Status></div>
}
export function Record({ foto, pos, t, m, pct, sel, dim, onClick, right }) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag className={`em-record${sel ? ' is-sel' : ''}${dim ? ' is-dim' : ''}`} onClick={onClick} type={onClick ? 'button' : undefined} aria-pressed={onClick ? !!sel : undefined} style={onClick ? { textAlign: 'left', width: '100%' } : undefined}>
      <Foto k={foto} className="em-record__img" size={640} pos={pos} alt="" />
      <div><div className="em-record__t">{t}</div><div className="em-record__m">{m}</div></div>
      {right !== undefined ? right : pct !== undefined ? <div className="em-record__pct">%{pct}</div> : null}
    </Tag>
  )
}
export const Metric = ({ v, l }) => <div className="em-metric"><b>{v}</b><span>{l}</span></div>

/* Plan glifleri: CSS/SVG ile üretilir, görsel dosya yok */
export function Plan({ v = 0, className }) {
  const d = [
    'M6 6h52v40H6z M6 26h24 M30 6v20 M30 26h28 M42 26v20',
    'M6 10h48v36H6z M6 30h20 M26 10v36 M26 30h28 M40 30v16 M14 10v8',
    'M8 6h44v44H8z M8 24h18 M26 6v18 M26 24h26 M34 24v26 M8 40h18',
    'M6 8h52v34H6z M6 22h30 M36 8v34 M36 22h22 M20 22v20',
    'M10 6h44v44H10z M10 28h22 M32 6v22 M32 28h22 M44 28v22 M22 28v22',
    'M6 12h52v32H6z M6 28h16 M22 12v32 M22 28h36 M40 28v16 M50 12v16',
  ][v % 6]
  return <svg className={className} viewBox="0 0 64 56" aria-hidden="true"><path d={d} className="em-plan" /></svg>
}

/* Çubuk grafik: her etiket bir gerçek değer */
export function Bars({ rows, max, h = 120, label }) {
  const W = 320, gap = 8, bw = (W - gap * (rows.length - 1)) / rows.length
  const M = max || Math.max(...rows.map(r => r.v))
  return (
    <div className="em-fig">{label && <h4>{label}</h4>}
      <svg className="em-chart" viewBox={`0 0 ${W} ${h + 28}`} role="img" aria-label={label}>
        {rows.map((r, i) => { const bh = Math.max(2, (r.v / M) * h); const x = i * (bw + gap)
          return <g key={r.l}><rect x={x} y={h - bh} width={bw} height={bh} rx="3" fill={r.c || '#0B6B57'} opacity={r.o ?? .85} />
            <text x={x + bw / 2} y={h - bh - 5} textAnchor="middle" className="lbl">{r.v}</text>
            <text x={x + bw / 2} y={h + 16} textAnchor="middle">{r.l}</text></g> })}
      </svg></div>)
}
export function Funnel({ rows, label }) {
  const M = rows[0].v
  return (
    <div className="em-fig">{label && <h4>{label}</h4>}
      <div style={{ display: 'grid', gap: '.35rem' }}>
        {rows.map(r => <div key={r.l} style={{ display: 'grid', gridTemplateColumns: 'minmax(96px,34%) 1fr auto', gap: '.5rem', alignItems: 'center', fontSize: 'var(--t-label)' }}>
          <span style={{ color: 'var(--c-ink-2)' }}>{r.l}</span><div className="em-bar"><i style={{ '--v': r.v / M }} /></div><b style={{ fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{r.v}</b></div>)}
      </div></div>)
}
export function Donut({ rows, label }) {
  const T = rows.reduce((a, r) => a + r.v, 0); let acc = 0
  const cols = ['#0B6B57', '#6F8F80', '#B6C4BB', '#E3E8E3', '#9A6B2D']
  return (
    <div className="em-fig">{label && <h4>{label}</h4>}
      <div style={{ display: 'grid', gridTemplateColumns: '92px 1fr', gap: '.7rem', alignItems: 'center' }}>
        <svg viewBox="0 0 42 42" width="92" height="92" role="img" aria-label={label}>
          {rows.map((r, i) => { const f = r.v / T, dash = f * 100; const el = <circle key={r.l} cx="21" cy="21" r="15.9" fill="none" stroke={cols[i % cols.length]} strokeWidth="6" strokeDasharray={`${dash} ${100 - dash}`} strokeDashoffset={-acc * 100 + 25} />; acc += f; return el })}
        </svg>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 'var(--t-label)', display: 'grid', gap: '.2rem' }}>
          {rows.map((r, i) => <li key={r.l} style={{ display: 'flex', gap: '.4rem', alignItems: 'center' }}><i style={{ width: 8, height: 8, borderRadius: 2, background: cols[i % cols.length] }} />{r.l}<b style={{ marginLeft: 'auto', fontWeight: 500 }}>{r.v}</b></li>)}
        </ul></div></div>)
}
export function Line({ pts, label, unit = '' }) {
  const W = 320, H = 100, M = Math.max(...pts.map(p => p.v))
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${(i / (pts.length - 1)) * (W - 20) + 10} ${H - (p.v / M) * (H - 20)}`).join(' ')
  return (
    <div className="em-fig">{label && <h4>{label}</h4>}
      <svg className="em-chart" viewBox={`0 0 ${W} ${H + 22}`} role="img" aria-label={label}>
        <path d={d} fill="none" stroke="#0B6B57" strokeWidth="1.6" />
        {pts.map((p, i) => { const x = (i / (pts.length - 1)) * (W - 20) + 10, y = H - (p.v / M) * (H - 20)
          return <g key={p.l}><circle cx={x} cy={y} r="2.6" fill="#0B6B57" /><text x={x} y={H + 16} textAnchor="middle">{p.l}</text>{(i === pts.length - 1) && <text x={x - 4} y={y - 8} textAnchor="end" className="lbl">{p.v}{unit}</text>}</g> })}
      </svg></div>)
}

/* Kaydet düğmesi: kirli → kaydediliyor → kaydedildi */
export function SaveBtn({ dirty, onSaved, label = 'Kaydet' }) {
  const [st, setSt] = useState('idle')
  return <Btn s sm busy={st === 'busy'} ok={st === 'ok'} disabled={!dirty && st !== 'ok'} onClick={() => { setSt('busy'); setTimeout(() => { setSt('ok'); onSaved && onSaved() }, 700) }}>{st === 'ok' ? 'Kaydedildi' : label}</Btn>
}
