#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const repo = process.cwd()
const defaultJar = path.join(repo, 'server-instance/mods/alchemistry-1.20.1-2.3.4.jar')
const jar = process.argv[2] || defaultJar
const out = process.argv[3] || path.join(repo, 'kubejs/config/alchemistry_dissolver_port.json')

if (!fs.existsSync(jar)) {
  console.error(`missing Alchemistry jar reference: ${jar}`)
  process.exit(1)
}

const HARD_OR_RARE = new Set([
  'beryllium', 'chromium', 'vanadium', 'titanium', 'tungsten', 'tantalum',
  'niobium', 'platinum', 'palladium', 'rhodium', 'ruthenium', 'osmium',
  'iridium', 'uranium', 'thorium', 'radium', 'actinium', 'protactinium',
  'neptunium', 'plutonium', 'polonium'
])

const FERROUS = new Set(['iron', 'manganese', 'cobalt', 'nickel'])
const NONFERROUS = new Set(['copper', 'zinc', 'tin', 'lead', 'silver', 'gold', 'aluminum', 'magnesium'])
const GAS_ITEM_INPUTS = new Set([
  'chemlib:acetylene', 'chemlib:ammonia', 'chemlib:ammonium', 'chemlib:argon',
  'chemlib:butane', 'chemlib:carbon_dioxide', 'chemlib:carbon_monoxide',
  'chemlib:chlorine', 'chemlib:ethane', 'chemlib:ethylene', 'chemlib:fluorine',
  'chemlib:helium', 'chemlib:hexane', 'chemlib:hydrogen', 'chemlib:hydrogen_sulfide',
  'chemlib:krypton', 'chemlib:methane', 'chemlib:neon', 'chemlib:nitric_oxide',
  'chemlib:nitrogen', 'chemlib:nitrogen_dioxide', 'chemlib:oxygen',
  'chemlib:pentane', 'chemlib:propane', 'chemlib:radon',
  'chemlib:sulfur_dioxide', 'chemlib:sulfur_trioxide', 'chemlib:xenon'
])

const ORGANIC_RE = /(apple|beef|beetroot|cactus|carrot|chicken|cod|cooked|coral|egg|fish|fruit|fungus|grass|honey|kelp|leather|leaves|log|moss|mushroom|mutton|pork|potato|rabbit|root|salmon|sapling|seed|sponge|starch|sugar|sucrose|wood|wool|cellulose|chitin|keratin|caffeine|ethanol|methane|ethane|propane|butane|pentane|hexane|ethylene|acetylene|beta_carotene|cucurbitacin|epinephrine)/
const SILICATE_RE = /(amethyst|andesite|basalt|blackstone|clay|concrete|deepslate|diorite|glass|granite|quartz|sand|silicon|stone|terracotta|tuff|beryl|mullite|kaolinite)/

function jarList(prefix) {
  return execFileSync('jar', ['tf', jar], { encoding: 'utf8' })
    .split('\n')
    .filter(line => line.startsWith(prefix) && line.endsWith('.json'))
}

function readJarJson(file) {
  return JSON.parse(execFileSync('unzip', ['-p', jar, file], { encoding: 'utf8' }))
}

function recipeList(top) {
  if (top.type === 'forge:conditional') return (top.recipes || []).map(row => row.recipe).filter(Boolean)
  return [top]
}

function basenameId(file) {
  return file
    .replace(/^data\/alchemistry\/recipes\/dissolver\//, '')
    .replace(/\.json$/, '')
    .replace(/\//g, '_')
}

function textFor(recipe) {
  const parts = [JSON.stringify(recipe.input?.ingredient || {})]
  for (const group of recipe.output?.groups || []) {
    for (const result of group.results || []) parts.push(result.item || '')
  }
  return parts.join(' ').toLowerCase()
}

function containsAny(text, set) {
  for (const key of set) if (text.includes(key)) return true
  return false
}

function chooseAcid(recipe) {
  const text = textFor(recipe)
  if (/acetic_acid|acetyl/.test(text)) return 'acetic'
  if (/sulfuric_acid/.test(text)) return 'sulfuric'
  if (/hydrochloric_acid/.test(text)) return 'hydrochloric'
  if (/nitric_acid/.test(text)) return 'nitric'
  if (/phosphoric_acid/.test(text)) return 'phosphoric'
  if (/phosphate|phosphorus|phosphoric|hydroxylapatite|bone/.test(text)) return 'phosphoric'
  if (/nitrate|nitric|nitrogen|redstone|oxidized/.test(text)) return 'nitric'
  if (/chloride|chlorine|hydrochloric|halite/.test(text)) return 'hydrochloric'
  if (/sulfate|sulfide|sulfur|sulphur|pyrite/.test(text)) return 'sulfuric'
  if (ORGANIC_RE.test(text)) return 'acetic'
  if (/carbonate|hydroxide/.test(text)) return 'hydrochloric'
  if (/oxide/.test(text)) return 'sulfuric'
  if (SILICATE_RE.test(text)) return 'hydrochloric'
  if (containsAny(text, HARD_OR_RARE)) return 'nitric'
  return 'sulfuric'
}

function chooseBall(recipe) {
  const text = textFor(recipe)
  if (containsAny(text, HARD_OR_RARE)) return 'titanium'
  if (/diamond|emerald|amethyst|beryl|quartz|silicon/.test(text)) return 'fluix'
  if (/soul|blood|flesh/.test(text)) return 'blood_infused'
  if (containsAny(text, FERROUS)) return 'iron'
  if (containsAny(text, NONFERROUS)) return 'brass'
  if (/oxide|sulfate|chloride|nitrate|carbonate|hydroxide/.test(text)) return 'steel'
  if (ORGANIC_RE.test(text)) return 'andesite'
  return 'steel'
}

function heatFor(acid) {
  return acid === 'acetic' ? null : 'heated'
}

function chanceEntries(recipe) {
  const groups = recipe.output?.groups || []
  const rolls = Number(recipe.output?.rolls || 1)
  const weighted = recipe.output?.weighted === true
  const sum = groups.reduce((acc, group) => acc + Number(group.probability || 0), 0) || 1
  const expected = new Map()

  for (const group of groups) {
    const probability = Number(group.probability || 0)
    const groupExpected = weighted
      ? rolls * probability / sum
      : rolls * Math.min(1, probability / 100)
    if (groupExpected <= 0) continue

    for (const result of group.results || []) {
      const item = result.item
      if (!item || item === 'minecraft:air') continue
      const count = Number(result.count || 1)
      expected.set(item, (expected.get(item) || 0) + count * groupExpected)
    }
  }

  const out = []
  for (const [item, amount] of [...expected.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    let remaining = amount
    while (remaining > 0) {
      const count = Math.min(64, Math.max(1, Math.ceil(Math.min(remaining, 64))))
      const chance = Math.min(1, remaining / count)
      const row = { item, count }
      if (count === 1) delete row.count
      if (chance < 0.999) row.chance = Number(Math.max(0.01, chance).toFixed(4))
      out.push(row)
      remaining -= count
    }
  }
  return out
}

const entries = []
for (const file of jarList('data/alchemistry/recipes/dissolver/')) {
  const top = readJarJson(file)
  for (const recipe of recipeList(top)) {
    if (recipe.type !== 'alchemistry:dissolver') continue
    const input = recipe.input?.ingredient
    if (!input || (!input.item && !input.tag)) continue
    if (input.item && GAS_ITEM_INPUTS.has(input.item)) continue
    const results = chanceEntries(recipe)
    if (!results.length) continue
    entries.push({
      id: basenameId(file),
      input,
      acid: chooseAcid(recipe),
      ball: chooseBall(recipe),
      heat: heatFor(chooseAcid(recipe)),
      processingTime: 180 + Math.min(180, results.length * 12),
      results
    })
  }
}

entries.sort((a, b) => a.id.localeCompare(b.id))
fs.mkdirSync(path.dirname(out), { recursive: true })
fs.writeFileSync(out, JSON.stringify({
  generatedFrom: path.basename(jar),
  source: 'Alchemistry dissolver recipes ported to Create mixer + ChemLib acid + grinding ball routes.',
  recipeCount: entries.length,
  recipes: entries
}, null, 2) + '\n')

console.log(`wrote ${path.relative(repo, out)} (${entries.length} recipes)`)
