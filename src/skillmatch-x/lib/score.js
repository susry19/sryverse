/* Saf eşleşme hesabı (veri dışarıdan verilir; Node doğrulama betiği de kullanır). */
export function makeScorer(data) {
  const CATALOG = data.catalog, CONST = data.constants
  const DEFAULT_WEIGHTS = Object.fromEntries(CATALOG.filter((c) => c.default).map((c) => [c.key, c.default]))
  const PAIRS = new Map(data.pairs.map((p) => [`${p.c}:${p.p}`, p]))
  const pairOf = (c, p) => PAIRS.get(`${c}:${p}`)
  const candidate = (id) => data.candidates.find((c) => c.id === id)
  const position = (id) => data.positions.find((p) => p.id === id)
  const hotel = (id) => data.hotels.find((h) => h.id === id)

  function roundHalfEven(x) {
    const f = Math.floor(x), d = x - f
    if (Math.abs(d - 0.5) < 1e-9) return f % 2 === 0 ? f : f + 1
    return Math.round(x)
  }

  function normalizeWeights(raw) {
    const out = {}
    for (const c of CATALOG) {
      const w = Number(raw?.[c.key] || 0)
      if (w > 0) out[c.key] = Math.min(100, w)
    }
    return Object.keys(out).length ? out : { ...DEFAULT_WEIGHTS }
  }

  function score(pair, rawWeights) {
    const weights = normalizeWeights(rawWeights)
    const pos = position(pair.p)
    const hasReq = (pos.required_skills || []).length > 0
    const skillsFallback = 'skills' in weights && !hasReq && !('title_match' in weights)
    let num = 0, den = 0
    const breakdown = []
    for (const c of CATALOG) {
      if (!(c.key in weights)) continue
      const w = weights[c.key]
      let v = pair.signals[c.key]
      const item = { key: c.key, label: c.label, weight: w, value: v, used: v !== null && v !== undefined }
      if (c.key === 'skills' && skillsFallback) { v = null; item.used = false }
      if (v !== null && v !== undefined) { num += w * v; den += w }
      breakdown.push(item)
    }
    if (skillsFallback) {
      const v = pair.title_match ? 100 : 0
      num += weights.skills * v; den += weights.skills
      breakdown.push({ key: 'title_match', label: 'Rol geçmişi (unvan benzerliği)', weight: weights.skills, value: v, used: true })
    }
    const total = den ? num / den : 0
    const bonus = !('title_match' in weights) && !skillsFallback && pair.title_match ? CONST.title_bonus : 0
    return { score: Math.min(CONST.max_score, roundHalfEven(total + bonus)), breakdown, bonus }
  }

  /* match_score_service.eligibility: skordan bağımsız kapı precompute'ta;
     öneri eşiği burada (skor ağırlıkla değişebildiği için). */
  function eligibility(pair, s) {
    if (!pair.gate.ok) return { ok: false, reason: pair.gate.reason }
    if (s < CONST.min_score) return { ok: false, reason: `Eşleşme skoru ${s}, öneri eşiği ${CONST.min_score}.` }
    return { ok: true, reason: pair.gate.reason }
  }

  // llm_matcher.decision_for_score bantları ve ekran etiketleri
  function band(s) {
    if (s >= 80) return { key: 'strong', label: 'Güçlü Eşleşme' }
    if (s >= 60) return { key: 'potential', label: 'Olası Eşleşme' }
    if (s >= 40) return { key: 'weak', label: 'Zayıf Eşleşme' }
    return { key: 'none', label: 'Eşleşmiyor' }
  }

  function rankFor(positionId, weights) {
    return data.candidates.map((c) => {
      const pair = pairOf(c.id, positionId)
      const s = score(pair, weights)
      return { c, pair, ...s, elig: eligibility(pair, s.score) }
    }).sort((a, b) => b.score - a.score || a.c.id - b.c.id)
  }

  function positionsFor(candidateId, weights) {
    return data.positions.map((p) => {
      const pair = pairOf(candidateId, p.id)
      const s = score(pair, weights)
      return { p, pair, ...s, elig: eligibility(pair, s.score) }
    }).sort((a, b) => b.score - a.score)
  }
  return { DEFAULT_WEIGHTS, pairOf, candidate, position, hotel, normalizeWeights, score, eligibility, band, rankFor, positionsFor }
}
