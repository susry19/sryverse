/* Rapor Oluşturucu — SkillMatch'in özel rapor kataloğu (services/report_builder_service.py)
   sentetik ama tutarlı bir veri kümesi üzerinde. Sayılar rastgele değişmez:
   veri bir kez sabit tohumla üretilir, her seçim aynı kayıtları yeniden toplar.

   Ürünle aynı olanlar: veri alanları, boyut ve ölçü adları, hesaplama türleri,
   zamana / kategoriye göre geçerli grafik türleri (TIME_CHARTS / CATEGORY_CHARTS),
   varsayılan grafik (zaman → alan, kategori → yatay çubuk), drill-down zinciri
   (DRILL_NEXT), sonuç kartları (Toplam / Kırılım / En Yüksek / Günlük Ortalama),
   huni aşamaları (Başvuru → Ön değerlendirme → Mülakat → Teklif → İşe alındı, kümülatif). */

export const TODAY = new Date(Date.UTC(2026, 9, 29))
const DAY = 86400000

function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }
const pick = (R, items) => { const tot = items.reduce((s, x) => s + x[1], 0); let r = R() * tot; for (const [v, w] of items) { if ((r -= w) <= 0) return v } return items[items.length - 1][0] }

export const HOTELS = ['Belek Premium', 'Tekirova Premium', 'Beldibi Resort', 'Downtown Antalya', 'Bodrum Premium', 'Göcek Suites']
const HOTEL_W = [26, 20, 14, 10, 18, 12]
export const DEPTS = {
  'Yiyecek ve İçecek': { w: 30, pos: [['Garson', 6], ['Komi', 3], ['Barmen', 2], ['Hostes', 1]], tth: 13, sal: 31000 },
  'Kat Hizmetleri': { w: 22, pos: [['Kat Görevlisi', 6], ['Çamaşırhane Görevlisi', 1], ['Kat Şefi', 1]], tth: 11, sal: 29000 },
  'Mutfak': { w: 18, pos: [['Aşçı Yardımcısı', 4], ['Commis', 3], ['Chef de Partie', 1]], tth: 17, sal: 33000 },
  'Ön Büro': { w: 14, pos: [['Resepsiyonist', 4], ['Misafir İlişkileri Temsilcisi', 2], ['Bellboy', 2]], tth: 19, sal: 34000 },
  'Teknik Servis': { w: 8, pos: [['Teknisyen', 3], ['Elektrikçi', 1]], tth: 24, sal: 38000 },
  'SPA': { w: 8, pos: [['SPA Terapisti', 3], ['SPA Resepsiyonist', 1]], tth: 21, sal: 35000 },
}
// source_catalog.py etiketleri; kalite: işe alım dönüşümünü etkileyen sentetik katsayı
export const SOURCES = [['Kariyer Sitesi', 22, 1.0], ['QR Kod', 18, 1.05], ['Kapı Başvurusu', 14, 1.15], ['Referans', 10, 1.6], ['Kariyer.net', 12, 0.85], ['Eleman.net', 8, 0.8], ['LinkedIn', 5, 0.9], ['İç Havuz', 5, 1.4], ['Indeed', 3, 0.75], ['Kariyer Fuarı', 2, 1.1], ['Ajans', 1, 1.2]]
const OWNERS = ['İK Uzmanı · Belek', 'İK Uzmanı · Kemer', 'İK Uzmanı · Muğla', 'Merkez İK']
export const STATUS_LABEL = { applied: 'Başvurdu', screening: 'Ön eleme', shortlisted: 'Kısa liste', hr_interview: 'İK mülakatı', manager_interview: 'Yönetici mülakatı', offer: 'Teklif', onboarding: 'İşbaşı sürecinde', hired: 'İşe alındı', rejected: 'Elendi', withdrawn: 'Aday çekildi' }

function build() {
  const R = rng(20260401)
  const start = Date.UTC(2026, 2, 1), end = TODAY.getTime() - DAY
  const apps = [], needs = []
  let cand = 0
  const deptList = Object.entries(DEPTS)
  // sezon eğrisi: Nisan–Haziran tepe, Eylül'den sonra iner
  const season = (t) => { const m = new Date(t).getUTCMonth(); return [0, 0, 0.55, 1.25, 1.45, 1.3, 1.0, 0.85, 0.7, 0.5][m] || 0.4 }
  for (let t = start; t <= end; t += DAY) {
    const n = Math.round((3.2 + R() * 2.4) * season(t) * (new Date(t).getUTCDay() === 0 ? 0.55 : 1))
    for (let k = 0; k < n; k++) {
      const hotel = pick(R, HOTELS.map((h, i) => [h, HOTEL_W[i]]))
      const [dept, D] = pick(R, deptList.map(([d, v]) => [[d, v], v.w]))
      const position = pick(R, D.pos)
      const src = pick(R, SOURCES.map((s) => [s, s[1]]))
      const q = src[2]
      const repeat = R() < 0.14 && cand > 10
      const candidate = repeat ? 1 + Math.floor(R() * cand) : ++cand
      const age = (end - t) / DAY
      const r1 = R(), r2 = R(), r3 = R(), r4 = R()
      const screened = r1 < 0.78
      const interviewed = screened && r2 < 0.46 * q
      const offered = interviewed && r3 < 0.52 * Math.min(1.25, q)
      const accepted = offered && r4 < 0.8
      const tth = Math.round(D.tth * (0.6 + R() * 0.9) * (src[0] === 'Referans' ? 0.75 : 1))
      let status
      if (accepted && age > tth) status = 'hired'
      else if (accepted) status = age > tth * 0.7 ? 'onboarding' : 'offer'
      else if (offered) status = age > 14 ? 'withdrawn' : 'offer'
      else if (interviewed) status = age > 12 ? 'rejected' : pick(R, [['hr_interview', 2], ['manager_interview', 1]])
      else if (screened) status = age > 9 ? 'rejected' : pick(R, [['screening', 2], ['shortlisted', 1]])
      else status = age > 6 ? 'rejected' : 'applied'
      const score = Math.round(Math.min(96, Math.max(18, 44 + (interviewed ? 16 : 0) + (offered ? 10 : 0) + (R() - 0.5) * 34)))
      apps.push({
        id: apps.length + 1, candidate, hotel, department: dept, position, source: src[0], owner: OWNERS[(HOTELS.indexOf(hotel) + (dept.length % 2)) % OWNERS.length],
        applied: t, status, reached: { screening: screened, interview: interviewed, offer: offered, hired: status === 'hired' },
        hired_at: status === 'hired' ? t + tth * DAY : null, tth: status === 'hired' ? tth : null, score,
        salary: Math.round((D.sal * (0.92 + R() * 0.22)) / 500) * 500,
      })
    }
  }
  // Kadro talepleri (staffing_needs)
  const NS = [['position_created', 30], ['filled', 18], ['approved', 8], ['in_budget_approval', 8], ['out_of_budget_approval', 6], ['revision_requested', 3], ['rejected', 5], ['cancelled', 2]]
  for (let i = 0; i < 96; i++) {
    const t = start + Math.floor(R() * ((end - start) / DAY)) * DAY
    const hotel = pick(R, HOTELS.map((h, j) => [h, HOTEL_W[j]]))
    const [dept, D] = pick(R, deptList.map(([d, v]) => [[d, v], v.w]))
    const budget = R() < 0.74 ? 'Bütçe içi' : 'Bütçe dışı'
    let status = pick(R, NS)
    if (budget === 'Bütçe içi' && status === 'out_of_budget_approval') status = 'in_budget_approval'
    if (budget === 'Bütçe dışı' && status === 'in_budget_approval') status = 'out_of_budget_approval'
    needs.push({ id: i + 1, hotel, department: dept, position: pick(R, D.pos), budget, status, priority: pick(R, [['Acil', 2], ['Yüksek', 4], ['Normal', 8], ['Düşük', 2]]), fte: 1 + Math.floor(R() * 4), created: t,
      approved: ['position_created', 'filled', 'approved'].includes(status) })
  }
  return { apps, needs }
}
export const DATA = build()

const NEED_LABEL = { position_created: 'Pozisyon açıldı', filled: 'Dolduruldu', approved: 'Onaylandı', in_budget_approval: 'Onay sürecinde', out_of_budget_approval: 'Onay sürecinde (bütçe dışı)', revision_requested: 'Revizyon istendi', rejected: 'Reddedildi', cancelled: 'İptal edildi' }
const MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
const monthKey = (t) => { const d = new Date(t); return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}` }
const monthLabel = (k) => { const [y, m] = k.split('-'); return `${MONTHS[+m - 1]} ${y}` }

// report_builder_service.DATASETS (alt küme)
export const DATASETS = {
  applications: {
    label: 'Başvurular', rows: () => DATA.apps, date: (r) => r.applied,
    dims: { source: 'Başvuru Kaynağı', status: 'Pipeline Aşaması', hotel: 'Otel', department: 'Departman', position: 'Pozisyon', owner: 'Sorumlu', period: 'Dönem' },
    measures: {
      count: { label: 'Başvuru Sayısı', kind: 'count' },
      candidates: { label: 'Aday Sayısı', kind: 'distinct', field: 'candidate' },
      hires: { label: 'İşe Alım Sayısı', kind: 'flag', test: (r) => r.status === 'hired' },
      interviews: { label: 'Mülakata Ulaşan Başvuru', kind: 'flag', test: (r) => r.reached.interview },
      offers: { label: 'Teklif Verilen Başvuru', kind: 'flag', test: (r) => r.reached.offer },
      score: { label: 'Eşleşme Skoru', kind: 'num', field: 'score', unit: 'puan' },
      salary: { label: 'Ücret Beklentisi', kind: 'num', field: 'salary', unit: 'TRY' },
      conv: { label: 'İşe Alım Dönüşümü', kind: 'rate', test: (r) => r.status === 'hired' },
    },
    drill: { source: 'position', hotel: 'department', department: 'position', position: 'status', status: 'source', owner: 'position' },
  },
  hires: {
    label: 'İşe Alımlar', rows: () => DATA.apps.filter((r) => r.status === 'hired'), date: (r) => r.hired_at,
    dims: { source: 'Başvuru Kaynağı', hotel: 'Otel', department: 'Departman', position: 'Pozisyon', owner: 'Sorumlu', period: 'Dönem' },
    measures: {
      count: { label: 'İşe Alım Sayısı', kind: 'count' },
      candidates: { label: 'Aday Sayısı', kind: 'distinct', field: 'candidate' },
      tth: { label: 'İşe Alım Süresi', kind: 'num', field: 'tth', unit: 'gün' },
    },
    drill: { hotel: 'department', department: 'position', position: 'source', owner: 'position' },
  },
  staffing: {
    label: 'Kadro Talepleri', rows: () => DATA.needs, date: (r) => r.created,
    dims: { status: 'Talep Durumu', priority: 'Öncelik', budget: 'Bütçe Sınıfı', position: 'Pozisyon', hotel: 'Otel', department: 'Departman', period: 'Dönem' },
    measures: {
      count: { label: 'Talep Sayısı', kind: 'count' },
      fte: { label: 'FTE', kind: 'num', field: 'fte', unit: 'FTE' },
      approved: { label: 'Onaylanan Talep', kind: 'flag', test: (r) => r.approved },
    },
    drill: { hotel: 'department', department: 'position', budget: 'status', status: 'priority', priority: 'position' },
  },
}

// Hesaplama (report_builder_service: Sayı, Toplam, Ortalama, En Düşük, En Yüksek, Tekil Sayı, Medyan, Oran)
export const AGG = { count: 'Sayı', sum: 'Toplam', avg: 'Ortalama', median: 'Medyan', min: 'En Düşük', max: 'En Yüksek', distinct: 'Tekil Sayı', rate: 'Oran' }
export function aggsFor(m) {
  if (m.kind === 'count') return ['count']
  if (m.kind === 'distinct') return ['distinct']
  if (m.kind === 'flag') return ['sum']
  if (m.kind === 'rate') return ['rate']
  return ['avg', 'sum', 'median', 'min', 'max']
}
export const CHARTS = { bar: 'Çubuk', hbar: 'Yatay Çubuk', line: 'Çizgi', area: 'Alan', donut: 'Donut', table: 'Tablo', kpi: 'KPI' }
export const TIME_CHARTS = ['area', 'line', 'bar', 'table', 'kpi']
export const CATEGORY_CHARTS = ['hbar', 'bar', 'donut', 'table', 'kpi']
export const PRESETS = { last30: ['Son 30 gün', 30], last90: ['Son 90 gün', 90], ytd: ['Bu yıl', null], all: ['Tüm zamanlar', null] }

function range(preset) {
  const end = TODAY.getTime()
  if (preset === 'all') return { from: -Infinity, to: end, prev: null, days: null }
  if (preset === 'ytd') { const from = Date.UTC(2026, 0, 1); return { from, to: end, prev: { from: Date.UTC(2025, 0, 1), to: Date.UTC(2025, 9, 29) }, days: Math.round((end - from) / DAY) } }
  const d = PRESETS[preset][1]
  return { from: end - d * DAY, to: end, prev: { from: end - 2 * d * DAY, to: end - d * DAY }, days: d }
}

const keyOf = (ds, dim, r) => {
  if (dim === 'period') return monthKey(ds.date(r))
  if (dim === 'status' && ds === DATASETS.staffing) return NEED_LABEL[r.status]
  if (dim === 'status') return STATUS_LABEL[r.status]
  return r[dim]
}

function reduce(rows, m, agg) {
  if (!rows.length) return m.kind === 'rate' || m.kind === 'num' ? null : 0
  if (m.kind === 'count') return rows.length
  if (m.kind === 'distinct') return new Set(rows.map((r) => r[m.field])).size
  if (m.kind === 'flag') return rows.filter(m.test).length
  if (m.kind === 'rate') return Math.round((1000 * rows.filter(m.test).length) / rows.length) / 10
  const v = rows.map((r) => r[m.field]).filter((x) => x != null).sort((a, b) => a - b)
  if (!v.length) return null
  if (agg === 'sum') return v.reduce((s, x) => s + x, 0)
  if (agg === 'min') return v[0]
  if (agg === 'max') return v[v.length - 1]
  if (agg === 'median') return v.length % 2 ? v[(v.length - 1) / 2] : (v[v.length / 2 - 1] + v[v.length / 2]) / 2
  return Math.round((10 * v.reduce((s, x) => s + x, 0)) / v.length) / 10
}

export function filterRows(cfg, which = 'cur') {
  const ds = DATASETS[cfg.dataset]
  const rg = range(cfg.preset)
  const win = which === 'prev' ? rg.prev : rg
  if (!win) return []
  return ds.rows().filter((r) => {
    const t = ds.date(r)
    if (t == null || t < win.from || t >= win.to + DAY) return false
    if (cfg.hotels.length && !cfg.hotels.includes(r.hotel)) return false
    if (cfg.departments.length && !cfg.departments.includes(r.department)) return false
    for (const d of cfg.drill) if (keyOf(ds, d.field, r) !== d.value) return false
    return true
  })
}

export function run(cfg) {
  const ds = DATASETS[cfg.dataset], m = ds.measures[cfg.measure]
  const rows = filterRows(cfg), prevRows = filterRows(cfg, 'prev')
  const groups = new Map()
  for (const r of rows) { const k = keyOf(ds, cfg.dim, r); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(r) }
  const prevGroups = new Map()
  for (const r of prevRows) { const k = keyOf(ds, cfg.dim, r); if (!prevGroups.has(k)) prevGroups.set(k, []); prevGroups.get(k).push(r) }
  let out = [...groups.entries()].map(([k, rs]) => ({ key: k, label: cfg.dim === 'period' ? monthLabel(k) : k, value: reduce(rs, m, cfg.agg), prev: prevGroups.has(k) ? reduce(prevGroups.get(k), m, cfg.agg) : null, n: rs.length, hires: rs.filter((r) => r.status === 'hired').length }))
  out = out.filter((x) => x.value != null)
  if (cfg.dim === 'period') out.sort((a, b) => a.key.localeCompare(b.key))
  else if (cfg.sort === 'asc') out.sort((a, b) => a.value - b.value)
  else if (cfg.sort === 'az') out.sort((a, b) => a.label.localeCompare(b.label, 'tr'))
  else out.sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, 'tr'))
  const additive = ['count', 'distinct', 'flag'].includes(m.kind) || cfg.agg === 'sum'
  const total = additive ? (m.kind === 'distinct' ? reduce(rows, m) : out.reduce((s, x) => s + x.value, 0)) : reduce(rows, m, cfg.agg)
  const prevTotal = range(cfg.preset).prev ? (additive ? (m.kind === 'distinct' ? reduce(prevRows, m) : prevRows.length ? [...prevGroups.values()].reduce((s, rs) => s + reduce(rs, m, cfg.agg), 0) : 0) : reduce(prevRows, m, cfg.agg)) : null
  const top = out.slice().sort((a, b) => b.value - a.value)[0]
  const days = range(cfg.preset).days || Math.max(1, Math.round((TODAY.getTime() - Date.UTC(2026, 2, 1)) / DAY))
  const funnel = funnelOf(cfg.dataset === 'applications' ? rows : filterRows({ ...cfg, dataset: 'applications', drill: [] }))
  return { ds, m, rows: out, total, prevTotal, additive, top, daily: additive ? Math.round((10 * total) / days) / 10 : null, funnel, count: rows.length }
}

export function funnelOf(rows) {
  return [
    ['Başvuru', rows.length], ['Ön değerlendirme', rows.filter((r) => r.reached.screening).length], ['Mülakat', rows.filter((r) => r.reached.interview).length],
    ['Teklif', rows.filter((r) => r.reached.offer).length], ['İşe alındı', rows.filter((r) => r.status === 'hired').length],
  ]
}

export function groupRows(cfg, key) {
  const ds = DATASETS[cfg.dataset]
  return filterRows(cfg).filter((r) => keyOf(ds, cfg.dim, r) === key)
}

export function fmt(v, m, agg) {
  if (v == null) return '—'
  if (m.kind === 'rate') return `%${String(v).replace('.', ',')}`
  if (m.unit === 'TRY') return `${Math.round(v).toLocaleString('tr-TR')} ₺`
  const s = Number.isInteger(v) ? v.toLocaleString('tr-TR') : v.toLocaleString('tr-TR', { maximumFractionDigits: 1 })
  return m.unit && m.kind === 'num' ? `${s} ${m.unit}` : s
}

export function insights(res, cfg) {
  const out = []
  const { rows, m } = res
  if (!rows.length) return ['Seçili filtrelerde kayıt yok.']
  if (cfg.dim === 'period' && rows.length >= 2) {
    const a = rows[rows.length - 2], b = rows[rows.length - 1]
    if (a.value) out.push(`${b.label}, ${a.label}'e göre ${b.value >= a.value ? '%' + Math.round(((b.value - a.value) / a.value) * 100) + ' yukarıda' : '%' + Math.round(((a.value - b.value) / a.value) * 100) + ' aşağıda'} (${fmt(b.value, m)} / ${fmt(a.value, m)}). Son ay henüz bitmedi.`)
    const peak = rows.slice().sort((x, y) => y.value - x.value)[0]
    out.push(`Tepe dönem: ${peak.label} (${fmt(peak.value, m)}).`)
  } else if (res.additive && res.total) {
    const top = rows[0]
    out.push(`${top.label} toplamın %${Math.round((top.value / res.total) * 100)}'ini oluşturuyor.`)
    if (rows.length > 3) out.push(`İlk 3 kırılım toplamın %${Math.round((rows.slice(0, 3).reduce((s, x) => s + x.value, 0) / res.total) * 100)}'i.`)
  } else {
    const s = rows.slice().sort((x, y) => y.value - x.value)
    out.push(`En yüksek: ${s[0].label} (${fmt(s[0].value, m)}), en düşük: ${s[s.length - 1].label} (${fmt(s[s.length - 1].value, m)}).`)
  }
  if (cfg.dataset === 'applications' && cfg.dim !== 'period') {
    const conv = rows.filter((r) => r.n >= 12).map((r) => ({ l: r.label, c: r.hires / r.n })).sort((a, b) => b.c - a.c)
    if (conv.length >= 2) out.push(`İşe alım dönüşümü en yüksek ${conv[0].l} (%${Math.round(conv[0].c * 100)}), en düşük ${conv[conv.length - 1].l} (%${Math.round(conv[conv.length - 1].c * 100)}).`)
  }
  return out
}
