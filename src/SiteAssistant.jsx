import { useState, useRef, useEffect, useCallback, useId } from 'react'
import { KB, matchKB } from './siteKnowledge.js'
import './SiteAssistant.css'

const GREETING = 'Merhaba. SRYVERSE, SkillMatch AI ve EstateMatch AI hakkında sorularınızı yanıtlayabilirim. Aşağıdan bir konu seçin ya da yazın.'
const WA_LINK = 'https://wa.me/905315178170?text=Merhaba%2C%20SRYVERSE%20%C3%BCr%C3%BCnleri%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum.'
const FALLBACK = 'Bu konuda hazır bir yanıtım yok. Aşağıdaki konulardan birini deneyebilir ya da WhatsApp üzerinden doğrudan ekibimize ulaşabilirsiniz.'

export default function SiteAssistant() {
  const [menu, setMenu] = useState(false)
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState([{ from: 'bot', text: GREETING }])
  const [input, setInput] = useState('')
  const logRef = useRef(null)
  const panelId = useId()
  const expanded = menu || open

  const toggleFab = useCallback(() => {
    if (open) { setOpen(false); setMenu(false); return }
    setMenu(m => !m)
  }, [open])

  const openChat = useCallback(() => { setMenu(false); setOpen(true) }, [])

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
      {menu && !open && (
        <div className="sa-menu" role="menu">
          <button className="sa-menu__item" role="menuitem" onClick={openChat}>
            <span className="sa-menu__ic sa-menu__ic--chat">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v12H8l-4 4V4z" /><path d="M8 9h8M8 12.5h5" /></svg>
            </span>
            <span>Site Asistanı</span>
          </button>
          <a
            className="sa-menu__item" role="menuitem"
            href={WA_LINK} target="_blank" rel="noopener noreferrer"
            onClick={() => setMenu(false)}
          >
            <span className="sa-menu__ic sa-menu__ic--wa">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="#fff"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35zM12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88 2.64 0 5.13 1.03 7 2.9a9.82 9.82 0 0 1 2.9 7c0 5.45-4.45 9.87-9.91 9.87zm8.43-18.3A11.8 11.8 0 0 0 12.05 0C5.5 0 .16 5.33.16 11.89c0 2.1.55 4.14 1.59 5.94L.06 24l6.33-1.66a11.88 11.88 0 0 0 5.66 1.44h.01c6.55 0 11.89-5.33 11.89-11.89 0-3.18-1.24-6.16-3.47-8.4z" /></svg>
            </span>
            <span>WhatsApp'tan yazın</span>
          </a>
        </div>
      )}

      <button
        className={`sa-fab${expanded ? ' sa-fab--open' : ''}`}
        onClick={toggleFab}
        aria-label={expanded ? 'İletişim menüsünü kapat' : 'İletişim seçeneklerini aç'}
        aria-expanded={expanded}
        aria-controls={panelId}
      >
        <span className="sa-fab__dot" />
        {expanded ? (
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
