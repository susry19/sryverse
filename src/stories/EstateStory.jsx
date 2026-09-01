import { useState, useEffect, useRef, useCallback } from 'react'
import { Scene, Eye, H, P, Fx, Metrics } from './parts.jsx'

/* ── Sahne 1: Problem ── */
const PROBLEMS = [
  { h: 'Serbest müşteri notları', p: '"Denize yakın, sakin ama merkeze ulaşımı kolay" gibi gerçek konuşma dilini anlar.' },
  { h: 'Yüzlerce ilan arasında arama', p: 'Hafızaya ve tek tek filtrelemeye bağlı saatleri, akıllı eşleştirmeye dönüştürür.' },
  { h: 'Kopuk satış süreci', p: 'Müşteriden randevuya, tekliften komisyona kadar tüm süreci görünür yapar.' },
]

function ProblemScene() {
  return (
    <Scene>
      <Fx><Eye>Gerçek problem</Eye></Fx>
      <Fx delay={60}>
        <H>Dağınık bilgi,<br /><em>görünmeyen fırsat demektir.</em></H>
      </Fx>
      <Fx delay={120}>
        <P>
          Bir müşteri talebi WhatsApp'ta, portföy Excel'de, randevu defterdeyse; iş büyüdükçe
          fırsatlar kaybolur. EstateMatch bütün operasyonu tek bir akışta birleştirir.
        </P>
      </Fx>

      <Fx delay={180}>
        <div className="pprobs">
          {PROBLEMS.map((x, i) => (
            <div key={i} className="pprob">
              <h4 className="pprob__h">{x.h}</h4>
              <p className="pprob__p">{x.p}</p>
            </div>
          ))}
        </div>
      </Fx>

      <Fx delay={240}>
        <div className="pversus">
          <div className="pvs__side">
            <span className="pvs__lbl">Manuel yöntem</span>
            <div className="pvs__v">2–3</div>
            <span className="pvs__u">saat</span>
          </div>
          <div className="pvs__arrow">→</div>
          <div className="pvs__side pvs__side--good">
            <span className="pvs__lbl">EstateMatch AI</span>
            <div className="pvs__v">0.2</div>
            <span className="pvs__u">saniye</span>
          </div>
        </div>
      </Fx>
    </Scene>
  )
}

/* ── Sahne 1.5: Gerçek ürün ekranı — soyut anlatının arasında somut kanıt ── */
function ProductScene({ onOpenPage, pageKey }) {
  return (
    <Scene>
      <Fx><Eye>Gerçek ürün</Eye></Fx>
      <Fx delay={60}>
        <H>Konsept değil, <em>çalışan platform.</em></H>
      </Fx>
      <Fx delay={120}>
        <P>
          Aşağıda EstateMatch AI panelinden bir kesit görüyorsunuz — aktif portföy, sıcak
          müşteriler ve AI öngörüleri tek ekranda toplanır.
        </P>
      </Fx>
      <Fx delay={180}>
        <div className="pshot">
          <div className="pshot__bar">
            <span className="pshot__dot" /><span className="pshot__dot" /><span className="pshot__dot" />
            <span className="pshot__url">estate.sryverse.com — Panel</span>
          </div>
          <img className="pshot__img" src="/screens/dashboard.webp" alt="EstateMatch AI panel ekranı" loading="lazy" />
        </div>
      </Fx>
      {onOpenPage && pageKey && (
        <Fx delay={240}>
          <div className="pcta-row">
            <button className="pbtn pbtn--solid" onClick={() => onOpenPage(pageKey)}>
              Tüm ekranları gör <span>→</span>
            </button>
          </div>
        </Fx>
      )}
    </Scene>
  )
}

/* ── Sahne 2: Akıllı arama (interaktif) ── */
const LISTINGS = [
  {
    score: 96, meta: 'Üsküdar · Yalı', name: 'Çengelköy Boğaz Yalısı',
    desc: 'Boğaz manzarası, kapalı otopark ve güvenlikli sakin yaşam.',
    hi: ['kapalı otopark', 'Boğaz manzarası'],
    tags: 'boğaz manzara yalı otopark güvenlik sakin deniz üsküdar çengelköy villa',
  },
  {
    score: 91, meta: 'Sarıyer · Villa', name: 'Tarabya Deniz Manzaralı',
    desc: 'Özel havuz, geniş bahçe ve iki araçlık garaj.',
    hi: ['havuz', 'iki araçlık garaj'],
    tags: 'havuz villa bahçe garaj otopark deniz manzara sarıyer tarabya yatırım',
  },
  {
    score: 87, meta: 'Nişantaşı · Daire', name: 'Teşvikiye Merkez',
    desc: 'Merkezi konum, yüksek kira potansiyeli ve kolay ulaşım.',
    hi: ['merkezi konum', 'yüksek kira'],
    tags: 'merkez daire kira yatırım ulaşım nişantaşı teşvikiye merkezi',
  },
]

const SUGGESTIONS = ['Havuzlu villa', 'Denize yakın + otopark', 'Yatırımlık merkezi daire']

function highlight(text, terms) {
  if (!terms.length) return text
  const re = new RegExp(`(${terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi')
  return text.split(re).map((part, i) =>
    terms.some(t => t.toLowerCase() === part.toLowerCase())
      ? <mark key={i}>{part}</mark>
      : part
  )
}

function SearchScene() {
  const [query, setQuery] = useState('')
  const [visible, setVisible] = useState(() => LISTINGS.map(() => true))
  const [note, setNote] = useState('3 sonuç semantik anlam ve ilan açıklamalarına göre sıralandı.')

  const run = useCallback((raw) => {
    const words = raw.toLocaleLowerCase('tr-TR').split(/[\s,]+/).filter(w => w.length > 2)
    const next = LISTINGS.map(l => words.length === 0 || words.some(w => l.tags.includes(w)))
    const count = next.filter(Boolean).length
    setVisible(next)
    setNote(
      count === 0
        ? 'Eşleşme bulunamadı — farklı bir ifade deneyin.'
        : `${count} sonuç kelime, kriter ve semantik anlama göre sıralandı.`
    )
  }, [])

  return (
    <Scene>
      <Fx><Eye>Bir arama kutusundan fazlası</Eye></Fx>
      <Fx delay={60}>
        <H>Bir kelimeyi de bulur.<br /><em>Niyetinizi de anlar.</em></H>
      </Fx>
      <Fx delay={120}>
        <P>
          İlanın yapısal alanlarını, açıklamasındaki tek bir kelimeyi ve aynı kelimeler
          kullanılmasa bile benzer anlamı birlikte tarar. "Kapalı garaj" araması, açıklamadaki
          "iki araçlık otopark" ifadesini de yakalayabilir.
        </P>
      </Fx>

      <Fx delay={180}>
        <div className="psearch">
          <div className="psearch__bar">
            <input
              className="psearch__input"
              placeholder="Örn: denize yakın otoparklı villa"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') run(query) }}
              aria-label="Portföy araması"
            />
            <button className="psearch__btn" onClick={() => run(query)}>Akıllı Ara</button>
          </div>

          <div className="psugs">
            {SUGGESTIONS.map(s => (
              <button key={s} className="psug" onClick={() => { setQuery(s); run(s) }}>{s}</button>
            ))}
          </div>

          <div className="presults">
            {LISTINGS.map((l, i) => (
              <div key={l.name} className={`pres${visible[i] ? '' : ' pres--hide'}`}>
                <div className="pres__score">%{l.score}</div>
                <div>
                  <span className="pres__meta">{l.meta}</span>
                  <div className="pres__name">{l.name}</div>
                  <p className="pres__desc">{highlight(l.desc, l.hi)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="psearch__note">✦ {note}</div>
        </div>
      </Fx>
    </Scene>
  )
}

/* ── Sahne 3: Uçtan uca akış ── */
const FLOW = [
  { id: '01', n: 'Talep', d: 'Müşteri ihtiyacı doğal dilde kaydedilir.' },
  { id: '02', n: 'Eşleşme', d: 'En uygun ilanlar gerekçeleriyle sıralanır.' },
  { id: '03', n: 'Randevu', d: 'Takip ve gösterimler takvime bağlanır.' },
  { id: '04', n: 'Teklif', d: 'Fırsat Kanban üzerinde ilerletilir.' },
  { id: '05', n: 'Kapanış', d: 'Satış, gelir ve komisyon görünür olur.' },
]

function FlowScene() {
  const [active, setActive] = useState(0)
  const ref = useRef(null)
  const [on, setOn] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { threshold: 0.25 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!on) return
    const t = setInterval(() => setActive(a => (a + 1) % FLOW.length), 1900)
    return () => clearInterval(t)
  }, [on])

  return (
    <Scene>
      <Fx><Eye>Uçtan uca satış akışı</Eye></Fx>
      <Fx delay={60}>
        <H>Talep geldiği anda,<br /><em>hiçbir adım kaybolmaz.</em></H>
      </Fx>
      <Fx delay={120}>
        <P>
          Her modül ayrı bir araç değil; müşteri kazanımını hızlandıran aynı sistemin parçasıdır.
          Danışman ekranlar arasında değil, fırsatlar arasında hareket eder.
        </P>
      </Fx>

      <Fx delay={180}>
        <div className="pflow" ref={ref}>
          {FLOW.map((s, i) => (
            <div
              key={s.id}
              className={`pstep${i === active ? ' pstep--on' : ''}`}
              onMouseEnter={() => setActive(i)}
            >
              <span className="pstep__id">{s.id}</span>
              <div className="pstep__n">{s.n}</div>
              <p className="pstep__d">{s.d}</p>
            </div>
          ))}
        </div>
      </Fx>
    </Scene>
  )
}

/* ── Sahne 4: Açıklanabilir eşleştirme (interaktif) ── */
const NEEDS = [
  { k: 'otopark', label: 'Kapalı otopark', reason: 'Kapalı otopark' },
  { k: 'manzara', label: 'Deniz manzarası', reason: 'Boğaz manzarası' },
  { k: 'butce', label: 'Bütçe içinde', reason: 'bütçe uyumu' },
  { k: 'merkez', label: 'Merkeze yakın', reason: 'merkezi konum' },
]

function MatchScene() {
  const [picked, setPicked] = useState(() => new Set(['otopark', 'manzara']))

  const toggle = (k) => setPicked(prev => {
    const next = new Set(prev)
    next.has(k) ? next.delete(k) : next.add(k)
    return next
  })

  const score = Math.min(99, 72 + picked.size * 11)
  const reasons = NEEDS.filter(n => picked.has(n.k)).map(n => n.reason)
  const why = reasons.length
    ? `${reasons.join(', ')} kriterlerini güçlü biçimde karşılıyor. Gösterim önerilir.`
    : 'Kriter seçerek eşleşme gerekçesini kişiselleştirin.'

  const R = 52
  const CIRC = 2 * Math.PI * R

  return (
    <Scene>
      <Fx><Eye>Açıklanabilir eşleştirme</Eye></Fx>
      <Fx delay={60}>
        <H>Sadece skor değil,<br /><em>satış gerekçesi.</em></H>
      </Fx>
      <Fx delay={120}>
        <P>
          EstateMatch "%97 uyum" deyip bırakmaz. Danışmana müşteriye aktarabileceği net bir neden
          sunar. Aşağıdaki kriterleri değiştirerek örnek açıklamayı deneyin.
        </P>
      </Fx>

      <Fx delay={180}>
        <div className="pmatch">
          <div>
            <div className="pneeds">
              {NEEDS.map(n => (
                <button
                  key={n.k}
                  className={`pneed${picked.has(n.k) ? ' pneed--on' : ''}`}
                  onClick={() => toggle(n.k)}
                  aria-pressed={picked.has(n.k)}
                >
                  {n.label}
                </button>
              ))}
            </div>
            <p className="pprob__p" style={{ marginTop: '1.25rem' }}>
              Karar her zaman danışmanda. AI önerir, danışman düzenler ve onaylar.
            </p>
          </div>

          <div className="pscore">
            <div className="pscore__ring">
              <svg viewBox="0 0 120 120">
                <circle className="pscore__track" cx="60" cy="60" r={R} />
                <circle
                  className="pscore__arc"
                  cx="60" cy="60" r={R}
                  strokeDasharray={CIRC}
                  strokeDashoffset={CIRC * (1 - score / 100)}
                />
              </svg>
              <div className="pscore__num">%{score}</div>
            </div>
            <span className="pscore__lbl">AI değerlendirmesi</span>
            <p className="pscore__why">{why}</p>
          </div>
        </div>
      </Fx>
    </Scene>
  )
}

/* ── Sahne 5: AI asistan (animasyonlu sohbet) ── */
const CHATS = [
  {
    key: 'clients',
    q: "Lara'da 3+1 daire arayan müşterilerimiz kimler?",
    lead: '3 aktif müşteri bulundu.',
    a: 'İki müşteri için portföyünüzde %90 üzeri eşleşme var. En güçlü fırsat, bütçe ve lokasyon kriterlerini birlikte karşılıyor.',
  },
  {
    key: 'revenue',
    q: 'Bu ay ne kadar satış cirosu ve komisyon elde ettik?',
    lead: '₺6.2M gelir ve 38 kapanan anlaşma.',
    a: 'Dönüşüm oranı %14,2. En yüksek katkı, yer gösterimi sonrası 7 gün içinde takip edilen fırsatlardan geldi.',
  },
  {
    key: 'portfolio',
    q: 'Portföyümüzdeki en değerli 3 kiralık villa hangileri?',
    lead: '3 portföy sıralandı.',
    a: 'Konum, metrekare ve talep yoğunluğu birlikte değerlendirildi. En yüksek getirili seçenek Sarıyer bölgesinde.',
  },
]

function ChatScene() {
  const [idx, setIdx] = useState(0)
  const [typing, setTyping] = useState(false)
  const [showA, setShowA] = useState(true)

  const ask = useCallback((i) => {
    setIdx(i)
    setShowA(false)
    setTyping(true)
    const t = setTimeout(() => { setTyping(false); setShowA(true) }, 900)
    return () => clearTimeout(t)
  }, [])

  const c = CHATS[idx]

  return (
    <Scene>
      <Fx><Eye>Verinizle konuşan asistan</Eye></Fx>
      <Fx delay={60}>
        <H>Rapor aramayın. <em>Sorun.</em></H>
      </Fx>
      <Fx delay={120}>
        <P>
          EstateMatch AI Asistan, genel cevaplar veren bir sohbet kutusu değildir. Yalnızca
          yetkiniz olan güncel portföy, müşteri, randevu ve satış verilerini tarar; cevabı
          operasyonunuzdan üretir.
        </P>
      </Fx>

      <Fx delay={180}>
        <div className="pchat">
          <div className="pchat__head">
            <span className="pchat__dot" />
            <span className="pchat__name">EstateMatch AI Asistan</span>
            <span className="pchat__status">Veritabanınıza bağlı</span>
          </div>

          <div className="pchat__body">
            <div className="pbub pbub--a">
              Merhaba. Portföy, müşteri, eşleştirme ve satış performansınız hakkında bana sorabilirsiniz.
            </div>
            <div className="pbub pbub--q" key={`q-${idx}`}>{c.q}</div>
            {typing && (
              <div className="pchat__typing"><i /><i /><i /></div>
            )}
            {showA && (
              <div className="pbub pbub--a" key={`a-${idx}`}>
                <b>{c.lead}</b> {c.a}
              </div>
            )}
          </div>

          <div className="pchat__qs">
            {CHATS.map((x, i) => (
              <button
                key={x.key}
                className={`psug${i === idx ? ' pneed--on' : ''}`}
                onClick={() => ask(i)}
              >
                {x.q.length > 34 ? x.q.slice(0, 32) + '…' : x.q}
              </button>
            ))}
          </div>
        </div>
      </Fx>
    </Scene>
  )
}

/* ── Sahne 6: ROI hesaplayıcı (interaktif) ── */
const TRY = new Intl.NumberFormat('tr-TR')

function RoiScene() {
  const [consultants, setConsultants] = useState(10)
  const [leads, setLeads] = useState(30)
  const [minutes, setMinutes] = useState(120)
  const [hourly, setHourly] = useState(400)

  // Aylık kazanılan saat: eşleştirme başına kazanılan süre × talep × danışman
  const savedHours = Math.round((consultants * leads * minutes) / 60)
  const monthlyValue = savedHours * hourly
  const yearlyValue = monthlyValue * 12
  const workDays = Math.round(savedHours / 8)

  return (
    <Scene>
      <Fx><Eye>Kendi operasyonunuzla hesaplayın</Eye></Fx>
      <Fx delay={60}>
        <H>Kazandırdığı <em>zamanı görün.</em></H>
      </Fx>
      <Fx delay={120}>
        <P>
          Değerleri değiştirin; yalnızca portföy eşleştirme süresinden doğan aylık kazanımı
          anında hesaplayın.
        </P>
      </Fx>

      <Fx delay={180}>
        <div className="proi">
          <div className="proi__ctrls">
            <div className="proi__f">
              <label>Danışman sayısı <b>{consultants}</b></label>
              <input type="range" min="1" max="80" value={consultants}
                onChange={e => setConsultants(+e.target.value)} />
            </div>
            <div className="proi__f">
              <label>Danışman başına aylık talep <b>{leads}</b></label>
              <input type="range" min="5" max="150" value={leads}
                onChange={e => setLeads(+e.target.value)} />
            </div>
            <div className="proi__f">
              <label>Eşleştirme süresi <b>{minutes} dk</b></label>
              <input type="range" min="10" max="240" step="5" value={minutes}
                onChange={e => setMinutes(+e.target.value)} />
            </div>
            <div className="proi__f">
              <label>Danışmanın saatlik değeri <b>₺{TRY.format(hourly)}</b></label>
              <input type="range" min="100" max="2000" step="50" value={hourly}
                onChange={e => setHourly(+e.target.value)} />
            </div>
          </div>

          <div className="proi__out">
            <span className="proi__rl">Aylık tahmini zaman kazanımı</span>
            <div className="proi__big">{TRY.format(savedHours)} saat</div>
            <p className="proi__sub">≈ ₺{TRY.format(monthlyValue)} değerinde zaman</p>

            <div className="proi__div" />

            <div className="proi__row">
              <span className="proi__rl">Yıllık karşılığı</span>
              <span className="proi__rv">₺{TRY.format(yearlyValue)}</span>
            </div>
            <div className="proi__row">
              <span className="proi__rl">İş günü / ay</span>
              <span className="proi__rv">{TRY.format(workDays)} gün</span>
            </div>

            <p className="proi__note">
              Hesaplama yalnızca portföy arama süresini temel alır; takip, ilan üretimi,
              raporlama ve iletişim kazanımları dahil değildir.
            </p>
          </div>
        </div>
      </Fx>
    </Scene>
  )
}

/* ── Sahne 7: Mühendislik & güven ── */
const TRUST = [
  { id: '01', h: 'Önce gerçeklik', p: 'Şehir, mülk tipi ve kritik bütçe uyumsuzlukları daha AI devreye girmeden elenir.' },
  { id: '02', h: 'Sonra anlam', p: 'Notlar ile ilan açıklamaları kelime ve semantik yakınlık üzerinden birlikte değerlendirilir.' },
  { id: '03', h: 'Gizlilik varsayılan', p: "İsim, telefon ve e-posta gibi kişisel bilgiler AI'a gitmeden önce maskelenir." },
  { id: '04', h: 'Her firma kendi alanında', p: 'Acente verileri birbirinden izole edilir; roller ve yetkiler ayrı ayrı yönetilir.' },
]

const TRUST_TAGS = ['Hibrit eşleştirme', 'KVKK odaklı maskeleme', 'Çok kiracılı SaaS', 'Kontrollü AI maliyeti']

function TrustScene({ onDemo, onOpenPage, pageKey }) {
  return (
    <Scene>
      <Fx><Eye>Arkasındaki güven</Eye></Fx>
      <Fx delay={60}>
        <H>Akıllı hissettirir. <em>Kontrollü çalışır.</em></H>
      </Fx>
      <Fx delay={120}>
        <P>
          Teknik karmaşayı kullanıcıdan uzak tutar; hassas veriyi, yanlış eşleşmeleri ve maliyeti
          sistem içinde kontrol altında tutar.
        </P>
      </Fx>

      <Fx delay={180}>
        <div className="ptrust">
          {TRUST.map(t => (
            <div key={t.id} className="ptr">
              <span className="ptr__id">{t.id}</span>
              <h4 className="ptr__h">{t.h}</h4>
              <p className="ptr__p">{t.p}</p>
            </div>
          ))}
        </div>
      </Fx>

      <Fx delay={240}>
        <div className="ptags">
          {TRUST_TAGS.map(t => <span key={t} className="ptag">{t}</span>)}
        </div>
      </Fx>

      <Fx delay={300}>
        <div className="pcta-row">
          {onOpenPage && pageKey && (
            <button className="pbtn pbtn--solid" onClick={() => onOpenPage(pageKey)}>
              Detaylı incele <span>→</span>
            </button>
          )}
          <a className="pbtn pbtn--ghost" href="https://estate.sryverse.com" target="_blank" rel="noopener noreferrer">
            Platformu Aç <span>→</span>
          </a>
          <button className="pbtn pbtn--ghost" onClick={onDemo}>
            Demo Talep Et <span>→</span>
          </button>
        </div>
      </Fx>
    </Scene>
  )
}

/* ── Dışa açılan hikâye ── */
export default function EstateStory({ onDemo, onOpenPage, pageKey }) {
  return (
    <>
      <Scene>
        <Fx><Eye>EstateMatch AI · Real Estate Intelligence</Eye></Fx>
        <Fx delay={60}>
          <H>Portföylerinizi değil,<br /><em>fırsatlarınızı yönetin.</em></H>
        </Fx>
        <Fx delay={120}>
          <P>
            EstateMatch AI; müşteri talebini anlayan, en doğru portföyü saniyenin altında bulan ve
            danışmana nedenini açıklayan yeni nesil emlak operasyon platformudur.
          </P>
        </Fx>
        <Fx delay={180}>
          <Metrics items={[
            { v: '0.2 sn', l: 'ortalama eşleştirme' },
            { v: '%95+', l: 'zaman tasarrufu' },
            { v: '7/24', l: 'akıllı operasyon' },
          ]} />
        </Fx>
      </Scene>

      <ProblemScene />
      <ProductScene onOpenPage={onOpenPage} pageKey={pageKey} />
      <SearchScene />
      <FlowScene />
      <MatchScene />
      <ChatScene />
      <RoiScene />
      <TrustScene onDemo={onDemo} onOpenPage={onOpenPage} pageKey={pageKey} />
    </>
  )
}
