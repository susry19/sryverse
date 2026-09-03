/* İlk ekran: tamamlanmış bir marka kompozisyonu.
   Sol sütunda kimlik, söz, ürün vaadi ve iki eylem; sağ sütunda ilişki alanı:
   müşteri ihtiyacı → EstateMatch yorumu → öne çıkan portföy ve iki alternatif.
   Statik ilk kare doğrudur: JS hiç çalışmasa da kompozisyon bitmiş görünür.
   Kaydırma başlayınca alan dağılır ve sorun anlatısı devreye girer. */
import { Ico } from './bits.jsx'
import { Villa } from './villa.jsx'
import { SRC, SRCSET, ALT, IMG_W, IMG_H } from './mosaic.jsx'

export const KRITER = ['Döşemealtı', 'Müstakil villa', 'Özel havuz', 'En az 4+1', 'En fazla ₺25 milyon']
export const SIGNAL = [['Mahremiyet', 'shield'], ['Bahçe kullanımı', 'leaf'], ['Şehir erişimi', 'road'], ['Uzun vadeli değer', 'chart']]
const ALT_PORTFOY = [
  { k: 'yenikoy', t: 'Yeniköy', o: '5+1 · 340 m²', pct: 87 },
  { k: 'duzlercami', t: 'Düzlerçamı', o: '4+1 · 295 m²', pct: 84 },
]
const SORUN = ['Müşteri bilgisi bir yerde.', 'Portföyler başka bir yerde.', 'Takip ise çoğu zaman hafızada.']
const DEGER = ['İhtiyacı anlayın.', 'Doğru seçenekleri nedenleriyle görün.', 'Paylaşım ve takibi kaybetmeden ilerleyin.']

const kap = (v, a, b) => Math.min(1, Math.max(0, (v - a) / (b - a)))
const yum = t => t * t * (3 - 2 * t)
const sm = (v, a, b) => yum(kap(v, a, b))
const pencere = (v, a, b, f = .06) => sm(v, a, a + f) * (1 - sm(v, b - f, b))

/* b: marka bölümünün ilerlemesi (0..1) */
export default function Hero({ b, onStory, onDemo }) {
  const soz = 1 - sm(b, .30, .44)          /* açılış metni */
  const alan = 1 - sm(b, .44, .70)          /* üç bölgeli ilişki alanı */
  const tek = pencere(b, .69, .97, .05)     /* tek ilişki kartı */
  const dagil = sm(b, .38, .74)             /* dağılma miktarı */
  const sorunVis = pencere(b, .38, .64, .05)
  const cozum = pencere(b, .66, .97, .05)
  const d = (x, y) => `translate3d(${(x * dagil).toFixed(1)}px, ${(y * dagil).toFixed(1)}px, 0)`

  return (
    <div className="emh" style={{ '--dagil': dagil.toFixed(3) }}>
      {/* ── sol: kimlik, söz, vaat, eylemler ── */}
      <div className="emh__l">
        <div className="emh-soz" style={{ opacity: soz, transform: `translate3d(0, ${((1 - soz) * -14).toFixed(1)}px, 0)`, pointerEvents: soz > .5 ? 'auto' : 'none' }} aria-hidden={soz < .5}>
          <p className="emh-mark"><img src="/sryverse-icon.png" alt="" width="20" height="20" />EstateMatch <span>by SRYVERSE</span></p>
          <h1 className="emh-h">Tesadüfü üretmiyoruz.<br /><em>Onu fark etme<br />ihtimalini artırıyoruz.</em></h1>
          <p className="emh-lead">Müşteri ihtiyacını anlayın, doğru portföyleri nedenleriyle bulun; paylaşım, randevu ve takibi tek yerde yönetin.</p>
          <p className="emh-kat">Emlak danışmanları ve acenteler için yapay zekâ destekli müşteri, portföy ve eşleştirme platformu.</p>
          <div className="emh-act">
            <button type="button" className="emh-act__q" onClick={onStory}><span className="emh-act__line" aria-hidden="true"><i /></span>Nasıl çalıştığını görün</button>
            <button type="button" className="em-btn em-btn--p" onClick={onDemo}>Demo planlayın</button>
          </div>
        </div>

        {/* ── kaydırınca: bugünün sorunu, sonra çözüm ── */}
        <div className="emh-sorun" style={{ opacity: sorunVis }} aria-hidden={sorunVis < .5}>
          {SORUN.map((s, i) => <p key={s} style={{ opacity: sm(b, .385 + i * .045, .44 + i * .045) }}>{s}</p>)}
        </div>
        <div className="emh-cozum" style={{ opacity: cozum }} aria-hidden={cozum < .5}>
          <p className="emh-cozum__h">EstateMatch, hepsini tek müşteri ilişkisi üzerinde bir araya getirir.</p>
          <ol className="emh-cozum__l">
            {DEGER.map((s, i) => <li key={s} style={{ opacity: sm(b, .70 + i * .045, .75 + i * .045) }}><span aria-hidden="true">{`0${i + 1}`}</span>{s}</li>)}
          </ol>
        </div>
      </div>

      {/* ── sağ: ilişki alanı, ardından tek ilişki kartı ── */}
      <div className="emh__r">
        <div className="hf-tek" style={{ opacity: tek }} aria-hidden={tek < .5}>
          <p className="hf-lbl">Tek müşteri ilişkisi</p>
          <ol>
            <li><span>İhtiyaç</span><b>Aylin Hanım · Döşemealtı · Villa · 4+1</b></li>
            <li><span>Eşleşme</span><b>Altınkale · %92 anlamlı uyum</b></li>
            <li><span>Süreç</span><b>Paylaşım · Randevu · Takip · Geçmiş</b></li>
          </ol>
        </div>
        <div className="hf" style={{ opacity: alan }} aria-hidden={alan < .5}>
          <div className="hf__a">
            <div className="hf-cust" style={{ transform: d(-34, -10) }}>
              <p className="hf-lbl">Müşterinin söylediği</p>
              <p className="hf-cust__who"><span className="hf-cust__n" aria-hidden="true">A</span><span><b>Aylin Hanım</b><small>Müşteri · 12 Ağu</small></span></p>
              <ul className="hf-chips">{KRITER.map(k => <li key={k}>{k}</li>)}</ul>
            </div>
            <div className="hf-yorum" style={{ transform: d(-14, 26) }}>
              <p className="hf-lbl">EstateMatch’in yorumladığı</p>
              <ul className="hf-sig">{SIGNAL.map(([t, ico]) => <li key={t}><Ico n={ico} size={15} />{t}</li>)}</ul>
            </div>
          </div>

          <div className="hf__v" aria-hidden="true"><i /></div>

          <svg className="hf-link" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path className="is-strong" d="M0 34 C46 34, 54 30, 100 30" />
            <path className="is-dash" d="M0 76 C48 76, 52 86, 100 86" />
            <path className="is-dash" d="M0 76 C48 76, 52 96, 100 96" />
          </svg>

          <div className="hf__c">
            <figure className="hf-main" style={{ transform: `translate3d(${(20 * dagil).toFixed(1)}px, 0, 0) scale(${(1 - .03 * dagil).toFixed(3)})` }}>
              <img src={SRC} srcSet={SRCSET} sizes="(max-width:1023px) 88vw, 34vw" width={IMG_W} height={IMG_H} alt={ALT} fetchPriority="high" decoding="async" />
              <figcaption>
                <span className="hf-main__pct"><b>%92</b>anlamlı uyum</span>
                <span className="hf-main__t"><b>Döşemealtı · Altınkale</b><small>Müstakil villa · 4+1 · 310 m² · Özel havuz</small></span>
              </figcaption>
            </figure>
            <p className="hf-lbl hf-lbl--alt">Değerlendirilen diğer güçlü seçenekler</p>
            <ul className="hf-alts">
              {ALT_PORTFOY.map((a, i) => (
                <li key={a.k} style={{ transform: d(18 + i * 10, 16 + i * 12) }}>
                  <span className="hf-alts__v" aria-hidden="true"><Villa k={a.k} /></span>
                  <span className="hf-alts__t"><b>{a.t}</b><small>{a.o}</small></span>
                  <span className="hf-alts__p">%{a.pct}</span>
                </li>))}
            </ul>
          </div>
        </div>
      </div>

    </div>)
}
