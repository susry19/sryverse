/* SRYVERSE ana sayfası — tek sürekli anlatı.
   Giriş → sorun → felsefe → ürünler → soru → ne kuruyoruz → nasıl
   düşünüyoruz → kimler için → manifesto → kapanış ve iletişim.
   Başlık ve alt bilgi App kabuğundan gelir; bu bileşen yalnızca sahnenin
   arka plan temasını (koyu/açık) kabuğa bildirir. */
import { useEffect } from 'react'
import { useActiveSection } from '../estate/scroll.js'
import Hero from './Hero.jsx'
import Problem from './Problem.jsx'
import Philosophy from './Philosophy.jsx'
import { Bridge, EstateScene, SkillScene, MetrajScene } from './Products.jsx'
import Question from './Question.jsx'
import { Capabilities, Thinking, Audience, Manifesto, Closing } from './After.jsx'
import HomeNav from './HomeNav.jsx'
import './Home.css'

const TEMA = [
  ['baslangic', 'dark'], ['sorun', 'dark'], ['felsefe', 'dark'],
  ['urunler', 'light'], ['skillmatch-sahne', 'dark'], ['metraj-sahne', 'light'],
  ['soru', 'dark'], ['yaklasim', 'light'], ['manifesto', 'dark'], ['son', 'dark'],
]
const TEMA_IDS = TEMA.map(t => t[0])

export default function Home({ go, openPage, onTheme }) {
  const i = useActiveSection(TEMA_IDS, .08)
  const theme = TEMA[i][1]
  useEffect(() => { onTheme?.(theme) }, [theme, onTheme])
  useEffect(() => () => onTheme?.('light'), [onTheme])

  return (
    <main className="home">
      <Hero onProducts={() => go('#urunler')} onNext={() => go('#sorun')} />
      <Problem />
      <Philosophy />
      <Bridge />
      <EstateScene openPage={openPage} />
      <SkillScene openPage={openPage} />
      <MetrajScene go={go} />
      <Question />
      <Capabilities />
      <Thinking />
      <Audience openPage={openPage} />
      <Manifesto />
      <Closing go={go} />
      <HomeNav theme={theme} go={go} />
    </main>)
}
