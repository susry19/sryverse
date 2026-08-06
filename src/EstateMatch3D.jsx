import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * EstateMatch hero sahnesi — soyut kure yerine emlak temali sehir izgarasi.
 *
 * Ne anlatiyor: portfoydeki mulkler (binalar) bir izgara uzerinde durur;
 * sistem bir mulku "eslesme" olarak secip aydinlatir ve o mulke dogru
 * veri isini akar. Yani urunun yaptigi isi birebir gosteriyor.
 */
export default function EstateMatch3D() {
  const mountRef = useRef(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x04121a, 12, 30)

    const camera = new THREE.PerspectiveCamera(
      42, container.clientWidth / container.clientHeight, 0.1, 100
    )
    camera.position.set(0, 6.2, 11)
    camera.lookAt(0, 0.4, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    const ACCENT = 0x38bdf8

    // ── Isiklar ──
    scene.add(new THREE.AmbientLight(0xffffff, 0.45))
    const key = new THREE.DirectionalLight(0xffffff, 0.9)
    key.position.set(6, 10, 6)
    scene.add(key)
    const rim = new THREE.PointLight(ACCENT, 2.2, 26)
    rim.position.set(-4, 5, 4)
    scene.add(rim)

    const world = new THREE.Group()
    scene.add(world)

    // ── Zemin izgarasi ──
    const grid = new THREE.GridHelper(22, 22, ACCENT, 0x0d3548)
    grid.material.transparent = true
    grid.material.opacity = 0.22
    world.add(grid)

    // ── Binalar ──
    const COLS = 7, ROWS = 7, GAP = 1.55
    const buildings = []
    const boxGeo = new THREE.BoxGeometry(1, 1, 1)

    for (let i = 0; i < COLS; i++) {
      for (let j = 0; j < ROWS; j++) {
        // Merkeze yakin binalar daha yuksek — sehir silueti hissi
        const cx = i - (COLS - 1) / 2
        const cz = j - (ROWS - 1) / 2
        const distance = Math.hypot(cx, cz)
        const base = Math.max(0.45, 2.9 - distance * 0.42)
        const h = base * (0.6 + Math.random() * 0.85)

        const mat = new THREE.MeshPhongMaterial({
          color: 0x0e2c3c,
          emissive: 0x061c28,
          shininess: 55,
          transparent: true,
          opacity: 0.92,
        })
        const mesh = new THREE.Mesh(boxGeo, mat)
        mesh.scale.set(0.72, h, 0.72)
        mesh.position.set(cx * GAP, h / 2, cz * GAP)
        mesh.userData = { h, lit: 0, phase: Math.random() * Math.PI * 2 }
        world.add(mesh)
        buildings.push(mesh)

        // Bina tepesinde ince isik cizgisi
        const edge = new THREE.Mesh(
          boxGeo,
          new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.16 })
        )
        edge.scale.set(0.74, 0.035, 0.74)
        edge.position.set(cx * GAP, h + 0.02, cz * GAP)
        edge.userData = { owner: mesh }
        world.add(edge)
        mesh.userData.edge = edge
      }
    }

    // ── Eslesme isini: secilen binaya inen dikey huzme ──
    const beamGeo = new THREE.CylinderGeometry(0.055, 0.055, 7, 8, 1, true)
    const beamMat = new THREE.MeshBasicMaterial({
      color: ACCENT, transparent: true, opacity: 0, side: THREE.DoubleSide,
    })
    const beam = new THREE.Mesh(beamGeo, beamMat)
    world.add(beam)

    // Secili binanin etrafindaki halka
    const ringGeo = new THREE.RingGeometry(0.62, 0.72, 40)
    const ringMat = new THREE.MeshBasicMaterial({
      color: ACCENT, transparent: true, opacity: 0, side: THREE.DoubleSide,
    })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.rotation.x = -Math.PI / 2
    world.add(ring)

    // ── Suzulen veri noktalari ──
    const dotCount = 90
    const dotPos = new Float32Array(dotCount * 3)
    for (let i = 0; i < dotCount; i++) {
      dotPos[i * 3]     = (Math.random() - 0.5) * 16
      dotPos[i * 3 + 1] = Math.random() * 7 + 0.5
      dotPos[i * 3 + 2] = (Math.random() - 0.5) * 16
    }
    const dotGeo = new THREE.BufferGeometry()
    dotGeo.setAttribute('position', new THREE.BufferAttribute(dotPos, 3))
    const dots = new THREE.Points(dotGeo, new THREE.PointsMaterial({
      color: ACCENT, size: 0.075, transparent: true, opacity: 0.55,
    }))
    world.add(dots)

    // ── Fare etkilesimi ──
    let mx = 0, my = 0, tx = 0, ty = 0
    const onMove = (e) => {
      const r = container.getBoundingClientRect()
      mx = ((e.clientX - r.left) / r.width - 0.5) * 2
      my = ((e.clientY - r.top) / r.height - 0.5) * 2
    }
    container.addEventListener('mousemove', onMove)

    // ── Eslesme dongusu: her ~2.4 sn yeni bir mulk secilir ──
    let picked = buildings[Math.floor(Math.random() * buildings.length)]
    let pickT = 0

    const pickNew = () => {
      picked.userData.target = 0
      picked = buildings[Math.floor(Math.random() * buildings.length)]
      picked.userData.target = 1
      beam.position.set(picked.position.x, 3.5 + picked.userData.h / 2, picked.position.z)
      ring.position.set(picked.position.x, 0.03, picked.position.z)
      pickT = 0
    }
    picked.userData.target = 1
    beam.position.set(picked.position.x, 3.5 + picked.userData.h / 2, picked.position.z)
    ring.position.set(picked.position.x, 0.03, picked.position.z)

    let raf = 0
    const clock = new THREE.Clock()

    const animate = () => {
      raf = requestAnimationFrame(animate)
      const dt = Math.min(clock.getDelta(), 0.05)
      const t = clock.getElapsedTime()

      // Yumusak kamera takibi
      tx += (mx * 0.34 - tx) * 0.045
      ty += (my * 0.16 - ty) * 0.045
      world.rotation.y = t * 0.055 + tx
      world.rotation.x = ty * 0.5

      // Eslesme dongusu
      pickT += dt
      if (pickT > 2.4) pickNew()

      // Binalarin aydinlanmasi
      for (const b of buildings) {
        const target = b.userData.target || 0
        b.userData.lit += (target - b.userData.lit) * dt * 5
        const lit = b.userData.lit
        b.material.emissive.setHex(lit > 0.02 ? 0x0a4d68 : 0x061c28)
        b.material.emissiveIntensity = 0.4 + lit * 1.6
        if (b.userData.edge) {
          b.userData.edge.material.opacity = 0.16 + lit * 0.75
        }
        // Hafif nefes alma
        const breathe = Math.sin(t * 0.7 + b.userData.phase) * 0.012
        b.scale.y = b.userData.h + breathe
        b.position.y = (b.userData.h + breathe) / 2
      }

      // Isin ve halka: secim aninda parla, sonra sonumlen
      const pulse = Math.max(0, 1 - pickT / 1.5)
      beamMat.opacity = pulse * 0.28
      ringMat.opacity = pulse * 0.75
      const rs = 1 + (1 - pulse) * 0.9
      ring.scale.set(rs, rs, rs)

      // Veri noktalari yavasca yukselir
      const arr = dotGeo.attributes.position.array
      for (let i = 0; i < dotCount; i++) {
        arr[i * 3 + 1] += dt * 0.28
        if (arr[i * 3 + 1] > 7.5) arr[i * 3 + 1] = 0.4
      }
      dotGeo.attributes.position.needsUpdate = true

      renderer.render(scene, camera)
    }

    if (reduce) {
      renderer.render(scene, camera)
    } else {
      animate()
    }

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
      boxGeo.dispose(); beamGeo.dispose(); ringGeo.dispose(); dotGeo.dispose()
      buildings.forEach(b => { b.material.dispose(); b.userData.edge?.material.dispose() })
      beamMat.dispose(); ringMat.dispose()
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  return <div ref={mountRef} style={{ width: '100%', height: '100%', minHeight: '340px' }} />
}
