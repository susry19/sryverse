/* Tek kaydırma sürücüsü: bir dinleyici, bir rAF. Sahneler ilerlemelerini
   (0..1) buradan alır; ileri ve geri kaydırmada aynı durum üretilir. */
import { useEffect, useRef, useState } from 'react'

const subs = new Set()
let raf = 0, on = false
function tick() { raf = 0; const y = window.scrollY; subs.forEach((f) => f(y)) }
function poke() { if (!raf) raf = requestAnimationFrame(tick) }
function start() { if (on) return; on = true; window.addEventListener('scroll', poke, { passive: true }); window.addEventListener('resize', poke, { passive: true }) }
function stop() { if (!on || subs.size) return; on = false; window.removeEventListener('scroll', poke); window.removeEventListener('resize', poke); if (raf) cancelAnimationFrame(raf); raf = 0 }

export const clamp01 = (x) => Math.min(1, Math.max(0, x))
export const smooth = (x) => { x = clamp01(x); return x * x * (3 - 2 * x) }

/* Yapışkan iz: kabın tepesi pencere tepesine gelince 0, altı pencere altına gelince 1 */
export function useTrack(ref, onFrame) {
  const cb = useRef(onFrame); cb.current = onFrame
  useEffect(() => {
    const el = ref.current; if (!el) return
    const f = (y) => {
      const r = el.getBoundingClientRect()
      const top = r.top + y, span = Math.max(1, el.offsetHeight - window.innerHeight)
      cb.current(clamp01((y - top) / span), r)
    }
    subs.add(f); start(); f(window.scrollY)
    return () => { subs.delete(f); stop() }
  }, [ref])
}

/* Bir kez görünür olunca true (ve isteğe bağlı: görünürken true) */
export function useInView(ref, { once = true, margin = '0px 0px -12% 0px', threshold = 0 } = {}) {
  const [v, setV] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setV(true); if (once) io.disconnect() } else if (!once) setV(false)
    }, { rootMargin: margin, threshold })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, once, margin, threshold])
  return v
}

export function useMedia(q) {
  const [m, setM] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches)
  useEffect(() => {
    const mq = window.matchMedia(q), f = () => setM(mq.matches)
    mq.addEventListener('change', f); f()
    return () => mq.removeEventListener('change', f)
  }, [q])
  return m
}

export const useReducedMotion = () => useMedia('(prefers-reduced-motion: reduce)')
export const useCompact = () => useMedia('(max-width: 760px)')
