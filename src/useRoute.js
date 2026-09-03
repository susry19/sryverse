import { useState, useEffect, useCallback } from 'react'

/**
 * Sayfa durumunu tarayici adresiyle esitler.
 *
 * Harici router kutuphanesi yerine History API kullaniyoruz: uygulama
 * zaten tek `page` state'i uzerinden calisiyordu, buraya sadece adres
 * senkronizasyonu ekleniyor.
 *
 * /            -> home
 * /skillmatch  -> skillmatch
 * /estatematch -> estatematch
 * /vizyon      -> vision
 */

const PATHS = {
  home: '/',
  skillmatch: '/skillmatch',
  estatematch: '/estatematch',
  estatematchFeatures: '/estatematch/features',
  vision: '/vizyon',
}

// Adres -> sayfa anahtari. Eski/alternatif yazimlar da kabul edilir.
const ROUTES = {
  '': 'home',
  'skillmatch': 'skillmatch',
  'skillmatch-ai': 'skillmatch',
  'estatematch': 'estatematch',
  'estatematch-ai': 'estatematch',
  'estatematch/features': 'estatematchFeatures',
  'estatematch/ozellikler': 'estatematchFeatures',
  'vizyon': 'vision',
  'vision': 'vision',
}

/* Kendi SEO'sunu usePageSeo ile yoneten sayfalar burada YOK; boylece
   sayfa basligi cift kez yazilip birbirini ezmiyor. */
const TITLES = {
  home: 'SRYVERSE — AI, veri ve dijital dönüşüm ürünleri',
  vision: 'Vizyon & Misyon | SRYVERSE',
}

function pageFromLocation() {
  const seg = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase()
  return ROUTES[seg] || 'home'
}

export default function useRoute() {
  const [page, setPageState] = useState(pageFromLocation)

  // Geri/ileri tuslari
  useEffect(() => {
    const onPop = () => setPageState(pageFromLocation())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // Sekme basligi
  useEffect(() => {
    const t = TITLES[page]
    if (t) document.title = t
  }, [page])

  /**
   * Sayfayi degistirir ve adresi gunceller.
   * `replace` true ise gecmise yeni kayit eklemez.
   */
  const setPage = useCallback((next, { replace = false } = {}) => {
    const path = PATHS[next] || '/'
    if (window.location.pathname !== path) {
      window.history[replace ? 'replaceState' : 'pushState']({ page: next }, '', path)
    }
    setPageState(next)
  }, [])

  return [page, setPage]
}
