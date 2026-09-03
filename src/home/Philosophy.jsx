/* 11 — Tek felsefe anı; sayfanın tek koyu sahnesi.
   Gerçek parçalar (müşteri notu, portföy, aday, pozisyon, veri, karar)
   dağınık başlar; "Eksik olan bağlantıdır." ile çiftler hâlinde birleşir
   ve her çift bunu gerçekten yapan SRYVERSE sistemine bağlanır. Metinler
   aynı hücrede çapraz geçer; görünmeyen metin gizlenir, üst üste binmez. */
import { useRef, useState } from 'react'
import { useTrack, useStack } from '../estate/scroll.js'
import { In, sm, mix } from './bits.jsx'

const FRAG = [
  { t: 'Müşteri notu', d: '“Boğaz manzaralı, kapalı otoparklı, sakin bir yalı.”', s: [22, 16], e: [24, 20] },
  { t: 'Portföy', d: 'Çengelköy · Yalı · Kapalı otopark', s: [72, 30], e: [76, 20] },
  { t: 'Aday', d: 'Deniz Aksoy · Opera PMS · 5 yıl', s: [30, 56], e: [24, 52] },
  { t: 'Pozisyon', d: 'Resepsiyon Sorumlusu · İstanbul', s: [84, 66], e: [76, 52] },
  { t: 'Veri', d: '11 aktif süreç · ₺173.5M potansiyel', s: [48, 84], e: [24, 84] },
  { t: 'Karar', d: 'Bu hafta 3 yer gösterimi önceliklendirildi', s: [62, 44], e: [76, 84] },
]
const CIFT = [[0, 1, 'EstateMatch', 20], [2, 3, 'SkillMatch', 52], [4, 5, 'Karar sistemi', 84]]

/* Mobil / azaltılmış hareket: çiftler alt alta, okunur satırlar */
function StagePairs() {
  return (
    <ol className="hf__pairs" aria-label="Birleşen parçalar">
      {CIFT.map(([a, b, name]) => (
        <li key={name}>
          <span className="hf__pair hf__pair--row">{name}</span>
          <div className="hf__row">
            <div className="hf__frag hf__frag--row"><span>{FRAG[a].t}</span><b>{FRAG[a].d}</b></div>
            <i className="hf__link" aria-hidden="true" />
            <div className="hf__frag hf__frag--row"><span>{FRAG[b].t}</span><b>{FRAG[b].d}</b></div>
          </div>
        </li>))}
    </ol>)
}

function Stage({ k, link, lbl }) {
  return (
    <div className="hf__stage" aria-hidden="true">
      <svg className="hf__svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        {CIFT.map(([a, b, , y]) => <path key={y} d={`M${mix(FRAG[a].s[0], FRAG[a].e[0], k)} ${mix(FRAG[a].s[1], FRAG[a].e[1], k)} L${mix(FRAG[b].s[0], FRAG[b].e[0], k)} ${mix(FRAG[b].s[1], FRAG[b].e[1], k)}`} pathLength="1" style={{ strokeDashoffset: 1 - link, opacity: link > 0 ? 1 : 0 }} />)}
      </svg>
      {FRAG.map((f, i) => (
        <div key={f.t} className="hf__frag" style={{ left: `${mix(f.s[0], f.e[0], k)}%`, top: `${mix(f.s[1], f.e[1], k)}%`, '--on': link }}>
          <span>{f.t}</span><b>{f.d}</b>
        </div>))}
      {CIFT.map(([, , name, y]) => <span key={name} className="hf__pair" style={{ top: `${y}%`, opacity: lbl }}>{name}</span>)}
    </div>)
}

export default function Philosophy() {
  const stack = useStack()
  const ref = useRef(null)
  const [p, setP] = useState(0)
  useTrack(ref, v => { const q = Math.round(v * 200) / 200; setP(x => x === q ? x : q) })

  if (stack) return (
    <section id="felsefe" className="hf hf--stack" data-theme="dark" aria-label="SRYVERSE yaklaşımı">
      <div className="h-wrap">
        <In><p className="h-kicker h-kicker--dark">Yaklaşım</p></In>
        <In delay={60}><p className="hf__l">Bazen cevap zaten vardır.</p></In>
        <In delay={120}><StagePairs /></In>
        <In delay={160}><p className="hf__l hf__l--em">Eksik olan bağlantıdır.</p></In>
        <In delay={200}><p className="hf__sub">EstateMatch’te, SkillMatch’te ve sizin için kurduğumuz sistemlerde aynı iş yapılır: dağınık parçalar, bir karar etrafında birleşir.</p></In>
      </div>
    </section>)

  const a = 1 - sm(p, .40, .52), b = sm(p, .52, .64), sub = sm(p, .70, .84)
  const k = sm(p, .38, .66), link = sm(p, .58, .78), lbl = sm(p, .74, .88)
  return (
    <section id="felsefe" className="hf" data-theme="dark" aria-label="SRYVERSE yaklaşımı">
      <div className="hs-track" ref={ref} style={{ height: '200svh' }}>
        <div className="hs-stage">
          <div className="h-wrap hf__in">
            <div className="hf__txt">
              <p className="h-kicker h-kicker--dark">Yaklaşım</p>
              <div className="hf__x">
                <p className="hf__l" style={{ opacity: a, visibility: a < .02 ? 'hidden' : 'visible' }}>Bazen cevap zaten vardır.</p>
                <p className="hf__l hf__l--em" style={{ opacity: b, visibility: b < .02 ? 'hidden' : 'visible' }}>Eksik olan bağlantıdır.</p>
              </div>
              <p className="hf__sub" style={{ opacity: sub, visibility: sub < .02 ? 'hidden' : 'visible' }}>EstateMatch’te, SkillMatch’te ve sizin için kurduğumuz sistemlerde aynı iş yapılır: dağınık parçalar, bir karar etrafında birleşir.</p>
            </div>
            <Stage k={k} link={link} lbl={lbl} />
          </div>
        </div>
      </div>
    </section>)
}
