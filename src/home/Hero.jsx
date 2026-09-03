/* 01 — Giriş. Sol: kim olduğumuz ve iki yol. Sağ: SRYVERSE'in gerçekten
   ürettiği şeylerden üç kesit (EstateMatch eşleştirme, SkillMatch aday
   havuzu, otomatik iş akışı) derinlikte katmanlanır ve SRYVERSE işaretine
   bağlanır. Kaydırmayla çok hafif paralaks; başka hareket yok. */
import { useRef, useState } from 'react'
import { useReveal } from '../estate/scroll.js'
import { Crop, Frame } from './bits.jsx'

const ADAY = [
  ['DA', 'Deniz Aksoy', '5 yıl · Antalya', 92],
  ['MK', 'Mert Kaya', '3 yıl · İstanbul', 84],
  ['EŞ', 'Elif Şahin', '7 yıl · İzmir', 79],
]
const AKIS = ['Talep', 'Eşleşme', 'Randevu', 'Teklif', 'Kapanış']

export default function Hero({ go }) {
  const ref = useRef(null)
  const [v, setV] = useState(.5)
  useReveal(ref, q => { const r = Math.round(q * 100) / 100; setV(x => x === r ? x : r) })
  const par = (k) => ({ transform: `translate3d(0, ${((v - .5) * k).toFixed(1)}px, 0)` })

  return (
    <section id="baslangic" ref={ref} className="hh" aria-labelledby="hh-h">
      <div className="h-wrap hh__in">
        <div className="hh__txt">
          <p className="hh__eye" lang="en">AI · Data · Digital Transformation</p>
          <h1 id="hh-h" className="hh__h">Teknolojiyi işinize eklemiyoruz.<br /><em>İşiniz için anlamlı hâle getiriyoruz.</em></h1>
          <p className="hh__lead">Yapay zekâ, veri ve otomasyonu gerçek iş problemlerine dönüştüren ürünler ve dijital sistemler geliştiriyoruz.</p>
          <div className="hh__act">
            <a href="/#urunler" className="h-cta h-cta--solid" onClick={e => { e.preventDefault(); go('#urunler') }}>Ürünleri keşfet<span aria-hidden="true">→</span></a>
            <a href="/#yaklasim" className="h-cta" onClick={e => { e.preventDefault(); go('#yaklasim') }}>SRYVERSE ile geliştirin<span aria-hidden="true">→</span></a>
          </div>
        </div>

        <div className="hh__stage" role="img" aria-label="SRYVERSE ürünlerinden kesitler: EstateMatch yapay zekâ eşleştirme ekranı, SkillMatch aday havuzu ve otomatik iş akışı">
          <div className="hh__frag hh__frag--em" style={par(-16)}>
            <Frame title="EstateMatch AI · AI Mülk Eşleştirme">
              <Crop src="/screens/ai-matches.webp" w={1600} h={1000} x={596} y={290} cw={720} ch={268} priority />
            </Frame>
          </div>
          <div className="hh__frag hh__frag--sm" style={par(10)}>
            <Frame title="SkillMatch · Aday havuzu">
              <ul className="ui-cands ui-cands--mini">
                {ADAY.map(([i, n, m, s]) => (
                  <li key={n}><span className="ui-av">{i}</span><span className="ui-cands__t"><b>{n}</b><small>{m}</small></span><span className="ui-score"><b>%{s}</b><i style={{ '--w': s / 100 }} /></span></li>))}
              </ul>
            </Frame>
          </div>
          <div className="hh__frag hh__frag--wf" style={par(-6)}>
            <Frame title="Otomasyon · İş akışı">
              <ol className="ui-flow">
                {AKIS.map((a, i) => <li key={a} className={i < 3 ? 'is-done' : i === 3 ? 'is-on' : ''}>{a}</li>)}
              </ol>
              <p className="ui-flow__note"><i aria-hidden="true" />Takip hatırlatması otomatik oluşturuldu</p>
            </Frame>
          </div>
          <div className="hh__node"><img src="/sryverse-icon.png" alt="" width="22" height="22" /><span>SRYVERSE</span></div>
        </div>
      </div>
    </section>)
}
