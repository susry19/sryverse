import { useEffect, useRef } from 'react'

/**
 * Sol karttan sağdaki aktif sahneye uzanan canlı sinir ağı.
 * Düğümler yumuşakça süzülür, yakın olanlar birbirine bağlanır ve
 * aktif kartın çıkışından sahneye doğru veri paketleri akar.
 *
 * Tamamen dekoratif: pointer-events yok, prefers-reduced-motion'da durur.
 */
export default function ShowcaseWeb({ anchorRef, targetRef, rgb, active }) {
  const canvasRef = useRef(null)
  // Animasyon döngüsünün her karede okuduğu canlı değerler.
  const live = useRef({ rgb, active })
  live.current = { rgb, active }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = canvas.getContext('2d')

    let W = 0, H = 0, raf = 0, t = 0
    let dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      const r = canvas.getBoundingClientRect()
      W = r.width; H = r.height
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.max(1, Math.floor(W * dpr))
      canvas.height = Math.max(1, Math.floor(H * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // Süzülen düğümler
    const N = W < 700 ? 22 : 40
    const nodes = Array.from({ length: N }, () => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - .5) * .00028,
      vy: (Math.random() - .5) * .00028,
      r: Math.random() * 1.7 + .7,
      ph: Math.random() * Math.PI * 2,
    }))

    // Karttan sahneye akan veri paketleri
    const packets = Array.from({ length: 7 }, (_, i) => ({
      p: i / 7,
      speed: .0026 + Math.random() * .0022,
      off: (Math.random() - .5) * 46,
    }))

    // Kart ve sahne arasındaki köprünün ekran içi koordinatları
    const bridge = { x1: 0, y1: 0, x2: 0, y2: 0, ok: false }
    const measureBridge = () => {
      const a = anchorRef.current?.querySelector('.prcard--on')
      const b = targetRef.current
      const cr = canvas.getBoundingClientRect()
      if (!a || !b || !cr.width) { bridge.ok = false; return }
      const ar = a.getBoundingClientRect()
      const br = b.getBoundingClientRect()
      bridge.x1 = ar.right - cr.left
      bridge.y1 = ar.top + ar.height / 2 - cr.top
      bridge.x2 = br.left - cr.left
      bridge.y2 = Math.min(Math.max(br.top + 90 - cr.top, 0), cr.height)
      bridge.ok = true
    }

    const draw = () => {
      t += 1
      if (t % 12 === 0) measureBridge()

      const C = live.current.rgb
      ctx.clearRect(0, 0, W, H)

      // ── Düğümler ve aralarındaki bağlar ──
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy; n.ph += .012
        if (n.x < 0 || n.x > 1) n.vx *= -1
        if (n.y < 0 || n.y > 1) n.vy *= -1
      }

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]
        const ax = a.x * W, ay = a.y * H
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]
          const bx = b.x * W, by = b.y * H
          const dx = ax - bx, dy = ay - by
          const d = Math.hypot(dx, dy)
          if (d < 150) {
            ctx.beginPath()
            ctx.moveTo(ax, ay); ctx.lineTo(bx, by)
            ctx.strokeStyle = `rgba(${C},${(1 - d / 150) * .16})`
            ctx.lineWidth = .6
            ctx.stroke()
          }
        }
        const pulse = .35 + Math.abs(Math.sin(a.ph)) * .5
        ctx.beginPath()
        ctx.arc(ax, ay, a.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${C},${pulse * .5})`
        ctx.fill()
      }

      // ── Karttan sahneye köprü + akan paketler ──
      if (bridge.ok && bridge.x2 > bridge.x1) {
        const { x1, y1, x2, y2 } = bridge
        const cx = (x1 + x2) / 2

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.bezierCurveTo(cx, y1, cx, y2, x2, y2)
        ctx.strokeStyle = `rgba(${C},.22)`
        ctx.lineWidth = 1.1
        ctx.stroke()

        for (const pk of packets) {
          pk.p += pk.speed
          if (pk.p > 1) pk.p -= 1
          const u = pk.p, iu = 1 - u
          // Kübik bezier üzerinde konum
          const px = iu * iu * iu * x1 + 3 * iu * iu * u * cx + 3 * iu * u * u * cx + u * u * u * x2
          const py = iu * iu * iu * y1 + 3 * iu * iu * u * y1 + 3 * iu * u * u * y2 + u * u * u * y2
          // Uçlarda sönümlenen parlaklık
          const fade = Math.sin(u * Math.PI)
          ctx.beginPath()
          ctx.arc(px, py + pk.off * .06, 2.4, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${C},${fade * .85})`
          ctx.shadowBlur = 10
          ctx.shadowColor = `rgba(${C},${fade * .7})`
          ctx.fill()
          ctx.shadowBlur = 0
        }
      }

      raf = requestAnimationFrame(draw)
    }

    if (reduce) {
      measureBridge()
    } else {
      raf = requestAnimationFrame(draw)
    }

    return () => {
      if (raf) cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [anchorRef, targetRef])

  return <canvas ref={canvasRef} className="pshow__web" aria-hidden="true" />
}
