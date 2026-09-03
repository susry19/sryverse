/* 02 — Ne yapıyoruz. Beş bileşen, beş somut sonuç; tek çizgi üzerinde. */
import { In } from './bits.jsx'

const RAIL = [
  ['Veri', 'görünürlük'],
  ['Yapay zekâ', 'yorumlama'],
  ['Otomasyon', 'daha az manuel iş'],
  ['Eşleştirme', 'daha doğru seçenekler'],
  ['Karar sistemleri', 'daha güçlü kararlar'],
]

export default function WhatWeDo() {
  return (
    <section id="ne-yapiyoruz" className="hw" aria-labelledby="hw-h">
      <div className="h-wrap">
        <In><p className="h-kicker">Ne yapıyoruz</p></In>
        <In delay={60}><h2 id="hw-h" className="h-h2s">Aynı teknoloji.<br />Farklı iş problemleri.</h2></In>
        <In as="ol" className="hw__rail" delay={120} aria-label="Bileşenler ve sonuçları">
          {RAIL.map(([t, o], i) => (
            <li key={t} style={{ '--k': i }}>
              <span className="hw__t">{t}</span>
              <i className="hw__arrow" aria-hidden="true" />
              <span className="hw__o">{o}</span>
            </li>))}
        </In>
        <In delay={160}><p className="h-note">Ürünlerimizde de, sizin için kurduğumuz sistemlerde de aynı bileşenler çalışır.</p></In>
      </div>
    </section>)
}
