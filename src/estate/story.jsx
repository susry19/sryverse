/* EstateMatch — tek sahne, tek ilişki.
   Marka açılışı (tamamlanmış ilişki alanı) → sorun → çözüm → yedi aşamalı
   ürün hikâyesi. Tek ilerleme kaynağı (p0 ham, p hikâye) bütün durumları
   sürer: gezinme, metin, ilişki yolları, mozaik ve eşleşme kartı aynı
   sayıdan okunur. Her aşamanın tek bir baskın sorusu vardır; önceki
   aşamanın ayrıntısı gerekmediği anda sahneden çekilir. */
import { useRef, useState, useEffect, useMemo, useCallback } from 'react'
import { useTrack, kapi, yumusa, useMedia } from './scroll.js'
import { Ico, Chip } from './bits.jsx'
import { Villa } from './villa.jsx'
import Mosaic, { ASAMA, IMG_W, IMG_H } from './mosaic.jsx'
import Hero, { KRITER, SIGNAL } from './hero.jsx'

const sm = (p, a, b) => yumusa(kapi(p, a, b))
const mix = (a, b, t) => a + (b - a) * t
const rnd = s => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x) }
export const MARKA = .17 /* ilk %17: marka açılışı, sorun ve çözüm */
let WF = .015
const win = (p, a, b, f = WF) => f <= 0 ? (p > a && p < b ? 1 : 0) : sm(p, a, a + f) * (1 - sm(p, b - f, b))

/* ── tek doğruluk kaynağı: yedi anlatı aşaması ── */
export const ASAMALAR = [
  { n: '01', t: 'İhtiyaç', s: 'Müşteri ne söyledi?', a: 0, b: .36, git: .30 },
  { n: '02', t: 'Bağlam', s: 'Danışman ne fark etti?', a: .36, b: .48, git: .425 },
  { n: '03', t: 'Portföy', s: 'Binlerce portföy nasıl daralıyor?', a: .48, b: .645, git: .59 },
  { n: '04', t: 'Eşleşme', s: 'Neden bu portföy?', a: .645, b: .762, git: .715 },
  { n: '05', t: 'Karşılaştırma', s: 'Alternatifler arasındaki fark ne?', a: .762, b: .845, git: .80 },
  { n: '06', t: 'Süreç', s: 'Eşleşmeden sonra ne oluyor?', a: .845, b: .932, git: .885 },
  { n: '07', t: 'Sonuç', s: 'Danışman ve yönetici ne görüyor?', a: .932, b: 1, git: .975 },
]
const asamaNo = p => { for (let i = ASAMALAR.length - 1; i >= 0; i--) if (p >= ASAMALAR[i].a) return i; return 0 }

/* Sahne düzeni: yüzde koordinatlar (x: genişlik, y: yükseklik) */
const LAY = {
  desk: { txt: [4.5, 12, 27], cust: [7.5, 43], sent: [12.5, 33, 18], sigX: 33, sigY: [28, 39, 50, 61], hub: [47, 44.5], card: [51.5, 21, 45.5], uni: [52, 8, 99, 94], durak: [[62, 78], [76, 78], [90, 78]] },
  lap: { txt: [4, 11, 24], cust: [6.5, 41], sent: [10, 31, 19], sigX: 31, sigY: [28, 39, 50, 61], hub: [47.5, 44.5], card: [54, 21, 44], uni: [54, 8, 99, 94], durak: [[63, 79], [77, 79], [91, 79]] },
  tab: { txt: [4, 10, 23], cust: [9, 42], sent: [7.5, 32, 20], sigX: 30, sigY: [28, 39, 50, 61], hub: [47, 44.5], card: [53, 21, 45], uni: [53, 8, 99, 94], durak: [[62, 79], [76, 79], [90, 79]] },
  mob: { txt: [5, 7, 90], cust: [30, 26], sent: [4, 23, 92], sigX: 14, sigY: [70, 76, 82, 88], hub: [76, 79], card: [4, 24, 92], uni: [4, 46, 96, 96], durak: null },
}
const MUSTERI = 'Aylin Hanım'
const IHTIYAC = 'Döşemealtı’nda, müstakil havuzlu, en az 4+1 ve 25 milyon TL bütçeye uygun bir villa arıyorum.'
const NOT = 'Mahremiyet önemli. Şehir merkezine ulaşım tamamen kopmamalı.'
const BAGLAM = 'Bağlam; müşterinin söylediği kriterlerle, danışmanın görüşmede fark ettiği önceliklerin birlikte değerlendirilmesidir.'
const SAYIM = [['12.480', 'toplam portföy'], ['642', 'temel kriterlere uygun'], ['38', 'ayrıntılı değerlendirme'], ['4', 'güçlü eşleşme']]
const ETIKET = ['4+1 · 310 m²', 'Döşemealtı', '#EM-3104', 'havuzlu', '5+1 · 340 m²', 'Yeniköy']
const FOTO = ['macka', 'fulya', 'nisantasi']
const NEDEN = [
  ['leaf', 'Tam bağımsız bahçe ve özel havuz', 'Parsel içinde başka yapı yok.'],
  ['shield', 'Mahremiyet ile erişim arasında güçlü denge', 'Ağaçlı sınır, ana aks yakın.'],
  ['chart', 'Bütçe içinde yüksek alan/değer uyumu', '310 m², bütçenin altında.'],
]

/* ── portföy evreni: aşama 03’te kurulan, 04’te çekilen kayıtlar ── */
const DIZI = ['photo', 'txt', 'plan', 'photo', 'txt', 'dot', 'plan', 'txt', 'photo', 'plan', 'dot']
const DIZI_M = ['photo', 'txt', 'plan', 'photo', 'txt', 'plan', 'dot']
function buildRecords(mobile) {
  const R = []; const add = o => R.push({ ...o, id: R.length })
  const say = { photo: 0, plan: 0, txt: 0, dot: 0 }
  ;(mobile ? DIZI_M : DIZI).forEach(tip => {
    const i = say[tip]++
    if (tip === 'photo') add({ kind: 'photo', f: FOTO[i], s: [.12 + rnd(i + 3) * .7, .1 + rnd(i + 13) * .7], c: [.18 + rnd(i + 23) * .6, .16 + rnd(i + 33) * .6], w: mobile ? 44 : 66, out: 2 })
    else if (tip === 'plan') add({ kind: 'plan', v: i, s: [.06 + rnd(i + 1) * .86, .06 + rnd(i + 11) * .86], c: [.12 + rnd(i + 21) * .74, .1 + rnd(i + 31) * .78], w: mobile ? 34 : 48, out: i % 2 ? 1 : 3 })
    else if (tip === 'txt') add({ kind: 'txt', t: ETIKET[i], s: [.05 + rnd(i + 41) * .88, .05 + rnd(i + 51) * .88], c: [.1 + rnd(i + 61) * .78, .08 + rnd(i + 71) * .82], out: i % 3 === 0 ? 1 : (i % 3 === 1 ? 2 : 3) })
    else add({ kind: 'dot', s: [rnd(i + 81), rnd(i + 91)], c: [rnd(i + 101), rnd(i + 111)], out: 1 })
  })
  /* iki alternatif: portföy aşamasında yarışır, karşılaştırmada satıra iner */
  add({ kind: 'aday', k: 'yenikoy', slot: 0, s: [.30, .18], c: [.34, .22], w: mobile ? 56 : 84, out: 0 })
  add({ kind: 'aday', k: 'duzlercami', slot: 1, s: [.72, .74], c: [.68, .78], w: mobile ? 56 : 84, out: 0 })
  const N = R.length
  R.forEach((r, i) => { r.tIn = (mobile ? .47 : .43) + ((i * 7) % N) / N * (mobile ? .06 : .09) })
  return R
}
function recPos(r, p, mobile) {
  const en = sm(p, r.tIn, r.tIn + .05)
  const k = sm(p, .50, .58)
  let u = mix(r.s[0], r.c[0], k), v = mix(r.s[1], r.c[1], k)
  let o = en
  const dis = t => { u = mix(u, u > .5 ? 1.16 : -.02, t); v = mix(v, v > .5 ? 1.12 : -.12, t * .6); o = mix(o, .06, t) }
  if (r.out === 1) dis(sm(p, mobile ? .58 : .525, mobile ? .61 : .555))
  if (r.out === 2) dis(sm(p, mobile ? .60 : .555, mobile ? .63 : .59))
  if (r.out === 3) dis(sm(p, mobile ? .62 : .60, mobile ? .65 : .635))
  return { u, v, o }
}

const kubik = (a, b, bend = .5) => `M${a[0].toFixed(1)} ${a[1].toFixed(1)} C${mix(a[0], b[0], bend).toFixed(1)} ${a[1].toFixed(1)}, ${mix(a[0], b[0], 1 - bend).toFixed(1)} ${b[1].toFixed(1)}, ${b[0].toFixed(1)} ${b[1].toFixed(1)}`

function Say({ on, children, cls = '' }) {
  return <div className={`st-say ${cls}`} style={{ opacity: on, transform: `translateY(${(1 - on) * 10}px)`, pointerEvents: on > .5 ? 'auto' : 'none' }} aria-hidden={on < .5}>{children}</div>
}

export default function Story({ onDemo, onFeatures }) {
  const trackRef = useRef(null), stRef = useRef(null), mozRef = useRef(null)
  const dar = useMedia('(max-width: 767px)'), mobile = useMedia('(max-width: 1023px)'), tablet = useMedia('(max-width: 1279px)'), laptop = useMedia('(max-width: 1439px)'), rm = useMedia('(prefers-reduced-motion: reduce)')
  const L = mobile ? LAY.mob : tablet ? LAY.tab : laptop ? LAY.lap : LAY.desk
  WF = rm ? 0 : .015
  const REC = useMemo(() => buildRecords(mobile), [mobile])
  const [p0, setP] = useState(0)
  const [size, setSize] = useState({ w: 1280, h: 720 })
  const [manual, setManual] = useState(null)
  const [nav, setNav] = useState(false)
  const p = kapi(p0, MARKA, 1)
  const b = kapi(p0, 0, MARKA) /* marka bölümünün kendi ilerlemesi */
  useTrack(trackRef, v => { const q = rm ? Math.round(v * 96) / 96 : Math.round(v * 1000) / 1000; setP(x => x === q ? x : q) })
  useEffect(() => { const el = stRef.current; if (!el) return; const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight })); ro.observe(el); return () => ro.disconnect() }, [])
  const { w, h } = size
  const X = x => x / 100 * w, Y = y => y / 100 * h
  const px = ([x, y]) => [X(x), Y(y)]

  const goTo = useCallback(frac => {
    const el = trackRef.current; if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY
    window.scrollTo({ top: top + frac * (el.offsetHeight - window.innerHeight), behavior: rm ? 'auto' : 'smooth' })
  }, [rm])
  const goStory = useCallback(f => goTo(MARKA + f * (1 - MARKA)), [goTo])

  /* ── vuruş değerleri ── */
  const custIn = sm(p, .02, .075)
  const talep = sm(p, .10, .16)
  const notVis = sm(p, .30, .34)
  const uniFade = 1 - sm(p, mobile ? .62 : .645, mobile ? .68 : .70) * .88
  const countStage = p < .50 ? -1 : p < .525 ? 0 : p < .565 ? 1 : p < .61 ? 2 : 3
  const kart = sm(p, mobile ? .66 : .655, mobile ? .71 : .70)
  const b6 = sm(p, .768, .80), b8 = sm(p, .945, .975)
  const swap = manual === 'oncelik' ? 1 : manual === 'reset' ? 0 : sm(p, .805, .828)
  const step7 = p < .945 ? Math.min(5, Math.max(0, Math.floor((p - .848) / .0162))) : -1
  const asama = asamaNo(p)
  /* önceki aşamanın ayrıntısı gerekmediğinde çekilir, yerini kompakt özet alır */
  const leftFade = 1 - sm(p, mobile ? .44 : .60, mobile ? .49 : .68)
  const sigFade = 1 - sm(p, mobile ? .44 : .78, mobile ? .49 : .83)
  const ozet = sm(p, mobile ? .82 : .80, mobile ? .86 : .845) * (1 - sm(p, .965, .99))

  /* ── mozaik: aşama 01–04 boyunca kademeli açılır ── */
  const mozPay = p < ASAMALAR[0].b ? mix(0, ASAMA[0], sm(p, .17, ASAMALAR[0].b))
    : p < ASAMALAR[1].b ? mix(ASAMA[0], ASAMA[1], sm(p, ASAMALAR[1].a, ASAMALAR[1].b))
      : p < ASAMALAR[2].b ? mix(ASAMA[1], ASAMA[2], sm(p, ASAMALAR[2].a, ASAMALAR[2].b))
        : mix(ASAMA[2], 1, sm(p, ASAMALAR[3].a, .715))
  useEffect(() => { mozRef.current?.ayarla(mozPay) }, [mozPay])

  /* ── anahtar noktalar (px) ── */
  const icoR = mobile ? 16 : 20
  const sigOut = X(L.sigX) + (mobile ? 108 : tablet ? 148 : 166)
  const cust = px(L.cust)
  const sig = L.sigY.map(y => [X(L.sigX), Y(y)])
  const hub = px(L.hub)
  const cardX = X(L.card[0]), cardW = X(L.card[2])
  const cardY = Y(L.card[1] + (mobile ? 15.5 * sm(p, .82, .86) + 6 * sm(p, .90, .945) : 0)) /* mobilde özet çipi belirince kart aşağı kayar */
  const gorselW = mobile ? Math.round(cardW * .62) : Math.round(cardW * .575)
  const gorselH = Math.round(gorselW * IMG_H / IMG_W)
  const uni = { x0: X(L.uni[0]), y0: Y(L.uni[1]), x1: X(L.uni[2]), y1: Y(L.uni[3]) }
  const uPt = ({ u, v }) => [uni.x0 + u * (uni.x1 - uni.x0), uni.y0 + v * (uni.y1 - uni.y0)]
  const sentA = mobile ? [X(50), Y(L.sent[1]) + 208] : [X(L.sent[0] + L.sent[2]), Y(L.sent[1]) + 74]

  /* ── kayıt geometrisi ── */
  const kartVar = sm(p, mobile ? .64 : .12, mobile ? .69 : .22)
  const recs = REC.map(r => {
    const q = recPos(r, p, mobile); let [cx, cy] = uPt(q)
    let rw = r.w || 0, rh = r.w ? r.w * .74 : 0, o = q.o * uniFade
    if (r.kind === 'aday') {
      const hedefRow = r.k === 'yenikoy' ? mix(0, 1, swap) : mix(1, 0, swap)
      const ty = cardY + gorselH + 96 + hedefRow * 46
      const tw = 40, th = 30
      cx = mix(cx, cardX + 14 + tw / 2, b6); cy = mix(cy, ty + th / 2, b6); rw = mix(rw, tw, b6); rh = mix(rh, th, b6)
      o = mix(o * (1 - sm(p, .66, .72)), .99, b6) * (1 - sm(p, .84, .852))
    } else {
      /* kayıtlar mozaik dikdörtgeninin üstüne binmez: sürekli kare-radyal itme */
      const mx = cardX + 14 + gorselW / 2, my = cardY + 14 + gorselH / 2
      const iw = r.kind === 'txt' ? r.t.length * 7 + 18 : rw, ih = r.kind === 'txt' ? 26 : rh
      const hw = gorselW / 2 + 30 + iw / 2, hh = gorselH / 2 + 24 + ih / 2
      const dx = (cx - mx) / hw, dy = (cy - my) / hh
      const d = Math.max(Math.abs(dx), Math.abs(dy))
      if (d < 1) {
        const sx = d < 1e-3 ? (r.id % 2 ? 1 : -1) : dx / d, sy = d < 1e-3 ? 0 : dy / d
        cx = mix(cx, mx + sx * hw, kartVar); cy = mix(cy, my + sy * hh, kartVar)
      }
    }
    return { r, cx, cy, rw, rh, o }
  })

  /* ── ilişki mimarisi: dört şerit → tek yorum düğümü → tek ana hat ── */
  const P = []
  const hubIn = i => [hub[0] - 26, hub[1] + (i - 1.5) * 17]
  const hubOut = [hub[0] + 26, hub[1]]
  const hubVis = sm(p, mobile ? .40 : .405, mobile ? .445 : .45) * (1 - sm(p, mobile ? .44 : .78, mobile ? .49 : .83))
  if (!mobile) {
    P.push({ d: kubik([cust[0] + 34, cust[1]], [X(L.sent[0]) - 6, Y(L.sent[1]) + 34], .5), t: sm(p, .10, .14), o: sm(p, .10, .125) * leftFade, w: 1.1 })
    sig.forEach((s, i) => P.push({ d: kubik(sentA, [s[0] - icoR - 4, s[1]], .45), t: sm(p, .325 + i * .012, .385 + i * .012), o: sm(p, .325, .35) * Math.min(leftFade, sigFade), w: 1.1 }))
    sig.forEach((s, i) => P.push({ d: kubik([sigOut, s[1]], hubIn(i), .5), t: sm(p, .405 + i * .012, .465 + i * .012), o: hubVis, w: 1.3, strong: true }))
  } else {
    sig.forEach((s, i) => P.push({ d: kubik([sigOut, s[1]], [hub[0] - 30, hub[1] + (i - 1.5) * 12], .5), t: sm(p, .40 + i * .01, .445 + i * .01), o: hubVis, w: 1.2, strong: true }))
  }
  P.push({ d: kubik(hubOut, [cardX + 12, cardY + 14 + gorselH / 2], .45), t: sm(p, .58, .66), o: sm(p, .56, .60) * (1 - sm(p, .78, .83)), w: 1.6, strong: true })
  recs.filter(e => e.r.kind === 'aday').forEach((e, i) => P.push({ d: kubik(hubOut, [e.cx, e.cy], .5), t: sm(p, .555 + i * .02, .63), o: e.o * .55 * (1 - sm(p, .70, .76)), w: .9, dash: true }))
  const durakSon = 1 - sm(p, .952, .972)
  if (L.durak) {
    const pts = L.durak.map(px); const from = [cardX + cardW / 2, cardY + 400]
    P.push({ d: kubik(from, pts[0], .25), t: sm(p, .855, .885), o: sm(p, .855, .87) * durakSon, w: 1.2 })
    P.push({ d: `M${pts[0][0]} ${pts[0][1]} L${pts[1][0]} ${pts[1][1]}`, t: sm(p, .885, .912), o: sm(p, .875, .885) * durakSon, w: 1.2 })
    P.push({ d: `M${pts[1][0]} ${pts[1][1]} L${pts[2][0]} ${pts[2][1]}`, t: sm(p, .912, .94), o: sm(p, .905, .912) * durakSon, w: 1.2 })
  }
  const rayX = dar ? 10 : Math.min(72, Math.max(48, w * .05)) - 26
  P.push({ d: `M${rayX} ${Y(46)} L${rayX} ${Y(100)}`, t: sm(p, .952, 1), o: sm(p, .95, .968), w: 1.4, strong: true })

  const STEP7 = [
    { k: 'not', t: 'Danışman notu', b: <div className="mp-note"><p>Aylin Hanım Altınkale’yi öncelikli görmek istiyor; Yeniköy alternatif olarak paylaşılacak.</p><small>Selin Kaya · bugün 09:41</small></div> },
    { k: 'pay', t: 'WhatsApp ile paylaşım', b: <div className="mp-share"><div className="mp-bubble"><p>Merhaba Aylin Hanım, konuştuğumuz önceliklere göre öne çıkan iki villayı ve nedenlerini gönderiyorum.</p><ul><li><span>Altınkale</span><b>%92</b></li><li><span>Yeniköy</span><b>%87</b></li></ul></div><div className="mp-chan"><button type="button" className="is-on" aria-pressed="true"><Ico n="check" size={13} />WhatsApp</button><button type="button" aria-pressed="false">E-posta</button></div></div> },
    { k: 'rnd', t: 'Gösterim randevusu', b: <div className="mp-kv"><div><span>Randevu</span><b>Cumartesi 11:00 · Altınkale</b></div><div><span>Katılan</span><b>Aylin Hanım · Selin Kaya</b></div><div><span>Hatırlatma</span><b>1 saat önce</b></div></div> },
    { k: 'gor', t: 'Takip görevi', b: <div className="mp-kv"><div><span>Görev</span><b>Gösterim sonrası geri bildirim al</b></div><div><span>Ne zaman</span><b>Pazartesi · otomatik hatırlatma</b></div><div><span>Durum</span><Chip k="warn">Bekliyor</Chip></div></div> },
    { k: 'gec', t: 'Müşteri geçmişi', b: <ol className="mp-tl"><li className="d">İhtiyaç kaydedildi · 12 Ağu</li><li className="d">4 sinyal, 12.480 portföy değerlendirildi</li><li className="d">WhatsApp ile 2 seçenek paylaşıldı · 13 Ağu</li><li className="n">Gösterim · Cumartesi 11:00</li><li>Takip görevi · Pazartesi</li></ol> },
    { k: 'rap', t: 'Operasyon görünümü', b: <div className="mp-rep"><div className="mp-metrics"><div><b>148</b><span>Aktif müşteri</span></div><div><b>42</b><span>Planlı gösterim</span></div><div><b>17</b><span>Bekleyen takip</span></div></div><div className="mp-bars">{[['İhtiyaç', 1], ['Öneri', .65], ['Gösterim', .28], ['Teklif', .12]].map(([l, v]) => <div key={l}><span>{l}</span><i style={{ '--v': v }} /></div>)}</div><small>Temsili demo verisi</small></div> },
  ]
  const ADAY = [{ k: 'altinkale', t: 'Altınkale', row: 0, sel: true, pct: 92, v: [2, 2, 1, 2], not: '4+1 · 310 m² · özel havuz' },
  { k: 'yenikoy', t: 'Yeniköy', row: mix(1, 2, swap), pct: Math.round(mix(87, 85, swap)), v: [1, 2, 2, 2], not: 'Daha geniş plan; çevre yoğun.' },
  { k: 'duzlercami', t: 'Düzlerçamı', row: mix(2, 1, swap), pct: Math.round(mix(84, 88, swap)), v: [2, 2, 1, 1], not: 'Mahremiyet güçlü; erişim uzun.' }]

  return (
    <div className={`st-track${rm ? ' is-rm' : ''}`} ref={trackRef} style={{ height: mobile ? '940svh' : '1120svh' }}>
      {[['baslangic', 0], ['hikaye', MARKA], ...ASAMALAR.map((s, i) => [`asama-${i + 1}`, MARKA + s.git * (1 - MARKA)])].map(([id, f]) => <div key={id} id={id} className="st-anchor" style={{ top: `calc(${f * 100}% - ${f} * 100svh)` }} aria-hidden="true" />)}
      <div className="st" data-asama={asama}><div className="st-in" ref={stRef}>

        {/* ── ilk ekran: tamamlanmış ilişki alanı ── */}
        <div className="st-hero" style={{ opacity: 1 - sm(b, .92, 1), pointerEvents: b < .94 ? 'auto' : 'none', visibility: b >= .995 ? 'hidden' : 'visible' }} aria-hidden={b >= .94}>
          <Hero b={b} mobile={mobile} onStory={() => goStory(ASAMALAR[0].git)} onDemo={onDemo} />
        </div>

        {/* ── ifade alanı: her aşamanın tek baskın sorusu ── */}
        <div className="st-txt" style={{ left: `${L.txt[0]}%`, top: `${L.txt[1]}%`, width: `${L.txt[2]}%` }}>
          {ASAMALAR.map((s, i) => (
            <Say key={s.n} on={i === 6 ? sm(p, .932, .955) : win(p, s.a, s.b)}>
              <p className="st-q"><span aria-hidden="true">{s.n}</span>{s.s}</p>
              <p className="st-sub">{[
                'Müşterinin kendi cümlesi ve beş açık kriteri, ilişkinin başlangıç noktasıdır.',
                <><b>Bağlam</b> nedir? {BAGLAM}</>,
                'Konum, bütçe ve oda sayısı elemenin yalnızca ilk adımıdır; sonrasında mahremiyet, erişim ve değer dengesi birlikte değerlendirilir.',
                'Hangi portföyün öne çıktığı kadar, neden öne çıktığı ve hangi farkın değerlendirilmesi gerektiği de görünür.',
                'Danışman öncelikleri düzenler, sıralama buna göre değişir. EstateMatch kararı destekler; nihai kararı danışman verir.',
                'Paylaşım, randevu, görev ve müşteri geçmişi aynı müşteri ilişkisi üzerinde ilerler.',
                'Yöneticiler müşteri aşamalarını, portföy hareketlerini ve bekleyen takipleri tek yerden izler.',
              ][i]}</p>
              {i === 6 && <div className="st-cta"><a href="/estatematch/features" className="em-link" onClick={e => { e.preventDefault(); onFeatures?.() }}>Tüm özellikleri inceleyin</a></div>}
            </Say>))}
        </div>

        {/* ── ilişki yolları ── */}
        <svg className="st-paths" width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
          {P.map((q, i) => <path key={i} d={q.d} pathLength="1" strokeDasharray={q.dash ? '.014 .012' : '1'} strokeDashoffset={q.dash ? 0 : 1 - q.t} style={{ opacity: q.dash ? q.o * q.t : q.o }} className={q.strong ? 'is-strong' : ''} strokeWidth={q.w} />)}
        </svg>

        {/* ── müşteri ve talep ── */}
        <div className="st-cust" style={{ left: cust[0], top: cust[1], opacity: custIn * leftFade, transform: `translate(-50%,-50%) scale(${mix(.4, 1, custIn)})` }} aria-hidden={custIn < .5 || leftFade < .5}>
          <div className="st-cust__node" aria-hidden="true">A</div>
          <div className="st-cust__lbl"><b>{MUSTERI}</b><span>Müşteri · 12 Ağu</span></div>
        </div>
        <div className="st-sent" style={{ left: `${L.sent[0]}%`, top: `${L.sent[1]}%`, width: `${L.sent[2]}%`, opacity: talep * leftFade }} aria-hidden={talep < .5 || leftFade < .5}>
          <p className="st-sent__who" aria-hidden="true"><span className="st-sent__av">A</span><b>{MUSTERI}</b><span>Müşteri · 12 Ağu</span></p>
          <blockquote><p>“{IHTIYAC}”</p></blockquote>
          <div className="st-kriter"><span className="st-tag">Müşterinin söylediği</span>{KRITER.map(k => <span key={k}>{k}</span>)}</div>
          <p className="st-not" style={{ opacity: notVis }}><span className="st-tag">Danışmanın eklediği</span>{NOT}</p>
        </div>

        {/* ── kompakt müşteri özeti: süreç aşamasından itibaren ── */}
        <div className="st-ozet" style={{ left: `${L.sent[0]}%`, top: `${mobile ? 32 : L.sent[1]}%`, opacity: ozet }} aria-hidden={ozet < .5}>
          <span className="st-ozet__n" aria-hidden="true">A</span>
          <span className="st-ozet__t"><b>{MUSTERI}</b><small>Döşemealtı · Villa · Öncelik: Mahremiyet</small></span>
        </div>

        {/* ── dört sinyal ── */}
        <span className="st-tag st-tag--sig" style={{ left: X(L.sigX) - icoR, top: sig[0][1] - icoR - 20, opacity: sm(p, mobile ? .365 : .335, mobile ? .405 : .375) * sigFade }} aria-hidden="true">EstateMatch’in yorumladığı</span>
        {SIGNAL.map(([t, ico], i) => {
          const on = sm(p, (mobile ? .335 : .345) + i * .014, (mobile ? .375 : .385) + i * .014)
          return <div key={t} className={`st-sig${countStage >= 0 ? ' is-hot' : ''}`} style={{ left: sig[i][0], top: sig[i][1], opacity: on * sigFade, transform: `translate(${-icoR}px,-50%) translateX(${(1 - on) * -10}px)` }} aria-hidden={on < .5 || sigFade < .5}><span className="st-sig__ico"><Ico n={ico} /></span><span className="st-sig__t">{t}</span></div>
        })}

        <div className="st-hub" style={{ left: hub[0], top: hub[1], opacity: hubVis }} aria-hidden={hubVis < .5}>
          <span className="st-hub__ring" /><b>Bağlam</b><small>tek yorum</small>
        </div>

        {/* ── portföy evreni: sayılar adlarıyla birlikte ── */}
        <ol className="st-count" style={{ left: uni.x0, width: uni.x1 - uni.x0, top: Y(mobile ? 30 : 6), opacity: win(p, mobile ? .50 : .49, mobile ? .69 : .67, .02) }}>
          {SAYIM.map(([n, l], i) => <li key={n} className={i === Math.max(0, countStage) ? 'is-on' : i < countStage ? 'is-past' : ''}><b>{n}</b><span>{l}</span></li>)}
        </ol>
        {recs.map(({ r, cx, cy, rw, rh, o }) => {
          if (o < .012) return null
          const st = { left: cx, top: cy, opacity: o }
          if (r.kind === 'dot') return <i key={r.id} className="st-dot" style={st} />
          if (r.kind === 'txt') return <span key={r.id} className="st-rec" style={st} aria-hidden="true">{r.t}</span>
          if (r.kind === 'plan') return <span key={r.id} className="st-plan" style={{ ...st, width: rw, height: rw * .86 }} aria-hidden="true"><PlanMini v={r.v} /></span>
          if (r.kind === 'photo') return <figure key={r.id} className="st-photo" style={{ ...st, width: rw, height: rh }}><img src={`/screens/property-${r.f}-640.webp`} alt="" width="640" height="480" loading="lazy" decoding="async" /></figure>
          return <figure key={r.id} className="st-photo st-photo--aday" style={{ ...st, width: rw, height: rh }} aria-hidden="true"><Villa k={r.k} /></figure>
        })}

        {/* ── eşleşme kartı ── */}
        <div className="st-card" style={{ left: cardX, top: cardY, width: cardW, '--kart': kart, '--gw': `${gorselW}px`, '--gh': `${gorselH}px`, opacity: kartVar }} aria-hidden={p < (mobile ? .66 : .18)}>
          <div className="st-card__sol">
            <div className="st-card__moz" style={{ width: gorselW, height: gorselH }}>
              <Mosaic ref={mozRef} mobil={mobile} />
              <span className="st-card__bul" style={{ opacity: win(p, .672, .95, .02) }}><Ico n="check" size={14} />Eşleşme bulundu</span>
            </div>
            <p className="st-card__kunye" style={{ opacity: kart }}>Portföy #EM-3104 · Selin Kaya · Aktif</p>
            {(!mobile || p >= .745) && <p className="mp-trade" style={{ opacity: sm(p, mobile ? .75 : .716, mobile ? .775 : .734) }}><span className="mp-lbl">Dengelediği konu</span>Ana ulaşım aksına yaklaşık 8 dakika mesafede.</p>}
          </div>
          <div className="st-card__yan" style={{ opacity: kart }} aria-hidden={kart < .5}>
            <div className={`mp-body${p < .768 ? '' : ' is-abs'}`} style={{ opacity: win(p, .655, .768, .02), pointerEvents: p < .768 ? 'auto' : 'none' }}>
              <h3 className="mp-title">Döşemealtı · Altınkale</h3>
              <p className="mp-oz">Müstakil villa · 4+1 · 310 m²<br />Özel havuz · <b>₺23.750.000</b></p>
              <p className="mp-pct"><em>%92</em> anlamlı uyum</p>
              <ul className="mp-sum"><li><Ico n="check" size={13} />4 güçlü ilişki</li><li className="is-warn"><Ico n="road" size={13} />1 değerlendirilmesi gereken fark</li></ul>
              <ul className="mp-why">
                {NEDEN.map(([ico, t, d], i) => <li key={t} style={{ opacity: sm(p, .676 + i * .012, .690 + i * .012) }}><span className="mp-ico"><Ico n={ico} size={14} /></span><div><b>{t}</b><small>{d}</small></div></li>)}
              </ul>
            </div>
            <div className={`mp-body mp-cmp${p >= .768 && p < .852 ? '' : ' is-abs'}`} style={{ opacity: win(p, .768, .852, .015), pointerEvents: p >= .768 && p < .852 ? 'auto' : 'none' }}>
              <div className="mp-cmp__h"><span>Seçenek</span>{SIGNAL.map(([t, ico]) => <span key={t} title={t}><Ico n={ico} size={13} /></span>)}<span>Uyum</span></div>
              {ADAY.map(a => (
                <div key={a.k} className={`mp-row${a.sel ? ' is-sel' : ''}`} style={{ transform: `translateY(${a.row * 46}px)` }}>
                  <span className="mp-row__t">{a.sel && <Ico n="check" size={12} />}<span><b>{a.t}</b><small>{a.not}</small></span></span>
                  {a.v.map((d, i) => <span key={i} className={`mp-dot mp-dot--${d}`} aria-label={`${SIGNAL[i][0]}: ${['zayıf', 'orta', 'güçlü'][d]}`} />)}
                  <span className="mp-row__pct">%{a.pct}</span>
                </div>))}
              <div className="mp-adj" style={{ marginTop: 3 * 46 + 8 }}>
                <span>Danışman önceliği</span>
                <button type="button" className={`mp-toggle${swap > .5 ? ' is-on' : ''}`} aria-pressed={swap > .5} onClick={() => setManual(swap > .5 ? 'reset' : 'oncelik')}><i /><span>Mahremiyet öncelikli</span></button>
              </div>
            </div>
            <div className={`mp-body mp-rel${p >= .852 ? '' : ' is-abs'}`} style={{ opacity: sm(p, .85, .862), pointerEvents: p >= .852 ? 'auto' : 'none' }}>
              <div className="mp-id"><b>Altınkale · 4+1</b><span>{MUSTERI} · Selin Kaya</span></div>
              <div className="mp-steps">
                {STEP7.map((s, i) => <div key={s.k} className="mp-step" style={{ opacity: i === step7 ? 1 : 0, position: i === step7 ? 'relative' : 'absolute' }} aria-hidden={i !== step7}><p className="mp-lbl">{s.t}</p>{s.b}</div>)}
                <div className="mp-step" style={{ opacity: b8, position: p >= .945 ? 'relative' : 'absolute' }} aria-hidden={p < .95}>
                  <p className="mp-lbl">Danışman ve yönetici görünümü</p>
                  <div className="mp-kv"><div><span>Müşteri durumu</span><b>Gösterim planlandı</b></div><div><span>Eşleşme</span><b>Altınkale · %92</b></div><div><span>Son işlem</span><b>WhatsApp · 13 Ağu</b></div><div><span>Sonraki adım</span><b>Gösterim · Cumartesi</b></div><div><span>Bekleyen takip</span><b>1 görev · Pazartesi</b></div></div>
                </div>
              </div>
              <div className="mp-prog" aria-hidden="true">{STEP7.map((s, i) => <i key={s.k} className={step7 < 0 || i <= step7 ? 'is-on' : ''} />)}</div>
            </div>
          </div>
        </div>

        {/* ── süreç durakları ── */}
        {L.durak && [['share', 'Paylaş'], ['clock', 'Randevu'], ['flag', 'Takip']].map(([ico, t], i) => {
          const pt = px(L.durak[i]); const on = sm(p, [.875, .905, .93][i], [.89, .918, .942][i]) * (1 - sm(p, .96, .98))
          return <div key={t} className="st-stop" style={{ left: pt[0], top: pt[1], opacity: on }} aria-hidden={on < .5}><span className="st-stop__ico"><Ico n={ico} size={16} /></span><b>{t}</b></div>
        })}

        {/* ── aşama gezgini ── */}
        <nav className={`st-nav${nav ? ' is-open' : ''}`} aria-label="Hikâye aşamaları" style={{ opacity: sm(b, .90, 1), pointerEvents: b < .94 ? 'none' : 'auto', visibility: b < .90 ? 'hidden' : 'visible' }}>
          <button type="button" className="st-nav__now" aria-expanded={nav} aria-controls="st-nav-list" onClick={() => setNav(v => !v)}>
            <b>{ASAMALAR[asama].n}</b><span className="st-nav__sep">/ 07</span><em>{ASAMALAR[asama].t}</em>
          </button>
          <ol className="st-nav__list" id="st-nav-list">
            {ASAMALAR.map((s, i) => (
              <li key={s.n} className={i === asama ? 'is-on' : i < asama ? 'is-past' : ''}>
                <button type="button" aria-current={i === asama ? 'step' : undefined} onClick={() => { setNav(false); goStory(s.git) }}>
                  <span className="st-nav__n">{s.n}</span><span className="st-nav__t">{s.t}</span>
                </button>
              </li>))}
          </ol>
          <span className="st-nav__bar" aria-hidden="true"><i style={{ transform: `scaleY(${(asama + 1) / 7})` }} /></span>
        </nav>
      </div></div>
    </div>)
}

/* küçük kat planı parçası */
const PLANLAR = ['M3 3h30v22H3zM3 13h13M16 3v22M22 13h11', 'M3 3h30v22H3zM19 3v10M3 13h16M19 13h14M11 13v12', 'M3 3h30v22H3zM3 9h30M15 9v16M24 9v16', 'M3 3h30v22H3zM12 3v14M12 17h21M24 17v8']
function PlanMini({ v = 0 }) {
  return <svg viewBox="0 0 36 28" aria-hidden="true"><path d={PLANLAR[v % PLANLAR.length]} fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" /></svg>
}
