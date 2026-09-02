/* Küçük yapı taşları: fotoğraf, plan, simgeler, düğme, etiket */
const FOTO = {
  macka: { alt: 'Maçka, 3+1, dönüşebilir planlı daire; teraslı yeşil cephe', sizes: [640, 1024, 1600] },
  fulya: { alt: 'Fulya, 3+1, yeni yapı konut', sizes: [640, 1024, 1600] },
  nisantasi: { alt: 'Nişantaşı, 2+1, teraslı tarihi yapı', sizes: [640, 1024] },
  detail: { alt: 'Teşvikiye, 2+1, iç mekân detayı', sizes: [640, 1024, 1600] },
}
export function Foto({ k, size = 640, alt, pos = '50% 50%', priority }) {
  const f = FOTO[k]
  return <img src={`/screens/property-${k}-${size}.webp`} srcSet={f.sizes.map(s => `/screens/property-${k}-${s}.webp ${s}w`).join(', ')} sizes="(max-width:767px) 60vw, 26vw" alt={alt ?? f.alt} width="640" height="480" loading={priority ? 'eager' : 'lazy'} decoding="async" style={{ objectPosition: pos }} draggable="false" />
}
export const FOTO_ALT = k => FOTO[k].alt

/* Altı farklı kat planı: ince çizgi, mimari doku */
const PLANS = [
  'M4 4h40v34H4zM4 20h18M22 4v34M30 20h14M22 30h10',
  'M4 4h40v34H4zM26 4v16M4 20h22M26 20h18M14 20v18',
  'M4 4h40v34H4zM4 14h40M20 14v24M32 14v24M4 28h16',
  'M4 4h40v34H4zM16 4v22M16 26h28M32 26v12M4 30h12',
  'M4 4h40v34H4zM30 4v34M4 18h26M30 24h14M12 18v20',
  'M4 4h40v34H4zM4 12h28M32 4v20M18 12v26M32 24h12',
]
export function Plan({ v = 0 }) {
  return <svg viewBox="0 0 48 42" aria-hidden="true"><path d={PLANS[v % PLANS.length]} fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" /><rect x="9" y="8" width="5" height="5" fill="currentColor" opacity=".5" /></svg>
}

/* Dört niyet simgesi: sakinlik, çalışma alanı, ulaşım, uzun vadeli değer */
const ICON = {
  leaf: 'M4 20c0-8 6-14 16-14-1 9-6 14-16 14zM4 20c4-5 8-8 12-10',
  desk: 'M3 10h18M6 10v9M18 10v9M8 6h8M12 6v4M9 16h6',
  tram: 'M6 4h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM4 10h16M8 21l-1 2M16 21l1 2M8 15h.01M16 15h.01',
  chart: 'M3 20h18M5 17V11M10 17V7M15 17v-4M20 17V5M13 9l7-4',
  check: 'M5 12l5 5 9-10',
  share: 'M12 4v11M8 8l4-4 4 4M5 14v5h14v-5',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 8v4l3 2',
  flag: 'M6 21V4h11l-2 4 2 4H6',
  pie: 'M12 3a9 9 0 1 0 9 9h-9z M12 3v9h9',
  note: 'M6 3h9l4 4v14H6zM9 12h6M9 16h4',
  shield: 'M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6z M9 12l2 2 4-4',
  road: 'M5 21L9 3h6l4 18M12 6v3M12 12v3M12 18v3M7 21h10',
  mail: 'M3 6h18v12H3zM3 7l9 6 9-6',
  phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2',
  plus: 'M12 5v14M5 12h14',
}
export function Ico({ n, size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={ICON[n]} /></svg>
}

export function Btn({ p, small, as: Tag = 'button', className = '', children, ...rest }) {
  return <Tag className={`em-btn${p ? ' em-btn--p' : ''}${small ? ' em-btn--s' : ''} ${className}`} {...(Tag === 'button' ? { type: 'button' } : {})} {...rest}>{children}</Tag>
}
export function Chip({ k, children }) { return <span className={`em-chip${k ? ' em-chip--' + k : ''}`}>{children}</span> }
