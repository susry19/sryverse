/* Üç farklı villa için vaziyet planı görselleri (temsili).
   Depoda villa fotoğrafı yok; apartman fotoğrafı kullanmamak için her
   mülk kendi çizgisel planıyla temsil edilir: parsel, ev, özel havuz,
   bahçe, yol. Üçü de farklı kompozisyondur. */
const VILLA = {
  altinkale: {
    alt: 'Döşemealtı Altınkale villa vaziyet planı: L planlı müstakil ev, dikdörtgen özel havuz, sağ kenarda ağaçlı bahçe, sol altta araç yolu',
    plot: 'M14 14h132v92H14z',
    house: 'M26 26h52v30H52v22H26z',
    pool: { d: 'M92 62h40v26H92z' },
    trees: [[128, 24], [140, 40], [138, 92], [124, 100], [40, 96], [60, 98]],
    road: 'M14 84h12v22H14z',
    extra: null,
  },
  yenikoy: {
    alt: 'Döşemealtı Yeniköy villa vaziyet planı: geniş dikdörtgen ev, yuvarlatılmış özel havuz, iki yanda komşu parseller',
    plot: 'M24 12h112v96H24z',
    house: 'M36 22h88v34H36z',
    pool: { d: 'M60 70c0-8 8-10 20-10s20 2 20 10-8 12-20 12-20-4-20-12z' },
    trees: [[124, 96], [36, 96]],
    road: 'M72 96h16v12H72z',
    extra: 'M6 12h14v96H6zM140 12h14v96h-14z',
  },
  duzlercami: {
    alt: 'Döşemealtı Düzlerçamı villa vaziyet planı: yoğun ağaçlı parsel içinde kompakt ev, oval özel havuz, uzun erişim yolu',
    plot: 'M18 10h124v86H18z',
    house: 'M56 34h40v34H56z',
    pool: { d: 'M104 48c10 0 18 6 18 14s-8 14-18 14-18-6-18-14 8-14 18-14z' },
    trees: [[28, 20], [42, 18], [30, 40], [26, 62], [34, 82], [52, 86], [126, 20], [136, 36], [132, 84], [110, 88], [70, 20], [92, 18]],
    road: 'M74 96h8v20h-8z',
    extra: 'M14 116h132',
  },
}
export const VILLA_ALT = k => VILLA[k].alt

export function Villa({ k, size = 640 }) {
  const v = VILLA[k]
  return (
    <svg className="villa" viewBox="0 0 160 120" role="img" aria-label={v.alt} preserveAspectRatio="xMidYMid slice">
      <rect width="160" height="120" fill="#F3F1EA" />
      {/* çim dokusu */}
      <pattern id={`g-${k}`} width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".5" fill="rgba(11,107,87,.22)" /></pattern>
      <path d={v.plot} fill={`url(#g-${k})`} stroke="rgba(17,22,20,.55)" strokeWidth=".9" />
      {v.extra && <path d={v.extra} fill="rgba(17,22,20,.05)" stroke="rgba(17,22,20,.28)" strokeWidth=".8" strokeDasharray="2 2" />}
      <path d={v.road} fill="rgba(17,22,20,.10)" stroke="rgba(17,22,20,.35)" strokeWidth=".7" />
      <path d={v.house} fill="#FFFFFF" stroke="#111614" strokeWidth="1.2" />
      <path d={v.house} fill="none" stroke="rgba(17,22,20,.35)" strokeWidth=".6" transform="translate(2 2)" />
      <path d={v.pool.d} fill="rgba(11,107,87,.20)" stroke="#0B6B57" strokeWidth="1" />
      <path d={v.pool.d} fill="none" stroke="rgba(11,107,87,.55)" strokeWidth=".5" strokeDasharray="1.5 2" transform="translate(0 3)" />
      {v.trees.map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r="5.5" fill="rgba(11,107,87,.16)" stroke="rgba(11,107,87,.55)" strokeWidth=".7" /><circle cx={x} cy={y} r="1.2" fill="rgba(11,107,87,.7)" /></g>)}
      {/* kuzey oku */}
      <g transform="translate(150 12)" stroke="rgba(17,22,20,.6)" strokeWidth=".8" fill="none"><path d="M0 6V-6M-3-3l3-3 3 3" /></g>
    </svg>
  )
}
