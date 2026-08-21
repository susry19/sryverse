import { useState, useEffect, useCallback } from 'react'
import { Rev, ScreenTour, Faq, RoiCalc } from './pageParts.jsx'
import './ProductPage.css'
import './EstateCaseStudy.css'

/* ── Impact: öne çıkan 3 sonuç ── */
const IMPACT_STATS = [
  { tag: 'AI Eşleştirme', tagBg: '#e8f4ee', tagFg: '#0F5132', v: '%87', p: 'Güvenilir mülk–alıcı eşleşmeleri, gerekçesiyle satır satır puanlanır.', lit: 35 },
  { tag: 'İçerik AI', tagBg: '#fef3c7', tagFg: '#92400e', v: '5×', p: 'Tek bir ilan, saniyeler içinde beş hazır paylaşım formatına dönüşür.', lit: 20 },
  { tag: 'İş Akışı', tagBg: '#eff6ff', tagFg: '#1d4ed8', v: '6', p: 'Her fırsat aşamalandırılır, değerlenir ve kapanışa kadar izlenir.', lit: 24 },
]

/* ── Impact: eşleştirme akışı (asamalı, kaydırılmış çubuklar) ── */
const FLOW_LABELS = ['Kriter Toplama', 'AI Skorlama', 'Aday Sıralama', 'Danışman Onayı', 'Müşteri Eşleşmesi']
const FLOW_BARS = [
  { l: 'Alıcı tercihleri', left: '0%', top: 14, w: '37%', bg: '#0F5132' },
  { l: 'Veto → çarpan → taban → bonus', left: '16%', top: 62, w: '44%', bg: '#3f8f68' },
  { l: 'İlk 5, sıralı', left: '38%', top: 110, w: '34%', bg: '#a9d3bd', fg: '#12261d' },
  { l: 'Açıkla ve gönder', left: '64%', top: 14, w: '20%', bg: '#0F5132' },
  { l: 'Onaylandı', left: '80%', top: 62, w: '20%', bg: '#3f8f68' },
]

/* ── Ekran turu ── */
const SCREENS = [
  { key: 'dashboard', n: '01', t: 'Panel',          d: 'Aktif portföy, sıcak müşteri, dönüşüm oranı ve AI öngörüleri tek ekranda.', icon: '◱' },
  { key: 'portfolio', n: '02', t: 'Portföy',        d: 'Görsel ilan kartları, işlem türü, danışman ve AI uyum skoru aynı görünümde.', icon: '⌂' },
  { key: 'import',    n: '03', t: 'İlan Aktarımı',  d: 'Sahibinden, Hürriyet Emlak ve Emlakjet ilanlarını URL ile içe aktarın.', icon: '⇱' },
  { key: 'listing',   n: '04', t: 'İlan Detayı',    d: 'Tüm nitelikler ve o ilana uyan müşteriler skorlarıyla birlikte.', icon: '▤' },
  { key: 'match',     n: '05', t: 'AI Eşleştirme',  d: 'Dönüşüm olasılığı, risk skoru ve uyum puanı gerekçesiyle sunulur.', icon: '✦' },
  { key: 'pipeline',  n: '06', t: 'İş Akışı',       d: 'Talepten kapanışa kadar her fırsat sürükle-bırak Kanban üzerinde.', icon: '⇉' },
  { key: 'calendar',  n: '07', t: 'Takvim & Takip', d: 'Randevular, gösterimler ve AI önerili takip aramaları.', icon: '◷' },
  { key: 'generator', n: '08', t: 'İlan Üreteci',   d: 'Portföyden seçin, AI ile Sahibinden / Instagram / WhatsApp metni üretin.', icon: '✎' },
  { key: 'reports',   n: '09', t: 'Raporlar',       d: 'Ciro, satış hunisi, dönüşüm ve danışman performansı.', icon: '◲' },
].map(s => ({ ...s, src: `/screens/${s.key}.png` }))


/* ── Fiyat paketleri ── */
const PLANS = [
  {
    n: 'Starter', h: 'Küçük ekipler',
    p: 'Temel operasyonu tek merkeze taşımak isteyen butik acenteler için.',
    ul: ['10 kullanıcı', '500 ilan', 'Sınırsız AI eşleştirme', 'Tüm temel modüller'],
    cta: 'Demo planla',
  },
  {
    n: 'Professional', h: 'Büyüyen acenteler',
    p: 'Portföyü ve danışman ekibi hızla büyüyen emlak şirketleri için.',
    ul: ['25 kullanıcı', '2.500 ilan', 'Sınırsız AI eşleştirme', 'Gelişmiş raporlar ve yönetim'],
    cta: 'Demo talep et',
  },
  {
    n: 'Enterprise', h: 'Kurumsal yapı',
    p: 'Çok şubeli, özel entegrasyon ve yüksek ölçek ihtiyacı olan kurumlar için.',
    ul: ['Esnek kullanıcı', 'Esnek portföy limiti', 'Özel entegrasyonlar', 'Kuruma özel çözümler'],
    cta: 'Görüşelim',
  },
]

/* ── ROI ── */
const ROI_FIELDS = [
  { key: 'consultants', label: 'Danışman sayısı',                min: 1,   max: 80,   step: 1 },
  { key: 'leads',       label: 'Danışman başına aylık talep',    min: 5,   max: 150,  step: 1 },
  { key: 'minutes',     label: 'Eşleştirme süresi',              min: 10,  max: 240,  step: 5, unit: ' dk' },
  { key: 'hourly',      label: 'Danışmanın saatlik değeri',      min: 100, max: 2000, step: 50, prefix: '₺' },
]

function computeRoi({ consultants, leads, minutes, hourly }) {
  const hours = Math.round((consultants * leads * minutes) / 60)
  const monthly = hours * hourly
  return { hours, monthly, yearly: monthly * 12, days: Math.round(hours / 8) }
}

/* ── SSS ── */
const FAQS = [
  { q: 'Mevcut portföyümüzü sisteme nasıl aktarırız?',
    a: 'Excel ve CSV dosyalarınızı doğrudan içe aktarabilirsiniz. Pilot sürecinde portföy aktarımını birlikte yapıyor, alan eşleştirmesini sizin veri yapınıza göre ayarlıyoruz.' },
  { q: 'Müşteri verilerimiz güvende mi?',
    a: 'Her acentenin verisi birbirinden izole tutulur. İsim, telefon ve e-posta gibi kişisel bilgiler yapay zekâya gönderilmeden önce maskelenir. Rol bazlı yetkilendirme ile kimin neyi göreceğini yönetici belirler.' },
  { q: 'Yapay zekâ yanlış eşleştirme yaparsa ne olur?',
    a: 'Karar her zaman danışmanda kalır. Sistem önerir ve gerekçesini açıklar; danışman düzenler ve onaylar. Ayrıca şehir, mülk tipi ve bütçe gibi kritik uyumsuzluklar AI devreye girmeden önce elenir.' },
  { q: 'Ekibimizin teknik bilgisi yok, kullanabilir miyiz?',
    a: 'Evet. Arayüz danışmanın günlük iş akışına göre tasarlandı; teknik terim yerine emlak diliyle çalışır. Kurulum sonrası ekibinize eğitim veriyoruz.' },
  { q: 'Pilot süreç nasıl işliyor?',
    a: 'Önce operasyonunuzu birlikte inceliyoruz, ardından sınırlı bir ekiple pilot başlatıyoruz. Pilot süresince portföy aktarımı, eğitim ve süreç uyarlaması bizim tarafımızdan yürütülür.' },
  { q: 'AI kullanımı maliyeti nasıl kontrol ediliyor?',
    a: 'Fiyatlandırma kullanıcı ve portföy büyüklüğüne göredir; AI eşleştirme kullanım limitiyle sınırlanmaz. Ön eleme ve önbellekleme sayesinde sistem her sorguda yeniden hesaplama yapmaz, maliyeti öngörülebilir tutar.' },
]

/* ══════════════ SAYFA ══════════════ */
export default function EstateMatchPage({ goBack, onDemo }) {
  const [openFaq, setOpenFaq] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => { window.scrollTo(0, 0) }, [])

  useEffect(() => {
    let raf = 0
    const measure = () => {
      raf = 0
      const h = document.documentElement.scrollHeight - window.innerHeight
      setProgress(h > 0 ? Math.min(100, (window.scrollY / h) * 100) : 0)
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

  const demo = useCallback(() => {
    if (onDemo) onDemo()
    else goBack?.()
  }, [onDemo, goBack])

  return (
    <main className="epage epage--estate">
      <div className="epage__progress" style={{ width: `${progress}%` }} />

      {/* ── HERO (açık tema, vaka çalışması dili) ── */}
      <section className="ecs">
        <div className="ecs-hero">
          <button className="ecs-hero__back" onClick={goBack}>← Ana sayfaya dön</button>
          <div className="ecs-hero__brand">
            <svg width="28" height="28" viewBox="0 0 30 30" fill="none">
              <circle cx="15" cy="15" r="14" fill="#0F5132" />
              <circle cx="19" cy="11" r="4.2" fill="#eafff2" />
            </svg>
            <span>EstateMatch AI</span>
          </div>

          <div className="ecs-hero__mid">
            <h1 className="ecs-hero__h1">Bugün hangi müşteriyi arayacağınızı, <em style={{ fontStyle: 'normal', color: 'var(--cs-brand)' }}>AI söylesin.</em></h1>
            <p className="ecs-hero__sub">EstateMatch AI, portföyünüzü ve müşteri taleplerinizi karşılaştırır; en yüksek ihtimalli eşleşmeleri gerekçesiyle sıralar. Danışman onaylamadan hiçbir eşleşme müşteriye gitmez.</p>
            <div className="ecs-hero__ctas">
              <a className="ecs-btn ecs-btn--solid" href="https://estate.sryverse.com" target="_blank" rel="noopener noreferrer">
                Canlı ürünü keşfet <span>→</span>
              </a>
              <button className="ecs-btn ecs-btn--ghost" onClick={demo}>Demo planla <span>→</span></button>
            </div>
          </div>

          <div className="ecs-hero__stage ecs-hero__stage--panel">
            <div className="ecs-panel">
              <div className="ecs-panel__bar">
                <span className="ecs-panel__dot" /><span className="ecs-panel__dot" /><span className="ecs-panel__dot" />
                <span className="ecs-panel__url">estate.sryverse.com</span>
              </div>
              <div className="ecs-panel__screen">
                <img src="/screens/wide-dashboard.png" alt="EstateMatch AI panel — masaüstü görünümü" />
              </div>
            </div>
            <div className="ecs-float ecs-float--a">
              <span className="ecs-float__eye">Müşteri talebi</span>
              <strong>3+1 · Beşiktaş · ₺15M bütçe</strong>
            </div>
            <div className="ecs-float ecs-float--b">
              <span className="ecs-float__eye">AI uyum skoru</span>
              <strong className="ecs-float__gold">%91</strong>
            </div>
            <div className="ecs-float ecs-float--c">
              <span className="ecs-float__eye">Önerilen aksiyon</span>
              <strong>Bugün ara — Müşteri #482</strong>
            </div>
            <div className="ecs-hero__fade" />
          </div>
        </div>
      </section>

      {/* ── POSTER — marka duruşu ── */}
      <section className="ecs-poster">
        <div className="ecs-poster__word" aria-hidden="true"><span>ESTATEMATCH</span></div>
        <span className="ecs-poster__eye">EstateMatch AI — <b>AI Destekli Emlak CRM</b></span>
        <div className="ecs-laptop">
          <div className="ecs-laptop__lid">
            <div className="ecs-laptop__screen">
              <img src="/screens/wide-dashboard.png" alt="EstateMatch AI panel — geniş ekran görünümü" />
            </div>
          </div>
          <div className="ecs-laptop__base" />
          <div className="ecs-laptop__foot" />
        </div>
      </section>

      {/* ── EKRAN TURU ── */}
      <section className="esec esec--tint">
        <div className="wrap">
          <Rev>
            <div className="esec__head">
              <span className="eeye">Ürün turu</span>
              <h2 className="eh2">Danışmanın bütün günü, <em>tek akışta.</em></h2>
              <p className="ep">
                Her modül ayrı bir araç değil; müşteri kazanımını hızlandıran aynı sistemin parçası.
              </p>
            </div>
          </Rev>
          <Rev delay={100}>
            <ScreenTour
              screens={SCREENS}
              domain="estate.sryverse.com"
              product="EstateMatch AI"
            />
          </Rev>
        </div>
      </section>

      {/* ── IMPACT — sonuç ve akış ── */}
      <section className="ecs">
        <div className="wrap ecs-impact">
          <Rev>
            <span className="ecs__eye">Etki</span>
            <h2 className="ecs__h2">Emlak ekiplerinin gerçekten <em>nasıl çalıştığına göre kuruldu.</em></h2>
          </Rev>

          <div className="ecs-impact__stats">
            {IMPACT_STATS.map((s, i) => (
              <Rev key={s.tag} delay={i * 90}>
                <div className="ecs-stat">
                  <span className="ecs-stat__tag" style={{ background: s.tagBg, color: s.tagFg }}>{s.tag}</span>
                  <p className="ecs-stat__p">{s.p}</p>
                  <div className="ecs-stat__v">{s.v}</div>
                  <div className="ecs-dots">
                    {Array.from({ length: 40 }, (_, j) => (
                      <i key={j} style={{ background: j < s.lit ? s.tagFg : undefined }} />
                    ))}
                  </div>
                </div>
              </Rev>
            ))}
          </div>

          <Rev delay={120}>
            <div className="ecs-flow">
              <h3 className="ecs-flow__h">EstateMatch doğru eşleşmeyi nasıl buluyor.</h3>
              <div className="ecs-flow__labels">
                {FLOW_LABELS.map(l => <span key={l}>{l}</span>)}
              </div>
              <div className="ecs-flow__bars">
                {FLOW_BARS.map((b, i) => (
                  <div key={i} className="ecs-flow__bar" style={{ left: b.left, top: b.top, width: b.w, background: b.bg, color: b.fg || '#fff' }}>
                    {b.l}
                  </div>
                ))}
              </div>
            </div>
          </Rev>
        </div>
      </section>

      {/* ── GRID — eşleşme özeti + portföy ── */}
      <section className="ecs ecs-grid">
        <div className="wrap">
          <Rev>
            <span className="ecs__eye">Uygulamadan</span>
            <h2 className="ecs__h2">Her eşleşmenin arkasında <em>okunabilir bir gerekçe var.</em></h2>
          </Rev>

          <Rev delay={100}>
            <div className="ecs-grid__row">
              <div className="ecs-grid__phone">
                <div className="ecs-grid__phone-screen">
                  <img src="/screens/match.png" alt="Müşteri eşleştirme ekranı" />
                </div>
              </div>

              <div className="ecs-summary">
                <div className="ecs-summary__h">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F5132" strokeWidth="1.8"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M8 4v2M16 4v2" /></svg>
                  Eşleşme özeti
                </div>
                <div className="ecs-summary__grid">
                  <div><div className="ecs-summary__v">17</div><div className="ecs-summary__l">Aktif ilan</div></div>
                  <div><div className="ecs-summary__v">₺156M</div><div className="ecs-summary__l">Portföy değeri</div></div>
                </div>
                <div>
                  <div className="ecs-summary__v">%87</div>
                  <div className="ecs-summary__l">Bu haftanın en yüksek AI uyum skoru</div>
                </div>
                <div className="ecs-summary__warn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}><path d="M12 9v4M12 17h.01M10.3 3.9L2.7 18a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></svg>
                  <span>Bir aday ilan, alıcıya gönderilmeden önce danışman incelemesi bekliyor.</span>
                </div>
              </div>
            </div>
          </Rev>

          <Rev delay={160}>
            <div className="ecs-grid__wide">
              <img src="/screens/wide-portfolio.png" alt="Portföy kartları" />
            </div>
          </Rev>
        </div>
      </section>

      {/* ── CLOSING — güven ── */}
      <section className="ecs">
        <div className="ecs-closing">
          <Rev>
            <h2 className="ecs-closing__h">Bu platform, her eşleşmeye ve her anlaşmaya <em style={{ fontStyle: 'normal', color: 'var(--cs-brand)' }}>netlik kazandırır.</em></h2>
          </Rev>

          <Rev delay={80}>
            <div className="ecs-phone" style={{ marginTop: '2.5rem', width: 260 }}>
              <div className="ecs-phone__notch" />
              <div className="ecs-phone__screen">
                <div className="ecs-phone__scroll">
                  <img className="ecs-phone__img" src="/screens/reports.png" alt="EstateMatch AI raporlar ekranı" />
                </div>
              </div>
            </div>
          </Rev>

          <Rev delay={140}>
            <div className="ecs-closing__row">
              <div className="ecs-quote">
                <svg width="24" height="18" viewBox="0 0 32 24" fill="none"><path d="M0 24V13.5C0 6 4.5 0.8 12 0v5.5C7.8 6.3 5.5 9 5.3 13H12V24H0Z" fill="#eafff2" opacity=".85" /><path d="M20 24V13.5C20 6 24.5 0.8 32 0v5.5C27.8 6.3 25.5 9 25.3 13H32V24H20Z" fill="#eafff2" opacity=".85" /></svg>
                <p>"Boğaz'da kaç satılık yalım var?" — sorulur, ilgili ilanlarla birlikte anında yanıtlanır.</p>
                <div className="ecs-quote__row">
                  <div style={{ display: 'flex' }}>
                    <span className="ecs-quote__av" style={{ background: '#e8f4ee', color: '#0F5132' }}>DE</span>
                    <span className="ecs-quote__av" style={{ background: '#3f8f68', color: '#fff', marginLeft: -8 }}>AI</span>
                  </div>
                  <span className="ecs-quote__cap">Danışman ve AI, aynı listede birlikte çalışıyor</span>
                </div>
              </div>

              <div className="ecs-closing__phone">
                <div className="ecs-closing__phone-screen">
                  <img src="/screens/portfolio.png" alt="Portföy ekranı" />
                </div>
              </div>
            </div>
          </Rev>
        </div>
      </section>

      {/* ── ROI ── */}
      <section className="esec esec--tint">
        <div className="wrap">
          <Rev>
            <div className="esec__head esec__head--mid">
              <span className="eeye">Örnek operasyon senaryosu</span>
              <h2 className="eh2">Kazandırdığı <em>zamanı görün.</em></h2>
              <p className="ep">
                Değerleri kendi ekibinize göre değiştirin. Aşağıdaki sonuçlar bir örnek hesaplamadır; gerçek kazanım operasyonunuza göre değişir.
              </p>
            </div>
          </Rev>
          <Rev delay={100}>
            <RoiCalc
              fields={ROI_FIELDS}
              initial={{ consultants: 10, leads: 30, minutes: 120, hourly: 400 }}
              compute={computeRoi}
              note="Örnek senaryo: yalnızca portföy arama süresini temel alır; takip, ilan üretimi, raporlama ve iletişim kazanımları dahil değildir."
            />
          </Rev>
        </div>
      </section>

      {/* ── FIYATLANDIRMA ── */}
      <section className="esec">
        <div className="wrap">
          <Rev>
            <div className="esec__head esec__head--mid">
              <span className="eeye">Büyümeye hazır</span>
              <h2 className="eh2">Ekibiniz neredeyse, <em>oradan başlayın.</em></h2>
            </div>
          </Rev>
          <div className="eplans">
            {PLANS.map((p, i) => (
              <Rev key={p.n} delay={i * 90}>
                <div className={`eplan${p.best ? ' eplan--best' : ''}`}>
                  {p.best && <span className="eplan__tag">En çok tercih edilen</span>}
                  <span className="eplan__n">{p.n}</span>
                  <h3 className="eplan__h">{p.h}</h3>
                  <p className="eplan__p">{p.p}</p>
                  <ul className="eplan__ul">
                    {p.ul.map((li, j) => <li key={j}>{li}</li>)}
                  </ul>
                  <button className="eplan__btn" onClick={demo}>{p.cta}</button>
                </div>
              </Rev>
            ))}
          </div>
        </div>
      </section>

      {/* ── SSS ── */}
      <section className="esec esec--tint">
        <div className="wrap">
          <Rev>
            <div className="esec__head esec__head--mid">
              <span className="eeye">Sık sorulanlar</span>
              <h2 className="eh2">Merak edilenler.</h2>
            </div>
          </Rev>
          <Rev delay={80}>
            <div className="efaqs">
              {FAQS.map((f, i) => (
                <Faq
                  key={i}
                  q={f.q}
                  a={f.a}
                  open={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? -1 : i)}
                />
              ))}
            </div>
          </Rev>
        </div>
      </section>

      {/* ── KAPANIS ── */}
      <section className="esec">
        <div className="wrap">
          <Rev>
            <div className="ecta">
              <div className="ecta__glow" />
              <div className="ecta__in">
                <h2 className="ecta__h">
                  Emlak operasyonunuzun<br /><em>yeni işletim sistemi.</em>
                </h2>
                <p className="ecta__p">
                  Doğru müşteri. Doğru portföy. Doğru zaman. Pilot programa katılın, sürecinizi
                  birlikte kuralım.
                </p>
                <div className="ecta__row">
                  <button className="ebtn ebtn--solid" onClick={demo}>Pilot programa katıl <span>→</span></button>
                  <a
                    className="ebtn ebtn--ghost"
                    href="https://wa.me/905315178170?text=Merhaba%2C%20EstateMatch%20AI%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum."
                    target="_blank" rel="noopener noreferrer"
                  >
                    WhatsApp'tan yazın <span>→</span>
                  </a>
                </div>
              </div>
            </div>
          </Rev>
        </div>
      </section>
    </main>
  )
}
