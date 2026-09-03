import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react'
import Background from './Background.jsx'
import SiteAssistant from './SiteAssistant.jsx'
import Home from './home/Home.jsx'
import useRoute from './useRoute.js'
import './App.css'

/* Ürün ve vizyon sayfaları ihtiyaç anında yüklenir: three.js ve ürün
   sayfası stilleri ana sayfa paketine girmez. */
const SkillMatchPage = lazy(() => import('./SkillMatchPage.jsx'))
const EstateMatchPage = lazy(() => import('./EstateMatchPage.jsx'))
const EstateFeaturesPage = lazy(() => import('./EstateFeaturesPage.jsx'))

/* ── Vizyon & Misyon sayfası ── */
function VisionPage() {
  useEffect(() => { window.scrollTo(0, 0) }, [])
  return (
    <main className="vpage">
      <section className="vpage__hero">
        <Background density={1} color="120,210,170" boost={0.85} />
        <div className="hero__veil" />
        <div className="wrap vpage__in">
          <span className="elabel elabel--light fade-up">Vizyon & Misyon</span>
          <h1 className="vpage__h1 fade-up" style={{animationDelay:'.1s'}}>
            Araç inşa etmiyoruz.<br/>
            <em>Geleceğin işletim katmanını inşa ediyoruz.</em>
          </h1>
          <p className="vpage__sub fade-up" style={{animationDelay:'.2s'}}>
            SRYVERSE, işletmelerin geleceğin hızında düşünmesine, karar vermesine ve faaliyet göstermesine yardımcı olan işletim altyapısını inşa ediyor.
          </p>
        </div>
      </section>

      <section className="vpage__blocks">
        <div className="wrap vpage__grid">
          <div className="vblock fade-up">
            <span className="vblock__id">01</span>
            <h2 className="vblock__h">Vizyonumuz</h2>
            <p className="vblock__p">Her işletmenin merkezinde, kendi operasyonunu gözlemleyen, öğrenen ve optimize eden bir zeka katmanının olduğu bir gelecek. SRYVERSE, o katmanın kendisi olmayı hedefliyor — tek bir araç değil, işin üzerinde çalıştığı işletim sistemi.</p>
          </div>
          <div className="vblock fade-up" style={{animationDelay:'.12s'}}>
            <span className="vblock__id">02</span>
            <h2 className="vblock__h">Misyonumuz</h2>
            <p className="vblock__p">Karmaşık operasyonları, sistem mühendisliği disipliniyle modellenmiş ve yapay zekayla otomatize edilmiş, ölçeklenebilir SaaS ürünlerine dönüştürmek. Her sektörde, bir seferde bir süreç.</p>
          </div>
        </div>

        <div className="wrap">
          <div className="manifesto">
            {['Karmaşıklığı sadeleştiriyoruz.','Sistemler tasarlıyoruz.','Zekayı otomatize ediyoruz.','Ölçeklenen ürünler inşa ediyoruz.'].map((l,i) => (
              <div key={i} className="manifesto__line fade-up" style={{animationDelay:`${.2+i*.1}s`}}><span>—</span>{l}</div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

/* Tembel yüklenen sayfalar için sessiz yer tutucu: arka planı sayfanın
   kendi temasına yakın tutar, düzen kaymasını önler. */
function PageFallback({ dark }) {
  return <main aria-busy="true" style={{ minHeight: '100vh', background: dark ? '#03130D' : '#F5F3EE' }} />
}

/* ══════════════ MAIN ══════════════ */
export default function App() {
  const [scrollY, setScrollY] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [page, setPage] = useRoute()
  const [homeTheme, setHomeTheme] = useState('dark')

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  /* Mobil menü sözleşmesi: Escape kapatır, odak menü içinde döner,
     gövde kaydırması kilitlenir ve kapanınca geri gelir. */
  const navRef = useRef(null)
  const burgerRef = useRef(null)
  useEffect(() => {
    if (!menuOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const nav = navRef.current
    const odaklanabilir = () => nav ? [...nav.querySelectorAll('a[href],button:not([disabled])')] : []
    const ilk = odaklanabilir()[0]
    if (ilk) ilk.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') { setMenuOpen(false); burgerRef.current?.focus(); return }
      if (e.key !== 'Tab') return
      const list = [...odaklanabilir(), burgerRef.current].filter(Boolean)
      if (!list.length) return
      const i = list.indexOf(document.activeElement)
      if (e.shiftKey && (i <= 0)) { e.preventDefault(); list[list.length - 1].focus() }
      else if (!e.shiftKey && i === list.length - 1) { e.preventDefault(); list[0].focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prevOverflow }
  }, [menuOpen])

  /* Ana sayfa içi hedefe kaydır; başka sayfadaysa önce ana sayfaya dön. */
  const scrollToTarget = useCallback((target) => {
    const el = document.querySelector(target); if (!el) return
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const top = el.getBoundingClientRect().top + window.scrollY
    window.scrollTo({ top, behavior: rm ? 'auto' : 'smooth' })
  }, [])

  const go = useCallback((target) => {
    setMenuOpen(false)
    if (target === 'vision') { setPage('vision'); return }
    if (page !== 'home') {
      setPage('home')
      requestAnimationFrame(() => requestAnimationFrame(() => scrollToTarget(target)))
    } else {
      scrollToTarget(target)
    }
  }, [page, setPage, scrollToTarget])

  const nav = [
    {label:'Ürünler',   target:'#urunler'},
    {label:'Yaklaşım',  target:'#yaklasim'},
    {label:'Vizyon',    target:'vision'},
    {label:'İletişim',  target:'#contact'},
  ]

  const estateNav = [
    {label:'Hikâye',          target:'#hikaye'},
    {label:'Nasıl Çalışır?',  target:'#nasil-calisir'},
    {label:'Kimler İçin?',    target:'#kimler-icin'},
    {label:'Merak Edilenler', target:'#sss'},
    {label:'İletişim',        target:'#iletisim'},
  ]

  const goDemo = useCallback(() => {
    setMenuOpen(false)
    setPage('home')
    requestAnimationFrame(() => requestAnimationFrame(() => scrollToTarget('#contact')))
  }, [setPage, scrollToTarget])

  const goInPage = useCallback((target) => {
    setMenuOpen(false)
    if (target === 'features') { setPage('estatematchFeatures'); return }
    const el = document.querySelector(target); if (!el) return
    const hdrH = document.querySelector('.hdr')?.offsetHeight || 78
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const top = el.getBoundingClientRect().top + window.scrollY - (el.classList.contains('st-anchor') ? 0 : hdrH)
    window.scrollTo({ top, behavior: rm ? 'auto' : 'smooth' })
    /* gezinme sonrası odak: başlık yüksekliği hesaba katılmış hedefe */
    const odak = el.querySelector('h1,h2,[tabindex="-1"]') || el
    if (!odak.hasAttribute('tabindex')) odak.setAttribute('tabindex', '-1')
    window.setTimeout(() => odak.focus({ preventScroll: true }), rm ? 50 : 650)
  }, [setPage])

  const openPage = useCallback((key) => { setMenuOpen(false); setPage(key) }, [setPage])

  const isEstate = page === 'estatematch' || page === 'estatematchFeatures'
  const dark = page === 'vision' || page === 'skillmatch' || (page === 'home' && homeTheme === 'dark')

  return (
    <div className="site">

      {/* HEADER */}
      <header className={`hdr${scrollY>30?' hdr--solid':''}${dark ? ' hdr--dark' : ''}${isEstate ? ' hdr--em' : ''}${page==='home' ? ' hdr--home' : ''}`}>
        <div className="hdr__in">
          <a href="/" className="hdr__logo" onClick={e=>{e.preventDefault(); setPage('home'); window.scrollTo({top:0,behavior:'smooth'})}}>
            <img src={dark ? '/sryverse-badge-white.png' : '/sryverse-badge.png'} alt="SRYVERSE" className="hdr__badge" width="46" height="46" />
            <span className="hdr__wordwrap">
              <span className="hdr__word">SRYVERSE</span>
              <span className="hdr__tag" lang="en">Digital Transformation &amp; AI</span>
            </span>
          </a>
          <nav ref={navRef} id="site-nav" className={`hdr__nav${menuOpen?' hdr__nav--open':''}`} aria-label="Site gezinmesi">
            {page === 'estatematch'
              ? estateNav.map(n => <a key={n.label} href={n.target === 'features' ? '/estatematch/features' : n.target} className="nlink" onClick={e=>{e.preventDefault(); goInPage(n.target)}}>{n.label}</a>)
              : nav.map(n => <a key={n.label} href={n.target==='vision'?'/vizyon':'/'+n.target} className={`nlink${(n.target==='vision'&&page==='vision') ? ' nlink--cur' : ''}`} onClick={e=>{e.preventDefault(); go(n.target)}}>{n.label}</a>)}
          </nav>
          <div className="hdr__act">
            {isEstate ? (
              <a href="/#contact" className="hbtn hbtn--s" onClick={e=>{e.preventDefault(); goDemo()}}>Demo Planla →</a>
            ) : (
              <a href="/#contact" className="hbtn hbtn--s" onClick={e=>{e.preventDefault(); go('#contact')}}>Demo Al →</a>
            )}
          </div>
          <button ref={burgerRef} className={`burger${menuOpen?' burger--x':''}`} onClick={()=>setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Menüyü kapat' : 'Menü'} aria-expanded={menuOpen} aria-controls="site-nav">
            <span/><span/><span/>
          </button>
        </div>
      </header>

      {page === 'vision' ? (
        <VisionPage />
      ) : page === 'skillmatch' ? (
        <Suspense fallback={<PageFallback dark />}>
          <SkillMatchPage goBack={() => setPage('home')} onDemo={goDemo} />
        </Suspense>
      ) : page === 'estatematch' ? (
        <Suspense fallback={<PageFallback />}>
          <EstateMatchPage goBack={() => setPage('home')} onFeatures={() => setPage('estatematchFeatures')} onDemo={goDemo} />
        </Suspense>
      ) : page === 'estatematchFeatures' ? (
        <Suspense fallback={<PageFallback />}>
          <EstateFeaturesPage goBack={() => setPage('estatematch')} onDemo={goDemo} />
        </Suspense>
      ) : (
        <Home go={go} openPage={openPage} onTheme={setHomeTheme} />
      )}

      <SiteAssistant />

      <footer className="footer">
        <div className="wrap footer__in">
          <div className="footer__brand">
            <div className="footer__lockup">
              <img src="/sryverse-badge-white.png" alt="SRYVERSE" className="footer__badge" width="48" height="48"/>
              <span className="footer__word">SRYVERSE</span>
            </div>
            <p className="footer__tag">Daha iyi kararlar için zekâ.</p>
          </div>
          <div className="footer__links">
            <div className="fcol"><h5>Ürünler</h5>
              <a href="/estatematch" onClick={e=>{e.preventDefault(); openPage('estatematch')}}>EstateMatch AI</a>
              <a href="/skillmatch" onClick={e=>{e.preventDefault(); openPage('skillmatch')}}>SkillMatch AI</a>
              <a href="/#metraj-sahne" onClick={e=>{e.preventDefault(); go('#metraj-sahne')}}>Metraj AI <span style={{opacity:.5,fontSize:'.78em'}}>· özel beta</span></a>
            </div>
            <div className="fcol"><h5>Şirket</h5>
              <a href="/#yaklasim" onClick={e=>{e.preventDefault(); go('#yaklasim')}}>Yaklaşım</a>
              <a href="/#methodology" onClick={e=>{e.preventDefault(); go('#methodology')}}>Metodoloji</a>
              <a href="/vizyon" onClick={e=>{e.preventDefault(); go('vision')}}>Vizyon & Misyon</a>
            </div>
            <div className="fcol"><h5>İletişim</h5>
              <a href="https://wa.me/905315178170?text=Merhaba%2C%20SRYVERSE%20%C3%BCr%C3%BCnleri%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum." target="_blank" rel="noopener noreferrer">WhatsApp</a>
              <a href="/#contact" onClick={e=>{e.preventDefault(); go('#contact')}}>Demo talep et</a>
            </div>
          </div>
        </div>
        <div className="wrap footer__bot">
          <span>© 2026 SRYVERSE. Tüm hakları saklıdır.</span>
          <span className="footer__mono">Fark edilmeyeni fark eden sistemler.</span>
          <div className="footer__social">
            <a href="https://www.linkedin.com/company/sryverse" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.2 8h4.6v14.8H.2V8zm7.6 0h4.4v2h.06c.62-1.16 2.12-2.4 4.36-2.4 4.66 0 5.52 3.06 5.52 7.04v8.16h-4.6v-7.24c0-1.72-.04-3.94-2.4-3.94-2.4 0-2.78 1.88-2.78 3.82v7.36H7.8V8z"/></svg>
            </a>
            <a href="https://www.instagram.com/sryverse" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4.5"/><circle cx="17.6" cy="6.4" r="1.2" fill="currentColor" stroke="none"/></svg>
            </a>
            <a href="https://www.youtube.com/@sryverse" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.3 31.3 0 0 0 0 12c0 1.9.2 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1c.3-1.9.5-3.9.5-5.8s-.2-3.9-.5-5.8zM9.6 15.6V8.4L15.8 12l-6.2 3.6z"/></svg>
            </a>
          </div>
        </div>
      </footer>

    </div>
  )
}
