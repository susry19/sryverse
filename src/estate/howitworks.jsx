/* Nasıl çalışır — dört adım, tek villa görselinin kademeli inşası.
   Görsel deterministik bir 16×10 karo sistemine bölünür; her karo aynı
   kaynak görseli referans alır (tek indirme). Karolar rastgele değil,
   anlamlı sırayla yerine oturur: önce yapı hatları, sonra havuz, bahçe
   ve cephe, sonra çevre, en son gökyüzü. Geri kaydırmada aynı sıra
   tersine işler; hızlı kaydırma her zaman geçerli bir adıma oturur. */
import { useRef, useState, useEffect, useMemo } from 'react'
import { useTrack, kapi, yumusa, useMedia } from './scroll.js'
import { Ico } from './bits.jsx'

const SRC = '/villa/altinkale-1440.webp'
const SRCSET = '/villa/altinkale-640.webp 640w, /villa/altinkale-960.webp 960w, /villa/altinkale-1440.webp 1440w, /villa/altinkale-1586.webp 1586w'
const ALT = 'Döşemealtı’nda özel havuzlu, bahçeli müstakil villa.'
const W = 1586, H = 992
const COLS = 16, ROWS = 10
/* Hangi karo hangi adımda yerine oturur (1..4) — görsel içeriğe göre elle haritalandı.
   1: parsel ve yapı hatları, havuz kenarı · 2: havuz, cephe, teras, bahçe
   3: çevre, ağaçlar, yollar · 4: gökyüzü ve kalan alanlar */
const MAP = [
  '4444444444444444',
  '4444444444444113',
  '3333344444111113',
  '3333333311222213',
  '3334444122222213',
  '3322221222222213',
  '3322221221222213',
  '1111111111113333',
  '1222221222333333',
  '3312221333333333',
]
/* Her adımın odak noktası (sütun, satır): karolar bu noktadan dışarı doğru yerleşir */
const ODAK = [[10.5, 7], [3, 8], [13, 8], [8, 4.5]]

const ADIM = [
  { n: '01', t: 'Anlayın', c: 'Müşterinin talebini, tercihlerini ve danışman notunu tek bir müşteri bağlamında toplayın.', s: 'Dağınık bilgi, anlaşılır bir ihtiyaca dönüşür.' },
  { n: '02', t: 'Keşfedin', c: 'EstateMatch binlerce portföyü bu bağlamla değerlendirir; anlamlı seçenekleri nedenleri ve farklarıyla görünür kılar.', s: 'Kalabalık azalır, güçlü ihtimaller belirginleşir.' },
  { n: '03', t: 'Yönetin', c: 'Seçenekleri karşılaştırın, müşterinizle paylaşın; randevu, görev, görüşme ve takipleri aynı akışta yönetin.', s: 'Eşleşme, yönetilebilir bir müşteri yolculuğuna dönüşür.' },
  { n: '04', t: 'Ölçün', c: 'Müşteri aşamalarını, portföy hareketlerini, danışman aktivitelerini ve bekleyen aksiyonları raporlayın.', s: 'Süreç görünür, performans takip edilebilir hâle gelir.' },
]
const AKIS = [['share', 'Paylaş'], ['clock', 'Randevu'], ['flag', 'Takip']]
const SONUC = ['İhtiyaç anlaşıldı', 'Eşleşme açıklandı', 'Süreç takipte', 'Sonuçlar görünür']

/* Karo listesi: konum, adım, giriş yönü ve global sıra numarası */
function karolar(mobil) {
  const cols = mobil ? 8 : COLS, rows = mobil ? 5 : ROWS
  const oran = COLS / cols
  const hucre = []
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    let top = 0, n = 0, enAz = 9
    for (let dr = 0; dr < oran; dr++) for (let dc = 0; dc < oran; dc++) {
      const gg = +MAP[Math.min(ROWS - 1, r * oran + dr)][Math.min(COLS - 1, c * oran + dc)]
      top += gg; n++; if (gg < enAz) enAz = gg
    }
    hucre.push({ c, r, g: +MAP[Math.min(ROWS - 1, r * oran)][Math.min(COLS - 1, c * oran)], skor: top / n - (enAz === 1 ? .45 : 0) }) /* yapı hattı içeren blok öne çekilir */
  }
  if (cols !== COLS) {
    /* mobil: masaüstüyle aynı oranlar korunur (%21 → %47 → %76 → %100) */
    const oranlar = [.206, .263, .294, .237]
    const sirali = [...hucre].sort((a, b) => a.skor - b.skor || a.r - b.r || a.c - b.c)
    let i = 0
    oranlar.forEach((f, gi) => { const adet = gi === 3 ? sirali.length - i : Math.round(sirali.length * f); for (let k = 0; k < adet; k++) sirali[i++].g = gi + 1 })
  }
  const out = []
  for (let g = 1; g <= 4; g++) {
    const [ax, ay] = ODAK[g - 1]
    hucre.filter(h => h.g === g)
      .map(h => { const dx = (h.c + .5) * oran - ax, dy = (h.r + .5) * oran - ay; return { ...h, d: Math.hypot(dx, dy * 1.4), dx, dy } })
      .sort((a, b) => a.d - b.d || a.r - b.r || a.c - b.c) /* odaktan dışa doğru, deterministik */
      .forEach(h => {
        const n = Math.max(.001, Math.hypot(h.dx, h.dy))
        out.push({ c: h.c, r: h.r, g, i: out.length, ox: -(h.dx / n) * 13, oy: -(h.dy / n) * 13 }) /* karo, odağa yakın bir yerden gelir */
      })
  }
  return { list: out, cols, rows, sinir: [1, 2, 3, 4].map(g => out.filter(t => t.g <= g).length) }
}

export default function HowItWorks({ onFeatures }) {
  const trackRef = useRef(null), gridRef = useRef(null), imgRef = useRef(null), frameRef = useRef(null)
  const mobil = useMedia('(max-width: 767px)')
  const rm = useMedia('(prefers-reduced-motion: reduce)')
  const { list, cols, rows, sinir } = useMemo(() => karolar(mobil), [mobil])
  const kRef = useRef(0)
  const [adim, setAdim] = useState(0)
  const [hazir, setHazir] = useState(false) /* görsel yalnızca bölüm yaklaşınca yüklenir */

  useEffect(() => {
    const f = frameRef.current, g = gridRef.current; if (!f || !g) return
    const ro = new ResizeObserver(() => { g.style.setProperty('--fw', f.clientWidth + 'px'); g.style.setProperty('--fh', f.clientHeight + 'px') })
    ro.observe(f); return () => ro.disconnect()
  }, [hazir])

  useEffect(() => {
    const el = trackRef.current; if (!el) return
    const io = new IntersectionObserver(e => { if (e[0].isIntersecting) { setHazir(true); io.disconnect() } }, { rootMargin: '150% 0px' })
    io.observe(el); return () => io.disconnect()
  }, [])

  /* Kaydırma yalnızca tek bir CSS değişkeni yazar: karo başına yeniden render yok */
  useTrack(trackRef, p => {
    const n = Math.min(3, Math.max(0, Math.floor(p * 4 - 1e-6)))
    setAdim(x => x === n ? x : n)
    const q = kapi(p * 4 - n, 0, 1)
    const bas = n === 0 ? 0 : sinir[n - 1]
    const k = rm ? (q > .12 ? sinir[n] : bas) : bas + (sinir[n] - bas) * yumusa(kapi(q, 0, .62))
    kRef.current = k; yaz()
  })
  /* --k yalnızca imperatif yazılır; her render'dan sonra son değer geri konur */
  const yaz = () => {
    const g = gridRef.current; if (g) g.style.setProperty('--k', kRef.current.toFixed(2))
    const im = imgRef.current
    if (im) im.style.opacity = String(Math.min(1, Math.max(0, (kRef.current - (list.length - 5)) / 5))) /* dikişsiz son kare: gerçek görsel üste geçer */
  }
  useEffect(yaz)

  const A = ADIM[adim]
  return (
    <section id="nasil-calisir" className="hw" aria-labelledby="hw-h">
      <div className="hw-track" ref={trackRef} style={{ height: mobil ? '300svh' : '360svh' }}>
        <div className="hw-stage">
          <div className="af-wrap hw-in">
            <div className="hw-txt">
              <p className="af-kicker">Nasıl çalışır</p>
              <h2 id="hw-h" className="af-h2 hw-h">Tek bir eşleşmenin etrafında, bütün süreç.</h2>
              <ol className="hw-steps" aria-label="Dört adım" style={{ '--s': adim }}>
                {ADIM.map((s, i) => (
                  <li key={s.n} className={i === adim ? 'is-on' : i < adim ? 'is-past' : ''}>
                    <span className="hw-steps__n">{s.n}</span>
                    <span className="hw-steps__t">{s.t}</span>
                  </li>))}
              </ol>
              <div className="hw-copy" aria-live="polite">
                <p className="hw-copy__c">{A.c}</p>
                <p className="hw-copy__s"><span aria-hidden="true" />{A.s}</p>
              </div>
              <p className="af-more"><a href="/estatematch/features" className="em-link" onClick={e => { e.preventDefault(); onFeatures?.() }}>Bütün özellikleri inceleyin</a></p>
            </div>

            <div className="hw-vis">
              <div className="hw-frame" ref={frameRef} style={{ aspectRatio: `${W} / ${H}` }}>
                <div className="hw-net" aria-hidden="true" style={{ '--cols': cols, '--rows': rows, opacity: adim === 3 ? 0 : .55 }} />
                <div className="hw-grid" ref={gridRef} aria-hidden="true" style={{ '--cols': cols, '--rows': rows, '--img': hazir ? `url(${SRC})` : 'none' }}>
                  {hazir && list.map(t => (
                    <i key={`${t.c}-${t.r}`} className={`hw-t hw-t--${t.g}`} style={{
                      '--i': t.i, '--dx': t.ox.toFixed(1), '--dy': t.oy.toFixed(1), '--c': t.c, '--r': t.r,
                    }} />))}
                </div>
                {hazir && <img ref={imgRef} className="hw-img" src={SRC} srcSet={SRCSET} sizes="(max-width:767px) 92vw, 60vw" width={W} height={H} alt={ALT} loading="lazy" decoding="async" style={{ opacity: 0 }} />}
              </div>
              <div className={`hw-flow${adim === 2 ? ' is-on' : ''}`} aria-hidden={adim !== 2}>
                {AKIS.map(([ico, t]) => <span key={t}><i><Ico n={ico} size={14} /></i>{t}</span>)}
              </div>
              <ul className={`hw-res${adim === 3 ? ' is-on' : ''}`} aria-hidden={adim !== 3}>
                {SONUC.map(t => <li key={t}><Ico n="check" size={13} />{t}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>)
}
