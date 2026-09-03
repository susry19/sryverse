/* 07–10 — Ürün olmayan taraf: sizin için kurulan sistemler.
   Üç bağlı alan → Önce/SRYVERSE/Sonra dönüşüm diyagramı → dört iş
   sorusu → "sizin sektörünüz" çağrısı. */
import { useRef, useState } from 'react'
import { useReveal, useStack } from '../estate/scroll.js'
import { In, sm } from './bits.jsx'

const ALAN = [
  ['Dijital dönüşüm', 'Mevcut süreçleri analiz eder, sürtünmeyi bulur, dijital akışa dönüştürürüz.'],
  ['AI & veri sistemleri', 'Veriyi rapor olmaktan çıkarıp karar sistemine dönüştürürüz.'],
  ['Otomasyon & süreç tasarımı', 'Tekrarlayan işleri, onayları, veri akışlarını ve operasyonları otomatikleştiririz.'],
]
export function NotEvery() {
  return (
    <section id="yaklasim" className="hc" aria-labelledby="hc-h">
      <div className="h-wrap">
        <In><p className="h-kicker">Özel sistemler</p></In>
        <In delay={60}><h2 id="hc-h" className="h-h2">Her problem hazır bir ürün istemez.</h2></In>
        <In delay={110}><p className="h-lead">Bazen sistemin sizin için kurulması gerekir.</p></In>
        <In as="ol" className="hc__tri" delay={160} aria-label="Çalışma alanları">
          {ALAN.map(([t, d], i) => (
            <li key={t} style={{ '--k': i }}>
              <i className="hc__node" aria-hidden="true" />
              <h3>{t}</h3>
              <p>{d}</p>
            </li>))}
        </In>
      </div>
    </section>)
}

/* ── Önce → SRYVERSE → Sonra ── */
const ONCE = ['Excel', 'E-posta', 'Manuel onay', 'Kopuk veri', 'Tekrarlanan iş']
const SONRA = ['Bağlı iş akışı', 'Otomasyon', 'AI yorumlama', 'Panel', 'Karar']
const YS = [10, 30, 50, 70, 90]

export function BeforeAfter() {
  const stack = useStack()
  const ref = useRef(null)
  const [v, setV] = useState(0)
  useReveal(ref, q => { const r = Math.round(q * 100) / 100; setV(x => x === r ? x : r) })
  const d1 = sm(v, .12, .38), d2 = sm(v, .30, .56)

  return (
    <section id="donusum" className="hb" aria-labelledby="hb-h">
      <div className="h-wrap">
        <In><p className="h-kicker">Süreç dönüşümü</p></In>
        <In delay={60}><h2 id="hb-h" className="h-h2s">Dağınık araçlardan tek bir sisteme.</h2></In>
        <div className={`hb__dia${stack ? ' hb__dia--stack' : ''}`} ref={ref} style={{ '--d1': d1, '--d2': d2 }}>
          <div className="hb__col">
            <span className="hb__lbl">Önce</span>
            <ul>{ONCE.map((t, i) => <li key={t} style={{ '--k': i }}>{t}</li>)}</ul>
          </div>
          {!stack && (
            <svg className="hb__svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {YS.map(y => <path key={y} d={`M0 ${y} C55 ${y}, 45 50, 100 50`} pathLength="1" style={{ strokeDashoffset: 1 - d1 }} />)}
            </svg>)}
          <div className="hb__mid">
            <span className="hb__conn" aria-hidden="true" />
            <div className="hb__core"><img src="/sryverse-icon.png" alt="" width="28" height="28" /><b>SRYVERSE</b><small>analiz · tasarım · otomasyon</small></div>
            <span className="hb__conn" aria-hidden="true" />
          </div>
          {!stack && (
            <svg className="hb__svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {YS.map(y => <path key={y} d={`M0 50 C55 50, 45 ${y}, 100 ${y}`} pathLength="1" style={{ strokeDashoffset: 1 - d2 }} />)}
            </svg>)}
          <div className="hb__col hb__col--after">
            <span className="hb__lbl">Sonra</span>
            <ul>{SONRA.map((t, i) => <li key={t} style={{ '--k': i }}>{t}</li>)}</ul>
          </div>
        </div>
      </div>
    </section>)
}

/* ── Hangi sorunla başlıyorsunuz? ── */
const SORU = [
  ['Çok fazla manuel süreç mi var?', 'Otomasyon / Dijital dönüşüm'],
  ['Veriniz var ama karar üretmiyor mu?', 'Veri & karar zekâsı'],
  ['Çok fazla seçenek arasından doğru eşleşmeyi mi arıyorsunuz?', 'Eşleştirme sistemleri'],
  ['Mevcut yazılımlar iş akışınıza uymuyor mu?', 'Özel dijital sistemler'],
]
export function Problems() {
  return (
    <section id="sorunlar" className="hq" aria-labelledby="hq-h">
      <div className="h-wrap hq__in">
        <div className="hq__side">
          <In><p className="h-kicker">Nereden başlıyorsunuz?</p></In>
          <In delay={60}><h2 id="hq-h" className="h-h2s">Sorunla başlayın.<br />Sistem oradan çıkar.</h2></In>
        </div>
        <In as="ol" className="hq__list" delay={100} aria-label="İş sorunları ve çözüm alanları">
          {SORU.map(([q, a], i) => (
            <li key={q} style={{ '--k': i }}>
              <p className="hq__q">{q}</p>
              <span className="hq__a">{a}</span>
            </li>))}
        </In>
      </div>
    </section>)
}

/* ── Sizin sektörünüz ── */
export function Industry({ go }) {
  return (
    <section id="sektor" className="hi" aria-labelledby="hi-h">
      <div className="h-wrap hi__in">
        <div className="hi__l">
          <In><h2 id="hi-h" className="h-h2">Ürünü değil,<br /><em>düşünme biçimini ölçekliyoruz.</em></h2></In>
          <In delay={80}><p className="h-lead">Sizin sektörünüz için neyi daha akıllı hâle getirebiliriz?</p></In>
          <In delay={140}><a href="/#contact" className="h-cta h-cta--solid" onClick={e => { e.preventDefault(); go('#contact') }}>Birlikte keşfedelim<span aria-hidden="true">→</span></a></In>
        </div>
        <In as="ol" className="hi__map" delay={100} aria-label="Sektör ve sistem eşleşmeleri">
          <li><span>Gayrimenkul</span><i aria-hidden="true" /><b>EstateMatch</b></li>
          <li><span>İşe alım</span><i aria-hidden="true" /><b>SkillMatch</b></li>
          <li className="is-q"><span>Sizin işiniz</span><i aria-hidden="true" /><b>?</b></li>
        </In>
      </div>
    </section>)
}
