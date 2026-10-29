import { useEffect, useMemo, useRef, useState } from 'react'
import { createRibbon } from '../world/ribbon.js'
import { createField } from '../world/field.js'
import { useTrack, smooth, clamp01, useReducedMotion, useCompact } from '../lib/scroll.js'
import { rankFor, DEFAULT_WEIGHTS } from '../lib/match.js'
import Kinetic from '../ui/Kinetic.jsx'
import { asset } from '../lib/asset.js'

/* Açılış: ürünün giriş ekranındaki marka şeridi ("Değer, keşfedilmeyi
   bekler.") kaydırmayla çözülür; şeridin merkez çizgisinden doğan
   parçacıklar havuz → aile → kapı → gerekçeli eşleşme olarak eşleştirme
   mantığını sırayla gösterir. */

const STEPS = [
  { at: [0, 0.15], eyebrow: 'Engineered Serendipity', h: 'Değer, keşfedilmeyi bekler.', big: true,
    p: 'SkillMatch, otel zincirlerinde işe alımı kadro planından işe girişe kadar tek akışta yöneten yapay zekâ destekli işe alım platformudur. Bu sayfada ürünü anlatmıyoruz; onu kullanıyorsunuz.' },
  { at: [0.19, 0.36], eyebrow: '01 · Havuz', h: 'Bir sezon, yüzlerce başvuru.',
    p: 'QR kod, kapı başvurusu, kariyer sitesi, referans ve toplu CV yüklemesiyle gelen herkes aynı aday havuzuna düşer.' },
  { at: [0.4, 0.56], eyebrow: '02 · Rol aileleri', h: 'Önce işi tanır.',
    p: 'Garson, resepsiyonist ve kat görevlisi aynı havuzdadır ama aynı aileden değildir. SkillMatch unvanları 15 rol ailesine ayırır; garsona resepsiyon ilanı önerilmez.' },
  { at: [0.6, 0.76], eyebrow: '03 · Kapı', h: 'Sonra kapı.',
    p: 'İş geçmişi alan dışındaysa, zorunlu yetkinliklerin hiçbiri yoksa ya da skor %50 öneri eşiğinin altındaysa aday önerilmez ve nedeni yazılır.' },
  { at: [0.8, 1.01], eyebrow: '04 · Gerekçe', h: 'Ve her eşleşmenin bir kanıtı.',
    p: 'Skor tek başına karar değildir: hangi yetkinlik yetkinlik listesinde, hangisi yalnız CV metninde geçiyor, açıkça yazılır. Bu sayfadaki skorlar SkillMatch\'in kendi eşleştirme koduyla hesaplandı.', cta: true },
]

const THEME = {
  ink: '#DCE6D8', line: 'rgba(220,230,216,.32)', thread0: 'rgba(171,191,172,.08)', thread1: 'rgba(236,241,230,.95)',
  node: '#ECF1E6', nodeInk: '#172B17', label: 'rgba(243,245,241,.82)',
}

export default function Hero({ onEnter }) {
  const track = useRef(null)
  const frameRef = useRef(null)
  const canvasRef = useRef(null)
  const state = useRef({ unravel: 0, progress: 0 })
  const [step, setStep] = useState(0)
  const [live, setLive] = useState(false)
  const reduced = useReducedMotion()
  const compact = useCompact()

  const named = useMemo(() => rankFor(101, DEFAULT_WEIGHTS).map((r, i) => ({
    name: r.c.name, score: r.score, ok: r.elig.ok, rank: i,
  })), [])

  // canlı şerit: yalnız ince işaretçili, hareket azaltılmamış ekranlarda (ürünle aynı kural)
  useEffect(() => {
    if (reduced || compact || !frameRef.current) return
    const stop = createRibbon(frameRef.current, state.current)
    if (stop) setLive(true)
    return () => { stop?.(); setLive(false) }
  }, [reduced, compact])

  // parçacık alanı
  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return
    const field = createField(cv, { count: compact ? 260 : 620, named })
    let raf = 0, visible = true
    const frameRect = () => {
      const r = frameRef.current.getBoundingClientRect(), c = cv.getBoundingClientRect()
      return { x: r.left - c.left, y: r.top - c.top, w: r.width }
    }
    const loop = (t) => {
      raf = requestAnimationFrame(loop)
      if (!visible) return
      const p = reduced ? 1 : state.current.progress
      field.draw(clamp01((p - 0.1) / 0.84), frameRect(), reduced ? 0 : t, THEME)
    }
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting }, { threshold: 0 })
    io.observe(cv)
    const ro = new ResizeObserver(() => field.resize()); ro.observe(cv)
    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect() }
  }, [named, compact, reduced])

  useTrack(track, (p) => {
    state.current.progress = p
    state.current.unravel = smooth((p - 0.05) / 0.17)
    const i = STEPS.findIndex((s) => p >= s.at[0] && p < s.at[1])
    setStep((prev) => (i === -1 ? prev : i))
    if (frameRef.current) {
      const u = state.current.unravel
      frameRef.current.style.setProperty('--u', u.toFixed(3))
    }
  })

  return (
    <section ref={track} className={`sx-hero${reduced ? ' sx-hero--still' : ''}`} id="acilis" data-act="acilis" aria-label="Açılış">
      <div className="sx-hero__stage">
        <div className="sx-hero__light" aria-hidden="true" />
        <div ref={frameRef} className={`sx-hero__ribbon${live ? ' is-live' : ''}`} aria-hidden="true">
          <img src={asset('skillmatch-x/login-ribbons.webp')} alt="" width="1400" height="770" />
        </div>
        <canvas ref={canvasRef} className="sx-hero__field" aria-hidden="true" />
        <div className="sx-hero__copy">
          {(reduced ? STEPS : [STEPS[step]]).map((s, i) => (
            <div key={reduced ? i : step} className={`sx-hero__step${s.big ? ' sx-hero__step--big' : ''}`}>
              <Kinetic as="span" className="sx-eyebrow sx-eyebrow--on" text={s.eyebrow} lang={s.big ? 'en' : undefined} />
              {s.big
                ? <h1 className="sx-hero__h1"><Kinetic text={s.h} delay={120} /></h1>
                : <h2 className="sx-hero__h2"><Kinetic text={s.h} delay={80} /></h2>}
              <p className="sx-hero__p"><Kinetic text={s.p} delay={260} step={14} /></p>
              {s.cta && (
                <button className="sx-btn sx-btn--on sx-magnet" onClick={onEnter}>
                  Süreci başlat <span aria-hidden="true">↓</span>
                </button>
              )}
            </div>
          ))}
        </div>
        {!reduced && (
          <div className="sx-hero__ticks" aria-hidden="true">
            {STEPS.map((s, i) => <i key={i} className={i === step ? 'on' : i < step ? 'done' : ''} />)}
          </div>
        )}
        {!reduced && step === 0 && <div className="sx-hero__hint" aria-hidden="true"><span>Kaydırın</span><i /></div>}
      </div>
    </section>
  )
}
