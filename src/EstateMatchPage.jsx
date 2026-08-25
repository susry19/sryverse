import { useState, useEffect, useCallback, useMemo } from 'react'
import { Rev, Faq, RoiCalc, SectionHead, usePageSeo, usePageSchema } from './pageParts.jsx'
import './ProductPage.css'
import './EstateCaseStudy.css'

/* ── Kurucu pilot programı: 4 haftalık görsel yolculuk ── */
const PILOT_WEEKS = [
  { w: '1. hafta', h: 'Operasyon analizi', icon: 'M4 12h4l2-7 4 14 2-7h4' },
  { w: '2. hafta', h: 'Veri ve portföy aktarımı', icon: 'M12 4v11m0 0-4-4m4 4 4-4M5 19h14' },
  { w: '3. hafta', h: 'Ekip kullanımı ve uyarlama', icon: 'M9 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7 8v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1m18 0v-1a4 4 0 0 0-3-3.87M14.5 5.13a4 4 0 0 1 0 7.75' },
  { w: '4. hafta', h: 'Sonuç ve kazanım raporu', icon: 'M4 20V10m6 10V4m6 16v-7' },
]

/* ── Akıllı Prospect: öncelik listesi + sinyal rozetleri ── */
const PROSPECTS = [
  { name: 'Mert Yılmaz',    niyet: 88, eslesme: 91, tag: 'Bugün ara' },
  { name: 'Zeynep Kaya',    niyet: 76, eslesme: 84, tag: 'Bugün ara' },
  { name: 'Ahmet Öztürk',   niyet: 69, eslesme: 79, tag: 'Bugün ara' },
  { name: 'Selin Aydın',    niyet: 62, eslesme: 72, tag: 'Bugün ara' },
]
const SIGNALS = [
  { l: 'Web davranışı', v: 'Son 7 günde 5 kez portföy inceledi' },
  { l: 'Bölge ilgisi', v: 'Fulya / Nişantaşı bölgesine odaklı' },
  { l: 'Finansal uygunluk', v: 'Kredi uygunluğu olumlu' },
  { l: 'Yaşam evresi', v: 'Taşınma ihtimali yüksek' },
]

/* ── Akıllı Eşleştirme: talep + sıralı portföy önerileri ── */
const MATCH_REQUEST = { rooms: '3+1 daire', area: 'Fulya, Nişantaşı', budget: '₺22-28M', notes: 'Otopark, güvenlik, manzara' }
const PROPERTIES = [
  { name: 'Fulya\'da Lüks Residence',      rooms: '3+1', area: 180, floor: '2. Kat', price: '₺27.500.000', score: 91 },
  { name: 'Nişantaşı\'nda Modern Daire',   rooms: '4+1', area: 160, floor: '4. Kat', price: '₺24.750.000', score: 84 },
  { name: 'Maçka\'da Manzaralı Daire',     rooms: '3+1', area: 170, floor: '6. Kat', price: '₺22.900.000', score: 76 },
]

/* ── Satış Operasyon Merkezi: 3 panel ── */
const PIPELINE_COLS = [
  { l: 'Yeni', items: ['Mert Yılmaz', 'Selin Aydın'] },
  { l: 'Teklif', items: ['Zeynep Kaya'] },
  { l: 'Kapanış', items: ['Ahmet Öztürk'] },
]

/* ── Sahada da aynı güç ── */
const FIELD_TASKS = [
  { t: 'Mert Yılmaz ile görüş', time: '10:30' },
  { t: 'Zeynep Kaya, portföy sunumu hazırla', time: '14:00' },
]

/* ── Yönetim Kontrolü ── */
const KPI = [
  { l: 'Toplam Gelir', v: '₺124,8M', d: '+%18,6' },
  { l: 'Aktif Talepler', v: '238', d: '+%24,2' },
  { l: 'Kapanan Anlaşmalar', v: '42', d: '+%13,3' },
  { l: 'Dönüşüm Oranı', v: '%24,6', d: '+%6,7' },
]
const TEAM_PERF = [
  { name: 'Ece Aydın', v: 92 },
  { name: 'Bora Demir', v: 78 },
  { name: 'Selin Kaya', v: 65 },
  { name: 'Mert Aydın', v: 54 },
]
const TOP_PORTFOLIO = [
  { name: 'Fulya\'da Lüks Residence', v: '₺27,5M' },
  { name: 'Nişantaşı\'nda Modern Daire', v: '₺24,7M' },
  { name: 'Maçka\'da Manzaralı Daire', v: '₺22,9M' },
]
const LEAD_SOURCE = [
  { l: 'Web', v: 44, c: 'var(--green)' },
  { l: 'Referans', v: 31, c: 'var(--sage)' },
  { l: 'Diğer', v: 25, c: 'var(--line)' },
]

/* ── Güvenlik ve şeffaflık ── */
const TRUST = [
  { h: 'Veri izolasyonu', p: 'Her acentenin verisi birbirinden tamamen izole tutulur.',
    ic: <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" /> },
  { h: 'Kişisel veri maskeleme', p: "İsim, telefon ve e-posta, AI'ye gönderilmeden önce maskelenir.",
    ic: <><path d="M3 12c2-4 6-6 9-6s7 2 9 6c-2 4-6 6-9 6s-7-2-9-6z" /><circle cx="12" cy="12" r="2.4" /><path d="M4 4l16 16" /></> },
  { h: 'Rol bazlı yetkilendirme', p: 'Kimin neyi göreceğini yönetici belirler.',
    ic: <><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></> },
  { h: 'Açıklanabilir öneriler', p: 'AI karar vermez; gerekçeli önerir. Onay her zaman danışmanda kalır.',
    ic: <><path d="M4 5h16v10H9l-5 4V5z" /><path d="M8 9h8M8 12h5" /></> },
  { h: 'İşlem kayıtları', p: 'Kim neyi ne zaman yaptı — her kritik aksiyon kayıt altına alınır.',
    ic: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></> },
  { h: 'Veri taşınabilirliği', p: 'Verinizi istediğiniz an dışa aktarabilir, silme talebinde bulunabilirsiniz; düzenli yedeklenir.',
    ic: <><path d="M12 3v12M7 10l5 5 5-5" /><path d="M4 21h16" /></> },
]

/* ── Fiyat paketleri ── */
const PLANS = [
  {
    n: 'Starter', h: 'Küçük ekipler',
    p: 'Temel operasyonu tek merkeze taşımak isteyen butik acenteler için.',
    ul: ['10 kullanıcı', '500 ilan', 'Adil kullanım kapsamında AI eşleştirme', 'Tüm temel modüller'],
    cta: 'Pilot demo planla',
  },
  {
    n: 'Professional', h: 'Büyüyen acenteler', best: true,
    p: 'Portföyü ve danışman ekibi hızla büyüyen emlak şirketleri için.',
    ul: ['25 kullanıcı', '2.500 ilan', 'Adil kullanım kapsamında AI eşleştirme', 'Gelişmiş raporlar ve yönetim'],
    cta: 'Ücretsiz demo planla',
  },
  {
    n: 'Enterprise', h: 'Kurumsal yapı',
    p: 'Çok şubeli, özel entegrasyon ve yüksek ölçek ihtiyacı olan kurumlar için.',
    ul: ['Esnek kullanıcı', 'Esnek portföy limiti', 'Özel entegrasyonlar', 'Kuruma özel çözümler'],
    cta: 'Kurumsal görüşme planla',
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
  { q: 'Kullandığımız CRM ile entegre çalışır mı?',
    a: 'Evet. EstateMatch mevcut CRM\'inizin yerini alabilir veya mevcut sisteminize entegre biçimde çalışabilir; hangisinin uygun olduğuna pilot görüşmesinde birlikte karar veririz.' },
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
const SEO_TITLE = 'EstateMatch AI | Yapay Zekâ Destekli Emlak Satış ve Portföy Yönetimi'
const SEO_DESC = 'Müşteri taleplerini portföyünüzle otomatik eşleştirin, danışman takiplerini önceliklendirin ve emlak satış operasyonunuzu tek panelden yönetin.'

export default function EstateMatchPage({ goBack, onDemo }) {
  const [openFaq, setOpenFaq] = useState(0)
  const [progress, setProgress] = useState(0)

  usePageSeo({
    title: SEO_TITLE,
    description: SEO_DESC,
    path: '/estatematch',
    ogImage: 'https://sryverse.com/screens/wide-dashboard.png',
  })

  const schema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'EstateMatch AI',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        description: SEO_DESC,
        url: 'https://sryverse.com/estatematch',
        publisher: { '@type': 'Organization', name: 'SRYVERSE' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQS.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  }), [])
  usePageSchema(schema)

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

      {/* ── HERO (koyu, laptop + yüzen cam kartlar) ── */}
      <section className="ecs-dark ecs-hero2">
        <div className="wrap">
          <button className="ecs-hero2__crumb" onClick={goBack}>← Ana Sayfa</button>
          <div className="ecs-hero2__badge"><span className="ecs-hero2__dot" />EstateMatch AI</div>
          <h1 className="ecs-hero2__h1">Satışın bir sonraki <em>hamlesini görün.</em></h1>
          <p className="ecs-hero2__sub">Doğru müşteri. Doğru portföy. Doğru zaman.</p>
          <div className="ecs-hero2__ctas">
            <button className="ecs-btn ecs-btn--solid" onClick={demo}>Ücretsiz demo planla <span>→</span></button>
          </div>

          <div className="ecs-hero2__stage">
            <Rev>
              <div className="ecs-laptop">
                <div className="ecs-laptop__lid">
                  <div className="ecs-laptop__screen">
                    <img src="/screens/wide-dashboard.png" alt="EstateMatch AI panel — masaüstü görünümü" />
                  </div>
                </div>
                <div className="ecs-laptop__base" />
              </div>
            </Rev>
            <Rev delay={250}>
              <div className="ecs-glass ecs-glass--a">
                <span className="ecs-glass__l">Bugün ara</span>
                <strong>12 <small>önerilen kişi</small></strong>
              </div>
            </Rev>
            <Rev delay={450}>
              <div className="ecs-glass ecs-glass--b">
                <span className="ecs-glass__l">%91 eşleşme</span>
                <svg className="ecs-glass__spark" width="72" height="26" viewBox="0 0 72 26" fill="none">
                  <polyline points="0,21 12,17 24,19 36,10 48,13 60,4 72,7" stroke="var(--sage)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </Rev>
          </div>
        </div>
      </section>

      {/* ── KURUCU PİLOT PROGRAMI — 4 haftalık görsel yolculuk ── */}
      <section className="ecs ecs-pilot">
        <div className="wrap">
          <Rev>
            <SectionHead eyebrow="Kurucu pilot programı" note="İlk 5 emlak ekibiyle, 30 gün.">
              Birlikte <em>kuralım.</em>
            </SectionHead>
          </Rev>
          <Rev delay={100}>
            <div className="ecs-pilot__timeline">
              {PILOT_WEEKS.map((w, i) => (
                <div className="ecs-pilot__step" key={w.w}>
                  <div className="ecs-pilot__card">
                    <span className="ecs-pilot__ic">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={w.icon} /></svg>
                    </span>
                    <span className="ecs-pilot__w">{w.w}</span>
                    <h3 className="ecs-pilot__h">{w.h}</h3>
                  </div>
                  {i < PILOT_WEEKS.length - 1 && <span className="ecs-pilot__link" aria-hidden="true" />}
                </div>
              ))}
            </div>
          </Rev>
          <Rev delay={160}>
            <div className="ecs-pilot__foot">
              <button className="ecs-btn ecs-btn--solid" onClick={demo}>Kurucu pilot programına başvur <span>→</span></button>
              <p className="ecs-hero__trust" style={{ textAlign: 'left', margin: 0 }}>Kendi verinizi paylaşmadan örnek veriyle başlayabilirsiniz.</p>
            </div>
          </Rev>
        </div>
      </section>

      {/* ── AKILLI PROSPECT ── */}
      <section id="prospect" className="ecs-dark ecs-prospect">
        <div className="wrap ecs-scene ecs-scene--rev">
          <div className="ecs-scene__stage">
            <Rev>
              <div className="ecs-prospect__board">
                <div className="ecs-prospect__list">
                  <span className="ecs-prospect__tag">Prospekt Önerileri</span>
                  {PROSPECTS.map(p => (
                    <div className="ecs-prospect__row" key={p.name}>
                      <span className="ecs-prospect__av">{p.name.split(' ').map(w => w[0]).join('')}</span>
                      <div className="ecs-prospect__body">
                        <strong>{p.name}</strong>
                        <div className="ecs-prospect__bar"><span style={{ width: `${p.niyet}%` }} /></div>
                      </div>
                      <span className="ecs-prospect__score">%{p.eslesme}</span>
                      <span className="ecs-prospect__cta">{p.tag}</span>
                    </div>
                  ))}
                </div>
                <div className="ecs-signal ecs-signal--a"><span>{SIGNALS[0].l}</span><em>{SIGNALS[0].v}</em></div>
                <div className="ecs-signal ecs-signal--b"><span>{SIGNALS[1].l}</span><em>{SIGNALS[1].v}</em></div>
                <div className="ecs-signal ecs-signal--c"><span>{SIGNALS[2].l}</span><em>{SIGNALS[2].v}</em></div>
                <div className="ecs-signal ecs-signal--d"><span>{SIGNALS[3].l}</span><em>{SIGNALS[3].v}</em></div>
              </div>
            </Rev>
          </div>
          <div className="ecs-scene__text">
            <span className="ecs__eye">Akıllı Prospect</span>
            <h2 className="ecs__h2">Kimi arayacağınızı <em>sistem söylesin.</em></h2>
            <p className="ecs__p">Veri, niyet ve zamanlama birleşir; en yüksek dönüşüm potansiyeline sahip kişiler her gün güncellenir.</p>
          </div>
        </div>
      </section>

      {/* ── AKILLI EŞLEŞTİRME ── */}
      <section id="matching" className="ecs-dark ecs-eslesme">
        <div className="wrap" style={{ textAlign: 'center' }}>
          <Rev>
            <div style={{ maxWidth: 560, margin: '0 auto' }}>
              <span className="ecs__eye">Akıllı Eşleştirme</span>
              <h2 className="ecs__h2">Doğru portföy <em>kendini göstersin.</em></h2>
              <p className="ecs__p">Her talep, yüzlerce kritere göre anında eşleştirilir.</p>
            </div>
          </Rev>
          <Rev delay={120}>
            <div className="ecs-req2">
              <span className="ecs-req2__tag">Müşteri Talebi</span>
              <strong>{MATCH_REQUEST.rooms}</strong>
              <span>{MATCH_REQUEST.area} · {MATCH_REQUEST.budget}</span>
              <span>{MATCH_REQUEST.notes}</span>
            </div>
          </Rev>
          <div className="ecs-props2">
            {PROPERTIES.map((p, i) => (
              <Rev key={p.name} delay={220 + i * 100}>
                <div className="ecs-prop2">
                  <div className="ecs-prop2__photo" aria-hidden="true" />
                  <span className="ecs-prop2__score">%{p.score} eşleşme</span>
                  <div className="ecs-prop2__body">
                    <strong>{p.name}</strong>
                    <span>{p.rooms} · {p.area} m² · {p.floor}</span>
                    <span className="ecs-prop2__price">{p.price}</span>
                  </div>
                  <span className="ecs-prop2__save" aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 3h12v18l-6-4-6 4V3z" /></svg>
                  </span>
                </div>
              </Rev>
            ))}
          </div>
        </div>
      </section>

      {/* ── SATIŞ OPERASYON MERKEZİ ── */}
      <section id="operations" className="ecs">
        <div className="wrap ecs-scene ecs-scene--rev">
          <div className="ecs-scene__stage">
            <Rev>
              <div className="ecs-fan">
                <div className="ecs-fanpanel ecs-fanpanel--1">
                  <div className="ecs-fanpanel__bar">Pipeline</div>
                  <div className="ecs-fanpanel__cols">
                    {PIPELINE_COLS.map(c => (
                      <div className="ecs-fanpanel__col" key={c.l}>
                        <span>{c.l}</span>
                        {c.items.map(it => <div className="ecs-fanpanel__chip" key={it}>{it}</div>)}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="ecs-fanpanel ecs-fanpanel--2">
                  <div className="ecs-fanpanel__bar">Portföy</div>
                  <div className="ecs-fanpanel__list">
                    {PROPERTIES.map(p => (
                      <div className="ecs-fanpanel__row" key={p.name}>
                        <div className="ecs-fanpanel__thumb" aria-hidden="true" />
                        <div>
                          <strong>{p.name}</strong>
                          <span>{p.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="ecs-fanpanel ecs-fanpanel--3">
                  <div className="ecs-fanpanel__bar">AI Asistan</div>
                  <div className="ecs-fanpanel__chat">
                    <p>Merhaba, Ece 👋 Bugün senin için 12 aksiyon hazırladım.</p>
                    <div className="ecs-fanpanel__action">
                      <span>Öncelikli aksiyon</span>
                      <strong>Mert Yılmaz — eşleşme %91</strong>
                    </div>
                    <span className="ecs-fanpanel__link">Raporu görüntüle <span>→</span></span>
                  </div>
                </div>
              </div>
            </Rev>
          </div>
          <div className="ecs-scene__text">
            <span className="ecs__eye">Satış Operasyon Merkezi</span>
            <h2 className="ecs__h2">Tüm satış operasyonu. <em>Tek yerde.</em></h2>
            <p className="ecs__p">Pipeline, portföy, talepler ve yapay zekâ asistanı tek akışta birleşir.</p>
          </div>
        </div>
      </section>

      {/* ── SAHADA DA AYNI GÜÇ ── */}
      <section id="field" className="ecs">
        <div className="wrap ecs-scene">
          <div className="ecs-scene__text">
            <span className="ecs__eye">Sahada da aynı güç</span>
            <h2 className="ecs__h2">Sahada da <em>aynı güç.</em></h2>
            <p className="ecs__p">Müşteri, portföy ve görevlerinize her yerden anında erişin.</p>
          </div>
          <div className="ecs-scene__stage">
            <Rev>
              <div className="ecs-field">
                <div className="ecs-field__phone">
                  <div className="ecs-field__screen">
                    <div className="ecs-field__mockbar">Merhaba, Ece 👋</div>
                    <div className="ecs-field__mockrow"><span>Bugün ara</span><strong>12</strong></div>
                    {FIELD_TASKS.map(t => (
                      <div className="ecs-field__task" key={t.t}><span>{t.t}</span><em>{t.time}</em></div>
                    ))}
                  </div>
                </div>
                <div className="ecs-field__tablet">
                  <div className="ecs-field__screen">
                    <div className="ecs-field__mockbar">Portföy</div>
                    <div className="ecs-field__prop"><strong>{PROPERTIES[0].name}</strong><span>{PROPERTIES[0].price}</span></div>
                    <div className="ecs-field__map" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </Rev>
          </div>
        </div>
      </section>

      {/* ── YÖNETİM KONTROLÜ ── */}
      <section id="management" className="ecs">
        <div className="wrap">
          <Rev>
            <SectionHead eyebrow="Yönetim Kontrolü">Ekibin tamamı. <em>Tek bakışta.</em></SectionHead>
            <p className="ecs__p">Performans, hedefler ve gelir tek ekranda şeffaflaşır.</p>
          </Rev>
          <Rev delay={100}>
            <div className="ecs-kpi">
              {KPI.map(k => (
                <div className="ecs-kpi__card" key={k.l}>
                  <span className="ecs-kpi__l">{k.l}</span>
                  <strong className="ecs-kpi__v">{k.v}</strong>
                  <span className="ecs-kpi__d">{k.d}</span>
                </div>
              ))}
            </div>
          </Rev>
          <Rev delay={160}>
            <div className="ecs-mgmt">
              <div className="ecs-mgmt__card ecs-mgmt__card--wide">
                <span className="ecs-mgmt__h">Gelir Trendi</span>
                <svg viewBox="0 0 300 70" className="ecs-linechart" preserveAspectRatio="none">
                  <polyline points="0,55 30,53 60,50 90,45 120,40 150,36 180,27 210,23 240,16 270,11 300,5" fill="none" stroke="var(--green)" strokeWidth="2.5" />
                </svg>
              </div>
              <div className="ecs-mgmt__card">
                <span className="ecs-mgmt__h">Ekip Performansı</span>
                {TEAM_PERF.map(t => (
                  <div className="ecs-teambar" key={t.name}>
                    <span>{t.name}</span>
                    <div className="ecs-teambar__track"><span style={{ width: `${t.v}%` }} /></div>
                  </div>
                ))}
              </div>
              <div className="ecs-mgmt__card">
                <span className="ecs-mgmt__h">En iyi portföyler</span>
                <ol className="ecs-toplist">
                  {TOP_PORTFOLIO.map((p, i) => (
                    <li key={p.name}><span>{i + 1}</span><strong>{p.name}</strong><em>{p.v}</em></li>
                  ))}
                </ol>
              </div>
              <div className="ecs-mgmt__card">
                <span className="ecs-mgmt__h">Taleplerin Kaynağı</span>
                <div className="ecs-donut-wrap">
                  <div
                    className="ecs-donut"
                    style={{ '--g': `conic-gradient(var(--green) 0 ${LEAD_SOURCE[0].v}%, var(--sage) ${LEAD_SOURCE[0].v}% ${LEAD_SOURCE[0].v + LEAD_SOURCE[1].v}%, var(--line) ${LEAD_SOURCE[0].v + LEAD_SOURCE[1].v}% 100%)` }}
                  />
                  <ul className="ecs-donut__legend">
                    {LEAD_SOURCE.map(s => <li key={s.l}><span style={{ background: s.c }} />{s.l} · %{s.v}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          </Rev>
        </div>
      </section>

      {/* ── GÜVENLİK VE ŞEFFAFLIK ── */}
      <section id="security" className="ecs">
        <div className="wrap ecs-trustwrap">
          <Rev>
            <SectionHead eyebrow="Güvenlik ve şeffaflık">Karar her zaman <em>danışmanda kalır.</em></SectionHead>
            <p className="ecs__p">EstateMatch AI karar vermez; puanlar, gerekçelendirir ve önerir. Onaylamak, göndermek ya da reddetmek — hepsi danışmanın elinde.</p>
          </Rev>

          <Rev delay={100}>
            <div className="ecs-trust__grid">
              {TRUST.map(t => (
                <div className="ecs-trust__card" key={t.h}>
                  <svg className="ecs-trust__ic" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{t.ic}</svg>
                  <h3>{t.h}</h3>
                  <p>{t.p}</p>
                </div>
              ))}
            </div>
          </Rev>
        </div>
      </section>

      {/* ── ROI ── */}
      <section className="esec ecs">
        <div className="wrap">
          <Rev>
            <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
              <SectionHead eyebrow="Örnek operasyon senaryosu" note="Değerleri kendi ekibinize göre değiştirin — sonuçlar bir örnek hesaplamadır.">
                Kazandırdığı <em>zamanı görün.</em>
              </SectionHead>
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
      <section id="pricing" className="esec ecs">
        <div className="wrap">
          <Rev>
            <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
              <SectionHead eyebrow="Büyümeye hazır">
                Ekibiniz neredeyse, <em>oradan başlayın.</em>
              </SectionHead>
            </div>
          </Rev>
          <div className="eplans">
            {PLANS.map((p, i) => (
              <Rev key={p.n} delay={i * 90}>
                <div className={`eplan${p.best ? ' eplan--best' : ''}`}>
                  {p.best && <span className="eplan__tag">En çok tercih edilen — 10-25 danışmanlı ekipler için</span>}
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

      {/* ── SSS + KAPANIS ── */}
      <section id="faq" className="esec esec--tint">
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

          <Rev delay={100}>
            <div className="ecta" style={{ marginTop: '2.6rem' }}>
              <div className="ecta__glow" />
              <div className="ecta__in">
                <span className="ecs-hero2__badge" style={{ marginBottom: '1.4rem' }}><span className="ecs-hero2__dot" />EstateMatch AI</span>
                <h2 className="ecta__h">
                  Bir ekran değil.<br /><em>Satış refleksi.</em>
                </h2>
                <div className="ecta__row">
                  <button className="ebtn ebtn--solid" onClick={demo}>Ücretsiz demo planla <span>→</span></button>
                  <a
                    className="ebtn ebtn--ghost"
                    href="https://wa.me/905315178170?text=Merhaba%2C%20EstateMatch%20AI%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum."
                    target="_blank" rel="noopener noreferrer"
                  >
                    WhatsApp'tan yazın <span>→</span>
                  </a>
                </div>
                <p className="ecta__trust">Kendi verinizi paylaşmanız gerekmez · Kurulum ve ekip eğitimi dahildir</p>
              </div>
            </div>
          </Rev>
        </div>
      </section>
    </main>
  )
}
