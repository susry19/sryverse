import { useState, useEffect, useCallback } from 'react'
import { Rev, Count, ScreenTour, Faq, RoiCalc, DeviceStage, DeviceMock } from './pageParts.jsx'
import './ProductPage.css'

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

/* ── Moduller ── */
const MODULES = [
  {
    id: '01', icon: '⇱', h: 'Portföy ve İlan Aktarımı',
    p: 'Sahibinden, Hürriyet Emlak ve Emlakjet ilanlarınızı URL ile içe aktarın; portföyünüz dakikalar içinde sisteme taşınsın.',
    list: ['Tek tıkla portal ilan aktarımı', 'Görsel portföy kartları ve hızlı filtreleme', 'İlan açıklamasında geçen tek kelimeyi bulma'],
  },
  {
    id: '02', icon: '✦', h: 'Semantik Müşteri Eşleştirme',
    p: 'Müşteri talebini doğal dilde kaydedin; sistem anlamı yakalayarak en uygun portföyleri gerekçesiyle sıralar.',
    list: ['Dönüşüm olasılığı, risk skoru ve AI uyum puanı', 'Uyumsuzluk uyarısı ile yanlış eşleşmeyi önleme', '"Denize yakın, sakin" gibi ifadeleri anlama'],
  },
  {
    id: '03', icon: '⇉', h: 'Satış Akışı ve Takip',
    p: 'Talepten kapanışa kadar her adım Kanban üzerinde görünür; hiçbir fırsat unutulmaz.',
    list: ['Randevu ve gösterim takvimi', 'Otomatik hatırlatıcı ve takip planı', 'WhatsApp / e-posta ile ilan paylaşımı'],
  },
  {
    id: '04', icon: '✎', h: 'AI İlan Üreteci',
    p: 'Portföyden bir mülk seçin; Sahibinden, Instagram ve WhatsApp için hazır metinler saniyeler içinde üretilsin.',
    list: ['Çoklu mecra için tek tıkla içerik', 'Hedef müşteriye göre kişiselleştirilmiş ton', 'WhatsApp kampanya şablonları'],
  },
  {
    id: '05', icon: '◈', h: 'Yönetim ve Yetkilendirme',
    p: 'Rol bazlı erişim ile kimin neyi göreceğine yönetici karar verir.',
    list: ['Süper yönetici, acente yöneticisi, danışman, görüntüleyici', 'Acente verileri birbirinden izole', 'KVKK odaklı kişisel veri maskeleme'],
  },
  {
    id: '06', icon: '◲', h: 'Raporlama ve İçgörü',
    p: 'Gelir, dönüşüm ve danışman performansı güncel olarak izlenir.',
    list: ['Gelir trendi ve satış hunisi', 'Danışman bazlı hedef takibi', 'Lead kaynak analizi'],
  },
]

/* ── Fiyat paketleri ── */
const PLANS = [
  {
    n: 'Starter', h: 'Küçük ekipler',
    p: 'Temel operasyonu tek merkeze taşımak isteyen butik acenteler için.',
    ul: ['10 kullanıcı', '500 ilan', 'Aylık 50.000 AI token', 'Tüm temel modüller'],
    cta: 'Pilot başlat',
  },
  {
    n: 'Professional', h: 'Büyüyen acenteler', best: true,
    p: 'Portföyü ve danışman ekibi hızla büyüyen emlak şirketleri için.',
    ul: ['25 kullanıcı', '2.500 ilan', 'Aylık 250.000 AI token', 'Gelişmiş raporlar ve yönetim'],
    cta: 'Demo talep et',
  },
  {
    n: 'Enterprise', h: 'Kurumsal yapı',
    p: 'Çok şubeli, özel entegrasyon ve yüksek ölçek ihtiyacı olan kurumlar için.',
    ul: ['Esnek kullanıcı', 'Esnek portföy limiti', 'Özel AI kullanım planı', 'Kuruma özel çözümler'],
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
    a: 'Ön eleme ve önbellekleme sayesinde her sorgu yapay zekâya gitmez. Paketlerde aylık token limiti tanımlıdır; kullanım paneliden şeffaf biçimde izlenir.' },
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

      {/* ── HERO ── */}
      <section className="ehero">
        <div className="ehero__bg" />
        <div className="ehero__grid" />
        <div className="wrap">
          <button className="eback" onClick={goBack}>← Ana sayfaya dön</button>

          <div className="ehero__in">
            <div>
              <h1 className="ehero__h1">
                Portföylerinizi değil,<br /><em>fırsatlarınızı yönetin.</em>
              </h1>
              <p className="ehero__sub">
                Müşteri talebini anlayan, en doğru portföyü saniyenin altında bulan ve danışmana
                nedenini açıklayan emlak operasyon platformu.
              </p>
              <div className="ehero__ctas">
                <button className="ebtn ebtn--solid" onClick={demo}>Pilot başlat <span>→</span></button>
                <a className="ebtn ebtn--ghost" href="https://estate.sryverse.com" target="_blank" rel="noopener noreferrer">
                  Platformu aç <span>→</span>
                </a>
              </div>
            </div>

            <div className="ehero__stage">
              <DeviceStage className="ehero__devicestage">
                <DeviceMock
                  src="/screens/dashboard.png"
                  alt="EstateMatch AI panel ekranı"
                  domain="estate.sryverse.com"
                  className="ephone--hero"
                  chips={<>
                    <div className="efcard efcard--a">
                      <span className="efcard__l">Aktif Portföy</span>
                      <span className="efcard__v">184</span>
                      <span className="efcard__d pos">+12 bu ay</span>
                    </div>
                    <div className="efcard efcard--b">
                      <span className="efcard__ic">✦</span>
                      <span className="efcard__v">%96</span>
                      <span className="efcard__l">AI uyum skoru</span>
                    </div>
                  </>}
                />
              </DeviceStage>
            </div>
          </div>

          <div className="estrip">
            {[
              { v: '0.2 sn', l: 'ortalama eşleştirme' },
              { v: '%95', l: 'zaman tasarrufu' },
              { v: '4 rol', l: 'kontrollü erişim' },
              { v: '7/24', l: 'akıllı operasyon' },
            ].map((x, i) => (
              <div key={i} className="estrip__i">
                <div className="estrip__v"><Count value={x.v} /></div>
                <span className="estrip__l">{x.l}</span>
              </div>
            ))}
          </div>
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

      {/* ── MODULLER ── */}
      <section className="esec">
        <div className="wrap">
          <Rev>
            <div className="esec__head">
              <span className="eeye">Yetenekler</span>
              <h2 className="eh2">Operasyonun her adımında <em>bir karşılığı var.</em></h2>
            </div>
          </Rev>
          <div className="emods">
            {MODULES.map((m, i) => (
              <Rev key={m.id} delay={i * 70}>
                <div className="emod">
                  <div className="emod__top">
                    <span className="emod__icon">{m.icon}</span>
                    <span className="emod__id">{m.id}</span>
                  </div>
                  <h3 className="emod__h">{m.h}</h3>
                  <p className="emod__p">{m.p}</p>
                  <ul className="emod__list">
                    {m.list.map((li, j) => <li key={j}>{li}</li>)}
                  </ul>
                </div>
              </Rev>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROI ── */}
      <section className="esec esec--tint">
        <div className="wrap">
          <Rev>
            <div className="esec__head esec__head--mid">
              <span className="eeye">Kendi operasyonunuzla hesaplayın</span>
              <h2 className="eh2">Kazandırdığı <em>zamanı görün.</em></h2>
              <p className="ep">
                Değerleri değiştirin; yalnızca portföy eşleştirme süresinden doğan kazanımı anında hesaplayın.
              </p>
            </div>
          </Rev>
          <Rev delay={100}>
            <RoiCalc
              fields={ROI_FIELDS}
              initial={{ consultants: 10, leads: 30, minutes: 120, hourly: 400 }}
              compute={computeRoi}
              note="Hesaplama yalnızca portföy arama süresini temel alır; takip, ilan üretimi, raporlama ve iletişim kazanımları dahil değildir."
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
