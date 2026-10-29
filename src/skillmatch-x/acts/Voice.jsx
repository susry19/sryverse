import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createEngine } from '../voice/engineHost.js'
import { Mic, listenTurn, watchBargeIn, speak, turkishVoice, canListen, canRecognize } from '../voice/audio.js'
import SOURCE from '../voice/engine/SOURCE.json'
import { useJourney } from '../lib/journey.js'
import { DATA, position as posOf, hotel as hotelOf, candidate as candOf } from '../lib/match.js'
import { useReducedMotion } from '../lib/scroll.js'

/* AI Ön Görüşme — canlı demo.
   Soru akışı SkillMatch'in kendi motoru (Pyodide'de, birebir kaynak).
   Ziyaretçi adaydır; konuşur ya da yazar. Hiçbir şey kaydedilmez. */

const LIMIT = { perDay: 5, minutes: 8 }
const STATE_LABEL = { speaking: 'Konuşuyor', listening: 'Dinliyorum', thinking: 'Düşünüyor', idle: 'Hazır', muted: 'Mikrofon kapalı', ended: 'Görüşme bitti' }

// simulate.py kişiliklerinden alınmış örnek cevaplar (ürünün test cümleleri)
const SAMPLES = {
  employment_status: ['Hayır, geçen ay ayrıldım. Hemen başlayabilirim ama gece vardiyası istemiyorum.', 'Evet çalışıyorum, iki hafta ihbar sürem var.', 'Öğrenciyim, yazın çalışabilirim.'],
  notice_period: ['İki hafta.', 'İhbar sürem yok.'],
  earliest_start_date: ['15 Kasım\'da başlayabilirim.', 'Kasım gibi.', 'Hemen başlayabilirim ama mevcut işimden ay sonunda ayrılacağım.'],
  shift_availability: ['Gece olmaz, diğerleri olur.', 'Sabah ve akşam olur.', 'Her vardiya olur, hafta sonu da çalışabilirim.'],
  weekend_availability: ['Evet evet olur tabi.', 'Belki, duruma göre.'],
  location_availability: ['Evet, uygun.', 'Neresi tam olarak?'],
  accommodation_needed: ['Lojman lazım değil ama servis lazım.', 'Evet, hâlâ lazım.', 'Var ama lojmanınız ücretsiz mi?'],
  transportation_needed: ['Evet, servis lazım.', 'Şey, yani, servis olmazsa gelemem.'],
  experience_duration: ['İki buçuk yıl kadar.', 'Üç yıl, bir otelde ön büroda çalıştım.', 'Bu soruya cevap vermek istemiyorum.'],
  languages: ['İngilizce iyi, Almanca orta.', 'Yok.'],
  certificates: ['Evet, hijyen belgem var.', 'Yok.'],
  interview_preference: ['Hafta içi öğleden sonra.', 'Fark etmez.'],
}
const ALWAYS = ['Maaş ne kadar?', 'Gerçek bir insan mısınız?', 'Kaç soru kaldı?', 'Tekrar eder misiniz?', 'Bir insanla görüşmek istiyorum.']

function quotaUsed() {
  try { const q = JSON.parse(localStorage.getItem('sx-vs') || '{}'); return q.d === new Date().toDateString() ? q.n || 0 : 0 } catch { return 0 }
}
function quotaTake() {
  try { localStorage.setItem('sx-vs', JSON.stringify({ d: new Date().toDateString(), n: quotaUsed() + 1 })) } catch { /* özel sekme */ }
}

/* Küre: gerçek ses seviyesi (dinlerken mikrofon, konuşurken söz sınırları) +
   dairesel dalga formu + VAD eşiği halkası. */
function Orb({ talk, levelRef, micRef, vadRef, reduced }) {
  const cv = useRef(null)
  useEffect(() => {
    const c = cv.current; if (!c) return
    const ctx = c.getContext('2d')
    let raf = 0, sm = 0, t = 0
    const draw = () => {
      raf = requestAnimationFrame(draw)
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const W = c.clientWidth, H = c.clientHeight
      if (c.width !== Math.round(W * dpr)) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr) }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      const L = levelRef.current || 0
      sm += (L - sm) * 0.25
      t += reduced ? 0 : 0.016
      const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.27
      const tone = talk === 'speaking' ? [236, 241, 230] : talk === 'listening' ? [171, 191, 172] : talk === 'thinking' ? [201, 160, 160] : [120, 140, 125]
      // dış hale
      const g = ctx.createRadialGradient(cx, cy, R * 0.4, cx, cy, R * 2.1)
      g.addColorStop(0, `rgba(${tone},${0.18 + sm * 0.25})`); g.addColorStop(1, 'rgba(8,21,15,0)')
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 2.1, 0, Math.PI * 2); ctx.fill()
      // VAD eşiği halkası (dinlerken)
      const v = vadRef.current
      if (talk === 'listening' && v) {
        const k = (x) => R * (1.05 + Math.min(1, x / 0.12) * 0.9)
        ctx.strokeStyle = 'rgba(243,245,241,.18)'; ctx.setLineDash([2, 5]); ctx.lineWidth = 1
        ctx.beginPath(); ctx.arc(cx, cy, k(v.threshold), 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([])
      }
      // dairesel dalga formu
      const wave = talk === 'listening' ? micRef.current?.waveform() : null
      ctx.lineWidth = 1.4
      for (let ring = 0; ring < 3; ring++) {
        ctx.strokeStyle = `rgba(${tone},${0.75 - ring * 0.22})`
        ctx.beginPath()
        const N = 160
        for (let i = 0; i <= N; i++) {
          const a = (i / N) * Math.PI * 2
          let d
          if (wave) d = wave[Math.floor((i / N) * (wave.length - 1))] * R * 1.6
          else d = Math.sin(a * (3 + ring) + t * (1.2 + ring * 0.4)) * R * (0.03 + sm * 0.16) + Math.sin(a * 7 - t * 2) * R * sm * 0.05
          const r = R * (1 + ring * 0.06) + d * (1 - ring * 0.25)
          const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)
        }
        ctx.closePath(); ctx.stroke()
      }
      // çekirdek
      const core = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.1, cx, cy, R * 0.95)
      core.addColorStop(0, `rgba(${tone},${0.55 + sm * 0.4})`); core.addColorStop(1, 'rgba(16,38,27,.9)')
      ctx.fillStyle = core
      ctx.beginPath(); ctx.arc(cx, cy, R * (0.9 + sm * 0.08), 0, Math.PI * 2); ctx.fill()
      if (talk === 'thinking') {
        ctx.strokeStyle = `rgba(${tone},.9)`; ctx.lineWidth = 2
        ctx.beginPath(); ctx.arc(cx, cy, R * 1.22, t * 3, t * 3 + 1.2); ctx.stroke()
      }
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [talk, reduced])
  return <canvas ref={cv} className="vs-orb" aria-hidden="true" />
}

function VadMeter({ vadRef, on }) {
  const [, f] = useState(0)
  useEffect(() => { if (!on) return; const t = setInterval(() => f((x) => x + 1), 80); return () => clearInterval(t) }, [on])
  const v = vadRef.current
  if (!on || !v) return null
  const pct = (x) => `${Math.min(100, (x / 0.12) * 100)}%`
  return (
    <div className="vs-vad" aria-hidden="true">
      <div className="vs-vad__bar"><i style={{ width: pct(v.rms) }} className={v.voiced ? 'on' : ''} /><b style={{ left: pct(v.threshold) }} /><em style={{ left: pct(v.floor) }} /></div>
      <div className="vs-vad__l"><span>Gürültü tabanı</span><span>Eşik</span><span>{v.voiced ? 'Konuşma algılandı' : v.started ? `Sessizlik ${Math.round(v.silenceMs)} ms` : 'Bekleniyor'}</span></div>
    </div>
  )
}

const ROW_LABEL = { answered: 'Cevaplandı', volunteered: 'Kendiliğinden söylendi · sorulmadı', prefilled: 'Başvurudan · sorulmadı', current: 'Şimdi soruluyor', skipped: 'Koşul sağlanmadı · sorulmayacak', waiting: 'Koşula bağlı', pending: 'Sırada' }
const STATUS_LABEL = { confirmed: 'kesin', approximate: 'yaklaşık', unconfirmed: 'teyit gerekli', unknown: 'net değil', declined: 'cevaplamak istemedi', prefilled: 'başvurudan', invalid: 'geçersiz' }

function Plan({ rows }) {
  if (!rows?.length) return null
  return (
    <ol className="vs-plan" aria-label="Soru akışı">
      {rows.map((r) => (
        <li key={r.key} className={`vs-plan__r s-${r.state}`}>
          <i aria-hidden="true" />
          <div>
            <b>{r.label}{!r.required && <small> · isteğe bağlı</small>}</b>
            <span>{ROW_LABEL[r.state]}{r.value ? <> · <em>{r.value}</em>{r.status && r.status !== 'confirmed' ? ` (${STATUS_LABEL[r.status] || r.status})` : ''}</> : null}</span>
            {r.condition && (r.state === 'skipped' || r.state === 'waiting') && (
              <small className="vs-plan__c">Koşul: {r.condition.label} = {r.condition.value === 'employed' ? 'Çalışıyor' : String(r.condition.value)}</small>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}

export default function Voice() {
  const journey = useJourney()
  const reduced = useReducedMotion()
  const [posId, setPosId] = useState(journey?.positionId || 101)
  useEffect(() => { if (journey?.positionId) setPosId(journey.positionId) }, [journey?.positionId])
  const cand = candOf(journey?.candidateId || 1)
  const pos = posOf(posId), hotel = hotelOf(pos.hotel_id)
  const [prefill, setPrefill] = useState(true)
  const [consent, setConsent] = useState(false)
  const [phase, setPhase] = useState('intro')   // intro | loading | live | done | error
  const [talk, setTalk] = useState('idle')
  const [mode, setMode] = useState('voice')
  const [log, setLog] = useState([])
  const [partial, setPartial] = useState('')
  const [view, setView] = useState(null)
  const [summary, setSummary] = useState(null)
  const [records, setRecords] = useState([])
  const [err, setErr] = useState(null)
  const [captions, setCaptions] = useState(true)
  const [typed, setTyped] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const [voiceInfo, setVoiceInfo] = useState(null)
  const eng = useRef(null), mic = useRef(null), level = useRef(0), vad = useRef(null)
  const listenAbort = useRef(null), speakAbort = useRef(null), typedResolve = useRef(null)
  const run = useRef(0), modeRef = useRef('voice'), lastAi = useRef(null), interrupted = useRef(false), sttOk = useRef(canRecognize())
  const logEnd = useRef(null)
  modeRef.current = mode

  const ctx = useMemo(() => ({
    first_name: cand.name.split(' ')[0],
    hotel: { id: hotel.id, name: hotel.name, city: hotel.city, district: hotel.district, offers_accommodation: hotel.offers_accommodation, season_start: hotel.season_start, season_end: hotel.season_end },
    position: { title: pos.title, department: pos.department, employment_type: pos.employment_type, description: pos.description },
    cfg: { qa_enabled: true, qa_share_salary: false, qa_max_questions: 10, max_silence_reprompts: 2, qa_faq: [] },
    prefill: prefill ? { accommodation_needed: { value: true, source_label: 'Başvuru formunuzda' } } : {},
  }), [cand, hotel, pos, prefill])

  useEffect(() => { logEnd.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }) }, [log, partial])
  useEffect(() => () => { run.current++; eng.current?.dispose(); mic.current?.close(); window.speechSynthesis?.cancel() }, [])
  useEffect(() => {
    if (phase !== 'live') return
    const t0 = Date.now()
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - t0) / 1000)), 1000)
    return () => clearInterval(t)
  }, [phase])

  const push = (who, text, meta) => setLog((l) => [...l, { who, text, meta, id: l.length + 1 }])

  const say = async (r, token) => {
    setTalk('speaking'); lastAi.current = r
    push('ai', r.text, { action: r.action, qa: r.qa })
    const voice = modeRef.current === 'voice' ? turkishVoice() : null
    const ac = new AbortController(); speakAbort.current = ac
    let stopBarge = () => {}
    if (modeRef.current === 'voice' && mic.current?.band && voice) {
      stopBarge = watchBargeIn(mic.current, () => { interrupted.current = true; ac.abort() }, () => level.current)
    }
    const why = await speak(r.segments, { voice, signal: ac.signal, onLevel: (x) => { level.current = x } })
    stopBarge()
    if (token !== run.current) return 'stale'
    if (why === 'interrupted' && interrupted.current) push('sys', 'Söze girdiniz; asistan sustu ve sizi dinliyor.')
    return why
  }

  // Bekleyen aday turu: ses, yazı ya da örnek cevap aynı çözücüye düşer.
  const startListening = () => {
    if (!typedResolve.current || !mic.current) return
    setTalk('listening')
    listenAbort.current?.abort()
    const ac = new AbortController(); listenAbort.current = ac
    listenTurn(mic.current, {
      complete: (t) => eng.current.complete(t),
      onPartial: (t) => setPartial(t),
      onLevel: (x) => { level.current = x },
      onVad: (v) => { vad.current = v },
      signal: ac.signal,
    }).then((r) => {
      if (r.reason === 'abort') return
      if (r.reason === 'stt_error') {
        sttOk.current = false
        push('sys', `Tarayıcınızın konuşma tanıma servisine ulaşılamadı (${r.sttError}). Asistan konuşmaya devam eder; cevabınızı yazarak verebilirsiniz.`)
        setTalk('muted'); return
      }
      typedResolve.current?.({ text: r.text, reason: r.reason })
    })
  }

  const nextAnswer = () => new Promise((resolve) => {
    typedResolve.current = (v) => { typedResolve.current = null; listenAbort.current?.abort(); resolve(v) }
    if (modeRef.current === 'voice' && mic.current && sttOk.current) startListening()
    else setTalk('muted')
  })

  const loop = async (first, token) => {
    let r = first
    while (token === run.current && !r.ended) {
      setView(r)
      if (r.records?.length) setRecords((x) => [...r.records.map((y) => ({ ...y, t: Date.now() })), ...x].slice(0, 8))
      await say(r, token)
      if (token !== run.current) return
      const ans = await nextAnswer()
      if (token !== run.current) return
      setPartial('')
      if (ans.text) push('me', ans.text, { typed: !!ans.typed, interrupted: interrupted.current })
      else push('sys', 'Konuşma algılanmadı (12 sn). Motor bunu sessizlik turu olarak işler.')
      interrupted.current = false
      setTalk('thinking')
      r = await eng.current.turn(ans.text || '')
    }
    if (token !== run.current) return
    setView(r)
    if (r.records?.length) setRecords((x) => [...r.records.map((y) => ({ ...y, t: Date.now() })), ...x].slice(0, 8))
    await say(r, token)
    setTalk('ended')
    setSummary(await eng.current.summary())
    setPhase('done')
    mic.current?.close(); mic.current = null
  }

  const begin = async (withVoice) => {
    if (quotaUsed() >= LIMIT.perDay) { setErr(`Bu tarayıcıda bugünkü demo hakkı doldu (günde ${LIMIT.perDay} görüşme).`); return }
    setErr(null); setLog([]); setRecords([]); setSummary(null); setView(null); setPartial('')
    const token = ++run.current
    setMode(withVoice ? 'voice' : 'text'); modeRef.current = withVoice ? 'voice' : 'text'
    setPhase('loading')
    try {
      if (withVoice) {
        mic.current = new Mic()
        await mic.current.open(); await mic.current.resume()
        window.speechSynthesis?.getVoices()
        await new Promise((r) => setTimeout(r, 150))
        setVoiceInfo({ tts: turkishVoice()?.name || null, stt: canRecognize() })
      }
      eng.current = eng.current || createEngine()
      await eng.current.boot()
      if (token !== run.current) return
      quotaTake()
      const first = await eng.current.start(ctx)
      setPhase('live'); setElapsed(0)
      loop(first, token)
    } catch (e) {
      mic.current?.close(); mic.current = null
      setPhase('intro')
      setErr(e?.name === 'NotAllowedError' ? 'Mikrofon izni verilmedi. Yazarak da deneyebilirsiniz.' : `Başlatılamadı: ${e?.message || e}`)
    }
  }

  // süre sınırı: görüşme ertelenir (ürünün ara verme metniyle)
  useEffect(() => {
    if (phase === 'live' && elapsed >= LIMIT.minutes * 60) control('pause')
  }, [elapsed, phase])

  const control = async (what) => {
    const token = ++run.current
    listenAbort.current?.abort(); speakAbort.current?.abort(); typedResolve.current = null
    window.speechSynthesis?.cancel()
    setTalk('thinking')
    const r = what === 'pause' ? await eng.current.pause() : await eng.current.human()
    push('me', what === 'pause' ? '(Ara ver düğmesi)' : '(Bir insanla görüşmek istiyorum düğmesi)', { typed: true })
    setView(r)
    await say(r, token)
    setTalk('ended'); setSummary(await eng.current.summary()); setPhase('done')
    mic.current?.close(); mic.current = null
  }

  const submitTyped = (text) => {
    const t = (text ?? typed).trim(); if (!t) return
    setTyped('')
    if (talk === 'speaking') speakAbort.current?.abort()
    // konuşma bitip dinlemeye geçince gönderilsin
    const tryIt = (n = 0) => { if (typedResolve.current) typedResolve.current({ text: t, typed: true }); else if (n < 200) setTimeout(() => tryIt(n + 1), 60) }
    tryIt()
  }

  const toggleMic = async () => {
    if (mode === 'voice') {
      setMode('text'); modeRef.current = 'text'; listenAbort.current?.abort()
      if (typedResolve.current) setTalk('muted')
    } else {
      try {
        if (!mic.current) { mic.current = new Mic(); await mic.current.open(); await mic.current.resume() }
        setMode('voice'); modeRef.current = 'voice'
        if (sttOk.current) startListening()
      } catch { setErr('Mikrofon açılamadı.') }
    }
  }

  // Son soruyu yeniden seslendir, sonra yine dinle (cevap beklemesi sürer)
  const repeat = async () => {
    if (!lastAi.current || !typedResolve.current) return
    listenAbort.current?.abort()
    const token = run.current
    setTalk('speaking')
    const voice = modeRef.current === 'voice' ? turkishVoice() : null
    const ac = new AbortController(); speakAbort.current = ac
    await speak(lastAi.current.segments, { voice, signal: ac.signal, onLevel: (x) => { level.current = x } })
    if (token !== run.current || !typedResolve.current) return
    if (modeRef.current === 'voice' && sttOk.current) startListening(); else setTalk('muted')
  }

  const fk = view?.question?.field_key
  const samples = [...(SAMPLES[fk] || []), ...ALWAYS]
  const live = phase === 'live'
  const stt = canRecognize(), micOk = canListen()

  return (
    <section className="sx-act sx-deep vs" id="on-gorusme" data-act="on-gorusme" aria-labelledby="vs-title">
      <div className="sx-wrap vs__head">
        <span className="sx-eyebrow sx-eyebrow--on">AI Ön Görüşme · canlı demo</span>
        <h2 id="vs-title" className="sx-h2">Ön görüşmeyi siz yapın. <em>Aday sizsiniz.</em></h2>
        <p className="sx-lead vs__lead">Asistan soruları sesli sorar, susunca dinler, cevabınızı yapılandırır. Cevabınıza göre sonraki soruyu seçer: çalışmadığınızı söylerseniz ihbar süresini sormaz, başlangıç tarihini zaten söylediyseniz tekrar sormaz. Akışı, SkillMatch'in ön görüşme motoru tarayıcınızda yürütür.</p>
      </div>

      <div className="sx-wrap vs__grid">
        <div className="vs-stage">
          <div className="vs-stage__top">
            <span className={`vs-state vs-state--${talk}`} aria-live="polite"><i />{phase === 'loading' ? 'Motor yükleniyor…' : STATE_LABEL[talk]}</span>
            {live && <span className="vs-timer">{String(Math.floor(elapsed / 60)).padStart(2, '0')}:{String(elapsed % 60).padStart(2, '0')} / {LIMIT.minutes}:00</span>}
            <span className="sx-badge sx-badge--demo">Demo · kayıt yok</span>
          </div>
          <Orb talk={phase === 'loading' ? 'thinking' : talk} levelRef={level} micRef={mic} vadRef={vad} reduced={reduced} />
          {live && mode === 'voice' && <VadMeter vadRef={vad} on={talk === 'listening'} />}

          {phase === 'intro' || phase === 'loading' ? (
            <div className="vs-consent">
              <div className="vs-ctx">
                <label>Pozisyon
                  <select value={posId} onChange={(e) => { setPosId(+e.target.value); journey?.setPositionId(+e.target.value) }} disabled={phase === 'loading'}>
                    {DATA.positions.map((p) => <option key={p.id} value={p.id}>{p.title} · {hotelOf(p.hotel_id).name}</option>)}
                  </select>
                </label>
                <label className="vs-check"><input type="checkbox" checked={prefill} onChange={(e) => setPrefill(e.target.checked)} disabled={phase === 'loading'} /> Başvuru formunda lojman ihtiyacı “Evet” işaretli (asistan teyit eder, yeniden sormaz)</label>
              </div>
              <ul className="vs-terms">
                <li><b>Aynı motor.</b> Soru seçimi, netleştirme, koşullar ve aday sorularına cevaplar SkillMatch'in kendi ön görüşme kodundan gelir (sürüm {SOURCE.commit}); bu sayfa için yazılmış bir konuşma motoru yok.</li>
                <li><b>Ses tanıma bu demoda tarayıcınızındır.</b> Chrome ve Edge konuşmanızı yazıya dökmek için kendi bulut servisine gönderir. Üründe yazıya dökme SkillMatch sunucusunda yapılır. Asistanın sesi tarayıcınızın Türkçe sesidir; Türkçe ses yoksa yalnız altyazı gösterilir.</li>
                <li><b>Hiçbir şey saklanmaz.</b> Ses kaydı yok; cevaplar yalnız bu sekmede, sayfayı kapatınca silinir. Gerçek başvuru, aday kaydı ya da puan oluşmaz.</li>
                <li><b>Sınırlar.</b> Görüşme en çok {LIMIT.minutes} dakika, bu tarayıcıda günde {LIMIT.perDay} görüşme. Mikrofon yalnız “Sesli başlat”a basınca istenir.</li>
              </ul>
              <label className="vs-check"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} /> Bilgilendirmeyi okudum; bu bir demo görüşmedir.</label>
              <div className="vs-start">
                <button className="sx-btn sx-btn--on" disabled={!consent || phase === 'loading' || !micOk} onClick={() => begin(true)}>
                  {phase === 'loading' ? 'Hazırlanıyor…' : 'Sesli başlat'}
                </button>
                <button className="sx-btn sx-btn--ghost-on" disabled={!consent || phase === 'loading'} onClick={() => begin(false)}>Yazarak başlat</button>
              </div>
              {!stt && micOk && <p className="sx-note">Bu tarayıcıda konuşma tanıma yok: sesli modda asistan konuşur, cevabı yazarak verirsiniz.</p>}
              {!micOk && <p className="sx-note">Bu tarayıcıda mikrofon erişimi yok; yazarak deneyebilirsiniz.</p>}
              {err && <p className="vs-err" role="alert">{err}</p>}
            </div>
          ) : (
            <div className="vs-controls">
              {live && (
                <div className="vs-controls__row">
                  <button className="sx-chip" onClick={toggleMic} aria-pressed={mode === 'voice'}>{mode === 'voice' ? 'Mikrofonu kapat' : 'Mikrofonu aç'}</button>
                  <button className="sx-chip" onClick={repeat} disabled={!(talk === 'listening' || talk === 'muted')}>Tekrar dinle</button>
                  <button className="sx-chip" onClick={() => setCaptions((c) => !c)} aria-pressed={captions}>Altyazı</button>
                  <button className="sx-chip" onClick={() => control('pause')}>Ara ver</button>
                  <button className="sx-chip" onClick={() => control('human')}>İnsanla görüşmek istiyorum</button>
                </div>
              )}
              {live && (
                <form className="vs-type" onSubmit={(e) => { e.preventDefault(); submitTyped() }}>
                  <input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={mode === 'voice' ? 'Konuşun ya da yazarak cevaplayın…' : 'Cevabınızı yazın…'} aria-label="Yazarak cevapla" maxLength={400} />
                  <button className="sx-btn sx-btn--on sx-btn--sm" type="submit">Gönder</button>
                </form>
              )}
              {live && (
                <div className="vs-samples" aria-label="Örnek cevaplar">
                  <span className="sx-note">Örnek cevaplar · ürünün konuşma testlerinden</span>
                  <div>{samples.slice(0, 7).map((s) => <button key={s} className="sx-chip" onClick={() => submitTyped(s)}>{s}</button>)}</div>
                </div>
              )}
              {phase === 'done' && <button className="sx-btn sx-btn--ghost-on sx-btn--sm" onClick={() => { setPhase('intro'); setTalk('idle') }}>Yeni görüşme</button>}
              {voiceInfo && live && mode === 'voice' && (
                <p className="sx-note">Asistan sesi: {voiceInfo.tts || 'Türkçe ses yok · yalnız altyazı'} · Ses tanıma: {voiceInfo.stt ? 'tarayıcı (tr-TR)' : 'yok · yazarak cevaplayın'}</p>
              )}
            </div>
          )}

          {(log.length > 0) && captions && (
            <div className="vs-log" aria-live="polite">
              {log.map((m) => (
                <p key={m.id} className={`vs-msg vs-msg--${m.who}`}>
                  <span>{m.who === 'ai' ? 'Asistan' : m.who === 'me' ? 'Siz' : 'Sistem'}{m.meta?.typed ? ' · yazılı' : ''}{m.meta?.interrupted ? ' · söze girdi' : ''}{m.meta?.qa ? (m.meta.qa.answered ? ' · aday sorusu cevaplandı' : ' · İK\'ya iletildi') : ''}</span>
                  {m.text}
                </p>
              ))}
              {partial && <p className="vs-msg vs-msg--me vs-msg--partial"><span>Siz · dinleniyor</span>{partial}</p>}
              <i ref={logEnd} />
            </div>
          )}
        </div>

        <aside className="vs-side">
          <div className="vs-card">
            <div className="vs-card__hd"><b>Soru akışı</b><span>{view ? `${view.progress.answered}/${view.progress.total} bilgi` : '12 onaylı soru'}</span></div>
            {view?.rows ? <Plan rows={view.rows} /> : (
              <p className="sx-note">Varsayılan “Genel ön görüşme” şablonu: 12 operasyonel soru. Korunan kişisel özellikler (yaş, medeni durum, sağlık…) sorulmaz. İhbar süresi yalnız “çalışıyor” cevabından sonra sorulur.</p>
            )}
          </div>
          {records.length > 0 && (
            <div className="vs-card">
              <div className="vs-card__hd"><b>Motor izi</b><span>son kayıtlar</span></div>
              <ul className="vs-trace">
                {records.map((r, i) => (
                  <li key={`${r.key}-${r.t}-${i}`}>
                    <b>{r.label}</b> <em>{r.value}</em>
                    <span>{STATUS_LABEL[r.status] || r.status}{r.source === 'volunteered' ? ' · cevabın içinden yakalandı' : r.source === 'prefill' ? ' · başvurudan' : ''}{r.final ? '' : ' · netleştiriliyor'}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <details className="vs-card vs-rules">
            <summary><b>Asistan neyi cevaplar, neyi cevaplamaz?</b></summary>
            <ul>
              <li>Süreç, yapay zekâ olduğu, karar vermediği, gizlilik ve kalan soru sayısı: sabit süreç bilgisinden.</li>
              <li>Otel, konum, departman, çalışma şekli, sezon, lojman, iş tanımı: yalnız pozisyon ve otel kaydında yazanla.</li>
              <li>Ücret varsayılan olarak söylenmez; “İK ekibi sizinle görüşecek” denir ve soru İK'ya iletilir.</li>
              <li>Bilmediği soruda bilgi uydurmaz: “İK'ya ilettim” der, oturum “İK ilgisi gerekli” olur.</li>
              <li>Konu dışı istekler (şarkı, fıkra…) kibarca geri çevrilir. Görüşme başına en çok 10 aday sorusu cevaplanır.</li>
              <li>“Tekrar”, “ara verelim”, “bir insanla görüşmek istiyorum” kontrol niyetleridir; “Gerçek bir insan mısınız?” görüşmeyi bitirmez.</li>
            </ul>
          </details>
        </aside>
      </div>

      {summary && (
        <div className="sx-wrap">
          <div className="vs-sum" role="region" aria-label="Görüşme özeti">
            <div className="vs-sum__hd">
              <div>
                <span className="sx-eyebrow">İK'nın gördüğü özet</span>
                <h3>{cand.name} · {pos.title} · {hotel.name}</h3>
              </div>
              {summary.needs_hr_attention ? <span className="sx-badge sx-badge--wait">İK ilgisi gerekli</span> : <span className="sx-badge sx-badge--ok">Tamamlandı</span>}
            </div>
            <div className="vs-sum__grid">
              <div>
                <h4>Yapılandırılmış cevaplar</h4>
                <ul className="vs-sum__lines">{summary.lines.map((l, i) => { const [k, ...v] = l.split(': '); return <li key={i}><span>{k}</span><b>{v.join(': ')}</b></li> })}</ul>
              </div>
              <div>
                {summary.unconfirmed.length > 0 && (<><h4>Teyit gereken bilgiler</h4><ul className="vs-sum__tags">{summary.unconfirmed.map((x) => <li key={x}>{x}</li>)}</ul></>)}
                {summary.missing.length > 0 && (<><h4>Eksik zorunlu bilgiler</h4><ul className="vs-sum__tags">{summary.missing.map((x) => <li key={x}>{x}</li>)}</ul></>)}
                <h4>Adayın soruları</h4>
                {summary.candidate_questions.length ? (
                  <ul className="vs-sum__qs">{summary.candidate_questions.map((q, i) => <li key={i}><b>“{q.text}”</b><span>{q.answered ? q.answer : 'İK dönüşü bekliyor'}</span></li>)}</ul>
                ) : <p className="sx-note">Aday soru sormadı.</p>}
              </div>
            </div>
            <p className="vs-sum__fine">{summary.disclaimer} Ön görüşme başvuru aşamasını, eşleşme puanını ve aday kaydını değiştirmez.</p>
          </div>
        </div>
      )}
    </section>
  )
}
