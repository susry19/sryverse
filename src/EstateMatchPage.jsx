import { useEffect, useMemo, useCallback } from 'react'
import { usePageSeo, usePageSchema } from './pageParts.jsx'
import './EstateMatch.css'
import Story from './estate/story.jsx'

/* EstateMatch by SRYVERSE — tek sahne, tek ilişki.
   Başlık, alt bilgi ve yüzen asistan App kabuğundan gelir. */
const SEO_BASLIK = 'EstateMatch AI | Yapay Zekâ Destekli Gayrimenkul CRM ve Eşleştirme Platformu'
const SEO_ACIKLAMA = 'EstateMatch, müşterinin söylediği kriterlerle yetinmeyen; ihtiyacın bağlamını anlayarak insanlar ve portföyler arasındaki görünmeyen ilişkileri ortaya çıkaran akıllı emlak platformudur. Müşteri, portföy, paylaşım, takip ve raporlama tek yerde.'

export default function EstateMatchPage({ goBack, onDemo, onFeatures }) {
  usePageSeo({ title: SEO_BASLIK, description: SEO_ACIKLAMA, path: '/estatematch', ogImage: 'https://sryverse.com/screens/property-macka-1600.webp' })
  const schema = useMemo(() => ({ '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'EstateMatch AI', applicationCategory: 'BusinessApplication', operatingSystem: 'Web', description: SEO_ACIKLAMA, url: 'https://sryverse.com/estatematch', publisher: { '@type': 'Organization', name: 'SRYVERSE' } }), [])
  usePageSchema(schema)
  useEffect(() => { window.scrollTo(0, 0) }, [])
  const demo = useCallback(() => { onDemo ? onDemo() : goBack?.() }, [onDemo, goBack])
  return (
    <main className="em">
      <Story onDemo={demo} onFeatures={onFeatures} />
    </main>
  )
}
