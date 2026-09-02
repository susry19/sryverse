/* Ekran 04: sabit ürün kabuğu (masaüstü/tablet) ve akış (mobil/azaltılmış hareket) */
import { useRef, useState } from 'react'
import { useTrack, useStack } from './scroll.js'
import { DURUMLAR, BILESEN } from './states.jsx'
import { Status } from './ui.jsx'

const N = DURUMLAR.length
function Head({ i }) {
  return (
    <div className="em-shell__head">
      <span className="em-shell__mark"><img src="/sryverse-icon.png" alt="" width="22" height="22" />EstateMatch</span>
      <span style={{ fontSize: 'var(--t-ui)', fontWeight: 500 }}>{DURUMLAR[i].t}</span>
      <div className="em-shell__ctx"><span>Müşteri <b>Deniz & Emre</b></span><span>Danışman <b>Selin Kaya</b></span><span>Adım <b>{i + 1} / {N}</b></span></div>
    </div>)
}
export default function Shell() {
  const stack = useStack()
  const ref = useRef(null)
  const [i, setI] = useState(0)
  const subRef = useRef(0); const [sub, setSub] = useState(0)
  useTrack(ref, p => {
    if (stack) return
    const raw = p * N, n = Math.min(N - 1, Math.floor(raw)), s = Math.min(1, Math.max(0, raw - n))
    setI(x => x === n ? x : n)
    const q = Math.round(s * 24) / 24; if (q !== subRef.current) { subRef.current = q; setSub(q) }
  })
  const git = n => { const el = ref.current; if (!el) return; const top = el.getBoundingClientRect().top + window.scrollY, span = el.offsetHeight - window.innerHeight; window.scrollTo({ top: top + ((n + 0.15) / N) * span, behavior: 'smooth' }) }

  if (stack) return (
    <section className="em-shellsec em-shell--stack" id="urun" aria-labelledby="em-shell-h">
      <div className="em-wrap" style={{ paddingBlock: 'var(--s8)' }}>
        <span className="em-chapter"><b>04</b>Canlı ürün anlatımı</span>
        <h2 id="em-shell-h" className="em-title" style={{ margin: '1rem 0 .5rem' }}>Bir müşteri, on bir adım</h2>
        <p className="em-body">Deniz & Emre’nin ihtiyacından raporlamaya kadar EstateMatch’in içinden geçin. Temsili demo verisi.</p>
        {DURUMLAR.map((d, k) => { const C = BILESEN[k]; return (
          <div key={d.id} className="em-stackitem">
            <div className="em-rail"><div className="em-rail__step">Adım {k + 1} / {N}</div><h3 className="em-rail__t" style={{ fontSize: '1.5rem' }}>{d.t}</h3><p className="em-rail__x">{d.x}</p></div>
            <div className="em-shell" style={{ marginTop: '1rem' }}><Head i={k} /><div className="em-shell__prog"><i style={{ '--v': (k + 1) / N }} /></div><div className="em-shell__body"><div className="em-state is-on"><C sub={1} stack /></div></div></div>
          </div>) })}
      </div>
    </section>)

  return (
    <section className="em-shellsec" id="urun" ref={ref} aria-labelledby="em-shell-h">
      <div className="em-shell__track">
        <div className="em-shell__stage">
          <div className="em-wrap em-shell__in">
            <div className="em-rail">
              <span className="em-chapter"><b>04</b>Canlı ürün anlatımı</span>
              <div className="em-rail__step" aria-live="polite">Adım {i + 1} / {N}</div>
              <h2 id="em-shell-h" className="em-rail__t">{DURUMLAR[i].t}</h2>
              <p className="em-rail__x">{DURUMLAR[i].x}</p>
              <div className="em-rail__dots" role="tablist" aria-label="Ürün adımları">{DURUMLAR.map((d, k) => <button key={d.id} type="button" role="tab" aria-selected={k === i} aria-label={`${k + 1}. ${d.t}`} className={k === i ? 'is-on' : k < i ? 'is-done' : ''} onClick={() => git(k)} />)}</div>
            </div>
            <div className="em-shell" role="region" aria-label="EstateMatch çalışma alanı, temsili demo">
              <Head i={i} />
              <div className="em-shell__prog" aria-hidden="true"><i style={{ '--v': (i + sub) / N }} /></div>
              <div className="em-shell__body">
                {DURUMLAR.map((d, k) => { const C = BILESEN[k]; const on = k === i; return <div key={d.id} className={`em-state${on ? ' is-on' : ''}`} aria-hidden={!on}>{Math.abs(k - i) <= 1 && <C sub={on ? sub : k < i ? 1 : 0} />}</div> })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>)
}
