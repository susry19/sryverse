import { createElement, useMemo } from 'react'

/* Kelime kelime maske açılışı. Metin ekran okuyucuya bütün olarak verilir
   (görünmez kopya); görsel parçalar aria-hidden. Hareket azaltmada CSS
   animasyonu kapanır, metin olduğu gibi görünür. */
export default function Kinetic({ text, as = 'span', className = '', delay = 0, step = 38, play = true, lang }) {
  const words = useMemo(() => String(text || '').split(/(\s+)/), [text])
  let n = 0
  return createElement(as, { className: `sx-k${play ? ' sx-k--play' : ''} ${className}`, lang },
    <span className="sx-sr">{text}</span>,
    words.map((w, i) => /\s+/.test(w)
      ? <span key={i} aria-hidden="true"> </span>
      : <span key={i} className="sx-k__w" aria-hidden="true"><span style={{ '--d': `${delay + (n++) * step}ms` }}>{w}</span></span>))
}
