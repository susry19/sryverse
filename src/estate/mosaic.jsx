/* Eşleşme görselinin kademeli inşası.
   Tek kaynak görsel, deterministik 16×10 (mobilde 8×5) karo sistemi.
   Karolar anlamlı sırayla oturur: önce yapı hacmi ve havuz konumu,
   sonra cephe/bahçe, sonra çevre, en son gökyüzü. Açığa çıkma oranı
   dışarıdan tek bir sayı (0..1) ile sürülür; geri kaydırma aynı sırayı
   tersine işler, hızlı kaydırma her zaman geçerli bir orana oturur. */
import { useRef, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react'

export const SRC = '/villa/altinkale-1440.webp'
export const SRCSET = '/villa/altinkale-640.webp 640w, /villa/altinkale-960.webp 960w, /villa/altinkale-1440.webp 1440w, /villa/altinkale-1586.webp 1586w'
export const ALT = 'Döşemealtı’nda özel havuzlu, bahçeli müstakil villa.'
export const IMG_W = 1586, IMG_H = 992
const COLS = 16, ROWS = 10
/* 1: yapı hacmi, havuz kenarı · 2: cephe, teras, bahçe · 3: çevre · 4: gökyüzü */
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
const ODAK = [[10.5, 7], [3, 8], [13, 8], [8, 4.5]]
/* Anlatı aşamalarına karşılık gelen kümülatif oranlar: %10 → %30 → %50 → %100 */
export const ASAMA = [.10, .30, .50, 1]

function karolar(mobil) {
  const cols = mobil ? 8 : COLS, rows = mobil ? 5 : ROWS
  const oran = COLS / cols
  const hucre = []
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    let top = 0, n = 0, enAz = 9
    for (let dr = 0; dr < oran; dr++) for (let dc = 0; dc < oran; dc++) {
      const g = +MAP[Math.min(ROWS - 1, r * oran + dr)][Math.min(COLS - 1, c * oran + dc)]
      top += g; n++; if (g < enAz) enAz = g
    }
    const g = enAz === 1 ? 1 : Math.round(top / n)
    const [ax, ay] = ODAK[Math.min(3, g - 1)]
    const dx = (c + .5) * oran - ax, dy = (r + .5) * oran - ay
    hucre.push({ c, r, g, d: Math.hypot(dx, dy * 1.4), dx, dy })
  }
  hucre.sort((a, b) => a.g - b.g || a.d - b.d || a.r - b.r || a.c - b.c)
  const list = hucre.map((h, i) => {
    const n = Math.max(.001, Math.hypot(h.dx, h.dy))
    return { c: h.c, r: h.r, i, ox: -(h.dx / n) * 12, oy: -(h.dy / n) * 12 }
  })
  return { list, cols, rows, esik: ASAMA.map(f => Math.round(list.length * f)) }
}

/* pay: 0..1 — görselin ne kadarının yerine oturduğu */
const Mosaic = forwardRef(function Mosaic({ mobil, priority }, ref) {
  const gridRef = useRef(null), imgRef = useRef(null), frameRef = useRef(null)
  const { list, cols, rows } = useMemo(() => karolar(mobil), [mobil])
  const payRef = useRef(0)

  const yaz = () => {
    const k = payRef.current * list.length
    const g = gridRef.current; if (g) { g.style.setProperty('--k', k.toFixed(2)); const n = g.parentElement; if (n) n.style.setProperty('--tam', Math.min(1, payRef.current * 1.15).toFixed(3)) }
    const im = imgRef.current
    if (im) im.style.opacity = String(Math.min(1, Math.max(0, (k - (list.length - 5)) / 5))) /* dikişsiz kapanış */
  }
  useImperativeHandle(ref, () => ({ ayarla: v => { payRef.current = v; yaz() } }), [list.length])
  useEffect(yaz)
  useEffect(() => {
    const f = frameRef.current, g = gridRef.current; if (!f || !g) return
    const ro = new ResizeObserver(() => { g.style.setProperty('--fw', f.clientWidth + 'px'); g.style.setProperty('--fh', f.clientHeight + 'px') })
    ro.observe(f); return () => ro.disconnect()
  }, [])

  return (
    <div className="mz" ref={frameRef}>
      <div className="mz-net" aria-hidden="true" style={{ '--cols': cols, '--rows': rows }} />
      <div className="mz-grid" ref={gridRef} aria-hidden="true" style={{ '--cols': cols, '--rows': rows, '--img': `url(${SRC})` }}>
        {list.map(t => <i key={`${t.c}-${t.r}`} className="mz-t" style={{ '--i': t.i, '--dx': t.ox.toFixed(1), '--dy': t.oy.toFixed(1), '--c': t.c, '--r': t.r }} />)}
      </div>
      <img ref={imgRef} className="mz-img" src={SRC} srcSet={SRCSET} sizes="(max-width:767px) 92vw, 34vw" width={IMG_W} height={IMG_H} alt={ALT}
        loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} decoding="async" style={{ opacity: 0 }} />
    </div>)
})
export default Mosaic
