import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { usePageSeo, usePageSchema } from './pageParts.jsx'
import './EstateMatch.css'

/* ═══════════════════════════════════════════════════════════════
   ESTATEMATCH — GÖRÜŞ ALANI

   Yorumlanan felsefe: insanlar bildiklerini yazar, hissettikleriyle
   karar verir. Klasik arama yazılanı bulur. EstateMatch yazılanın
   dışında kalan ihtimali görünür kılar.

   Görsel metafor: arama bir ışık huzmesidir. Kriterler dar ve keskin
   bir kare çizer; içi aydınlık, dışı karanlıktır. EstateMatch ışığı
   genişletir. Kararı değiştirecek olan, çoğu zaman karenin hemen
   dışındadır.

   İmza etkileşim: ziyaretçinin kendi yazdığı cümle o kareyi çizer.
   Sonra sayfa ışığı açar ve karenin dışındakini gösterir.
   ═══════════════════════════════════════════════════════════════ */

/* ── Tek scroll sürücüsü: sayfa başına bir dinleyici, rAF ile
     toplanır ve kayıtlı öğelere CSS değişkeni yazar. Sahne başına
     ayrı dinleyici açmaz, React ağacını her karede yeniden çizmez. ── */
const driver = (() => {
  const targets = new Map()
  let raf = 0, running = false
  const frame = () => {
    raf = 0
    const vh = window.innerHeight
    targets.forEach((cb, el) => {
      const r = el.getBoundingClientRect()
      const span = Math.max(1, el.offsetHeight - vh)
      cb(Math.min(1, Math.max(0, -r.top / span)), r)
    })
  }
  const tick = () => { if (!raf) raf = requestAnimationFrame(frame) }
  return {
    add(el, cb) {
      targets.set(el, cb)
      if (!running) {
        running = true
        window.addEventListener('scroll', tick, { passive: true })
        window.addEventListener('resize', tick, { passive: true })
      }
      tick()
    },
    remove(el) {
      targets.delete(el)
      if (targets.size === 0 && running) {
        running = false
        window.removeEventListener('scroll', tick)
        window.removeEventListener('resize', tick)
        if (raf) cancelAnimationFrame(raf), raf = 0
      }
    },
  }
})()

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* Sahne ilerlemesini doğrudan DOM'a yazar (state yok, yeniden çizim yok) */
function useScrub(varName = '--p') {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reducedMotion()) { el.style.setProperty(varName, '1'); return }
    const cb = p => el.style.setProperty(varName, p.toFixed(4))
    driver.add(el, cb)
    return () => driver.remove(el)
  }, [varName])
  return ref
}

function useSeen(threshold = 0.25) {
  const ref = useRef(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reducedMotion()) { setSeen(true); return }
    const io = new IntersectionObserver(e => {
      if (e[0].isIntersecting) { setSeen(true); io.disconnect() }
    }, { threshold })
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])
  return [ref, seen]
}

/* ── Görsel altyapısı: WebP + srcset, oran ayrılmış (CLS yok) ── */
const PHOTO_W = {
  'property-fulya': [640, 1024, 1600],
  'property-nisantasi': [640, 1024],
  'property-macka': [640, 1024, 1600],
}
const photoSrc = n => {
  const w = PHOTO_W[n] || [1024]
  return { src: `/screens/${n}-${w.at(-1)}.webp`, srcSet: w.map(x => `/screens/${n}-${x}.webp ${x}w`).join(', ') }
}
function Photo({ name, alt, sizes = '100vw', ratio = '4 / 3', className, eager }) {
  const { src, srcSet } = photoSrc(name)
  return (
    <img className={className} src={src} srcSet={srcSet} sizes={sizes} alt={alt}
      style={{ aspectRatio: ratio }} loading={eager ? 'eager' : 'lazy'} decoding={eager ? 'sync' : 'async'} />
  )
}

/* ══════════════ Doğal dil ayrıştırma (gerçek, çalışır) ══════════════ */
const BOLGELER = ['Nişantaşı', 'Fulya', 'Maçka', 'Teşvikiye', 'Bomonti', 'Beşiktaş', 'Levent', 'Kadıköy', 'Etiler', 'Ulus']
const VARSAYILAN = 'Nişantaşı veya Fulya, 3+1, 18 milyona kadar, yeni bina.'

function ayristir(metin) {
  const t = (metin || '').trim()
  const kucuk = t.toLocaleLowerCase('tr-TR')
  const cikti = []
  const bolge = BOLGELER.filter(b => kucuk.includes(b.toLocaleLowerCase('tr-TR')))
  if (bolge.length) cikti.push({ k: 'Bölge', v: bolge.join(', ') })
  const oda = t.match(/(\d)\s*\+\s*(\d)/)
  if (oda) cikti.push({ k: 'Oda', v: oda[0].replace(/\s/g, '') })
  const butce = t.match(/(\d+(?:[.,]\d+)?)\s*milyon/i)
  if (butce) cikti.push({ k: 'Bütçe', v: `${butce[1]} milyon TL'ye kadar` })
  const m2 = t.match(/(\d{2,4})\s*m2|(\d{2,4})\s*m²/i)
  if (m2) cikti.push({ k: 'Alan', v: `${m2[1] || m2[2]} m² üzeri` })
  if (/yeni\s*bina|sıfır/i.test(t)) cikti.push({ k: 'Bina', v: 'Yeni bina' })
  if (/otopark|garaj/i.test(t)) cikti.push({ k: 'Zorunlu', v: 'Otopark' })
  if (/asansör/i.test(t)) cikti.push({ k: 'Zorunlu', v: 'Asansör' })
  if (/bahçe/i.test(t)) cikti.push({ k: 'Zorunlu', v: 'Bahçe' })
  if (/yatırım/i.test(t)) cikti.push({ k: 'Amaç', v: 'Yatırım' })
  return cikti.length ? cikti : [{ k: 'Kriter', v: 'Henüz yazılmadı' }]
}

/* ══════════════ 01 · AÇILIŞ ══════════════ */
/* Önizleme: kriterlerin çizdiği kare, henüz aydınlık zeminde.
   Aynı geometri koyu perdede büyüyecek. Noktalar kare içi için
   karenin, kare dışı için sahanın yüzdesiyle konumlanır; böylece
   her kırılımda "dışarıda" gerçekten dışarıda kalır. */
const ONIZ = {
  ic: [[30, 26], [62, 40], [44, 64], [24, 54], [70, 74], [52, 14]],
  dis: [[72, 10], [88, 32], [76, 58], [92, 74], [66, 88], [30, 92], [16, 5], [46, 6], [90, 8], [10, 90]],
}

function Acilis({ sorgu, setSorgu, onGoster, onDemo }) {
  const [yazildi, setYazildi] = useState(false)

  /* Örnek cümle kendini yazar; ziyaretçi dokunduğu an durur ve devri alır */
  useEffect(() => {
    if (yazildi) return
    if (reducedMotion()) { setSorgu(VARSAYILAN); return }
    let i = 0
    const t = setInterval(() => {
      i += 1
      setSorgu(VARSAYILAN.slice(0, i))
      if (i >= VARSAYILAN.length) clearInterval(t)
    }, 26)
    return () => clearInterval(t)
  }, [yazildi, setSorgu])

  const kriter = ayristir(sorgu).filter(c => c.k !== 'Kriter')

  return (
    <section className="ev-acilis">
      <div className="ev-kap ev-acilis__in">
        <div className="ev-acilis__soz">
          <p className="ev-marka">EstateMatch <span>by SRYVERSE</span></p>
          <h1 className="ev-acilis__h1">Aradığınızı buluruz.<br />Aramadığınızı da.</h1>
          <p className="ev-acilis__alt">
            Yazdığınız kriterleri anlar, kararınızı değiştirebilecek ihtimalleri de görünür kılar.
          </p>

          <form className="ev-arama" onSubmit={e => { e.preventDefault(); onGoster() }}>
            <label className="ev-arama__et" htmlFor="ev-sorgu">Müşteriniz ne arıyor</label>
            <div className="ev-arama__satir">
              <input
                id="ev-sorgu" type="text" value={sorgu}
                onChange={e => { setYazildi(true); setSorgu(e.target.value) }}
                onFocus={() => setYazildi(true)}
                placeholder={VARSAYILAN} autoComplete="off" spellCheck="false"
              />
              <button type="submit" className="ev-dugme ev-dugme--ana">Alanı aç</button>
            </div>
            <ul className="ev-arama__cip">
              {ayristir(sorgu).map(c => (
                <li key={c.k + c.v}><span>{c.k}</span>{c.v}</li>
              ))}
            </ul>
          </form>

          <button type="button" className="ev-baglanti ev-acilis__demo" onClick={onDemo}>
            Demo İste
          </button>
        </div>

        <aside className="ev-oniz">
          <div className="ev-oniz__saha">
            {ONIZ.dis.map(([x, y], i) => (
              <i key={`d${i}`} className={`ev-oniz__n ev-oniz__n--dis${i === 2 ? ' ev-oniz__n--olasi' : ''}`}
                style={{ left: `${x}%`, top: `${y}%` }} />
            ))}
            <span className="ev-oniz__kare">
              {ONIZ.ic.map(([x, y], i) => (
                <i key={`i${i}`} className="ev-oniz__n ev-oniz__n--ic" style={{ left: `${x}%`, top: `${y}%` }} />
              ))}
            </span>
          </div>
          <p className="ev-oniz__et">
            <b>{kriter.length || 0} kriter</b> bu kareyi çiziyor. Kararınızı değiştirecek ilan
            karenin dışında olabilir.
          </p>
        </aside>
      </div>
    </section>
  )
}

/* ══════════════ 02 · YAZILANIN SINIRI ══════════════ */
function Sinir({ sorgu }) {
  const [ref, seen] = useSeen(0.4)
  const kriter = ayristir(sorgu).filter(c => c.k !== 'Kriter')
  return (
    <section className="ev-sinir" ref={ref}>
      <div className="ev-kap">
        <p className={`ev-sinir__satir${seen ? ' is-on' : ''}`}>
          Bu {kriter.length || 4} kriterin hepsini karşılayan
          <strong> 247 ilan</strong> var.
        </p>
        <p className={`ev-sinir__satir ev-sinir__satir--iki${seen ? ' is-on' : ''}`}>
          Hepsi doğru. Hiçbiri karar değil.
        </p>
        <p className={`ev-sinir__ornek${seen ? ' is-on' : ''}`}>Örnek senaryo</p>
        <p className={`ev-sinir__not${seen ? ' is-on' : ''}`}>
          Bu listeyi elemek bir danışmanın gününü alır. Sonunda seçilen ilan
          çoğu zaman listenin ilk sırasında değildir.
        </p>
      </div>
    </section>
  )
}

/* ══════════════ 03 · GÖRÜŞ ALANI (zirve) ══════════════ */
/* Koordinatlar deterministik: her yüklemede aynı, kayma yok.
   "içeride" karenin yüzdesi, "dışarıda" sahanın yüzdesidir; kare
   sahanın içinde sabit oranda durduğu için dışarıdakiler her ekran
   boyutunda gerçekten karenin dışında kalır. */
const ALAN = {
  içeride: [[28, 22], [58, 34], [38, 52], [70, 62], [22, 68], [50, 80], [64, 12], [34, 90]],
  dışarıda: [[5, 9], [3, 48], [8, 84], [24, 7], [30, 90], [44, 8], [48, 92], [68, 12], [74, 66], [82, 30], [88, 84], [94, 48]],
}

function GorusAlani({ sorgu }) {
  const ref = useScrub('--p')
  const kriter = ayristir(sorgu).filter(c => c.k !== 'Kriter').slice(0, 3)
  return (
    <section id="alan" className="ev-alan" ref={ref}>
      <div className="ev-alan__sahne">
        <div className="ev-alan__duzen">
          <div className="ev-alan__soz">
            <p className="ev-alan__s1">Arama, yazdığınızı aydınlatır.</p>
            <p className="ev-alan__s2">Karar çoğu zaman karenin dışındadır.</p>
            <p className="ev-alan__s3">EstateMatch ışığı genişletir.</p>
          </div>

          <div className="ev-alan__saha">
            {ALAN.dışarıda.map(([x, y], i) => (
              <i key={`d${i}`} className="ev-nokta ev-nokta--dis" style={{ left: `${x}%`, top: `${y}%` }} />
            ))}
            <span className="ev-alan__isik" aria-hidden="true" />
            <span className="ev-alan__kare">
              {ALAN.içeride.map(([x, y], i) => (
                <i key={`i${i}`} className="ev-nokta ev-nokta--ic" style={{ left: `${x}%`, top: `${y}%` }} />
              ))}
              <em>{kriter.map(k => k.v).join(' · ') || 'yazdığınız kriterler'}</em>
            </span>
            <span className="ev-alan__bulgu">
              <span className="ev-alan__bulguIc">
                <Photo name="property-macka" alt="" ratio="4 / 3" sizes="220px" />
                <b>Maçka Residence</b>
              </span>
            </span>
          </div>

        </div>
        <span className="ev-alan__vinyet" aria-hidden="true" />
      </div>
    </section>
  )
}

/* ══════════════ 04 · NEDEN BU ══════════════ */
const KARSILANAN = [
  { k: 'Bölge', d: 'Maçka, yazdığınız iki bölgeye yürüme mesafesinde' },
  { k: 'Bina yaşı', d: '3 yaşında, yeni bina beklentisini karşılıyor' },
  { k: 'Ulaşım', d: 'Metro 4 dakika, okul 6 dakika yürüme' },
]
const KARSILANMAYAN = [
  { k: 'Oda sayısı', d: '3+1 yazdınız, bu daire 2+1' },
  { k: 'Bütçe', d: '18 milyon yazdınız, bu ilan 17,8 milyon üzerine 400 bin masraf getiriyor' },
]

function NedenBu({ onDemo }) {
  const [ref, seen] = useSeen(0.3)
  return (
    <section id="neden" className="ev-neden" ref={ref}>
      <div className="ev-kap ev-neden__in">
        <figure className="ev-neden__gorsel">
          <Photo name="property-macka" alt="Maçka Residence, temsili görsel" ratio="4 / 3"
            sizes="(max-width: 900px) 88vw, 44vw" />
          <figcaption>Maçka Residence. Temsili görsel, örnek senaryo.</figcaption>
        </figure>

        <div className="ev-neden__metin">
          <h2 className="ev-h2">Kriterlerinizin ikisini karşılamıyor.<br />Yine de en güçlü eşleşme.</h2>
          <p className="ev-govde">
            EstateMatch bir skor söyleyip susmaz. Neyin uyduğunu, neyin uymadığını
            ve uymayanın neden kabul edilebilir olduğunu birlikte gösterir. Kararı
            danışman verir.
          </p>

          <dl className={`ev-gerekce${seen ? ' is-on' : ''}`}>
            {KARSILANAN.map((x, i) => (
              <div key={x.k} className="ev-gerekce__s" style={{ '--i': i }}>
                <dt>{x.k}</dt>
                <dd>{x.d}</dd>
              </div>
            ))}
            {KARSILANMAYAN.map((x, i) => (
              <div key={x.k} className="ev-gerekce__s ev-gerekce__s--acik" style={{ '--i': i + KARSILANAN.length }}>
                <dt>{x.k}</dt>
                <dd>{x.d}</dd>
              </div>
            ))}
          </dl>

          <p className="ev-govde ev-govde--vurgu">
            Müşteri bu daireyi seçtiyse, sebebi oda sayısı değildi.
          </p>
          <button type="button" className="ev-baglanti" onClick={onDemo}>Demo İste</button>
        </div>
      </div>
    </section>
  )
}

/* ══════════════ 05 · MOTOR ══════════════ */
const ASAMA = [
  { b: 'Okuma', d: 'Doğal dille yazılmış talebi yapıya çevirir. "Metroya yakın" bir mesafe, "yeni bina" bir yaş aralığı olur.' },
  { b: 'Toparlama', d: 'Farklı kaynaklardan gelen dağınık ilan bilgisini tek modelde birleştirir; eksik alanları işaretler.' },
  { b: 'Çevre', d: 'Konumun etrafını değerlendirir: ulaşım, okul, günlük hayatın işleyişi.' },
  { b: 'Karşılaştırma', d: 'Portföyü talebe göre ağırlıklandırır. Yazılmayan tercihleri geçmiş davranıştan çıkarır.' },
  { b: 'Gerekçe', d: 'Sonucu değil, sonucun nedenini üretir. Danışman onaylar, düzeltir veya reddeder.' },
]

function Motor() {
  const [ref, seen] = useSeen(0.2)
  return (
    <section id="motor" className="ev-motor" ref={ref}>
      <div className="ev-kap">
        <p className="ev-ust">Motor</p>
        <h2 className="ev-h2 ev-h2--genis">On saatlik araştırmayı<br />saniyelere indiren şey.</h2>
        <ol className={`ev-asama${seen ? ' is-on' : ''}`}>
          {ASAMA.map((a, i) => (
            <li key={a.b} style={{ '--i': i }}>
              <h3>{a.b}</h3>
              <p>{a.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ══════════════ 06 · ÜRÜN ══════════════ */
const YUZEY = [
  {
    ad: 'Eşleştirme',
    ozet: 'Talep girilir, portföy taranır, sonuçlar gerekçesiyle sıralanır.',
    gorsel: '/screens/ai-matches.webp',
    alt: 'EstateMatch eşleştirme ekranı',
  },
  {
    ad: 'Müşteri',
    ozet: 'Görüşmeler, tercihler ve geçmiş tek profilde toplanır; bağlam danışmanla birlikte kaybolmaz.',
    gorsel: '/screens/clients-list.webp',
    alt: 'EstateMatch müşteri listesi ekranı',
  },
  {
    ad: 'Portföy',
    ozet: 'İlanlar nitelikleriyle yapılandırılır, hareketsiz kalanlar işaretlenir.',
    gorsel: '/screens/portfolio-grid.webp',
    alt: 'EstateMatch portföy ekranı',
  },
  {
    ad: 'Süreç',
    ozet: 'İlk temastan kapanışa kadar her adım tek akışta izlenir.',
    gorsel: '/screens/pipeline-board.webp',
    alt: 'EstateMatch satış süreci ekranı',
  },
  {
    ad: 'Raporlama',
    ozet: 'Ciro, dönüşüm ve danışman performansı yöneticiye tek ekranda açılır.',
    gorsel: '/screens/reports-dashboard.webp',
    alt: 'EstateMatch raporlama ekranı',
  },
]

function Urun({ onFeatures }) {
  const [aktif, setAktif] = useState(0)
  return (
    <section id="urun" className="ev-urun">
      <div className="ev-kap">
        <p className="ev-ust">Ürün</p>
        <h2 className="ev-h2">Bir fikir değil, çalışan bir sistem.</h2>

        <div className="ev-urun__in">
          <ul className="ev-yuzey">
            {YUZEY.map((y, i) => (
              <li key={y.ad}>
                <button
                  type="button"
                  className={i === aktif ? 'is-on' : ''}
                  aria-current={i === aktif}
                  onMouseEnter={() => setAktif(i)}
                  onFocus={() => setAktif(i)}
                  onClick={() => setAktif(i)}
                >
                  <strong>{y.ad}</strong>
                  <span>{y.ozet}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="ev-urun__ekran">
            <img key={YUZEY[aktif].gorsel} src={YUZEY[aktif].gorsel} alt={YUZEY[aktif].alt}
              width="1600" height="1000" loading="lazy" decoding="async" />
          </div>
        </div>

        <button type="button" className="ev-baglanti" onClick={onFeatures}>Tüm özellikler</button>
      </div>
    </section>
  )
}

/* ══════════════ 07 · KAPANIŞ ══════════════ */
function Kapanis({ onDemo }) {
  const [ref, seen] = useSeen(0.4)
  return (
    <section className="ev-kapanis" ref={ref}>
      <div className="ev-kap ev-kapanis__in">
        <span className={`ev-kapanis__isik${seen ? ' is-on' : ''}`} aria-hidden="true" />
        <h2 className="ev-kapanis__h">
          Size ne seçeceğinizi söylemez.<br />Göremediğinizi gösterir.
        </h2>
        <button type="button" className="ev-dugme ev-dugme--ana" onClick={onDemo}>Demo İste</button>
        <p className="ev-kapanis__imza">EstateMatch <span>by SRYVERSE</span></p>
      </div>
    </section>
  )
}

/* ══════════════ SAYFA ══════════════ */
const SEO_BASLIK = 'EstateMatch AI | Yapay Zekâ Destekli Gayrimenkul CRM ve Eşleştirme Platformu'
const SEO_ACIKLAMA = 'EstateMatch AI; emlak şirketlerinin müşterilerini, portföylerini, satış süreçlerini ve danışman performansını tek platformdan yönetmesini sağlayan yapay zekâ destekli gayrimenkul satış platformudur.'

export default function EstateMatchPage({ goBack, onDemo, onFeatures }) {
  const [sorgu, setSorgu] = useState('')

  usePageSeo({
    title: SEO_BASLIK, description: SEO_ACIKLAMA, path: '/estatematch',
    ogImage: 'https://sryverse.com/screens/property-macka-1600.webp',
  })
  const schema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'EstateMatch AI',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: SEO_ACIKLAMA,
    url: 'https://sryverse.com/estatematch',
    publisher: { '@type': 'Organization', name: 'SRYVERSE' },
  }), [])
  usePageSchema(schema)

  useEffect(() => { window.scrollTo(0, 0) }, [])

  const demo = useCallback(() => { onDemo ? onDemo() : goBack?.() }, [onDemo, goBack])
  const alanaGit = useCallback(() => {
    document.querySelector('#alan')?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' })
  }, [])

  return (
    <main className="ev">
      <Acilis sorgu={sorgu} setSorgu={setSorgu} onGoster={alanaGit} onDemo={demo} />
      <Sinir sorgu={sorgu} />
      <GorusAlani sorgu={sorgu} />
      <NedenBu onDemo={demo} />
      <Motor />
      <Urun onFeatures={onFeatures} />
      <Kapanis onDemo={demo} />
    </main>
  )
}
