import { useEffect, useMemo, useCallback } from 'react'
import { usePageSeo, usePageSchema } from './pageParts.jsx'
import './EstateMatch.css'
import { Hero, Match, Search, Promises, Gallery, Ease, Management, Trust, Final } from './estate/scenes.jsx'
import Shell from './estate/Shell.jsx'

/* ══════════════════════════════════════════════════════════════
   EstateMatch by SRYVERSE — üretim sayfası
   Sıra (sözleşme): başlık(App) · hero · match · arama sorunu · sabit ürün
   kabuğu (11 durum) · dört söz · özellik galerisi · kolaylık · yönetim
   değeri · güven · son CTA · alt bilgi(App) · yüzen asistan(App)
   ══════════════════════════════════════════════════════════════ */
const SEO_BASLIK = 'EstateMatch AI | Yapay Zekâ Destekli Gayrimenkul CRM ve Eşleştirme Platformu'
const SEO_ACIKLAMA = 'EstateMatch, müşterinin söylediği kriterlerle yetinmeyen; ihtiyacın bağlamını anlayarak insanlar ve portföyler arasındaki görünmeyen ilişkileri ortaya çıkaran akıllı emlak platformudur. Müşteri, portföy, paylaşım, takip ve raporlama tek yerde.'

export default function EstateMatchPage({ goBack, onDemo }) {
  usePageSeo({ title: SEO_BASLIK, description: SEO_ACIKLAMA, path: '/estatematch', ogImage: 'https://sryverse.com/screens/property-macka-1600.webp' })
  const schema = useMemo(() => ({ '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'EstateMatch AI', applicationCategory: 'BusinessApplication', operatingSystem: 'Web', description: SEO_ACIKLAMA, url: 'https://sryverse.com/estatematch', publisher: { '@type': 'Organization', name: 'SRYVERSE' } }), [])
  usePageSchema(schema)
  useEffect(() => { window.scrollTo(0, 0) }, [])
  const demo = useCallback(() => { onDemo ? onDemo() : goBack?.() }, [onDemo, goBack])
  const kesfet = useCallback(() => { document.querySelector('#match')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }) }, [])
  return (
    <main className="em">
      <Hero onDemo={demo} onExplore={kesfet} />
      <Match />
      <Search />
      <Shell />
      <Promises />
      <Gallery />
      <Ease />
      <Management />
      <Trust />
      <Final onDemo={demo} onExplore={kesfet} onContact={demo} />
    </main>
  )
}
