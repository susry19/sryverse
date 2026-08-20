import { useState, useRef, useEffect, useCallback } from 'react'
import { KB, matchKB } from './siteKnowledge.js'

const LAYERS = [
  { name: 'Veri Alımı', sub: 'Heterogeneous Data Pipeline', speed: '4.2 MB/s',
    boot: ['SRY-INGEST servisi başlatılıyor...', 'CV & mülk veri akışları bağlandı', 'PDF parser hazır — chunk: 512 token', '>> Katman aktif.'] },
  { name: 'AI Çekirdeği', sub: 'LLM Orchestration & Embeddings', speed: '1.8k tok/s',
    boot: ['LLM orkestrasyon katmanı başlatılıyor...', 'Embedding modeli yüklendi (dim: 768)', 'Bağlam penceresi: 128K token aktif', '>> Çekirdek aktif.'] },
  { name: 'Karar Katmanı', sub: 'Semantic Scoring & Ranking', speed: '320 ops/s',
    boot: ['Semantik eşleştirme motoru yükleniyor...', 'Scoring ağırlıkları kalibre edildi', 'Vektör uzayı oluşturuldu', '>> Karar katmanı aktif.'] },
  { name: 'Yürütme', sub: 'Workflow & Action Dispatcher', speed: '95 wf/s',
    boot: ['Otomasyon motoru başlatılıyor...', 'İş akışı şablonları yüklendi (47)', 'Aksiyon dispatcher hazır', '>> Motor aktif.'] },
  { name: 'Analitik', sub: 'Real-time Intelligence Engine', speed: '12 req/s',
    boot: ['BI raporlama katmanı başlatılıyor...', 'Gerçek zamanlı metrik pipeline bağlandı', 'Öngörülü analiz modeli yüklendi', '>> Analitik aktif.'] },
]

/* Hızlı sorular artık siteKnowledge.js'teki paylaşılan bilgi tabanından gelir. */
const QUICK = KB.map(k => ({ label: k.label, q: k.label, answer: k.answer }))

export default function Terminal({ compact = false }) {
  const [curLayer, setCurLayer] = useState(0)
  const [lines, setLines] = useState([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [speed, setSpeed] = useState('4.2 MB/s')
  const logRef = useRef(null)

  const addLine = useCallback((text, cls = '', id = null) => {
    setLines(prev => [...prev, { text, cls, id: id || Date.now() + Math.random() }])
  }, [])

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [lines])

  useEffect(() => {
    const L = LAYERS[curLayer]
    setLines([])
    let i = 0
    const interval = setInterval(() => {
      if (i < L.boot.length) {
        const cls = i === L.boot.length - 1 ? 'green' : i === 0 ? 'yellow' : 'muted'
        addLine(L.boot[i], cls)
        i++
      } else clearInterval(interval)
    }, 130)
    return () => clearInterval(interval)
  }, [curLayer, addLine])

  useEffect(() => {
    const t = setInterval(() => {
      const L = LAYERS[curLayer]
      const base = parseFloat(L.speed)
      const unit = L.speed.replace(/[\d.]/g, '').trim()
      setSpeed((base * (0.9 + Math.random() * 0.2)).toFixed(1) + ' ' + unit)
    }, 1200)
    return () => clearInterval(t)
  }, [curLayer])

  /* Hazır cevabı daktilo efektiyle akıt */
  const streamCanned = useCallback(async (question, answer) => {
    setBusy(true)
    setInput('')
    addLine('')
    addLine('Kullanıcı → ' + question, 'question')
    addLine('')
    addLine('SRY//CORE bilgi tabanı sorgulanıyor...', 'muted')
    await new Promise(r => setTimeout(r, 550))

    const streamId = 'stream-' + Date.now()
    setLines(prev => [...prev, { text: '', cls: 'ai', id: streamId, streaming: true }])

    const chunkSize = 3
    for (let i = 0; i < answer.length; i += chunkSize) {
      const slice = answer.slice(0, i + chunkSize)
      setLines(prev => prev.map(l => l.id === streamId ? { ...l, text: slice } : l))
      await new Promise(r => setTimeout(r, 12))
    }
    setLines(prev => prev.map(l => l.id === streamId ? { ...l, text: answer, streaming: false } : l))
    addLine('')
    addLine('İşlem tamamlandı. ✓', 'green')
    setBusy(false)
  }, [addLine])

  /* Serbest metin → site bilgi tabanında anahtar kelime eşleşmesi (yapay zekâ / dış API çağrısı yok) */
  const ask = useCallback(async (question) => {
    if (busy || !question.trim()) return

    const canned = QUICK.find(q => q.q === question || q.label === question)
    if (canned) return streamCanned(canned.q, canned.answer)

    const hit = matchKB(question)
    if (hit) return streamCanned(question, hit.answer)

    setBusy(true)
    setInput('')
    addLine('')
    addLine('Kullanıcı → ' + question, 'question')
    addLine('')
    addLine('SRY//CORE bilgi tabanı sorgulanıyor...', 'muted')
    await new Promise(r => setTimeout(r, 450))
    addLine('Bu konuda hazır bir yanıt bulunamadı. Aşağıdaki hızlı sorulardan birini seçebilir veya WhatsApp üzerinden bize doğrudan ulaşabilirsiniz.', 'yellow')
    addLine('')
    setBusy(false)
  }, [busy, addLine, streamCanned])

  return (
    <div className={`terminal-wrap${compact ? ' terminal-wrap--compact' : ''}`}>

      <div className="terminal-box">
        <div className="terminal-head">
          <div>
            <div className="terminal-head__name">SRY<span className="thd-sep">//</span>CORE</div>
            <div className="terminal-head__sub">Canlı Zeka Çekirdeği — {LAYERS[curLayer].sub}</div>
          </div>
          <div className="terminal-head__badges">
            <span className="tbadge tbadge--on">● CANLI</span>
            <span className="tbadge">{speed}</span>
          </div>
        </div>

        <div className="terminal-tabs">
          {LAYERS.map((l, i) => (
            <button key={i} className={`ttab${curLayer === i ? ' ttab--on' : ''}`} onClick={() => !busy && setCurLayer(i)} disabled={busy}>
              <span className="ttab__num">{String(i + 1).padStart(2, '0')}</span>
              <span className="ttab__name">{l.name}</span>
            </button>
          ))}
        </div>

        <div className="terminal-log" ref={logRef}>
          {lines.map(l => l.text === '' ? (
            <div key={l.id} style={{ height: 4 }} />
          ) : (
            <div key={l.id} className="tline">
              <span className="tline__arrow">&gt;&gt;</span>
              <span className={`tline__text tline__text--${l.cls}`}>
                {l.text}{l.streaming && <span className="tcursor" />}
              </span>
            </div>
          ))}
        </div>

        <div className="terminal-input">
          <span className="terminal-prompt">sry@core:~$</span>
          <input
            className="terminal-field"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && ask(input)}
            placeholder="Çekirdeğe komut verin..."
            disabled={busy}
          />
          <button className="terminal-run" onClick={() => ask(input)} disabled={busy}>
            {busy ? '...' : 'ÇALIŞTIR ↵'}
          </button>
        </div>

        <div className="terminal-quick">
          {QUICK.map((q, i) => (
            <button key={i} className="qbtn" onClick={() => ask(q.q)} disabled={busy}>{q.label}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
