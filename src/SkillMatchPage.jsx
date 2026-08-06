import { useState, useEffect, useCallback } from 'react'
import SkillMatch3D from './SkillMatch3D.jsx'
import { Rev, Count, ScreenTour, Faq, RoiCalc, TRY } from './pageParts.jsx'
import './ProductPage.css'

/* ── Ekran turu ──
   NOT: Gorseller public/screens/skill-<key>.png olarak beklenir.
   Dosya yoksa animasyonlu yer tutucu gosterilir. */
const SCREENS = [
  { key: 'dashboard', n: '01', t: 'Genel Bakış',    d: 'Aktif pozisyonlar, günün programı ve AI asistanın öncelik önerileri tek ekranda.', icon: '◱' },
  { key: 'workforce', n: '02', t: 'Kadro İhtiyaçları', d: 'Bütçe, aktif çalışan ve net açık kadro; FTE açığı dönem bazında yönetilir.', icon: '▤' },
  { key: 'wizard',    n: '03', t: 'Pozisyon Açma',  d: 'İhtiyaçtan yayına 6 adımlı akış: kapsam, bütçe, süreç, ilan ve onay.', icon: '⇱' },
  { key: 'positions', n: '04', t: 'Pozisyon Yönetimi', d: 'Açık kadrolar, işe alım müdürü, hedef tarih ve pipeline ilerlemesi.', icon: '⇉' },
  { key: 'pool',      n: '05', t: 'Aday Havuzu',    d: 'Tüm adaylar yetkinlikleri, seviyesi ve AI uyum oranıyla listelenir.', icon: '⌂' },
  { key: 'profile',   n: '06', t: 'Aday Profili',   d: 'Profesyonel özet, yetkinlik haritası, güçlü yönler ve AI mesaj taslakları.', icon: '✦' },
].map(s => ({ ...s, src: `/screens/skill-${s.key}.png` }))

/* ── Moduller ── */
const MODULES = [
  {
    id: '01', h: 'Kadro İhtiyaç Planlaması',
    p: 'Onaylı bütçe, aktif çalışan ve net açık kadro tek tabloda; hangi pozisyon için ilan açılması gerektiği kendiliğinden görünür.',
    list: ['Otel, departman ve dönem bazında FTE açığı', 'Bütçe – aktif çalışan farkından net ihtiyaç hesabı', 'Excel ile toplu kadro planı yükleme'],
  },
  {
    id: '02', h: 'Altı Adımlı Pozisyon Açma',
    p: 'İhtiyaçtan yayına kadar tüm kontroller tek akışta tamamlanır; eksik onayla ilan yayına çıkmaz.',
    list: ['Kapsam, ücret bandı ve kadro politikası kontrolü', 'Süreç ve sorumlu ekip ataması', 'AI ile ilan açıklaması ve yetkinlik üretimi'],
  },
  {
    id: '03', h: 'CV Ayrıştırma ve Yetkinlik Haritası',
    p: 'Yüklenen CV saniyeler içinde yapılandırılmış profile dönüşür; yetkinlikler, deneyim ve seviye otomatik çıkarılır.',
    list: ['PDF ve toplu CV yükleme', 'Yetkinlik etiketleri ve seviye tespiti', 'Profesyonel özet ve güçlü yönlerin çıkarılması'],
  },
  {
    id: '04', h: 'AI Pozisyon–Aday Eşleştirme',
    p: 'Her aday için en uygun pozisyon ve uyum oranı hesaplanır; sıralamanın gerekçesi profilde açıklanır.',
    list: ['Aday başına "en uygun pozisyon" önerisi', 'Yüzdelik uyum oranı ve güçlü yön listesi', 'Havuzdan pozisyona tek tıkla eşleştirme'],
  },
  {
    id: '05', h: 'Pipeline ve İşe Giriş',
    p: 'Başvurudan işe girişe kadar her aday Kanban üzerinde ilerler; bekleyen adımlar öncelik listesine düşer.',
    list: ['Aday pipeline (Kanban) ve teklif onayları', 'Gelen yönlendirmeler ve kara liste yönetimi', 'İşe giriş adımlarının takibi'],
  },
  {
    id: '06', h: 'Kampanya, QR ve İletişim',
    p: 'Kapı başvurusu, kampanya ve QR ile gelen adaylar aynı havuzda toplanır; iletişim AI destekli hazırlanır.',
    list: ['Kampanya ve QR ile başvuru toplama', 'AI ile WhatsApp mesajı ve mail taslağı', 'Aday zaman çizelgesi ve işlem geçmişi'],
  },
]

/* ── Fiyat paketleri ── */
const PLANS = [
  {
    n: 'Starter', h: 'Tek lokasyon',
    p: 'İşe alım sürecini tek merkeze taşımak isteyen büyüyen ekipler için.',
    ul: ['5 kullanıcı · 1 lokasyon', 'Aylık 250 CV analizi', '10 aktif pozisyon', 'Kadro planlama ve aday havuzu'],
    cta: 'Pilot başlat',
  },
  {
    n: 'Professional', h: 'Çok lokasyonlu ekipler', best: true,
    p: 'Birden fazla tesiste düzenli işe alım yapan İK departmanları için.',
    ul: ['20 kullanıcı · 5 lokasyon', 'Aylık 2.000 CV analizi', 'Sınırsız pozisyon', 'Kampanya, QR ve AI iletişim'],
    cta: 'Demo talep et',
  },
  {
    n: 'Enterprise', h: 'Kurumsal yapı',
    p: 'Zincir yapıda, merkez görünümü ve özel entegrasyon ihtiyacı olan kurumlar için.',
    ul: ['Esnek kullanıcı · sınırsız lokasyon', 'Esnek analiz limiti', 'Merkez görünümü ve konsolide raporlama', 'ATS / HRIS entegrasyonu'],
    cta: 'Görüşelim',
  },
]

/* ── SSS ── */
const FAQS = [
  { q: 'Çok lokasyonlu yapımızda çalışır mı?',
    a: 'Evet. Kadro ihtiyaçları otel/tesis, departman ve dönem bazında ayrı ayrı yönetilir. Merkez görünümünden tüm lokasyonların açık kadrosunu tek tabloda izleyebilir, yetkiyi lokasyon bazında dağıtabilirsiniz.' },
  { q: 'Mevcut aday havuzumuzu ve kadro planımızı nasıl aktarırız?',
    a: 'CV dosyalarınızı toplu yükleyebilir, kadro planınızı hazır Excel şablonuyla içe aktarabilirsiniz. Pilot sürecinde aktarımı birlikte yapıyor, alan eşleştirmesini sizin yapınıza göre ayarlıyoruz.' },
  { q: 'Aday verileri güvende mi? KVKK uyumlu mu?',
    a: 'Her organizasyonun verisi birbirinden izole tutulur. Ad, telefon ve e-posta gibi kişisel bilgiler yapay zekâya gönderilmeden önce maskelenir. Rol bazlı yetkilendirme ile kimin hangi veriyi göreceğini yönetici belirler.' },
  { q: 'Yapay zekâ önyargılı karar verir mi?',
    a: 'Uyum oranı yalnızca yetkinlik, deneyim ve pozisyon gereksinimleri üzerinden hesaplanır; ad, cinsiyet ve fotoğraf değerlendirmeye girmez. Her önerinin gerekçesi profilde açıkça gösterilir, karar işe alım ekibinde kalır.' },
  { q: 'İlan ve aday iletişimi ne kadar otomatik?',
    a: 'Sistem ilan açıklamasını ve yetkinlik listesini kadro detaylarından üretir. Aday iletişiminde WhatsApp mesajı ve mail taslağı AI ile hazırlanır; gönderim öncesi düzenleyip onaylarsınız.' },
  { q: 'Pilot süreç nasıl işliyor?',
    a: 'Önce kadro planlama ve işe alım akışınızı birlikte inceliyoruz, ardından sınırlı sayıda pozisyonla pilot başlatıyoruz. Pilot süresince aktarım, eğitim ve süreç uyarlaması bizim tarafımızdan yürütülür.' },
]

/* ── ROI ── */
const ROI_FIELDS = [
  { key: 'roles',   label: 'Aylık açık pozisyon',      min: 1,   max: 60,   step: 1 },
  { key: 'cvs',     label: 'Pozisyon başına başvuru',  min: 10,  max: 600,  step: 10 },
  { key: 'minutes', label: 'CV başına inceleme',       min: 1,   max: 30,   step: 1, unit: ' dk' },
  { key: 'hourly',  label: 'Uzmanın saatlik değeri',   min: 100, max: 2000, step: 50, prefix: '₺' },
]

function computeRoi({ roles, cvs, minutes, hourly }) {
  const hours = Math.round((roles * cvs * minutes) / 60)
  const monthly = hours * hourly
  return { hours, monthly, yearly: monthly * 12, days: Math.round(hours / 8) }
}

/* ══════════════ SAYFA ══════════════ */
export default function SkillMatchPage({ goBack, onDemo }) {
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
    <main className="epage epage--skill">
      <div className="epage__progress" style={{ width: `${progress}%` }} />

      {/* ── HERO ── */}
      <section className="ehero">
        <div className="ehero__bg" />
        <div className="ehero__grid" />
        <div className="wrap">
          <button className="eback" onClick={goBack}>← Ana sayfaya dön</button>

          <div className="ehero__in">
            <div>
              <span className="ehero__eye"><i />SkillMatch AI · Recruitment Intelligence</span>
              <h1 className="ehero__h1">
                CV'leri değil,<br /><em>yetenek potansiyelini görün.</em>
              </h1>
              <p className="ehero__sub">
                Başvuruları saniyeler içinde yapılandıran, pozisyonla uyumu gerekçesiyle açıklayan
                ve işe alım kararını ölçülebilir hâle getiren platform.
              </p>
              <div className="ehero__ctas">
                <button className="ebtn ebtn--solid" onClick={demo}>Pilot başlat <span>→</span></button>
                <a className="ebtn ebtn--ghost" href="https://skillmatch.sryverse.com" target="_blank" rel="noopener noreferrer">
                  Platformu aç <span>→</span>
                </a>
              </div>
            </div>

            <div className="ehero__3d"><SkillMatch3D /></div>
          </div>

          <div className="estrip">
            {[
              { v: '1.4 sn', l: 'CV analiz süresi' },
              { v: '%90', l: 'ön eleme tasarrufu' },
              { v: '12 tesis', l: 'tek merkezden yönetim' },
              { v: '6 adım', l: 'ihtiyaçtan yayına' },
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
              <h2 className="eh2">Kadro ihtiyacından işe girişe, <em>tek akışta.</em></h2>
              <p className="ep">
                Bütçedeki açık kadrodan ilana, ilandan aday havuzuna ve işe girişe kadar her adım
                aynı sistemin parçası.
              </p>
            </div>
          </Rev>
          <Rev delay={100}>
            <ScreenTour
              screens={SCREENS}
              domain="skillmatch.sryverse.com"
              product="SkillMatch AI"
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
              <h2 className="eh2">Planlamadan işe girişe, <em>her adımda bir karşılığı var.</em></h2>
            </div>
          </Rev>
          <div className="emods">
            {MODULES.map((m, i) => (
              <Rev key={m.id} delay={i * 70}>
                <div className="emod">
                  <span className="emod__id">{m.id}</span>
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
              <span className="eeye">Kendi ekibinizle hesaplayın</span>
              <h2 className="eh2">Ön elemeden <em>kazandığınız zaman.</em></h2>
              <p className="ep">
                Değerleri değiştirin; yalnızca CV ön eleme süresinden doğan kazanımı anında görün.
              </p>
            </div>
          </Rev>
          <Rev delay={100}>
            <RoiCalc
              fields={ROI_FIELDS}
              initial={{ roles: 8, cvs: 120, minutes: 7, hourly: 450 }}
              compute={computeRoi}
              note="Hesaplama yalnızca ön eleme süresini temel alır; mülakat planlama, geri bildirim ve raporlama kazanımları dahil değildir."
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
                  İşe alımınızın<br /><em>yeni işletim sistemi.</em>
                </h2>
                <p className="ecta__p">
                  Doğru aday. Doğru pozisyon. Doğru zaman. Pilot programa katılın, sürecinizi
                  birlikte kuralım.
                </p>
                <div className="ecta__row">
                  <button className="ebtn ebtn--solid" onClick={demo}>Pilot programa katıl <span>→</span></button>
                  <a
                    className="ebtn ebtn--ghost"
                    href="https://wa.me/905315178170?text=Merhaba%2C%20SkillMatch%20AI%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum."
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
