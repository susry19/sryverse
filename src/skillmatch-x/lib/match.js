/* Eşleşme skorunun AĞIRLIKLAMA adımı — match_criteria_service.score() ile aynı.

   Sinyallerin kendisi (0..100) SkillMatch kodunda hesaplanıp
   data/matches.json'a yazıldı (scripts/skillmatch-x/precompute_matches.py).
   Burada yalnız ağırlıklı ortalama, yetkinlik yedeği (rol geçmişine devir),
   unvan bonusu ve tavan uygulanır. Python `round` yarımı çifte yuvarlar. */

import data from '../data/matches.json'
import { makeScorer } from './score.js'

export const DATA = data
export const CATALOG = data.catalog
export const CONST = data.constants
export const { DEFAULT_WEIGHTS, pairOf, candidate, position, hotel, normalizeWeights, score, eligibility, band, rankFor, positionsFor } = makeScorer(data)

