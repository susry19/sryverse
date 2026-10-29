/* SkillMatch marka şeridi (sonsuzluk işareti).

   Kaynak: skillmatch-ai/backend/static/login-scene.js — ürünün giriş
   ekranındaki canlı şerit. Geometri (lemniskat), renk rampası, poz ve ışık
   değerleri BİREBİR aynıdır; yalnız iki şey eklendi:
     - `unravel` (0..1): kaydırmayla şerit incelir ve uçlarından çözülür;
       World parçacıkları aynı merkez çizgisinden doğar.
     - `centerline2D()`: merkez çizgisinin ekrandaki noktaları (parçacık tohumu).
   Sabit hâl: public/skillmatch-x/login-ribbons.webp (aynı kompozisyon). */

export const VW = 1400, VH = 770
const MARGIN = 0.09, CAM = 9, N = 900, FADE = 0.16, TILT_MAX = 0.06

const FRAG = `
precision mediump float;
varying float vB; varying float vS; varying float vA;
uniform float uExposure;
vec3 ramp(float b) {
  b = clamp(b, 0.0, 1.0);
  vec3 c0 = vec3(5.0, 14.0, 10.0) / 255.0,   c1 = vec3(13.0, 31.0, 22.0) / 255.0;
  vec3 c2 = vec3(34.0, 61.0, 44.0) / 255.0,  c3 = vec3(96.0, 126.0, 98.0) / 255.0;
  vec3 c4 = vec3(176.0, 195.0, 170.0) / 255.0, c5 = vec3(236.0, 241.0, 230.0) / 255.0;
  if (b < 0.20) return mix(c0, c1, b / 0.20);
  if (b < 0.42) return mix(c1, c2, (b - 0.20) / 0.22);
  if (b < 0.66) return mix(c2, c3, (b - 0.42) / 0.24);
  if (b < 0.85) return mix(c3, c4, (b - 0.66) / 0.19);
  return mix(c4, c5, (b - 0.85) / 0.15);
}
void main() {
  if (vA < 0.004) discard;
  vec3 col = ramp(vB * (1.0 - 0.10 * vS * vS) * uExposure);
  float rim = 0.65 * smoothstep(0.95, 0.995, abs(vS)) * clamp((vB - 0.40) * 1.7, 0.0, 1.0);
  col = mix(col, ramp(min(1.0, vB * 1.25 + 0.08) * uExposure), rim);
  float n = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  col += (n - 0.5) * 1.5 / 255.0;
  gl_FragColor = vec4(col * vA, vA);
}`
const VERT = `
attribute vec2 aPos; attribute float aB; attribute float aS; attribute float aA;
varying float vB; varying float vS; varying float vA;
void main() { vB = aB; vS = aS; vA = aA; gl_Position = vec4(aPos, 0.0, 1.0); }`

const U0 = -0.28 * Math.PI, U1 = 1.72 * Math.PI
const REST = { tilt: -0.60, yaw: 0.32, zlift: 0.75, wave: 0, phase: 0, rx: 0, ry: 0 }
const LREST = norm([0.72, 0.48, 0.50])
const LSTART = norm([-0.85, 0.30, 0.25])
function norm(v) { const l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l] }
const ease = (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3)

function centerline(out, n, tilt, yaw, zlift) {
  const ca = Math.cos(tilt), sa = Math.sin(tilt), cb = Math.cos(yaw), sb = Math.sin(yaw)
  for (let i = 0; i < n; i++) {
    const u = U0 + (U1 - U0) * i / (n - 1), su = Math.sin(u), cu = Math.cos(u)
    const d = 1 + su * su
    const x = 2.6 * cu / d, y = 2.0 * su * cu / d, z = zlift * su
    const y1 = ca * y - sa * z, z1 = sa * y + ca * z
    out[i * 3] = cb * x + sb * z1; out[i * 3 + 1] = y1; out[i * 3 + 2] = -sb * x + cb * z1
  }
}

const C = new Float64Array(N * 3), E = new Float64Array(N * 6), B = new Float64Array(N)
function build(pose, L, widthScale) {
  centerline(C, N, pose.tilt, pose.yaw, pose.zlift)
  const cr = Math.cos(pose.rx), sr = Math.sin(pose.rx), cy = Math.cos(pose.ry), sy = Math.sin(pose.ry)
  for (let i = 0; i < N; i++) {
    const a = Math.max(i - 1, 0), b = Math.min(i + 1, N - 1)
    let tx = C[b * 3] - C[a * 3], ty = C[b * 3 + 1] - C[a * 3 + 1], tz = C[b * 3 + 2] - C[a * 3 + 2]
    let l = Math.hypot(tx, ty, tz); tx /= l; ty /= l; tz /= l
    let bx = ty, by = -tx, bz = 0; l = Math.hypot(bx, by); bx /= l; by /= l
    const nx = by * tz - bz * ty, ny = bz * tx - bx * tz, nz = bx * ty - by * tx
    const t = i / (N - 1)
    const th = 0.1 + 1.75 * Math.sin(t * Math.PI * 2) + 0.5 * t + pose.wave * Math.sin(pose.phase + t * Math.PI * 2.2)
    const c = Math.cos(th), s = Math.sin(th)
    const wx = c * bx + s * nx, wy = c * by + s * ny, wz = c * bz + s * nz
    const w = (0.27 + 0.035 * Math.sin(t * 6.5)) * widthScale
    let mx = ty * wz - tz * wy, my = tz * wx - tx * wz, mz = tx * wy - ty * wx
    l = Math.hypot(mx, my, mz); mx /= l; my /= l; mz /= l
    if (mz < 0) { mx = -mx; my = -my; mz = -mz }
    const nl = mx * L[0] + my * L[1] + mz * L[2]
    const rz = 2 * nl * mz - L[2]
    const spec = Math.pow(Math.max(0, rz), 28)
    const fog = Math.min(1, Math.max(0.55, 0.80 + 0.20 * C[i * 3 + 2]))
    B[i] = (0.03 + 0.95 * Math.pow((nl + 1) / 2, 2.1) + 0.38 * spec) * fog
    for (let k = 0; k < 2; k++) {
      const sg = k ? 1 : -1
      const px = C[i * 3] + sg * w * wx, py = C[i * 3 + 1] + sg * w * wy, pz = C[i * 3 + 2] + sg * w * wz
      const py1 = cr * py - sr * pz, pz1 = sr * py + cr * pz
      const px2 = cy * px + sy * pz1, pz2 = -sy * px + cy * pz1
      const o = i * 6 + k * 3
      E[o] = px2; E[o + 1] = py1; E[o + 2] = pz2
    }
  }
}

let FIT = null
function fitFrame() {
  if (FIT) return FIT
  build(REST, LREST, 1)
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
  for (let j = 0; j < N * 2; j++) {
    const f = CAM / (CAM - E[j * 3 + 2]), x = E[j * 3] * f, y = -E[j * 3 + 1] * f
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y)
  }
  const sc = Math.min(VW * (1 - 2 * MARGIN) / (x1 - x0), VH * (1 - 2 * MARGIN) / (y1 - y0))
  FIT = { sc, ox: VW / 2 - (x0 + x1) / 2 * sc, oy: VH / 2 - (y0 + y1) / 2 * sc }
  return FIT
}

/* Merkez çizgisinin dinlenme pozundaki noktaları, VW×VH çerçevesinde.
   World parçacıkları buradan doğar: şerit "çözüldüğünde" aynı yerdedirler. */
export function centerline2D(n) {
  const fit = fitFrame()
  const out = new Float64Array(n * 3)
  centerline(out, n, REST.tilt, REST.yaw, REST.zlift)
  const pts = []
  for (let i = 0; i < n; i++) {
    const z = out[i * 3 + 2], f = CAM / (CAM - z)
    pts.push({ x: out[i * 3] * f * fit.sc + fit.ox, y: -out[i * 3 + 1] * f * fit.sc + fit.oy, z, t: i / (n - 1) })
  }
  return pts
}

/* Canlı şerit. `state.unravel` dışarıdan (kaydırma) yazılır. */
export function createRibbon(frame, state) {
  const canvas = document.createElement('canvas')
  canvas.className = 'sx-ribbon-live'
  canvas.setAttribute('aria-hidden', 'true')
  const gl = canvas.getContext('webgl', { antialias: true, premultipliedAlpha: true, alpha: true })
  if (!gl) return null
  const shader = (type, src) => {
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s)
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null
  }
  const vs = shader(gl.VERTEX_SHADER, VERT), fs = shader(gl.FRAGMENT_SHADER, FRAG)
  if (!vs || !fs) return null
  const prog = gl.createProgram()
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null
  gl.useProgram(prog)

  const STRIDE = 5
  const verts = new Float32Array(N * 2 * STRIDE)
  const vbo = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
  gl.bufferData(gl.ARRAY_BUFFER, verts.byteLength, gl.DYNAMIC_DRAW)
  ;[['aPos', 2, 0], ['aB', 1, 2], ['aS', 1, 3], ['aA', 1, 4]].forEach(([name, size, off]) => {
    const loc = gl.getAttribLocation(prog, name)
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, STRIDE * 4, off * 4)
  })
  const ibo = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo)
  const idx = new Uint16Array((N - 1) * 6)
  const order = new Uint16Array(N - 1), depth = new Float64Array(N - 1)
  const uExposure = gl.getUniformLocation(prog, 'uExposure')
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
  gl.clearColor(0, 0, 0, 0)

  const fit = fitFrame()
  const baseAlpha = new Float32Array(N)
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1), a = Math.min(1, Math.max(0, Math.min(t / FADE, (1 - t) / FADE)))
    baseAlpha[i] = a * a * (3 - 2 * a)
  }

  let W = 0, H = 0
  const resize = () => {
    const r = frame.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2)
    W = Math.max(1, Math.round(r.width * dpr)); H = Math.max(1, Math.round(r.height * dpr))
    if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H }
    gl.viewport(0, 0, W, H)
  }

  const aim = { x: 0, y: 0 }
  const onMove = (e) => { aim.x = e.clientX / window.innerWidth * 2 - 1; aim.y = e.clientY / window.innerHeight * 2 - 1 }
  window.addEventListener('pointermove', onMove, { passive: true })

  const pose = Object.assign({}, REST)
  const look = { x: 0, y: 0 }
  let clock = 0, last = 0, t0 = 0, raf = 0, visible = true

  function draw(now) {
    raf = requestAnimationFrame(draw)
    if (!visible) return
    if (!t0) { t0 = last = now }
    const dt = Math.min(0.05, (now - last) / 1000); last = now
    const real = (now - t0) / 1000
    const un = Math.min(1, Math.max(0, state.unravel || 0))
    if (un >= 0.999) { gl.clear(gl.COLOR_BUFFER_BIT); return }
    clock += dt
    look.x += (aim.x - look.x) * Math.min(1, dt * 2.2)
    look.y += (aim.y - look.y) * Math.min(1, dt * 2.2)
    const intro = ease(real / 3.0)
    const p1 = Math.PI * 2 * clock / 18, p2 = Math.PI * 2 * clock / 23
    pose.wave = 0.22 * intro + 0.5 * un
    pose.phase = p1
    pose.zlift = REST.zlift + 0.07 * Math.sin(p2)
    pose.yaw = REST.yaw + 0.035 * Math.sin(p1)
    pose.tilt = REST.tilt + 0.025 * Math.sin(p2 + 1)
    pose.ry = look.x * TILT_MAX
    pose.rx = look.y * TILT_MAX * 0.7
    const Lnow = norm([LREST[0] + 0.20 * Math.sin(p2), LREST[1] + 0.12 * Math.sin(p1), LREST[2]])
    const L = norm([0, 1, 2].map((k) => LSTART[k] + (Lnow[k] - LSTART[k]) * intro))
    // çözülme: şerit incelir, uçlardan merkeze doğru söner
    build(pose, L, 1 - 0.85 * un)
    const k = W / VW, cut = un * 0.5
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1)
      const edge = Math.min(t, 1 - t)
      const keep = cut <= 0 ? 1 : Math.min(1, Math.max(0, (edge - cut * 0.9) / 0.08))
      const a = baseAlpha[i] * keep * (1 - un * 0.6)
      for (let e = 0; e < 2; e++) {
        const j = i * 2 + e, z = E[j * 3 + 2], f = CAM / (CAM - z)
        const px = (E[j * 3] * f * fit.sc + fit.ox) * k, py = (-E[j * 3 + 1] * f * fit.sc + fit.oy) * k
        const o = j * STRIDE
        verts[o] = px / W * 2 - 1; verts[o + 1] = 1 - py / H * 2
        verts[o + 2] = B[i]; verts[o + 3] = e ? 1 : -1; verts[o + 4] = a
      }
    }
    for (let i = 0; i < N - 1; i++) {
      order[i] = i
      depth[i] = E[i * 6 + 2] + E[i * 6 + 5] + E[i * 6 + 8] + E[i * 6 + 11]
    }
    order.sort((a, b) => depth[a] - depth[b])
    for (let q = 0; q < N - 1; q++) {
      const v = order[q] * 2, o = q * 6
      idx[o] = v; idx[o + 1] = v + 1; idx[o + 2] = v + 2
      idx[o + 3] = v + 1; idx[o + 4] = v + 3; idx[o + 5] = v + 2
    }
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, verts)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.DYNAMIC_DRAW)
    gl.uniform1f(uExposure, 0.18 + 0.82 * intro)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0)
  }

  const ro = new ResizeObserver(resize)
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting }, { threshold: 0 })
  frame.appendChild(canvas)
  resize(); ro.observe(frame); io.observe(frame)
  raf = requestAnimationFrame(draw)
  return () => {
    cancelAnimationFrame(raf); ro.disconnect(); io.disconnect()
    window.removeEventListener('pointermove', onMove)
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    canvas.remove()
  }
}
