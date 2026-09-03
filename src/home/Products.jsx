/* 03–06 — Ürünler. Kısa giriş, ardından eşit ağırlıkta iki ürün sahnesi
   ve sessiz bir "sıradaki" işareti.
   Her ürün sahnesi aynı iskeleti kullanır: sektör etiketi → ad → tek
   cümle → dört adımlı GERÇEK iş akışı → keşfet. Masaüstünde adım listesi
   kaydırmayla ilerler, ürün çerçevesi her an ekranda kalır; mobilde ve
   azaltılmış harekette adımlar çerçeveleriyle birlikte akışta sıralanır. */
import { useRef, useState } from 'react'
import { useTrack, useStack } from '../estate/scroll.js'
import { In, Mark, Crop, Frame } from './bits.jsx'

export function Intro() {
  return (
    <section id="urunler" className="hpi" aria-labelledby="hpi-h">
      <div className="h-wrap hpi__in">
        <div>
          <In><p className="h-kicker">SRYVERSE ürünleri</p></In>
          <In delay={60}><h2 id="hpi-h" className="h-h2">Farklı sektörler.<br /><em>Aynı yaklaşım.</em></h2></In>
        </div>
        <In as="ol" className="hpi__idx" delay={100} aria-label="Ürünler">
          <li><span>01</span><b>EstateMatch</b><small>Real Estate / PropTech · Canlı ürün</small></li>
          <li><span>02</span><b>SkillMatch</b><small>HR Tech / Recruitment · Canlı ürün</small></li>
        </In>
      </div>
    </section>)
}

/* ── ortak iş akışı sahnesi ── */
function WorkflowText({ sector, name, idea, sentence, cta, ext, openPage, children }) {
  return (
    <div className="pw__txt">
      <In><p className="h-kicker" lang="en">{sector}</p></In>
      <In delay={50}><Mark name={name} /></In>
      <In delay={100}><h3 className="pw__idea">{idea}</h3></In>
      <In delay={150}><p className="pw__p">{sentence}</p></In>
      {children}
      <In delay={220}>
        <div className="pw__act">
          <button type="button" className="h-cta h-cta--solid" onClick={() => openPage(cta.page)}>{cta.label}<span aria-hidden="true">→</span></button>
          <a href={ext} className="h-ext" target="_blank" rel="noopener noreferrer">{ext.replace('https://', '')}</a>
        </div>
      </In>
    </div>)
}

function Workflow({ id, cls, sector, name, idea, sentence, steps, frames, caps, cta, ext, openPage, rev }) {
  const stack = useStack()
  const ref = useRef(null)
  const [p, setP] = useState(0)
  useTrack(ref, v => { const q = Math.round(v * 200) / 200; setP(x => x === q ? x : q) })
  const active = p < .25 ? 0 : p < .5 ? 1 : p < .75 ? 2 : 3

  if (stack) return (
    <section id={id} className={`pw pw--stack ${cls}`} aria-labelledby={`${id}-h`}>
      <div className="h-wrap">
        <WorkflowText sector={sector} name={name} idea={idea} sentence={sentence} cta={cta} ext={ext} openPage={openPage} />
        <ol className="pw__stack" aria-label="İş akışı">
          {steps.map((s, i) => (
            <In as="li" key={s.t} delay={60}>
              <div className="pw__step is-on"><span className="pw__n">0{i + 1}</span><b>{s.t}</b><small>{s.d}</small></div>
              <div className="pw__frame">{frames[i]}</div>
              <p className="pw__cap">{caps[i]}</p>
            </In>))}
        </ol>
      </div>
    </section>)

  return (
    <section id={id} className={`pw ${cls}${rev ? ' pw--rev' : ''}`} aria-labelledby={`${id}-h`}>
      <div className="hs-track" ref={ref} style={{ height: '230svh' }}>
        <div className="hs-stage">
          <div className="h-wrap pw__in">
            <WorkflowText sector={sector} name={name} idea={idea} sentence={sentence} cta={cta} ext={ext} openPage={openPage}>
              <In as="ol" className="pw__steps" delay={200} aria-label="İş akışı">
                {steps.map((s, i) => (
                  <li key={s.t} className={`pw__step${i === active ? ' is-on' : i < active ? ' is-past' : ''}`}>
                    <span className="pw__n">0{i + 1}</span><b>{s.t}</b><small>{s.d}</small>
                  </li>))}
              </In>
            </WorkflowText>
            <In className="pw__vis" delay={120}>
              <div className="pw__frames">
                {frames.map((f, i) => <div key={i} className={`pw__frame${i === active ? ' is-on' : ''}`} aria-hidden={i !== active}>{f}</div>)}
              </div>
              <p className="pw__cap" aria-live="polite">{caps[active]}</p>
            </In>
          </div>
        </div>
      </div>
    </section>)
}

/* ── EstateMatch: gerçek ekranlar ── */
const EM_STEPS = [
  { t: 'Müşteri', d: 'Talep, bütçe ve öncelikler kaydedilir.' },
  { t: 'AI yorumu', d: 'Kriterler portföy ve bağlamla birlikte okunur.' },
  { t: 'Eşleşen portföy', d: 'En uygun seçenekler skoruyla sıralanır.' },
  { t: 'Gerekçe ve süreç', d: 'Neden bu portföy? Sonra randevu, teklif, kapanış.' },
]
const EM_CAPS = [
  'Müşteri kaydı, aktif ihtiyaç ve dönüşüm olasılığı tek görünümde.',
  'Kriterlere en uygun portföyler AI skoruyla sıralanır.',
  'Her öneri gerekçesiyle gelir: konum, oda sayısı, bütçe dengesi.',
  'Eşleşme; yer gösterimi, teklif ve kapanışa kadar aynı süreçte izlenir.',
]
const CL = { src: '/screens/clients-list.webp', w: 1600, h: 1000 }
const AM = { src: '/screens/ai-matches.webp', w: 1600, h: 1000 }
const PB = { src: '/screens/pipeline-board.webp', w: 1600, h: 1000 }
const EM_FRAMES = [
  <Frame key="1" title="EstateMatch AI · Müşteriler"><Crop {...CL} x={596} y={46} cw={720} ch={450} alt="EstateMatch müşteri ekranı: dönüşüm olasılığı, risk skoru ve aktif ihtiyaç" /></Frame>,
  <Frame key="2" title="EstateMatch AI · AI Mülk Eşleştirme"><Crop {...AM} x={596} y={290} cw={720} ch={450} alt="EstateMatch yapay zekâ eşleştirme ekranı: kriterlere en uygun portföyler ve AI skorları" /></Frame>,
  <Frame key="3" title="EstateMatch AI · Eşleşme gerekçesi"><div className="pf__hlwrap"><Crop {...AM} x={596} y={290} cw={720} ch={450} alt="EstateMatch eşleşme gerekçesi: konum, oda sayısı ve bütçe aralığı uyumu" /><i className="pf__hl" style={{ left: '17.5%', top: '33%', width: '77%', height: '11%' }} aria-hidden="true" /></div></Frame>,
  <Frame key="4" title="EstateMatch AI · İş Süreçleri"><Crop {...PB} x={300} y={120} cw={720} ch={450} alt="EstateMatch satış süreci panosu: yeni başvuru, iletişim kuruldu, yer gösterimi, teklif" /></Frame>,
]
export function EstateScene({ openPage }) {
  return (
    <Workflow id="estatematch" cls="pw--em" sector="Real Estate / PropTech" name="EstateMatch"
      idea={<>Doğru mülk bir arama değil, <em>bir eşleştirme sorusudur.</em></>}
      sentence="Gayrimenkul profesyonelleri için müşteri niyetini, portföyü ve fırsatları aynı karar sisteminde buluşturur."
      steps={EM_STEPS} frames={EM_FRAMES} caps={EM_CAPS}
      cta={{ label: 'EstateMatch’i keşfet', page: 'estatematch' }} ext="https://estate.sryverse.com" openPage={openPage} />)
}

/* ── SkillMatch: ürün modüllerinden uyarlanmış arayüz kesitleri ── */
const SM_STEPS = [
  { t: 'Pozisyon', d: 'İhtiyaç, kapsam ve yetkinlikler tanımlanır.' },
  { t: 'Adaylar', d: 'CV’ler yapılandırılır, havuz uyum oranıyla listelenir.' },
  { t: 'AI gerekçesi', d: 'Her sıralama nedenleriyle açıklanır.' },
  { t: 'Kısa liste', d: 'Mülakat, teklif ve işe giriş tek akışta ilerler.' },
]
const SM_CAPS = [
  'Kapsam, ücret bandı ve yetkinlikler tek akışta; eksik onayla ilan yayına çıkmaz.',
  'Yüklenen CV saniyeler içinde profile dönüşür; havuz uyum oranıyla sıralanır.',
  'Sıralama sistemde, karar İK ekibinde: her uyum oranının gerekçesi görünür.',
  'Kısa listeden işe girişe kadar her aday aynı pano üzerinde ilerler.',
]
const ADAY = [
  ['DA', 'Deniz Aksoy', '5 yıl · Antalya', ['Opera PMS', 'İngilizce · ileri', 'Vardiya liderliği'], 92],
  ['MK', 'Mert Kaya', '3 yıl · İstanbul', ['Opera PMS', 'İngilizce · orta'], 84],
  ['EŞ', 'Elif Şahin', '7 yıl · İzmir', ['Fidelio', 'Almanca', 'Misafir ilişkileri'], 79],
]
const SM_FRAMES = [
  <Frame key="1" title="SkillMatch · Pozisyon açma">
    <div className="ui-pos">
      <div className="ui-pos__head"><b>Resepsiyon Sorumlusu</b><span className="ui-tag ui-tag--on">Onaylı · Yayında</span></div>
      <dl className="ui-kv">
        <div><dt>Lokasyon</dt><dd>İstanbul · Merkez otel</dd></div>
        <div><dt>Hedef tarih</dt><dd>30 Eylül</dd></div>
        <div><dt>Açık kadro</dt><dd>2 pozisyon</dd></div>
        <div><dt>Ücret bandı</dt><dd>Kadro politikasına uygun</dd></div>
      </dl>
      <p className="ui-lbl">Aranan yetkinlikler</p>
      <ul className="ui-chips"><li>Opera PMS</li><li>İngilizce · ileri</li><li>Misafir ilişkileri</li><li>Vardiya yönetimi</li></ul>
      <ol className="ui-wiz"><li className="d">Kapsam</li><li className="d">Bütçe</li><li className="d">Süreç</li><li className="d">İlan</li><li className="d">Onay</li><li className="n">Yayın</li></ol>
    </div>
  </Frame>,
  <Frame key="2" title="SkillMatch · Aday havuzu">
    <ul className="ui-cands">
      {ADAY.map(([i, n, m, tags, s]) => (
        <li key={n}><span className="ui-av">{i}</span><span className="ui-cands__t"><b>{n}</b><small>{m}</small><span className="ui-chips ui-chips--s">{tags.map(t => <i key={t}>{t}</i>)}</span></span><span className="ui-score"><b>%{s}</b><small>uyum</small><i style={{ '--w': s / 100 }} /></span></li>))}
    </ul>
  </Frame>,
  <Frame key="3" title="SkillMatch · Aday profili · Uyum gerekçesi">
    <div className="ui-why">
      <div className="ui-why__head"><span className="ui-av ui-av--l">DA</span><span><b>Deniz Aksoy</b><small>Resepsiyon Sorumlusu için en uygun aday</small></span><span className="ui-score ui-score--l"><b>%92</b><small>uyum</small></span></div>
      <p className="ui-lbl">Neden %92?</p>
      <ul className="ui-reasons">
        <li className="ok">Opera PMS · 5 yıl aktif kullanım</li>
        <li className="ok">İngilizce ileri seviye · misafir iletişimi</li>
        <li className="ok">Vardiya liderliği deneyimi</li>
        <li className="warn">Almanca (tercih) profilde yok</li>
      </ul>
      <p className="ui-note">Sıralama sistemde, karar İK ekibinde.</p>
    </div>
  </Frame>,
  <Frame key="4" title="SkillMatch · Aday pipeline">
    <div className="ui-kanban">
      <div className="ui-col"><span className="ui-col__h">Kısa liste <b>3</b></span><i>D. Aksoy · %92</i><i>M. Kaya · %84</i><i>E. Şahin · %79</i></div>
      <div className="ui-col"><span className="ui-col__h">Mülakat <b>1</b></span><i>D. Aksoy · Çar 14:00</i></div>
      <div className="ui-col"><span className="ui-col__h">Teklif <b>0</b></span><em>Bekliyor</em></div>
      <div className="ui-col"><span className="ui-col__h">İşe giriş <b>0</b></span><em>—</em></div>
    </div>
  </Frame>,
]
export function SkillScene({ openPage }) {
  return (
    <Workflow id="skillmatch" cls="pw--sm" rev sector="HR Tech / Recruitment" name="SkillMatch"
      idea={<>Bazen insan fırsatı bulur. <em>Bazen fırsatın insanı bulması gerekir.</em></>}
      sentence="İşe alım ekipleri için aday, pozisyon, bağlam ve potansiyeli birlikte değerlendiren karar destek sistemi."
      steps={SM_STEPS} frames={SM_FRAMES} caps={SM_CAPS}
      cta={{ label: 'SkillMatch’i keşfet', page: 'skillmatch' }} ext="https://skillmatch.sryverse.com" openPage={openPage} />)
}

/* ── Sıradaki: adı olmayan, maskelenmiş bir sistem ── */
export function Next() {
  return (
    <section id="next" className="hx" aria-labelledby="hx-h">
      <div className="h-wrap hx__in">
        <div>
          <In><p className="h-kicker" lang="en">SRYVERSE / Next</p></In>
          <In delay={60}><h2 id="hx-h" className="hx__t">Yeni problem alanları üzerinde çalışıyoruz.</h2></In>
        </div>
        <In className="hx__obj" delay={120}>
          <div className="hx__frame" aria-hidden="true">
            <div className="hx__bar" />
            <div className="hx__grid"><i /><i /><i /><i /><i /><i /></div>
          </div>
          <span className="hx__lbl" lang="en"><i aria-hidden="true" />Next system loading</span>
        </In>
      </div>
    </section>)
}
