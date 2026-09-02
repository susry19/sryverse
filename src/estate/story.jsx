/* EstateMatch — tek sahne, tek ilişki.
   müşteri → ihtiyaç → dört sinyal → portföy evreni → anlamlı eşleşme
   → açıklama → paylaşım → takip → rapor. Her vuruşun son hâli bir
   sonrakinin başlangıcıdır; sahne hiç boşalmaz.
   İlk kare sakindir: yalnızca kimlik, cümle, kaydırma daveti ve ilişki
   sisteminin soyut başlangıcı. Hikâye nesneleri kaydırmayla girer. */
import { useRef, useState, useEffect, useMemo } from 'react'
import { useTrack, kapi, yumusa, useMedia } from './scroll.js'
import { Plan, Ico, Btn, Chip } from './bits.jsx'
import { Villa } from './villa.jsx'

const sm = (p, a, b) => yumusa(kapi(p, a, b))
const mix = (a, b, t) => a + (b - a) * t
const rnd = s => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x) }
const b8Pre = p => yumusa(kapi(p, .94, .97))
let WF = .015
const win = (p, a, b, f = WF) => f <= 0 ? (p >= a && p < b ? 1 : 0) : sm(p, a, a + f) * (1 - sm(p, b - f, b))

/* Sahne düzeni: yüzde koordinatlar (x: genişlik, y: yükseklik) */
const LAY = {
  desk: { cust: [9, 62], sig: [[36, 37], [36, 50], [36, 63], [36, 76]], uni: [47, 12, 68, 90], match: [70, 13, 26], path: [[74, 86], [84, 86], [94, 86]], txt: [4.5, 8, 42], sent: [15.5, 44, 16] },
  tab: { cust: [8, 64], sig: [[35, 42], [35, 54], [35, 66], [35, 78]], uni: [44, 14, 67, 92], match: [69, 14, 28], path: [[72, 88], [84, 88], [95, 88]], txt: [4, 7, 46], sent: [16, 40, 19] },
  mob: { cust: [13, 31], sig: [[13, 78], [56, 78], [13, 87], [56, 87]], uni: [52, 40, 100, 97], match: [5, 27, 90], path: null, txt: [5, 2, 90], sent: [5, 39, 90] },
}
/* Müşteri: söylenen kriter, danışman notu ve sistem yorumu birbirinden ayrı tutulur */
const MUSTERI = 'Aylin Hanım'
const IHTIYAC = 'Döşemealtı’nda, müstakil havuzlu, en az 4+1 ve 25 milyon TL bütçeye uygun bir villa arıyorum.'
const KRITER = ['Döşemealtı', 'Müstakil villa', 'Özel havuz', 'En az 4+1', 'En fazla ₺25 milyon']
const NOT = 'Mahremiyet önemli. Şehir merkezine ulaşım tamamen kopmamalı.'
const SIGNAL = [['Mahremiyet', 'shield'], ['Bahçe kullanımı', 'leaf'], ['Şehir erişimi', 'road'], ['Uzun vadeli değer', 'chart']]
const TXT = ['Döşemealtı · 3+1 · 240 m²', '₺21.4 mn · havuzlu', '#EM-3104 · Çıplaklı', 'Aksu · 4+1 · 280 m²', '₺24.2 mn · 2021', 'Konyaaltı · 4+1 · 260 m²', '#EM-2977 · Kepez', 'Lara · 5+1 · 380 m²', '₺19.5 mn · 2019', 'Yeşilbayır · 3+1 · 210 m²', '#EM-3011 · Aksu', 'Döşemealtı · 5+1 · 350 m²']
const MULK = {
  altinkale: { t: 'Döşemealtı · Altınkale', oz: 'Müstakil villa · 4+1 · 310 m² · Özel havuz', fiyat: '₺23.750.000', pct: 92, v: [2, 2, 1, 2] },
  yenikoy: { t: 'Döşemealtı · Yeniköy', oz: '5+1 · 340 m² · Özel havuz', fiyat: '₺24.900.000', pct: 87, v: [1, 2, 2, 2], fark: 'Daha geniş plan; çevresel yoğunluk daha yüksek.' },
  duzlercami: { t: 'Döşemealtı · Düzlerçamı', oz: '4+1 · 295 m² · Özel havuz', fiyat: '₺22.800.000', pct: 84, v: [2, 2, 1, 1], fark: 'Mahremiyet güçlü; şehir erişimi daha uzun.' },
}
const NEDEN = [['leaf', 'Tam bağımsız bahçe ve özel havuz', 'Parsel içinde başka yapı yok.'], ['shield', 'Komşu yapılardan kontrollü görüş mesafesi', 'Ağaçlı sınır, korunaklı teras.'], ['road', 'Şehir merkezine dengeli erişim', 'Ana aks yakın, trafik yoğunluğu düşük.'], ['chart', 'Bütçe içinde güçlü alan/değer dengesi', '310 m², bütçenin altında.']]

function buildRecords(mobile) {
  const R = []; const add = o => R.push({ ...o, id: R.length })
  /* Üç farklı villa; hiçbiri tekrar etmez. Altınkale çevrede başlar: keşfedilecek olan o. */
  add({ kind: 'photo', k: 'altinkale', s: [.97, .92], c: [.97, .9], aff: [0, 1, 2, 3], out: 0, w: mobile ? 66 : 88 })
  add({ kind: 'photo', k: 'yenikoy', s: [.34, .2], c: [.58, .3], aff: [1, 2], out: 0, w: mobile ? 58 : 78, slot: 1 })
  add({ kind: 'photo', k: 'duzlercami', s: [.7, .6], c: [.66, .7], aff: [0, 3], out: 0, w: mobile ? 58 : 74, slot: 2 })
  const nPlan = mobile ? 3 : 6
  for (let i = 0; i < nPlan; i++) add({ kind: 'plan', v: i, s: [.08 + rnd(i + 1) * .84, .06 + rnd(i + 11) * .86], c: [.14 + rnd(i + 21) * .7, .1 + rnd(i + 31) * .8], aff: i % 2 ? [i % 4] : [i % 4, (i + 1) % 4], out: i === 1 ? 0 : (i % 3 === 0 ? 1 : 2), w: mobile ? 40 : 54, slot: i === 1 ? 3 : 0 })
  const nTxt = mobile ? 4 : 8
  for (let i = 0; i < nTxt; i++) add({ kind: 'txt', t: TXT[i], s: [.04 + rnd(i + 41) * .92, .04 + rnd(i + 51) * .92], c: [.1 + rnd(i + 61) * .8, .08 + rnd(i + 71) * .84], aff: i % 3 === 0 ? [] : [i % 4], out: i % 3 === 0 ? 1 : (i % 3 === 1 ? 2 : 3) })
  const nDot = mobile ? 4 : 8
  for (let i = 0; i < nDot; i++) add({ kind: 'dot', s: [rnd(i + 81), rnd(i + 91)], c: [rnd(i + 101), rnd(i + 111)], aff: [], out: 1 })
  const N = R.length
  R.forEach(r => { r.tIn = .10 + (((r.id * 7) % N) / N) * .26 }) /* evren kaydırmayla, farklı yönlerden, kademeli oluşur */
  return R
}
/* Bir kaydın evren içindeki konumu (0..1) ve görünürlüğü */
function recPos(r, p) {
  const en = sm(p, r.tIn, r.tIn + .05)
  const k = sm(p, .48, .56)
  let u = mix(r.s[0], r.c[0], k), v = mix(r.s[1], r.c[1], k), o = en
  /* giriş: kendi yönünden merkeze doğru gelir */
  u = mix(r.s[0] + (r.s[0] - .5) * .7, u, en); v = mix(r.s[1] + (r.s[1] - .5) * .7, v, en)
  const dis = t => { u = mix(u, u > .5 ? 1.14 : -.14, t); v = mix(v, v > .5 ? 1.08 : -.08, t * .5); o = mix(o, .1, t) }
  if (r.out === 1) dis(sm(p, .50, .535))
  if (r.out === 2) dis(sm(p, .535, .575))
  if (r.out === 3) dis(sm(p, .60, .635))
  if (r.k === 'altinkale') { const t = sm(p, .555, .605); u = mix(u, .52, t); v = mix(v, .48, t) }
  else if (r.out === 0) { const t = sm(p, .60, .64); u = mix(u, .88, t); v = mix(v, .22 + r.slot * .24, t) }
  return { u, v, o }
}

const curve = (a, b, bend = .5) => `M${a[0].toFixed(1)} ${a[1].toFixed(1)} C${mix(a[0], b[0], bend).toFixed(1)} ${a[1].toFixed(1)}, ${mix(a[0], b[0], 1 - bend).toFixed(1)} ${b[1].toFixed(1)}, ${b[0].toFixed(1)} ${b[1].toFixed(1)}`
const onCurve = (a, b, t, bend = .5) => { const c1 = [mix(a[0], b[0], bend), a[1]], c2 = [mix(a[0], b[0], 1 - bend), b[1]]; const q = 1 - t; return [q * q * q * a[0] + 3 * q * q * t * c1[0] + 3 * q * t * t * c2[0] + t * t * t * b[0], q * q * q * a[1] + 3 * q * q * t * c1[1] + 3 * q * t * t * c2[1] + t * t * t * b[1]] }

function Say({ on, children, cls = '' }) {
  return <div className={`st-say ${cls}`} style={{ opacity: on, transform: `translateY(${(1 - on) * 10}px)`, pointerEvents: on > .5 ? 'auto' : 'none' }} aria-hidden={on < .5}>{children}</div>
}

export default function Story({ onDemo, onFeatures }) {
  const trackRef = useRef(null), stRef = useRef(null)
  const mobile = useMedia('(max-width: 767px)'), tablet = useMedia('(max-width: 1279px)'), rm = useMedia('(prefers-reduced-motion: reduce)')
  const L = mobile ? LAY.mob : tablet ? LAY.tab : LAY.desk
  WF = rm ? 0 : .015
  const REC = useMemo(() => buildRecords(mobile), [mobile])
  const [p, setP] = useState(0)
  const [size, setSize] = useState({ w: 1280, h: 720 })
  const [manual, setManual] = useState(null) /* danışmanın elle değiştirdiği öncelik */
  useTrack(trackRef, v => { const q = rm ? Math.round(v * 48) / 48 : Math.round(v * 1000) / 1000; setP(x => x === q ? x : q) })
  useEffect(() => { const el = stRef.current; if (!el) return; const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight })); ro.observe(el); return () => ro.disconnect() }, [])
  const { w, h } = size
  const X = x => x / 100 * w, Y = y => y / 100 * h
  const px = ([x, y]) => [X(x), Y(y)]

  /* ── anahtar noktalar (px) ── */
  const icoR = mobile ? 18 : tablet ? 20 : 22
  const cust = px(L.cust), sig = L.sig.map(px), uni = { x0: X(L.uni[0]), y0: Y(L.uni[1]), x1: X(L.uni[2]), y1: Y(L.uni[3]) }
  const uc = [(uni.x0 + uni.x1) / 2, (uni.y0 + uni.y1) / 2]
  const mW = X(L.match[2]), mX = X(L.match[0]), mY = mobile ? mix(Y(L.match[1]), Y(56), b8Pre(p)) : Y(L.match[1])
  const sentA = mobile ? [X(50), Y(L.sent[1]) + 236] : [X(L.sent[0] + L.sent[2]) + 4, Y(L.sent[1]) + 60] /* talep bloğunun kenarı: sinyal dalları buradan çıkar */
  const sentIn = mobile ? [X(13), Y(L.sent[1]) - 4] : [X(L.sent[0]) - 6, sentA[1]]
  const leftFade = (1 - .82 * b8Pre(p)) * (mobile ? 1 - sm(p, .64, .68) : 1)
  const uPt = ({ u, v }) => [uni.x0 + u * (uni.x1 - uni.x0), uni.y0 + v * (uni.y1 - uni.y0)]

  /* ── vuruş değerleri ── */
  const hero = 1 - sm(p, .04, .07) /* ilk kare: yalnızca kimlik, cümle, davet */
  const custIn = sm(p, .05, .10) /* müşteri, başlangıç noktasından belirir */
  const openUni = mix(.7, 1, sm(p, .44, .48))
  const uniFade = 1 - sm(p, .64, .70) * .85
  const countStage = p < .50 ? -1 : p < .535 ? 0 : p < .575 ? 1 : p < .62 ? 2 : 3
  const photoH = mobile ? .5 : .6, cmpH = .34
  const b5 = sm(p, .64, .69), b6 = sm(p, .76, .79), b7 = sm(p, .836, .848), b8 = sm(p, .94, .97)
  const swap = manual === 'oncelik' ? 1 : manual === 'reset' ? 0 : sm(p, .80, .825) /* danışman önceliği: sıralama cevap verir */
  const step7 = p < .94 ? Math.min(6, Math.max(0, Math.floor((p - .84) / .0143))) : -1
  const talep = sm(p, .31, .34) /* müşteri talebi, kriterler, danışman notu */

  /* ── kayıt geometrisi (px) ── */
  const recs = REC.map(r => {
    const q = recPos(r, p); const [x, y] = uPt(q)
    let cx = x, cy = y, rw = r.w || 0, rh = r.w ? r.w * .75 : 0, o = q.o * openUni * uniFade, z = 1
    if (r.k === 'altinkale') {
      o = q.o * openUni
      const fw = mW, fh = mW * photoH
      cx = mix(cx, mX + fw / 2, b5); cy = mix(cy, mY + fh / 2, b5); rw = mix(rw, fw, b5); rh = mix(rh, fh, b5); z = 5
      rh = mix(rh, mW * cmpH, b6); cy = mix(cy, mY + mW * cmpH / 2, b6)
      const tw = 60, th = 45; cx = mix(cx, mX + 14 + tw / 2, b7); cy = mix(cy, mY + 14 + th / 2, b7); rw = mix(rw, tw, b7); rh = mix(rh, th, b7)
    } else if (r.k === 'yenikoy' || r.k === 'duzlercami') {
      const row = r.k === 'yenikoy' ? mix(1, 2, swap) : mix(2, 1, swap)
      const tw = 46, th = 34, rowY = mY + mW * cmpH + 52 + row * 54 + 7
      cx = mix(cx, mX + 12 + tw / 2, b6); cy = mix(cy, rowY + th / 2, b6); rw = mix(rw, tw, b6); rh = mix(rh, th, b6); z = 6
      const gone = 1 - sm(p, .832, .844); o = o * gone; if (p >= .76) o = Math.max(o, .98 * gone)
    }
    return { r, cx, cy, rw, rh, o, z }
  })
  const esas = recs.find(e => e.r.k === 'altinkale')
  const panelLeft = [mX, mY + mW * (mix(photoH, cmpH, b6)) / 2]

  /* ── yollar ── */
  const P = []
  /* 1: "find" — başlangıç noktasından ihtimal alanına; ilk karede eksik, kaydırmayla çizilir */
  P.push({ d: curve(cust, uc, .35), t: mix(.26, 1, sm(p, .05, .16)), o: mix(.55, 1, sm(p, .05, .1)) * (1 - sm(p, .31, .34)), w: 1.2 })
  /* 2: talepten dört sinyale dallar */
  P.push({ d: mobile ? `M${cust[0]} ${cust[1] + 28} L${sentIn[0]} ${sentIn[1]}` : curve([cust[0] + 40, cust[1]], sentIn, .5), t: sm(p, .31, .33), o: sm(p, .31, .32) * leftFade, w: 1.1 })
  sig.forEach((s, i) => P.push({ d: curve(sentA, [s[0] - icoR, s[1]], .45), t: sm(p, .33 + i * .025, .39 + i * .025), o: sm(p, .32, .34) * leftFade, w: 1.1 }))
  /* 3: sinyal → kayıt ince ilişkiler */
  recs.forEach(e => { if (e.r.kind === 'dot' || !e.r.aff.length || e.r.k === 'altinkale') return
    e.r.aff.forEach(i => P.push({ d: curve([sig[i][0] + icoR, sig[i][1]], [e.cx, e.cy], .4), t: sm(p, .48 + i * .01, .535), o: e.o * .8 * (1 - sm(p, .64, .69)), w: .8, dash: true })) })
  /* 4: dört sinyal → keşfedilen mülk: güçlü, kalıcı */
  if (esas) sig.forEach((s, i) => { const target = p < .69 ? [esas.cx - esas.rw / 2, esas.cy] : panelLeft
    P.push({ d: curve([s[0] + icoR, s[1]], target, .45), t: sm(p, .565 + i * .012, .62 + i * .012), o: sm(p, .56, .58), w: 1.5, strong: true }) })
  /* 5: eşleşmeden paylaşıma, takibe, rapora (masaüstü) */
  if (L.path) { const pts = L.path.map(px); const from = [mX + mW / 2, mY + mW * cmpH + 40]
    P.push({ d: curve(from, pts[0], .2), t: sm(p, .84, .87), o: sm(p, .84, .85), w: 1.2 })
    P.push({ d: `M${pts[0][0]} ${pts[0][1]} L${pts[1][0]} ${pts[1][1]}`, t: sm(p, .87, .905), o: sm(p, .86, .87), w: 1.2 })
    P.push({ d: `M${pts[1][0]} ${pts[1][1]} L${pts[2][0]} ${pts[2][1]}`, t: sm(p, .905, .94), o: sm(p, .9, .905), w: 1.2 }) }

  const PAIR = [['İnsan', 'mekân'], ['İhtiyaç', 'ihtimal'], ['Bugün', 'gelecek']]
  const pairPts = [.28, .52, .76].map(t => onCurve(cust, uc, t, .35))
  const phase = p < .48 ? 0 : p < .76 ? 1 : 2
  const goTo = frac => { const el = trackRef.current; if (!el) return; const top = el.getBoundingClientRect().top + window.scrollY; window.scrollTo({ top: top + frac * (el.offsetHeight - window.innerHeight), behavior: rm ? 'auto' : 'smooth' }) }
  const fieldR = Math.min(w, h) * (mobile ? .12 : .1)

  /* danışman notu, paylaşım, randevu, görev, geçmiş, rapor */
  const STEP7 = [
    { k: 'not', t: 'Danışman notu', b: <div className="mp-note"><span className="mp-lbl">Not</span><p>Aylin Hanım Altınkale’yi öncelikli görmek istiyor; Yeniköy alternatif olarak paylaşılacak.</p><small>Selin Kaya · bugün 09:41</small></div> },
    { k: 'pay', t: 'Müşteriyle paylaşım', b: <div className="mp-share"><div className="mp-bubble"><p>Merhaba Aylin Hanım, konuştuğumuz önceliklere göre öne çıkan iki villayı ve nedenlerini gönderiyorum.</p><ul><li><span>Döşemealtı · Altınkale</span><b>%92</b></li><li><span>Döşemealtı · Yeniköy</span><b>%87</b></li></ul></div></div> },
    { k: 'wa', t: 'Kanal seçimi', b: <div className="mp-chan"><button type="button" className="is-on" aria-pressed="true"><Ico n="check" size={14} />WhatsApp</button><button type="button" aria-pressed="false">E-posta</button><small>Paylaşım geçmişe işlenir · 13 Ağu 10:05</small></div> },
    { k: 'rnd', t: 'Gösterim randevusu', b: <div className="mp-kv"><div><span>Randevu</span><b>Cumartesi 11:00 · Altınkale</b></div><div><span>Katılan</span><b>Aylin Hanım · Selin Kaya</b></div><div><span>Hatırlatma</span><b>1 saat önce</b></div></div> },
    { k: 'gor', t: 'Takip görevi', b: <div className="mp-kv"><div><span>Görev</span><b>Gösterim sonrası geri bildirim al</b></div><div><span>Ne zaman</span><b>Pazartesi · otomatik hatırlatma</b></div><div><span>Durum</span><Chip k="warn">Bekliyor</Chip></div></div> },
    { k: 'gec', t: 'Müşteri geçmişi', b: <ol className="mp-tl"><li className="d">İhtiyaç kaydedildi · 12 Ağu</li><li className="d">4 sinyal, 12.480 portföy analiz edildi</li><li className="d">WhatsApp ile 2 seçenek paylaşıldı · 13 Ağu</li><li className="d">Müşteri geri döndü · arama 6 dk</li><li className="n">Gösterim · Cumartesi 11:00</li><li>Takip görevi · Pazartesi</li></ol> },
    { k: 'rap', t: 'Operasyon raporu', b: <div className="mp-rep"><div className="mp-metrics"><div><b>148</b><span>Aktif müşteri</span></div><div><b>42</b><span>Planlı gösterim</span></div><div><b>17</b><span>Bekleyen takip</span></div></div><div className="mp-bars">{[['İhtiyaç', 1], ['Öneri', .65], ['Gösterim', .28], ['Teklif', .12]].map(([l, v]) => <div key={l}><span>{l}</span><i style={{ '--v': v }} /></div>)}</div><small>Görünürlük: yönetici · ofis geneli · temsili demo verisi</small></div> },
  ]
  const ADAY = [{ k: 'altinkale', row: 0, sel: true, pct: 92 }, { k: 'yenikoy', row: mix(1, 2, swap), pct: Math.round(mix(87, 85, swap)) }, { k: 'duzlercami', row: mix(2, 1, swap), pct: Math.round(mix(84, 88, swap)) }]

  return (
    <div className={`st-track${rm ? ' is-rm' : ''}`} ref={trackRef} style={{ height: mobile ? '820svh' : '1000svh' }}>
      {[['hikaye', 0], ['ihtiyac', .30], ['eslesme', .64], ['surec', .84]].map(([id, f]) => <div key={id} id={id} className="st-anchor" style={{ top: `calc(${f * 100}% - ${f} * 100svh)` }} aria-hidden="true" />)}
      <div className="st" data-phase={phase}><div className="st-in" ref={stRef}>
        {/* ── ifade alanı: her an tek büyük cümle ── */}
        <div className="st-txt" style={{ left: `${L.txt[0]}%`, top: `${L.txt[1]}%`, width: `${L.txt[2]}%` }}>
          <Say on={hero} cls="st-say--hero">
            <p className="st-eyebrow"><img src="/sryverse-icon.png" alt="" width="18" height="18" />EstateMatch <span>by SRYVERSE</span></p>
            <h1 className="st-h">Sometimes people find<br />the right place.</h1>
            <p className="st-sub">EstateMatch, müşteriler ve portföyler arasındaki görünmeyen ilişkileri keşfeder.</p>
            <button type="button" className="st-cue" onClick={() => goTo(.31)}><span className="st-cue__line" aria-hidden="true"><i /></span>Nasıl çalıştığını keşfet</button>
          </Say>
          <Say on={win(p, .06, .18)}><p className="st-h" lang="en">Sometimes the right place<br /><em>should find them.</em></p></Say>
          <Say on={win(p, .18, .24)}><p className="st-h2">Match, <span className="st-eq">müşteri = ilan</span> değildir.</p></Say>
          <Say on={win(p, .24, .31)}><p className="st-h2">Yan yana geldiklerinde daha fazla anlam kazanan iki şeydir.</p></Say>
          <Say on={win(p, .31, .50)}><p className="st-lbl">İhtiyaç · {MUSTERI}</p><p className="st-sub">Söylenen kriter, danışman notu ve sistem yorumu ayrı tutulur. EstateMatch dört bağlam sinyali türetir.</p></Say>
          <Say on={win(p, .50, .575)}><p className="st-h2">Tesadüfü üretmiyoruz.</p></Say>
          <Say on={win(p, .575, .64)}><p className="st-h2">Onu fark etme ihtimalini artırıyoruz.</p></Say>
          <Say on={win(p, .64, .76)}><p className="st-lbl">Eşleşme</p><p className="st-sub">Sonuç bir yüzde değil; nedenleri ve ödünleşimi görünen bir ilişki.</p></Say>
          <Say on={win(p, .76, .805)}><p className="st-lbl">Karşılaştırma · danışman kararı</p><p className="st-sub">Bir önceliği değiştirin; sıralama cevap verir. Alternatifler listede kalır.</p></Say>
          <Say on={win(p, .805, .84)}><p className="st-h2">EstateMatch karar vermez.<br />Göremediğiniz ihtimalleri görünür kılar.</p></Say>
          <Say on={win(p, .84, .94)}><p className="st-h2">Doğru eşleşme bulunduğunda bitmez.<br />İlişkiye dönüştüğünde değer kazanır.</p></Say>
          <Say on={sm(p, .94, .965)} cls="st-say--hero">
            <h2 className="st-h" lang="en">Some places are searched for.<br />Others are discovered.</h2>
            <p className="st-sub">EstateMatch, müşteriyi anlamaktan doğru ihtimali keşfetmeye; paylaşmaktan takibe kadar bütün danışmanlık sürecini tek yerde birleştirir.</p>
            <div className="st-cta"><Btn p onClick={onDemo}>Demo planla</Btn><a href="/estatematch/features" className="em-link" onClick={e => { e.preventDefault(); onFeatures?.() }}>Ürünü incele</a></div>
          </Say>
        </div>

        {/* ── ilişki yolları ── */}
        <svg className="st-paths" width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
          {/* ihtimal alanı: ilk karede soyut, evren oluştukça çekilir */}
          <circle cx={uc[0]} cy={uc[1]} r={fieldR} className="st-field" style={{ opacity: .9 * (1 - sm(p, .12, .30)) }} />
          <circle cx={uc[0]} cy={uc[1]} r={fieldR * .55} className="st-field" style={{ opacity: .5 * (1 - sm(p, .12, .30)) }} />
          {P.map((q, i) => <path key={i} d={q.d} pathLength="1" strokeDasharray={q.dash ? '.02 .012' : '1'} strokeDashoffset={q.dash ? 0 : 1 - q.t} style={{ opacity: q.dash ? q.o * q.t : q.o }} className={q.strong ? 'is-strong' : ''} strokeWidth={q.w} />)}
          {pairPts.map((pt, i) => <circle key={i} cx={pt[0]} cy={pt[1]} r="3" style={{ opacity: win(p, .24 + i * .012, .30, .012) }} className="is-strong" />)}
          {/* başlangıç noktası: kişi */}
          <circle cx={cust[0]} cy={cust[1]} r="4" className="is-strong" style={{ opacity: 1 - custIn }} />
          <circle cx={sentA[0]} cy={sentA[1]} r="3.5" className="is-strong" style={{ opacity: sm(p, .32, .34) * leftFade }} />
        </svg>
        {PAIR.map((c, i) => <span key={c[0]} className="st-pair" style={{ left: pairPts[i][0], top: pairPts[i][1], opacity: win(p, .245 + i * .012, .30, .012) }} aria-hidden="true">{c[0]} <b>+</b> {c[1]}</span>)}

        {/* ── müşteri: başlangıç noktasından belirir ── */}
        <div className="st-cust" style={{ left: cust[0], top: cust[1], opacity: custIn * leftFade, transform: `translate(-50%,-50%) scale(${mix(.35, 1, custIn)})` }} aria-hidden={custIn < .5}>
          <div className="st-cust__node" aria-hidden="true">A</div>
          <div className="st-cust__lbl"><b style={{ opacity: talep }}>{MUSTERI}</b><span>{p < .31 ? 'Müşteri' : 'Müşteri · 12 Ağu'}</span></div>
        </div>
        <div className="st-sent" style={{ left: `${L.sent[0]}%`, top: `${L.sent[1]}%`, width: `${L.sent[2]}%`, opacity: talep * (1 - b8Pre(p)) * (mobile ? 1 - sm(p, .64, .68) : 1) }} aria-hidden={p < .31 || p > .95}>
          <blockquote><p>“{IHTIYAC}”</p></blockquote>
          <div className="st-kriter" aria-label="Müşterinin söylediği kriterler"><span className="st-tag">Söylenen kriter</span>{KRITER.map(k => <span key={k}>{k}</span>)}</div>
          <p className="st-not"><span className="st-tag">Danışman notu</span>{NOT}</p>
        </div>

        {/* ── dört bağlam sinyali: sistem yorumu ── */}
        <span className="st-tag st-tag--sig" style={{ left: sig[0][0] - icoR, top: sig[0][1] - icoR - 18, opacity: sm(p, .33, .36) * leftFade }} aria-hidden="true">Sistem yorumu</span>
        {SIGNAL.map(([t, ico], i) => { const on = sm(p, .34 + i * .025, .37 + i * .025); const hot = countStage >= 0
          return <div key={t} className={`st-sig${hot ? ' is-hot' : ''}`} style={{ left: sig[i][0], top: sig[i][1], opacity: on * leftFade, transform: `translate(${-icoR}px,-50%) translateX(${(1 - on) * -10}px)` }} aria-hidden={on < .5}><span className="st-sig__ico"><Ico n={ico} /></span><span className="st-sig__t">{t}</span></div> })}

        {/* ── portföy evreni ── */}
        <div className="st-count" style={{ left: uni.x0, top: uni.y0 - 30, opacity: win(p, .47, .66, .02) }} aria-live="polite">
          {[12480, 642, 38, 4].map((n, i) => <b key={n} className={i === Math.max(0, countStage) ? 'is-on' : i < countStage ? 'is-past' : ''}>{n.toLocaleString('tr-TR')}</b>)}<span>portföy</span>
        </div>
        {recs.map(({ r, cx, cy, rw, rh, o, z }) => {
          if (o < .01) return null
          if (r.kind === 'dot') return <i key={r.id} className="st-dot" style={{ left: cx, top: cy, opacity: o }} />
          if (r.kind === 'txt') return <span key={r.id} className="st-rec" style={{ left: cx, top: cy, opacity: o }} aria-hidden="true">{r.t}</span>
          if (r.kind === 'plan') return <span key={r.id} className={`st-plan${r.out === 0 ? ' is-keep' : ''}`} style={{ left: cx, top: cy, width: rw, height: rw * .87, opacity: o }} aria-hidden="true"><Plan v={r.v} /></span>
          const isMatch = r.k === 'altinkale'
          return <figure key={r.id} className={`st-photo${isMatch ? ' is-match' : ''}`} style={{ left: cx, top: cy, width: rw, height: rh, opacity: o, zIndex: z, '--ring': isMatch ? sm(p, .58, .62) * (1 - sm(p, .64, .68)) : 0 }}>
            <Villa k={r.k} />
          </figure>
        })}

        {/* ── eşleşme nesnesi: tek panel, dönüşür ── */}
        <div className="st-match" style={{ left: mX, top: mY, width: mW, opacity: sm(p, .68, .70), '--ph': `${mW * (b7 > 0 ? mix(cmpH, 0, b7) : mix(photoH, cmpH, b6))}px` }} aria-hidden={p < .69}>
          <div className="mp-found" style={{ opacity: win(p, .69, .84, .02) }}><Ico n="check" size={16} />Eşleşme bulundu</div>
          <div className="mp-spacer" aria-hidden="true" />
          <div className={`mp-body${p < .78 ? '' : ' is-abs'}`} style={{ opacity: win(p, .69, .78, .02), pointerEvents: p < .78 ? 'auto' : 'none' }}>
            <div className="mp-title"><b>{MULK.altinkale.t}</b><span className="mp-pct"><em>%92</em> anlamlı uyum</span></div>
            <p className="mp-oz">{MULK.altinkale.oz} · <b>{MULK.altinkale.fiyat}</b></p>
            <p className="mp-port">Portföy #EM-3104 · Selin Kaya · Aktif · vaziyet planı temsilidir</p>
            <p className="mp-lbl">Neden eşleşti?</p>
            <ul className="mp-why">
              {NEDEN.map(([ico, t, d], i) => <li key={t} style={{ opacity: sm(p, .70 + i * .012, .712 + i * .012) }}><span className="mp-ico"><Ico n={ico} size={16} /></span><div><b>{t}</b><small>{d}</small></div></li>)}
            </ul>
            <div className="mp-trade" style={{ opacity: sm(p, .75, .762) }}><p className="mp-lbl">Dengelediği konu</p><p>Ana ulaşım aksına yaklaşık 8 dakika mesafede.</p></div>
          </div>
          <div className={`mp-body mp-cmp${p >= .78 && p < .845 ? '' : ' is-abs'}`} style={{ opacity: win(p, .78, .845, .015), pointerEvents: p >= .78 && p < .845 ? 'auto' : 'none' }}>
            <div className="mp-cmp__h"><span>Seçenek</span>{SIGNAL.map(([t, ico]) => <span key={t} title={t}><Ico n={ico} size={14} /></span>)}<span>Uyum</span></div>
            {ADAY.map(a => { const m = MULK[a.k]; return (
              <div key={a.k} className={`mp-row${a.sel ? ' is-sel' : ''}`} style={{ transform: `translateY(${a.row * 54}px)` }}>
                <span className="mp-row__t">{a.sel && <Ico n="check" size={13} />}<span><b>{m.t.replace('Döşemealtı · ', '')}</b><small>{m.fark || m.oz.split(' · ').slice(1, 3).join(' · ')}</small></span></span>
                {m.v.map((d, i) => <span key={i} className={`mp-dot mp-dot--${d}`} aria-label={`${SIGNAL[i][0]}: ${['zayıf', 'orta', 'güçlü'][d]}`} />)}
                <span className="mp-row__pct">%{a.pct}</span>
              </div>) })}
            <div className="mp-adj" style={{ marginTop: 3 * 54 + 12 }}>
              <span>Danışman önceliği</span>
              <button type="button" className={`mp-toggle${swap > .5 ? ' is-on' : ''}`} aria-pressed={swap > .5} onClick={() => setManual(swap > .5 ? 'reset' : 'oncelik')}><i /><span>Mahremiyet öncelikli</span></button>
            </div>
          </div>
          <div className={`mp-body mp-rel${p >= .845 ? '' : ' is-abs'}${p >= .94 ? ' is-fin' : ''}`} style={{ opacity: sm(p, .844, .852), pointerEvents: p >= .845 ? 'auto' : 'none' }}>
            <div className="mp-id"><b>Altınkale · 4+1</b><span>{MUSTERI} · Selin Kaya</span></div>
            <div className="mp-steps">
              {STEP7.map((s, i) => <div key={s.k} className="mp-step" style={{ opacity: i === step7 ? 1 : 0, position: i === step7 ? 'relative' : 'absolute' }} aria-hidden={i !== step7}><p className="mp-lbl">{s.t}</p>{s.b}</div>)}
              <div className="mp-step" style={{ opacity: b8, position: p >= .94 ? 'relative' : 'absolute' }} aria-hidden={p < .95}>
                <p className="mp-lbl">Bu ilişkinin özeti</p>
                <div className="mp-kv"><div><span>Eşleşme</span><b>Altınkale · 4+1 · %92</b></div><div><span>Paylaşım</span><b>WhatsApp · 13 Ağu</b></div><div><span>Sonraki adım</span><b>Gösterim · Cumartesi 11:00</b></div></div>
              </div>
            </div>
            <div className="mp-prog" aria-hidden="true">{STEP7.map((s, i) => <i key={s.k} className={step7 < 0 || i <= step7 ? 'is-on' : ''} />)}</div>
          </div>
        </div>

        {L.path && [['share', 'Paylaş', 'WhatsApp veya e-posta ile'], ['flag', 'Takip et', 'Randevu, görev, hatırlatma'], ['pie', 'Raporla', 'Süreç görünür olur']].map(([ico, t, d], i) => { const pt = px(L.path[i]); const on = sm(p, [.855, .895, .93][i], [.87, .91, .945][i])
          return <div key={t} className="st-stop" style={{ left: pt[0], top: pt[1], opacity: on }} aria-hidden={on < .5}><span className="st-stop__ico"><Ico n={ico} size={18} /></span><b>{t}</b><small>{d}</small></div> })}

        <ol className="st-phase" aria-label="Hikâye aşaması" style={{ opacity: sm(p, .04, .08) }}>{['İhtiyaç', 'Eşleşme', 'Karar'].map((t, i) => <li key={t} className={i === phase ? 'is-on' : i < phase ? 'is-past' : ''}><button type="button" tabIndex={p < .06 ? -1 : 0} onClick={() => goTo([.31, .66, .86][i])}>{t}</button></li>)}</ol>
      </div></div>
    </div>)
}
