import { useEffect, useMemo, useRef, useState } from 'react'
import Chart from '../ui/Chart.jsx'
import { DATASETS, AGG, aggsFor, CHARTS, TIME_CHARTS, CATEGORY_CHARTS, PRESETS, HOTELS, DEPTS, run, fmt, insights, groupRows, funnelOf, DATA as RD, TODAY } from '../lib/reports.js'
import { makeAssistant } from '../lib/assistant.js'
import ASSIST from '../data/assistant.json'
import { DATA as MD, rankFor, DEFAULT_WEIGHTS, position as posOf, hotel as hotelOf } from '../lib/match.js'
import { ROWS as OPS_ROWS, rowStatus, FTE } from '../lib/ops.js'
import { useJourney } from '../lib/journey.js'

/* Karar ve rapor: Rapor Oluşturucu + SkillMatch AI Asistan + AI aday araması.
   Asistan cevapları rapor tuvalini yönlendirebilir ("Raporda aç"). */

const AS = makeAssistant(ASSIST)
const DEFAULT = { dataset: 'applications', dim: 'source', measure: 'count', agg: 'count', chart: 'hbar', preset: 'last90', hotels: [], departments: [], drill: [], sort: 'desc' }
const ICON = { bar: '▮▮', hbar: '☰', line: '⟋', area: '◢', donut: '◔', table: '▦', kpi: '#' }

function Seg({ value, options, onChange, label, disabledFor }) {
  return (
    <div className="rb-seg" role="radiogroup" aria-label={label}>
      {options.map(([k, l]) => {
        const off = disabledFor?.(k)
        return <button key={k} role="radio" aria-checked={value === k} className={value === k ? 'on' : ''} disabled={!!off} title={off || l} onClick={() => onChange(k)}>{l}</button>
      })}
    </div>
  )
}

function ReportBuilder({ cfg, setCfg }) {
  const [hover, setHover] = useState(null)
  const ds = DATASETS[cfg.dataset]
  const res = useMemo(() => run(cfg), [cfg])
  const m = res.m
  const time = cfg.dim === 'period'
  const validCharts = time ? TIME_CHARTS : CATEGORY_CHARTS
  const f = (v) => fmt(v, m, cfg.agg)
  const set = (patch) => setCfg((c) => {
    const n = { ...c, ...patch }
    const d = DATASETS[n.dataset]
    if (!d.dims[n.dim]) n.dim = Object.keys(d.dims)[0]
    if (!d.measures[n.measure]) n.measure = 'count'
    if (!aggsFor(d.measures[n.measure]).includes(n.agg)) n.agg = aggsFor(d.measures[n.measure])[0]
    const vc = n.dim === 'period' ? TIME_CHARTS : CATEGORY_CHARTS
    if (!vc.includes(n.chart)) n.chart = n.dim === 'period' ? 'area' : 'hbar'
    if (patch.dataset && patch.dataset !== c.dataset) n.drill = []
    return n
  })
  const pick = (key) => {
    // drill-down: aynı değere ikinci tıklama adımı geri alır
    const last = cfg.drill[cfg.drill.length - 1]
    if (last && last.field === cfg.dim && last.value === key) return
    const next = ds.drill[cfg.dim]
    if (!next) return
    set({ drill: [...cfg.drill, { field: cfg.dim, value: key, label: ds.dims[cfg.dim] }], dim: next, chart: next === 'period' ? 'area' : 'hbar' })
  }
  const toggle = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])
  useEffect(() => setHover(null), [cfg])
  const hoverOk = hover && res.rows.some((r) => r.key === hover)
  const hoverFunnel = hoverOk && cfg.dataset === 'applications' ? funnelOf(groupRows(cfg, hover)) : null
  const delta = res.prevTotal != null && res.prevTotal ? Math.round(((res.total - res.prevTotal) / res.prevTotal) * 100) : null
  const hoverLabel = res.rows.find((r) => r.key === hover)?.label

  return (
    <div className="rb">
      <aside className="rb-panel" aria-label="Rapor Oluşturucu">
        <h3>Rapor Oluşturucu</h3>
        <div className="rb-f"><label>Veri · Analiz Alanı</label>
          <Seg value={cfg.dataset} label="Analiz alanı" onChange={(v) => set({ dataset: v })} options={Object.entries(DATASETS).map(([k, d]) => [k, d.label])} />
        </div>
        <div className="rb-f"><label htmlFor="rb-x">X Ekseni / Boyut</label>
          <select id="rb-x" value={cfg.dim} onChange={(e) => set({ dim: e.target.value, drill: [] })}>{Object.entries(ds.dims).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        </div>
        <div className="rb-f"><label htmlFor="rb-y">Y Ekseni / Ölçü</label>
          <select id="rb-y" value={cfg.measure} onChange={(e) => set({ measure: e.target.value })}>{Object.entries(ds.measures).map(([k, d]) => <option key={k} value={k}>{d.label}</option>)}</select>
        </div>
        <div className="rb-f"><label htmlFor="rb-a">Hesaplama</label>
          <select id="rb-a" value={cfg.agg} onChange={(e) => set({ agg: e.target.value })}>{aggsFor(m).map((a) => <option key={a} value={a}>{AGG[a]}</option>)}</select>
        </div>
        <div className="rb-f"><label>Görselleştirme</label>
          <div className="rb-charts">
            {Object.entries(CHARTS).map(([k, l]) => {
              const ok = validCharts.includes(k)
              return <button key={k} className={cfg.chart === k ? 'on' : ''} disabled={!ok} title={ok ? l : `${l} bu rapor için uygun değil`} aria-label={l} aria-pressed={cfg.chart === k} onClick={() => set({ chart: k })}><span aria-hidden="true">{ICON[k]}</span><em>{l}</em></button>
            })}
          </div>
        </div>
        <div className="rb-f"><label>Tarih Aralığı</label>
          <Seg value={cfg.preset} label="Tarih aralığı" onChange={(v) => set({ preset: v })} options={Object.entries(PRESETS).map(([k, [l]]) => [k, l])} />
        </div>
        <div className="rb-f"><label>Otel</label>
          <div className="rb-chips">{HOTELS.map((h) => <button key={h} className="sx-chip" aria-pressed={cfg.hotels.includes(h)} onClick={() => set({ hotels: toggle(cfg.hotels, h) })}>{h}</button>)}</div>
        </div>
        <div className="rb-f"><label>Departman</label>
          <div className="rb-chips">{Object.keys(DEPTS).map((d) => <button key={d} className="sx-chip" aria-pressed={cfg.departments.includes(d)} onClick={() => set({ departments: toggle(cfg.departments, d) })}>{d}</button>)}</div>
        </div>
        <button className="rb-reset" onClick={() => setCfg({ ...DEFAULT })}>Varsayılana dön</button>
      </aside>

      <div className="rb-canvas">
        <div className="rb-canvas__hd">
          <div>
            <span className="sx-eyebrow">Özel Rapor · {ds.label}</span>
            <h3>{m.label} <small>· {ds.dims[cfg.dim]}</small></h3>
          </div>
          {cfg.dim !== 'period' && cfg.chart !== 'kpi' && (
            <label className="rb-sort">Sırala:
              <select value={cfg.sort} onChange={(e) => set({ sort: e.target.value })}><option value="desc">↓</option><option value="asc">↑</option><option value="az">A-Z</option></select>
            </label>
          )}
        </div>
        {cfg.drill.length > 0 && (
          <div className="rb-crumbs" aria-label="Drill-down">
            {cfg.drill.map((d, i) => <button key={i} onClick={() => set({ drill: cfg.drill.slice(0, i), dim: d.field })}>{d.label} › <b>{d.value}</b></button>)}
            <button className="rb-crumbs__x" onClick={() => set({ drill: [], dim: cfg.drill[0].field })}>Drill-down'u temizle</button>
          </div>
        )}
        <div className="rb-kpis">
          <div><span>{res.additive ? `Toplam ${m.label}` : `${AGG[cfg.agg]} ${m.label}`}</span><b>{f(res.total)}</b>{delta != null && <em className={delta >= 0 ? 'up' : 'down'}>{delta >= 0 ? '▲' : '▼'} %{Math.abs(delta)} önceki döneme göre</em>}</div>
          <div><span>Kırılım</span><b>{res.rows.length}</b><em>{ds.dims[cfg.dim]}</em></div>
          <div><span>En Yüksek</span><b>{res.top ? f(res.top.value) : '—'}</b><em>{res.top?.label}</em></div>
          {res.daily != null && <div><span>Günlük Ortalama</span><b>{res.daily.toLocaleString('tr-TR')}</b><em>{PRESETS[cfg.preset][0].toLowerCase()}</em></div>}
        </div>
        <div className="rb-viz">
          <div className="rb-viz__main">
            {cfg.chart === 'table' ? (
              <table className="rb-table">
                <thead><tr><th>{ds.dims[cfg.dim]}</th><th>{m.label}</th><th>Pay</th><th>Önceki Dönem</th>{cfg.dataset === 'applications' && <><th>İşe Alım</th><th>Dönüşüm</th></>}</tr></thead>
                <tbody>{res.rows.map((r) => (
                  <tr key={r.key} onClick={() => pick(r.key)} className={ds.drill[cfg.dim] ? 'is-click' : ''}>
                    <td>{r.label}</td><td>{f(r.value)}</td><td>{res.additive && res.total ? `%${Math.round((r.value / res.total) * 100)}` : '—'}</td><td>{f(r.prev)}</td>
                    {cfg.dataset === 'applications' && <><td>{r.hires}</td><td>%{Math.round((r.hires / r.n) * 100)}</td></>}
                  </tr>))}</tbody>
              </table>
            ) : cfg.chart === 'kpi' ? (
              <div className="rb-big"><b>{f(res.total)}</b><span>{res.additive ? `Toplam ${m.label}` : `${AGG[cfg.agg]} ${m.label}`} · {PRESETS[cfg.preset][0]}</span></div>
            ) : (
              <Chart type={cfg.chart} rows={res.rows} fmt={f} onPick={pick} onHover={setHover} active={hover} />
            )}
            {ds.drill[cfg.dim] && cfg.chart !== 'kpi' && <p className="sx-note">Bir {ds.dims[cfg.dim].toLowerCase()} seçin: rapor {ds.dims[ds.drill[cfg.dim]].toLowerCase()} kırılımına iner; KPI, grafik ve tablo birlikte daralır.</p>}
          </div>
          <div className="rb-side">
            <div className="rb-funnel" aria-label="Huni">
              <span className="sx-eyebrow">Huni · kohort, kümülatif</span>
              <p className="sx-note">{hoverFunnel ? `${hoverLabel} · diğerleri silik` : 'Bir çubuğun üzerine gelin: huni o kırılıma süzülür.'}</p>
              {res.funnel.map(([l, v], i) => {
                const base = res.funnel[0][1] || 1
                const hv = hoverFunnel ? hoverFunnel[i][1] : null, hb = hoverFunnel ? hoverFunnel[0][1] || 1 : 1
                return (
                  <div key={l} className="rb-funnel__r">
                    <div className="rb-funnel__l"><span>{l}</span><b>{hoverFunnel ? hv : v}</b><em>%{Math.round(((hoverFunnel ? hv / hb : v / base)) * 100)}</em></div>
                    <div className="rb-funnel__bar"><i style={{ width: `${(v / base) * 100}%` }} className={hoverFunnel ? 'is-ghost' : ''} />{hoverFunnel && <i className="is-hot" style={{ width: `${(hv / hb) * 100}%` }} />}</div>
                  </div>
                )
              })}
            </div>
            <div className="rb-ins">
              <span className="sx-eyebrow">İçgörüler</span>
              <ul>{insights(res, cfg).map((t, i) => <li key={i}>{t}</li>)}</ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Asistan ── */
const QUICK = [ // gateway.QUICK_ACTIONS["HOTEL_HR"] + rehber + AI arama
  'Bu hafta kaç başvuru geldi?', 'Pipeline özeti', 'Kadro durumu nedir?', 'Bekleyen onaylarım neler?', 'İşe alım performans raporu',
  "SkillMatch'te pozisyon nasıl açılır?", 'Garson için en uygun adayları göster', 'Elif K. için mülakat planla', '30 yaş altı bayan garson arıyorum',
]
const RISK = { schedule_interview: ['Yüksek', 'Mülakat planla'], email_draft: ['Yüksek', 'E-posta gönder'], move_stage: ['Orta', 'Aşama değiştir'], offer: ['Orta', 'Teklif taslağı'], create_position: ['Yüksek', 'Kadro talebi oluştur'], add_note: ['Düşük', 'Not ekle'] }
const daysAgo = (n) => TODAY.getTime() - n * 86400000

function answer(text, ctx) {
  const intent = AS.classify(text)
  const legal = AS.findRules(text)
  const out = { intent: intent?.name || null, agent: intent?.agent || 'dialog', legal, cards: [], actions: [] }
  const crit = AS.parseQuery(text)
  const name = intent?.name
  if (name === 'recruitment_report' && /ka[cç]\s+ba[sş]vuru|başvuru sayısı/i.test(text)) {
    const n = /hafta/i.test(text) ? 7 : /bugün/i.test(text) ? 1 : 30
    const rows = RD.apps.filter((r) => r.applied >= daysAgo(n))
    const prev = RD.apps.filter((r) => r.applied >= daysAgo(2 * n) && r.applied < daysAgo(n))
    out.text = `Son ${n} günde ${rows.length} başvuru geldi (önceki ${n} gün: ${prev.length}).`
    const by = {}; rows.forEach((r) => { by[r.source] = (by[r.source] || 0) + 1 })
    out.cards.push({ type: 'count', title: 'Başvuru sayısı', value: rows.length, prev: prev.length, rows: Object.entries(by).sort((a, b) => b[1] - a[1]).slice(0, 5) })
    out.actions.push({ label: 'Raporda aç', cfg: { ...DEFAULT, dataset: 'applications', dim: 'source', measure: 'count', agg: 'count', chart: 'hbar', preset: 'last30' } })
  } else if (name === 'recruitment_report' || name === 'weekly_report' || name === 'daily_brief') {
    const rows = RD.apps.filter((r) => r.applied >= daysAgo(90))
    const hires = rows.filter((r) => r.status === 'hired')
    const tth = hires.length ? Math.round(hires.reduce((s, r) => s + r.tth, 0) / hires.length) : null
    out.text = 'Son 90 günün işe alım performansı (sentetik veri):'
    out.cards.push({ type: 'report', kpis: [['Başvuru', rows.length], ['Mülakat', rows.filter((r) => r.reached.interview).length], ['Teklif', rows.filter((r) => r.reached.offer).length], ['İşe alım', hires.length], ['Ort. işe alım süresi', tth != null ? `${tth} gün` : '—']], funnel: funnelOf(rows) })
    out.actions.push({ label: 'Otellere göre işe alım', cfg: { ...DEFAULT, dataset: 'hires', dim: 'hotel', measure: 'count', agg: 'count', chart: 'bar', preset: 'last90' } })
    out.actions.push({ label: 'İşe alım süresi', cfg: { ...DEFAULT, dataset: 'hires', dim: 'department', measure: 'tth', agg: 'avg', chart: 'hbar', preset: 'last90' } })
  } else if (name === 'pipeline_summary') {
    const act = RD.apps.filter((r) => !['hired', 'rejected', 'withdrawn'].includes(r.status))
    const by = {}; act.forEach((r) => { by[r.status] = (by[r.status] || 0) + 1 })
    const L = { applied: 'Başvurdu', screening: 'Ön eleme', shortlisted: 'Kısa liste', hr_interview: 'İK mülakatı', manager_interview: 'Yönetici mülakatı', offer: 'Teklif', onboarding: 'İşbaşı sürecinde' }
    out.text = `${act.length} aktif başvuru var. Aşama dağılımı:`
    out.cards.push({ type: 'pipeline', rows: Object.keys(L).filter((k) => by[k]).map((k) => [L[k], by[k]]) })
    out.actions.push({ label: 'Raporda aç', cfg: { ...DEFAULT, dataset: 'applications', dim: 'status', measure: 'count', agg: 'count', chart: 'hbar', preset: 'all' } })
  } else if (name === 'fte_forecast') {
    out.text = 'Belek Premium · Yiyecek ve İçecek kadro durumu (Ekim 2026 planı):'
    out.cards.push({ type: 'fte', rows: OPS_ROWS.map((r) => ({ t: r.title, p: r.has_budget ? FTE(r.planned) : '—', c: r.current, s: rowStatus(r) })) })
    out.actions.push({ label: 'Kadro konsoluna git', scroll: 'ihtiyac' })
  } else if (name === 'pending_approvals') {
    const p = RD.needs.filter((n) => ['in_budget_approval', 'out_of_budget_approval'].includes(n.status)).slice(0, 4)
    out.text = `Onayınızı bekleyen ${p.length} kadro talebi var:`
    out.cards.push({ type: 'approvals', rows: p.map((n) => ({ t: `${n.position} · ${n.fte} kişi`, h: `${n.hotel} · ${n.department}`, b: n.budget, chain: n.budget === 'Bütçe içi' ? 'Talep › DM › İK › Pozisyon' : 'Talep › DM › FC › GM › İK › Pozisyon' })) })
    out.actions.push({ label: 'Onay zincirini dene', scroll: 'onay' })
  } else if (name === 'help') {
    const secs = AS.findSections(text)
    if (secs.length) { out.text = 'Sistem kullanım rehberinden:'; secs.slice(0, 2).forEach((s) => out.cards.push({ type: 'help', ...s })) }
    else out.text = "Bunun için ayrı bir ekran tarifi yok; SkillMatch'i rolünüze göre kullanma akışını İK ekibiniz paylaşabilir."
  } else if (RISK[name]) {
    const [risk, label] = RISK[name]
    out.text = risk === 'Düşük' ? 'Notu ekledim. (Demo: kaydedilmedi.)' : `Bu işlem için onayınız gerekiyor.`
    if (risk !== 'Düşük') out.cards.push({ type: 'confirm', label, risk, summary: text })
  } else if (name === 'search_candidates' || name === 'recommend_positions' || (crit.keywords.length && !name)) {
    const pos = MD.positions.find((p) => AS.fold(text).includes(AS.fold(p.title)))
    if (pos && !crit.languages.length && !crit.locations.length) {
      const r = rankFor(pos.id, DEFAULT_WEIGHTS).filter((x) => x.elig.ok).slice(0, 4)
      out.text = `${pos.title} · ${hotelOf(pos.hotel_id).name} için önerilen adaylar (eşleşme skoru, rule-2):`
      out.cards.push({ type: 'candidates', rows: r.map((x) => ({ n: x.c.name, s: x.score, why: x.elig.reason })) })
      out.actions.push({ label: 'Eşleşme ağında aç', scroll: 'eslesme', position: pos.id })
    } else {
      const res = search(text)
      out.text = res.ignored.length ? res.ignored.map((i) => i.reason).join(' ') : `Uygulanan kriterler: ${res.describe}.`
      out.cards.push({ type: 'search', res })
    }
  } else if (crit.ignored.length) {
    out.text = crit.ignored.map((i) => i.reason).join(' ')
  } else {
    out.text = ASSIST.ui.fallback
    out.chips = ['Mesaj at', 'Mülakat planla', 'Pozisyon talebi aç', 'Rapor hazırla', 'Adayları göster', 'Bugün beni ne bekliyor?']
  }
  return out
}

function search(q) {
  const crit = AS.parseQuery(q)
  const applicable = !!(crit.languages.length || crit.min_experience_years || crit.locations.length || crit.seniority || crit.driving_license || crit.shift || crit.keywords.length)
  let hidden = 0
  const rows = []
  if (applicable) for (const c of MD.candidates) {
    const s = MD.search[String(c.id)]
    const ev = AS.evaluate(c, crit, s.years, s.location_keys, s.text)
    if (!ev.passes) { if (ev.incomplete) hidden++; continue }
    rows.push({ c, ...ev, action: ev.score >= 80 ? 'Mülakat Daveti Gönder' : 'Aday Profilini İncele' })
  }
  rows.sort((a, b) => b.score - a.score)
  return { crit, describe: AS.describe(crit), applicable, ignored: crit.ignored, rows, hidden }
}

function Card({ c, onAction }) {
  const [state, setState] = useState(null)
  if (c.type === 'count') return (
    <div className="ai-card"><div className="ai-kpi"><b>{c.value}</b><span>başvuru · önceki dönem {c.prev}</span></div>
      <ul className="ai-list">{c.rows.map(([k, v]) => <li key={k}><span>{k}</span><b>{v}</b></li>)}</ul></div>)
  if (c.type === 'report') return (
    <div className="ai-card"><div className="ai-kpis">{c.kpis.map(([k, v]) => <div key={k}><b>{v}</b><span>{k}</span></div>)}</div>
      <ul className="ai-list">{c.funnel.map(([k, v]) => <li key={k}><span>{k}</span><b>{v}</b></li>)}</ul></div>)
  if (c.type === 'pipeline') return <div className="ai-card"><ul className="ai-list">{c.rows.map(([k, v]) => <li key={k}><span>{k}</span><b>{v}</b></li>)}</ul></div>
  if (c.type === 'fte') return (
    <div className="ai-card"><ul className="ai-list">{c.rows.map((r) => <li key={r.t}><span>{r.t} · plan {r.p} · mevcut {r.c}</span><em className={`t-${r.s.tone}`}>{r.s.label}</em></li>)}</ul></div>)
  if (c.type === 'approvals') return (
    <div className="ai-card"><ul className="ai-list ai-list--stack">{c.rows.map((r, i) => <li key={i}><b>{r.t}</b><span>{r.h} · {r.b}</span><em>{r.chain}</em></li>)}</ul>
      <p className="ai-fine">Onay ya da red asistan üzerinden de verilebilir; her zaman önce onay kartı çıkar ve yalnız o adımın onaycısı karar verebilir.</p></div>)
  if (c.type === 'help') return (
    <div className="ai-card"><b>{c.title}</b><p className="ai-path">Menü: {c.path}</p><p>{c.body}</p><p className="ai-fine">Kim: {c.who}</p></div>)
  if (c.type === 'candidates') return (
    <div className="ai-card"><ul className="ai-list ai-list--stack">{c.rows.map((r) => <li key={r.n}><b>{r.n} · %{r.s} eşleşme</b><span>{r.why}</span></li>)}</ul>
      <p className="ai-fine">Eşleşme skoru karar değildir; ilerletme ve eleme yetkili iş akışından yapılır.</p></div>)
  if (c.type === 'search') return <SearchResults res={c.res} compact />
  if (c.type === 'confirm') return (
    <div className="ai-card ai-confirm">
      <div className="ai-confirm__hd"><b>{c.label}</b><span>Etki düzeyi: {c.risk}</span></div>
      <p>“{c.summary}”</p>
      {state == null ? (
        <div className="ai-confirm__act"><button className="sx-btn sx-btn--ink sx-btn--sm" onClick={() => setState('ok')}>Onayla</button><button className="sx-btn sx-btn--ghost sx-btn--sm" onClick={() => setState('no')}>Vazgeç</button></div>
      ) : state === 'ok' ? <p className="ai-fine">Demo: işlem yapılmadı. Üründe onaydan sonra yetkiniz yeniden kontrol edilir ve onay kartındaki argümanlarla çalışır; bekleyen işlem 30 dakika geçerlidir.</p>
        : <p className="ai-fine">Vazgeçildi.</p>}
    </div>)
  return null
}

function SearchResults({ res, compact }) {
  return (
    <div className={`ts-res${compact ? ' ts-res--compact' : ''}`}>
      {res.ignored.length > 0 && <ul className="ts-ign">{res.ignored.map((i) => <li key={i.criterion}><b>Uygulanmadı: {i.text}</b> — {i.reason}</li>)}</ul>}
      {res.applicable && <p className="ts-stats">Uygulanan kriterler: {res.describe}. <b>{res.rows.length} aday bulundu.</b>{res.hidden ? ` Bilgisi girilmemiş ${res.hidden} aday gösterilmedi.` : ''}</p>}
      <div className="ts-cards">
        {res.rows.slice(0, compact ? 3 : 6).map((r) => (
          <div key={r.c.id} className="ts-card">
            <div className="ts-card__hd"><b>{r.c.name}</b><span>%{r.score} Uyum</span></div>
            <ul>{r.criteria.map((k, i) => <li key={i} className={`s-${k.status}`}><i aria-hidden="true">{k.status === 'match' ? '✓' : k.status === 'miss' ? '✗' : '?'}</i><span>{k.label}</span><em>{k.evidence}</em></li>)}</ul>
            <p className="ts-card__act">Öneri: {r.action}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function Assistant({ onReport }) {
  const [msgs, setMsgs] = useState([{ id: 0, who: 'bot', text: ASSIST.ui.greeting }])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const end = useRef(null)
  const journey = useJourney()
  useEffect(() => { const el = end.current?.parentElement; if (el) el.scrollTop = el.scrollHeight }, [msgs, busy])
  const send = (text) => {
    const t = (text ?? input).trim(); if (!t || busy) return
    setInput('')
    setMsgs((m) => [...m, { id: m.length, who: 'me', text: t }])
    setBusy(true)
    // ürün akış (streaming) yapmaz: yazıyor göstergesi, sonra tek cevap
    setTimeout(() => {
      const a = answer(t)
      setMsgs((m) => [...m, { id: m.length, who: 'bot', ...a }])
      setBusy(false)
    }, 520)
  }
  const act = (a) => {
    if (a.cfg) onReport(a.cfg)
    if (a.position) journey?.setPositionId(a.position)
    if (a.scroll) { const el = document.getElementById(a.scroll); el && window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 40, behavior: 'smooth' }) }
  }
  return (
    <div className="ai">
      <div className="ai__hd"><b>SkillMatch AI Asistan</b><span className="sx-badge sx-badge--demo">Otel İK rolü · sentetik veri</span></div>
      <div className="ai__log" aria-live="polite">
        {msgs.map((m) => (
          <div key={m.id} className={`ai-msg ai-msg--${m.who}`}>
            {m.legal?.length > 0 && (
              <div className="ai-legal"><b>⚠ İlgili mevzuat notları:</b>{m.legal.map((r) => <p key={r.id}>• {r.title} ({r.source}): {r.text}</p>)}<p className="ai-fine">{ASSIST.legal.disclaimer}</p></div>
            )}
            {m.text && <p>{m.text}</p>}
            {m.cards?.map((c, i) => <Card key={i} c={c} />)}
            {(m.actions?.length > 0 || m.chips) && (
              <div className="ai-acts">
                {m.actions?.map((a) => <button key={a.label} className="sx-chip" onClick={() => act(a)}>{a.label} →</button>)}
                {m.chips?.map((c) => <button key={c} className="sx-chip" onClick={() => send(c)}>{c}</button>)}
              </div>
            )}
            {m.intent && <span className="ai-meta">niyet: {m.intent} · ajan: {m.agent} · kural tabanlı</span>}
          </div>
        ))}
        {busy && <div className="ai-msg ai-msg--bot"><span className="ai-typing" aria-label="Yazıyor"><i /><i /><i /></span></div>}
        <i ref={end} />
      </div>
      <div className="ai__chips">{QUICK.map((q) => <button key={q} className="sx-chip" onClick={() => send(q)}>{q}</button>)}</div>
      <form className="ai__in" onSubmit={(e) => { e.preventDefault(); send() }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={ASSIST.ui.placeholder} aria-label="Asistana yazın" maxLength={300} />
        <button className="sx-btn sx-btn--ink sx-btn--sm" type="submit" disabled={busy}>Gönder</button>
      </form>
    </div>
  )
}

const EXAMPLES = ['Rusça bilen resepsiyonist', "Antalya'da 3+ yıl deneyimli, İngilizce B2 bilen garson", 'HACCP sertifikalı, sezonluk çalışabilecek aşçı yardımcısı', "Muğla'da kokteyl deneyimli barmen", 'Almanca akıcı, Bodrum konsiyerj']

function TalentSearch() {
  const [q, setQ] = useState(EXAMPLES[1])
  const [res, setRes] = useState(() => search(EXAMPLES[1]))
  const go = (v) => { const t = (v ?? q).trim(); if (!t) return; setQ(t); setRes(search(t)) }
  return (
    <div className="ts">
      <div className="ai__hd"><b>Aday Havuzu · AI arama</b><span className="sx-note">kural tabanlı · her kriter kanıtıyla</span></div>
      <form className="ai__in" onSubmit={(e) => { e.preventDefault(); go() }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={ASSIST.ui.search_placeholder} aria-label="Doğal dille aday ara" maxLength={200} />
        <button className="sx-btn sx-btn--ink sx-btn--sm" type="submit">Ara</button>
      </form>
      <div className="ai__chips">{EXAMPLES.map((e) => <button key={e} className="sx-chip" onClick={() => go(e)}>{e}</button>)}</div>
      <SearchResults res={res} />
      <p className="sx-note">Yaş, cinsiyet, engellilik, medeni durum ve uyruk aday kaydında tutulmaz; sorguda geçse bile uygulanmaz ve nedeni söylenir. Bilgisi eksik aday elenir ve kaçının gizlendiği yazılır.</p>
    </div>
  )
}

export default function Insight() {
  const [cfg, setCfg] = useState({ ...DEFAULT })
  const rbRef = useRef(null)
  const toReport = (c) => { setCfg({ ...c }); rbRef.current && window.scrollTo({ top: rbRef.current.getBoundingClientRect().top + scrollY - 70, behavior: 'smooth' }) }
  return (
    <section className="sx-act in" id="karar" data-act="karar" data-tone="light" aria-labelledby="in-title">
      <div className="sx-wrap in__head">
        <span className="sx-eyebrow">Dinamik raporlar · AI asistan</span>
        <h2 id="in-title" className="sx-h2">Soruyu siz sorun, <em>veri cevaplasın.</em></h2>
        <p className="sx-lead">Rapor Oluşturucu'da boyutu, ölçüyü, hesaplamayı ve grafik türünü değiştirin; bir çubuğa tıklayıp aşağı inin. Aynı veriye asistana sorarak da ulaşın. Sayılar sentetik bir sezondan gelir ve her seçimde aynı kayıtlardan yeniden hesaplanır.</p>
      </div>
      <div className="sx-wrap" ref={rbRef}><ReportBuilder cfg={cfg} setCfg={setCfg} /></div>
      <div className="sx-wrap in__duo">
        <Assistant onReport={toReport} />
        <TalentSearch />
      </div>
      <div className="sx-wrap"><p className="sx-note in__src">Asistanın niyet tablosu, sistem rehberi, mevzuat notları ve arama sözlükleri SkillMatch kaynağından ({ASSIST.source.commit}) alındı; bu sayfada dil modeli çağrılmaz. Üründe anahtar tanımlıysa aynı veriler model tarafından düz yazıya çevrilir ve “AI” rozeti gösterilir.</p></div>
    </section>
  )
}
