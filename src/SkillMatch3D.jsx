import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * SkillMatch hero sahnesi — aday havuzu ve eslesme.
 *
 * Ne anlatiyor: merkezde pozisyon dugumu durur, etrafinda aday dugumleri
 * bir kure uzerinde suzulur. Sistem duzenli araliklarla bir adayi secip
 * aydinlatir ve pozisyona dogru bir baglanti cizgisi cizilir; cizgi
 * uzerinde veri paketi akar. Yani urunun yaptigi eslestirmenin kendisi.
 */
export default function SkillMatch3D() {
  const mountRef = useRef(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      45, container.clientWidth / container.clientHeight, 0.1, 100
    )
    camera.position.set(0, 0.6, 9.4)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    const ACCENT = 0x34d399   // zumrut — SkillMatch rengi
    const DIM = 0x0e3b2e

    scene.add(new THREE.AmbientLight(0xffffff, 0.5))
    const key = new THREE.DirectionalLight(0xffffff, 1.0)
    key.position.set(5, 6, 6)
    scene.add(key)
    const glow = new THREE.PointLight(ACCENT, 2.4, 24)
    glow.position.set(0, 0, 2.5)
    scene.add(glow)

    const world = new THREE.Group()
    scene.add(world)

    // ── Merkez: acik pozisyon ──
    const coreGeo = new THREE.IcosahedronGeometry(0.72, 1)
    const coreMat = new THREE.MeshPhongMaterial({
      color: 0x0d4f3c, emissive: ACCENT, emissiveIntensity: 0.55,
      shininess: 70, flatShading: true,
    })
    const core = new THREE.Mesh(coreGeo, coreMat)
    world.add(core)

    // Merkez etrafinda donen tel kafes
    const cageGeo = new THREE.IcosahedronGeometry(1.15, 1)
    const cage = new THREE.LineSegments(
      new THREE.WireframeGeometry(cageGeo),
      new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.28 })
    )
    world.add(cage)

    // ── Aday dugumleri: kure uzerinde dagitilmis ──
    const COUNT = 26
    const RADIUS = 3.5
    const candidates = []
    const nodeGeo = new THREE.SphereGeometry(0.15, 18, 18)

    for (let i = 0; i < COUNT; i++) {
      // Fibonacci kuresi — esit dagilim
      const y = 1 - (i / (COUNT - 1)) * 2
      const r = Math.sqrt(Math.max(0, 1 - y * y))
      const theta = Math.PI * (3 - Math.sqrt(5)) * i

      const mat = new THREE.MeshPhongMaterial({
        color: DIM, emissive: DIM, emissiveIntensity: 0.5, shininess: 40,
      })
      const mesh = new THREE.Mesh(nodeGeo, mat)
      const base = new THREE.Vector3(
        Math.cos(theta) * r * RADIUS, y * RADIUS, Math.sin(theta) * r * RADIUS
      )
      mesh.position.copy(base)
      mesh.userData = { base, lit: 0, target: 0, phase: Math.random() * Math.PI * 2 }
      world.add(mesh)
      candidates.push(mesh)
    }

    // ── Eslesme cizgisi: secilen adaydan merkeze ──
    const linkMat = new THREE.LineBasicMaterial({
      color: ACCENT, transparent: true, opacity: 0,
    })
    const linkGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(), new THREE.Vector3(),
    ])
    const link = new THREE.Line(linkGeo, linkMat)
    world.add(link)

    // Cizgi uzerinde akan veri paketi
    const packetMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 })
    const packet = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 12), packetMat)
    world.add(packet)

    // Secili adayin etrafindaki halka
    const haloMat = new THREE.MeshBasicMaterial({
      color: ACCENT, transparent: true, opacity: 0, side: THREE.DoubleSide,
    })
    const haloGeo = new THREE.RingGeometry(0.26, 0.32, 32)
    const halo = new THREE.Mesh(haloGeo, haloMat)
    world.add(halo)

    // ── Arka plan yildiz tozu ──
    const dustCount = 110
    const dustPos = new Float32Array(dustCount * 3)
    for (let i = 0; i < dustCount; i++) {
      const rr = 5.5 + Math.random() * 4
      const th = Math.random() * Math.PI * 2
      const ph = Math.acos(2 * Math.random() - 1)
      dustPos[i * 3]     = Math.sin(ph) * Math.cos(th) * rr
      dustPos[i * 3 + 1] = Math.cos(ph) * rr
      dustPos[i * 3 + 2] = Math.sin(ph) * Math.sin(th) * rr
    }
    const dustGeo = new THREE.BufferGeometry()
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3))
    const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
      color: ACCENT, size: 0.055, transparent: true, opacity: 0.45,
    }))
    world.add(dust)

    // ── Fare etkilesimi ──
    let mx = 0, my = 0, tx = 0, ty = 0
    const onMove = (e) => {
      const r = container.getBoundingClientRect()
      mx = ((e.clientX - r.left) / r.width - 0.5) * 2
      my = ((e.clientY - r.top) / r.height - 0.5) * 2
    }
    container.addEventListener('mousemove', onMove)

    // ── Eslesme dongusu ──
    let picked = candidates[0]
    let pickT = 0
    const CYCLE = 2.6

    const pickNew = () => {
      picked.userData.target = 0
      picked = candidates[Math.floor(Math.random() * candidates.length)]
      picked.userData.target = 1
      pickT = 0
    }
    picked.userData.target = 1

    let raf = 0
    const clock = new THREE.Clock()
    const tmp = new THREE.Vector3()

    const animate = () => {
      raf = requestAnimationFrame(animate)
      const dt = Math.min(clock.getDelta(), 0.05)
      const t = clock.getElapsedTime()

      tx += (mx * 0.4 - tx) * 0.045
      ty += (my * 0.28 - ty) * 0.045
      world.rotation.y = t * 0.09 + tx
      world.rotation.x = ty * 0.6

      core.rotation.y = t * 0.35
      core.rotation.x = t * 0.16
      cage.rotation.y = -t * 0.22
      cage.rotation.z = t * 0.11
      const corePulse = 1 + Math.sin(t * 1.6) * 0.045
      core.scale.setScalar(corePulse)
      coreMat.emissiveIntensity = 0.5 + Math.sin(t * 1.6) * 0.16

      pickT += dt
      if (pickT > CYCLE) pickNew()

      // Adaylarin suzulmesi ve aydinlanmasi
      for (const c of candidates) {
        const u = c.userData
        u.lit += (u.target - u.lit) * dt * 5
        const drift = Math.sin(t * 0.55 + u.phase) * 0.13
        tmp.copy(u.base).multiplyScalar(1 + drift * 0.045)
        c.position.copy(tmp)
        c.scale.setScalar(1 + u.lit * 0.85)
        c.material.emissive.setHex(u.lit > 0.03 ? ACCENT : DIM)
        c.material.emissiveIntensity = 0.5 + u.lit * 1.5
        c.material.color.setHex(u.lit > 0.03 ? 0x10b981 : DIM)
      }

      // Eslesme cizgisi ve paket
      const fade = Math.max(0, 1 - pickT / (CYCLE * 0.75))
      const pos = linkGeo.attributes.position
      pos.setXYZ(0, picked.position.x, picked.position.y, picked.position.z)
      pos.setXYZ(1, 0, 0, 0)
      pos.needsUpdate = true
      linkMat.opacity = fade * 0.6

      // Paket adaydan merkeze akar
      const travel = Math.min(1, (pickT % CYCLE) / 1.1)
      packet.position.copy(picked.position).multiplyScalar(1 - travel)
      packetMat.opacity = fade * Math.sin(travel * Math.PI) * 0.95

      // Halo secili adayin uzerinde, kameraya donuk
      halo.position.copy(picked.position)
      halo.lookAt(camera.position)
      const hs = 1 + (1 - fade) * 1.1
      halo.scale.setScalar(hs)
      haloMat.opacity = fade * 0.8

      dust.rotation.y = -t * 0.02

      renderer.render(scene, camera)
    }

    if (reduce) renderer.render(scene, camera)
    else animate()

    const onResize = () => {
      if (!container.clientWidth) return
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }
    const ro = new ResizeObserver(onResize)
    ro.observe(container)

    return () => {
      if (raf) cancelAnimationFrame(raf)
      ro.disconnect()
      container.removeEventListener('mousemove', onMove)
      renderer.dispose()
      coreGeo.dispose(); cageGeo.dispose(); nodeGeo.dispose()
      linkGeo.dispose(); haloGeo.dispose(); dustGeo.dispose()
      coreMat.dispose(); linkMat.dispose(); packetMat.dispose(); haloMat.dispose()
      candidates.forEach(c => c.material.dispose())
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  return <div ref={mountRef} style={{ width: '100%', height: '100%', minHeight: '340px' }} />
}
