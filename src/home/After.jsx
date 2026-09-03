/* 12–13 — Nasıl çalışıyoruz (kısa, somut) ve iletişim.
   İletişim formu dürüst çalışır: çevrimiçi uç nokta tanımlı değilse
   gönderilmiş gibi davranmaz; aynı içeriği WhatsApp ile iletme yolu sunar. */
import { useRef, useState, useEffect } from 'react'
import { In, WA } from './bits.jsx'

const METOD = ['Gözlemle', 'Modelle', 'Optimize et', 'Otomatize', 'Ölçeklendir']
const ADIM = [
  { n: '01', t: 'Anla', d: 'Gerçek iş problemi, mevcut akış ve karar noktaları.' },
  { n: '02', t: 'Kur', d: 'Veri modeli, yapay zekâ ve otomasyon; sonra ürün olarak ölçek.', metod: true },
  { n: '03', t: 'Sadeleştir', d: 'Ekibin gerçekten kullandığı, sakin bir arayüz.' },
]
export function Thinking() {
  return (
    <section id="methodology" className="ht" aria-labelledby="ht-h">
      <div className="h-wrap ht__in">
        <div>
          <In><p className="h-kicker">Nasıl çalışıyoruz</p></In>
          <In delay={60}><h2 id="ht-h" className="h-h2s">Altta karmaşık.<br />Yüzeyde sade.</h2></In>
        </div>
        <ol className="ht__cols">
          {ADIM.map((s, i) => (
            <In as="li" key={s.n} className="ht__col" delay={100 + i * 80}>
              <span className="ht__n">{s.n}</span>
              <h3 className="ht__t">{s.t}</h3>
              <p className="ht__d">{s.d}</p>
              {s.metod && <ol className="ht__metod" aria-label="Beş adım">{METOD.map(m => <li key={m}>{m}</li>)}</ol>}
            </In>))}
        </ol>
      </div>
    </section>)
}

/* ── İletişim ── */
const DEMO_ENDPOINT = import.meta.env.VITE_DEMO_ENDPOINT || ''
const URUN = ['EstateMatch AI', 'SkillMatch AI', 'Özel sistem / dijital dönüşüm']
const BOS = { ad: '', sirket: '', eposta: '', urun: '', mesaj: '' }

function ContactForm() {
  const [f, setF] = useState(BOS)
  const [durum, setDurum] = useState('idle') /* idle · submitting · success · error · fallback */
  const statusRef = useRef(null)
  const set = (k, v) => setF(x => ({ ...x, [k]: v }))
  const waMetin = () => encodeURIComponent(`Merhaba, SRYVERSE demo talebi.\nAd Soyad: ${f.ad}\nŞirket: ${f.sirket}\nE-posta: ${f.eposta}\nKonu: ${f.urun}\nMesaj: ${f.mesaj}`)
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
      <div className="hk-f"><label htmlFor="hk-urun">Konu</label>
        <select id="hk-urun" name="urun" required value={f.urun} onChange={e => set('urun', e.target.value)} disabled={busy}>
          <option value="" disabled>Seçin</option>{URUN.map(u => <option key={u}>{u}</option>)}
        </select>
      </div>
      <div className="hk-f"><label htmlFor="hk-mesaj">Mesaj</label><textarea id="hk-mesaj" name="mesaj" rows="4" required placeholder="Operasyonunuzu ya da çözmek istediğiniz sorunu kısaca anlatın." value={f.mesaj} onChange={e => set('mesaj', e.target.value)} disabled={busy} /></div>
      <div className="hk-form__act">
        <button type="submit" className="h-cta h-cta--solid" disabled={busy || durum === 'success'} aria-busy={busy}>{busy ? 'Gönderiliyor…' : durum === 'success' ? 'Talebiniz alındı' : 'Demo planlayın'}<span aria-hidden="true">→</span></button>
        <a href={WA} className="h-ext" target="_blank" rel="noopener noreferrer">WhatsApp’tan yazın</a>
      </div>
      <div ref={statusRef} tabIndex={-1} className="hk-status" aria-live="polite">
        {durum === 'success' && <p className="hk-status__ok">Talebiniz alındı. 24 saat içinde dönüş yapacağız.</p>}
        {durum === 'error' && <div className="hk-status__note"><p>Talebiniz şu anda gönderilemedi. Bilgileriniz formda duruyor; tekrar deneyebilir ya da aynı içeriği WhatsApp ile iletebilirsiniz.</p><div className="hk-status__act"><button type="button" className="h-ext" onClick={() => setDurum('idle')}>Tekrar dene</button><a className="h-ext" href={`https://wa.me/905315178170?text=${waMetin()}`} target="_blank" rel="noopener noreferrer">Bilgilerimi WhatsApp ile gönder</a></div></div>}
        {durum === 'fallback' && <div className="hk-status__note"><p>Çevrimiçi gönderim henüz bu sayfaya bağlı değil; talebiniz gönderilmedi. Bilgileriniz formda duruyor, aynı içeriği tek dokunuşla WhatsApp üzerinden iletebilirsiniz.</p><div className="hk-status__act"><a className="h-cta h-cta--solid" href={`https://wa.me/905315178170?text=${waMetin()}`} target="_blank" rel="noopener noreferrer">Bilgilerimi WhatsApp ile gönder<span aria-hidden="true">→</span></a><button type="button" className="h-ext" onClick={() => setDurum('idle')}>Formu düzenle</button></div></div>}
      </div>
    </form>)
}

export function Contact() {
  return (
    <section id="contact" className="hk" aria-labelledby="hk-h">
      <span id="iletisim" className="h-anchor" aria-hidden="true" />
      <div className="h-wrap hk__in">
        <div className="hk__l">
          <In><p className="h-kicker">İletişim</p></In>
          <In delay={60}><h2 id="hk-h" className="h-h2">Bir sonraki sistemi<br /><em>birlikte kuralım.</em></h2></In>
          <In delay={120}><p className="h-lead">Sürecinizi anlatın. Darboğazı birlikte bulalım, sistemi tasarlayalım, otomasyonu kuralım.</p></In>
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
