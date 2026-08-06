import { Scene, Eye, H, P, Fx } from './parts.jsx'

export default function MetrajStory({ onDemo }) {
  return (
    <Scene>
      <Fx><Eye>Geliştirme aşamasında</Eye></Fx>
      <Fx delay={60}>
        <span className="psoon__badge">✦ Yakında</span>
      </Fx>
      <Fx delay={120}>
        <H>Sıradaki ürün<br /><em>yolda.</em></H>
      </Fx>
      <Fx delay={180}>
        <P>
          Metraj AI, mimari projelerden otomatik metraj çıkarma fikri üzerine çalıştığımız yeni
          ürünümüz. Henüz geliştirme aşamasında — hazır olduğunda burada olacak.
        </P>
      </Fx>
      <Fx delay={240}>
        <div className="pcta-row">
          <button className="pbtn pbtn--ghost" onClick={onDemo}>
            Haberdar olmak istiyorum <span>→</span>
          </button>
        </div>
      </Fx>
    </Scene>
  )
}
