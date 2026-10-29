/* Aday alanı: şeritten doğan parçacıklar.

   Her parçacık bir aday profilidir. Formasyonlar ürünün eşleştirme
   mantığını sırayla anlatır (süs değil):
     ribbon   — marka şeridinin merkez çizgisi (sonsuzluk işareti)
     pool     — bir sezonun başvuru havuzu, kanallardan gelen dağınık akış
     families — SkillMatch'in 15 rol ailesi (skill_match_service.ROLE_FAMILIES)
     gate     — bir ilan: aile uyan yaklaşır, uymayan kapı dışında kalır
     match    — adlı adaylar gerçek skorlarıyla (rule-2) ilana uzaklık alır,
                öneri eşiğini (%50) geçenler iple bağlanır
   Konumlar kaydırma ilerlemesinin saf fonksiyonudur: ileri/geri aynı kare. */

import { centerline2D, VW, VH } from './ribbon.js'

// Rol aileleri: ad ve ürün etiketi birebir skill_match_service.ROLE_FAMILIES.
// Pay: otel operasyonunda yaklaşık kadro dağılımı (yalnız görsel yoğunluk).
export const FAMILIES = [
  ['service', 'Servis (F&B)', 22], ['housekeeping', 'Kat Hizmetleri', 18], ['kitchen', 'Mutfak', 15],
  ['frontoffice', 'Ön Büro', 11], ['bar', 'Bar', 7], ['technical', 'Teknik Servis', 6],
  ['animation', 'Animasyon', 5], ['spa', 'Spa & Wellness', 4], ['security', 'Güvenlik', 3],
  ['garden', 'Bahçe & Peyzaj', 2], ['sales', 'Satış & Pazarlama', 2], ['purchasing', 'Satın Alma & Depo', 2],
  ['finance', 'Finans & Muhasebe', 1], ['hr', 'İnsan Kaynakları', 1], ['it', 'Bilgi Teknolojileri', 1],
]

function rng(seed) {
  let s = seed >>> 0
  return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}
const clamp01 = (x) => Math.min(1, Math.max(0, x))
const smooth = (x) => { x = clamp01(x); return x * x * (3 - 2 * x) }
const mix = (a, b, t) => a + (b - a) * t

export const STEPS = ['ribbon', 'pool', 'families', 'gate', 'match']

export function createField(canvas, { count, named }) {
  const ctx = canvas.getContext('2d')
  const R = rng(20261029)
  const ribbon = centerline2D(count)
  const total = FAMILIES.reduce((s, f) => s + f[2], 0)
  const famOf = []
  let acc = 0
  FAMILIES.forEach(([key], fi) => {
    acc += FAMILIES[fi][2]
    while (famOf.length < Math.round(count * acc / total)) famOf.push(fi)
  })
  while (famOf.length < count) famOf.push(0)
  // ailelere karıştırılmış sırayla dağıt: şeritte komşu iki parçacık aynı aileden olmasın
  for (let i = famOf.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1));[famOf[i], famOf[j]] = [famOf[j], famOf[i]] }

  const P = []
  for (let i = 0; i < count; i++) {
    P.push({
      fam: famOf[i], rb: ribbon[i], jx: (R() - 0.5), jy: (R() - 0.5),
      px: R(), py: R(), ang: R() * Math.PI * 2, rad: Math.sqrt(R()), sp: 0.4 + R() * 0.8,
      size: 0.8 + R() * 1.3, named: null,
    })
  }
  // Adlı adaylar: Servis ailesinden parçacıklara bağlanır (Garson ilanının gerçek skorları)
  const svc = P.filter((p) => p.fam === 0)
  named.forEach((n, k) => { if (svc[k * 3]) svc[k * 3].named = n })

  let W = 1, H = 1, dpr = 1
  function resize() {
    const r = canvas.getBoundingClientRect()
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    W = Math.max(1, r.width); H = Math.max(1, r.height)
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr)
  }

  // Aile kümeleri: metnin karşısında bir elips üzerinde, en büyük aile tepede
  const compact = () => W < 760
  function famCenter(fi) {
    const n = FAMILIES.length
    const a = -Math.PI / 2 + (fi / n) * Math.PI * 2
    const cx = compact() ? W * 0.5 : W * 0.7, cy = compact() ? H * 0.34 : H * 0.52
    const rx = compact() ? W * 0.36 : W * 0.22, ry = compact() ? H * 0.2 : H * 0.32
    return { x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry }
  }
  const gateAt = () => ({ x: compact() ? W * 0.5 : W * 0.7, y: H * (compact() ? 0.34 : 0.54), r: Math.min(W, H) * (compact() ? 0.12 : 0.1) })

  function target(p, step, frame, t) {
    switch (step) {
      case 'ribbon': {
        const k = frame.w / VW
        return { x: frame.x + p.rb.x * k + p.jx * 6, y: frame.y + p.rb.y * k + p.jy * 6, a: 0.9 }
      }
      case 'pool': {
        const drift = Math.sin(t * 0.0003 * p.sp + p.ang) * 10
        return { x: W * (0.06 + p.px * 0.88) + drift, y: H * (compact() ? 0.1 + p.py * 0.5 : 0.16 + p.py * 0.74) + Math.cos(t * 0.00025 * p.sp + p.ang) * 8, a: 0.7 }
      }
      case 'families': {
        const c = famCenter(p.fam), share = FAMILIES[p.fam][2]
        const r = (8 + Math.sqrt(share) * 8) * p.rad * (compact() ? 0.6 : 1)
        return { x: c.x + Math.cos(p.ang + t * 0.00012 * p.sp) * r, y: c.y + Math.sin(p.ang + t * 0.00012 * p.sp) * r, a: 0.85 }
      }
      case 'gate': {
        const g = gateAt()
        if (p.fam === 0) {
          const r = g.r * (1.7 + p.rad * 1.6)
          return { x: g.x + Math.cos(p.ang) * r * 1.25, y: g.y + Math.sin(p.ang) * r * 0.85, a: 0.95 }
        }
        const c = famCenter(p.fam)
        return { x: mix(c.x, W * (p.px < 0.5 ? 0.08 : 0.3), 0.35) + p.jx * 30, y: c.y + p.jy * 30, a: 0.18 }
      }
      case 'match': {
        const g = gateAt()
        if (p.named) {
          const s = p.named.score, d = g.r * (1.15 + (100 - s) / 100 * 3.2)
          const a = -Math.PI * 0.95 + (p.named.rank / Math.max(1, named.length - 1)) * Math.PI * 1.9
          return { x: g.x + Math.cos(a) * d * 1.2, y: g.y + Math.sin(a) * d * 0.9, a: p.named.ok ? 1 : 0.45 }
        }
        if (p.fam === 0) {
          const r = g.r * (3.4 + p.rad * 1.2)
          return { x: g.x + Math.cos(p.ang) * r * 1.2, y: g.y + Math.sin(p.ang) * r * 0.85, a: 0.22 }
        }
        const c = famCenter(p.fam)
        return { x: mix(c.x, W * 0.12, 0.45) + p.jx * 30, y: c.y + p.jy * 30, a: 0.08 }
      }
      default: return { x: W * p.px, y: H * p.py, a: 0.3 }
    }
  }

  const pos = P.map(() => ({ x: 0, y: 0, a: 0 }))

  function draw(progress, frame, now, theme) {
    const n = STEPS.length - 1
    const seg = Math.min(n - 1, Math.floor(progress * n))
    const local = smooth(progress * n - seg)
    const A = STEPS[seg], Bk = STEPS[seg + 1]
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)
    const ink = theme.ink
    // her parçacık için gecikmeli geçiş: dalga gibi kopar (indekse bağlı, sabit)
    for (let i = 0; i < P.length; i++) {
      const p = P[i]
      const lag = (p.rb.t * 0.35)
      const lt = smooth((local - lag * (1 - local)) / (1 - lag * 0.5))
      const a = target(p, A, frame, now), b = target(p, Bk, frame, now)
      pos[i].x = mix(a.x, b.x, lt); pos[i].y = mix(a.y, b.y, lt); pos[i].a = mix(a.a, b.a, lt)
    }
    // gate/match: ilan düğümü ve eşik çemberi
    const gateVis = Bk === 'gate' ? local : (A === 'gate' || A === 'match') ? 1 : 0
    const matchVis = Bk === 'match' ? local : 0
    const g = gateAt()
    if (gateVis > 0.01) {
      ctx.globalAlpha = gateVis
      ctx.strokeStyle = theme.line; ctx.lineWidth = 1; ctx.setLineDash([3, 5])
      ctx.beginPath(); ctx.ellipse(g.x, g.y, g.r * (1.15 + 0.5 * 3.2) * 1.2, g.r * (1.15 + 0.5 * 3.2) * 0.9, 0, 0, Math.PI * 2); ctx.stroke()
      ctx.setLineDash([])
    }
    // eşleşme ipleri (öneri eşiğini geçen adlı adaylar)
    if (matchVis > 0.01) {
      for (let i = 0; i < P.length; i++) {
        const p = P[i]
        if (!p.named || !p.named.ok) continue
        const q = pos[i]
        const grd = ctx.createLinearGradient(q.x, q.y, g.x, g.y)
        grd.addColorStop(0, theme.thread0); grd.addColorStop(1, theme.thread1)
        ctx.globalAlpha = matchVis * (0.35 + 0.65 * p.named.score / 100)
        ctx.strokeStyle = grd; ctx.lineWidth = 0.6 + 1.6 * p.named.score / 100
        const mx = (q.x + g.x) / 2, my = (q.y + g.y) / 2 - 24
        ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.quadraticCurveTo(mx, my, g.x, g.y); ctx.stroke()
      }
    }
    // parçacıklar
    ctx.fillStyle = ink
    for (let i = 0; i < P.length; i++) {
      const p = P[i], q = pos[i]
      ctx.globalAlpha = q.a * (p.named ? 1 : 0.85)
      const s = p.named ? p.size + 1.6 + 1.6 * matchVis : p.size
      ctx.beginPath(); ctx.arc(q.x, q.y, s, 0, Math.PI * 2); ctx.fill()
    }
    // aile etiketleri
    const famVis = Bk === 'families' ? local : A === 'families' ? 1 - local : 0
    if (famVis > 0.02) {
      ctx.globalAlpha = famVis * 0.9
      ctx.fillStyle = theme.label
      ctx.font = `500 ${compact() ? 10 : 11}px Inter, system-ui, sans-serif`
      ctx.textAlign = 'center'
      FAMILIES.forEach((f, fi) => {
        if (compact() && f[2] < 4) return
        const c = famCenter(fi), share = f[2]
        ctx.fillText(f[1], c.x, c.y + (8 + Math.sqrt(share) * 8) * (compact() ? 0.6 : 1) + 15)
      })
    }
    // ilan düğümü
    if (gateVis > 0.01) {
      ctx.globalAlpha = gateVis
      ctx.fillStyle = theme.node
      ctx.beginPath(); ctx.arc(g.x, g.y, g.r * 0.55, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = theme.ink; ctx.lineWidth = 1.2
      ctx.beginPath(); ctx.arc(g.x, g.y, g.r * 0.55 + 6, 0, Math.PI * 2); ctx.stroke()
      ctx.fillStyle = theme.nodeInk; ctx.textAlign = 'center'
      ctx.font = `600 ${compact() ? 12 : 14}px Inter, system-ui, sans-serif`
      ctx.fillText('Garson', g.x, g.y - 2)
      ctx.font = `400 ${compact() ? 10 : 11}px Inter, system-ui, sans-serif`
      ctx.fillText('Belek Premium', g.x, g.y + 14)
    }
    // adlı aday etiketleri
    if (matchVis > 0.05) {
      ctx.font = `500 ${compact() ? 10 : 11}px Inter, system-ui, sans-serif`
      for (let i = 0; i < P.length; i++) {
        const p = P[i]
        if (!p.named || (compact() && p.named.rank > 3) || p.named.rank > 6) continue
        const q = pos[i]
        ctx.globalAlpha = matchVis * (p.named.ok ? 1 : 0.6)
        ctx.fillStyle = theme.label
        ctx.textAlign = q.x < g.x ? 'right' : 'left'
        const dx = q.x < g.x ? -10 : 10
        ctx.fillText(`${p.named.name} · %${p.named.score}`, q.x + dx, q.y + 4)
      }
    }
    ctx.globalAlpha = 1
  }

  resize()
  return { draw, resize }
}
