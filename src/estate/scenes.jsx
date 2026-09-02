/* Ekranlar 01, 02, 03, 05, 06, 07, 08, 09, 10 */
import { useRef, useState, useEffect } from 'react'
import { Btn, Status, Foto, Plan, Record, Metric, Funnel, Bars, Eyebrow, Chapter, Signal } from './ui.jsx'
import { useTrack, useReveal, kapi, useStack } from './scroll.js'
import { IHTIYAC } from './states.jsx'

const FRAG = ['macka', 'fulya', 'nisantasi', 'detail']
const POS = ['20% 30%', '70% 40%', '40% 70%', '80% 80%']
const WA = 'https://wa.me/905315178170?text=Merhaba%2C%20SRYVERSE%20%C3%BCr%C3%BCnleri%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum.'

/* ═══════ 01 HERO ═══════ */
const HERO_FR = (() => {
  const out = []; const D = Math.PI / 180
  const at = (deg, r, sy = 0.94) => ({ px: 50 + Math.cos(deg * D) * r, py: 50 + Math.sin(deg * D) * r * sy })
  /* iç halka: 8 fotoğraf · dış halka: 8 fotoğraf + 6 plan dönüşümlü · işaretler logo çevresinde · noktalar en dışta */
  for (let i = 0; i < 8; i++) out.push({ k: 'photo', f: FRAG[i % 4], pos: POS[(i >> 1) % 4], ...at(i * 45 + 12, 33), w: 66 + (i % 3) * 12, drift: 70 + (i % 4) * 30, i })
  for (let i = 0; i < 14; i++) { const a = i * (360 / 14) + 30, r = 48
    out.push(i % 7 === 3 || i % 7 === 6 ? { k: 'plan', v: i % 6, ...at(a, r), w: 52, drift: 150, i: 8 + i } : { k: 'photo', f: FRAG[(i + 2) % 4], pos: POS[(i + 1) % 4], ...at(a, r), w: 74 + (i % 4) * 12, drift: 110 + (i % 5) * 30, i: 8 + i }) }
  ;['Sakinlik', 'Evden çalışma', 'Ulaşım', 'Uzun vadeli değer'].forEach((t, i) => out.push({ k: 'mark', t, ...at([-150, -30, 150, 30][i], 25, 1), drift: 50, i: 22 + i }))
  for (let i = 0; i < 8; i++) out.push({ k: 'dot', ...at(i * 45 + 5, 56, 1), drift: 100, i: 26 + i })
  return out
})()
export function Hero({ onDemo, onExplore }) {
  const ref = useRef(null), uni = useRef(null)
  useTrack(ref, p => { if (uni.current) uni.current.style.setProperty('--p', p.toFixed(3)) })
  return (
    <section className="em-hero" ref={ref} aria-labelledby="em-h1">
      <div className="em-wrap em-hero__in">
        <div className="em-hero__copy">
          <Eyebrow>EstateMatch · by SRYVERSE</Eyebrow>
          <h1 id="em-h1" className="em-hero-h" lang="en">Sometimes people find the right place.<br />Sometimes the right place should find them.</h1>
          <p className="em-body">EstateMatch, müşterilerin söyledikleri kriterlerle yetinmeyen; ihtiyacın bağlamını anlayarak insanlar ve portföyler arasındaki görünmeyen ilişkileri ortaya çıkaran akıllı emlak platformudur.</p>
          <div className="em-hero__cta"><Btn p icon="→" onClick={onExplore}>EstateMatch’i keşfedin</Btn><Btn onClick={onDemo}>Demo talep edin</Btn></div>
          <p className="em-hero__cue">Keşfetmek için kaydırın</p>
        </div>
        <div className="em-universe" ref={uni} style={{ '--p': 0 }}>
          <div className="em-universe__ring" style={{ width: '58%', height: '58%' }} aria-hidden="true" />
          <div className="em-universe__ring" style={{ width: '88%', height: '88%' }} aria-hidden="true" />
          <svg className="em-paths" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" style={{ '--p': 'var(--p)' }}>
            <path d="M50 50 C 30 30, 22 34, 18 26" /><path d="M50 50 C 68 36, 78 40, 84 30" /><path d="M50 50 C 40 66, 26 72, 20 78" /><path d="M50 50 C 62 64, 74 70, 82 76" /><path d="M50 50 C 52 30, 50 20, 50 8" />
          </svg>
          <div className="em-orbit em-hero__field" aria-hidden="true">
            {HERO_FR.map(f => f.k === 'photo'
              ? <div key={f.i} className="em-frag em-frag--photo" style={{ '--px': f.px, '--py': f.py, '--w': f.w, '--drift': f.drift, '--i': f.i }}><Foto k={f.f} size={640} pos={f.pos} alt="" loading={f.i < 8 ? 'eager' : 'lazy'} /></div>
              : f.k === 'plan' ? <div key={f.i} className="em-frag em-frag--plan" style={{ '--px': f.px, '--py': f.py, '--w': f.w, '--drift': f.drift, '--i': f.i }}><Plan v={f.v} /></div>
              : f.k === 'mark' ? <span key={f.i} className="em-frag em-frag--mark" style={{ '--px': f.px, '--py': f.py, '--drift': f.drift, '--i': f.i }}>{f.t}</span>
              : <i key={f.i} className="em-frag em-frag--dot" style={{ '--px': f.px, '--py': f.py, '--drift': f.drift, '--i': f.i }} />)}
          </div>
          <div className="em-universe__logo"><img src="/sryverse-badge.png" alt="SRYVERSE" width="150" height="145" /><span>EstateMatch</span></div>
        </div>
      </div>
    </section>)
}

/* ═══════ 02 MATCH ═══════ */
const CIFT = [['İnsan', 'mekân'], ['İhtiyaç', 'ihtimal'], ['Yaşam biçimi', 'doğru çevre'], ['Bugünün beklentisi', 'yarının kararı'], ['Söylenen kriterler', 'henüz fark edilmemiş ihtiyaçlar']]
export function Match() {
  const ref = useRef(null), st = useRef(null)
  const [p, setP] = useState(0)
  useTrack(ref, v => { const q = Math.round(v * 40) / 40; setP(x => x === q ? x : q) })
  const kirik = p > 0.22, tanim = p > 0.36
  return (
    <section className="em-match" id="match" ref={ref} aria-labelledby="em-match-h">
      <div className="em-match__track">
        <div className="em-match__stage" ref={st}>
          <div aria-hidden="true">{[[66, 60], [80, 48], [91, 74], [72, 86]].map((c, i) => <div key={i} className="em-frag em-frag--photo" style={{ '--px': c[0], '--py': c[1], '--dy': (p - 0.5) * (i % 2 ? -90 : 90), '--o': 0.3 + 0.5 * (1 - p) }}><Foto k={FRAG[i]} size={640} pos={POS[i]} alt="" /></div>)}</div>
          <div className="em-wrap">
            <Chapter n="02">Match ne demek</Chapter>
            <h2 id="em-match-h" className="em-major" style={{ marginTop: '1rem' }}>Match bizim için:</h2>
            <div className="em-match__eq" aria-label={kirik ? 'Müşteri, İlan’a eşit değil' : 'Müşteri eşittir İlan'}>
              <div className="em-match__side" style={{ transform: `translateX(${-p * 24}px)` }}>Müşteri</div>
              <div className={`em-match__sign${kirik ? ' is-broken' : ''}`} aria-hidden="true"><i /><i /><span className="em-match__not">değil</span></div>
              <div className="em-match__side em-match__side--r" style={{ transform: `translateX(${p * 24}px)` }}>İlan</div>
            </div>
            <div className={`em-match__def${tanim ? ' is-on' : ''}`}>
              <p className="em-title">Match: yan yana geldiklerinde daha fazla anlam kazanan iki şeydir.</p>
              <ul className="em-pairs">
                {CIFT.map((c, i) => <li key={c[0]} className={`em-pair${p > 0.46 + i * 0.09 ? ' is-on' : ''}`}><span>{c[0]}</span><svg viewBox="0 0 44 14" aria-hidden="true"><line x1="0" y1="7" x2="44" y2="7" /><circle cx="22" cy="7" r="3" /></svg><span>{c[1]}</span></li>)}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>)
}

/* ═══════ 03 ARAMA ═══════ */
const SONUC = Array.from({ length: 24 }, (_, i) => ({ f: FRAG[i % 4], pos: POS[(i >> 2) % 4], t: ['Nişantaşı 3+1', 'Fulya 3+1', 'Teşvikiye 2+1', 'Maçka 3+1'][i % 4] + ' · ' + (140 + (i * 7) % 40) + ' m²', m: '₺' + (13.2 + (i * 0.37) % 2.6).toFixed(1) + ' mn · ' + (2018 + i % 6) }))
export function Search() {
  const ref = useRef(null)
  const [p, setP] = useState(0)
  useTrack(ref, v => { const q = Math.round(v * 30) / 30; setP(x => x === q ? x : q) })
  const filt = ['Bölge: Nişantaşı', 'Bütçe: 12–16 mn', 'Oda: 2+1 ve üzeri', 'Metrekare: 120+']
  return (
    <section className="em-search" ref={ref} aria-labelledby="em-search-h">
      <div className="em-search__track">
        <div className="em-search__stage">
          <div className="em-wrap em-search__in">
            <div>
              <Chapter n="03">Sıradan aramanın sorunu</Chapter>
              <h2 id="em-search-h" className="em-major" style={{ marginTop: '1rem' }}>Aramak, bildiğiniz ihtimaller arasında gezinmektir.</h2>
              <p className="em-body" style={{ marginTop: '1rem', maxWidth: 520 }}>Kriterler seçenekleri azaltabilir. Ama doğru kararı tek başına açıklayamaz.</p>
              <p className="em-search__short">Binlerce portföy.<br />Yüzlerce benzer sonuç.<br /><b>Ama yalnızca birkaçı gerçekten anlamlı.</b></p>
            </div>
            <div style={{ position: 'relative' }}>
              <div className="em-filters" aria-label="Temel filtreler">{filt.map((f, i) => <span key={f} className={p > 0.12 + i * 0.05 ? 'is-on' : ''}>{f}</span>)}</div>
              <div className={`em-results${p > 0.42 ? ' is-same' : ''}`} aria-label="Benzer sonuçlar">
                {SONUC.map((s, i) => <div key={i} className="em-result" style={{ opacity: p > 0.02 + i * 0.012 ? undefined : 0 }}><Foto k={s.f} size={640} pos={s.pos} alt="" /><div><b>{s.t}</b><span>{s.m}</span></div></div>)}
              </div>
              <div className={`em-glass em-sentence${p > 0.62 ? ' is-on' : ''}`} role="note"><p>“{IHTIYAC}”</p><small>Bir müşteri cümlesi. Hiçbir filtre bunu bilmez.</small></div>
            </div>
          </div>
        </div>
      </div>
    </section>)
}

/* ═══════ 05 DÖRT SÖZ ═══════ */
const SOZ = [
  ['Müşteriyi anlayın', 'Doğal dilde ifade edilen ihtiyaçları, danışman notlarını, tercihleri ve müşteri geçmişini tek bağlamda değerlendirin.'],
  ['Doğru ihtimalleri görün', 'Binlerce portföy içindeki ilişkileri keşfedin; eşleşme nedenlerini ve değerlendirilmesi gereken ödünleşimleri birlikte görün.'],
  ['İlişkiyi yönetin', 'Önerileri paylaşın; görüşmeleri, randevuları, görevleri ve müşteri yolculuğunu tek yerde takip edin.'],
  ['İşinizi görünür kılın', 'Portföy hareketlerini, danışman aktivitelerini, müşteri aşamalarını ve bekleyen takipleri raporlarla izleyin.'],
]
export function Promises() {
  const ref = useRef(null); const [i, setI] = useState(0); const stack = useStack()
  useTrack(ref, p => { const n = Math.min(3, Math.floor(p * 3.99)); setI(x => x === n ? x : n) })
  const Vis = ({ n }) => n === 0 ? (
    <div className="em-surface" style={{ padding: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', height: '100%', alignContent: 'start' }}>
      <div className="em-req" style={{ fontSize: '.95rem' }}>{IHTIYAC}</div>
      <ul className="em-intent" style={{ alignSelf: 'start' }}>{[['Sakinlik', 'Yüksek', 'ok'], ['Ulaşım', 'Yüksek', 'ok'], ['Evden çalışma', 'Yüksek', 'ok'], ['Uzun vadeli değer', 'Yüksek', 'ok'], ['Bölge bağlılığı', 'Esnek', 'flex']].map(s => <li key={s[0]} className="is-on"><b>{s[0]}</b><Status k={s[2]}>{s[1]}</Status></li>)}</ul>
    </div>) : n === 1 ? (
    <div className="em-surface" style={{ padding: '1rem', display: 'grid', gap: '.5rem', alignContent: 'start' }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'baseline', fontFamily: 'var(--fd)', fontSize: '1.6rem' }}><span style={{ color: 'var(--c-ink-3)', textDecoration: 'line-through' }}>12.480</span><span style={{ color: 'var(--c-ink-3)' }}>642</span><span style={{ color: 'var(--c-ink-3)' }}>38</span><span style={{ color: 'var(--c-forest)' }}>4</span></div>
      <Record foto="macka" t="Maçka · 3+1 Dönüşebilir Plan" m="4 güçlü ilişki · 1 ödünleşim" pct={92} sel /><Record foto="nisantasi" t="Nişantaşı · 2+1 Teraslı" m="Bölge isteğine birebir" pct={88} /><Record foto="fulya" t="Fulya · 3+1 Yeni Yapı" m="Bütçe üst sınırı" pct={84} />
    </div>) : n === 2 ? (
    <div className="em-surface" style={{ padding: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignContent: 'start' }}>
      <div className="em-preview"><div className="em-preview__bubble" style={{ fontSize: 'var(--t-label)' }}>Konuştuğumuz önceliklere göre öne çıkan seçenekleri sizin için bir araya getirdim.</div><ul className="em-preview__list"><li><span>Maçka · 3+1</span><b>%92</b></li><li><span>Nişantaşı · 2+1</span><b>%88</b></li></ul></div>
      <ol className="em-tl">{['3 portföy paylaşıldı', 'Müşteri geri dönüş yaptı', 'Gösterim randevusu', 'Takip görevi bekliyor'].map((z, k) => <li key={z} className={k < 2 ? 'is-done' : k === 2 ? 'is-now' : 'is-wait'}>{z}</li>)}</ol>
    </div>) : (
    <div className="em-surface" style={{ padding: '1rem', display: 'grid', gap: '.6rem', alignContent: 'start' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '.5rem' }}><Metric v="148" l="Aktif müşteri" /><Metric v="17" l="Bekleyen takip" /><Metric v="42" l="Planlı gösterim" /></div>
      <Funnel label="Müşteri aşaması" rows={[{ l: 'İhtiyaç', v: 148 }, { l: 'Öneri', v: 96 }, { l: 'Gösterim', v: 42 }, { l: 'Teklif', v: 18 }]} />
    </div>)
  return (
    <section className="em-prom" ref={ref} aria-labelledby="em-prom-h">
      <div className={stack ? '' : 'em-prom__track'}>
        <div className={stack ? 'em-wrap' : 'em-prom__stage'} style={stack ? { padding: 'var(--s8) var(--gut)' } : undefined}>
          <div className={stack ? '' : 'em-wrap em-prom__in'}>
            <div>
              <Chapter n="05">Dört söz</Chapter>
              <h2 id="em-prom-h" className="em-title" style={{ marginTop: '1rem' }}>EstateMatch ne yapar</h2>
              <ol className="em-prom__list">{SOZ.map((s, k) => <li key={s[0]} className={stack || k === i ? 'is-on' : ''}><h3>{s[0]}</h3><p>{s[1]}</p>{stack && <div className="em-prom__vis" style={{ position: 'relative', aspectRatio: 'auto', marginTop: '.8rem' }}><div className="is-on" style={{ position: 'relative' }}><Vis n={k} /></div></div>}</li>)}</ol>
            </div>
            {!stack && <div className="em-prom__vis" aria-live="polite">{[0, 1, 2, 3].map(k => <div key={k} className={k === i ? 'is-on' : ''}><Vis n={k} /></div>)}</div>}
          </div>
        </div>
      </div>
    </section>)
}

/* ═══════ 06 ÖZELLİK GALERİSİ ═══════ */
const GAL = [
  ['Müşteri ve Lead Yönetimi', 'Yeni müşterileri, talepleri, notları ve ilişki geçmişini tek kayıtta yönetin.', 'Bilgi farklı kanallarda kaybolmaz.'],
  ['Doğal Dilde İhtiyaç Kaydı', 'Müşterinin kendi cümlelerini kaydedin; EstateMatch bu ifadeleri anlamlı ihtiyaç sinyallerine dönüştürsün.', 'Uzun ve karmaşık formlar azalır.'],
  ['Akıllı Portföy Keşfi', 'Portföyleri yalnızca seçilen filtrelerle değil, müşteri bağlamıyla birlikte değerlendirin.', 'Normal aramada görünmeyen ihtimaller keşfedilir.'],
  ['Açıklanabilir Eşleşme', 'Bir mülkün neden öne çıktığını ve hangi noktalarda ödünleşim gerektirdiğini görün.', 'Öneriler daha anlaşılır ve savunulabilir olur.'],
  ['Alternatif Karşılaştırma', 'Güçlü seçenekleri müşterinin gerçek öncelikleri üzerinden yan yana değerlendirin.', 'Karar yalnızca toplam skora bırakılmaz.'],
  ['Portföy Yönetimi', 'Portföy kayıtlarını, durumlarını, danışman sahipliğini ve müşteri ilişkilerini tek merkezde yönetin.', 'Dağınık portföy bilgisi kontrol edilebilir hâle gelir.'],
  ['WhatsApp ve E-posta Paylaşımı', 'Seçilen portföyleri kişisel danışman mesajıyla müşteriye gönderin.', 'Paylaşım süreci hızlanır ve kayıt altında kalır.'],
  ['Görüşme ve İletişim Geçmişi', 'Aramaları, mesajları, notları ve müşteri geri bildirimlerini kronolojik olarak görün.', 'Danışman müşteri bağlamını kaybetmez.'],
  ['Randevu, Görev ve Hatırlatmalar', 'Gösterim randevularını, sonraki adımları ve bekleyen takipleri planlayın.', 'Takip edilmesi gereken fırsatlar unutulmaz.'],
  ['Danışman İş Akışı', 'Günlük müşteri, portföy ve takip işlerini öncelikli bir akışta yönetin.', 'Danışman ne yapması gerektiğini tek ekrandan görür.'],
  ['Rol ve Görünürlük Yönetimi', 'Yönetici ve danışmanların hangi müşteri, portföy ve raporları görebileceğini kontrollü biçimde yönetin.', 'Organizasyon büyürken veri görünürlüğü korunur.'],
  ['Yönetim ve Performans Raporları', 'Müşteri aşamalarını, portföy hareketlerini, danışman aktivitelerini ve operasyonel darboğazları izleyin.', 'Yönetim yalnızca sonuçları değil, sürecin nasıl ilerlediğini de görür.'],
]
function GalFr({ n }) {
  const H = ({ t, k, kt }) => <h4>{t}{kt && <Status k={k}>{kt}</Status>}</h4>
  switch (n) {
    case 0: return <div className="em-gal__fr"><H t="Müşteri kaydı" k="ok" kt="Aktif" /><dl className="em-kv"><dt>Müşteri</dt><dd>Deniz & Emre</dd><dt>Kaynak</dt><dd>Web talebi</dd><dt>Son not</dt><dd>Uzun vadeli değer önemli</dd><dt>İlişki</dt><dd>3 paylaşım · 1 randevu</dd></dl></div>
    case 1: return <div className="em-gal__fr"><H t="Doğal dilde ihtiyaç" /><div className="em-req" style={{ fontSize: '.95rem' }}>{IHTIYAC}</div><ul className="em-elim"><li>Sakinlik</li><li>Ulaşım</li><li>Evden çalışma</li><li>Uzun vadeli değer</li></ul></div>
    case 2: return <div className="em-gal__fr"><H t="Portföy keşfi" k="forest" kt="12.480 portföy" /><div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 4 }}>{Array.from({ length: 24 }, (_, i) => <i key={i} style={{ height: 22, borderRadius: 4, background: [3, 9, 14].includes(i) ? 'var(--c-forest)' : 'var(--c-stone)' }} />)}</div><p style={{ fontSize: 'var(--t-label)', color: 'var(--c-ink-2)', marginTop: '.5rem' }}>Filtre 642 · bağlam 4</p></div>
    case 3: return <div className="em-gal__fr"><H t="Neden eşleşti" k="ok" kt="%92" /><ul className="em-why"><li className="is-on"><q>Evden çalışabileceğimiz</q><span className="arr">→</span><span className="need">Çalışma alanı</span><span className="arr">→</span><span className="prop">Dönüşebilir oda</span></li><li className="is-on is-warn"><q>Nişantaşı</q><span className="arr">→</span><span className="need">Ödünleşim</span><span className="arr">→</span><span className="prop">11 dk dışında</span></li></ul></div>
    case 4: return <div className="em-gal__fr"><H t="Karşılaştırma" /><div className="em-cmp em-cmp--h" style={{ '--n': 2 }}><span>Ölçüt</span><span>Maçka</span><span>Nişantaşı</span></div>{[['Çalışma alanı', 'Ayrı oda', 'Salon köşesi'], ['Sakinlik', 'Yüksek', 'Orta'], ['Ulaşım', '11 dk', '4 dk']].map(r => <div key={r[0]} className="em-cmp" style={{ '--n': 2 }}><span>{r[0]}</span><span className="is-diff">{r[1]}</span><span>{r[2]}</span></div>)}</div>
    case 5: return <div className="em-gal__fr"><H t="Portföy" k="ok" kt="Aktif" /><Record foto="macka" t="Maçka · 3+1 Dönüşebilir Plan" m="Selin Kaya · 6 potansiyel ilişki" right={<Status k="muted">Bugün</Status>} /></div>
    case 6: return <div className="em-gal__fr"><H t="Paylaşım" /><div className="em-preview"><div className="em-preview__bubble" style={{ fontSize: 'var(--t-label)' }}>Öne çıkan seçenekleri ve nedenlerini sizin için bir araya getirdim.</div></div><div className="em-chan" style={{ marginTop: '.5rem' }}><button type="button" aria-pressed="true">WhatsApp</button><button type="button">E-posta</button><button type="button">Bağlantı</button></div></div>
    case 7: return <div className="em-gal__fr"><H t="İletişim geçmişi" /><ol className="em-tl">{['WhatsApp · plan soruldu', 'Arama · 6 dk', 'Not · çalışma odası önemli', 'E-posta · öneri gönderildi'].map((z, i) => <li key={z} className={i < 3 ? 'is-done' : 'is-now'}>{z}</li>)}</ol></div>
    case 8: return <div className="em-gal__fr"><H t="Randevu ve görev" /><div className="em-task"><b>Yarın 10:30</b>Maçka portföyü için teyit alınacak</div><dl className="em-kv" style={{ marginTop: '.5rem' }}><dt>Randevu</dt><dd>Cumartesi 11:00</dd><dt>Hatırlatma</dt><dd>1 saat önce</dd></dl></div>
    case 9: return <div className="em-gal__fr"><H t="Bugünün akışı" k="forest" kt="6 iş" /><ol className="em-tl">{['Deniz & Emre · teyit', 'Fulya portföyü · fiyat güncelle', 'Yeni lead · ihtiyaç kaydı', 'Gösterim · 14:00'].map((z, i) => <li key={z} className={i === 0 ? 'is-now' : 'is-wait'}>{z}</li>)}</ol></div>
    case 10: return <div className="em-gal__fr"><H t="Roller" /><dl className="em-kv"><dt>Yönetici</dt><dd>Tüm müşteri, portföy, rapor</dd><dt>Danışman</dt><dd>Kendi müşterileri ve atanmış portföyler</dd><dt>Ofis</dt><dd>Şube görünürlüğü</dd></dl></div>
    default: return <div className="em-gal__fr"><H t="Performans" /><Bars label="Danışman aktivitesi" rows={[{ l: 'Selin', v: 61 }, { l: 'Mert', v: 48 }, { l: 'Ece', v: 39 }]} /></div>
  }
}
export function Gallery() {
  const ref = useRef(null); const [i, setI] = useState(0); const stack = useStack()
  useTrack(ref, p => { const n = Math.min(11, Math.floor(p * 11.99)); setI(x => x === n ? x : n) })
  const git = n => { const el = ref.current; if (!el) return; const top = el.getBoundingClientRect().top + window.scrollY, span = el.offsetHeight - window.innerHeight; window.scrollTo({ top: top + (n + 0.5) / 12 * span, behavior: 'smooth' }) }
  if (stack) return (
    <section className="em-gal em-sec" id="ozellikler" ref={ref} aria-labelledby="em-gal-h"><div className="em-wrap"><Chapter n="06">Özellik galerisi</Chapter><h2 id="em-gal-h" className="em-title" style={{ margin: '1rem 0 1.5rem' }}>On iki yetenek</h2>
      {GAL.map((g, k) => <article key={g[0]} style={{ padding: '1.2rem 0', borderTop: '1px solid var(--c-line)' }}><div className="em-gal__num" style={{ fontSize: '2rem' }}>{String(k + 1).padStart(2, '0')}<small>/ 12</small></div><h3 className="em-gal__t" style={{ fontSize: '1.4rem' }}>{g[0]}</h3><p className="em-body" style={{ fontSize: '.95rem' }}>{g[1]}</p><p className="em-gal__ben">{g[2]}</p><div style={{ marginTop: '.8rem' }}><GalFr n={k} /></div><div className="em-gal__prog"><i style={{ '--v': (k + 1) / 12 }} /></div></article>)}
    </div></section>)
  return (
    <section className="em-gal" id="ozellikler" ref={ref} aria-labelledby="em-gal-h">
      <div className="em-gal__track"><div className="em-gal__stage"><div className="em-wrap em-gal__in">
        <div>
          <Chapter n="06">Özellik galerisi</Chapter>
          <div className="em-gal__num" aria-live="polite">{String(i + 1).padStart(2, '0')}<small>/ 12</small></div>
          <h2 id="em-gal-h" className="em-gal__t">{GAL[i][0]}</h2>
          <p className="em-body" style={{ maxWidth: 480 }}>{GAL[i][1]}</p>
          <p className="em-gal__ben">{GAL[i][2]}</p>
          <div className="em-gal__prog" role="progressbar" aria-valuemin="1" aria-valuemax="12" aria-valuenow={i + 1}><i style={{ '--v': (i + 1) / 12 }} /></div>
          <div className="em-gal__dots">{GAL.map((g, k) => <button key={g[0]} type="button" className={k === i ? 'is-on' : ''} aria-label={`${k + 1}. ${g[0]}`} onClick={() => git(k)} />)}</div>
        </div>
        <div className="em-gal__vis">{GAL.map((g, k) => <div key={g[0]} className={k === i ? 'is-on' : ''} aria-hidden={k !== i}><GalFr n={k} /></div>)}</div>
      </div></div></div>
    </section>)
}

/* ═══════ 07 KOLAYLIK ═══════ */
const ADIM = [
  ['İhtiyacı doğal biçimde yazın.', 'Müşterinin cümlesi olduğu gibi kaydedilir.', 'Anlamlandırmayı başlatın.'],
  ['EstateMatch anlamlandırmayı başlatsın.', 'İfadeler 8 öncelik sinyaline dönüşür; danışman düzeltebilir.', 'Portföylerde arayın.'],
  ['Neden eşleştiğini görün.', 'Her neden: ifade → ihtiyaç → mülk özelliği.', 'Alternatifleri karşılaştırın.'],
  ['Karşılaştırın ve notunuzu ekleyin.', 'Farklar öne çıkar, notunuz kayda geçer.', 'Seçimi müşteri için oluşturun.'],
  ['Müşterinizle paylaşın.', 'Kişisel mesajla, seçtiğiniz kanaldan, kayıt altında.', 'Takip görevi oluşturun.'],
  ['Sonraki adımı planlayın.', 'Randevu, görev ve hatırlatma tek yerde.', 'Aşamayı güncelleyin.'],
  ['Sonuçları tek yerden izleyin.', 'Huni, aktivite ve bekleyen takipler görünür.', 'Raporu ekiple paylaşın.'],
]
export function Ease() {
  const [i, setI] = useState(0)
  const onKey = e => { if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); setI(x => Math.min(6, x + 1)) } if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); setI(x => Math.max(0, x - 1)) } }
  const Panel = () => [
    <div key="0" className="em-field"><label htmlFor="em-ease-t">Doğal dilde ihtiyaç</label><textarea id="em-ease-t" className="em-ta" defaultValue={IHTIYAC} /></div>,
    <ul key="1" className="em-intent">{[['Sakinlik', 'Yüksek', 'ok'], ['Evden çalışma', 'Yüksek', 'ok'], ['Bölge bağlılığı', 'Esnek', 'flex']].map(s => <li key={s[0]} className="is-on"><b>{s[0]}</b><Status k={s[2]}>{s[1]}</Status></li>)}</ul>,
    <ul key="2" className="em-why"><li className="is-on"><q>Evden çalışabileceğimiz</q><span className="arr">→</span><span className="need">Çalışma alanı</span><span className="arr">→</span><span className="prop">Ayrı odaya dönüşebilen plan</span></li></ul>,
    <div key="3"><div className="em-cmp em-cmp--h" style={{ '--n': 2 }}><span>Ölçüt</span><span>Maçka</span><span>Nişantaşı</span></div><div className="em-cmp" style={{ '--n': 2 }}><span>Çalışma alanı</span><span className="is-diff">Ayrı oda</span><span>Salon köşesi</span></div><div className="em-cmp" style={{ '--n': 2 }}><span>Danışman notu</span><span>Uzun vadede dengeli</span><span>Bölgeye birebir</span></div></div>,
    <div key="4" className="em-preview"><div className="em-preview__bubble">Konuştuğumuz önceliklere göre öne çıkan seçenekleri sizin için bir araya getirdim.</div><div className="em-chan" style={{ marginTop: '.5rem' }}><button type="button" aria-pressed="true">WhatsApp</button><button type="button">E-posta</button></div></div>,
    <div key="5" className="em-task"><b>Yarın 10:30</b>Maçka portföyü için teyit alınacak · hatırlatma 1 saat önce</div>,
    <div key="6" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '.5rem' }}><Metric v="148" l="Aktif müşteri" /><Metric v="17" l="Bekleyen takip" /><Metric v="42" l="Planlı gösterim" /></div>,
  ][i]
  return (
    <section className="em-sec" aria-labelledby="em-ease-h">
      <div className="em-wrap">
        <Chapter n="07">Kullanım kolaylığı</Chapter>
        <h2 id="em-ease-h" className="em-major em-copy" style={{ marginTop: '1rem' }}>Güçlü sistemler karmaşık görünmek zorunda değildir.</h2>
        <div className="em-ease__strip">
          <ol className="em-steps" aria-label="Yedi adım" onKeyDown={onKey}>{ADIM.map((a, k) => <li key={a[0]}><button type="button" aria-current={k === i ? 'step' : undefined} onClick={() => setI(k)}><span>{k + 1}</span><span>{a[0]}</span></button></li>)}</ol>
          <div className="em-surface em-ease__panel" aria-live="polite">
            <div className="em-state"><div className="em-state__h"><h3 className="em-screen-h">{ADIM[i][0]}</h3><Status k="forest">Adım {i + 1} / 7</Status></div><div className="em-state__b"><Panel /></div></div>
            <div className="em-ease__meta"><div><b>Eylem</b>{ADIM[i][0]}</div><div><b>Sonuç</b>{ADIM[i][1]}</div><div><b>Sonraki adım</b>{ADIM[i][2]}</div></div>
            <div className="em-ease__nav"><Btn sm s disabled={i === 0} onClick={() => setI(x => Math.max(0, x - 1))}>Önceki</Btn><Btn sm p disabled={i === 6} onClick={() => setI(x => Math.min(6, x + 1))} icon="→">Sonraki</Btn></div>
          </div>
        </div>
      </div>
    </section>)
}

/* ═══════ 08 YÖNETİM DEĞERİ ═══════ */
const SORUN = [
  ['Müşteri taleplerinin farklı yerlerde tutulması', 'Müşteri ve lead yönetimi', 'Tek kayıt, tek bağlam'],
  ['Portföy bilgilerinin dağınık olması', 'Portföy yönetimi', 'Durum, sahiplik, ilişki tek merkezde'],
  ['Danışman takiplerinin görünmemesi', 'Danışman iş akışı', 'Günlük öncelikli akış'],
  ['Paylaşımların kayıt altında olmaması', 'WhatsApp ve e-posta paylaşımı', 'Her paylaşım geçmişte'],
  ['Eşleşme nedenlerinin açıklanamaması', 'Açıklanabilir eşleşme', 'İfade → ihtiyaç → özellik'],
  ['Bekleyen müşteri aksiyonlarının unutulması', 'Randevu, görev ve hatırlatmalar', 'Sonraki adım her zaman görünür'],
  ['Yönetimin yalnızca sonuca bakabilmesi', 'Yönetim ve performans raporları', 'Süreç, darboğaz, aktivite'],
]
export function Management() {
  const ref = useRef(null); const [on, setOn] = useState(false)
  useReveal(ref, p => setOn(v => v || p > 0.3))
  return (
    <section className={`em-sec em-mgmt${on ? ' is-on' : ''}`} id="yonetim" ref={ref} aria-labelledby="em-mgmt-h">
      <div className="em-wrap">
        <Chapter n="08">Yönetim değeri</Chapter>
        <h2 id="em-mgmt-h" className="em-major em-copy" style={{ marginTop: '1rem' }}>Daha fazla veri değil.<br />Daha görünür bir süreç.</h2>
        <div className="em-mgmt__flow">
          <div className="em-mgmt__col em-mgmt__col--p"><h3>Dağınık</h3><ul>{SORUN.map((s, i) => <li key={s[0]} style={{ '--dx': (i % 2 ? 1 : -1) * (18 + i * 6), '--dy': (i % 3 - 1) * 10, '--r': (i % 2 ? 1 : -1) * (1.2 + i * 0.3) }}>{s[0]}</li>)}</ul></div>
          <div className="em-mgmt__link" aria-hidden="true" />
          <div className="em-mgmt__col em-mgmt__col--s"><h3>Bağlı</h3><ul>{SORUN.map((s, i) => <li key={s[1]} style={{ '--i': i }}><b>{s[1]}</b>{s[2]}</li>)}</ul></div>
        </div>
      </div>
    </section>)
}

/* ═══════ 09 GÜVEN ═══════ */
export function Trust() {
  const [bolge, setBolge] = useState('Kesin'); const [sec, setSec] = useState(null)
  return (
    <section className="em-sec" aria-labelledby="em-trust-h" style={{ background: 'var(--c-canvas-2)' }}>
      <div className="em-wrap">
        <Chapter n="09">İnsan kontrolü ve güven</Chapter>
        <div className="em-trust__ax"><p className="em-major" style={{ fontSize: 'var(--t-title)' }}>EstateMatch karar vermez.<br />Göremediğiniz ihtimalleri görünür kılar.</p><p className="em-major" style={{ fontSize: 'var(--t-title)' }}>Teknoloji bağlantıyı keşfeder.<br />Anlamını insan değerlendirir.</p></div>
        <p id="em-trust-h" className="em-body em-copy" style={{ marginTop: 'var(--s5)' }}>Eşleşme nedenleri, kullanılan müşteri öncelikleri ve değerlendirilmesi gereken ödünleşimler danışmana açık biçimde sunulur. Danışman öneriyi düzenleyebilir, karşılaştırabilir ve nihai kararı müşteri bağlamıyla birlikte verir.</p>
        <div className="em-trust__flow">
          <div className="em-trust__step"><h3>1 · Sistem önerisi</h3><Record foto="macka" t="Maçka · 3+1 Dönüşebilir Plan" m="₺14.850.000" pct={92} /></div>
          <div className="em-trust__step"><h3>2 · Açıklama</h3><ul className="em-why"><li className="is-on"><q>Evden çalışabileceğimiz</q><span className="arr">→</span><span className="need">Çalışma alanı</span><span className="arr">→</span><span className="prop">Dönüşebilir oda</span></li><li className="is-on is-warn"><q>Nişantaşı</q><span className="arr">→</span><span className="need">Ödünleşim</span><span className="arr">→</span><span className="prop">11 dk dışında</span></li></ul></div>
          <div className="em-trust__step"><h3>3 · Danışman düzenlemesi</h3><div className="em-field"><label htmlFor="em-tr-b">Bölge bağlılığı</label><select id="em-tr-b" className="em-sel" value={bolge} onChange={e => setBolge(e.target.value)}><option>Kesin</option><option>Esnek</option></select></div><div className="em-field" style={{ marginTop: '.5rem' }}><label htmlFor="em-tr-n">Danışman notu</label><input id="em-tr-n" className="em-in" defaultValue="Bölge esnek; çalışma odası kritik." /></div>{bolge === 'Esnek' && <Status k="ok">Öncelik düzeltildi</Status>}</div>
          <div className={`em-trust__step${sec ? ' em-trust__step--h' : ''}`}><h3>4 · Nihai insan seçimi</h3><div style={{ display: 'grid', gap: '.4rem' }}><Btn sm on={sec === 'macka'} onClick={() => setSec('macka')} aria-pressed={sec === 'macka'}>Maçka’yı öne çıkar</Btn><Btn sm on={sec === 'nis'} onClick={() => setSec('nis')} aria-pressed={sec === 'nis'}>Nişantaşı’nı öne çıkar</Btn></div>{sec ? <Status k="ok">Karar danışmanda: {sec === 'macka' ? 'Maçka' : 'Nişantaşı'} öne çıkarıldı, diğeri alternatif olarak kaldı</Status> : <Status k="muted">Seçim bekleniyor</Status>}</div>
        </div>
      </div>
    </section>)
}

/* ═══════ 10 SON CTA ═══════ */
export function Final({ onDemo, onExplore, onContact }) {
  const ref = useRef(null); const [p, setP] = useState(0)
  useReveal(ref, v => { const q = Math.round(v * 20) / 20; setP(x => x === q ? x : q) })
  const fr = [[8, 22, 'macka', POS[0]], [91, 18, 'fulya', POS[1]], [7, 66, 'nisantasi', POS[2]], [93, 72, 'detail', POS[3]], [82, 96, 'fulya', POS[3]]]
  return (
    <section className="em-final" ref={ref} aria-labelledby="em-final-h">
      <div aria-hidden="true">{fr.map((f, i) => <div key={i} className="em-frag em-frag--photo" style={{ '--x': f[0] / 100 * (typeof window !== 'undefined' ? window.innerWidth : 1400), '--y': f[1] * 5 + (1 - p) * 40 * (i % 2 ? 1 : -1), '--o': 0.35 + p * 0.5 }}><Foto k={f[2]} size={640} pos={f[3]} alt="" /></div>)}</div>
      <div className="em-wrap em-final__in">
        <Chapter n="10">Davet</Chapter>
        <h2 id="em-final-h" className="em-hero-h" lang="en" style={{ marginTop: '1rem' }}>Some places are searched for.<br />Others are discovered.</h2>
        <p className="em-body" style={{ marginTop: 'var(--s5)' }}>EstateMatch; müşteriyi anlamayı, doğru ihtimalleri keşfetmeyi, eşleşmeleri açıklamayı ve bütün danışmanlık sürecini tek yerde yönetmeyi sağlar.</p>
        <div className="em-final__cta"><Btn p icon="→" onClick={onDemo}>Demo talep edin</Btn><Btn onClick={onExplore}>EstateMatch’i keşfedin</Btn></div>
        <div className="em-final__meta">
          <span>Emlak danışmanları ve acenteler için</span>
          <span className="em-final__sig"><img src="/sryverse-logo.png" alt="SRYVERSE" width="110" height="22" /></span>
          <a href="/#contact" onClick={e => { e.preventDefault(); onContact() }}>İletişim</a>
          <a href={WA} target="_blank" rel="noopener noreferrer">WhatsApp</a>
        </div>
      </div>
    </section>)
}
