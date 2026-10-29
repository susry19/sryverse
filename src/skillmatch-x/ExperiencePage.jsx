import { memo, useCallback, useEffect, useMemo, useRef, useState, lazy, Suspense, Component } from 'react'
import { usePageSeo } from '../pageParts.jsx'
import Hero from './acts/Hero.jsx'
import Operations from './acts/Operations.jsx'
import Matching from './acts/Matching.jsx'
import Bridge from './ui/Bridge.jsx'
import Rail from './ui/Rail.jsx'
import { Journey } from './lib/journey.js'
import './x.css'

// Ağır sahneler kendi yığınlarında: ön görüşme (Pyodide yalnız başlatınca),
// rapor ve asistan görünür olmadan yüklenmez.
const Voice = lazy(() => import('./acts/Voice.jsx'))
const Insight = lazy(() => import('./acts/Insight.jsx'))

// Yerel SkillMatch kurulumundan, sentetik veriyle alınan ekranlar (arkadan öne)
const SHOTS = {
  need: [{ name: 'dashboard', path: '/', alt: 'SkillMatch Genel Bakış ekranı' }, { name: 'headcount', path: '/headcount', alt: 'SkillMatch Kadro İhtiyaçları ekranı' }, { name: 'approvals', path: '/approvals', alt: 'SkillMatch Onay Merkezi ekranı' }],
  match: [{ name: 'pool-matches', path: '/positions', alt: 'SkillMatch önerilen adaylar ekranı' }, { name: 'match-analysis', path: '/candidates', alt: 'SkillMatch eşleşme analizi penceresi' }],
  voice: [{ name: 'voice-screening-list', path: '/voice-screening', alt: 'SkillMatch AI Ön Görüşme listesi' }, { name: 'voice-screening-detail', path: '/voice-screening', alt: 'SkillMatch AI Ön Görüşme İK özeti' }, { name: 'voice-candidate', path: '/portal/screening', alt: 'SkillMatch aday ön görüşme ekranı' }],
  insight: [{ name: 'reports-dashboard', path: '/analytics', alt: 'SkillMatch Raporlar ekranı' }, { name: 'report-builder', path: '/analytics', alt: 'SkillMatch Özel Rapor oluşturucu' }, { name: 'assistant', path: '/', alt: 'SkillMatch AI Asistan' }],
}

const ACTS = [
  { id: 'acilis', label: 'Açılış' },
  { id: 'ihtiyac', label: 'İhtiyaç' },
  { id: 'onay', label: 'Onay' },
  { id: 'ilan', label: 'İlan ve kilit' },
  { id: 'eslesme', label: 'Eşleşme' },
  { id: 'on-gorusme', label: 'Ön görüşme' },
  { id: 'karar', label: 'Rapor ve asistan' },
]

/* Bir sahne hata verirse sayfanın geri kalanı ayakta kalır */
class Guard extends Component {
  constructor(p) { super(p); this.state = { err: null } }
  static getDerivedStateFromError(err) { return { err } }
  render() {
    if (!this.state.err) return this.props.children
    return <div className="sx-loading" style={{ minHeight: '40vh' }}>Bu sahne yüklenemedi. Sayfayı yenileyerek tekrar deneyin.</div>
  }
}

function Lazy({ id, children, minHeight = '100vh' }) {
  const ref = useRef(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect() } }, { rootMargin: '900px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={ref} id={on ? undefined : id} style={on ? undefined : { minHeight }}>
      {on && <Guard><Suspense fallback={<div id={id} style={{ minHeight }} className="sx-loading">Sahne yükleniyor…</div>}>{children}</Suspense></Guard>}
    </div>
  )
}

function ExperiencePage({ onHome, onClassic }) {
  usePageSeo({
    title: 'SkillMatch — Engineered Serendipity | SRYVERSE',
    description: 'SkillMatch işe alım platformunu deneyimleyin: kadro planı, onay zinciri, gerekçeli AI eşleştirme, sesli AI ön görüşme ve dinamik raporlar — sentetik verilerle, ürünün kendi kurallarıyla.',
    path: '/skillmatch/deneyim',
  })
  // Önizleme: arama motoruna kapalı
  useEffect(() => {
    const m = document.createElement('meta'); m.name = 'robots'; m.content = 'noindex'
    document.head.appendChild(m)
    document.documentElement.classList.add('sx-root')
    const nav = performance.getEntriesByType('navigation')[0]
    if (!nav || nav.type !== 'reload') window.scrollTo(0, 0)
    return () => { m.remove(); document.documentElement.classList.remove('sx-root') }
  }, [])

  const [positionId, setPositionId] = useState(101)
  const [candidateId, setCandidateId] = useState(1)
  const [opened, setOpened] = useState(null)
  const journey = useMemo(() => ({ positionId, setPositionId, candidateId, setCandidateId, opened, setOpened }),
    [positionId, candidateId, opened])

  // Üst çubuk altındaki sahnenin tonuna uyar (koyu sahnede açık, açık sahnede koyu)
  const [light, setLight] = useState(false)
  useEffect(() => {
    let raf = 0
    const f = () => {
      raf = 0
      const el = document.elementFromPoint(window.innerWidth / 2, 40)
      setLight(!!el?.closest('[data-tone="light"]'))
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(f) }
    window.addEventListener('scroll', on, { passive: true }); f()
    return () => window.removeEventListener('scroll', on)
  }, [])

  // Mıknatıslı düğmeler: yalnız ince işaretçide ve hareket azaltılmamışken
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const move = (e) => {
      const el = e.target.closest?.('.sx-magnet')
      document.querySelectorAll('.sx-magnet.is-pulled').forEach((x) => { if (x !== el) { x.classList.remove('is-pulled'); x.style.transform = '' } })
      if (!el) return
      const r = el.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2)
      el.classList.add('is-pulled')
      el.style.transform = `translate(${dx * 0.18}px, ${dy * 0.28}px)`
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [])

  const go = useCallback((id) => {
    const el = document.getElementById(id); if (!el) return
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: rm ? 'auto' : 'smooth' })
  }, [])

  return (
    <Journey.Provider value={journey}>
      <div className="sx">
        <a className="sx-skip" href="#ihtiyac">İçeriğe geç</a>
        <header className={`sx-top${light ? ' sx-top--light' : ''}`}>
          <a href="/" className="sx-top__brand" onClick={(e) => { e.preventDefault(); onHome() }} aria-label="SRYVERSE ana sayfa">
            <img src="/skillmatch-x/skillmatch-logo-light.webp" alt="SkillMatch" width="119" height="20" className="sx-top__logo" />
            <span className="sx-top__by">by SRYVERSE</span>
          </a>
          <nav className="sx-top__nav" aria-label="Sayfa">
            <a href="/skillmatch" onClick={(e) => { e.preventDefault(); onClassic() }}>Ürün sayfası</a>
            <a className="sx-top__cta" href="https://wa.me/905315178170?text=Merhaba%2C%20SkillMatch%20demosu%20talep%20etmek%20istiyorum." target="_blank" rel="noopener noreferrer">Demo talep et</a>
          </nav>
        </header>
        <Rail acts={ACTS} go={go} />
        <main>
          <Hero onEnter={() => go('ihtiyac')} />
          <Bridge kicker="Her şey bir ihtiyaçla başlar" line="Sezon yaklaşıyor. Belek'teki restoranda iki garson eksik."
            shots={SHOTS.need} caption="Gerçek SkillMatch ekranları · yerel kurulum, sentetik veri · Genel Bakış, Kadro İhtiyaçları, Onay Merkezi. Aşağıda aynı kurallar sizin kararlarınızla çalışıyor." />
          <Guard><Operations /></Guard>
          <Bridge kicker="İlan yayında, başvurular geliyor" line="Şimdi soru şu: bu adaylardan hangisi, neden?" dark
            shots={SHOTS.match} caption="Gerçek SkillMatch ekranları · yerel kurulum, sentetik veri · Önerilen adaylar ve “Neden %92?” analizi." />
          <Guard><Matching /></Guard>
          <Bridge kicker="Bir sonraki adım" line="Kâğıt üzerindeki aday, sesiyle de aynı aday mı?" dark deep
            shots={SHOTS.voice} caption="Gerçek SkillMatch ekranları · yerel kurulum, sentetik veri · AI Ön Görüşme listesi, İK özeti ve aday ekranı." />
          <Lazy id="on-gorusme"><Voice /></Lazy>
          <Bridge kicker="Görüşme bitti, karar insanda" line="Karar verilerle verilir. Veriyi siz şekillendirin."
            shots={SHOTS.insight} caption="Gerçek SkillMatch ekranları · yerel kurulum, sentetik veri · Raporlar, Özel Rapor ve AI Asistan." />
          <Lazy id="karar"><Insight /></Lazy>
          <footer className="sx-coda" data-tone="dark">
            <img className="sx-coda__ribbon" src="/skillmatch-x/login-ribbons.webp" alt="" aria-hidden="true" loading="lazy" width="1400" height="770" />
            <div className="sx-wrap">
              <span className="sx-eyebrow sx-eyebrow--on" lang="en">Engineered Serendipity</span>
              <h2 className="sx-coda__h">Doğru kişi, doğru otel,<br />doğru zamanda.</h2>
              <p className="sx-coda__p">Bu sayfadaki tüm veriler sentetiktir; kurallar, akışlar ve hesaplar SkillMatch'in kendisidir. Kendi kadro planınızla görelim.</p>
              <div className="sx-coda__row">
                <a className="sx-btn sx-btn--on sx-magnet" href="https://wa.me/905315178170?text=Merhaba%2C%20SkillMatch%20pilot%20program%C4%B1%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum." target="_blank" rel="noopener noreferrer">Pilot programa katıl <span aria-hidden="true">→</span></a>
                <a className="sx-btn sx-btn--ghost-on" href="https://skillmatch.sryverse.com" target="_blank" rel="noopener noreferrer">Platforma giriş</a>
              </div>
              <p className="sx-coda__fine">© 2026 SkillMatch · by SRYVERSE · Önizleme sürümü</p>
            </div>
          </footer>
        </main>
      </div>
    </Journey.Provider>
  )
}

// Üst kabuk her kaydırmada yeniden çizer; bu sayfa kendi durumunu taşır.
export default memo(ExperiencePage, () => true)
