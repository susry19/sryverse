/* Kalıcı sayfa gezgini: yedi anlatı aşaması değil, sayfanın büyük
   bölümleri (Başlangıç → Hikâye → Nasıl Çalışır → Kimler İçin →
   İnsan Kontrolü → Merak Edilenler → Demo). Masaüstünde sağ kenarda
   ince, etiketleri hover/focus'ta açılan bir rota; mobilde alt köşede
   kompakt bir gösterge ve dokununca açılan bölüm listesi. Yüzen
   WhatsApp/asistan düğmesi sol altta olduğu için sağ kenar seçildi;
   hiçbir durumda onunla çakışmaz. */
import { useEffect, useRef, useState } from 'react'
import { useActiveSection, useMedia } from './scroll.js'
import { Ico } from './bits.jsx'

const BOLUM = [
  ['baslangic', 'Başlangıç'],
  ['hikaye', 'Hikâye'],
  ['nasil-calisir', 'Nasıl Çalışır'],
  ['kimler-icin', 'Kimler İçin'],
  ['guven', 'İnsan Kontrolü'],
  ['sss', 'Merak Edilenler'],
  ['iletisim', 'Demo'],
]
const IDS = BOLUM.map(b => b[0])

function scrollToId(id, rm) {
  const el = document.getElementById(id); if (!el) return
  const hdrH = document.querySelector('.hdr')?.offsetHeight || 78
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - hdrH, behavior: rm ? 'auto' : 'smooth' })
}

export default function PageNav() {
  const active = useActiveSection(IDS, .32)
  const mobile = useMedia('(max-width: 1023px)')
  const rm = useMedia('(prefers-reduced-motion: reduce)')
  const [open, setOpen] = useState(false)
  const sheetRef = useRef(null), triggerRef = useRef(null)

  const git = id => {
    setOpen(false)
    scrollToId(id, rm)
  }
  const basaDon = () => {
    setOpen(false)
    scrollToId('baslangic', rm)
    const odaklan = () => { const h = document.querySelector('.emh-h'); if (h) { h.setAttribute('tabindex', '-1'); h.focus() } }
    if (rm) { odaklan(); return }
    /* uzun akıllı kaydırma bitmeden başlığa odaklanmak sessizce başarısız olur (görünürlük henüz geri gelmemiş olabilir):
       kaydırma bitişini bekle, desteklenmiyorsa cömert bir yedek süreyle devam et */
    if ('onscrollend' in window) {
      const bitince = () => { window.removeEventListener('scrollend', bitince); odaklan() }
      window.addEventListener('scrollend', bitince)
      window.setTimeout(bitince, 2400)
    } else {
      window.setTimeout(odaklan, 1000)
    }
  }

  /* mobil sayfa menüsü: odak tuzağı, Escape, gövde kilidi, odak geri dönüşü */
  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const sheet = sheetRef.current
    const odaklanabilir = () => sheet ? [...sheet.querySelectorAll('a[href],button:not([disabled])')] : []
    odaklanabilir()[0]?.focus()
    const onKey = e => {
      if (e.key === 'Escape') { setOpen(false); triggerRef.current?.focus(); return }
      if (e.key !== 'Tab') return
      const list = odaklanabilir(); if (!list.length) return
      const i = list.indexOf(document.activeElement)
      if (e.shiftKey && i <= 0) { e.preventDefault(); list[list.length - 1].focus() }
      else if (!e.shiftKey && i === list.length - 1) { e.preventDefault(); list[0].focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prevOverflow }
  }, [open])

  if (mobile) {
    return (
      <div className="pnm">
        <button type="button" ref={triggerRef} className="pnm-now" onClick={() => setOpen(v => !v)} aria-expanded={open} aria-controls="pnm-sheet" aria-haspopup="true">
          <span className="pnm-now__dot" aria-hidden="true" />{BOLUM[active][1]}
          <Ico n="plus" size={13} />
        </button>
        {open && <>
          <button type="button" className="pnm-veil" aria-hidden="true" tabIndex={-1} onClick={() => { setOpen(false); triggerRef.current?.focus() }} />
          <div id="pnm-sheet" ref={sheetRef} role="dialog" aria-modal="true" aria-label="Sayfa bölümleri" className="pnm-sheet">
            <ol>
              {BOLUM.map(([id, t], i) => (
                <li key={id} className={i === active ? 'is-on' : ''}>
                  <button type="button" aria-current={i === active ? 'true' : undefined} onClick={() => git(id)}>{t}</button>
                </li>))}
            </ol>
            <button type="button" className="pnm-top" onClick={basaDon}><Ico n="chevronUp" size={15} />Başa dön</button>
          </div>
        </>}
      </div>)
  }

  return (
    <nav className="pn" aria-label="Sayfa bölümleri">
      <ol>
        {BOLUM.map(([id, t], i) => (
          <li key={id} className={i === active ? 'is-on' : ''}>
            <button type="button" aria-current={i === active ? 'true' : undefined} onClick={() => git(id)}>
              <i className="pn-dot" aria-hidden="true" /><span className="pn-lbl">{t}</span>
            </button>
          </li>))}
      </ol>
      <button type="button" className={`pn-top${active > 0 ? ' is-on' : ''}`} onClick={basaDon} tabIndex={active > 0 ? 0 : -1} aria-hidden={active === 0}>
        <Ico n="chevronUp" size={14} /><span>Başa dön</span>
      </button>
    </nav>)
}
