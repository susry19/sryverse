import { useEffect, useReducer, useRef, useState } from 'react'
import { ROWS, rowStatus, classify, budgetText, OPENERS, ROLE, REASONS, STATUS, SLA, chainPath, initial, reduce, LOCK, lockInitial, lockReduce, FTE } from '../lib/ops.js'
import { useJourney } from '../lib/journey.js'
import { useCompact } from '../lib/scroll.js'

/* İhtiyaç → Onay → İlan ve kilit. Solda anlatı, sağda yapışkan "konsol":
   konsol ürünün ekran dilini kullanır ve ziyaretçi her adımda karar verir.
   Kurallar lib/ops.js'te (SkillMatch kaynak referanslarıyla). */

const CHAPTERS = [
  { id: 'ihtiyac', n: '01', kicker: 'Kadro planlama', h: 'Açık kadro, tahminle değil hesapla bulunur.',
    p: 'Onaylı bütçe, işe alınmış kişi ve onay yolundaki talepler aynı satırda. Net açık kendiliğinden çıkar; talep açmaya gerek olup olmadığını satır söyler.',
    tip: 'Talebi kimin açtığını ve kaç kişi istendiğini değiştirin: sınıflandırma ve onay yolu anında değişir.' },
  { id: 'onay', n: '02', kicker: 'Onay zinciri', h: 'Bütçe dışına çıkan talep, kendi yolunu çizer.',
    p: 'Bütçe içi talep yalnız Departman Müdürü onayından geçer. Bütçeyi aşan talep gerekçe ister ve Financial Controller ile Genel Müdür\'e kadar çıkar. Kimse kendi talebini onaylayamaz; red açıklamasız olmaz.',
    tip: 'Onaylayın, revizyon isteyin ya da reddedin. Süreyi ilerletip SLA ve eskalasyonu görün.' },
  { id: 'ilan', n: '03', kicker: 'İlan ve aday kilidi', h: 'Aday iki otel arasında bölünmez.',
    p: 'Onaylanan talepten pozisyon açılır; QR ve bağlantı aynı anda üretilir. İlk başvuran otele 10 günlük sahiplik kilidi düşer. Mülakat, arama, teklif gibi her etkinlik kilidi yeniler; süre dolarsa aday ortak havuza döner.',
    tip: 'Günleri ilerletin, etkinlik ekleyin, başka bir otelin adayı almaya çalışmasını izleyin.' },
]

function Badge({ tone = 'demo', children }) { return <span className={`sx-badge sx-badge--${tone}`}>{children}</span> }

function Path({ nodes, active }) {
  return (
    <ol className="op-path" aria-label="Onay yolu">
      {nodes.map((n, i) => (
        <li key={n + i} className={active != null && i <= active ? 'on' : ''} style={{ '--i': i }}>
          <span>{n}</span>{i < nodes.length - 1 && <i aria-hidden="true">›</i>}
        </li>
      ))}
    </ol>
  )
}

/* ── A: Kadro planlama ── */
function Headcount({ s, dispatch }) {
  const row = ROWS[0]
  const cls = classify(row, s.needed)
  const editable = s.status === 'draft' || s.status === 'revision_requested'
  const extra = s.status === 'draft' ? 0 : ['in_budget_approval', 'out_of_budget_approval', 'approved', 'revision_requested'].includes(s.status) ? s.needed : 0
  return (
    <div className="op-card">
      <div className="op-card__hd">
        <div><b>Kadro Planlama</b><span>Belek Premium › Yiyecek ve İçecek · Ekim 2026</span></div>
        <Badge tone="demo">Sentetik veri</Badge>
      </div>
      <div className="op-table" role="table" aria-label="Kadro satırları">
        <div className="op-tr op-th" role="row"><span role="columnheader">Pozisyon</span><span role="columnheader">Plan</span><span role="columnheader">Mevcut</span><span role="columnheader">Talepte</span><span role="columnheader">Durum</span></div>
        {ROWS.map((r, i) => {
          const st = rowStatus(r, i === 0 ? extra : 0)
          return (
            <div key={r.title} className={`op-tr${i === 0 ? ' is-sel' : ''}`} role="row">
              <span role="cell"><b>{r.title}</b></span>
              <span role="cell">{r.has_budget ? FTE(r.planned) : '—'}</span>
              <span role="cell">{r.current}</span>
              <span role="cell">{FTE(st.in_progress)}</span>
              <span role="cell"><Badge tone={st.tone}>{st.label}</Badge></span>
            </div>
          )
        })}
      </div>
      <div className="op-form">
        <div className="op-field">
          <label id="op-opener">Talebi açan</label>
          <div className="op-seg" role="radiogroup" aria-labelledby="op-opener">
            {OPENERS.map((o) => (
              <button key={o.key} role="radio" aria-checked={s.opener === o.key} disabled={!editable}
                className={s.opener === o.key ? 'on' : ''} onClick={() => dispatch({ type: 'opener', value: o.key })}>{o.label}</button>
            ))}
          </div>
        </div>
        <div className="op-field">
          <label id="op-need">Garson · istenen kişi</label>
          <div className="op-step" aria-labelledby="op-need">
            <button onClick={() => dispatch({ type: 'needed', value: s.needed - 1 })} disabled={!editable || s.needed <= 1} aria-label="Azalt">−</button>
            <output aria-live="polite">{s.needed}</output>
            <button onClick={() => dispatch({ type: 'needed', value: s.needed + 1 })} disabled={!editable || s.needed >= 6} aria-label="Artır">+</button>
          </div>
        </div>
      </div>
      <div className={`op-class op-class--${cls}`} aria-live="polite">
        <div className="op-class__top">
          <Badge tone={cls === 'in_budget' ? 'ok' : 'wait'}>{cls === 'in_budget' ? 'Bütçe içi' : 'Bütçe dışı'}</Badge>
          <Path nodes={chainPath(s.opener, cls)} />
        </div>
        <p className="op-mono">{budgetText(row, s.needed)}</p>
        {cls === 'out_of_budget' && s.opener !== 'DEPARTMENT_MANAGER' && editable && (
          <div className="op-field op-field--row">
            <label htmlFor="op-reason">Bütçe dışı gerekçe</label>
            <select id="op-reason" value={s.reason} onChange={(e) => dispatch({ type: 'reason', value: e.target.value })}>
              <option value="">Gerekçe seçin…</option>
              {REASONS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </div>
        )}
        {s.opener === 'DEPARTMENT_MANAGER' && <p className="op-hint">Departman Müdürü'nün kendi talebi onay zincirine girmez; doğrudan İK'ya iletilir.</p>}
      </div>
      {s.error && <p className="op-err" role="alert">{s.error}</p>}
      <div className="op-actions">
        {s.status === 'draft' && <button className="sx-btn sx-btn--ink sx-btn--sm" onClick={() => dispatch({ type: 'submit' })}>Onaya gönder</button>}
        {s.status === 'revision_requested' && <button className="sx-btn sx-btn--ink sx-btn--sm" onClick={() => dispatch({ type: 'resubmit' })}>Düzelt ve yeniden gönder</button>}
        {s.status !== 'draft' && <Badge tone={STATUS[s.status][1]}>{STATUS[s.status][0]}</Badge>}
      </div>
    </div>
  )
}

const NOTES = { revise: 'Vardiya dağılımını netleştirip yeniden gönderin.', reject: 'Bu sezon için bütçe revize edilmeden ek kadro açılmayacak.' }

/* ── B: Onay merkezi ── */
function Approvals({ s, dispatch }) {
  if (s.status === 'draft') {
    return (
      <div className="op-card op-card--empty">
        <p>Henüz gönderilmiş talep yok.</p>
        <button className="sx-btn sx-btn--ink sx-btn--sm" onClick={() => dispatch({ type: 'submit' })}>Varsayılan talebi gönder (2 kişi)</button>
      </div>
    )
  }
  const cls = s.cls
  const pendingIdx = s.steps.findIndex((x) => x.status === 'PENDING')
  const pending = s.steps[pendingIdx]
  const sla = cls ? SLA[cls] : null
  const waited = s.day - (s.since || 0)
  const slaState = !sla || !pending ? null : waited >= sla.esc ? ['Eskale edildi', 'risk'] : waited >= sla.sla ? ['SLA aşıldı', 'wait'] : ['Süresinde', 'ok']
  const nodes = [{ k: 'req', l: 'Talep', st: 'APPROVED', who: OPENERS.find((o) => o.key === s.opener).label },
    ...s.steps.map((x) => ({ k: x.role, l: ROLE[x.role], st: x.status, note: x.note })),
    { k: 'hr', l: 'İnsan Kaynakları', st: ['approved', 'position_created'].includes(s.status) ? 'APPROVED' : 'WAITING' },
    { k: 'pos', l: 'Pozisyon', st: s.status === 'position_created' ? 'APPROVED' : 'WAITING' }]
  return (
    <div className="op-card">
      <div className="op-card__hd">
        <div><b>Onay Merkezi</b><span>Garson · {s.needed} kişi · Belek Premium</span></div>
        <Badge tone={STATUS[s.status][1]}>{STATUS[s.status][0]}</Badge>
      </div>
      <ol className="op-chain">
        {nodes.map((n) => (
          <li key={n.k} className={`op-node op-node--${n.st.toLowerCase()}`}>
            <span className="op-node__dot" aria-hidden="true">{n.st === 'APPROVED' ? '✓' : n.st === 'REJECTED' ? '×' : ''}</span>
            <span className="op-node__l">{n.l}</span>
            <span className="op-node__s">{n.who || { APPROVED: 'Onayladı', PENDING: 'Karar bekliyor', WAITING: 'Sırada', REJECTED: 'Reddetti' }[n.st]}</span>
          </li>
        ))}
      </ol>
      {pending && (
        <div className="op-decide">
          <div className="op-decide__who">
            <span className="sx-note">Karar sırası</span>
            <b>{ROLE[pending.role]}</b>
            {slaState && <Badge tone={slaState[1]}>{slaState[0]} · {waited}/{sla.sla} iş günü</Badge>}
          </div>
          <div className="op-decide__act">
            <button className="sx-btn sx-btn--ink sx-btn--sm" onClick={() => dispatch({ type: 'decide', value: 'approve' })}>Onayla</button>
            <button className="sx-btn sx-btn--ghost sx-btn--sm" onClick={() => dispatch({ type: 'decide', value: 'revise', note: NOTES.revise })}>Revizyon iste</button>
            <button className="sx-btn sx-btn--ghost sx-btn--sm" onClick={() => dispatch({ type: 'decide', value: 'reject', note: NOTES.reject })}>Reddet</button>
            <button className="sx-chip" onClick={() => dispatch({ type: 'tick' })}>+1 iş günü</button>
          </div>
          <p className="sx-note">Red ve revizyon açıklamasız yapılamaz; burada örnek not kullanılır. Talebi açan kişi kendi talebini onaylayamaz.</p>
        </div>
      )}
      {s.status === 'approved' && (
        <div className="op-decide">
          <div className="op-decide__who"><span className="sx-note">Sıradaki adım</span><b>İK pozisyonu açar</b></div>
          <button className="sx-btn sx-btn--ink sx-btn--sm" onClick={() => dispatch({ type: 'open' })}>Pozisyonu aç</button>
        </div>
      )}
      {s.status === 'rejected' && <div className="op-decide"><button className="sx-btn sx-btn--ghost sx-btn--sm" onClick={() => dispatch({ type: 'reset' })}>Yeni talep oluştur</button></div>}
      {s.status === 'revision_requested' && <p className="op-hint">Talep sahibine döndü. Kişi sayısını değiştirip “Düzelt ve yeniden gönder” ile zinciri baştan başlatabilirsiniz.</p>}
      <ol className="op-log" aria-label="Talep geçmişi">
        {s.log.slice().reverse().map((l, i) => <li key={s.log.length - i} className={`t-${l.tone}`}><span>{l.day}. gün</span>{l.text}</li>)}
      </ol>
    </div>
  )
}

/* ── C: İlan ve kilit ── */
function QR({ seed = 7 }) {
  // Temsilî desen: tarayıcıda okutulabilir bir QR değildir.
  const cells = []
  let x = seed
  for (let i = 0; i < 21 * 21; i++) { x = (x * 1103515245 + 12345) & 0x7fffffff; cells.push((x >> 16) & 1) }
  const finder = (r, c) => (r < 7 && c < 7) || (r < 7 && c > 13) || (r > 13 && c < 7)
  return (
    <svg viewBox="0 0 21 21" className="op-qr" role="img" aria-label="Temsilî QR deseni">
      {cells.map((v, i) => {
        const r = Math.floor(i / 21), c = i % 21
        if (finder(r, c)) {
          const rr = r > 13 ? r - 14 : r, cc = c > 13 ? c - 14 : c
          const on = rr === 0 || rr === 6 || cc === 0 || cc === 6 || (rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4)
          return on ? <rect key={i} x={c} y={r} width="1" height="1" /> : null
        }
        return v ? <rect key={i} x={c} y={r} width="1" height="1" /> : null
      })}
    </svg>
  )
}

function Listing({ s, dispatch }) {
  const [lock, ld] = useReducer(lockReduce, lockInitial)
  if (s.status !== 'position_created') {
    return (
      <div className="op-card op-card--empty">
        <p>Pozisyon henüz açılmadı. Talep onaylanınca İK pozisyonu açar.</p>
        <button className="sx-btn sx-btn--ink sx-btn--sm" onClick={() => dispatch({ type: 'fast' })}>Hızlı tamamla: gönder, onayla, aç</button>
      </div>
    )
  }
  const span = Math.max(24, lock.expires + 4)
  const left = lock.expires - lock.day
  return (
    <div className="op-card">
      <div className="op-card__hd">
        <div><b>Pozisyonlar ve İlanlar</b><span>{s.position.title} · {s.position.hotel} · {s.position.headcount} kişi</span></div>
        <Badge tone="ok">İlan Yayında</Badge>
      </div>
      <div className="op-listing">
        <QR />
        <div>
          <p className="op-mono">skillmatch.sryverse.com/portal/job/{s.position.qr.toLowerCase()}</p>
          <div className="op-chips">{s.position.channels.map((c) => <span key={c} className="sx-badge">{c}</span>)}</div>
          <p className="sx-note">QR temsilîdir. Kapı başvurusu, QR ve kariyer sayfasından gelen başvurular aynı pozisyona düşer.</p>
        </div>
      </div>
      <div className="op-lock">
        <div className="op-lock__hd">
          <div><span className="sx-note">Aday kilidi</span><b>Elif K. → Belek Premium</b></div>
          <Badge tone={lock.state === 'LOCKED' ? (left <= LOCK.attention_days ? 'wait' : 'info') : 'risk'}>
            {lock.state === 'LOCKED' ? `Kilitli · ${left} gün kaldı` : 'Ortak havuzda'}
          </Badge>
        </div>
        <div className="op-time" aria-hidden="true">
          <div className="op-time__bar">
            <i className="op-time__lock" style={{ left: 0, width: `${(Math.min(lock.expires, span) / span) * 100}%` }} />
            <i className="op-time__warn" style={{ left: `${((lock.expires - LOCK.attention_days) / span) * 100}%`, width: `${(LOCK.attention_days / span) * 100}%` }} />
            <b className="op-time__now" style={{ left: `${(lock.day / span) * 100}%` }} />
          </div>
          <div className="op-time__ticks"><span>0</span><span>{Math.round(span / 2)}. gün</span><span>{span}. gün</span></div>
        </div>
        <div className="op-lock__act">
          <button className="sx-chip" disabled={lock.state !== 'LOCKED'} onClick={() => ld({ type: 'advance', days: 1 })}>+1 gün</button>
          <button className="sx-chip" disabled={lock.state !== 'LOCKED'} onClick={() => ld({ type: 'advance', days: 3 })}>+3 gün</button>
          <button className="sx-chip" disabled={lock.state !== 'LOCKED'} onClick={() => ld({ type: 'activity', label: 'Mülakat planlandı' })}>Mülakat planla</button>
          <button className="sx-chip" disabled={lock.state !== 'LOCKED'} onClick={() => ld({ type: 'extend' })}>Uzatma iste</button>
          <button className="sx-chip" disabled={lock.state !== 'LOCKED'} onClick={() => ld({ type: 'other_hotel' })}>Başka otel eklesin</button>
          <button className="sx-chip" onClick={() => ld({ type: 'reset' })}>Sıfırla</button>
        </div>
        <ol className="op-log op-log--short" aria-live="polite">
          {lock.events.slice().reverse().slice(0, 4).map((l, i) => <li key={lock.events.length - i} className={`t-${l.tone || 'info'}`}><span>{l.day}. gün</span>{l.text}</li>)}
        </ol>
      </div>
    </div>
  )
}

function fastReduce(s, a) {
  if (a.type !== 'fast') return reduce(s, a)
  let n = s.status === 'draft' ? reduce({ ...s, reason: s.reason || 'seasonal_peak' }, { type: 'submit' }) : s
  if (n.status === 'revision_requested') n = reduce(n, { type: 'resubmit' })
  if (n.status === 'rejected') n = reduce(reduce(initial, { type: 'reset' }), { type: 'submit' })
  let guard = 0
  while (n.steps.some((x) => x.status === 'PENDING') && guard++ < 5) n = reduce(n, { type: 'decide', value: 'approve' })
  if (n.status === 'approved') n = reduce(n, { type: 'open' })
  return n
}

export default function Operations() {
  const [s, dispatch] = useReducer(fastReduce, initial)
  const [ch, setCh] = useState(0)
  const refs = [useRef(null), useRef(null), useRef(null)]
  const compact = useCompact()
  const journey = useJourney()

  useEffect(() => {
    if (s.position && journey && !journey.opened) journey.setOpened(s.position)
  }, [s.position, journey])

  useEffect(() => {
    if (compact) return
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) setCh(+e.target.dataset.ch) })
    }, { rootMargin: '-45% 0px -45% 0px' })
    refs.forEach((r) => r.current && io.observe(r.current))
    return () => io.disconnect()
  }, [compact])

  const views = [<Headcount key="a" s={s} dispatch={dispatch} />, <Approvals key="b" s={s} dispatch={dispatch} />, <Listing key="c" s={s} dispatch={dispatch} />]

  return (
    <section className="sx-act op" data-tone="light" aria-labelledby="op-title">
      <div className="sx-wrap op__head">
        <span className="sx-eyebrow">İhtiyaç · Onay · İlan</span>
        <h2 id="op-title" className="sx-h2">Bir kadro açığı, <em>kuralları olan</em> bir yolculuktur.</h2>
        <p className="sx-lead">Bu konsol SkillMatch'in kadro, bütçe, onay ve kilit kurallarını birebir uygular. Kararları siz verin; sonuç kurallardan çıksın.</p>
      </div>
      <div className="sx-wrap op__grid">
        <div className="op__story">
          {CHAPTERS.map((c, i) => (
            <article key={c.id} id={c.id} data-act={c.id} data-ch={i} ref={refs[i]} className={`op-ch${ch === i ? ' is-on' : ''}`}>
              <span className="op-ch__n">{c.n}</span>
              <span className="sx-eyebrow">{c.kicker}</span>
              <h3 className="op-ch__h">{c.h}</h3>
              <p className="op-ch__p">{c.p}</p>
              <p className="op-ch__tip"><span aria-hidden="true">→</span> {c.tip}</p>
              {compact && <div className="op-ch__view">{views[i]}</div>}
            </article>
          ))}
        </div>
        {!compact && (
          <div className="op__console" aria-live="off">
            <div className="op__tabs" role="tablist" aria-label="Konsol görünümü">
              {CHAPTERS.map((c, i) => (
                <button key={c.id} role="tab" aria-selected={ch === i} className={ch === i ? 'on' : ''}
                  onClick={() => document.getElementById(c.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>{c.kicker}</button>
              ))}
            </div>
            <div className="op__stage">
              {views.map((v, i) => <div key={i} className={`op__view${ch === i ? ' is-on' : ''}`} aria-hidden={ch !== i} inert={ch !== i ? '' : undefined}>{v}</div>)}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
