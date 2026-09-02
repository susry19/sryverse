import { useEffect, useMemo, useCallback } from 'react'
import { usePageSeo, usePageSchema } from './pageParts.jsx'
import './EstateMatch.css'
import Story from './estate/story.jsx'
import { Bridge, Audience, Recap, Faq, Contact } from './estate/after.jsx'

/* EstateMatch by SRYVERSE — tek sahneli hikâye, ardından sıradan akış.
   Başlık, alt bilgi ve yüzen asistan App kabuğundan gelir. */
const SEO_BASLIK = 'EstateMatch AI | Yapay Zekâ Destekli Gayrimenkul CRM ve Eşleştirme Platformu'
const SEO_ACIKLAMA = 'EstateMatch, müşterinin söylediği kriterlerle yetinmeyen; ihtiyacın bağlamını anlayarak insanlar ve portföyler arasındaki görünmeyen ilişkileri ortaya çıkaran akıllı emlak platformudur. Müşteri, portföy, paylaşım, takip ve raporlama tek yerde.'

export default function EstateMatchPage({ goBack, onDemo, onFeatures }) {
  usePageSeo({ title: SEO_BASLIK, description: SEO_ACIKLAMA, path: '/estatematch', ogImage: 'https://sryverse.com/screens/property-macka-1600.webp' })
  const schema = useMemo(() => ({ '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'EstateMatch AI', applicationCategory: 'BusinessApplication', operatingSystem: 'Web', description: SEO_ACIKLAMA, url: 'https://sryverse.com/estatematch', publisher: { '@type': 'Organization', name: 'SRYVERSE' } }), [])
  usePageSchema(schema)
  /* Uygulama içi geçişte üste; sayfa yenilemede tarayıcının geri getirdiği konum korunur */
  useEffect(() => { const nav = performance.getEntriesByType('navigation')[0]; if (nav && nav.type === 'reload') return; window.scrollTo(0, 0) }, [])
  /* Hikâye sonundaki "Demo planla" bu sayfadaki demo formuna iner; başlıktaki CTA mevcut hedefini korur */
  const demoForm = useCallback(() => {
    const el = document.querySelector('#iletisim'); if (!el) { onDemo ? onDemo() : goBack?.(); return }
    const hdrH = document.querySelector('.hdr')?.offsetHeight || 78
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - hdrH, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }, [onDemo, goBack])
  return (
    <main className="em">
      <Story onDemo={demoForm} onFeatures={onFeatures} />
      <div className="em-after">
        <Bridge />
        <Audience />
        <Recap onFeatures={onFeatures} />
        <Faq />
        <Contact />
      </div>
    </main>
  )
}
