import { useRef } from 'react'
import { useInView } from '../lib/scroll.js'
import Kinetic from './Kinetic.jsx'

/* Sahneler arası geçiş: bir önceki sahnenin sonucunu bir sonrakinin
   sorusuna bağlayan tek cümle. */
export default function Bridge({ kicker, line, dark, deep }) {
  const ref = useRef(null)
  const v = useInView(ref, { margin: '0px 0px -30% 0px' })
  return (
    <div ref={ref} data-tone={dark ? "dark" : "light"} className={`sx-bridge${dark ? ' sx-bridge--dark' : ''}${deep ? ' sx-bridge--deep' : ''}`}>
      <div className="sx-wrap">
        <span className={`sx-eyebrow${dark ? ' sx-eyebrow--on' : ''}`}>{kicker}</span>
        <p className="sx-bridge__line"><Kinetic text={line} play={v} step={46} /></p>
      </div>
    </div>
  )
}
