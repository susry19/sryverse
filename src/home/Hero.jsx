/* Sahne 01 — Giriş.
   Tek cümle, tek eylem, tek kaydırma ipucu. Sağda seyrek bir nokta alanı
   ve içinde tek bir yeşil sinyal: markanın "fark etme" motifi burada
   başlar, felsefe ve soru sahnelerinde geri döner. */
import { useMemo, useCallback, useRef } from 'react'
import { rnd } from './bits.jsx'

const SIG = 9, NEAR = 15 /* yeşil sinyal ve ona bağlanan komşu */

export default function Hero({ onProducts, onNext }) {
  const ref = useRef(null)
  const pts = useMemo(() => Array.from({ length: 28 }, (_, i) => ({
    x: 50 + rnd(i) * 48, y: 10 + rnd(i + 40) * 80, r: .11 + rnd(i + 80) * .2, o: .22 + rnd(i + 120) * .34,
  })), [])
  const a = pts[SIG], b = pts[NEAR]

  /* masaüstünde alan imleci çok hafif takip eder */
  const onMove = useCallback(e => {
    const el = ref.current; if (!el || window.matchMedia('(max-width: 1023px), (prefers-reduced-motion: reduce)').matches) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--px', ((e.clientX - r.left) / r.width - .5).toFixed(3))
    el.style.setProperty('--py', ((e.clientY - r.top) / r.height - .5).toFixed(3))
  }, [])

  return (
    <section id="baslangic" ref={ref} className="hh" data-theme="dark" aria-labelledby="hh-h" onMouseMove={onMove}>
      <svg className="hh__field" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        {pts.map((q, i) => i !== SIG && <circle key={i} cx={q.x} cy={q.y} r={q.r} style={{ opacity: q.o }} />)}
        <path className="hh__link" d={`M${a.x} ${a.y} C${(a.x + b.x) / 2} ${a.y}, ${(a.x + b.x) / 2} ${b.y}, ${b.x} ${b.y}`} pathLength="1" />
        <circle className="hh__halo" cx={a.x} cy={a.y} r="1.4" />
        <circle className="hh__sig" cx={a.x} cy={a.y} r=".34" />
      </svg>

      <div className="hh__in">
        <p className="hh__eye"><span>SRYVERSE</span><i aria-hidden="true" /><span>Yapay zekâ · Veri · Karar sistemleri</span></p>
        <h1 id="hh-h" className="hh__h">Fark edilmeyeni <em>fark eden</em><br className="br-d" /> sistemler kuruyoruz.</h1>
        <p className="hh__lead">Sinyalleri gören, ilişkileri anlayan ve kararı kolaylaştıran ürünler tasarlıyoruz.</p>
        <a href="#urunler" className="h-cta" onClick={e => { e.preventDefault(); onProducts() }}>Ürünleri keşfedin<span aria-hidden="true">→</span></a>
      </div>

      <a href="#sorun" className="hh__cue" onClick={e => { e.preventDefault(); onNext() }}>
        <span className="hh__cue-line" aria-hidden="true"><i /></span>Kaydırın
      </a>
    </section>)
}
