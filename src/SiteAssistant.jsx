import { useState, useRef, useEffect, useCallback, useId } from 'react'
import { KB, matchKB } from './siteKnowledge.js'
import './SiteAssistant.css'

const GREETING = 'Merhaba. SRYVERSE, SkillMatch AI ve EstateMatch AI hakkında sorularınızı yanıtlayabilirim. Aşağıdan bir konu seçin ya da yazın.'
const WA_LINK = 'https://wa.me/905315178170?text=Merhaba%2C%20SRYVERSE%20%C3%BCr%C3%BCnleri%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum.'
const FALLBACK = 'Bu konuda hazır bir yanıtım yok. Aşağıdaki konulardan birini deneyebilir ya da WhatsApp üzerinden doğrudan ekibimize ulaşabilirsiniz.'

export default function SiteAssistant() {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState([{ from: 'bot', text: GREETING }])
  const [input, setInput] = useState('')
  const logRef = useRef(null)
  const panelId = useId()

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [msgs, open])

  const answer = useCallback((userText, kbItem) => {
    setMsgs(prev => [
      ...prev,
      { from: 'user', text: userText },
      { from: 'bot', text: kbItem ? kbItem.answer : FALLBACK, fallback: !kbItem },
    ])
  }, [])

  const askTopic = useCallback((item) => answer(item.label, item), [answer])

  const submit = useCallback((e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    setInput('')
    answer(text, matchKB(text))
  }, [input, answer])

  return (
    <>
      <button
        className={`sa-fab${open ? ' sa-fab--open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Asistanı kapat' : 'SRYVERSE Asistan\'ı aç'}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span className="sa-fab__dot" />
        {open ? (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v12H8l-4 4V4z" /><path d="M8 9h8M8 12.5h5" /></svg>
        )}
      </button>

      {open && (
        <div className="sa-panel" id={panelId} role="dialog" aria-label="SRYVERSE Asistan">
          <div className="sa-panel__head">
            <div className="sa-panel__dot" />
            <div>
              <div className="sa-panel__name">SRYVERSE Asistan</div>
              <div className="sa-panel__sub">Site içeriğinden yanıtlar · yapay zekâ değildir</div>
            </div>
          </div>

          <div className="sa-panel__log" ref={logRef}>
            {msgs.map((m, i) => (
              <div key={i} className={`sa-msg sa-msg--${m.from}`}>
                {m.text.split('\n').map((line, j) => <p key={j}>{line || ' '}</p>)}
                {m.fallback && (
                  <a className="sa-msg__wa" href={WA_LINK} target="_blank" rel="noopener noreferrer">WhatsApp'tan yazın →</a>
                )}
              </div>
            ))}
          </div>

          <div className="sa-panel__topics">
            {KB.map(k => (
              <button key={k.id} className="sa-chip" onClick={() => askTopic(k)}>{k.label}</button>
            ))}
          </div>

          <form className="sa-panel__form" onSubmit={submit}>
            <input
              className="sa-panel__input"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Bir soru yazın..."
              aria-label="Asistana soru yazın"
            />
            <button className="sa-panel__send" type="submit" aria-label="Gönder">→</button>
          </form>
        </div>
      )}
    </>
  )
}
