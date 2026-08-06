import { useState, useEffect, useRef, useCallback } from 'react'
import CardCanvas from './CardCanvas.jsx'
import ShowcaseWeb from './ShowcaseWeb.jsx'
import SkillStory from './stories/SkillStory.jsx'
import EstateStory from './stories/EstateStory.jsx'
import MetrajStory from './stories/MetrajStory.jsx'
import './ProductShowcase.css'

const PRODUCTS = [
  {
    key: 'skill',
    name: 'SkillMatch AI',
    category: 'Recruitment Intelligence',
    desc: 'İşe alım süreçlerindeki karmaşıklığı çözen AI platformu — CV analizi, darboğaz tespiti ve aday eşleştirme.',
    url: 'https://skillmatch.sryverse.com',
    rgb: '52, 211, 153',      // zümrüt
    Story: SkillStory,
  },
  {
    key: 'estate',
    name: 'EstateMatch AI',
    category: 'Real Estate Intelligence',
    desc: 'Gayrimenkul operasyonlarını sistemleştiren AI platformu — portföy yönetimi, akıllı eşleştirme ve müşteri zekası.',
    url: 'https://estate.sryverse.com',
    rgb: '56, 189, 248',      // camgöbeği
    Story: EstateStory,
  },
  {
    key: 'metraj',
    name: 'Metraj AI',
    category: 'AI Quantity Surveying',
    desc: 'Mimari projelerden otomatik metraj çıkarma üzerine çalıştığımız yeni ürün.',
    soon: true,
    rgb: '167, 139, 250',     // mor
    Story: MetrajStory,
  },
]

/* İmleci takip eden manyetik kart */
function RailCard({ p, state, index, progress, onJump }) {
  const ref = useRef(null)

  const onMove = useCallback((e) => {
    const el = ref.current
    if (!el || window.matchMedia('(max-width: 900px)').matches) return
    const r = el.getBoundingClientRect()
    const mx = (e.clientX - r.left) / r.width - .5
    const my = (e.clientY - r.top) / r.height - .5
    el.style.setProperty('--mx', `${(e.clientX - r.left).toFixed(0)}px`)
    el.style.setProperty('--my', `${(e.clientY - r.top).toFixed(0)}px`)
    el.style.setProperty('--tilt-x', `${(-my * 9).toFixed(2)}deg`)
    el.style.setProperty('--tilt-y', `${(mx * 11).toFixed(2)}deg`)
  }, [])

  const onLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--tilt-x', '0deg')
    el.style.setProperty('--tilt-y', '0deg')
  }, [])

  const fill = state === 'on' ? progress : state === 'done' ? 1 : 0

  return (
    <button
      ref={ref}
      className={`prcard prcard--${state}${p.soon ? ' prcard--soon' : ''}`}
      style={{ '--pc': p.rgb }}
      onClick={() => onJump(index)}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      aria-current={state === 'on'}
    >
      <div className="prcard__canvas"><CardCanvas variant={p.key} /></div>
      <div className="prcard__sheen" />
      <div className="prcard__ring" />
      <div className="prcard__c">
        <h3 className="prcard__name">{p.name}</h3>
        <span className="prcard__cat" lang="en">{p.category}</span>
        <p className="prcard__desc">{p.desc}</p>
        <span className="prcard__cta">
          {p.soon ? <>Yakında <span>✦</span></> : <>Tanıtımı gör <span>→</span></>}
        </span>
        <div className="prcard__prog">
          <div className="prcard__progfill" style={{ width: `${fill * 100}%` }} />
        </div>
      </div>
    </button>
  )
}

export default function ProductShowcase({ onDemo }) {
  const [active, setActive] = useState(0)
  const [progress, setProgress] = useState(0)
  const [overall, setOverall] = useState(0)
  const [flash, setFlash] = useState(0)      // ürün değişiminde tetiklenen dalga

  const unitRefs = useRef([])
  const stageRef = useRef(null)
  const railRef = useRef(null)
  const storyRef = useRef(null)
  const lastActive = useRef(0)

  /* Scroll ile aktif ürünü ve ilerlemeyi hesapla */
  useEffect(() => {
    let raf = 0

    const measure = () => {
      raf = 0
      const mid = window.innerHeight * 0.42
      let current = 0
      let ratio = 0

      unitRefs.current.forEach((el, i) => {
        if (!el) return
        const r = el.getBoundingClientRect()
        if (r.top <= mid && r.bottom > mid) {
          current = i
          ratio = Math.min(1, Math.max(0, (mid - r.top) / r.height))
        } else if (r.bottom <= mid) {
          current = Math.max(current, Math.min(i + 1, PRODUCTS.length - 1))
        }
      })

      setActive(current)
      setProgress(ratio)

      if (current !== lastActive.current) {
        lastActive.current = current
        setFlash(f => f + 1)
      }

      const stage = stageRef.current
      if (stage) {
        const sr = stage.getBoundingClientRect()
        const total = sr.height - window.innerHeight
        setOverall(total > 0 ? Math.min(1, Math.max(0, -sr.top / total)) : 0)
      }
    }

    const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure) }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const jumpTo = useCallback((i) => {
    const el = unitRefs.current[i]
    if (!el) return
    const top = window.scrollY + el.getBoundingClientRect().top - 130
    window.scrollTo({ top, behavior: 'smooth' })
  }, [])

  const cur = PRODUCTS[active]

  return (
    <section
      className="pshow"
      id="products"
      style={{ '--pc': cur.rgb }}
    >
      {/* Aktif ürünün rengini taşıyan zemin haresi */}
      <div className="pshow__aura" />

      <div className="wrap">
        <div className="sec__head pshow__head fade-up">
          <span className="elabel">Ürün Ekosistemi</span>
          <h2 className="sec__h2">Tek ekosistem.<br /><em>Çok sayıda AI ürünü.</em></h2>
        </div>

        <div className="pshow__stage" ref={stageRef}>
          {/* Karttan sahneye uzanan canlı ağ */}
          <ShowcaseWeb
            anchorRef={railRef}
            targetRef={storyRef}
            rgb={cur.rgb}
            active={active}
          />

          {/* SOL — yapışkan kart rafı */}
          <aside className="pshow__rail" ref={railRef}>
            <div className="prail">
              <div className="prail__spine">
                <div className="prail__spinefill" style={{ height: `${overall * 100}%` }} />
              </div>

              {PRODUCTS.map((p, i) => (
                <RailCard
                  key={p.key}
                  p={p}
                  index={i}
                  state={i === active ? 'on' : i < active ? 'done' : 'idle'}
                  progress={progress}
                  onJump={jumpTo}
                />
              ))}

              <div className="prail__count">
                <span className="prail__cur">{String(active + 1).padStart(2, '0')}</span>
                <span className="prail__sep">/</span>
                <span className="prail__tot">{String(PRODUCTS.length).padStart(2, '0')}</span>
              </div>
            </div>
          </aside>

          {/* SAĞ — akan hikâye */}
          <div className="pshow__story" ref={storyRef}>
            {/* Ürün değişiminde çakan renk dalgası */}
            <div className="pshow__flash" key={flash} />

            <div className="pstory">
              {PRODUCTS.map((p, i) => {
                const Story = p.Story
                return (
                  <div
                    key={p.key}
                    ref={el => { unitRefs.current[i] = el }}
                    style={{ '--pc': p.rgb }}
                  >
                    <Story onDemo={onDemo} />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="pshow__outro" />
    </section>
  )
}
