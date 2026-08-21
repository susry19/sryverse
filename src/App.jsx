import { useState, useEffect, useRef, useCallback } from 'react'
import Background from './Background.jsx'
import Terminal from './Terminal.jsx'
import SkillMatchPage from './SkillMatchPage.jsx'
import EstateMatchPage from './EstateMatchPage.jsx'
import ProductShowcase from './ProductShowcase.jsx'
import SiteAssistant from './SiteAssistant.jsx'
import useRoute from './useRoute.js'
import './App.css'

/* ── hooks ── */
function useReveal(threshold = 0.1) {
  const ref = useRef(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true) }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, v]
}

/* ── Intel Flow — canlı döngü animasyonu ── */
function IntelFlow() {
  const [ref, v] = useReveal(0.2)
  const [active, setActive] = useState(0)
  const steps = [
    {id:'01',tr:'Gözlemle',en:'Observe'},
    {id:'02',tr:'Modelle',en:'Model'},
    {id:'03',tr:'Optimize Et',en:'Optimize'},
    {id:'04',tr:'Otomatize',en:'Automate'},
    {id:'05',tr:'Ölçeklendir',en:'Scale'},
  ]
  useEffect(() => {
    if (!v) return
    const t = setInterval(() => setActive(a => (a + 1) % steps.length), 2200)
    return () => clearInterval(t)
  }, [v, steps.length])

  return (
    <div ref={ref} className={`iflow${v?' iflow--on':''}`}>
      <div className="iflow__scan" />
      {steps.map((s,i) => (
        <div key={s.id} className={`fn${i===active?' fn--active':''}${i<active?' fn--done':''}`}>
          <div className="fn__c">
            <span>{s.id}</span>
            <div className="fn__ring" />
          </div>
          {i < steps.length-1 && (
            <div className="fn__line">
              <div className="fn__fill" style={{width: i<active ? '100%' : i===active ? '100%' : '0%', transitionDuration: i===active ? '2.2s' : '.3s'}}/>
            </div>
          )}
          <div className="fn__txt"><b>{s.tr}</b></div>
        </div>
      ))}
    </div>
  )
}

/* ── Live Ticker — sürekli artan canlı sayaçlar ── */
const TICK_ITEMS = [
  {id:'t0', label:'Global AI Kullanımı /dk', color:'#22c55e', base:5154277, step:()=>Math.floor(Math.random()*2200+400), fmt:v=>Math.floor(v).toLocaleString('tr-TR')},
  {id:'t1', label:'İşlenen CV /sn',          color:'#3b82f6', base:933.1,   step:()=>Math.random()*.7+.1,               fmt:v=>v.toFixed(1)},
  {id:'t2', label:'Mülk Eşleşmesi /gün',     color:'#a78bfa', base:15444,   step:()=>Math.floor(Math.random()*14+2),    fmt:v=>Math.floor(v).toLocaleString('tr-TR')},
  {id:'t3', label:'Otomasyon Kararı /sn',    color:'#f59e0b', base:2368.8,  step:()=>Math.random()*.5+.1,               fmt:v=>v.toFixed(1)},
]
function LiveTicker() {
  const vals = useRef(TICK_ITEMS.map(i=>i.base))
  const [display, setDisplay] = useState(TICK_ITEMS.map((i,idx)=>i.fmt(vals.current[idx])))
  const [pulse, setPulse] = useState(0)

  useEffect(() => {
    const t = setInterval(() => {
      TICK_ITEMS.forEach((item,i) => { vals.current[i] += item.step() })
      setDisplay(TICK_ITEMS.map((item,i) => item.fmt(vals.current[i])))
      setPulse(p => p + 1)
    }, 300)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="lticker">
      <div className="lticker__badge"><span className="lticker__reddot"/>CANLI VERİ AKIŞI</div>
      <div className="lticker__grid">
        {TICK_ITEMS.map((item,i) => (
          <div key={item.id} className="ltick glass">
            <div className="ltick__top">
              <span className="ltick__dot" style={{background:item.color, animationDelay:`${i*.3}s`}}/>
              <span className="ltick__lbl">{item.label}</span>
            </div>
            <span key={pulse + '-' + i} className="ltick__val">{display[i]}</span>
            <div className="ltick__bar"><div className="ltick__barfill" style={{background:item.color}}/></div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Metodoloji — otomatik akan süreç sahnesi ── */
const METHOD_STEPS = [
  {id:'01',name:'Gözlemle',  en:'OBSERVE',  desc:'İş akışlarını ve operasyonel darboğazları tespit et. Süreç, veri olmadan görünmez.'},
  {id:'02',name:'Modelle',   en:'MODEL',    desc:'Süreci veri yapılarına ve ölçülebilir modellere dönüştür. Ölçemediğini yönetemezsin.'},
  {id:'03',name:'Optimize Et',en:'OPTIMIZE',desc:'Kritik karar noktalarını ve verimsizlikleri belirle. Her saniye bir maliyettir.'},
  {id:'04',name:'Otomatize', en:'AUTOMATE', desc:'Tekrarlayan, yüksek hacimli görevleri AI ile devral. İnsan stratejiye odaklansın.'},
  {id:'05',name:'Ölçeklendir',en:'SCALE',   desc:'SaaS platformu olarak deploy et ve büyü. Sistem, kurulduğu günden büyüktür.'},
]
function Method() {
  const [ref, v] = useReveal(0.25)
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    if (!v || paused) return
    const t = setInterval(() => setActive(a => (a + 1) % METHOD_STEPS.length), 3400)
    return () => clearInterval(t)
  }, [v, paused])
  const s = METHOD_STEPS[active]
  return (
    <div ref={ref} className={`method${v?' method--on':''}`} onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)}>
      <div className="method__stage" key={active}>
        <span className="method__bignum">{s.id}</span>
        <span className="method__en">{s.en}</span>
        <h3 className="method__name">{s.name}</h3>
        <p className="method__desc">{s.desc}</p>
      </div>
      <div className="method__list">
        {METHOD_STEPS.map((m,i) => (
          <button key={m.id} className={`mrow${i===active?' mrow--on':''}${i<active?' mrow--done':''}`} onClick={()=>setActive(i)}>
            <span className="mrow__id">{m.id}</span>
            <span className="mrow__name">{m.name}</span>
            <span className="mrow__en">{m.en}</span>
            <div className="mrow__track">
              {i===active && !paused && v && <div className="mrow__progress" key={active}/>}
              {(i<active || (i===active && paused)) && <div className="mrow__progress mrow__progress--full"/>}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ── Kimler İçin — animasyonlu ikonlar + dönen spot ── */
const CASES = [
  {en:'Recruitment Teams',     tr:'İşe Alım Ekipleri',      desc:'Doğru yeteneği daha hızlı ve daha akıllı işe alın.',
   icon:(on)=>(<svg viewBox="0 0 48 48" className={`cic${on?' cic--on':''}`}><circle className="cic-a" cx="24" cy="16" r="7"/><path className="cic-a" d="M10 40c0-8 6-13 14-13s14 5 14 13"/><path className="cic-b" d="M32 20l4 4 8-9"/></svg>)},
  {en:'Real Estate Agencies',  tr:'Gayrimenkul Acenteleri', desc:'Mülkleri, müşterileri ve fırsatları eşleştirin.',
   icon:(on)=>(<svg viewBox="0 0 48 48" className={`cic${on?' cic--on':''}`}><path className="cic-a" d="M8 22L24 8l16 14"/><path className="cic-a" d="M12 20v20h24V20"/><rect className="cic-b" x="20" y="28" width="8" height="12"/></svg>)},
  {en:'HR Departments',        tr:'İnsan Kaynakları',       desc:'İnsan verilerini stratejik içgörülere dönüştürün.',
   icon:(on)=>(<svg viewBox="0 0 48 48" className={`cic${on?' cic--on':''}`}><circle className="cic-a" cx="16" cy="18" r="5"/><circle className="cic-a" cx="32" cy="18" r="5"/><path className="cic-a" d="M6 38c0-6 4-10 10-10M42 38c0-6-4-10-10-10"/><path className="cic-b" d="M20 32h8M24 28v8"/></svg>)},
  {en:'Operations Teams',      tr:'Operasyon Ekipleri',     desc:'İş akışlarını otomatize edin, sürtüşmeyi azaltın.',
   icon:(on)=>(<svg viewBox="0 0 48 48" className={`cic${on?' cic--on':''}`}><circle className="cic-spin" cx="24" cy="24" r="9"/><path className="cic-a" d="M24 11V5M24 43v-6M37 24h6M5 24h6M33.5 14.5l4-4M10.5 37.5l4-4M33.5 33.5l4 4M10.5 10.5l4 4"/><circle className="cic-b" cx="24" cy="24" r="3"/></svg>)},
  {en:'Business Analysts',     tr:'İş Analistleri',         desc:'Veriyi AI yardımıyla kararlara dönüştürün.',
   icon:(on)=>(<svg viewBox="0 0 48 48" className={`cic${on?' cic--on':''}`}><path className="cic-a" d="M8 40h34M8 40V8"/><rect className="cic-bar cic-bar1" x="14" y="26" width="6" height="14"/><rect className="cic-bar cic-bar2" x="24" y="18" width="6" height="22"/><rect className="cic-bar cic-bar3" x="34" y="10" width="6" height="30"/></svg>)},
  {en:'Transformation Leaders',tr:'Dönüşüm Liderleri',      desc:'Geleceğin akıllı organizasyonunu inşa edin.',
   icon:(on)=>(<svg viewBox="0 0 48 48" className={`cic${on?' cic--on':''}`}><path className="cic-a" d="M10 38c2-14 12-24 28-28"/><path className="cic-b" d="M28 8h10v10"/><circle className="cic-a" cx="10" cy="38" r="3"/></svg>)},
]
function UseCases() {
  const [ref, v] = useReveal(0.15)
  const [spot, setSpot] = useState(0)
  useEffect(() => {
    if (!v) return
    const t = setInterval(() => setSpot(s => (s + 1) % CASES.length), 2400)
    return () => clearInterval(t)
  }, [v])
  return (
    <div ref={ref} className={`cgrid${v?' cgrid--on':''}`}>
      {CASES.map((c,i) => (
        <div key={i} className={`ccard glass${i===spot?' ccard--spot':''}`} style={{transitionDelay: v?`${i*.08}s`:'0s'}} onMouseEnter={()=>setSpot(i)}>
          <div className="ccard__shine"/>
          <div className="ccard__beam"/>
          <div className="ccard__icon">{c.icon(i===spot)}</div>
          <span className="ccard__en" lang="en">{c.en}</span>
          <h4 className="ccard__tr">{c.tr}</h4>
          <p className="ccard__desc">{c.desc}</p>
        </div>
      ))}
    </div>
  )
}

/* ── Contact Form ── */
function ContactForm() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const submit = e => { e.preventDefault(); setLoading(true); setTimeout(()=>{setLoading(false);setSent(true)},900) }
  if (sent) return (
    <div className="form-ok glass">
      <div className="form-ok__icon">✓</div>
      <p className="form-ok__title">Mesajınız alındı.</p>
      <p className="form-ok__sub">24 saat içinde dönüş yapacağız.</p>
    </div>
  )
  return (
    <form className="cform glass" onSubmit={submit}>
      <div className="cform__row">
        <div className="cf"><label>Ad Soyad</label><input type="text" placeholder="Adınız" required /></div>
        <div className="cf"><label>Şirket</label><input type="text" placeholder="Şirket adı" required /></div>
      </div>
      <div className="cf"><label>E-posta</label><input type="email" placeholder="isim@sirket.com" required /></div>
      <div className="cf">
        <label>İlgilendiğiniz Ürün</label>
        <select required defaultValue="">
          <option value="" disabled>Seçiniz</option>
          <option>SkillMatch AI</option><option>EstateMatch AI</option><option>Özel çözüm</option>
        </select>
      </div>
      <div className="cf"><label>Mesaj</label><textarea rows="4" placeholder="Operasyonunuzu veya dönüştürmek istediğiniz süreci anlatın..." required /></div>
      <button type="submit" className={`cform__btn${loading?' cform__btn--loading':''}`} disabled={loading}>
        {loading ? 'Gönderiliyor...' : 'Demo Talep Et →'}
      </button>
    </form>
  )
}

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

/* ══════════════ MAIN ══════════════ */
export default function App() {
  const [scrollY, setScrollY] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [page, setPage] = useRoute()
  const [heroRef, heroOn] = useReveal(0.05)

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const go = useCallback((target) => {
    setMenuOpen(false)
    if (target === 'vision') { setPage('vision'); return }
    if (page !== 'home') {
      setPage('home')
      requestAnimationFrame(() => requestAnimationFrame(() => {
        document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' })
      }))
    } else {
      document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [page])

  const nav = [
    {label:'Ürünler',    target:'#products'},
    {label:'Metodoloji', target:'#methodology'},
    {label:'Çözümler',   target:'#usecases'},
    {label:'Vizyon',     target:'vision'},
    {label:'İletişim',   target:'#contact'},
  ]

  return (
    <div className="site">
      
      {/* Homepage original 2D canvas background */}
      {page === 'home' && (
        <Background density={1} boost={0.62} />
      )}

      {/* HEADER */}
      <header className={`hdr${scrollY>30?' hdr--solid':''}${page==='vision' || page==='skillmatch' ? ' hdr--dark' : ''}`}>
        <div className="hdr__in">
          <a href="/" className="hdr__logo" onClick={e=>{e.preventDefault(); setPage('home'); window.scrollTo({top:0,behavior:'smooth'})}}>
            <img src={page==='vision' || page==='skillmatch' ? '/sryverse-badge-white.png' : '/sryverse-badge.png'} alt="SRYVERSE" className="hdr__badge" />
            <span className="hdr__wordwrap">
              <span className="hdr__word">SRYVERSE</span>
              <span className="hdr__tag" lang="en">Digital Transformation &amp; AI</span>
            </span>
          </a>
          <nav className={`hdr__nav${menuOpen?' hdr__nav--open':''}`}>
            {nav.map(n => <a key={n.label} href={n.target==='vision'?'/vizyon':n.target} className={`nlink${(n.target==='vision'&&page==='vision') ? ' nlink--cur' : ''}`} onClick={e=>{e.preventDefault(); go(n.target)}}>{n.label}</a>)}
          </nav>
          <div className="hdr__act">
            <a href="#products" className="hbtn hbtn--g" onClick={e=>{e.preventDefault(); go('#products')}}>Ürünleri Keşfet</a>
            <a href="#contact" className="hbtn hbtn--s" onClick={e=>{e.preventDefault(); go('#contact')}}>Demo Al →</a>
          </div>
          <button className={`burger${menuOpen?' burger--x':''}`} onClick={()=>setMenuOpen(!menuOpen)} aria-label="Menü">
            <span/><span/><span/>
          </button>
        </div>
      </header>

      {page === 'vision' ? (
        <VisionPage />
      ) : page === 'skillmatch' ? (
        <SkillMatchPage
          goBack={() => setPage('home')}
          onDemo={() => { setPage('home'); requestAnimationFrame(() => requestAnimationFrame(() => {
            document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })
          })) }}
        />
      ) : page === 'estatematch' ? (
        <EstateMatchPage
          goBack={() => setPage('home')}
          onDemo={() => { setPage('home'); requestAnimationFrame(() => requestAnimationFrame(() => {
            document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })
          })) }}
        />
      ) : (
      <main>

        {/* HERO */}
        <section className="hero" ref={heroRef}>
          <div className="hero__veil" />
          <div className="wrap hero__in">
            <div className={`hero__content${heroOn?' hero__content--on':''}`}>
              <div className="hero__eye">
                <span className="edot"/>
                Operasyonel Zeka × Üretken AI × Sınırsız Ölçek
              </div>
              <h1 className="hero__h1">
                Operasyonel Karmaşıklıktan<br/>
                <em>Akıllı Sistem Çözümlerine.</em>
              </h1>
              <p className="hero__sub">
                İş süreçlerindeki darboğazları tespit eder, sistemleştirir ve yapay zeka destekli ürünlerle ölçeklenebilir çözümlere dönüştürürüz.
              </p>
              <div className="hero__ctas">
                <a href="#products" className="btn btn--p" onClick={e=>{e.preventDefault(); go('#products')}}>Ekosistemi Keşfet <span>→</span></a>
                <a href="#contact" className="btn btn--ghost" onClick={e=>{e.preventDefault(); go('#contact')}}>Demo Talep Et <span>→</span></a>
              </div>
              <IntelFlow />
            </div>
            <div className={`hero__side${heroOn?' hero__side--on':''}`}>
              <Terminal compact />
            </div>
          </div>
          <div className="scroll-hint"><div className="scroll-line"/></div>
        </section>

        {/* LIVE TICKER */}
        <LiveTicker />

        {/* PRODUCTS — scroll güdümlü kart rafı + akan tanıtım */}
        <ProductShowcase onDemo={() => go('#contact')} onOpenPage={(key) => setPage(key)} />

        {/* METHODOLOGY */}
        <section className="sec sec--tint" id="methodology">
          <div className="wrap">
            <div className="sec__head fade-up">
              <span className="elabel">Metodoloji</span>
              <h2 className="sec__h2">Karmaşıklıktan<br/><em>ölçekte netliğe.</em></h2>
            </div>
            <Method />
          </div>
        </section>

        {/* USE CASES */}
        <section className="sec" id="usecases">
          <div className="wrap">
            <div className="sec__head fade-up">
              <span className="elabel">Kimler İçin</span>
              <h2 className="sec__h2">Karmaşık operasyon<br/><em>yürüten ekipler için.</em></h2>
            </div>
            <UseCases />
          </div>
        </section>

        {/* CONTACT */}
        <section className="sec sec--tint" id="contact">
          <div className="wrap cgrid2">
            <div className="fade-up">
              <span className="elabel">Sistemi Kuralım</span>
              <h2 className="contact__h2">Bir sonraki akıllı iş akışınızı <em>birlikte mühendisleyelim.</em></h2>
              <p className="contact__note">Sürecinizi anlatın — darboğazı bulalım, sistemi tasarlayalım, otomasyonu kuralım.</p>
              <div className="contact__meta">
                <div><span className="mlbl">Yaklaşım</span><span className="mval">Analiz → Tasarım → Otomasyon</span></div>
                <div><span className="mlbl">Yanıt Süresi</span><span className="mval">24 saat</span></div>
                <div><span className="mlbl">Ekosistem</span><span className="mval">sryverse.com</span></div>
              </div>
              <a className="wa-btn" href="https://wa.me/905315178170?text=Merhaba%2C%20SRYVERSE%20%C3%BCr%C3%BCnleri%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum." target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35zM12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88 2.64 0 5.13 1.03 7 2.9a9.82 9.82 0 0 1 2.9 7c0 5.45-4.45 9.87-9.91 9.87zm8.43-18.3A11.8 11.8 0 0 0 12.05 0C5.5 0 .16 5.33.16 11.89c0 2.1.55 4.14 1.59 5.94L.06 24l6.33-1.66a11.88 11.88 0 0 0 5.66 1.44h.01c6.55 0 11.89-5.33 11.89-11.89 0-3.18-1.24-6.16-3.47-8.4z"/></svg>
                WhatsApp'tan Ulaşın
              </a>
            </div>
            <div className="fade-up" style={{animationDelay:'0.15s'}}><ContactForm /></div>
          </div>
        </section>

      </main>
      )}

      <SiteAssistant />

      <a className="wa-fab" href="https://wa.me/905315178170?text=Merhaba%2C%20SRYVERSE%20%C3%BCr%C3%BCnleri%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum." target="_blank" rel="noopener noreferrer" aria-label="WhatsApp ile iletişime geçin">
        <span className="wa-fab__label">WhatsApp'tan Yazın</span>
        <span className="wa-fab__circle">
          <svg viewBox="0 0 24 24" width="26" height="26" fill="#fff"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35zM12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88 2.64 0 5.13 1.03 7 2.9a9.82 9.82 0 0 1 2.9 7c0 5.45-4.45 9.87-9.91 9.87zm8.43-18.3A11.8 11.8 0 0 0 12.05 0C5.5 0 .16 5.33.16 11.89c0 2.1.55 4.14 1.59 5.94L.06 24l6.33-1.66a11.88 11.88 0 0 0 5.66 1.44h.01c6.55 0 11.89-5.33 11.89-11.89 0-3.18-1.24-6.16-3.47-8.4z"/></svg>
        </span>
      </a>

      <footer className="footer">
        <div className="wrap footer__in">
          <div className="footer__brand">
            <div className="footer__lockup">
              <img src="/sryverse-badge-white.png" alt="SRYVERSE" className="footer__badge"/>
              <span className="footer__word">SRYVERSE</span>
            </div>
            <p className="footer__tag">Yapay zeka ürünleri için operasyonel zeka.</p>
          </div>
          <div className="footer__links">
            <div className="fcol"><h5>Ürünler</h5>
              <a href="/skillmatch" onClick={e=>{e.preventDefault(); setPage('skillmatch')}}>SkillMatch AI</a>
              <a href="/estatematch" onClick={e=>{e.preventDefault(); setPage('estatematch')}}>EstateMatch AI</a>
              <a href="#products" onClick={e=>{e.preventDefault(); go('#products')}}>Metraj AI <span style={{opacity:.5,fontSize:'.78em'}}>· yakında</span></a>
            </div>
            <div className="fcol"><h5>Şirket</h5>
              <a href="/vizyon" onClick={e=>{e.preventDefault(); go('vision')}}>Vizyon & Misyon</a>
              <a href="#methodology" onClick={e=>{e.preventDefault(); go('#methodology')}}>Metodoloji</a>
              <a href="#contact" onClick={e=>{e.preventDefault(); go('#contact')}}>İletişim</a>
            </div>
            <div className="fcol"><h5>Bağlantı</h5><a href="#">LinkedIn</a><a href="#">GitHub</a></div>
          </div>
        </div>
        <div className="wrap footer__bot">
          <span>© 2026 SRYVERSE. Tüm hakları saklıdır.</span>
          <span className="footer__mono">Geleceğin işletim sistemi.</span>
        </div>
      </footer>

    </div>
  )
}
