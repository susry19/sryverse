/* Tek scroll sürücüsü: bir dinleyici, rAF, kütleli yumuşatma.
   Bölümler kendi ilerlemelerini (0..1) buradan türetir; ileri ve geri
   kaydırmada aynı durum üretilir, hız anlatıyı değiştirmez. */
import { useEffect, useRef, useState } from 'react'

const subs = new Set()
let raf = 0, yHam = 0, yYum = 0, son = 0, calisiyor = false
function kare(t) {
  raf = 0
  const dt = Math.min(0.05, (t - son) / 1000 || 0.016); son = t
  /* büyük sıçramalarda (bağlantı, hızlı kaydırma) yumuşatma yerine anında hizalan: durum her zaman geçerli kalır */
  if (Math.abs(yHam - yYum) > window.innerHeight * 1.5) yYum = yHam
  yYum += (yHam - yYum) * (1 - Math.pow(0.0016, dt))
  if (Math.abs(yHam - yYum) < 0.05) yYum = yHam
  subs.forEach(s => s(yYum))
  if (Math.abs(yHam - yYum) > 0.05) raf = requestAnimationFrame(kare)
}
function tetik() { yHam = window.scrollY; if (!raf) raf = requestAnimationFrame(kare) }
function baslat() {
  if (calisiyor) return; calisiyor = true
  yHam = yYum = window.scrollY
  window.addEventListener('scroll', tetik, { passive: true })
  window.addEventListener('resize', tetik, { passive: true })
}
function durdur() {
  if (!calisiyor || subs.size) return; calisiyor = false
  window.removeEventListener('scroll', tetik); window.removeEventListener('resize', tetik)
  if (raf) cancelAnimationFrame(raf); raf = 0
}

export const kapi = (x, a, b) => Math.min(1, Math.max(0, (x - a) / (b - a)))
export const yumusa = x => x * x * (3 - 2 * x)

/* Bir iz (track) elemanının pencere içindeki ilerlemesi: 0 tepe hizalanınca, 1 alt hizalanınca */
export function useTrack(ref, onFrame) {
  const cb = useRef(onFrame); cb.current = onFrame
  useEffect(() => {
    const el = ref.current; if (!el) return
    const hesap = (y) => {
      const r = el.getBoundingClientRect()
      const top = r.top + window.scrollY, span = Math.max(1, el.offsetHeight - window.innerHeight)
      cb.current(Math.min(1, Math.max(0, (y - top) / span)), r)
    }
    subs.add(hesap); baslat(); hesap(window.scrollY)
    return () => { subs.delete(hesap); durdur() }
  }, [ref])
}

/* Görünürlük tabanlı ilerleme: eleman pencerenin altına girdiğinde 0, üstüne çıkarken 1 */
export function useReveal(ref, onFrame) {
  const cb = useRef(onFrame); cb.current = onFrame
  useEffect(() => {
    const el = ref.current; if (!el) return
    const hesap = () => {
      const r = el.getBoundingClientRect(), vh = window.innerHeight
      cb.current(Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height))), r)
    }
    subs.add(hesap); baslat(); hesap()
    return () => { subs.delete(hesap); durdur() }
  }, [ref])
}

/* Mobil ve azaltılmış hareket: sabitleme yok, durumlar akışta */
export function useStack() {
  const oku = () => window.matchMedia('(max-width: 767px)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const [v, setV] = useState(() => (typeof window === 'undefined' ? false : oku()))
  useEffect(() => {
    const a = window.matchMedia('(max-width: 767px)'), b = window.matchMedia('(prefers-reduced-motion: reduce)')
    const f = () => setV(oku())
    a.addEventListener('change', f); b.addEventListener('change', f)
    return () => { a.removeEventListener('change', f); b.removeEventListener('change', f) }
  }, [])
  return v
}
export function useTablet() {
  const oku = () => window.matchMedia('(max-width: 1279px)').matches
  const [v, setV] = useState(() => (typeof window === 'undefined' ? false : oku()))
  useEffect(() => { const m = window.matchMedia('(max-width: 1279px)'); const f = () => setV(oku()); m.addEventListener('change', f); return () => m.removeEventListener('change', f) }, [])
  return v
}
