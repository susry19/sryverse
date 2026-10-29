/* Tek başına önizleme paketi (vite.preview.config.js): yalnız SkillMatch
   deneyimi, site kabuğu ve yönlendirme olmadan. Bağlantılar sryverse.com'a
   yeni sekmede gider. */
import React from 'react'
import ReactDOM from 'react-dom/client'
import ExperiencePage from '../ExperiencePage.jsx'
import '../../index.css'

// Artifact iskeleti <html>'e dil koymaz; Türkçe büyük harf (İ) için gerekli
document.documentElement.lang = 'tr'

ReactDOM.createRoot(document.getElementById('root')).render(<ExperiencePage />)
