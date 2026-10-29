/* Operasyon simülasyonu — SkillMatch'in kadro, talep, onay ve kilit kuralları.

   Kaynaklar (skillmatch-ai/backend):
   - routers/order_taker.py::_position_breakdown_for_scope   kadro satırı + durum etiketi
   - services/staffing_approval_service.py::classify_from_row bütçe içi / dışı
   - services/staffing_approval_service.py::budget_check_text kontrol metni
   - staffing_approval_service.create_staffing_approval_flow  DM → (FC → GM) zinciri
   - routers/staffing_needs.py  gönderim, karar, revizyon, red notu, öz-onay yasağı
   - services/department_manager_service.py  durum etiketleri
   - services/sla_service.py  bütçe içi SLA 2 / eskalasyon 3, bütçe dışı 3 / 5 iş günü
   - routers/applications.py + ownership_service  kilit 10 gün, etkinlikte 7 güne yenileme,
     süre dolunca ortak havuz, en çok 3 uzatma
   Hiçbiri sunucuya gitmez; aynı kurallar tarayıcıda, sentetik kadro satırıyla. */

export const FTE = (v) => (v == null ? '—' : `${+v}`.replace('.', ','))

// Belek Premium · Yiyecek ve İçecek kadro satırları (sentetik)
export const ROWS = [
  { title: 'Garson', planned: 14, current: 11, in_progress: 1, has_budget: true },
  { title: 'Komi', planned: 6, current: 6, in_progress: 0, has_budget: true },
  { title: 'Barmen', planned: 4, current: 3, in_progress: 1, has_budget: true },
  { title: 'Restoran Şefi', planned: 1, current: 2, in_progress: 0, has_budget: true },
  { title: 'Hostes', planned: 0, current: 0, in_progress: 0, has_budget: false },
]

export function rowStatus(row, extra = 0) {
  const in_progress = row.in_progress + extra
  const open = Math.max(0, row.planned - row.current)
  const remaining = Math.max(0, Math.round((open - in_progress) * 10) / 10)
  let label, tone
  if (!row.has_budget) { label = 'Kadro planı tanımlanmamış'; tone = 'demo' }
  else if (open <= 0 && row.current > row.planned) { label = `Planlanan ${row.current - row.planned} kişi üzerinde`; tone = 'risk' }
  else if (open <= 0) { label = 'Tam kadro'; tone = 'ok' }
  else if (remaining <= 0) { label = 'İşe alım devam ediyor'; tone = 'info' }
  else { label = `${FTE(remaining)} kişi için talep açılabilir`; tone = 'wait' }
  return { open, remaining, in_progress, label, tone, can_request: row.has_budget && remaining > 0 }
}

export function classify(row, needed) {
  if (!row.has_budget) return 'out_of_budget'
  const available = row.planned - row.current - row.in_progress
  return needed <= available + 1e-6 ? 'in_budget' : 'out_of_budget'
}

export function budgetText(row, needed) {
  const c = classify(row, needed)
  const head = c === 'in_budget' ? 'Bütçe içi' : 'Bütçe dışı'
  if (!row.has_budget) return `${head} — bu pozisyon için kadro planı yok`
  return `${head} — HC planı ${FTE(row.planned)} · mevcut ${FTE(row.current)} · açık ${FTE(row.planned - row.current)} · FTE: diğer taleplerde ${FTE(row.in_progress)}, bu talep ${FTE(needed)}`
}

export const OPENERS = [
  { key: 'ORDER_TAKER', label: 'Talep Girişi', who: 'Restoran ekibi' },
  { key: 'DEPARTMENT_MANAGER', label: 'Departman Müdürü', who: 'Yiyecek ve İçecek Müdürü' },
  { key: 'HOTEL_HR', label: 'Otel İK', who: 'Otel İK yetkilisi' },
]

export const ROLE = {
  DEPARTMENT_MANAGER: 'Departman Müdürü', FINANCE: 'Financial Controller', GENERAL_MANAGER: 'Genel Müdür', HR: 'İnsan Kaynakları',
}

// routers/staffing_needs.py — bütçe dışı gerekçe kodları (index.html:5424)
export const REASONS = [
  ['replacement', 'Yerine Alım (Replacement)'], ['seasonal_peak', 'Sezon Yoğunluğu'], ['new_outlet', 'Yeni Outlet / Operasyon'],
  ['extra_shift', 'Ek Vardiya'], ['project_temp', 'Proje / Geçici İhtiyaç'], ['other', 'Diğer'],
]

export const STATUS = {
  draft: ['Onay akışı başlamadı', 'demo'],
  in_budget_approval: ['Onay sürecinde', 'wait'],
  out_of_budget_approval: ['Onay sürecinde (bütçe dışı)', 'wait'],
  revision_requested: ['Revizyon istendi', 'risk'],
  approved: ['Onaylandı', 'ok'],
  rejected: ['Reddedildi', 'risk'],
  position_created: ['Pozisyon açıldı', 'ok'],
}

export const SLA = { in_budget: { sla: 2, esc: 3 }, out_of_budget: { sla: 3, esc: 5 } }

export function chainPath(opener, cls) {
  if (opener === 'DEPARTMENT_MANAGER') return ['Talep', 'İK', 'Pozisyon']
  return cls === 'in_budget' ? ['Talep', 'DM', 'İK', 'Pozisyon'] : ['Talep', 'DM', 'FC', 'GM', 'İK', 'Pozisyon']
}

export const initial = {
  opener: 'ORDER_TAKER', needed: 2, reason: '', status: 'draft', cls: null, steps: [], log: [], day: 0,
  position: null, error: null, since: 0,
}

const stamp = (s, text, tone = 'info') => ({ ...s, log: [...s.log, { day: s.day, text, tone }] })

export function reduce(s, a) {
  switch (a.type) {
    case 'opener': return s.status === 'draft' || s.status === 'revision_requested' ? { ...s, opener: a.value, error: null } : s
    case 'needed': return s.status === 'draft' || s.status === 'revision_requested' ? { ...s, needed: Math.max(1, Math.min(6, a.value)), error: null } : s
    case 'reason': return { ...s, reason: a.value, error: null }
    case 'submit': {
      const row = ROWS[0]
      const cls = classify(row, s.needed)
      if (cls === 'out_of_budget' && !s.reason) {
        return { ...s, error: 'Bu talep mevcut kadro bütçesini aşıyor. Pozisyon açma tamamen engellenmiyor - devam edebilmek için bir gerekçe seçin.' }
      }
      let n = { ...s, cls, error: null }
      n = stamp(n, 'Gönderildi')
      n = stamp(n, `Bütçe kontrolü (HC/FTE): ${budgetText(row, s.needed)}`)
      if (s.opener === 'DEPARTMENT_MANAGER') {
        // _send_dm_request_to_hr: DM'nin kendi talebi zincirsiz İK'ya gider
        return stamp({ ...n, status: 'approved', steps: [] }, 'Departman Müdürü kendi talebini açtı: onay zinciri atlanır, talep doğrudan İnsan Kaynakları\'na iletildi.', 'ok')
      }
      const steps = cls === 'in_budget'
        ? [{ role: 'DEPARTMENT_MANAGER', status: 'PENDING' }]
        : [{ role: 'DEPARTMENT_MANAGER', status: 'PENDING' }, { role: 'FINANCE', status: 'WAITING' }, { role: 'GENERAL_MANAGER', status: 'WAITING' }]
      return stamp({ ...n, steps, since: n.day, status: cls === 'in_budget' ? 'in_budget_approval' : 'out_of_budget_approval' },
        `${ROLE.DEPARTMENT_MANAGER} onayına gönderildi. SLA ${SLA[cls].sla} iş günü, eskalasyon ${SLA[cls].esc}.`)
    }
    case 'decide': {
      const i = s.steps.findIndex((x) => x.status === 'PENDING')
      if (i < 0) return s
      const role = ROLE[s.steps[i].role]
      if (a.value === 'reject') {
        const steps = s.steps.map((x, k) => (k === i ? { ...x, status: 'REJECTED', note: a.note } : x))
        return stamp({ ...s, steps, status: 'rejected' }, `${role} reddetti: “${a.note}”`, 'risk')
      }
      if (a.value === 'revise') {
        const steps = s.steps.map((x) => (x.status === 'PENDING' ? { ...x, status: 'WAITING' } : x))
        return stamp({ ...s, steps, status: 'revision_requested' }, `${role} revizyon istedi: “${a.note}”`, 'risk')
      }
      const steps = s.steps.map((x, k) => (k === i ? { ...x, status: 'APPROVED' } : k === i + 1 ? { ...x, status: 'PENDING' } : x))
      const done = i === s.steps.length - 1
      let n = stamp({ ...s, steps, since: s.day }, `${role} onayladı.`, 'ok')
      if (done) n = stamp({ ...n, status: 'approved' }, 'Talep onaylandı ve İnsan Kaynakları\'na iletildi.', 'ok')
      return n
    }
    case 'resubmit': {
      // talep sahibi düzeltip yeniden gönderir: zincir baştan
      return reduce({ ...s, status: 'draft', steps: [] }, { type: 'submit' })
    }
    case 'tick': return { ...s, day: s.day + 1 }
    case 'open': {
      if (s.status !== 'approved') return { ...s, error: `Talep '${s.status}' durumunda; pozisyon yalnızca tüm onayları tamamlanmış (approved) talepler için açılabilir.` }
      const position = { title: 'Garson', hotel: 'Belek Premium', headcount: s.needed, qr: 'BLK-FB-GRS', channels: ['QR & Link', 'Kariyer Sayfası', 'LinkedIn'] }
      return stamp({ ...s, status: 'position_created', position, error: null }, 'Pozisyon açıldı: QR kodu ve başvuru bağlantısı üretildi.', 'ok')
    }
    case 'reset': return { ...initial }
    default: return s
  }
}

/* ── Aday kilidi (ownership) ── */
export const LOCK = { evaluation_days: 10, reset_days: 7, attention_days: 2, max_extensions: 3 }

export const lockInitial = { day: 0, expires: LOCK.evaluation_days, extensions: 0, state: 'LOCKED', events: [{ day: 0, text: 'Elif K. QR ile Garson ilanına başvurdu. Başvuru Belek Premium\'a kilitlendi (10 gün).' }], attempt: null }

export function lockReduce(s, a) {
  if (s.state !== 'LOCKED' && a.type !== 'reset') return s
  const ev = (st, text, tone) => ({ ...st, events: [...st.events, { day: st.day, text, tone }] })
  switch (a.type) {
    case 'advance': {
      let n = { ...s, day: s.day + a.days }
      const left = n.expires - n.day
      if (left <= 0) {
        return ev({ ...n, day: n.expires, state: 'RELEASED' }, 'Sahiplik süresi doldu (Belek Premium). Ortak havuza aktarıldı.', 'risk')
      }
      if (left <= LOCK.attention_days && s.expires - s.day > LOCK.attention_days) n = ev(n, `Kilit Süresi Doluyor: ${left} gün kaldı.`, 'wait')
      return n
    }
    case 'activity': return ev({ ...s, expires: s.day + LOCK.reset_days }, `${a.label} — kilit süresi yenilendi: ${LOCK.reset_days} gün.`, 'ok')
    case 'extend': {
      if (s.extensions >= LOCK.max_extensions) return ev(s, `Uzatma hakkı doldu (en çok ${LOCK.max_extensions}).`, 'risk')
      return ev({ ...s, expires: s.expires + LOCK.evaluation_days, extensions: s.extensions + 1 }, `Merkez İK uzatmayı onayladı: +${LOCK.evaluation_days} gün (${s.extensions + 1}/${LOCK.max_extensions}).`, 'ok')
    }
    case 'other_hotel': return ev({ ...s, attempt: Date.now() }, 'Tekirova Premium İK adayı kendi pozisyonuna eklemeye çalıştı: “Bu adayın başka bir otelde kilitli aktif başvurusu bulunmaktadır. Eş zamanlı süreç başlatılamaz.”', 'risk')
    case 'reset': return { ...lockInitial }
    default: return s
  }
}
