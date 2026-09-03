/* Sahne 09–13 — Hikâyeden somut bilgiye: ne kuruyoruz, nasıl düşünüyoruz,
   kimler için ve gerçek ürün kanıtı; ardından yavaşlayan manifesto ve
   sakin bir kapanış. İletişim formu dürüst çalışır: çevrimiçi uç nokta
   tanımlı değilse gönderim yapılmış gibi davranmaz, bilgileri WhatsApp
   ile iletme yolu sunar. */
import { useRef, useState, useEffect } from 'react'
import { useReveal } from '../estate/scroll.js'
import { In, sm, WA } from './bits.jsx'

/* ── Ne kuruyoruz ── */
const CAP = [
  ['Yapay zekâ sistemleri', 'Belgeyi, talebi ve bağlamı yapılandırılmış veriye çeviren; öğrenen ve gerekçesini gösteren sistemler.'],
  ['Karar zekâsı', 'Bir seçeneğin neden öne çıktığını açıklayan skorlama ve sıralama katmanları. Karar insanda kalır.'],
  ['Veri ürünleri', 'Dağınık kayıtları tek ilişki modelinde toplayan; müşteri, portföy ve aktiviteyi birlikte okuyan yapılar.'],
  ['Otomasyon', 'Tekrarlayan, yüksek hacimli adımları devralan; paylaşım, hatırlatma ve takibi kaybettirmeyen akışlar.'],
  ['Eşleştirme motorları', 'İhtiyaç ile seçenek arasındaki görünmeyen ilişkiyi ortaya çıkaran, açıklanabilir eşleşme.'],
  ['İş zekâsı', 'Süreci görünür kılan raporlama: aşamalar, hareketler, ekip aktivitesi ve bekleyen aksiyonlar.'],
]
export function Capabilities() {
  return (
    <section id="yaklasim" className="hc" data-theme="light" aria-labelledby="hc-h">
      <div className="h-wrap hc__in">
        <div className="hc__side">
          <In><p className="h-kicker">Ne kuruyoruz</p></In>
          <In delay={60}><h2 id="hc-h" className="h-h2">Farklı sektörlerde, aynı zekâ katmanı.</h2></In>
          <In delay={120}><p className="h-lead">Ürünlerimiz altı yeteneğin farklı bileşimleridir. Hepsi aynı ilkeye bağlıdır: teknoloji ihtimalleri genişletir, kararın kontrolü insanda kalır.</p></In>
        </div>
        <In as="ol" className="hc__list" aria-label="Yetenek alanları">
          {CAP.map(([t, d], i) => (
            <li key={t} className="hc__row" style={{ '--k': i }}>
              <span className="hc__n">0{i + 1}</span>
              <h3 className="hc__t">{t}</h3>
              <p className="hc__d">{d}</p>
            </li>))}
        </In>
        <In className="hc__end" delay={80}>
          <p className="h-statement">Teknoloji karmaşıklığı azaltmalı.<br /><em>Daha fazlasını eklememeli.</em></p>
        </In>
      </div>
    </section>)
}

/* ── Nasıl düşünüyoruz (mevcut beş adımlı metodoloji 02'nin içinde korunur) ── */
const METOD = ['Gözlemle', 'Modelle', 'Optimize et', 'Otomatize', 'Ölçeklendir']
const DUSUNCE = [
  { n: '01', t: 'Anla', d: 'Gerçek iş problemiyle başlarız. Süreç, darboğaz ve karar noktaları veriye dönüşmeden görünmez; önce onları görünür kılarız.' },
  { n: '02', t: 'Kur', d: 'Zekâyı bağlamın, verinin ve iş akışının etrafında mühendisleriz. Modelle, ölç, otomatize et; sonra ürün olarak ölçeklendir.', metod: true },
  { n: '03', t: 'Sadeleştir', d: 'Karmaşıklığı insanların gerçekten kullanabileceği bir şeye çeviririz. Arayüz sakin kalır; iş, altta yapılır.' },
]
export function Thinking() {
  return (
    <section id="methodology" className="ht" data-theme="light" aria-labelledby="ht-h">
      <div className="h-wrap">
        <In><p className="h-kicker">Nasıl düşünüyoruz</p></In>
        <In delay={60}><h2 id="ht-h" className="h-h2">Altta karmaşık.<br /><em>Yüzeyde sade.</em></h2></In>
        <ol className="ht__cols">
          {DUSUNCE.map((s, i) => (
            <In as="li" key={s.n} className="ht__col" delay={120 + i * 90}>
              <span className="ht__n">{s.n}</span>
              <h3 className="ht__t">{s.t}</h3>
              <p className="ht__d">{s.d}</p>
              {s.metod && <ol className="ht__metod" aria-label="Beş adım">{METOD.map(m => <li key={m}>{m}</li>)}</ol>}
            </In>))}
        </ol>
        <In delay={120}><p className="ht__note">Bu ilke bu sitenin kendisi için de geçerlidir.</p></In>
      </div>
    </section>)
}

/* ── Kimler için + gerçek ürün kanıtı ── */
const KITLE = [
  ['Recruitment Teams', 'İşe alım ekipleri', 'Doğru yeteneği daha hızlı ve gerekçesiyle bulun.'],
  ['Real Estate Agencies', 'Gayrimenkul acenteleri', 'Mülkleri, müşterileri ve fırsatları eşleştirin.'],
  ['HR Departments', 'İnsan kaynakları', 'Kadro ihtiyacından işe girişe tek akış.'],
  ['Operations Teams', 'Operasyon ekipleri', 'Tekrarlayan adımları devredin, sürtüşmeyi azaltın.'],
  ['Business Analysts', 'İş analistleri', 'Veriyi açıklanabilir kararlara dönüştürün.'],
  ['Transformation Leaders', 'Dönüşüm liderleri', 'Sektörünüze özel bir zekâ katmanı kurun.'],
]
export function Audience({ openPage }) {
  return (
    <section id="usecases" className="ha" data-theme="light" aria-labelledby="ha-h">
      <div className="h-wrap ha__in">
        <div className="ha__l">
          <In><p className="h-kicker">Kimler için</p></In>
          <In delay={60}><h2 id="ha-h" className="h-h2">Karmaşık operasyon yürüten ekipler için.</h2></In>
          <In as="ul" className="ha__list" delay={120} aria-label="Hedef ekipler">
            {KITLE.map(([en, tr, d], i) => (
              <li key={en} style={{ '--k': i }}><span className="ha__en" lang="en">{en}</span><b>{tr}</b><p>{d}</p></li>))}
          </In>
        </div>
        <In className="ha__proof" delay={140}>
          <p className="h-kicker">Gerçek ürün</p>
          <figure className="ha__shot">
            <img src="/screens/dashboard.webp" width="750" height="1257" alt="EstateMatch AI panel ekranı: metrikler, aktivite trendi ve yapay zekâ öngörüleri" loading="lazy" decoding="async" />
            <figcaption>
              <b>EstateMatch · Panel</b>
              <span>Konsept değil, çalışan platform. Aktif portföy, sıcak müşteriler ve öngörüler tek ekranda.</span>
              <a href="/estatematch/features" className="h-ext" onClick={e => { e.preventDefault(); openPage('estatematchFeatures') }}>Tüm özellikleri inceleyin</a>
            </figcaption>
          </figure>
        </In>
      </div>
    </section>)
}

/* ── Manifesto: her satır kaydırmayla yavaşça belirir, geri kaydırınca çekilir ── */
const SATIR = [
  'Teknolojinin fark etmesi gerektiğine inanıyoruz.',
  'Bağlaması gerektiğine.',
  'Bağlamı anlaması gerektiğine.',
  'Ve o an geldiğinde —',
  'insanın karar vermesine yardım etmesi gerektiğine.',
]
function Line({ children, cls = '' }) {
  const ref = useRef(null)
  const [o, setO] = useState(0)
  useReveal(ref, v => { const q = Math.round(sm(v, .22, .46) * 100) / 100; setO(x => x === q ? x : q) })
  return <p ref={ref} className={`hm__l ${cls}`} style={{ opacity: o, transform: `translate3d(0, ${((1 - o) * 12).toFixed(1)}px, 0)` }}>{children}</p>
}
export function Manifesto() {
  return (
    <section id="manifesto" className="hm" data-theme="dark" aria-label="Manifesto">
      <div className="h-wrap hm__in">
        {SATIR.map((s, i) => <Line key={i} cls={i === 4 ? 'hm__l--last' : ''}>{s}</Line>)}
        <Line cls="hm__brand"><span className="hm__lockup"><img src="/sryverse-badge-white.png" alt="" width="40" height="40" /><span>SRYVERSE</span></span></Line>
      </div>
    </section>)
}

/* ── Kapanış + iletişim ── */
const DEMO_ENDPOINT = import.meta.env.VITE_DEMO_ENDPOINT || ''
const URUN = ['EstateMatch AI', 'SkillMatch AI', 'Metraj AI (özel beta)', 'Özel çözüm']
const BOS = { ad: '', sirket: '', eposta: '', urun: '', mesaj: '' }

function ContactForm() {
  const [f, setF] = useState(BOS)
  const [durum, setDurum] = useState('idle') /* idle · submitting · success · error · fallback */
  const statusRef = useRef(null)
  const set = (k, v) => setF(x => ({ ...x, [k]: v }))
  const waMetin = () => encodeURIComponent(`Merhaba, SRYVERSE demo talebi.\nAd Soyad: ${f.ad}\nŞirket: ${f.sirket}\nE-posta: ${f.eposta}\nÜrün: ${f.urun}\nMesaj: ${f.mesaj}`)
  useEffect(() => { if (durum !== 'idle' && durum !== 'submitting') statusRef.current?.focus() }, [durum])
  const gonder = async e => {
    e.preventDefault()
    if (!DEMO_ENDPOINT) { setDurum('fallback'); return }
    setDurum('submitting')
    try {
      const r = await fetch(DEMO_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...f, kaynak: 'sryverse-home' }) })
      if (!r.ok) throw new Error(String(r.status))
      setDurum('success')
    } catch { setDurum('error') }
  }
  const busy = durum === 'submitting'
  return (
    <form className="hk-form" onSubmit={gonder}>
      <div className="hk-form__row">
        <div className="hk-f"><label htmlFor="hk-ad">Ad Soyad</label><input id="hk-ad" name="ad" type="text" autoComplete="name" required value={f.ad} onChange={e => set('ad', e.target.value)} disabled={busy} /></div>
        <div className="hk-f"><label htmlFor="hk-sirket">Şirket</label><input id="hk-sirket" name="sirket" type="text" autoComplete="organization" required value={f.sirket} onChange={e => set('sirket', e.target.value)} disabled={busy} /></div>
      </div>
      <div className="hk-f"><label htmlFor="hk-eposta">E-posta</label><input id="hk-eposta" name="eposta" type="email" autoComplete="email" required value={f.eposta} onChange={e => set('eposta', e.target.value)} disabled={busy} /></div>
      <div className="hk-f"><label htmlFor="hk-urun">İlgilendiğiniz ürün</label>
        <select id="hk-urun" name="urun" required value={f.urun} onChange={e => set('urun', e.target.value)} disabled={busy}>
          <option value="" disabled>Seçin</option>{URUN.map(u => <option key={u}>{u}</option>)}
        </select>
      </div>
      <div className="hk-f"><label htmlFor="hk-mesaj">Mesaj</label><textarea id="hk-mesaj" name="mesaj" rows="4" required placeholder="Operasyonunuzu ya da çözmek istediğiniz sorunu kısaca anlatın." value={f.mesaj} onChange={e => set('mesaj', e.target.value)} disabled={busy} /></div>
      <div className="hk-form__act">
        <button type="submit" className="h-cta h-cta--solid h-cta--light" disabled={busy || durum === 'success'} aria-busy={busy}>{busy ? 'Gönderiliyor…' : durum === 'success' ? 'Talebiniz alındı' : 'Demo talep edin'}<span aria-hidden="true">→</span></button>
        <a href={WA} className="h-ext h-ext--light" target="_blank" rel="noopener noreferrer">WhatsApp’tan yazın</a>
      </div>
      <div ref={statusRef} tabIndex={-1} className="hk-status" aria-live="polite">
        {durum === 'success' && <p className="hk-status__ok">Talebiniz alındı. 24 saat içinde dönüş yapacağız.</p>}
        {durum === 'error' && <div className="hk-status__note"><p>Talebiniz şu anda gönderilemedi. Bilgileriniz formda duruyor; tekrar deneyebilir ya da aynı içeriği WhatsApp ile iletebilirsiniz.</p><div className="hk-status__act"><button type="button" className="h-ext h-ext--light" onClick={() => setDurum('idle')}>Tekrar dene</button><a className="h-ext h-ext--light" href={`https://wa.me/905315178170?text=${waMetin()}`} target="_blank" rel="noopener noreferrer">Bilgilerimi WhatsApp ile gönder</a></div></div>}
        {durum === 'fallback' && <div className="hk-status__note"><p>Çevrimiçi gönderim henüz bu sayfaya bağlı değil; talebiniz gönderilmedi. Bilgileriniz formda duruyor, aynı içeriği tek dokunuşla WhatsApp üzerinden iletebilirsiniz.</p><div className="hk-status__act"><a className="h-cta h-cta--solid h-cta--light" href={`https://wa.me/905315178170?text=${waMetin()}`} target="_blank" rel="noopener noreferrer">Bilgilerimi WhatsApp ile gönder<span aria-hidden="true">→</span></a><button type="button" className="h-ext h-ext--light" onClick={() => setDurum('idle')}>Formu düzenle</button></div></div>}
      </div>
    </form>)
}

export function Closing({ go }) {
  return (
    <section id="son" className="hk" data-theme="dark" aria-labelledby="hk-h">
      <div className="h-wrap hk__top">
        <In><p className="hk__big">Keşfedilecek<br />her zaman bir şey vardır.</p></In>
        <In delay={90} className="hk__brand"><span className="hk__word">SRYVERSE</span><span className="hk__tag">Daha iyi kararlar için zekâ.</span></In>
        <In delay={160} className="hk__act">
          <a href="#urunler" className="h-cta h-cta--solid h-cta--light" onClick={e => { e.preventDefault(); go('#urunler') }}>Ürünleri keşfedin<span aria-hidden="true">→</span></a>
          <a href="#contact" className="h-cta h-cta--light" onClick={e => { e.preventDefault(); go('#contact') }}>Birlikte kuralım<span aria-hidden="true">→</span></a>
        </In>
      </div>

      <div id="contact" className="h-wrap hk__in" aria-labelledby="hk-h">
        <span id="iletisim" className="h-anchor" aria-hidden="true" />
        <div className="hk__l">
          <In><p className="h-kicker h-kicker--dark">İletişim</p></In>
          <In delay={60}><h2 id="hk-h" className="h-h2 h-h2--dark">Bir sonraki sistemi<br />birlikte kuralım.</h2></In>
          <In delay={120}><p className="h-lead h-lead--dark">Sürecinizi anlatın. Darboğazı birlikte bulalım, sistemi tasarlayalım, otomasyonu kuralım.</p></In>
          <In as="dl" className="hk__meta" delay={180}>
            <div><dt>Yaklaşım</dt><dd>Anla → Kur → Sadeleştir</dd></div>
            <div><dt>Yanıt süresi</dt><dd>24 saat</dd></div>
            <div><dt>WhatsApp</dt><dd><a href={WA} target="_blank" rel="noopener noreferrer">+90 531 517 8170</a></dd></div>
          </In>
        </div>
        <In delay={140}><ContactForm /></In>
      </div>
    </section>)
}
