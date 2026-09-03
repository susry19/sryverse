/* Nasıl çalışır — dört adımlık tek akış.
   Ana ürün hikâyesinden daha sade: her adım, aynı Aylin Hanım senaryosunun
   basitleştirilmiş arayüz parçalarıyla anlatılır. Kaydırma adımları
   sırayla ilerletir; numaralar tıklanabilir ve klavyeyle çalışır. */
import { useRef, useState, useCallback } from 'react'
import { useTrack, useMedia } from './scroll.js'
import { Ico } from './bits.jsx'

const ADIM = [
  {
    n: '01', t: 'Anlayın',
    c: 'Müşterinin talebini, tercihlerini ve danışman notlarını tek bir müşteri görünümünde bir araya getirin.',
    s: 'Dağınık bilgi, anlaşılır bir ihtiyaca dönüşür.',
    kaynak: { tip: 'cumle', metin: '“Döşemealtı’nda, müstakil havuzlu, en az 4+1 bir villa arıyorum.”' },
    cikti: [
      { b: 'Söylenen ihtiyaç', d: 'Döşemealtı · 4+1 · havuzlu · ₺25 mn' },
      { b: 'Danışman notu', d: 'Mahremiyet önemli, şehir erişimi kopmamalı.' },
      { b: 'Yorumlanan bağlam', d: 'Mahremiyet · Bahçe · Erişim · Değer' },
    ],
  },
  {
    n: '02', t: 'Keşfedin',
    c: 'EstateMatch portföylerinizi yalnızca filtrelerle değil, müşteri bağlamıyla birlikte değerlendirir.',
    s: 'Güçlü seçenekler, nedenleri ve farklarıyla görünür.',
    kaynak: { tip: 'alan', metin: '12.480 portföy' },
    cikti: [
      { b: 'Kısa liste', d: '4 güçlü ihtimal' },
      { b: 'Altınkale · %92', d: 'Bağımsız bahçe, dengeli erişim' },
      { b: 'Yeniköy · %87', d: 'Daha geniş plan, çevre yoğun' },
    ],
  },
  {
    n: '03', t: 'Yönetin',
    c: 'Karşılaştırma, paylaşım, randevu, görev ve takip adımlarını aynı müşteri yolculuğunda sürdürün.',
    s: 'Eşleşme, kaybolmayan bir satış sürecine dönüşür.',
    kaynak: { tip: 'secim', metin: 'Altınkale · 4+1' },
    cikti: [
      { b: 'WhatsApp paylaşımı', d: '2 seçenek · 13 Ağu 10:05', i: 'share' },
      { b: 'Gösterim randevusu', d: 'Cumartesi 11:00', i: 'clock' },
      { b: 'Takip görevi', d: 'Pazartesi · hatırlatma', i: 'flag' },
    ],
  },
  {
    n: '04', t: 'Ölçün',
    c: 'Müşteri aşamalarını, portföy hareketlerini, danışman aktivitelerini ve bekleyen aksiyonları izleyin.',
    s: 'Süreç görünür, operasyon yönetilebilir hâle gelir.',
    kaynak: { tip: 'yolculuk', metin: 'Aylin Hanım · müşteri yolculuğu' },
    cikti: [
      { b: 'Müşteri aşaması', d: 'Gösterim planlandı', bar: .62 },
      { b: 'Danışman aktivitesi', d: 'Selin Kaya · 6 işlem', bar: .78 },
      { b: 'Bekleyen aksiyon', d: '1 takip görevi', bar: .3 },
    ],
  },
]

function Gorsel({ i }) {
  const a = ADIM[i]
  return (
    <div className="hw-vis" key={a.n} aria-hidden="true">
      <div className="hw-src">
        {a.kaynak.tip === 'cumle' && <p className="hw-src__q">{a.kaynak.metin}</p>}
        {a.kaynak.tip === 'alan' && <div className="hw-src__field"><span>{a.kaynak.metin}</span><div className="hw-src__dots">{Array.from({ length: 36 }, (_, k) => <i key={k} className={[3, 11, 22, 29].includes(k) ? 'is-on' : ''} />)}</div></div>}
        {a.kaynak.tip === 'secim' && <p className="hw-src__sel"><Ico n="check" size={14} />{a.kaynak.metin}</p>}
        {a.kaynak.tip === 'yolculuk' && <ol className="hw-src__tl"><li className="d">İhtiyaç</li><li className="d">Öneri</li><li className="n">Gösterim</li><li>Takip</li></ol>}
      </div>
      <svg className="hw-link" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M0 50 C42 50, 48 16, 100 16" /><path d="M0 50 L100 50" /><path d="M0 50 C42 50, 48 84, 100 84" /></svg>
      <ul className="hw-out">
        {a.cikti.map((o, k) => (
          <li key={o.b} style={{ '--k': k }}>
            {o.i && <span className="hw-out__ico"><Ico n={o.i} size={14} /></span>}
            <div><b>{o.b}</b><small>{o.d}</small>
              {o.bar !== undefined && <i className="hw-bar" style={{ '--v': o.bar }} />}
            </div>
          </li>))}
      </ul>
    </div>)
}

export default function HowItWorks({ onFeatures }) {
  const trackRef = useRef(null)
  const mobil = useMedia('(max-width: 767px)')
  const rm = useMedia('(prefers-reduced-motion: reduce)')
  const [i, setI] = useState(0)
  useTrack(trackRef, p => { const n = Math.min(3, Math.max(0, Math.floor(p * 4 - 1e-6))); setI(x => x === n ? x : n) })
  /* tıklama kaydırma konumunu da taşır: durum ve kaydırma hiç ayrışmaz */
  const git = useCallback(n => {
    setI(n)
    const el = trackRef.current; if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY
    window.scrollTo({ top: top + ((n + .5) / 4) * (el.offsetHeight - window.innerHeight), behavior: rm ? 'auto' : 'smooth' })
  }, [rm])
  const A = ADIM[i]
  return (
    <section id="nasil-calisir" className="hw" aria-labelledby="hw-h">
      <div className="hw-track" ref={trackRef} style={{ height: mobil ? '280svh' : '320svh' }}>
        <div className="hw-stage">
          <div className="af-wrap">
            <p className="af-kicker"><span className="af-dot" aria-hidden="true" />Nasıl çalışır</p>
            <h2 id="hw-h" className="af-h2 hw-h">Tek bir eşleşmenin etrafında, bütün süreç.</h2>

            <ol className="hw-rail" style={{ '--i': i }}>
              {ADIM.map((s, k) => (
                <li key={s.n} className={k === i ? 'is-on' : k < i ? 'is-past' : ''}>
                  <button type="button" aria-current={k === i ? 'step' : undefined} onClick={() => git(k)}>
                    <span className="hw-rail__n">{s.n}</span><span className="hw-rail__t">{s.t}</span>
                  </button>
                </li>))}
            </ol>

            <div className="hw-body">
              <div className="hw-copy" aria-live="polite">
                <p className="hw-copy__c">{A.c}</p>
                <p className="hw-copy__s"><span aria-hidden="true" />{A.s}</p>
              </div>
              <Gorsel i={i} />
            </div>

            <p className="af-more"><a href="/estatematch/features" className="em-link" onClick={e => { e.preventDefault(); onFeatures?.() }}>Bütün özellikleri inceleyin</a></p>
          </div>
        </div>
      </div>
    </section>)
}
