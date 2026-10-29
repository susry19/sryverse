/* SkillMatch asistanının deterministik katmanı (tarayıcı). Tablolar
   data/assistant.json'dan (ürün kaynağından dışa aktarıldı); burada yalnız
   onları kullanan küçük fonksiyonlar var. Python karşılıkları:
     classify       ai_agent/intent.py   (anahtar sözcük; en uzun eşleşme, eşitlikte _ORDER)
     findSections   system_guide.find_sections / _score
     findRules      legal_guide.find_rules
     parseQuery, describe, evaluate   talent_search_service
   Doğrulama: scripts/skillmatch-x/verify-assistant.mjs */

export function makeAssistant(A) {
  const S = A.search

  /* ── katlama ── */
  const TR = { Ç: 'c', Ğ: 'g', İ: 'i', I: 'i', Ö: 'o', Ş: 's', Ü: 'u', ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u' }
  const fold = (t) => String(t ?? '').replace(/[ÇĞİIÖŞÜçğıöşü]/g, (c) => TR[c]).toLowerCase()   // talent_search_service.fold
  const trCase = (t) => {   // hotel_alias.turkish_casefold
    let s = String(t ?? '').trim()
    for (const [k, v] of [['İ', 'i'], ['I', 'ı'], ['Ş', 'ş'], ['Ğ', 'ğ'], ['Ç', 'ç'], ['Ö', 'ö'], ['Ü', 'ü']]) s = s.split(k).join(v)
    return s.toLowerCase()
  }
  const lowerFold = (t) => String(t ?? '').toLowerCase().replace(/i̇/g, 'i')   // intent._fold
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  /* ── niyet ── */
  function classify(text) {
    const low = lowerFold(text)
    const hits = []
    A.order.forEach((name, i) => {
      const kw = (A.intents[name]?.kw || []).find((k) => low.includes(lowerFold(k)))
      if (kw) hits.push({ name, kw, i })
    })
    if (!hits.length) return null
    hits.sort((a, b) => b.kw.length - a.kw.length || a.i - b.i)
    return { name: hits[0].name, agent: A.intents[hits[0].name].agent, keyword: hits[0].kw, confidence: hits.length === 1 ? 0.8 : 0.6 }
  }

  /* ── sistem rehberi ── */
  function scoreSection(sec, q) {
    let score = 0
    for (const kw of sec.keywords) if (q.includes(trCase(kw))) score += 3
    const title = trCase(sec.title)
    if (title && q.includes(title)) score += 4
    for (const w of title.split(/\s+/)) if (w.length > 3 && q.includes(w)) score += 1
    return score
  }
  function findSections(question, limit = 3) {
    const q = trCase(question)
    if (!q.trim()) return []
    return A.guide.map((s) => [s, scoreSection(s, q)]).filter(([, sc]) => sc > 0)
      .sort((a, b) => b[1] - a[1]).slice(0, Math.max(1, limit)).map(([s]) => s)
  }

  /* ── iş hukuku notları ── */
  const PROTECTED = S.protected.map((p) => ({ rx: new RegExp(p.pattern, 'i'), label: p.label }))
  function findRules(message, limit = 3) {
    const f = fold(message)
    if (!f.trim()) return []
    const prot = PROTECTED.some((p) => p.rx.test(f))
    const scored = []
    for (const r of A.legal.rules) {
      let score = 0
      for (const kw of r.keywords || []) {
        const k = fold(kw)
        if (new RegExp('(?<!\\w)' + esc(k) + (kw.length <= 4 ? '(?!\\w)' : '')).test(f)) score += 3
      }
      if (r.protected && prot) score += 5
      if (score) scored.push([score, r])
    }
    // Python sort kararlı: eşit puanda kaynak sırası korunur
    return scored.map((x, i) => [...x, i]).sort((a, b) => b[0] - a[0] || a[2] - b[2]).slice(0, Math.max(1, limit)).map((x) => x[1])
  }

  /* ── doğal dil aday araması ── */
  const STOP = new Set(S.stopwords)
  function parseQuery(query) {
    const q = fold(query)
    const crit = { languages: [], min_experience_years: null, locations: [], seniority: null, driving_license: false, shift: false, keywords: [], ignored: [] }
    const consumed = new Set()
    for (const [lang, roots] of Object.entries(S.languages)) {
      for (const root of roots) {
        const m = new RegExp('\\b' + root + '\\w*').exec(q)
        if (!m) continue
        const window = q.slice(Math.max(0, m.index - 25), m.index + m[0].length + 30)
        let level = null
        const lv = /\b([abc][12])\b/.exec(window)
        if (lv) level = lv[1].toUpperCase()
        else for (const [word, lvl] of S.level_words) { if (new RegExp('\\b' + word).test(window)) { level = lvl; break } }
        crit.languages.push({ language: lang, min_level: level })
        ;(m[0].match(/\w+/g) || []).forEach((w) => consumed.add(w))
        break
      }
    }
    const m = /(\d+)\s*\+?\s*(?:yil|sene|year)/.exec(q)
    if (m && /deneyim|tecrube|experience|yil|sene/.test(q)) { crit.min_experience_years = parseInt(m[1], 10); consumed.add(m[1]) }
    for (const name of [...S.districts, ...S.cities]) {
      if (new RegExp('\\b' + fold(name) + '\\w*').test(q)) { crit.locations.push(name); consumed.add(fold(name)) }
    }
    for (const [word, level] of S.seniority) { if (new RegExp('\\b' + word).test(q)) { crit.seniority = level; break } }
    if (/\behliyet|\bsurucu belge/.test(q)) crit.driving_license = true
    if (/\bvardiya|\bgece calis/.test(q)) crit.shift = true
    for (const { rx, label } of PROTECTED) {
      const f = rx.exec(q)
      if (f) {
        crit.ignored.push({ criterion: label, text: query.slice(f.index, f.index + f[0].length).trim(), reason: `${label} ${S.protected_reason}` })
        ;(f[0].match(/\w+/g) || []).forEach((w) => consumed.add(w))
      }
    }
    for (const tok of q.match(/[a-z0-9#+.]{3,}/g) || []) {
      if (STOP.has(tok) || consumed.has(tok) || /^\d+$/.test(tok)) continue
      if (Object.values(S.languages).some((roots) => roots.some((r) => tok.startsWith(r)))) continue
      if (!crit.keywords.includes(tok)) crit.keywords.push(tok)
    }
    return crit
  }

  function describe(crit) {
    const parts = []
    for (const l of crit.languages) parts.push(l.language + (l.min_level ? ` (${l.min_level}+)` : ''))
    if (crit.min_experience_years) parts.push(`en az ${crit.min_experience_years} yıl deneyim`)
    if (crit.locations.length) parts.push('Lokasyon: ' + crit.locations.join(', '))
    if (crit.seniority) parts.push('Kıdem: ' + crit.seniority)
    if (crit.driving_license) parts.push('Ehliyet')
    if (crit.shift) parts.push('Vardiyaya uygun')
    if (crit.keywords.length) parts.push('Anahtar kelime: ' + crit.keywords.join(', '))
    return parts.join(' · ') || 'Uygulanabilir kriter bulunamadı'
  }

  // difflib.SequenceMatcher(None, a, b).ratio() (otomatik çöp yok: kısa diziler)
  function ratio(a, b) {
    const b2j = new Map()
    for (let j = 0; j < b.length; j++) { if (!b2j.has(b[j])) b2j.set(b[j], []); b2j.get(b[j]).push(j) }
    const longest = (alo, ahi, blo, bhi) => {
      let besti = alo, bestj = blo, bestsize = 0
      let j2len = new Map()
      for (let i = alo; i < ahi; i++) {
        const newj2len = new Map()
        for (const j of b2j.get(a[i]) || []) {
          if (j < blo) continue
          if (j >= bhi) break
          const k = (j2len.get(j - 1) || 0) + 1
          newj2len.set(j, k)
          if (k > bestsize) { besti = i - k + 1; bestj = j - k + 1; bestsize = k }
        }
        j2len = newj2len
      }
      return [besti, bestj, bestsize]
    }
    let matches = 0
    const queue = [[0, a.length, 0, b.length]]
    while (queue.length) {
      const [alo, ahi, blo, bhi] = queue.pop()
      const [i, j, k] = longest(alo, ahi, blo, bhi)
      if (k) {
        matches += k
        if (alo < i && blo < j) queue.push([alo, i, blo, j])
        if (i + k < ahi && j + k < bhi) queue.push([i + k, ahi, j + k, bhi])
      }
    }
    const t = a.length + b.length
    return t ? (2 * matches) / t : 1
  }
  const fuzzy = (word, text) => {
    if (!word || !text) return false
    if (text.includes(word)) return true
    return (text.match(/[\p{L}\p{N}_]+/gu) || []).some((tok) => ratio(tok, word) >= 0.82)
  }
  const levelOk = (have, need) => {
    if (!need) return true
    if (!have || !S.level_order.includes(have)) return null
    return S.level_order.indexOf(have) >= S.level_order.indexOf(need)
  }

  function evaluate(cand, crit, years, locationKeys, text) {
    const rows = []
    const declared = new Map((cand.languages || []).filter((l) => l && typeof l === 'object').map((l) => [fold(l.language), l]))
    for (const want of crit.languages) {
      const name = want.language, need = want.min_level
      const label = name + (need ? ` (${need}+)` : '')
      const roots = S.languages[name]
      const have = [...declared.entries()].find(([k]) => roots.some((r) => k.startsWith(r)))?.[1]
      if (have) {
        const ok = levelOk(have.level, need)
        rows.push({ label, status: ok ? 'match' : ok === null ? 'unknown' : 'miss', evidence: `${name} · ${have.level || 'seviye belirtilmemiş'} (beyan)` })
      } else if (roots.some((r) => text.includes(r))) {
        rows.push({ label, status: need ? 'unknown' : 'match', evidence: `CV'de ${name} geçiyor, seviye belirtilmemiş` })
      } else if (declared.size) {
        rows.push({ label, status: 'miss', evidence: 'Beyan edilen diller: ' + [...declared.values()].map((l) => `${l.language} ${l.level || ''}`.trim()).join(', ') })
      } else rows.push({ label, status: 'unknown', evidence: 'Dil bilgisi girilmemiş' })
    }
    if (crit.min_experience_years) {
      const need = crit.min_experience_years, label = `En az ${need} yıl deneyim`
      if (years == null) rows.push({ label, status: 'unknown', evidence: 'Deneyim kaydı yok' })
      else rows.push({ label, status: years >= need ? 'match' : 'miss', evidence: `Toplam deneyim ~${+years} yıl` })
    }
    if (crit.locations.length) {
      const wanted = crit.locations.map(fold)
      const hit = locationKeys.find((k) => wanted.some((w) => fold(k).includes(w)))
      const label = 'Lokasyon: ' + crit.locations.join(', ')
      if (hit) rows.push({ label, status: 'match', evidence: hit })
      else if (wanted.some((w) => text.includes(w))) rows.push({ label, status: 'match', evidence: "CV'de geçiyor" })
      else if (locationKeys.length) rows.push({ label, status: 'miss', evidence: locationKeys.slice(0, 3).join(', ') })
      else rows.push({ label, status: 'unknown', evidence: 'Lokasyon girilmemiş' })
    }
    if (crit.seniority) {
      const have = cand.seniority_level, label = 'Kıdem: ' + crit.seniority
      if (!have) rows.push({ label, status: 'unknown', evidence: 'Kıdem belirlenmemiş' })
      else rows.push({ label, status: fold(have).includes(fold(crit.seniority)) ? 'match' : 'miss', evidence: have })
    }
    if (crit.driving_license) {
      const dl = (cand.driving_license || '').trim()
      rows.push({ label: 'Ehliyet', status: dl ? 'match' : 'unknown', evidence: dl ? `Ehliyet: ${dl}` : 'Ehliyet bilgisi yok' })
    }
    if (crit.shift) {
      const sa = (cand.shift_availability || '').trim()
      rows.push({ label: 'Vardiyaya uygun', status: !sa ? 'unknown' : fold(sa).includes('degil') ? 'miss' : 'match', evidence: sa || 'Vardiya bilgisi yok' })
    }
    for (const kw of crit.keywords) {
      const hitSkill = (cand.skills || []).find((s) => fuzzy(kw, fold(s)))
      if (hitSkill) rows.push({ label: kw, status: 'match', evidence: `Yetkinlik: ${hitSkill}` })
      else if (fuzzy(kw, text)) rows.push({ label: kw, status: 'match', evidence: 'CV / deneyimde geçiyor' })
      else rows.push({ label: kw, status: 'miss', evidence: 'Profilde geçmiyor' })
    }
    const total = rows.length
    const matched = rows.filter((r) => r.status === 'match').length
    const unknown = rows.filter((r) => r.status === 'unknown').length
    const kwRows = rows.filter((r) => crit.keywords.includes(r.label))
    const other = rows.filter((r) => !kwRows.includes(r))
    const otherMiss = other.some((r) => r.status === 'miss')
    const incomplete = other.some((r) => r.status === 'unknown')
    const kwOk = !kwRows.length || kwRows.some((r) => r.status === 'match')
    const passes = !otherMiss && !incomplete && kwOk
    const pyRound = (x) => { const f = Math.floor(x); return Math.abs(x - f - 0.5) < 1e-9 ? (f % 2 ? f + 1 : f) : Math.round(x) }
    const score = !total ? 100 : pyRound((100 * matched) / total)
    return { passes, score, criteria: rows, matched, unknown, missed: total - matched - unknown, incomplete: incomplete && !otherMiss && kwOk }
  }

  return { fold, classify, findSections, findRules, parseQuery, describe, evaluate }
}
