/* Ses katmanı. Sessizlik algılama (VAD), konuşma sonu ve araya girme
   değerleri SkillMatch'in aday ekranıyla aynıdır (static/voice-screening.js,
   VSRecorder.start / watchSpeech; docs/VOICE_SCREENING.md §6):
     - yalnız insan sesi bandı (200–3800 Hz) ölçülür
     - ilk 300 ms'nin en düşük seviyesi gürültü tabanı; eşik = taban × 3 (0,012–0,12)
     - konuşma ≥ 300 ms; kısa cevapta 0,8 sn, uzunda 1,1 sn sessizlik turu bitirir
     - 350 ms duraklamada önizleme: motor "cevap tamam" derse 450 ms, "devam edecek"
       derse 1,8 sn beklenir; karar beklenirken en çok 1,5 sn
     - 12 sn hiç konuşma yoksa boş tur; en çok 60 sn
     - araya girme: taban × 5, 0,035 ya da öğrenilen yankı × 2,2'nin büyüğü, 0,55 sn süreklilik
   Farklı olan tek şey yazıya dökme: ürün sesi kendi sunucusunda yazıya döker;
   bu demo tarayıcının konuşma tanıma servisini kullanır (kayıt yok). */

export const VAD = {
  min_speech_ms: 300, end_silence_ms: 1100, short_end_silence_ms: 800, preview_after_ms: 350,
  min_commit_ms: 450, long_end_silence_ms: 1800, preview_wait_max_ms: 1500, no_speech_timeout_ms: 12000,
  max_turn_seconds: 60, barge_sustain_ms: 550,
}

const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)
export const canRecognize = () => !!SR
export const canListen = () => !!(navigator.mediaDevices?.getUserMedia && (window.AudioContext || window.webkitAudioContext))

export class Mic {
  constructor() { this.stream = null; this.ctx = null; this.band = null; this.raw = null; this.buf = null; this.wave = null }
  async open() {
    if (this.stream) return
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1, voiceIsolation: true },
    })
    const Ctx = window.AudioContext || window.webkitAudioContext
    this.ctx = new Ctx()
    const src = this.ctx.createMediaStreamSource(this.stream)
    const hp = this.ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 200
    const lp = this.ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3800
    this.band = this.ctx.createAnalyser(); this.band.fftSize = 2048
    this.raw = this.ctx.createAnalyser(); this.raw.fftSize = 1024
    src.connect(hp); hp.connect(lp); lp.connect(this.band); src.connect(this.raw)
    this.buf = new Float32Array(this.band.fftSize)
    this.wave = new Float32Array(this.raw.fftSize)
  }
  async resume() { if (this.ctx?.state === 'suspended') await this.ctx.resume() }
  rms() {
    if (!this.band) return 0
    this.band.getFloatTimeDomainData(this.buf)
    let s = 0; for (let i = 0; i < this.buf.length; i++) s += this.buf[i] * this.buf[i]
    return Math.sqrt(s / this.buf.length)
  }
  waveform() { if (!this.raw) return null; this.raw.getFloatTimeDomainData(this.wave); return this.wave }
  close() {
    this.stream?.getTracks().forEach((t) => t.stop())
    this.ctx?.close().catch(() => {})
    this.stream = null; this.ctx = null; this.band = null; this.raw = null
  }
}

/* Bir aday turu: VAD + (varsa) tarayıcı konuşma tanıma. `complete(text)`
   motorun turn_complete'i (önizleme kararı). Dönüş: {text, reason}. */
export function listenTurn(mic, { complete, onPartial, onLevel, onVad, signal }) {
  return new Promise((resolve) => {
    let finals = '', interim = '', ended = false, recOn = false, sttError = null
    let rec = null
    if (SR) {
      rec = new SR()
      rec.lang = 'tr-TR'; rec.continuous = true; rec.interimResults = true; rec.maxAlternatives = 1
      rec.onresult = (e) => {
        interim = ''
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i]
          if (r.isFinal) finals = (finals + ' ' + r[0].transcript).trim()
          else interim += r[0].transcript
        }
        onPartial?.((finals + ' ' + interim).trim())
        if (!started && (finals || interim)) { started = true; speechMs = Math.max(speechMs, VAD.min_speech_ms) }
        version++
      }
      rec.onend = () => { recOn = false; if (!ended) { try { rec.start(); recOn = true } catch { /* yeniden başlatılamadı */ } } }
      rec.onerror = (e) => {
        // servis yok / izin yok: turu bitir, çağıran yazılı moda geçer
        if (['not-allowed', 'service-not-allowed', 'network', 'language-not-supported', 'audio-capture'].includes(e.error)) {
          sttError = e.error; recOn = false; finish('stt_error')
        }
      }
      try { rec.start(); recOn = true } catch { /* izin yok ya da desteklenmiyor */ }
    }
    const t0 = performance.now()
    let floor = null, speechMs = 0, silenceMs = 0, started = false, version = 0, last = t0
    let pv = { version: -1, result: null, pending: false }
    const text = () => (finals + ' ' + interim).trim()
    const finish = (reason) => {
      if (ended) return
      ended = true
      clearInterval(timer)
      const done = () => resolve({ text: reason === 'no_speech' || reason === 'stt_error' ? '' : text(), reason, sttError })
      if (rec && recOn) {
        // son sonuç gelsin: tanıma durdurulunca kalan kısım "final" olarak düşer
        const to = setTimeout(done, 900)
        rec.onend = () => { clearTimeout(to); done() }
        try { rec.stop() } catch { clearTimeout(to); done() }
      } else done()
    }
    signal?.addEventListener('abort', () => finish('abort'))
    const timer = setInterval(() => {
      const now = performance.now(), frameMs = now - last; last = now
      const elapsed = now - t0
      const rms = mic ? mic.rms() : 0
      if (elapsed <= 300) floor = floor === null ? rms : Math.min(floor, rms)
      let threshold = Math.max(0.012, Math.min(0.12, (floor || 0) * 3))
      if (elapsed > 300 && rms <= threshold) floor = floor * 0.92 + rms * 0.08
      threshold = Math.max(0.012, Math.min(0.12, (floor || 0) * 3))
      onLevel?.(Math.min(1, rms / (threshold * 4)))
      const voiced = mic ? rms > threshold : false
      onVad?.({ rms, floor: floor || 0, threshold, voiced, speechMs, silenceMs, started })
      if (voiced) {
        if (started && silenceMs > 0) version++
        speechMs += frameMs; silenceMs = 0
        if (speechMs >= VAD.min_speech_ms) started = true
      } else if (started) silenceMs += frameMs
      else if (speechMs < VAD.min_speech_ms) speechMs = Math.max(0, speechMs - frameMs)
      // önizleme: motor bu ana kadarki cevap için "tamam" diyor mu?
      if (started && complete && silenceMs >= VAD.preview_after_ms && pv.version !== version && !pv.pending && text()) {
        const mine = { version, result: null, pending: true }; pv = mine
        complete(text()).then((ok) => { mine.pending = false; mine.result = { complete: !!ok } }).catch(() => { mine.pending = false })
      }
      let endMs = speechMs < 900 ? VAD.short_end_silence_ms : VAD.end_silence_ms
      if (pv.version === version && pv.result?.complete === true) endMs = VAD.min_commit_ms
      else if (pv.version === version && pv.result?.complete === false) endMs = VAD.long_end_silence_ms
      else if (pv.version === version && pv.pending) endMs = Math.max(endMs, VAD.preview_wait_max_ms)
      if (started && silenceMs >= endMs) finish('end')
      else if (!started && elapsed >= VAD.no_speech_timeout_ms) finish('no_speech')
      else if (elapsed >= VAD.max_turn_seconds * 1000) finish('max')
    }, 50)
  })
}

/* Asistan konuşurken adayın söze girmesi (yankı kapılı). */
export function watchBargeIn(mic, onSpeech, outLevel) {
  if (!mic?.band) return () => {}
  let floor = null, above = 0, k = 0, done = false
  const t0 = performance.now()
  const timer = setInterval(() => {
    const rms = mic.rms(), out = outLevel ? outLevel() : 0, age = performance.now() - t0
    if (age < 300) { floor = floor === null ? rms : Math.min(floor, rms); return }
    if (age < 900 && out > 0.01) k = Math.max(k, Math.min(1.5, rms / out))
    const thr = Math.max(0.035, (floor || 0) * 5, k * out * 2.2)
    above = rms > thr ? above + 50 : 0
    if (above >= VAD.barge_sustain_ms && !done) { done = true; clearInterval(timer); onSpeech() }
  }, 50)
  return () => clearInterval(timer)
}

/* Asistanın sesi: tarayıcının TÜRKÇE sesi. Türkçe ses yoksa ürünle aynı
   kural: başka dilin aksanıyla okutulmaz, yalnız altyazı. */
export function turkishVoice() {
  const vs = window.speechSynthesis?.getVoices() || []
  return vs.find((v) => /^tr(-|_|$)/i.test(v.lang) && /google|natural|neural|yelda|online/i.test(v.name)) || vs.find((v) => /^tr(-|_|$)/i.test(v.lang)) || null
}

export function speak(segments, { voice, onLevel, onWord, signal }) {
  return new Promise((resolve) => {
    let i = 0, stopped = false, level = 0
    const tick = setInterval(() => { level *= 0.86; onLevel?.(level) }, 50)
    const end = (why) => { if (stopped) return; stopped = true; clearInterval(tick); onLevel?.(0); resolve(why) }
    signal?.addEventListener('abort', () => { window.speechSynthesis?.cancel(); end('interrupted') })
    if (!voice) {
      // yalnız altyazı: okuma süresi kadar bekle (ürün: min(6 sn, 1,2 sn + 30 ms × karakter))
      const total = segments.join(' ')
      const words = total.split(/\s+/)
      let w = 0
      const wt = setInterval(() => { if (stopped) { clearInterval(wt); return } level = 0.4 + Math.random() * 0.25; onWord?.(++w, words.length) }, 220)
      setTimeout(() => { clearInterval(wt); end('done') }, Math.min(9000, 1200 + total.length * 30))
      return
    }
    const next = () => {
      if (stopped) return
      if (i >= segments.length) { end('done'); return }
      const u = new SpeechSynthesisUtterance(segments[i++])
      u.voice = voice; u.lang = voice.lang; u.rate = 1.02; u.pitch = 1
      u.onboundary = () => { level = 0.55 + Math.random() * 0.35; onWord?.() }
      u.onend = next
      u.onerror = next
      window.speechSynthesis.speak(u)
    }
    window.speechSynthesis.cancel()
    next()
  })
}
