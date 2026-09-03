/* SRYVERSE ana sayfası — hikâye anlatan bir iş sitesi.
   01 giriş → 02 ne yapıyoruz → 03 ürünler → 04 EstateMatch → 05 SkillMatch
   → 06 sıradaki → 07 özel sistemler → 08 önce/sonra → 09 sorunlar
   → 10 sizin sektörünüz → 11 tek felsefe anı (tek koyu sahne)
   → 12 nasıl çalışıyoruz → 13 iletişim.
   Başlık ve alt bilgi App kabuğundan gelir; bu bileşen yalnızca koyu
   sahnenin başlığa yansımasını bildirir. */
import { useEffect } from 'react'
import { useActiveSection } from '../estate/scroll.js'
import Hero from './Hero.jsx'
import WhatWeDo from './WhatWeDo.jsx'
import { Intro, EstateScene, SkillScene, Next } from './Products.jsx'
import { NotEvery, BeforeAfter, Problems, Industry } from './Custom.jsx'
import Philosophy from './Philosophy.jsx'
import { Thinking, Contact } from './After.jsx'
import './Home.css'

const TEMA = [['baslangic', 'light'], ['felsefe', 'dark'], ['methodology', 'light']]
const TEMA_IDS = TEMA.map(t => t[0])

export default function Home({ go, openPage, onTheme }) {
  const i = useActiveSection(TEMA_IDS, .08)
  const theme = TEMA[i][1]
  useEffect(() => { onTheme?.(theme) }, [theme, onTheme])
  useEffect(() => () => onTheme?.('light'), [onTheme])

  return (
    <main className="home">
      <Hero go={go} />
      <WhatWeDo />
      <Intro />
      <EstateScene openPage={openPage} />
      <SkillScene openPage={openPage} />
      <Next />
      <NotEvery />
      <BeforeAfter />
      <Problems />
      <Industry go={go} />
      <Philosophy />
      <Thinking />
      <Contact />
    </main>)
}
