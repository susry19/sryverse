/* Aday alanı: şeritten doğan noktalar, her biri bir aday profili.

   Formasyonlar ürünün eşleştirme mantığını sırayla anlatır (süs değil):
     ribbon   — şerit tek başına; noktalar onun merkez çizgisinde görünmez bekler
     pool     — bir sezonun havuzu: başvuru kanallarından akan noktalar
                yavaş dönen tek bir havuzda toplanır
     families — SkillMatch'in 15 rol ailesi (skill_match_service.ROLE_FAMILIES),
                her aile bir nokta satırı (birim grafik)
     gate     — bir ilan: aynı aileden adaylar öneri eşiğinde bekler,
                diğer aileler kapı dışında söner
     match    — Garson ilanının 20 adayı gerçek skorlarıyla (rule-2) hedefte:
                merkeze uzaklık = 100 − skor; eşiği geçenler iple bağlanır
   Konumlar kaydırma ilerlemesinin saf fonksiyonudur: ileri/geri aynı kare.
   Çizim dili: tek boy ince nokta, ince halka, mono etiket; rastgele boy,
   parıltı ya da yıldız tozu yok. */

import { centerline2D, VW } from './ribbon.js'

// Rol aileleri: ad ve ürün etiketi birebir skill_match_service.ROLE_FAMILIES.
// Pay: otel operasyonunda yaklaşık kadro dağılımı (yalnız görsel yoğunluk).
export const FAMILIES = [
  ['service', 'Servis (F&B)', 22], ['housekeeping', 'Kat Hizmetleri', 18], ['kitchen', 'Mutfak', 15],
  ['frontoffice', 'Ön Büro', 11], ['bar', 'Bar', 7], ['technical', 'Teknik Servis', 6],
  ['animation', 'Animasyon', 5], ['spa', 'Spa & Wellness', 4], ['security', 'Güvenlik', 3],
  ['garden', 'Bahçe & Peyzaj', 2], ['sales', 'Satış & Pazarlama', 2], ['purchasing', 'Satın Alma & Depo', 2],
  ['finance', 'Finans & Muhasebe', 1], ['hr', 'İnsan Kaynakları', 1], ['it', 'Bilgi Teknolojileri', 1],
]

// Açılış metnindeki başvuru kanalları (ürünün aday kaynakları)
const CHANNELS = ['Kariyer sitesi', 'Kapı başvurusu', 'QR kod', 'Referans', 'Toplu CV']

function rng(seed) {
  let s = seed >>> 0
  return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}
const clamp01 = (x) => Math.min(1, Math.max(0, x))
const smooth = (x) => { x = clamp01(x); return x * x * (3 - 2 * x) }
const mix = (a, b, t) => a + (b - a) * t
const GOLD = Math.PI * (3 - Math.sqrt(5))
const MONO = '"DM Mono", ui-monospace, monospace'
const UI = 'Inter, system-ui, sans-serif'

export const STEPS = ['ribbon', 'pool', 'families', 'gate', 'match']

export function createField(canvas, { count, named }) {
  const ctx = canvas.getContext('2d')
  const R = rng(20261029)
  const ribbon = centerline2D(count)
  const total = FAMILIES.reduce((s, f) => s + f[2], 0)

  // aile ataması (paylara göre), sonra şeritte karışık dursun diye karıştır
  const famOf = []
  let acc = 0
  FAMILIES.forEach((f) => { acc += f[2]; while (famOf.length < Math.round(count * acc / total)) famOf.push(FAMILIES.indexOf(f)) })
  while (famOf.length < count) famOf.push(0)
  for (let i = famOf.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1));[famOf[i], famOf[j]] = [famOf[j], famOf[i]] }

  const P = []
  const famCount = FAMILIES.map(() => 0)
  let poolK = 0
  for (let i = 0; i < count; i++) {
    const chan = R() < 0.2 ? Math.floor(R() * CHANNELS.length) : -1
    P.push({ fam: famOf[i], fi: famCount[famOf[i]]++, rb: ribbon[i], u: R(), v: R(), chan, pk: chan < 0 ? poolK++ : 0, named: null })
  }
  const poolN = Math.max(1, poolK)
  // Garson ilanının 20 adayı Servis ailesindeki noktalara bağlanır
  const svc = P.filter((p) => p.fam === 0)
  named.forEach((n, k) => { if (svc[k]) svc[k].named = n })
  const svcN = svc.length

  let W = 1, H = 1, dpr = 1, L = null
  function layout() {
    const c = W < 760
    const cx = c ? W * 0.5 : W * 0.72, cy = c ? H * 0.3 : H * 0.5
    const Rp = c ? Math.min(W * 0.3, H * 0.17) : Math.min(W * 0.14, H * 0.25)
    // aile satırları: nokta ızgarası (satır başına `rows` nokta yüksekliği)
    const rows = c ? 2 : 3, gap = c ? 4.4 : 6.6, pitch = rows * gap + (c ? 9 : 12)
    const blockH = FAMILIES.length * pitch
    const top = c ? Math.max(72, H * 0.27 - blockH / 2) : cy - blockH / 2
    const rowX = c ? W * 0.42 : W * 0.6
    // hedef: merkez düğüm + skor halkaları
    const node = c ? 30 : 44
    const rMax = c ? Math.min(W * 0.42, H * 0.22) : Math.min(W * 0.2, H * 0.36)
    const rOf = (s) => node + 10 + (100 - s) / 100 * (rMax - node - 10)
    // kanalların geldiği yönler (metnin karşı tarafı)
    const chanA = c ? [-2.6, -2.0, -1.4, -0.8, -0.2] : [-1.25, -0.6, 0.05, 0.7, 1.35]
    return { c, cx, cy, Rp, rows, gap, pitch, top, rowX, node, rMax, rOf, chanA }
  }
  function resize() {
    const r = canvas.getBoundingClientRect()
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    W = Math.max(1, r.width); H = Math.max(1, r.height)
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr)
    L = layout()
  }

  // adayın hedefteki açısı: eşiği geçenler sağda geniş aralıkla (etiketleri
  // çakışmasın), geri kalanlar alt ve sol yayda eşit aralıkla; tepe ölçeğe ayrılır
  const okN = named.filter((n) => n.ok).length
  const angOf = (rank) => {
    const d = Math.PI / 180
    if (rank < okN) return (-62 + rank * (124 / Math.max(1, okN - 1 || 1))) * d
    const k = rank - okN, m = Math.max(1, named.length - okN - 1)
    return (88 + k * (158 / m)) * d
  }

  function target(p, step, frame, t) {
    switch (step) {
      case 'ribbon': {
        const k = frame.w / VW
        return { x: frame.x + p.rb.x * k, y: frame.y + p.rb.y * k, a: 0 }
      }
      case 'pool': {
        if (p.chan >= 0) {
          // kanaldan akış: dışarıdan girer, havuz kıyısında çözülür
          const s = (p.u + t * 0.00006 * (0.7 + p.v * 0.6)) % 1
          const a0 = L.chanA[p.chan] + (p.v - 0.5) * 0.16 + (1 - s) * 0.22
          const r = L.Rp * (1.62 - 0.62 * s)
          const fade = Math.min(1, s / 0.18, (1 - s) / 0.12)
          return { x: L.cx + Math.cos(a0) * r, y: L.cy + Math.sin(a0) * r, a: 0.7 * fade }
        }
        // havuz: ayçiçeği dizilimi, iç halkalar biraz daha hızlı döner
        const f = (p.pk + 0.5) / poolN
        const r = L.Rp * Math.sqrt(f)
        const a = p.pk * GOLD + t * 0.00004 * (1.25 - f)
        return { x: L.cx + Math.cos(a) * r, y: L.cy + Math.sin(a) * r, a: 0.78 }
      }
      case 'families': {
        const col = Math.floor(p.fi / L.rows), row = p.fi % L.rows
        return { x: L.rowX + col * L.gap, y: L.top + p.fam * L.pitch + row * L.gap, a: 0.82 }
      }
      case 'gate': {
        if (p.fam === 0) {
          // aynı aileden adaylar öneri eşiği halkasında bekler
          const a = -Math.PI / 2 + (p.fi / svcN) * Math.PI * 2
          const r = L.rOf(50) + (p.v - 0.5) * 6
          return { x: L.cx + Math.cos(a) * r, y: L.cy + Math.sin(a) * r, a: 0.9 }
        }
        // diğer aileler kapı dışında: soluk bir dış hale
        const a = p.u * Math.PI * 2, r = L.rMax * (1.25 + p.v * 0.5)
        return { x: L.cx + Math.cos(a) * r, y: L.cy + Math.sin(a) * r, a: 0.07 }
      }
      case 'match': {
        if (p.named) {
          const a = angOf(p.named.rank), r = L.rOf(p.named.score)
          return { x: L.cx + Math.cos(a) * r, y: L.cy + Math.sin(a) * r, a: p.named.ok ? 1 : 0.5 }
        }
        const a = p.u * Math.PI * 2, r = L.rMax * (1.25 + p.v * 0.5)
        return { x: L.cx + Math.cos(a) * r, y: L.cy + Math.sin(a) * r, a: p.fam === 0 ? 0.1 : 0.05 }
      }
      default: return { x: W * p.u, y: H * p.v, a: 0.3 }
    }
  }

  const pos = P.map(() => ({ x: 0, y: 0, a: 0 }))

  function label(text, x, y, { align = 'left', font = `400 10px ${MONO}`, color, alpha = 1, spacing = '1.6px', upper = true } = {}) {
    ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.font = font; ctx.textAlign = align
    if ('letterSpacing' in ctx) ctx.letterSpacing = spacing
    const str = upper ? text.toLocaleUpperCase('tr') : text
    // ekran kenarında kesilmesin: metni tuvalin içine kaydır
    const w = ctx.measureText(str).width, m = 16
    const left = align === 'left' ? x : align === 'right' ? x - w : x - w / 2
    const shift = left < m ? m - left : left + w > W - m ? W - m - (left + w) : 0
    ctx.fillText(str, x + shift, y)
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px'
  }

  function draw(progress, frame, now, theme) {
    const n = STEPS.length - 1
    const seg = Math.min(n - 1, Math.floor(progress * n))
    const local = smooth(progress * n - seg)
    const A = STEPS[seg], Bk = STEPS[seg + 1]
    const vis = (s) => (Bk === s ? local : A === s ? 1 - local : 0)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)
    ctx.lineCap = 'round'

    for (let i = 0; i < P.length; i++) {
      const p = P[i]
      // dalga gibi geçiş: her nokta kendi gecikmesiyle (sabit, indekse bağlı)
      const lag = p.u * 0.4
      const lt = smooth((local - lag) / (1 - lag))
      const a = target(p, A, frame, now), b = target(p, Bk, frame, now)
      pos[i].x = mix(a.x, b.x, lt); pos[i].y = mix(a.y, b.y, lt); pos[i].a = mix(a.a, b.a, lt)
    }

    const poolV = vis('pool'), famV = vis('families'), gateV = vis('gate')
    const matchV = Bk === 'match' ? local : 0
    const ringV = Math.max(gateV, matchV)

    // ── hedef halkaları (kapı + eşleşme)
    if (ringV > 0.01) {
      ctx.lineWidth = 1
      ;[100, 75, 25].forEach((s) => {
        ctx.globalAlpha = ringV * (s === 100 ? 0.5 : 0.22)
        ctx.strokeStyle = theme.ring
        ctx.beginPath(); ctx.arc(L.cx, L.cy, s === 100 ? L.rMax : L.rOf(s), 0, Math.PI * 2); ctx.stroke()
      })
      ctx.globalAlpha = ringV; ctx.strokeStyle = theme.rose; ctx.setLineDash([2, 5])
      ctx.beginPath(); ctx.arc(L.cx, L.cy, L.rOf(50), 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([])
      // ölçek: halkaların tepesinde, skor = merkeze yakınlık
      const ty = (r) => L.cy - r - 6
      label('%75', L.cx, ty(L.rOf(75)), { align: 'center', color: theme.dim, alpha: ringV })
      label('%50 · öneri eşiği', L.cx, ty(L.rOf(50)), { align: 'center', color: theme.rose, alpha: ringV })
      label('%25', L.cx, ty(L.rOf(25)), { align: 'center', color: theme.dim, alpha: ringV })
      label('%0', L.cx, ty(L.rMax), { align: 'center', color: theme.dim, alpha: ringV * 0.8 })
    }

    // ── eşleşme ipleri: eşiği geçenler merkeze bağlanır
    if (matchV > 0.01) {
      for (let i = 0; i < P.length; i++) {
        const p = P[i]
        if (!p.named || !p.named.ok) continue
        const q = pos[i]
        const grd = ctx.createLinearGradient(L.cx, L.cy, q.x, q.y)
        grd.addColorStop(0, theme.thread0); grd.addColorStop(1, theme.thread1)
        ctx.globalAlpha = matchV; ctx.strokeStyle = grd; ctx.lineWidth = 1.25
        // ip, uçtan merkeze doğru çizilir
        const k = smooth((matchV - p.named.rank * 0.08) / 0.7)
        ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.lineTo(mix(q.x, L.cx, k), mix(q.y, L.cy, k)); ctx.stroke()
      }
    }

    // ── noktalar: tek boy, ince
    const base = L.c ? 1.05 : 1.2
    ctx.fillStyle = theme.ink
    for (let i = 0; i < P.length; i++) {
      const q = pos[i]
      if (q.a < 0.01) continue
      const p = P[i]
      let r = base
      if (p.named) r = mix(base, p.named.ok ? 4 : 2.6, matchV)
      ctx.globalAlpha = q.a
      ctx.beginPath(); ctx.arc(q.x, q.y, r, 0, Math.PI * 2); ctx.fill()
    }
    // en iyi eşleşmenin halkası
    if (matchV > 0.3) {
      const i = P.findIndex((p) => p.named && p.named.rank === 0)
      if (i >= 0 && P[i].named.ok) {
        ctx.globalAlpha = (matchV - 0.3) / 0.7; ctx.strokeStyle = theme.rose; ctx.lineWidth = 1.2
        ctx.beginPath(); ctx.arc(pos[i].x, pos[i].y, 9, 0, Math.PI * 2); ctx.stroke()
      }
    }

    // ── kanal etiketleri
    if (poolV > 0.02 && !L.c) {
      L.chanA.forEach((a, c) => {
        const r = L.Rp * 1.74
        const x = L.cx + Math.cos(a) * r, y = L.cy + Math.sin(a) * r
        label(CHANNELS[c], x, y + 3, { align: Math.cos(a) > 0.3 ? 'left' : Math.cos(a) < -0.3 ? 'right' : 'center', color: theme.label, alpha: poolV * 0.85 })
      })
    }
    if (poolV > 0.02) {
      if (L.c) label(`${CHANNELS.length} kanal · ${count} profil · 1 havuz`, L.cx, L.cy + L.Rp + 28, { align: 'center', color: theme.dim, alpha: poolV })
      else label(`${count} profil · 1 havuz`, L.cx - L.Rp - 26, L.cy + 3, { align: 'right', color: theme.dim, alpha: poolV })
    }

    // ── aile etiketleri (satır başında, sağa yaslı)
    if (famV > 0.02) {
      FAMILIES.forEach((f, fi) => {
        const y = L.top + fi * L.pitch + (L.rows - 1) * L.gap / 2 + 3.5
        label(f[1], L.rowX - (L.c ? 10 : 16), y, { align: 'right', font: `400 ${L.c ? 10 : 11.5}px ${UI}`, upper: false, spacing: '0px', color: theme.label, alpha: famV * (fi === 0 ? 1 : 0.75) })
      })
      if (L.c) label('15 rol ailesi · her nokta bir aday', W / 2, L.top + FAMILIES.length * L.pitch + 12, { align: 'center', color: theme.dim, alpha: famV })
      else label('15 rol ailesi · her nokta bir aday', L.rowX, L.top - 18, { color: theme.dim, alpha: famV })
    }

    // ── ilan düğümü
    if (ringV > 0.01) {
      ctx.globalAlpha = ringV
      ctx.fillStyle = theme.node
      ctx.beginPath(); ctx.arc(L.cx, L.cy, L.node, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = theme.ring; ctx.lineWidth = 1
      ctx.beginPath(); ctx.arc(L.cx, L.cy, L.node + 6, 0, Math.PI * 2); ctx.stroke()
      ctx.fillStyle = theme.nodeInk; ctx.textAlign = 'center'
      ctx.font = `500 ${L.c ? 12 : 14}px ${UI}`
      ctx.fillText('Garson', L.cx, L.cy + (L.c ? 1 : 0))
      ctx.font = `400 ${L.c ? 9 : 10.5}px ${UI}`; ctx.fillStyle = theme.nodeSub
      ctx.fillText('Belek Premium', L.cx, L.cy + (L.c ? 13 : 15))
      if (gateV > 0.02) label(L.c ? `${svcN} Servis adayı eşikte` : `${svcN} Servis adayı eşikte · diğer aileler kapı dışında`, L.cx, L.cy + L.rMax + 30, { align: 'center', color: theme.dim, alpha: gateV })
    }

    // ── aday etiketleri: eşiği geçenler ad + skor; altındakiler sayıyla özetlenir
    if (matchV > 0.05) {
      let below = 0
      for (let i = 0; i < P.length; i++) {
        const p = P[i]
        if (!p.named) continue
        if (!p.named.ok) { below++; continue }
        const q = pos[i], right = q.x >= L.cx
        const dx = right ? 16 : -16
        ctx.globalAlpha = matchV; ctx.textAlign = right ? 'left' : 'right'
        ctx.font = `500 ${L.c ? 11 : 12.5}px ${UI}`; ctx.fillStyle = theme.label
        ctx.fillText(p.named.name, q.x + dx, q.y + 1)
        label(`%${p.named.score}`, q.x + dx, q.y + 15, { align: right ? 'left' : 'right', color: p.named.rank === 0 ? theme.rose : theme.dim, alpha: matchV })
      }
      label(`${below} aday eşik altında · gerekçesiyle`, L.cx, L.cy + L.rMax + 30, { align: 'center', color: theme.dim, alpha: matchV })
    }
    ctx.globalAlpha = 1
  }

  resize()
  return { draw, resize }
}
