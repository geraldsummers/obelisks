#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const repoRoot = process.cwd()
const inputPath = process.argv[2] || path.join(repoRoot, 'kubejs/config/food_effect_index.json')
const reportPath = process.argv[3] || path.join(repoRoot, 'generated/validation/food_effect_graph_audit.md')
const catalogPath = process.argv[4] || path.join(repoRoot, 'kubejs/config/food_effect_progression_candidates.json')

const beneficialWeights = {
  'minecraft:absorption': 12,
  'minecraft:conduit_power': 16,
  'minecraft:dolphins_grace': 12,
  'minecraft:fire_resistance': 18,
  'minecraft:haste': 12,
  'minecraft:health_boost': 12,
  'minecraft:hero_of_the_village': 10,
  'minecraft:instant_health': 10,
  'minecraft:invisibility': 8,
  'minecraft:jump_boost': 8,
  'minecraft:luck': 8,
  'minecraft:night_vision': 10,
  'minecraft:regeneration': 16,
  'minecraft:resistance': 18,
  'minecraft:saturation': 14,
  'minecraft:slow_falling': 14,
  'minecraft:speed': 10,
  'minecraft:strength': 18,
  'minecraft:water_breathing': 14
}

const harmfulWeights = {
  'minecraft:bad_omen': -12,
  'minecraft:blindness': -12,
  'minecraft:darkness': -12,
  'minecraft:hunger': -8,
  'minecraft:instant_damage': -12,
  'minecraft:levitation': -6,
  'minecraft:mining_fatigue': -10,
  'minecraft:nausea': -8,
  'minecraft:poison': -10,
  'minecraft:slowness': -10,
  'minecraft:unluck': -8,
  'minecraft:weakness': -10,
  'minecraft:wither': -16
}

const routeEffects = new Set([
  'minecraft:fire_resistance',
  'minecraft:night_vision',
  'minecraft:resistance',
  'minecraft:water_breathing',
  'minecraft:slow_falling',
  'minecraft:regeneration',
  'minecraft:absorption'
])

const combatEffects = new Set([
  'minecraft:absorption',
  'minecraft:fire_resistance',
  'minecraft:health_boost',
  'minecraft:instant_health',
  'minecraft:regeneration',
  'minecraft:resistance',
  'minecraft:strength'
])

const traversalEffects = new Set([
  'minecraft:conduit_power',
  'minecraft:dolphins_grace',
  'minecraft:jump_boost',
  'minecraft:slow_falling',
  'minecraft:speed',
  'minecraft:water_breathing'
])

const utilityEffects = new Set([
  'minecraft:haste',
  'minecraft:hero_of_the_village',
  'minecraft:invisibility',
  'minecraft:luck',
  'minecraft:night_vision',
  'minecraft:saturation'
])

const dietGroupIds = ['fruits', 'grains', 'proteins', 'special_food', 'sugars', 'vegetables']

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function addUnique(arr, value) {
  if (!arr.includes(value)) arr.push(value)
}

function addDietTagValue(map, group, value) {
  if (typeof value === 'string') {
    if (value.startsWith('#')) return
    map[value] ||= []
    addUnique(map[value], group)
    return
  }
  if (value && typeof value.id === 'string') {
    if (value.id.startsWith('#')) return
    map[value.id] ||= []
    addUnique(map[value.id], group)
  }
}

function loadDietGroupsFromTagDumps(foodDumpPath) {
  const map = {}
  const minecraftDir = path.resolve(path.dirname(foodDumpPath), '../../')
  const tagDir = path.join(minecraftDir, 'dump/tags/diet/_unknown_tag_type/items')
  if (!fs.existsSync(tagDir)) return map

  for (const group of dietGroupIds) {
    const file = path.join(tagDir, `${group}.json`)
    if (!fs.existsSync(file)) continue
    const json = readJson(file)
    for (const value of json.values || []) addDietTagValue(map, group, value)
  }

  for (const groups of Object.values(map)) groups.sort()
  return map
}

function seconds(ticks) {
  return Math.round((Number(ticks || 0) / 20) * 10) / 10
}

function effectScore(effect) {
  const id = effect.effect
  const durationSeconds = seconds(effect.durationTicks)
  const amplifier = Number(effect.amplifier || 0)
  const probability = Math.max(0, Math.min(1, Number(effect.probability || 1)))
  const base = beneficialWeights[id] ?? harmfulWeights[id] ?? 4
  const durationFactor = Math.min(durationSeconds / 60, 10)
  return Math.round((base + durationFactor * Math.sign(base) * 4 + amplifier * 4) * probability)
}

function nutritionScore(food) {
  const groups = food.dietGroups || []
  const values = food.dietGroupValues || {}
  if (!groups.length && !Object.keys(values).length) return 0
  const groupCount = Math.max(groups.length, Object.keys(values).length)
  const valueScore = Object.values(values).reduce((sum, value) => sum + Math.max(0, Number(value || 0)), 0)
  const varietyScore = groupCount * groupCount * 8
  const substanceScore = Number(food.nutrition || 0) + Math.round(Number(food.saturationModifier || 0) * Number(food.nutrition || 0) * 2)
  return Math.round(varietyScore + substanceScore + valueScore)
}

function foodScore(food) {
  const nutritionScore = Number(food.nutrition || 0) * 2
  const saturationScore = Math.round(Number(food.saturationModifier || 0) * Number(food.nutrition || 0) * 4)
  const effectsScore = (food.effects || []).reduce((sum, effect) => sum + effectScore(effect), 0)
  return nutritionScore + saturationScore + effectsScore + nutritionScoreForFood(food)
}

function nutritionScoreForFood(food) {
  return nutritionScore(food)
}

function categoryFor(food) {
  const effectIds = new Set((food.effects || []).map(effect => effect.effect))
  const harmful = [...effectIds].some(id => harmfulWeights[id] < 0)
  const beneficial = [...effectIds].some(id => beneficialWeights[id] > 0)
  if (harmful && beneficial) return 'risky_power'
  if (harmful) return 'hazard_or_joke'
  if ([...effectIds].some(id => combatEffects.has(id))) return 'combat_supply'
  if ([...effectIds].some(id => routeEffects.has(id))) return 'route_survival'
  if ([...effectIds].some(id => traversalEffects.has(id))) return 'movement_supply'
  if ([...effectIds].some(id => utilityEffects.has(id))) return 'utility_supply'
  if ((food.effects || []).length > 0) return 'special_supply'
  if ((food.dietGroups || []).length >= 4) return 'varied_nutrition'
  if ((food.dietGroups || []).length >= 2 && foodScore(food) >= 40) return 'strong_nutrition'
  if (foodScore(food) >= 24) return 'high_calorie_stock'
  return 'ordinary_food'
}

function suggestedStage(food, score, category) {
  const id = food.id
  if (id.startsWith('mynethersdelight:') || id.startsWith('ends_delight:') || id.startsWith('oceansdelight:')) return 'dimension_food'
  if (id.startsWith('brewinandchewin:')) return 'fermentation'
  if (id.startsWith('farmersrespite:')) return 'kettle_drinks'
  if (category === 'combat_supply' && score >= 50) return 'midgame_expedition_food'
  if (category === 'route_survival' && score >= 45) return 'danger_route_food'
  if (score >= 60) return 'late_kitchen_reward'
  if (score >= 35) return 'established_kitchen'
  return 'early_kitchen_or_showcase'
}

function topBy(arr, count) {
  return [...arr].sort((a, b) => b.score - a.score || a.id.localeCompare(b.id)).slice(0, count)
}

function table(rows) {
  if (!rows.length) return '_None found._\n'
  return [
    '| Item | Score | Category | Diet groups | Effects | Suggested stage |',
    '|---|---:|---|---|---|---|',
    ...rows.map(row => {
      const effects = row.effects.length
        ? row.effects.map(effect => `${effect.effect} ${effect.amplifier + 1} (${seconds(effect.durationTicks)}s @ ${effect.probability})`).join('<br>')
        : 'none'
      const groups = row.dietGroups?.length ? row.dietGroups.join(', ') : 'none'
      return `| \`${row.id}\` | ${row.score} | ${row.category} | ${groups} | ${effects} | ${row.suggestedStage} |`
    })
  ].join('\n') + '\n'
}

if (!fs.existsSync(inputPath)) {
  console.error(`Missing food dump: ${inputPath}`)
  console.error('Enable kubejs/config/audit_dumps.json and run /reload, then rerun this tool.')
  process.exit(2)
}

const dump = readJson(inputPath)
const dietGroupsFromTagDumps = loadDietGroupsFromTagDumps(inputPath)
const foods = (dump.foods || []).map(food => {
  const dietGroups = (food.dietGroups?.length ? food.dietGroups : dietGroupsFromTagDumps[food.id]) || []
  const enriched = {
    ...food,
    dietGroups
  }
  const score = foodScore(enriched)
  const category = categoryFor(enriched)
  return {
    ...enriched,
    score,
    category,
    suggestedStage: suggestedStage(enriched, score, category)
  }
})

const categories = {}
const byEffect = {}
for (const food of foods) {
  categories[food.category] ||= []
  categories[food.category].push(food)
  for (const effect of food.effects || []) {
    byEffect[effect.effect] ||= []
    byEffect[effect.effect].push(food)
  }
}

const rankedCandidates = foods
  .filter(food => food.effects.length > 0 || food.score >= 28)
  .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))

fs.mkdirSync(path.dirname(catalogPath), { recursive: true })
fs.writeFileSync(catalogPath, JSON.stringify({
  generatedBy: 'tools/analyze_food_effect_graph.mjs',
  source: path.relative(repoRoot, inputPath),
  foodCount: foods.length,
  candidateCount: rankedCandidates.length,
  categories: Object.fromEntries(Object.entries(categories).map(([key, value]) => [key, value.map(food => food.id).sort()])),
  byEffect: Object.fromEntries(Object.entries(byEffect).map(([key, value]) => [key, [...new Set(value.map(food => food.id))].sort()])),
  rankedCandidates: rankedCandidates.map(food => ({
    id: food.id,
    score: food.score,
    category: food.category,
    suggestedStage: food.suggestedStage,
    dietGroups: food.dietGroups || [],
    dietGroupCount: (food.dietGroups || []).length,
    dietGroupValues: food.dietGroupValues || {},
    dietSource: food.dietSource || null,
    nutritionScore: nutritionScoreForFood(food),
    nutrition: food.nutrition,
    saturationModifier: food.saturationModifier,
    effects: food.effects
  }))
}, null, 2) + '\n')

const report = [
  '# Food Effect Graph Audit',
  '',
  `Source: \`${path.relative(repoRoot, inputPath)}\``,
  '',
  `Food items scanned: ${foods.length}`,
  `Progression candidates: ${rankedCandidates.length}`,
  '',
  '## Strongest Candidates',
  '',
  table(topBy(rankedCandidates, 40)),
  '## Combat Supply',
  '',
  table(topBy(categories.combat_supply || [], 25)),
  '## Route Survival',
  '',
  table(topBy(categories.route_survival || [], 25)),
  '## Movement Supply',
  '',
  table(topBy(categories.movement_supply || [], 25)),
  '## Utility Supply',
  '',
  table(topBy(categories.utility_supply || [], 25)),
  '## Varied Nutrition',
  '',
  table(topBy([...(categories.varied_nutrition || []), ...(categories.strong_nutrition || [])], 40)),
  '## Risky Or Harmful Food',
  '',
  table(topBy([...(categories.risky_power || []), ...(categories.hazard_or_joke || [])], 25)),
  '## Quest-Book Use',
  '',
  '- Use `combat_supply` foods for expedition and pillager-campaigns nodes.',
  '- Use `route_survival` foods for Nether, ocean, deepslate, lava-depth, and dimension-route preparation.',
  '- Use `movement_supply` foods for travel and obelisk-run preparation.',
  '- Use `varied_nutrition` and `strong_nutrition` foods as Diet progression candidates even when they have no potion effects.',
  '- Keep `ordinary_food` in showcase/catalogue quests unless recipes are unusually expensive.',
  '- Treat custom hidden effects as follow-up work if playtesting shows a food is stronger than its dump data indicates.',
  ''
].join('\n')

fs.mkdirSync(path.dirname(reportPath), { recursive: true })
fs.writeFileSync(reportPath, report)

console.log(`Wrote ${path.relative(repoRoot, reportPath)}`)
console.log(`Wrote ${path.relative(repoRoot, catalogPath)}`)
