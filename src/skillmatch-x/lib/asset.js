/* Statik dosya yolu: sitede kökten (/skillmatch-x/...), tek başına önizleme
   paketinde (vite.preview.config.js, base './') göreli. */
export const asset = (p) => import.meta.env.BASE_URL + String(p).replace(/^\//, '')
