/* Hikâyeden sonra: köprü, kimler için, özet, merak edilenler, demo/iletişim.
   Sabit sahne serbest kaldıktan sonra sıradan dikey akış; hafif giriş hareketi. */
import { useState, useRef, useEffect, useId } from 'react'
import { Btn, Ico } from './bits.jsx'

const WA = 'https://wa.me/905315178170?text=Merhaba%2C%20SRYVERSE%20%C3%BCr%C3%BCnleri%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum.'
const DEMO_ENDPOINT = import.meta.env.VITE_DEMO_ENDPOINT || '' /* boşsa çevrimiçi gönderim yok; şeffaf geri dönüş gösterilir */

/* Görünürlükte hafif giriş: opaklık + küçük kayma. Azaltılmış harekette anında. */
function useEnter() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current; if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.classList.add('is-in'); return }
    const io = new IntersectionObserver(es => { es.forEach(e => { if (e.isIntersecting) { el.classList.add('is-in'); io.disconnect() } }) }, { rootMargin: '0px 0px -12% 0px' })
    io.observe(el); return () => io.disconnect()
  }, [])
  return ref
}
function Sec({ id, cls = '', labelledBy, children }) { const ref = useEnter(); return <section id={id} ref={ref} className={`af-sec ${cls}`} aria-labelledby={labelledBy}>{children}</section> }

export function Bridge() {
  return (
    <Sec id="devam" cls="af-bridge" labelledBy="af-bridge-h">
      <div className="af-wrap">
        <span className="af-dot" aria-hidden="true" />
        <h2 id="af-bridge-h" className="af-h2">Bir eşleşmeden daha fazlası.</h2>
        <p className="af-lead">Müşteriyi anlamaktan portföyü keşfetmeye; paylaşmaktan takibe kadar bütün danışmanlık süreci tek yerde.</p>
      </div>
    </Sec>)
}

const KITLE = [
  ['Emlak danışmanları', 'Müşteri ihtiyacını daha doğru anlayın, anlamlı seçenekleri karşılaştırın ve takiplerinizi tek yerde yönetin.'],
  ['Acenta yöneticileri', 'Portföy hareketlerini, müşteri süreçlerini ve danışman aktivitelerini görünür hâle getirin.'],
  ['Büyüyen gayrimenkul ekipleri', 'Rol bazlı erişim, ortak portföy yapısı ve standart iş akışlarıyla operasyonunuzu kontrollü biçimde büyütün.'],
]
export function Audience() {
  return (
    <Sec id="kimler-icin" cls="af-aud" labelledBy="af-aud-h">
      <div className="af-wrap">
        <p className="af-kicker">Kimler için</p>
        <h2 id="af-aud-h" className="af-h2">Gayrimenkul işini ilişki üzerinden yöneten ekipler için.</h2>
        <div className="af-cols af-cols--3">
          {KITLE.map(([t, d]) => <div key={t} className="af-col"><h3>{t}</h3><p>{d}</p></div>)}
        </div>
      </div>
    </Sec>)
}

const OZET = [
  ['Anlayın', 'Müşteri ihtiyacını, tercihleri ve danışman notlarını aynı bağlamda değerlendirin.'],
  ['Keşfedin', 'Portföyler arasındaki anlamlı ilişkileri ve değerlendirilmesi gereken farkları görün.'],
  ['Yönetin', 'Paylaşım, iletişim, randevu, görev ve takip süreçlerini tek yerde sürdürün.'],
  ['Ölçün', 'Portföy hareketlerini, müşteri aşamalarını ve danışman aktivitelerini raporlayın.'],
]
export function Recap({ onFeatures }) {
  return (
    <Sec id="nasil-calisir" cls="af-recap" labelledBy="af-recap-h">
      <div className="af-wrap">
        <p className="af-kicker">Nasıl çalışır</p>
        <h2 id="af-recap-h" className="af-h2">Tek bir eşleşmenin etrafında, bütün süreç.</h2>
        <ol className="af-cols af-cols--4">
          {OZET.map(([t, d], i) => <li key={t} className="af-col"><span className="af-num">0{i + 1}</span><h3>{t}</h3><p>{d}</p></li>)}
        </ol>
        <p className="af-more"><a href="/estatematch/features" className="em-link" onClick={e => { e.preventDefault(); onFeatures?.() }}>Bütün özellikleri inceleyin</a></p>
      </div>
    </Sec>)
}

const SSS = [
  ['EstateMatch kimler için tasarlandı?', 'EstateMatch; emlak danışmanları, acenta yöneticileri, portföy ekipleri ve büyüyen gayrimenkul organizasyonları için tasarlanmıştır. Müşteri, portföy, eşleşme ve takip süreçlerini ortak bir sistemde birleştirir.'],
  ['EstateMatch yalnızca ilan eşleştirmesi mi yapar?', 'Hayır. Akıllı eşleştirmenin yanında müşteri ve portföy yönetimi, karşılaştırma, danışman notları, WhatsApp ve e-posta paylaşımı, randevu, görev, takip ve raporlama süreçlerini de destekler.'],
  ['Eşleşmeler nasıl oluşturulur?', 'EstateMatch; müşterinin açık kriterlerini, danışman notlarını ve portföy özelliklerini birlikte değerlendirir. Sonuçları eşleşme nedenleri ve değerlendirilmesi gereken farklarla birlikte danışmana sunar.'],
  ['EstateMatch danışmanın yerine karar verir mi?', 'Hayır. EstateMatch görünmeyen ihtimalleri ve ilişkileri ortaya çıkarır. Öncelikleri düzenlemek, seçenekleri karşılaştırmak ve nihai öneriyi oluşturmak danışmanın kontrolündedir.'],
  ['Mevcut portföylerimizi sisteme aktarabilir miyiz?', 'Portföy yapısı ve veri formatı demo görüşmesinde değerlendirilir. Uygun aktarım yöntemi, mevcut sisteminize ve veri yapınıza göre planlanır.'],
  ['Müşterilere portföyleri nasıl gönderebiliriz?', 'Danışmanlar seçtikleri portföyleri kişisel notlarıyla birlikte WhatsApp veya e-posta üzerinden paylaşabilir ve paylaşım sonrasındaki takip adımlarını müşteri kaydında yönetebilir.'],
  ['Yöneticiler hangi bilgileri görebilir?', 'Görünürlük kullanıcı rolüne göre yönetilir. Yöneticiler yetkileri kapsamında müşteri aşamalarını, portföy hareketlerini, danışman aktivitelerini ve operasyonel raporları görüntüleyebilir.'],
  ['EstateMatch’i nasıl deneyebiliriz?', 'Demo talep formunu doldurarak ekibinizin çalışma yapısına uygun bir ürün gösterimi planlayabilirsiniz.'],
]
export function Faq() {
  const [open, setOpen] = useState(0) /* her zaman en fazla bir öğe açık */
  const base = useId()
  return (
    <Sec id="sss" cls="af-faq" labelledBy="af-faq-h">
      <div className="af-wrap">
        <div className="af-faq__head">
          <p className="af-kicker">Merak edilenler</p>
          <h2 id="af-faq-h" className="af-h2">Merak edilenler</h2>
          <p className="af-lead">EstateMatch’in çalışma şekli, kullanımı ve güvenliği hakkında sık sorulan sorular.</p>
        </div>
        <div className="af-acc">
          {SSS.map(([q, a], i) => { const on = open === i; const bid = `${base}-b${i}`, pid = `${base}-p${i}`
            return (
              <div key={q} className={`af-acc__item${on ? ' is-open' : ''}`}>
                <h3 className="af-acc__h"><button type="button" id={bid} className="af-acc__btn" aria-expanded={on} aria-controls={pid} onClick={() => setOpen(on ? -1 : i)}><span className="af-acc__n">0{i + 1}</span><span className="af-acc__q">{q}</span><span className="af-acc__ico" aria-hidden="true"><Ico n="plus" size={16} /></span></button></h3>
                <div id={pid} role="region" aria-labelledby={bid} className="af-acc__panel" hidden={!on ? undefined : undefined} aria-hidden={!on}><div className="af-acc__in"><p>{a}</p></div></div>
              </div>) })}
        </div>
      </div>
    </Sec>)
}

/* ── Demo / iletişim: dürüst gönderim durumları ── */
const KONU = ['Akıllı eşleştirme', 'Müşteri ve portföy yönetimi', 'Danışman iş akışı', 'Yönetim ve raporlama', 'Genel ürün demosu']
const EKIP = ['1–3 kişi', '4–10 kişi', '11–30 kişi', '30+ kişi']
const BOS = { ad: '', sirket: '', eposta: '', tel: '', ekip: '', konu: '', mesaj: '', onay: false }
const EPOSTA = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const TEL = /^\+?[0-9 ()-]{10,18}$/
function dogrula(f) {
  const e = {}
  if (!f.ad.trim()) e.ad = 'Ad Soyad gerekli.'
  if (!f.sirket.trim()) e.sirket = 'Şirket veya acenta adı gerekli.'
  if (!EPOSTA.test(f.eposta.trim())) e.eposta = 'Geçerli bir iş e-postası girin.'
  if (!TEL.test(f.tel.trim())) e.tel = 'Geçerli bir telefon numarası girin.'
  if (!f.ekip) e.ekip = 'Ekip büyüklüğünü seçin.'
  if (!f.mesaj.trim()) e.mesaj = 'Kısaca ihtiyacınızı yazın.'
  if (!f.onay) e.onay = 'Devam etmek için onay gerekli.'
  return e
}
function AlanUI({ k, label, type = 'text', as = 'input', children, auto, req = true, ph, f, err, set, blur, busy }) {
  const Tag = as
  return (
    <div className={`af-field${err[k] ? ' has-err' : ''}`}>
      <label htmlFor={`af-${k}`}>{label}{req && <span aria-hidden="true"> *</span>}</label>
      <Tag id={`af-${k}`} name={k} type={as === 'input' ? type : undefined} value={f[k]} onChange={e => set(k, e.target.value)} onBlur={blur} autoComplete={auto} required={req} aria-invalid={!!err[k]} aria-describedby={err[k] ? `af-${k}-e` : undefined} placeholder={ph} disabled={busy} rows={as === 'textarea' ? 4 : undefined}>{children}</Tag>
      {err[k] && <p id={`af-${k}-e`} className="af-err" role="alert">{err[k]}</p>}
    </div>)
}
export function Contact() {
  const [f, setF] = useState(BOS)
  const [err, setErr] = useState({})
  const [durum, setDurum] = useState('idle') /* idle · submitting · success · error · fallback */
  const [dokunuldu, setDokunuldu] = useState(false)
  const ozetRef = useRef(null)
  const set = (k, v) => { setF(x => ({ ...x, [k]: v })); if (dokunuldu) setErr(dogrula({ ...f, [k]: v })) }
  const waMetin = () => encodeURIComponent(`Merhaba, EstateMatch demo talebi.\nAd Soyad: ${f.ad}\nŞirket/Acenta: ${f.sirket}\nE-posta: ${f.eposta}\nTelefon: ${f.tel}\nEkip: ${f.ekip}\nKonu: ${f.konu || 'Genel ürün demosu'}\nİhtiyaç: ${f.mesaj}`)
  const gonder = async e => {
    e.preventDefault(); setDokunuldu(true)
    const hatalar = dogrula(f); setErr(hatalar)
    if (Object.keys(hatalar).length) { const ilk = document.querySelector(`[name="${Object.keys(hatalar)[0]}"]`); ilk?.focus(); return }
    if (!DEMO_ENDPOINT) { setDurum('fallback'); window.setTimeout(() => ozetRef.current?.focus(), 50); return }
    setDurum('submitting')
    try {
      const r = await fetch(DEMO_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...f, kaynak: 'estatematch-demo' }) })
      if (!r.ok) throw new Error(String(r.status))
      setDurum('success')
    } catch { setDurum('error') }
    window.setTimeout(() => ozetRef.current?.focus(), 50)
  }
  const blur = () => { setDokunuldu(true); setErr(dogrula(f)) }
  const ortak = { f, err, set, blur, busy: durum === 'submitting' } /* alan bileşeni sabit: her render'da yeniden yaratılmaz, odak korunur */
  const gonderildi = durum === 'success'
  return (
    <Sec id="iletisim" cls="af-contact" labelledBy="af-contact-h">
      <div className="af-wrap af-contact__in">
        <div className="af-contact__l">
          <p className="af-kicker">Demo ve iletişim</p>
          <h2 id="af-contact-h" className="af-h2">EstateMatch’i kendi süreciniz üzerinde görün.</h2>
          <p className="af-lead">Kısa bir görüşmede ekibinizin müşteri, portföy ve takip yapısını dinleyelim; EstateMatch’in sürecinize nasıl uyarlanabileceğini birlikte değerlendirelim.</p>
          <ol className="af-steps">
            {['İhtiyacınızı dinleyelim', 'Ürünü gerçek bir senaryo üzerinden gösterelim', 'Uygun kullanım yapısını birlikte değerlendirelim'].map((t, i) => <li key={t}><span>0{i + 1}</span>{t}</li>)}
          </ol>
          <div className="af-alt">
            <p className="af-kicker">Diğer iletişim yolları</p>
            <a href={WA} target="_blank" rel="noopener noreferrer" className="af-alt__row"><Ico n="phone" size={18} /><span><b>WhatsApp</b><small>+90 531 517 8170 · hızlı yanıt</small></span></a>
            <a href="/#contact" className="af-alt__row" onClick={e => { e.preventDefault(); document.querySelector('#af-demo-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}><Ico n="mail" size={18} /><span><b>Demo talep formu</b><small>Yanıt e-posta veya telefonla</small></span></a>
          </div>
        </div>
        <form id="af-demo-form" className="af-form" onSubmit={gonder} noValidate aria-describedby="af-form-note">
          <p id="af-form-note" className="af-form__note">* zorunlu alanlar</p>
          <div className="af-form__grid">
            <AlanUI {...ortak} k="ad" label="Ad Soyad" auto="name" />
            <AlanUI {...ortak} k="sirket" label="Şirket / Acenta" auto="organization" />
            <AlanUI {...ortak} k="eposta" label="İş e-postası" type="email" auto="email" />
            <AlanUI {...ortak} k="tel" label="Telefon" type="tel" auto="tel" ph="+90 5xx xxx xx xx" />
            <AlanUI {...ortak} k="ekip" label="Ekip büyüklüğü" as="select"><option value="">Seçin</option>{EKIP.map(o => <option key={o}>{o}</option>)}</AlanUI>
            <AlanUI {...ortak} k="konu" label="İlgilendiğiniz konu" as="select" req={false}><option value="">Seçin (isteğe bağlı)</option>{KONU.map(o => <option key={o}>{o}</option>)}</AlanUI>
          </div>
          <AlanUI {...ortak} k="mesaj" label="Mesaj / paylaşmak istediğiniz ihtiyaç" as="textarea" />
          <div className={`af-consent${err.onay ? ' has-err' : ''}`}>
            <label><input type="checkbox" name="onay" checked={f.onay} onChange={e => set('onay', e.target.checked)} disabled={durum === 'submitting'} aria-invalid={!!err.onay} aria-describedby={err.onay ? 'af-onay-e' : undefined} /><span>Kişisel verilerimin demo talebime dönüş yapılması amacıyla işlenmesini kabul ediyorum.</span></label>
            {err.onay && <p id="af-onay-e" className="af-err" role="alert">{err.onay}</p>}
          </div>
          <div className="af-form__act">
            <Btn p type="submit" disabled={durum === 'submitting' || gonderildi} aria-busy={durum === 'submitting'}>{durum === 'submitting' ? 'Gönderiliyor…' : gonderildi ? 'Talebiniz alındı' : 'Demo talebi gönder'}</Btn>
            <a href={WA} target="_blank" rel="noopener noreferrer" className="em-btn">WhatsApp’tan ulaşın</a>
          </div>
          <div ref={ozetRef} tabIndex={-1} className="af-status" aria-live="polite">
            {durum === 'success' && <p className="af-status__ok"><Ico n="check" size={16} />Talebiniz alındı. EstateMatch ekibi sizinle iletişime geçecek.</p>}
            {durum === 'error' && <div className="af-status__err"><p>Talebiniz şu anda gönderilemedi. Bilgilerinizi kaybetmeden tekrar deneyebilir veya WhatsApp üzerinden bize ulaşabilirsiniz.</p><div className="af-status__act"><Btn small onClick={() => setDurum('idle')}>Tekrar dene</Btn><a className="em-link" href={`https://wa.me/905315178170?text=${waMetin()}`} target="_blank" rel="noopener noreferrer">Bilgilerimi WhatsApp ile gönder</a></div></div>}
            {durum === 'fallback' && <div className="af-status__err"><p>Çevrimiçi gönderim henüz bu sayfaya bağlı değil; talebiniz gönderilmedi. Bilgileriniz formda duruyor. Aynı içeriği tek dokunuşla WhatsApp üzerinden iletebilirsiniz.</p><div className="af-status__act"><a className="em-btn em-btn--p" href={`https://wa.me/905315178170?text=${waMetin()}`} target="_blank" rel="noopener noreferrer">Bilgilerimi WhatsApp ile gönder</a><Btn small onClick={() => setDurum('idle')}>Formu düzenle</Btn></div></div>}
          </div>
        </form>
      </div>
    </Sec>)
}
