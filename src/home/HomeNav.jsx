/* Sayfanın büyük bölümleri için ince, kalıcı gezgin. Masaüstünde sağ
   kenarda noktalar (etiketler hover/focus'ta), mobilde yalnızca
   "başa dön" düğmesi. Yüzen asistan sol altta olduğu için sağ kenar. */
import { useActiveSection, useMedia } from '../estate/scroll.js'

const BOLUM = [['baslangic', 'Başlangıç'], ['felsefe', 'Felsefe'], ['urunler', 'Ürünler'], ['yaklasim', 'Yaklaşım'], ['contact', 'İletişim']]
const IDS = BOLUM.map(b => b[0])

export default function HomeNav({ theme, go }) {
  const active = useActiveSection(IDS, .4)
  const mobile = useMedia('(max-width: 1023px)')
  const rm = useMedia('(prefers-reduced-motion: reduce)')
  const top = () => window.scrollTo({ top: 0, behavior: rm ? 'auto' : 'smooth' })

  if (mobile) return (
    <button type="button" className={`hn-top hn-top--m${active > 0 ? ' is-on' : ''}`} onClick={top} tabIndex={active > 0 ? 0 : -1} aria-hidden={active === 0} aria-label="Başa dön" data-theme={theme}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 15l7-7 7 7" /></svg>
    </button>)

  return (
    <nav className="hn" aria-label="Sayfa bölümleri" data-theme={theme}>
      <ol>
        {BOLUM.map(([id, t], i) => (
          <li key={id} className={i === active ? 'is-on' : ''}>
            <button type="button" aria-current={i === active ? 'true' : undefined} onClick={() => go('#' + id)}>
              <i className="hn__dot" aria-hidden="true" /><span className="hn__lbl">{t}</span>
            </button>
          </li>))}
      </ol>
      <button type="button" className={`hn-top${active > 0 ? ' is-on' : ''}`} onClick={top} tabIndex={active > 0 ? 0 : -1} aria-hidden={active === 0}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 15l7-7 7 7" /></svg><span>Başa dön</span>
      </button>
    </nav>)
}
