import { useEffect, useMemo, useCallback } from 'react'
import { usePageSeo, usePageSchema } from './pageParts.jsx'
import './ProductPage.css'
import './EstateCaseStudy.css'

/* ════════════════════════════════════════════════════════════
   /estatematch/features — detay isteyen kullanıcı için.
   Ana sayfa kısa kalsın diye tüm kapsam buraya taşındı.
   ════════════════════════════════════════════════════════════ */

const GROUPS = [
  {
    k: 'Satış zekâsı',
    items: [
      { h: 'AI Eşleştirme', p: 'Müşteri talebi yüzlerce portföyle karşılaştırılır; her eşleşme puanlanır ve gerekçelendirilir.',
        d: ['Kriter ağırlıklama (lokasyon, bütçe, oda, bina yaşı, yatırım tercihi)', 'Açıklanabilir skor — “neden eşleşti?”', 'Danışman onayı olmadan aksiyon alınmaz'] },
      { h: 'Müşteri Önceliklendirme', p: 'Niyet ve davranış sinyalleri her gün yeniden hesaplanır; arama listeniz sabah hazır olur.',
        d: ['Dönüşüm ihtimali skoru', 'Hareketsiz kalan müşteri uyarıları', 'Takip hatırlatmaları'] },
      { h: 'AI Asistan', p: 'Doğal dille sorun; asistan veriyi tarar, listeler ve sonraki aksiyonu önerir.',
        d: ['Müşteri, portföy ve performans sorguları', 'Sıralama ve filtreleme işlemleri', 'Öneri üretimi'] },
    ],
  },
  {
    k: 'Operasyon',
    items: [
      { h: 'Müşteri Yönetimi', p: 'Görüşmeler, tercihler, bütçe ve geçmiş tek profilde toplanır.',
        d: ['Client 360° profil', 'Not ve görüşme geçmişi', 'Kaynak takibi'] },
      { h: 'Portföy Yönetimi', p: 'İlanlar niteliklerine göre yapılandırılır, AI skorlarıyla sürekli analiz edilir.',
        d: ['Detaylı nitelik seti', 'Hareketsizlik ve fiyat sinyalleri', 'Eşleşen müşteri listesi'] },
      { h: 'Satış Süreci', p: 'Lead’den kapanışa her aşama tek panoda; hiçbir fırsat arada kaybolmaz.',
        d: ['Kanban iş akışı', 'Aşama bazlı otomatik hatırlatma', 'Kapanış kaydı'] },
      { h: 'Takvim ve Randevular', p: 'Görüşme ve saha randevuları ekiple senkron çalışır.',
        d: ['Randevu planlama', 'Takip araması listesi', 'Günlük program'] },
      { h: 'İlan Üretimi', p: 'Portföy verisinden çoklu mecraya uygun ilan metni üretilir.',
        d: ['AI metin taslağı', 'Mecraya göre uyarlama', 'Danışman düzenlemesi'] },
      { h: 'İçe Aktarım', p: 'Mevcut portföyünüzü tek seferde taşıyın.',
        d: ['Excel / CSV aktarımı', 'Alan eşleştirme', 'Pilot sürecinde birlikte kurulum'] },
    ],
  },
  {
    k: 'Yönetim',
    items: [
      { h: 'Raporlar', p: 'Ciro, huni, dönüşüm ve kaynak dağılımı gerçek zamanlı.',
        d: ['Aylık satış trendi', 'Dönüşüm oranları', 'Talep kaynağı dağılımı'] },
      { h: 'Danışman Performansı', p: 'Kimin ne yaptığı, hangi fırsatın beklediği tek ekranda.',
        d: ['Kişi bazlı ciro ve aktivite', 'Ekip karşılaştırması', 'Hedef takibi'] },
      { h: 'Acente Yönetimi', p: 'Çok şubeli yapılarda ekipler ve yetkiler merkezden yönetilir.',
        d: ['Şube ve ekip yapısı', 'Kullanıcı yönetimi', 'Merkezî görünürlük'] },
    ],
  },
]

const TECH = [
  { h: 'Rol bazlı erişim (RBAC)', p: 'Danışman, yönetici ve acente rolleri; kimin neyi göreceğini yönetici belirler.' },
  { h: 'Multi-tenant mimari', p: 'Her acentenin verisi altyapı seviyesinde izole tutulur.' },
  { h: 'Veri güvenliği', p: 'Kişisel veriler AI’ye gönderilmeden maskelenir; kritik aksiyonlar kayıt altına alınır.' },
  { h: 'Veri yapısı', p: 'Müşteri, portföy ve aktivite tek modelde ilişkilendirilir; dışa aktarılabilir.' },
  { h: 'Entegrasyon', p: 'İlan platformlarından içe aktarım; mevcut CRM ile birlikte veya onun yerine çalışır.' },
  { h: 'Bulut ve ölçek', p: 'Çok kullanıcılı bulut altyapı; ekip ve portföy büyüdükçe ölçeklenir.' },
]

const SEO_TITLE = 'EstateMatch AI Özellikleri | Gayrimenkul CRM, AI Eşleştirme ve Raporlama'
const SEO_DESC = 'EstateMatch AI’nin tüm modülleri: AI eşleştirme, müşteri ve portföy yönetimi, satış süreci, danışman performansı, raporlama, AI asistan ve güvenlik altyapısı.'

export default function EstateFeaturesPage({ goBack, onDemo }) {
  usePageSeo({ title: SEO_TITLE, description: SEO_DESC, path: '/estatematch/features' })
  const schema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'EstateMatch AI özellikleri',
    itemListElement: GROUPS.flatMap(g => g.items).map((it, i) => ({
      '@type': 'ListItem', position: i + 1, name: it.h, description: it.p,
    })),
  }), [])
  usePageSchema(schema)
  useEffect(() => { window.scrollTo(0, 0) }, [])
  const demo = useCallback(() => { onDemo ? onDemo() : goBack?.() }, [onDemo, goBack])

  return (
    <main className="mx-page mx-feat">
      <section className="mx-feat__hero">
        <div className="mx-wrap">
          <button className="mx-crumb" onClick={goBack}>← EstateMatch</button>
          <h1 className="mx-feat__h1">Tüm özellikler.</h1>
          <p className="mx-feat__sub">
            EstateMatch yalnızca eşleştirme yapmaz; müşteri, portföy, satış süreci,
            performans ve raporlamayı tek platformda birleştirir.
          </p>
        </div>
      </section>

      {GROUPS.map(g => (
        <section className="mx-feat__group" key={g.k}>
          <div className="mx-wrap">
            <h2 className="mx-feat__gh">{g.k}</h2>
            <div className="mx-feat__list">
              {g.items.map(it => (
                <article className="mx-feat__item" key={it.h}>
                  <h3>{it.h}</h3>
                  <p>{it.p}</p>
                  <ul>{it.d.map(d => <li key={d}>{d}</li>)}</ul>
                </article>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="mx-feat__group mx-feat__group--tech">
        <div className="mx-wrap">
          <h2 className="mx-feat__gh">Teknik ve güvenlik</h2>
          <div className="mx-feat__tech">
            {TECH.map(t => (
              <div key={t.h}><h3>{t.h}</h3><p>{t.p}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-feat__cta">
        <div className="mx-wrap">
          <h2 className="mx-h2">EstateMatch’i kendi portföyünüzle görün.</h2>
          <button className="mx-btn mx-btn--big" onClick={demo}>Demo Talep Et →</button>
        </div>
      </section>
    </main>
  )
}
