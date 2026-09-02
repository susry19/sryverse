/* Sabit ürün kabuğunun 11 durumu. Her biri gerçek, okunur HTML. */
import { useState } from 'react'
import { Btn, Status, Signal, Record, Metric, Foto, Plan, Bars, Funnel, Donut, Line, SaveBtn } from './ui.jsx'
import { kapi } from './scroll.js'

export const IHTIYAC = 'Şehirden kopmadan, daha sakin, evden çalışabileceğimiz ve birkaç yıl sonra da doğru karar olduğunu hissedeceğimiz bir yer arıyoruz.'
const PARCA = [
  { t: 'Şehirden kopmadan', s: 'Ulaşım' }, { t: 'daha sakin', s: 'Sakinlik' },
  { t: 'evden çalışabileceğimiz', s: 'Evden çalışma' }, { t: 'birkaç yıl sonra da doğru karar olduğunu hissedeceğimiz', s: 'Uzun vadeli değer' },
]
export const DURUMLAR = [
  { id: 'ihtiyac', t: 'Müşteri ihtiyacı', x: 'Danışman, müşterinin kendi cümlesini kaydeder. Form değil, bağlam.' },
  { id: 'harita', t: 'Niyetin anlamlandırılması', x: 'İfadeler önceliklere dönüşür; danışman çıkarımı düzeltebilir.' },
  { id: 'evren', t: 'Portföy evreni', x: 'Binlerce kayıt aynı anda, birden fazla boyutta değerlendirilir.' },
  { id: 'iliski', t: 'İlişki keşfi', x: 'Görünmeyen bağlar ortaya çıkar; uymayanlar nedeniyle elenir.' },
  { id: 'eslesme', t: 'Eşleşme bulundu', x: 'Sonuç bir yüzde değil, açıklanabilir bir ilişkidir.' },
  { id: 'neden', t: 'Eşleşme nedenleri', x: 'Her neden: müşteri ifadesi, yorumlanan ihtiyaç, mülk özelliği.' },
  { id: 'karsilastir', t: 'Alternatif karşılaştırma', x: 'Skor değil fark. Danışman not düşer, öne çıkanı seçer.' },
  { id: 'paylas', t: 'Müşteriyle paylaşma', x: 'Seçim kişisel bir mesajla, kayıt altında paylaşılır.' },
  { id: 'crm', t: 'CRM ve takip', x: 'Eşleşme bir ilişkiye dönüşür: görüşme, randevu, görev.' },
  { id: 'portfoy', t: 'Portföy yönetimi', x: 'Dağınık portföy bilgisi karar verilebilir bir sisteme dönüşür.' },
  { id: 'rapor', t: 'Raporlama', x: 'Süreç görünür olur: nerede ilerliyor, nerede fırsat kaçıyor.' },
]

function Head({ t, k, kt, demo }) {
  return <div className="em-state__h"><h3 className="em-screen-h">{t}</h3>{demo && <span className="em-state__demo">Temsili demo verisi</span>}{kt && <Status k={k}>{kt}</Status>}</div>
}

/* 01 */
export function S01({ sub, stack }) {
  const [dirty, setDirty] = useState(false)
  const [txt, setTxt] = useState(IHTIYAC)
  const p = stack ? 1 : sub
  const vurgu = kapi(p, 0.2, 0.55), ayril = kapi(p, 0.55, 0.95)
  let idx = 0
  const parcalar = []
  PARCA.forEach((pc, i) => { const at = txt.indexOf(pc.t); if (at < 0) return
    if (at > idx) parcalar.push(<span key={'n' + i}>{txt.slice(idx, at)}</span>)
    parcalar.push(<mark key={'m' + i} className={`em-mark${vurgu > (i + 1) / 5 ? '' : ' is-off'}`}>{pc.t}</mark>); idx = at + pc.t.length })
  parcalar.push(<span key="son">{txt.slice(idx)}</span>)
  return (
    <div className="em-state__b">
      <Head t="Müşteri ihtiyacı" k="muted" kt="Deniz & Emre · Danışman: Selin Kaya" demo />
      <div className="em-two em-two--w">
        <div>
          <div className="em-field"><label htmlFor="em-ihtiyac">Doğal dilde ihtiyaç</label>
            {ayril < 0.02 || stack ? <textarea id="em-ihtiyac" className="em-ta em-ta--big" value={txt} onChange={e => { setTxt(e.target.value); setDirty(true) }} aria-describedby="em-ihtiyac-not" />
              : <div className="em-req" aria-live="polite">{parcalar}</div>}
            <small id="em-ihtiyac-not" style={{ fontSize: 'var(--t-label)', color: 'var(--c-ink-3)' }}>Müşterinin kendi cümlesi. Filtre değil, bağlam.</small>
          </div>
          {!stack && ayril < 0.02 && <div className="em-req" style={{ marginTop: '.6rem', fontSize: '.95rem' }}>{parcalar}</div>}
          <div className="em-kv" style={{ marginTop: '.8rem' }}>
            <dt>Müşteri</dt><dd>Deniz & Emre</dd>
            <dt>İletişim tercihi</dt><dd>WhatsApp</dd>
            <dt>Bütçe aralığı</dt><dd>₺12.000.000 – ₺16.000.000</dd>
          </div>
          <details className="em-disc"><summary>Diğer ayrıntılar</summary>
            <dl className="em-kv"><dt>Öncelikli bölge</dt><dd>Nişantaşı ve çevresi</dd><dt>Temel gereksinimler</dt><dd>En az 2+1 · Aydınlık · Ulaşıma yakın</dd><dt>Danışman notu</dt><dd>Bölge konusunda esnek olabilirler; uzun vadeli değer önemli.</dd></dl>
          </details>
        </div>
        <div>
          <p className="em-ph">Ayrışan sinyaller</p>
          {ayril < 0.05 && !stack ? <div className="em-empty">Cümle anlamlandırılınca sinyaller burada belirir.</div> :
            <ul className="em-intent">{PARCA.map((pc, i) => <li key={pc.s} className={ayril > (i + 1) / 5 || stack ? 'is-on' : ''}><b>{pc.s}</b><small>“{pc.t}”</small><Status k="forest">Sinyal</Status></li>)}</ul>}
        </div>
      </div>
      <div className="em-shell__foot" style={{ margin: '0 -1.25rem -1.1rem' }}>
        <span className={`em-shell__save${dirty ? ' is-dirty' : ' is-ok'}`}>{dirty ? 'Kaydedilmemiş değişiklik' : 'Kaydedildi · bugün 09:41'}</span>
        <SaveBtn dirty={dirty} onSaved={() => setDirty(false)} />
        <Btn p sm icon="→">İhtiyacı anlamlandır</Btn>
      </div>
    </div>)
}

/* 02 */
const SINYAL = [
  ['Sakinlik', 'Yüksek öncelik', 'ok', '“daha sakin”'], ['Ulaşım', 'Yüksek öncelik', 'ok', '“şehirden kopmadan”'],
  ['Evden çalışma', 'Yüksek öncelik', 'ok', '“evden çalışabileceğimiz”'], ['Yaşam ritmi', 'Orta/yüksek öncelik', 'forest', 'danışman gözlemi'],
  ['Uzun vadeli değer', 'Yüksek öncelik', 'ok', '“birkaç yıl sonra da doğru karar”'], ['Bütçe esnekliği', 'Orta öncelik', 'forest', 'danışman notu'],
  ['Çevre olanakları', 'Orta öncelik', 'forest', 'bağlam çıkarımı'],
]
export function S02({ sub, stack }) {
  const [bolge, setBolge] = useState('Kesin')
  const [dz, setDz] = useState(false)
  const p = stack ? 1 : sub
  const goster = Math.floor(kapi(p, 0.1, 0.7) * 8.99)
  const duzelt = stack ? true : p > 0.8
  return (
    <div className="em-state__b">
      <Head t="İhtiyaç haritası" k="forest" kt="8 sinyal" demo />
      <div className="em-two">
        <div>
          <p className="em-ph">Orijinal talep</p>
          <div className="em-req" style={{ fontSize: '1rem' }}>{IHTIYAC}</div>
          <p className="em-body" style={{ fontSize: 'var(--t-ui)', marginTop: '.8rem' }}>EstateMatch, müşterinin yazdığı talebi filtrelere dönüştürmekle kalmaz; ifadeler arasındaki bağlamı ve danışman gözlemini birlikte değerlendirir.</p>
        </div>
        <div>
          <p className="em-ph">Niyet haritası</p>
          <ul className="em-intent">
            {SINYAL.map((s, i) => <li key={s[0]} className={goster > i || stack ? 'is-on' : ''}><b>{s[0]}</b><small>{s[3]}</small><Status k={s[2]}>{s[1]}</Status></li>)}
            <li className={goster > 7 || stack ? 'is-on' : ''}><b>Bölge bağlılığı</b><small>{bolge === 'Kesin' ? 'çıkarım' : 'danışman düzeltti'}</small>
              {dz ? <select aria-label="Bölge bağlılığı önceliği" value={bolge} onChange={e => { setBolge(e.target.value); setDz(false) }}><option>Kesin</option><option>Esnek</option></select>
                : <Status k={bolge === 'Esnek' ? 'flex' : 'warn'}>{bolge}</Status>}
            </li>
          </ul>
          {duzelt && bolge === 'Kesin' && !dz && <p style={{ fontSize: 'var(--t-label)', color: 'var(--c-ink-3)', marginTop: '.5rem' }}>Danışman notu bölgede esneklik söylüyor. <button className="em-btn em-btn--xs" onClick={() => setDz(true)}>Düzelt</button></p>}
          {bolge === 'Esnek' && <p style={{ fontSize: 'var(--t-label)', color: 'var(--c-ok)', marginTop: '.5rem' }}>Bölge bağlılığı “Esnek” olarak güncellendi. Çıkarım danışman tarafından düzeltildi.</p>}
        </div>
      </div>
      <div className="em-shell__foot" style={{ margin: '0 -1.25rem -1.1rem' }}>
        <Status k="ok">Onaylanmaya hazır</Status>
        <Btn s sm onClick={() => setDz(true)}>Öncelikleri düzenle</Btn>
        <Btn p sm icon="→">Portföylerde ara</Btn>
      </div>
    </div>)
}

/* 03 + 04 paylaşılan evren */
const KUME = ['Bölge kümeleri', 'Plan uygunluğu', 'Ulaşım ilişkisi', 'Fiyat/değer dengesi', 'Yaşam biçimi sinyalleri', 'Danışman portföyleri']
function rnd(s) { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x) }
const NOKTA = Array.from({ length: 96 }, (_, i) => {
  const g = i % 6, cx = [22, 62, 82, 38, 70, 18][g], cy = [26, 22, 60, 72, 82, 68][g]
  return { i, g, x0: 6 + rnd(i) * 88, y0: 8 + rnd(i + 9) * 84, x1: cx + (rnd(i + 3) - .5) * 22, y1: cy + (rnd(i + 5) - .5) * 20, kal: i % 24 === 0 || i === 7 || i === 19 }
})
export function Evren({ p, iliski, stack }) {
  const kume = stack ? 1 : kapi(p, 0.15, 0.7)
  const dar = iliski ? kapi(p, 0.1, 0.9) : 0
  return (
    <div className="em-universe2" aria-label="Portföy evreni görselleştirmesi">
      <svg className="em-u2__lines" aria-hidden="true">
        {iliski && [[7, 19], [24, 48], [72, 96], [19, 48], [7, 72]].map(([a, b], i) => { const A = NOKTA[a % 96], B = NOKTA[b % 96]
          return <line key={i} x1={A.x1 + '%'} y1={A.y1 + '%'} x2={B.x1 + '%'} y2={B.y1 + '%'} className={dar > 0.3 + i * 0.1 ? 'is-on' : ''} /> })}
      </svg>
      {NOKTA.map(n => { const x = n.x0 + (n.x1 - n.x0) * kume, y = n.y0 + (n.y1 - n.y0) * kume
        const out = iliski && !n.kal && dar > 0.25 + (n.i % 7) * 0.09
        return <i key={n.i} className={`em-u2__dot${n.kal ? ' is-c' : ''}${out ? ' is-out' : ''}`} style={{ '--x': x, '--y': y }} /> })}
      {KUME.map((k, i) => <span key={k} className={`em-u2__lbl${kume > 0.5 + i * 0.07 ? ' is-on' : ''}`} style={{ left: [22, 62, 82, 38, 70, 18][i] + '%', top: ([26, 22, 60, 72, 82, 68][i] - 13) + '%' }}>{k}</span>)}
      <div className="em-u2__count"><b>{iliski ? [12480, 642, 38, 4][Math.min(3, Math.floor(dar * 3.99))].toLocaleString('tr-TR') : Math.round(12480 * Math.min(1, 0.2 + kume * 0.8)).toLocaleString('tr-TR')}</b>{iliski ? 'kalan portföy' : 'analiz edilen portföy'}</div>
    </div>)
}
export function S03({ sub, stack }) {
  return (
    <div className="em-state__b">
      <Head t="Portföy keşfi" k="forest" kt="12.480 aktif portföy" demo />
      <div className="em-two em-two--w" style={{ minHeight: 300 }}>
        <Evren p={sub} stack={stack} />
        <div>
          <p className="em-ph">Seçili müşteri niyeti</p>
          <div className="em-kv"><dt>Müşteri</dt><dd>Deniz & Emre</dd><dt>Yüksek öncelik</dt><dd>Sakinlik · Ulaşım · Evden çalışma · Uzun vadeli değer</dd><dt>Esnek</dt><dd>Bölge bağlılığı</dd></div>
          <p className="em-ph" style={{ marginTop: '.9rem' }}>Aktif analiz ölçütleri</p>
          <ul className="em-elim" style={{ margin: 0 }}>{KUME.map(k => <li key={k}>{k}</li>)}</ul>
          <p className="em-axiom" style={{ fontSize: '1.15rem', marginTop: '1rem' }}>Aramak seçenekleri sıralar.<br />Anlamak ilişkileri görünür kılar.</p>
        </div>
      </div>
      <div className="em-shell__foot" style={{ margin: '0 -1.25rem -1.1rem' }}>
        <Status k="forest">Arama sürüyor · 6 boyut</Status>
        <Btn s sm>Duraklat</Btn><Btn s sm>İncele</Btn>
      </div>
    </div>)
}

/* 04 */
const ILISKI = [['Evden çalışma', 'Dönüştürülebilir ayrı oda'], ['Sakinlik', 'Düşük çevresel yoğunluk'], ['Ulaşım', 'Gerçek erişim süresi'], ['Yaşam ritmi', 'Yürünebilir çevre'], ['Uzun vadeli değer', 'Bölgesel gelişim'], ['Bütçe esnekliği', 'Toplam değer dengesi']]
export function S04({ sub, stack }) {
  const p = stack ? 1 : sub
  const adim = Math.min(3, Math.floor(kapi(p, 0.1, 0.9) * 3.99))
  const felsefe2 = stack || p > 0.62
  return (
    <div className="em-state__b">
      <Head t="Görünmeyen ilişkiler" k="forest" kt="6 ilişki" demo />
      <div className="em-two em-two--w" style={{ minHeight: 300 }}>
        <Evren p={p} iliski stack={stack} />
        <div>
          <div className="em-narrow" aria-label="Daralma dizisi">
            {[12480, 642, 38, 4].map((n, i) => <span key={n}><b className={i === adim ? 'is-on' : i < adim ? 'is-past' : ''}>{n.toLocaleString('tr-TR')}</b>{i < 3 && <i> → </i>}</span>)}
          </div>
          <ul className="em-elim" aria-label="Eleme nedenleri">
            {[['Plan uyumu düşük', 0.25], ['Erişim süresi yüksek', 0.45], ['Değer dengesi zayıf', 0.65]].map(([e, at]) => (p > at || stack) && <li key={e}>{e}</li>)}
          </ul>
          <p className="em-ph" style={{ marginTop: '.8rem' }}>Kurulan ilişkiler</p>
          <ul className="em-rel">{ILISKI.map((r, i) => <li key={r[0]} className={p > 0.15 + i * 0.1 || stack ? 'is-on' : ''}><span>{r[0]}</span><svg viewBox="0 0 22 10" aria-hidden="true"><line x1="0" y1="5" x2="22" y2="5" /></svg><span>{r[1]}</span></li>)}</ul>
          <p className="em-axiom" style={{ fontSize: '1.1rem', marginTop: '.9rem' }}>Tesadüfü üretmiyoruz.{felsefe2 && <><br />Onu fark etme ihtimalini artırıyoruz.</>}</p>
        </div>
      </div>
      <div className="em-shell__foot" style={{ margin: '0 -1.25rem -1.1rem' }}><Status k="muted">Elenenler hata değil, öncelik dışı</Status><Btn s sm>Elenenleri gör</Btn></div>
    </div>)
}

/* 05 */
export function S05() {
  const [liste, setListe] = useState(false)
  return (
    <div className="em-state__b">
      <Head t="Eşleşme bulundu" k="ok" kt="Açıklanabilir" demo />
      <div className="em-found">
        <div className="em-found__img"><Foto k="macka" size={1024} loading="lazy" /></div>
        <div>
          <h4 className="em-screen-h" style={{ fontSize: '1.35rem' }}>Maçka · 3+1 Dönüşebilir Plan</h4>
          <p style={{ color: 'var(--c-ink-2)', fontSize: 'var(--t-ui)' }}>Maçka, İstanbul</p>
          <div className="em-found__pct">%92<small>anlamlı uyum</small></div>
          <div className="em-found__facts"><Status>₺14.850.000</Status><Status>3+1</Status><Status>165 m²</Status><Status>Maçka</Status></div>
          <p className="em-found__sum"><b>4 güçlü ilişki:</b> dönüşebilir çalışma alanı, merkeze erişimi koruyan sakin çevre, bütçe içinde uzun vadeli değer, günlük ritme uyumlu çevre.</p>
          <p className="em-found__sum" style={{ marginTop: '.4rem' }}><b style={{ color: 'var(--c-warn)' }}>1 değerlendirilmesi gereken ödünleşim:</b> ilk talep edilen bölgenin yaklaşık 11 dakika dışında.</p>
        </div>
      </div>
      <div className="em-shell__foot" style={{ margin: '0 -1.25rem -1.1rem' }}>
        <Status k="muted">Karar danışmanda</Status>
        <Btn s sm on={liste} ok={liste} onClick={() => setListe(v => !v)}>{liste ? 'Listede' : 'Listeye ekle'}</Btn>
        <Btn s sm>Alternatiflerle karşılaştır</Btn><Btn p sm icon="→">Neden eşleştiğini gör</Btn>
      </div>
    </div>)
}

/* 06 */
const NEDEN = [
  ['Evden çalışabileceğimiz', 'Odaklanmış çalışma alanı', 'Ayrı odaya dönüşebilen plan', 'Ayrı çalışma alanına dönüşebilen plan'],
  ['Daha sakin, şehirden kopmadan', 'Sakin ama erişilebilir çevre', 'Merkeze 11 dk, düşük çevresel yoğunluk', 'Merkeze erişimi koruyan daha sakin çevre'],
  ['Birkaç yıl sonra da doğru karar', 'Uzun vadeli değer', 'Bölgesel gelişim, bütçe içinde', 'Bütçe içinde güçlü uzun vadeli değer'],
  ['Danışman gözlemi: günlük ritim', 'Yürünebilir günlük yaşam', 'Yürüme mesafesinde çevre olanakları', 'Müşterinin günlük yaşam ritmiyle uyumlu çevre'],
]
export function S06({ sub, stack }) {
  const p = stack ? 1 : sub
  const [dogru, setDogru] = useState(false)
  return (
    <div className="em-state__b">
      <Head t="Bu ilişki neden anlamlı?" k="forest" kt="4 güçlü neden" demo />
      <ul className="em-why">
        {NEDEN.map((n, i) => <li key={n[0]} className={p > 0.08 + i * 0.14 || stack ? 'is-on' : ''}><q>{n[0]}</q><span className="arr" aria-hidden="true">→</span><span className="need">{n[1]}</span><span className="arr" aria-hidden="true">→</span><span className="prop">{n[2]}</span><small>{n[3]}</small></li>)}
        <li className={`is-warn${p > 0.7 || stack ? ' is-on' : ''}`}><q>Nişantaşı ve çevresi</q><span className="arr" aria-hidden="true">→</span><span className="need">Ödünleşim</span><span className="arr" aria-hidden="true">→</span><span className="prop">İlk talep edilen bölgenin yaklaşık 11 dakika dışında.</span><small>Danışman notu bölgede esneklik öngörmüştü.</small></li>
        <li className={`is-find${p > 0.82 || stack ? ' is-on' : ''}`}><q>Talep edilmedi</q><span className="arr" aria-hidden="true">→</span><span className="need">Beklenmedik keşif: açık alan</span><span className="arr" aria-hidden="true">→</span><span className="prop">Teraslı plan</span><small>Müşteri açık alan talep etmedi; kullanım alışkanlıkları bu ihtiyacın karar üzerinde etkili olabileceğini gösterdi.</small></li>
      </ul>
      <p className="em-axiom" style={{ fontSize: '1.1rem' }}>EstateMatch karar vermez.<br />Göremediğiniz ihtimalleri görünür kılar.</p>
      <div className="em-shell__foot" style={{ margin: '0 -1.25rem -1.1rem' }}>
        <Status k={dogru ? 'ok' : 'muted'}>{dogru ? 'İlişki doğrulandı' : 'Doğrulama bekliyor'}</Status>
        <Btn s sm>Danışman notu ekle</Btn><Btn s sm>Önceliği düzenle</Btn><Btn p sm ok={dogru} onClick={() => setDogru(true)}>{dogru ? 'Doğrulandı' : 'İlişkiyi doğrula'}</Btn>
      </div>
    </div>)
}

/* 07 */
const ADAY = [
  { id: 'macka', t: 'Maçka · 3+1 Dönüşebilir Plan', pct: 92, f: 'macka', fiyat: '₺14.850.000', plan: 'Yüksek', calis: 'Ayrı oda', sakin: 'Yüksek', ulasim: '11 dk', cevre: 'Yürünebilir', deger: 'Güçlü', to: 'Bölge dışında', not: 'Uzun vadede en dengeli' },
  { id: 'nis', t: 'Nişantaşı · 2+1 Teraslı', pct: 88, f: 'nisantasi', fiyat: '₺15.400.000', plan: 'Orta', calis: 'Salon köşesi', sakin: 'Orta', ulasim: '4 dk', cevre: 'Yoğun', deger: 'Orta', to: 'Çalışma alanı zayıf', not: 'Bölge isteğine birebir' },
  { id: 'ful', t: 'Fulya · 3+1 Yeni Yapı', pct: 84, f: 'fulya', fiyat: '₺15.900.000', plan: 'Yüksek', calis: 'Ayrı oda', sakin: 'Orta', ulasim: '7 dk', cevre: 'Karma', deger: 'Orta', to: 'Bütçe üst sınırı', not: 'Yeni yapı, aidat yüksek' },
  { id: 'tes', t: 'Teşvikiye · 2+1 Tarihi Yapı', pct: 81, f: 'detail', fiyat: '₺13.700.000', plan: 'Düşük', calis: 'Yok', sakin: 'Yüksek', ulasim: '5 dk', cevre: 'Yürünebilir', deger: 'Güçlü', to: 'Yenileme gerekir', not: 'Karakterli, sakin sokak' },
]
const KRIT = [['fiyat', 'Fiyat'], ['plan', 'Plan uygunluğu'], ['calis', 'Çalışma alanı'], ['sakin', 'Sakinlik'], ['ulasim', 'Ulaşım'], ['cevre', 'Çevre'], ['deger', 'Uzun vadeli değer'], ['to', 'Trade-off'], ['not', 'Danışman notu']]
export function S07() {
  const [sec, setSec] = useState(['macka', 'nis', 'ful'])
  const [one, setOne] = useState('macka')
  const [notlar, setNotlar] = useState({ macka: 'Uzun vadede en dengeli' })
  const [dz, setDz] = useState(null)
  const tog = id => setSec(s => s.includes(id) ? (s.length > 2 ? s.filter(x => x !== id) : s) : (s.length < 4 ? [...s, id] : s))
  const secili = ADAY.filter(a => sec.includes(a.id))
  const fark = k => new Set(secili.map(a => a[k])).size > 1
  return (
    <div className="em-state__b">
      <Head t="Karşılaştırma" k="forest" kt={`${sec.length} seçili`} demo />
      <div className="em-cands" role="group" aria-label="Karşılaştırılacak mülkler (2–4 seçin)">
        {ADAY.map(a => <button key={a.id} type="button" className={`em-cand${sec.includes(a.id) ? ' is-sel' : ''}`} aria-pressed={sec.includes(a.id)} onClick={() => tog(a.id)}><Foto k={a.f} size={640} alt="" /><b>{a.t}</b><span>{a.fiyat}</span><em>%{a.pct}</em>{one === a.id && <Status k="ok">Öne çıkan</Status>}</button>)}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <div className="em-cmp em-cmp--h" style={{ '--n': secili.length }}><span>Ölçüt</span>{secili.map(a => <span key={a.id}>{a.t.split(' · ')[0]}</span>)}</div>
        {KRIT.map(([k, l]) => <div key={k} className="em-cmp" style={{ '--n': secili.length }}><span>{l}</span>
          {secili.map(a => k === 'not'
            ? <span key={a.id}>{dz === a.id ? <input className="em-in" style={{ fontSize: 'var(--t-label)', padding: '.25rem .4rem' }} aria-label={`${a.t} notu`} autoFocus defaultValue={notlar[a.id] || ''} onBlur={e => { setNotlar(n => ({ ...n, [a.id]: e.target.value })); setDz(null) }} onKeyDown={e => { if (e.key === 'Enter') e.target.blur() }} />
              : <button className="em-btn em-btn--xs" onClick={() => setDz(a.id)}>{notlar[a.id] || 'Not ekle'}</button>}</span>
            : <span key={a.id} className={fark(k) && k !== 'to' ? 'is-diff' : ''} style={k === 'to' ? { color: 'var(--c-warn)' } : undefined}>{a[k]}</span>)}</div>)}
        <div className="em-cmp" style={{ '--n': secili.length }}><span>Öne çıkan</span>{secili.map(a => <span key={a.id}><Btn xs on={one === a.id} onClick={() => setOne(a.id)} aria-pressed={one === a.id}>{one === a.id ? 'Öne çıkan' : 'Öne çıkar'}</Btn></span>)}</div>
      </div>
      <p style={{ fontSize: 'var(--t-label)', color: 'var(--c-ink-2)', marginTop: '.5rem' }}>Neden daha düşük skorlu bir seçenek seçilebilir: Nişantaşı %88, müşterinin ilk bölge isteğini birebir karşılıyor; çalışma alanı ödünü müşteriyle konuşulursa tercih edilebilir. Alternatifler listede kalır.</p>
      <p className="em-axiom" style={{ fontSize: '1.05rem', marginTop: '.5rem' }}>Teknoloji bağlantıyı keşfeder. Anlamını insan değerlendirir.</p>
      <div className="em-shell__foot" style={{ margin: '0 -1.25rem -1.1rem' }}><Status k="muted">2–4 mülk seçin</Status><Btn p sm icon="→">Müşteri için seçim oluştur</Btn></div>
    </div>)
}

/* 08 */
export function S08() {
  const [kanal, setKanal] = useState('WhatsApp')
  const [gonder, setGonder] = useState('idle')
  const [takip, setTakip] = useState(false)
  return (
    <div className="em-state__b">
      <Head t="Paylaşım önizlemesi" k="forest" kt="3 portföy" demo />
      <div className="em-share">
        <div>
          <div className="em-kv"><dt>Müşteri</dt><dd>Deniz & Emre</dd><dt>Danışman</dt><dd>Selin Kaya</dd></div>
          <div className="em-field" style={{ marginTop: '.7rem' }}><label htmlFor="em-msj">Kişisel danışman mesajı</label>
            <textarea id="em-msj" className="em-ta" defaultValue="Merhaba Deniz Hanım ve Emre Bey, konuştuğumuz önceliklere göre öne çıkan seçenekleri ve nedenlerini sizin için bir araya getirdim." /></div>
          <p className="em-ph" style={{ marginTop: '.7rem' }}>Paylaşım kanalı</p>
          <div className="em-chan" role="group" aria-label="Paylaşım kanalı">{['WhatsApp', 'E-posta', 'Bağlantıyı kopyala'].map(k => <button key={k} type="button" aria-pressed={kanal === k} onClick={() => setKanal(k)}>{k}</button>)}</div>
          <label style={{ display: 'flex', gap: '.5rem', alignItems: 'center', fontSize: 'var(--t-label)', marginTop: '.8rem' }}><input type="checkbox" checked={takip} onChange={e => setTakip(e.target.checked)} /> Planlı takip: 2 gün sonra hatırlat</label>
        </div>
        <div className="em-preview" aria-label="Müşteri görünümü önizlemesi">
          <div style={{ fontSize: 'var(--t-label)', color: 'var(--c-ink-3)', marginBottom: '.4rem' }}>{kanal} önizlemesi · Deniz & Emre'nin göreceği hâli</div>
          <div className="em-preview__bubble">Merhaba Deniz Hanım ve Emre Bey, konuştuğumuz önceliklere göre öne çıkan seçenekleri ve nedenlerini sizin için bir araya getirdim.<br /><span style={{ color: 'var(--c-ink-3)' }}>— Selin Kaya, EstateMatch</span></div>
          <ul className="em-preview__list">
            <li><span>Maçka · 3+1 Dönüşebilir Plan</span><b>%92 · Öne çıkan</b></li><li><span>Nişantaşı · 2+1 Teraslı</span><b>%88</b></li><li><span>Fulya · 3+1 Yeni Yapı</span><b>%84</b></li>
          </ul>
        </div>
      </div>
      <div className="em-shell__foot" style={{ margin: '0 -1.25rem -1.1rem' }}>
        <Status k={gonder === 'ok' ? 'ok' : 'muted'}>{gonder === 'ok' ? 'Paylaşıldı · kayıt altında' : 'Henüz paylaşılmadı'}</Status>
        <Btn s sm on={takip}>Takip görevi oluştur</Btn><Btn s sm>E-posta önizlemesi</Btn>
        <Btn p sm busy={gonder === 'busy'} ok={gonder === 'ok'} onClick={() => { setGonder('busy'); setTimeout(() => setGonder('ok'), 800) }} aria-label="Demo içi paylaşım, gerçek mesaj göndermez">{gonder === 'ok' ? 'Paylaşıldı' : 'WhatsApp ile paylaş'}</Btn>
      </div>
    </div>)
}

/* 09 */
const ZAMAN = ['Müşteri oluşturuldu', 'İhtiyaç kaydedildi', '12.480 portföy analiz edildi', '4 güçlü alternatif belirlendi', '3 portföy paylaşıldı', 'Müşteri geri dönüş yaptı', 'Gösterim randevusu oluşturuldu', 'Takip görevi bekliyor']
export function S09() {
  const [asama, setAsama] = useState('Gösterim planlandı')
  const [hat, setHat] = useState(false)
  return (
    <div className="em-state__b">
      <Head t="Müşteri yolculuğu" k="forest" kt={`Müşteri aşaması: ${asama}`} demo />
      <div className="em-crm">
        <div><p className="em-ph">Aktivite zaman çizelgesi</p>
          <ol className="em-tl">{ZAMAN.map((z, i) => <li key={z} className={i < 6 ? 'is-done' : i === 6 ? 'is-now' : 'is-wait'}>{z}<small>{['12 Ağu', '12 Ağu', '12 Ağu', '12 Ağu', '13 Ağu', '14 Ağu', '15 Ağu', 'bekliyor'][i]}</small></li>)}</ol></div>
        <div style={{ display: 'grid', gap: '.6rem', alignContent: 'start' }}>
          <div className="em-task"><b>Sonraki adım</b>Yarın 10:30 · Maçka portföyü için teyit alınacak</div>
          <div className="em-kv"><dt>Randevu</dt><dd>Cumartesi 11:00 · Maçka gösterimi</dd><dt>İletişim geçmişi</dt><dd>3 WhatsApp · 1 arama · 1 e-posta</dd><dt>Danışman notu</dt><dd>Emre Bey çalışma odasını görmek istiyor.</dd></div>
          <div className="em-field"><label htmlFor="em-asama">Müşteri aşaması</label><select id="em-asama" className="em-sel" value={asama} onChange={e => setAsama(e.target.value)}>{['İhtiyaç alındı', 'Öneri paylaşıldı', 'Gösterim planlandı', 'Teklif', 'Kapanış'].map(a => <option key={a}>{a}</option>)}</select></div>
          <label style={{ display: 'flex', gap: '.5rem', alignItems: 'center', fontSize: 'var(--t-label)' }}><input type="checkbox" checked={hat} onChange={e => setHat(e.target.checked)} /> Hatırlatma: gösterimden 1 saat önce</label>
        </div>
      </div>
      <p className="em-axiom" style={{ fontSize: '1.05rem' }}>Doğru eşleşme bulunduğunda bitmez. İlişkiye dönüştüğünde değer kazanır.</p>
      <div className="em-shell__foot" style={{ margin: '0 -1.25rem -1.1rem' }}><Status k="ok">Randevu onaylı</Status><Btn p sm icon="→">Sonraki adımı planla</Btn></div>
    </div>)
}

/* 10 */
const YET = ['Yeni portföy ekleme', 'Portföy düzenleme', 'Portföy arama', 'Durum takibi', 'Danışman ataması', 'Takip edilen portföyler', 'Paylaşım geçmişi', 'Eşleşen müşteriler', 'Potansiyel müşteriler', 'Portföy notları', 'Arşivleme', 'Görünürlük kontrolü']
export function S10() {
  const [q, setQ] = useState('')
  const [durum, setDurum] = useState('Aktif')
  return (
    <div className="em-state__b">
      <Head t="Portföy yönetimi" k="forest" kt="1.240 kayıt" demo />
      <div className="em-port">
        <div className="em-port__focus">
          <Foto k="macka" size={640} alt="Maçka, 3+1 dönüşebilir plan" />
          <div className="em-state__h"><b style={{ fontWeight: 500 }}>Maçka · 3+1 Dönüşebilir Plan</b><Status k={durum === 'Aktif' ? 'ok' : 'muted'}>{durum}</Status></div>
          <dl className="em-kv" style={{ marginTop: '.5rem' }}><dt>Danışman</dt><dd>Selin Kaya</dd><dt>İlişkili müşteriler</dt><dd>6 potansiyel ilişki</dd><dt>Son işlem</dt><dd>Bugün · Deniz & Emre ile paylaşıldı</dd></dl>
          <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap', marginTop: '.6rem' }}>
            <Btn xs>Düzenle</Btn><Btn xs>Not ekle</Btn><Btn xs onClick={() => setDurum(d => d === 'Aktif' ? 'Arşiv' : 'Aktif')}>{durum === 'Aktif' ? 'Arşivle' : 'Aktifleştir'}</Btn><Btn xs>Görünürlük</Btn>
          </div>
        </div>
        <div>
          <div className="em-field"><label htmlFor="em-parama">Portföy ara</label><input id="em-parama" className="em-in" placeholder="Bölge, plan, danışman…" value={q} onChange={e => setQ(e.target.value)} /></div>
          {q && <p style={{ fontSize: 'var(--t-label)', color: 'var(--c-ink-3)', marginTop: '.3rem' }}>“{q}” için 3 portföy</p>}
          <p className="em-ph" style={{ marginTop: '.8rem' }}>Yönetim yetenekleri</p>
          <ul className="em-caps">{YET.map(y => <li key={y}>{y}</li>)}</ul>
          <p className="em-axiom" style={{ fontSize: '1rem', marginTop: '.8rem' }}>Dağınık portföy bilgisini, karar verilebilir bir sisteme dönüştürür.</p>
        </div>
      </div>
      <div className="em-shell__foot" style={{ margin: '0 -1.25rem -1.1rem' }}><Status k="muted">Selin Kaya · 38 portföy</Status><Btn p sm icon="+">Yeni portföy</Btn></div>
    </div>)
}

/* 11 */
export function S11() {
  return (
    <div className="em-state__b">
      <Head t="İşinizin görünür hâli" k="forest" kt="Bu ay" demo />
      <div className="em-rep__filters" role="group" aria-label="Filtreler">{['Tarih: Bu ay', 'Danışman: Tümü', 'Ofis/Acenta: Merkez', 'Portföy durumu: Aktif', 'Müşteri aşaması: Tümü'].map(f => <span key={f}>{f}</span>)}</div>
      <div className="em-rep">
        <Metric v="148" l="Aktif müşteriler" /><Metric v="12.480" l="Analiz edilen portföyler" /><Metric v="326" l="Bu ay oluşturulan eşleşmeler" />
        <Metric v="214" l="Paylaşılan öneriler" /><Metric v="17" l="Bekleyen takipler" /><Metric v="42" l="Planlanan gösterimler" />
      </div>
      <div className="em-rep__grid">
        <Funnel label="Müşteri aşaması hunisi" rows={[{ l: 'İhtiyaç alındı', v: 148 }, { l: 'Öneri paylaşıldı', v: 96 }, { l: 'Gösterim', v: 42 }, { l: 'Teklif', v: 18 }]} />
        <Bars label="Eşleşme → paylaşım → gösterim" rows={[{ l: 'Eşleşme', v: 326 }, { l: 'Paylaşım', v: 214 }, { l: 'Gösterim', v: 42 }]} />
        <Bars label="Danışman aktivitesi" rows={[{ l: 'Selin', v: 61 }, { l: 'Mert', v: 48 }, { l: 'Ece', v: 39 }, { l: 'Bora', v: 27 }]} />
        <Donut label="Portföy dağılımı" rows={[{ l: 'Aktif', v: 1240 }, { l: 'Rezerve', v: 86 }, { l: 'Arşiv', v: 312 }]} />
        <Funnel label="Takip durumu" rows={[{ l: 'Zamanında', v: 51 }, { l: 'Bugün', v: 9 }, { l: 'Gecikmiş', v: 8 }]} />
        <Bars label="En sık müşteri niyeti" rows={[{ l: 'Sakinlik', v: 72 }, { l: 'Ulaşım', v: 68 }, { l: 'Ev ofis', v: 44 }, { l: 'Değer', v: 41 }]} />
      </div>
      <p style={{ fontSize: 'var(--t-label)', color: 'var(--c-ink-3)', marginTop: '.4rem' }}>Değerler temsili arayüz demo verisidir; doğrulanmış müşteri sonucu değildir.</p>
      <p className="em-axiom" style={{ fontSize: '1.05rem' }}>Veri yalnızca tutulmaz. Nerede ilerlediğinizi ve nerede fırsat kaybettiğinizi gösterir.</p>
      <div className="em-shell__foot" style={{ margin: '0 -1.25rem -1.1rem' }}><Status k="muted">Son güncelleme: bugün 09:40</Status><Btn p sm icon="→">Raporu görüntüle</Btn></div>
    </div>)
}
export const BILESEN = [S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11]
