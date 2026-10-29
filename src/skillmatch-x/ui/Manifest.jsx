import { useMemo, useRef } from 'react'
import { useTrack, useReducedMotion, clamp01 } from '../lib/scroll.js'

/* Yapışkan manifesto: kaydırdıkça kelimeler sırayla aydınlanır.
   *yıldızlı* kelimeler vurgudur. Metin ekran okuyucuya bütün verilir. */
export default function Manifest({ eyebrow, text }) {
  const track = useRef(null)
  const box = useRef(null)
  const lit = useRef(-1)
  const reduced = useReducedMotion()
  const words = useMemo(() => text.split(/\s+/).map((w) => ({ w: w.replace(/\*/g, ''), key: w.includes('*') })), [text])
  const plain = useMemo(() => text.replace(/\*/g, ''), [text])

  useTrack(track, (p) => {
    if (reduced || !box.current) return
    const k = Math.round(clamp01((p - 0.08) / 0.72) * words.length)
    if (k === lit.current) return
    lit.current = k
    box.current.querySelectorAll('.mf__w').forEach((el, i) => el.classList.toggle('is-lit', i < k))
  })

  return (
    <section ref={track} className={`mf${reduced ? ' mf--still' : ''}`} aria-label={eyebrow}>
      <div className="mf__stage">
        <div className="sx-wrap">
          <span className="sx-eyebrow sx-eyebrow--on">{eyebrow}</span>
          <p ref={box} className="mf__p">
            <span className="sx-sr">{plain}</span>
            {words.map((x, i) => <span key={i} aria-hidden="true"><span className={`mf__w${x.key ? ' is-key' : ''}`}>{x.w}</span>{' '}</span>)}
          </p>
        </div>
      </div>
    </section>
  )
}
