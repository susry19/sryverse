import { useRef } from 'react'
import { useInView } from '../lib/scroll.js'
import Kinetic from './Kinetic.jsx'
import ScreenStage from './ScreenStage.jsx'

/* Bölüm açılışı: bir önceki sahnenin sonucunu bir sonrakinin sorusuna
   bağlayan tek cümle, ardından o adımın gerçek ürün ekranları. */
export default function Bridge({ n, act, kicker, line, shots, caption }) {
  const ref = useRef(null)
  const v = useInView(ref, { margin: '0px 0px -30% 0px' })
  return (
    <div ref={ref} data-act={act} className="sx-bridge">
      <div className="sx-wrap">
        {n && <span className="sx-bridge__big" aria-hidden="true">{n}</span>}
        <div className="sx-bridge__meta">
          {n && <b>Bölüm {n}</b>}<i aria-hidden="true" />
          <span className="sx-eyebrow sx-eyebrow--on">{kicker}</span>
        </div>
        <p className="sx-bridge__line"><Kinetic text={line} play={v} step={46} /></p>
        {shots && <ScreenStage shots={shots} caption={caption} />}
      </div>
    </div>
  )
}
