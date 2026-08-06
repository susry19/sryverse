import { useState, useEffect, useRef, useCallback } from 'react'
import { Scene, Eye, H, P, Fx, Metrics, CtaRow } from './parts.jsx'

/* ── Problem ── */
const PROBLEMS = [
  { h: 'Yüzlerce CV, sınırlı zaman', p: 'Her ilana gelen başvuru yığını, gerçek yeteneği görünmez kılar. Ön eleme haftalara yayılır.' },
  { h: 'Standart olmayan değerlendirme', p: 'Aynı aday farklı uzmanlarda farklı puan alır. Kararlar kişiye bağlı kalır.' },
  { h: 'Kaybolan aday havuzu', p: 'Bugün uygun olmayan aday, altı ay sonraki pozisyon için bir daha hiç aranmaz.' },
]

function ProblemScene() {
  return (
    <Scene>
      <Fx><Eye>Gerçek problem</Eye></Fx>
      <Fx delay={60}><H>Başvuru çok,<br /><em>görünen yetenek az.</em></H></Fx>
      <Fx delay={120}>
        <P>
          CV'ler klasörde, notlar e-postada, değerlendirme farklı kişilerin aklındaysa; işe alım
          hızlanmaz, sadece yorulur. SkillMatch tüm süreci tek ve ölçülebilir bir akışa bağlar.
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
            <span className="pvs__lbl">Manuel ön eleme</span>
            <div className="pvs__v">6–8</div>
            <span className="pvs__u">dakika / CV</span>
          </div>
          <div className="pvs__arrow">→</div>
          <div className="pvs__side pvs__side--good">
            <span className="pvs__lbl">SkillMatch AI</span>
            <div className="pvs__v">1.4</div>
            <span className="pvs__u">saniye / CV</span>
          </div>
        </div>
      </Fx>
    </Scene>
  )
}

/* ── CV ayrıştırma: aşamalı canlandırma ── */
const PARSE_STEPS = [
  { id: '01', n: 'Okuma', d: 'PDF, DOCX ve tarama belgeler metne dönüştürülür.' },
  { id: '02', n: 'Ayrıştırma', d: 'Deneyim, eğitim, yetkinlik ve dil alanları çıkarılır.' },
  { id: '03', n: 'Normalleştirme', d: 'Farklı yazımlar tek bir yetkinlik sözlüğüne bağlanır.' },
  { id: '04', n: 'Zenginleştirme', d: 'Kıdem, sektör ve rol bağlamı aday profiline eklenir.' },
  { id: '05', n: 'Skorlama', d: 'Pozisyon gereksinimiyle uyum puanı hesaplanır.' },
]

function ParseScene() {
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
    const t = setInterval(() => setActive(a => (a + 1) % PARSE_STEPS.length), 1900)
    return () => clearInterval(t)
  }, [on])

  return (
    <Scene>
      <Fx><Eye>CV'den yapılandırılmış veriye</Eye></Fx>
      <Fx delay={60}><H>Belgeyi okur,<br /><em>yetkinliği anlar.</em></H></Fx>
      <Fx delay={120}>
        <P>
          "React" ile "ReactJS", "takım yönetimi" ile "ekip liderliği" aynı yetkinliğe bağlanır.
          Sistem kelimeyi değil, yetkinliğin kendisini eşleştirir.
        </P>
      </Fx>

      <Fx delay={180}>
        <div className="pflow" ref={ref}>
          {PARSE_STEPS.map((s, i) => (
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

/* ── Aday eşleştirme (interaktif) ── */
const CANDIDATES = [
  {
    score: 94, meta: '6 yıl · İstanbul', name: 'Senior Frontend Developer',
    desc: 'React, TypeScript ve tasarım sistemi deneyimi. Ekip liderliği geçmişi mevcut.',
    hi: ['React', 'TypeScript', 'Ekip liderliği'],
    tags: 'react typescript frontend senior lider ekip javascript tasarım sistem istanbul',
  },
  {
    score: 88, meta: '4 yıl · Remote', name: 'Full-Stack Engineer',
    desc: 'Node.js ve React ile uçtan uca ürün geliştirme. Bulut altyapı tecrübesi.',
    hi: ['Node.js', 'Bulut altyapı'],
    tags: 'node react fullstack backend bulut cloud aws remote engineer javascript',
  },
  {
    score: 81, meta: '8 yıl · Ankara', name: 'Engineering Manager',
    desc: 'Çok ekipli teknoloji yönetimi, işe alım ve performans süreçleri deneyimi.',
    hi: ['ekipli teknoloji yönetimi', 'performans'],
    tags: 'yönetim manager lider ekip performans işe alım ankara mühendislik kıdemli',
  },
]

const ROLE_SUGGESTIONS = ['React + TypeScript', 'Bulut altyapı deneyimi', 'Ekip yönetimi']

function highlight(text, terms) {
  if (!terms.length) return text
  const re = new RegExp(`(${terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi')
  return text.split(re).map((part, i) =>
    terms.some(t => t.toLowerCase() === part.toLowerCase()) ? <mark key={i}>{part}</mark> : part
  )
}

function MatchScene() {
  const [query, setQuery] = useState('')
  const [visible, setVisible] = useState(() => CANDIDATES.map(() => true))
  const [note, setNote] = useState('3 aday yetkinlik, kıdem ve rol bağlamına göre sıralandı.')

  const run = useCallback((raw) => {
    const words = raw.toLocaleLowerCase('tr-TR').split(/[\s,+]+/).filter(w => w.length > 2)
    const next = CANDIDATES.map(c => words.length === 0 || words.some(w => c.tags.includes(w)))
    const count = next.filter(Boolean).length
    setVisible(next)
    setNote(count === 0
      ? 'Eşleşme bulunamadı — farklı bir yetkinlik deneyin.'
      : `${count} aday yetkinlik, kıdem ve rol bağlamına göre sıralandı.`)
  }, [])

  return (
    <Scene>
      <Fx><Eye>Pozisyon × aday eşleştirme</Eye></Fx>
      <Fx delay={60}><H>Doğru adayı,<br /><em>gerekçesiyle bulur.</em></H></Fx>
      <Fx delay={120}>
        <P>
          Pozisyon gereksinimini yazın; sistem aday havuzunu yetkinlik, kıdem ve rol bağlamı
          üzerinden tarar ve her eşleşmenin nedenini açıklar.
        </P>
      </Fx>

      <Fx delay={180}>
        <div className="psearch">
          <div className="psearch__bar">
            <input
              className="psearch__input"
              placeholder="Örn: React deneyimli senior geliştirici"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') run(query) }}
              aria-label="Aday araması"
            />
            <button className="psearch__btn" onClick={() => run(query)}>Aday Eşleştir</button>
          </div>

          <div className="psugs">
            {ROLE_SUGGESTIONS.map(s => (
              <button key={s} className="psug" onClick={() => { setQuery(s); run(s) }}>{s}</button>
            ))}
          </div>

          <div className="presults">
            {CANDIDATES.map((c, i) => (
              <div key={c.name} className={`pres${visible[i] ? '' : ' pres--hide'}`}>
                <div className="pres__score">%{c.score}</div>
                <div>
                  <span className="pres__meta">{c.meta}</span>
                  <div className="pres__name">{c.name}</div>
                  <p className="pres__desc">{highlight(c.desc, c.hi)}</p>
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

/* ── ROI ── */
const TRY = new Intl.NumberFormat('tr-TR')

function RoiScene() {
  const [roles, setRoles] = useState(8)
  const [cvs, setCvs] = useState(120)
  const [minutes, setMinutes] = useState(7)
  const [hourly, setHourly] = useState(450)

  const savedHours = Math.round((roles * cvs * minutes) / 60)
  const monthlyValue = savedHours * hourly
  const yearlyValue = monthlyValue * 12
  const workDays = Math.round(savedHours / 8)

  return (
    <Scene>
      <Fx><Eye>Kendi ekibinizle hesaplayın</Eye></Fx>
      <Fx delay={60}><H>Ön elemeden <em>kazandığınız zaman.</em></H></Fx>
      <Fx delay={120}>
        <P>
          Değerleri değiştirin; yalnızca CV ön eleme süresinden doğan aylık kazanımı anında görün.
        </P>
      </Fx>

      <Fx delay={180}>
        <div className="proi">
          <div className="proi__ctrls">
            <div className="proi__f">
              <label>Aylık açık pozisyon <b>{roles}</b></label>
              <input type="range" min="1" max="60" value={roles} onChange={e => setRoles(+e.target.value)} />
            </div>
            <div className="proi__f">
              <label>Pozisyon başına başvuru <b>{cvs}</b></label>
              <input type="range" min="10" max="600" step="10" value={cvs} onChange={e => setCvs(+e.target.value)} />
            </div>
            <div className="proi__f">
              <label>CV başına inceleme <b>{minutes} dk</b></label>
              <input type="range" min="1" max="30" value={minutes} onChange={e => setMinutes(+e.target.value)} />
            </div>
            <div className="proi__f">
              <label>Uzmanın saatlik değeri <b>₺{TRY.format(hourly)}</b></label>
              <input type="range" min="100" max="2000" step="50" value={hourly} onChange={e => setHourly(+e.target.value)} />
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
              Hesaplama yalnızca ön eleme süresini temel alır; mülakat planlama, geri bildirim ve
              raporlama kazanımları dahil değildir.
            </p>
          </div>
        </div>
      </Fx>
    </Scene>
  )
}

/* ── Güven ── */
const TRUST = [
  { id: '01', h: 'Önce nesnel kriter', p: 'Zorunlu şartlar ve kıdem uyumsuzlukları AI devreye girmeden önce değerlendirilir.' },
  { id: '02', h: 'Sonra yetkinlik anlamı', p: 'Farklı yazılmış aynı yetkinlikler ortak bir sözlükte buluşturulur.' },
  { id: '03', h: 'Önyargıya karşı tasarım', p: 'Ad, cinsiyet ve fotoğraf gibi alanlar skorlamada kullanılmaz.' },
  { id: '04', h: 'Karar insanda kalır', p: 'AI sıralar ve gerekçelendirir; nihai kararı işe alım ekibi verir.' },
]

const TRUST_TAGS = ['Açıklanabilir skorlama', 'KVKK odaklı maskeleme', 'Denetlenebilir karar kaydı', 'Rol bazlı erişim']

function TrustScene({ onDemo }) {
  return (
    <Scene>
      <Fx><Eye>Arkasındaki güven</Eye></Fx>
      <Fx delay={60}><H>Hızlı karar. <em>İzlenebilir gerekçe.</em></H></Fx>
      <Fx delay={120}>
        <P>
          Her sıralamanın arkasında kaydedilmiş bir gerekçe zinciri vardır; işe alım kararı
          savunulabilir ve tekrarlanabilir olur.
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
        <div className="ptags">{TRUST_TAGS.map(t => <span key={t} className="ptag">{t}</span>)}</div>
      </Fx>

      <Fx delay={300}>
        <CtaRow href="https://skillmatch.sryverse.com" label="Platformu Aç" onDemo={onDemo} />
      </Fx>
    </Scene>
  )
}

export default function SkillStory({ onDemo }) {
  return (
    <>
      <Scene>
        <Fx><Eye>SkillMatch AI · Recruitment Intelligence</Eye></Fx>
        <Fx delay={60}>
          <H>CV'leri değil,<br /><em>yetenek potansiyelini görün.</em></H>
        </Fx>
        <Fx delay={120}>
          <P>
            SkillMatch AI; başvuruları saniyeler içinde yapılandıran, pozisyonla uyumu
            gerekçesiyle açıklayan ve işe alım kararını ölçülebilir hâle getiren platformdur.
          </P>
        </Fx>
        <Fx delay={180}>
          <Metrics items={[
            { v: '1.4 sn', l: 'CV analiz süresi' },
            { v: '%90+', l: 'ön eleme tasarrufu' },
            { v: '4 rol', l: 'kontrollü erişim' },
          ]} />
        </Fx>
      </Scene>

      <ProblemScene />
      <ParseScene />
      <MatchScene />
      <RoiScene />
      <TrustScene onDemo={onDemo} />
    </>
  )
}
