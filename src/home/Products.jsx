/* Sahne 04–07 — Felsefeden ürünlere.
   Köprü, ardından her ürün için görsel dünyayı geçici olarak değiştiren
   bir sahne: EstateMatch sıcak kırık beyaz ve ilişki çizgileri (kendi
   sayfasının DNA'sı), SkillMatch koyu zemin ve zümrüt, Metraj AI taş ve
   kehribar. Ürün bilgileri mevcut site ve ürün sayfalarından alınmıştır;
   yeni yetenek icat edilmez. */
import { In, Mark } from './bits.jsx'

export function Bridge() {
  return (
    <section id="urunler" className="hb" data-theme="light" aria-labelledby="hb-h">
      <div className="h-wrap hb__in">
        <In><p className="h-kicker">Ürünler</p></In>
        <In delay={70}><h2 id="hb-h" className="hb__h">Tek felsefe.<br /><em>Farklı problemler.</em></h2></In>
        <In delay={140}><p className="hb__p">Her ürün, aynı düşünme biçiminin başka bir sektöre uygulanmış hâlidir: gör, bağla, karar ver.</p></In>
      </div>
    </section>)
}

/* ── EstateMatch: niyet → sinyaller → portföy evreni → anlamlı eşleşme ── */
const EM_KRITER = ['Döşemealtı', 'Müstakil villa', 'Özel havuz', 'En az 4+1']
const EM_SIG = ['Mahremiyet', 'Bahçe kullanımı', 'Şehir erişimi', 'Uzun vadeli değer']
const UNI_ON = new Set([9, 27, 41, 58])

export function EstateScene({ openPage }) {
  return (
    <section id="estatematch-sahne" className="hpr hpr--estate" data-theme="light" aria-labelledby="hpr-em-h">
      <div className="h-wrap hpr__in">
        <div className="hpr__txt">
          <In><Mark name="EstateMatch" /></In>
          <In delay={60}><h3 id="hpr-em-h" className="hpr__h">Bir mülk bulmak yalnızca bir arama problemi değildir.<br /><em>Bir eşleştirme problemidir.</em></h3></In>
          <In delay={120}><p className="hpr__p">EstateMatch, müşterinin söylediği kriterlerle yetinmez. İhtiyacın bağlamını anlar, doğru portföyleri nedenleriyle önerir; paylaşım, randevu ve takibi aynı müşteri ilişkisi üzerinde sürdürür.</p></In>
          <In delay={180}>
            <div className="hpr__act">
              <a href="/estatematch" className="h-cta h-cta--solid" onClick={e => { e.preventDefault(); openPage('estatematch') }}>EstateMatch’i keşfedin<span aria-hidden="true">→</span></a>
              <a href="https://estate.sryverse.com" className="h-ext" target="_blank" rel="noopener noreferrer">estate.sryverse.com</a>
            </div>
          </In>
          <In delay={240}><p className="hpr__meta">Emlak danışmanları ve acenteler için · Canlı ürün</p></In>
        </div>

        <In className="hpr__vis">
          <ol className="ef" aria-label="EstateMatch akışı">
            <li className="ef__stop" style={{ '--k': 0 }}>
              <span className="ef__lbl">Müşteri niyeti</span>
              <div className="ef__card">
                <p className="ef__q">“Döşemealtı’nda, havuzlu, en az 4+1 bir villa arıyorum.”</p>
                <ul className="ef__chips">{EM_KRITER.map(k => <li key={k}>{k}</li>)}</ul>
              </div>
            </li>
            <li className="ef__stop" style={{ '--k': 1 }}>
              <span className="ef__lbl">EstateMatch’in yorumladığı sinyaller</span>
              <ul className="ef__sig">{EM_SIG.map(s => <li key={s}>{s}</li>)}</ul>
            </li>
            <li className="ef__stop" style={{ '--k': 2 }}>
              <span className="ef__lbl">Portföy evreni</span>
              <div className="ef__uni">
                <div className="ef__grid" aria-hidden="true">{Array.from({ length: 72 }, (_, i) => <i key={i} className={UNI_ON.has(i) ? 'is-on' : ''} />)}</div>
                <span className="ef__uni-t">Binlerce kayıt, dört güçlü ihtimal.</span>
              </div>
            </li>
            <li className="ef__stop ef__stop--match" style={{ '--k': 3 }}>
              <span className="ef__lbl">Anlamlı eşleşme</span>
              <figure className="ef__match">
                <img src="/villa/altinkale-640.webp" srcSet="/villa/altinkale-640.webp 640w, /villa/altinkale-960.webp 960w" sizes="(max-width: 1023px) 92vw, 34vw" width="960" height="600" alt="Döşemealtı’nda özel havuzlu, bahçeli müstakil villa" loading="lazy" decoding="async" />
                <figcaption>
                  <span className="ef__t"><b>Döşemealtı · Altınkale</b><small>Müstakil villa · 4+1 · Özel havuz</small></span>
                  <span className="ef__pct"><b>%92</b>anlamlı uyum</span>
                </figcaption>
              </figure>
            </li>
          </ol>
        </In>
      </div>
    </section>)
}

/* ── SkillMatch: beş sinyal tek eşleşmede buluşur ── */
const SM_SIG = ['Aday', 'Deneyim', 'Bağlam', 'Potansiyel', 'Zamanlama']

export function SkillScene({ openPage }) {
  return (
    <section id="skillmatch-sahne" className="hpr hpr--skill" data-theme="dark" aria-labelledby="hpr-sm-h">
      <div className="h-wrap hpr__in hpr__in--rev">
        <div className="hpr__txt">
          <In><Mark name="SkillMatch" /></In>
          <In delay={60}><h3 id="hpr-sm-h" className="hpr__h">İnsanlar doğru fırsatı her zaman bulamaz.<br /><em>Bazen fırsatın insanı bulması gerekir.</em></h3></In>
          <In delay={120}><p className="hpr__p">SkillMatch, başvuruları saniyeler içinde yapılandırır; yetkinliği kelimeden değil anlamından okur ve her uyumu gerekçesiyle açıklar. Sıralama sistemde, karar işe alım ekibinde kalır.</p></In>
          <In delay={180}>
            <div className="hpr__act">
              <a href="/skillmatch" className="h-cta h-cta--solid" onClick={e => { e.preventDefault(); openPage('skillmatch') }}>SkillMatch’i keşfedin<span aria-hidden="true">→</span></a>
              <a href="https://skillmatch.sryverse.com" className="h-ext" target="_blank" rel="noopener noreferrer">skillmatch.sryverse.com</a>
            </div>
          </In>
          <In delay={240}><p className="hpr__meta">İşe alım ve İK ekipleri için · Canlı ürün</p></In>
        </div>

        <In className="hpr__vis">
          <div className="sf" aria-label="SkillMatch eşleştirme mantığı">
            <ul className="sf__in">{SM_SIG.map((s, i) => <li key={s} style={{ '--k': i }}>{s}</li>)}</ul>
            <svg className="sf__lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {SM_SIG.map((_, i) => { const y = 10 + i * 20; return <path key={i} d={`M0 ${y} C45 ${y}, 55 50, 100 50`} pathLength="1" style={{ '--k': i }} /> })}
            </svg>
            <div className="sf__out">
              <span className="sf__node"><b>Eşleşme</b><small>gerekçesiyle</small></span>
            </div>
          </div>
        </In>
      </div>
    </section>)
}

/* ── Metraj AI: çizimden ölçüye ── */
export function MetrajScene({ go }) {
  return (
    <section id="metraj-sahne" className="hpr hpr--metraj" data-theme="light" aria-labelledby="hpr-mt-h">
      <div className="h-wrap hpr__in">
        <div className="hpr__txt">
          <In><Mark name="Metraj AI" tag="Private beta" /></In>
          <In delay={60}><h3 id="hpr-mt-h" className="hpr__h">Metraj, çizimin içinde zaten vardır.<br /><em>Onu çıkarmak günler almamalı.</em></h3></In>
          <In delay={120}><p className="hpr__p">Mimari projelerden otomatik metraj çıkarma üzerine çalıştığımız yeni ürün. Şu anda özel beta aşamasında; erken erişim için bize yazabilirsiniz.</p></In>
          <In delay={180}>
            <div className="hpr__act">
              <a href="#contact" className="h-cta" onClick={e => { e.preventDefault(); go('#contact') }}>Erken erişim için yazın<span aria-hidden="true">→</span></a>
            </div>
          </In>
          <In delay={240}><p className="hpr__meta">Mimarlık ve inşaat ekipleri için · Geliştirme aşamasında</p></In>
        </div>

        <In className="hpr__vis">
          <svg className="mt" viewBox="0 0 320 220" aria-label="Plan çizimi ve ölçü çizgileri" role="img">
            <g className="mt__plan">
              <path d="M40 40h200v140H40z" />
              <path d="M40 110h90M130 40v70M130 110v70M180 110h60M180 110v70M180 150h60" />
              <rect x="70" y="60" width="18" height="18" />
              <path d="M96 40v-6M150 40v-6" />
            </g>
            <g className="mt__dim">
              <path d="M40 200h200M40 195v10M240 195v10" style={{ '--k': 0 }} />
              <path d="M260 40v140M255 40h10M255 180h10" style={{ '--k': 1 }} />
              <path d="M40 24h90M40 19v10M130 19v10" style={{ '--k': 2 }} />
              <path d="M180 124h60M180 119v10M240 119v10" style={{ '--k': 3 }} />
            </g>
            <g className="mt__num">
              <text x="140" y="214" textAnchor="middle" style={{ '--k': 0 }}>12,40</text>
              <text x="274" y="114" textAnchor="middle" transform="rotate(90 274 114)" style={{ '--k': 1 }}>8,60</text>
              <text x="85" y="17" textAnchor="middle" style={{ '--k': 2 }}>5,60</text>
              <text x="210" y="137" textAnchor="middle" style={{ '--k': 3 }}>3,70</text>
            </g>
            <g className="mt__sig">
              <circle cx="130" cy="110" r="3.2" />
              <circle cx="130" cy="110" r="8" className="mt__halo" />
            </g>
          </svg>
        </In>
      </div>
    </section>)
}
