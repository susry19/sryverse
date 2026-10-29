import { useEffect, useMemo, useRef, useState } from 'react'
import { forceSimulation, forceCollide, forceX, forceY } from 'd3-force'
import { DATA, CATALOG, DEFAULT_WEIGHTS, rankFor, positionsFor, pairOf, score, eligibility, band, hotel, position as posOf, candidate as candOf, CONST } from '../lib/match.js'
import { useJourney } from '../lib/journey.js'
import { useCompact, useReducedMotion } from '../lib/scroll.js'

/* AI aday eşleştirme: yaşayan bağlantı ağı.
   - İlana göre: merkezde ilan, iç halkada zorunlu yetkinlikler, adaylar
     skorlarıyla orantılı uzaklıkta. %50 öneri eşiği kesikli çember.
   - Adaya göre: merkezde aday, çevrede açık pozisyonlar.
   Kenarlar kanıt kademesidir: düz = yetkinlik listesinde, kesikli = yalnız
   CV metninde (doğrulanacak). Skorlar SkillMatch kodundan; ağırlıklar canlı. */

const TIER = { skill: 'Yetkinlik listesinde', cv: 'CV metninde · doğrulanacak' }
const PRESETS = [
  { k: 'default', l: 'Varsayılan', w: { ...DEFAULT_WEIGHTS } },
  { k: 'lang', l: 'Dil öncelikli', w: { experience: 30, skills: 50, language: 30 } },
  { k: 'local', l: 'Yerel aday', w: { experience: 30, skills: 55, location: 35 } },
  { k: 'senior', l: 'Kıdem ve yıl', w: { experience: 25, skills: 50, min_experience: 25, seniority: 20 } },
]

function hash(s) { let h = 2166136261; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) } return (h >>> 0) / 4294967296 }

function useSize(ref) {
  const [s, set] = useState({ w: 600, h: 520 })
  useEffect(() => {
    const el = ref.current; if (!el) return
    const ro = new ResizeObserver(([e]) => set({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(el); return () => ro.disconnect()
  }, [ref])
  return s
}

function Graph({ mode, focusId, rows, selected, onSelect, hover, setHover }) {
  const box = useRef(null)
  const { w, h } = useSize(box)
  const reduced = useReducedMotion()
  const [, force] = useState(0)
  const sim = useRef(null)
  const nodes = useRef(new Map())
  const cx = w / 2, cy = h / 2
  const Rmax = Math.max(120, Math.min(w, h) / 2 - 30), Rmin = Rmax * 0.36
  const R1 = Rmin * 1.32
  const rOf = (s) => R1 + (1 - s / 100) * (Rmax - R1)
  const sx = w > h ? Math.min(1.35, w / h) : 1
  const center = mode === 'position' ? posOf(focusId) : candOf(focusId)
  const skills = mode === 'position' ? center.required_skills : []

  const skillPos = useMemo(() => skills.map((t, i) => {
    const a = -Math.PI / 2 + (i / skills.length) * Math.PI * 2 + 0.4
    return { t, a, x: cx + Math.cos(a) * Rmin * 0.92, y: cy + Math.sin(a) * Rmin * 0.92 }
  }), [skills.join('|'), cx, cy, Rmin])

  useEffect(() => {
    const prev = nodes.current
    const next = new Map()
    // altın açı: sıralamada komşu iki aday çemberde birbirinden uzak düşer
    const off = hash(`${mode}:${focusId}`) * Math.PI * 2
    rows.forEach((r, i) => {
      const id = mode === 'position' ? r.c.id : r.p.id
      const a = off + i * 2.39996
      const rr = rOf(r.score)
      const tx = cx + Math.cos(a) * rr * sx, ty = cy + Math.sin(a) * rr
      const old = prev.get(id)
      next.set(id, { id, r, tx, ty, x: old ? old.x : cx + (tx - cx) * 0.2, y: old ? old.y : cy + (ty - cy) * 0.2 })
    })
    nodes.current = next
    const arr = [...next.values()]
    sim.current?.stop()
    if (reduced) { arr.forEach((n) => { n.x = n.tx; n.y = n.ty }); force((x) => x + 1); return }
    let raf = 0
    sim.current = forceSimulation(arr)
      .force('x', forceX((d) => d.tx).strength(0.22))
      .force('y', forceY((d) => d.ty).strength(0.22))
      .force('c', forceCollide((d) => 10 + d.r.score / 12).strength(0.85))
      .alpha(0.9).alphaDecay(0.035)
      .on('tick', () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; force((x) => x + 1) }) })
    return () => { sim.current?.stop(); cancelAnimationFrame(raf) }
  }, [rows, mode, focusId, w, h, reduced])

  const active = hover ?? selected
  const arr = [...nodes.current.values()]
  const thr = rOf(CONST.min_score)
  return (
    <div ref={box} className="mt-graph">
      <svg width={w} height={h} role="group" aria-label={mode === 'position' ? `${center.title} ilanı için aday ağı` : `${center.name} için pozisyon ağı`}>
        <defs>
          <radialGradient id="mtGlow"><stop offset="0" stopColor="rgba(236,241,230,.18)" /><stop offset="1" stopColor="rgba(236,241,230,0)" /></radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={Rmax * 1.05} fill="url(#mtGlow)" />
        <ellipse cx={cx} cy={cy} rx={thr * sx} ry={thr} className="mt-thr" />
        <text x={cx} y={cy - thr - 8} className="mt-thr-l" textAnchor="middle">%{CONST.min_score} öneri eşiği</text>
        {/* kanıt kenarları */}
        {mode === 'position' && arr.map((n) => n.r.pair.required.map((q, i) => {
          if (!q.matched) return null
          const sp = skillPos[i]; if (!sp) return null
          const on = active == null || active === n.id
          return <line key={`${n.id}-${i}`} x1={n.x} y1={n.y} x2={sp.x} y2={sp.y}
            className={`mt-edge mt-edge--${q.tier}${on ? '' : ' is-dim'}${active === n.id ? ' is-hot' : ''}`} />
        }))}
        {mode === 'candidate' && arr.map((n) => {
          const on = active == null || active === n.id
          return <line key={`e${n.id}`} x1={cx} y1={cy} x2={n.x} y2={n.y} className={`mt-edge mt-edge--${n.r.elig.ok ? 'skill' : 'none'}${on ? '' : ' is-dim'}${active === n.id ? ' is-hot' : ''}`} />
        })}
        {/* merkez */}
        <g className="mt-center">
          <circle cx={cx} cy={cy} r={Math.max(34, Rmin * 0.5)} />
          <text x={cx} y={cy - 3} textAnchor="middle" className="mt-center__t">{mode === 'position' ? center.title : center.name}</text>
          <text x={cx} y={cy + 14} textAnchor="middle" className="mt-center__s">{mode === 'position' ? hotel(center.hotel_id).name : center.city}</text>
        </g>
        {skillPos.map((sp) => (
          <g key={sp.t} className="mt-skill">
            <circle cx={sp.x} cy={sp.y} r="5" />
            <text x={sp.x + Math.cos(sp.a) * 10} y={sp.y + Math.sin(sp.a) * 10 + 4} textAnchor={Math.abs(Math.cos(sp.a)) < 0.3 ? 'middle' : Math.cos(sp.a) > 0 ? 'start' : 'end'}>{sp.t}</text>
          </g>
        ))}
        {/* adaylar / pozisyonlar */}
        {arr.map((n) => {
          const ok = n.r.elig.ok, s = n.r.score
          const label = mode === 'position' ? n.r.c.name : n.r.p.title
          const sel = selected === n.id
          const dim = active != null && active !== n.id
          const rad = ok ? 5 + s / 16 : 3.5
          const showLabel = ok || sel || hover === n.id || (mode === 'candidate')
          return (
            <g key={n.id} transform={`translate(${n.x},${n.y})`} tabIndex={0} role="button"
              aria-label={`${label}, %${s}, ${band(s).label}${ok ? '' : ', önerilmiyor'}`} aria-pressed={sel}
              className={`mt-node${ok ? ' is-ok' : ' is-out'}${sel ? ' is-sel' : ''}${dim ? ' is-dim' : ''}`}
              onClick={() => onSelect(n.id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(n.id) } }}
              onPointerEnter={() => setHover(n.id)} onPointerLeave={() => setHover(null)} onFocus={() => setHover(n.id)} onBlur={() => setHover(null)}>
              <circle r={rad + 12} className="mt-node__hit" />
              {sel && <circle r={rad + 7} className="mt-node__halo" />}
              <circle r={rad} className="mt-node__dot" />
              {showLabel && <text x={n.x < cx ? -(rad + 6) : rad + 6} y="4" textAnchor={n.x < cx ? 'end' : 'start'}>{label} <tspan>%{s}</tspan></text>}
            </g>
          )
        })}
      </svg>
      {hover != null && nodes.current.get(hover) && (() => {
        const n = nodes.current.get(hover), r = n.r
        const label = mode === 'position' ? r.c.name : r.p.title
        return (
          <div className="mt-tip" style={{ left: Math.min(w - 250, Math.max(8, n.x + 14)), top: Math.max(8, n.y - 12) }} aria-hidden="true">
            <b>{label} · %{r.score}</b><span>{band(r.score).label}</span><em>{r.elig.reason}</em>
          </div>
        )
      })()}
      <div className="mt-legend" aria-hidden="true">
        <span><i className="l-skill" />Yetkinlik listesinde</span>
        <span><i className="l-cv" />Yalnız CV metninde</span>
        <span><i className="l-out" />Kapı dışında</span>
      </div>
    </div>
  )
}

function Breakdown({ items, bonus }) {
  return (
    <div className="mt-bd">
      {items.map((b) => (
        <div key={b.key} className={`mt-bd__row${b.used ? '' : ' is-off'}`}>
          <div className="mt-bd__l"><span>{b.label}</span><b>{b.used ? `%${Math.round(b.value)}` : 'veri yok'}</b></div>
          <div className="mt-bd__bar"><i style={{ width: `${b.used ? b.value : 0}%` }} /></div>
          <span className="mt-bd__w">ağırlık {b.weight}</span>
        </div>
      ))}
      {bonus > 0 && <p className="mt-bd__bonus">Unvan bonusu +{bonus} · rol geçmişi pozisyon unvanıyla eşleşiyor</p>}
    </div>
  )
}

function Explain({ cId, pId, weights, onInterview }) {
  const pair = pairOf(cId, pId)
  const c = candOf(cId), p = posOf(pId), h = hotel(p.hotel_id)
  const s = score(pair, weights), el = eligibility(pair, s.score), b = band(s.score)
  return (
    <div className="mt-ex" aria-live="polite">
      <div className="mt-ex__hd">
        <span className="sx-eyebrow sx-eyebrow--on">Eşleşme analizi</span>
        <h3>{c.name} × {p.title}</h3>
        <p>%{s.score} eşleşme · {h.name}</p>
        <div className="mt-ex__badges">
          <span className={`mt-band mt-band--${b.key}`}>{b.label}</span>
          <span className={`mt-band ${el.ok ? 'mt-band--ok' : 'mt-band--no'}`}>{el.ok ? 'Önerilebilir' : 'Önerilmiyor'}</span>
        </div>
      </div>
      <p className="mt-ex__gate">{el.reason}</p>
      <h4>Kırılım</h4>
      <Breakdown items={s.breakdown} bonus={s.bonus} />
      <h4>Zorunlu yetkinlikler</h4>
      <ul className="mt-req">
        {pair.required.map((q) => (
          <li key={q.term} className={`t-${q.matched ? q.tier : 'none'}`}>
            <i aria-hidden="true">{q.matched ? (q.tier === 'skill' ? '✓' : '△') : '✗'}</i>
            <span>{q.term}</span><em>{q.matched ? TIER[q.tier] : 'Bulunamadı'}</em>
          </li>
        ))}
      </ul>
      {pair.field?.basis === 'field' && (
        <p className="mt-ex__fx">{pair.field.family} alanında {pair.field.label || 'deneyim yok'} · yalnız bu alandaki işler sayıldı ({pair.field.entries}/{pair.field.total} kayıt)</p>
      )}
      <details className="mt-ex__more">
        <summary>Üründeki “Neden uygun? / Neden %100 değil?” gerekçesi</summary>
        <div>
          <b>Neden uygun?</b>
          {pair.why_fit.length ? <ul>{pair.why_fit.map((x, i) => <li key={i}>{x}</li>)}</ul> : <p>Güçlü sinyal çıkarılamadı.</p>}
          <b>Neden %100 değil?</b>
          {pair.to_verify.length ? <ul>{pair.to_verify.map((x, i) => <li key={i}>{x}</li>)}</ul> : <p>Eksik görünmüyor.</p>}
        </div>
      </details>
      <p className="mt-ex__fine">Eşleşme skoru karar değildir; ilerletme ve eleme yetkili iş akışından yapılır.</p>
      {el.ok && <button className="sx-btn sx-btn--on sx-btn--sm" onClick={onInterview}>{c.name} ile ön görüşmeye geç →</button>}
    </div>
  )
}

export default function Matching() {
  const journey = useJourney()
  const compact = useCompact()
  const [mode, setMode] = useState('position')
  const [pos, setPos] = useState(101)
  const [cand, setCand] = useState(1)
  const [hover, setHover] = useState(null)
  const [weights, setWeights] = useState({ ...DEFAULT_WEIGHTS })
  const [preset, setPreset] = useState('default')

  const rows = useMemo(() => (mode === 'position' ? rankFor(pos, weights) : positionsFor(cand, weights)), [mode, pos, cand, weights])
  const scan = useMemo(() => {
    if (mode !== 'position') return null
    const out = { n: rows.length, field: 0, family: 0, none: 0, below: 0, strong: 0, ok: 0 }
    rows.forEach((r) => {
      if (!r.pair.gate.ok) {
        if (/^Alan dışı/.test(r.pair.gate.reason)) out.field++
        else if (/rol geçmişi/.test(r.pair.gate.reason)) out.family++
        else out.none++
      } else if (!r.elig.ok) out.below++
      else { out.ok++; if (r.score >= 80) out.strong++ }
    })
    return out
  }, [rows, mode])

  const sel = mode === 'position' ? cand : pos
  const select = (id) => {
    if (mode === 'position') { setCand(id); journey?.setCandidateId(id) } else { setPos(id); journey?.setPositionId(id) }
  }
  const setW = (k, v) => { setPreset(''); setWeights((w) => ({ ...w, [k]: v })) }
  const toInterview = () => {
    journey?.setCandidateId(cand); journey?.setPositionId(pos)
    const el = document.getElementById('on-gorusme'); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: 'smooth' })
  }

  return (
    <section className="sx-act sx-dark mt" id="eslesme" data-act="eslesme" aria-labelledby="mt-title">
      <div className="sx-wrap mt__head">
        <span className="sx-eyebrow sx-eyebrow--on">AI aday eşleştirme</span>
        <h2 id="mt-title" className="sx-h2">Skor bir sonuçtur. <em>Asıl değer gerekçededir.</em></h2>
        <p className="sx-lead mt__lead">Bir ilan seçin: aday havuzu taranır, her aday kanıtıyla yerini alır. Bir adaya tıklayın: neden uygun, neyi doğrulamak gerekir, görün. Kriter ağırlıklarını değiştirin: ağ yeniden kurulur.</p>
      </div>
      <div className="sx-wrap mt__grid">
        <aside className="mt-side">
          <div className="mt-mode" role="radiogroup" aria-label="Görünüm">
            <button role="radio" aria-checked={mode === 'position'} className={mode === 'position' ? 'on' : ''} onClick={() => setMode('position')}>İlana göre</button>
            <button role="radio" aria-checked={mode === 'candidate'} className={mode === 'candidate' ? 'on' : ''} onClick={() => setMode('candidate')}>Adaya göre</button>
          </div>
          {mode === 'position' ? (
            <ul className="mt-list" aria-label="Açık pozisyonlar">
              {DATA.positions.map((p) => {
                const ok = rankFor(p.id, weights).filter((r) => r.elig.ok).length
                return (
                  <li key={p.id}><button className={pos === p.id ? 'on' : ''} aria-pressed={pos === p.id} onClick={() => { setPos(p.id); journey?.setPositionId(p.id); const top = rankFor(p.id, weights)[0]; setCand(top.c.id) }}>
                    <b>{p.title}</b><span>{hotel(p.hotel_id).name} · {p.department}</span><em>{ok} uygun aday</em>
                  </button></li>
                )
              })}
            </ul>
          ) : (
            <ul className="mt-list" aria-label="Adaylar">
              {DATA.candidates.map((c) => (
                <li key={c.id}><button className={cand === c.id ? 'on' : ''} aria-pressed={cand === c.id} onClick={() => { setCand(c.id); setPos(positionsFor(c.id, weights)[0].p.id) }}>
                  <b>{c.name}</b><span>{c.experience[0]?.title} · {c.city}</span>
                </button></li>
              ))}
            </ul>
          )}
        </aside>
        <div className="mt-main">
          {scan && (
            <p className="mt-scan" aria-live="polite">
              <span>Ortak aday havuzu tarandı</span> {scan.n} havuz adayı tarandı · {scan.field + scan.family} aday alan dışı (iş geçmişi bu alanda değil) · {scan.none} adayda zorunlu yetkinlik yok · {scan.below} aday %{CONST.min_score} eşiğinin altında kaldı · <b>{scan.strong} güçlü eşleşme (%80+)</b>
            </p>
          )}
          <Graph mode={mode} focusId={mode === 'position' ? pos : cand} rows={rows} selected={sel} onSelect={select} hover={hover} setHover={setHover} />
          <ol className="mt-rank" aria-label="Sıralama">
            {rows.slice(0, compact ? 5 : 8).map((r, i) => {
              const id = mode === 'position' ? r.c.id : r.p.id
              return (
                <li key={id}><button className={sel === id ? 'on' : ''} onClick={() => select(id)}>
                  <span>{i + 1}</span>{mode === 'position' ? r.c.name : r.p.title}<b>%{r.score}</b>{!r.elig.ok && <em>kapı dışı</em>}
                </button></li>
              )
            })}
          </ol>
        </div>
        <Explain cId={cand} pId={pos} weights={weights} onInterview={toInterview} />
      </div>
      <div className="sx-wrap">
        <div className="mt-w">
          <div className="mt-w__hd">
            <div>
              <h3>Eşleşme kriterleri</h3>
              <p className="sx-note">Ağırlıklar görelidir; toplamın 100 olması gerekmez. Verisi olmayan kriter ortalamaya girmez. Pozisyona özel ağırlık İK tarafından kaydedilir.</p>
            </div>
            <div className="mt-w__presets">
              {PRESETS.map((p) => <button key={p.k} className="sx-chip" aria-pressed={preset === p.k} onClick={() => { setPreset(p.k); setWeights({ ...p.w }) }}>{p.l}</button>)}
            </div>
          </div>
          <div className="mt-w__grid">
            {CATALOG.map((c) => (
              <label key={c.key} className={`mt-w__item${(weights[c.key] || 0) > 0 ? ' is-on' : ''}`}>
                <span className="mt-w__l">{c.label}<b>{weights[c.key] || 0}</b></span>
                <input type="range" min="0" max="100" step="5" value={weights[c.key] || 0} style={{ '--fill': `${weights[c.key] || 0}%` }} onChange={(e) => setW(c.key, +e.target.value)} aria-describedby={`h-${c.key}`} />
                <span id={`h-${c.key}`} className="mt-w__h">{c.hint}</span>
              </label>
            ))}
          </div>
          <p className="sx-note mt-w__src">Sinyaller SkillMatch eşleştirme motorunun ({DATA.source.score_version}) kendi kodundan, {DATA.source.commit} sürümüyle sentetik adaylar üzerinde hesaplandı; tarayıcı yalnız ağırlıklı ortalamayı uygular.</p>
        </div>
      </div>
    </section>
  )
}
