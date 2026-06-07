#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'

const repo = process.cwd()
const failures = []
const passes = []

function full(relPath) { return path.join(repo, relPath) }
function exists(relPath) { return fs.existsSync(full(relPath)) }
function read(relPath) { return fs.readFileSync(full(relPath), 'utf8') }
function readJson(relPath) { return JSON.parse(read(relPath)) }
function ok(name, detail = '') {
  passes.push({ name, detail })
  console.log(`ok - ${name}${detail ? ` (${detail})` : ''}`)
}
function fail(name, detail) {
  failures.push({ name, detail })
  console.error(`FAIL - ${name}: ${detail}`)
}
function walk(relRoot, pred = () => true, out = []) {
  if (!exists(relRoot)) return out
  for (const entry of fs.readdirSync(full(relRoot), { withFileTypes: true })) {
    const relFile = path.join(relRoot, entry.name).replaceAll(path.sep, '/')
    if (entry.isDirectory()) walk(relFile, pred, out)
    else if (pred(relFile)) out.push(relFile)
  }
  return out
}
function unique(values) {
  return [...new Set(values.filter(Boolean))]
}
function itemNeedle(item) {
  return String(item).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
function containsItem(text, item) {
  return new RegExp(`(^|[^a-zA-Z0-9_:/.-])${itemNeedle(item)}([^a-zA-Z0-9_:/.-]|$)`).test(text)
}
function arrayEq(a, b) {
  return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((value, index) => value === b[index])
}

function sourceSurfaceText(files) {
  return files.filter(exists).map(file => `${file}\n${read(file)}`).join('\n')
}

function villagerBuyResultItems() {
  const file = 'kubejs/server_scripts/35_villager_trades/10_coin_villager_trades.js'
  if (!exists(file)) return new Set()
  const text = read(file)
  const context = { console: { warn() {}, info() {} } }
  vm.createContext(context)
  vm.runInContext(text, context, { filename: file, timeout: 1000 })

  const items = []
  function add(item) { if (typeof item === 'string' && item.includes(':')) items.push(item) }
  for (const row of context.BTM_30_ITEMS || []) add(row[0])
  for (const table of ['BTM_INDUSTRIAL_IRON_MARKET', 'BTM_GOLD_MARKET', 'BTM_PLATINUM_MARKET', 'BTM_WANDERER_MARKET']) {
    for (const row of context[table] || []) add(row[3])
  }
  for (const match of text.matchAll(/btmTrade\([^,]+,\s*[^,]+,\s*[^,]+,\s*[^,]+,\s*[^,]+,\s*['"]([^'"]+:[^'"]+)['"]/g)) {
    add(match[1])
  }
  return new Set(items)
}

function validateSourceAssertions(milestones) {
  const problems = []
  let assertionCount = 0
  for (const milestone of milestones) {
    for (const assertion of milestone.sourceAssertions || []) {
      assertionCount++
      if (!assertion.file || !exists(assertion.file)) {
        problems.push(`${milestone.id}: missing source assertion file ${assertion.file || '<missing>'}`)
        continue
      }
      const text = read(assertion.file)
      const missingAll = (assertion.all || []).filter(needle => !text.includes(needle))
      const missingAny = (assertion.any || []).length && !(assertion.any || []).some(needle => text.includes(needle))
      const presentAbsent = (assertion.absent || []).filter(needle => text.includes(needle))
      if (missingAll.length) problems.push(`${milestone.id}: ${assertion.file} missing ${missingAll.join(', ')}`)
      if (missingAny) problems.push(`${milestone.id}: ${assertion.file} lacks any of ${assertion.any.join(', ')}`)
      if (presentAbsent.length) problems.push(`${milestone.id}: ${assertion.file} contains forbidden ${presentAbsent.join(', ')}`)
    }
  }
  problems.length
    ? fail('player progression source assertions hold', problems.slice(0, 80).join('\n'))
    : ok('player progression source assertions hold', `${assertionCount} assertions`)
}

function validateBypassSurfaces(manifest) {
  const forbidden = manifest.forbiddenBypassOutputs || []
  const surfaces = manifest.forbiddenBypassSurfaces || []
  const problems = []

  if (surfaces.includes('starting_options')) {
    const files = ['config/classselector/embark.json', 'config/classselector/kits.json'].filter(exists)
    const text = sourceSurfaceText(files)
    for (const item of forbidden) if (containsItem(text, item)) problems.push(`starting_options -> ${item}`)
  }

  if (surfaces.includes('repo_loot')) {
    const files = walk('kubejs/data', file => file.includes('/loot_tables/') && file.endsWith('.json'))
    for (const file of files) {
      const text = read(file)
      for (const item of forbidden) if (containsItem(text, item)) problems.push(`${file} -> ${item}`)
    }
  }

  if (surfaces.includes('wares_loot')) {
    const files = walk('kubejs/data/wares/loot_tables', file => file.endsWith('.json'))
    for (const file of files) {
      const text = read(file)
      for (const item of forbidden) if (containsItem(text, item)) problems.push(`${file} -> ${item}`)
    }
  }

  if (surfaces.includes('generated_quest_rewards')) {
    const files = walk('generated/ftbquests', file => file.endsWith('.snbt') || file.endsWith('.json'))
    for (const file of files) {
      const text = read(file)
      const rewardSections = [...text.matchAll(/rewards:\s*\[([\s\S]*?)\]\s*(?:tasks:|}|$)/g)].map(match => match[1]).join('\n')
      for (const item of forbidden) if (containsItem(rewardSections, item)) problems.push(`${file} rewards -> ${item}`)
    }
  }

  if (surfaces.includes('villager_buy_results')) {
    const buys = villagerBuyResultItems()
    for (const item of forbidden) if (buys.has(item)) problems.push(`villager_buy_results -> ${item}`)
  }

  problems.length
    ? fail('future milestone outputs are absent from bypass reward surfaces', problems.slice(0, 100).join('\n'))
    : ok('future milestone outputs are absent from bypass reward surfaces', `${forbidden.length} forbidden outputs`)
}

function validateRuntimeGraphReadiness(manifest) {
  const dumpPath = 'generated/runtime-dumps/recipes.json'
  if (!exists(dumpPath)) {
    ok('effective player progression graph check is runtime-ready', 'no retained recipes.json')
    return
  }
  let dump
  try {
    dump = readJson(dumpPath)
  } catch (error) {
    fail('retained effective recipe graph parses', error.message)
    return
  }
  if (dump.schema !== 'obelisks.recipe_graph.v1') {
    ok('effective player progression graph check is runtime-ready', `retained dump schema=${dump.schema || '<missing>'}`)
    return
  }

  const produced = new Set()
  for (const recipe of dump.recipes || []) {
    for (const output of recipe.outputs || []) {
      if (output && output.kind === 'item' && output.id) produced.add(output.id)
    }
  }
  const runtimeOutputs = unique((manifest.milestones || []).flatMap(milestone => milestone.outputs || []))
    .filter(item => item.startsWith('kubejs:') || item.startsWith('create:') || item.startsWith('bloodmagic:') || item.startsWith('ae2:') || item.startsWith('compressedcreativity:'))
  const missing = runtimeOutputs.filter(item => !produced.has(item))
  const present = runtimeOutputs.length - missing.length
  if (missing.length === 0) {
    ok('retained effective recipe graph covers player progression milestone outputs', `${runtimeOutputs.length} outputs`)
  } else {
    ok('effective player progression graph check is runtime-ready', `${present}/${runtimeOutputs.length} retained outputs; refresh a strict runtime dump for hard route reachability`)
  }
}

let manifest
try {
  manifest = readJson('kubejs/config/player_progression_regression.json')
  manifest.schema === 'btm.player_progression_regression.v1'
    ? ok('player progression regression manifest parses', manifest.schema)
    : fail('player progression regression manifest schema is current', manifest.schema || '<missing>')
} catch (error) {
  fail('player progression regression manifest parses', error.message)
  manifest = { milestones: [] }
}

let catalog
try {
  catalog = readJson('kubejs/config/btm_expert_graph_catalog.json')
  ok('expert graph catalog parses for player progression contracts', `${catalog.tierOrder.length} tiers`)
} catch (error) {
  fail('expert graph catalog parses for player progression contracts', error.message)
  catalog = { tierOrder: [], machineTiers: [] }
}

const milestones = manifest.milestones || []
const milestoneIds = milestones.map(milestone => milestone.id)
const duplicateMilestones = milestoneIds.filter((id, index) => milestoneIds.indexOf(id) !== index)
duplicateMilestones.length
  ? fail('player progression milestone IDs are unique', unique(duplicateMilestones).join(', '))
  : ok('player progression milestone IDs are unique', `${milestoneIds.length} milestones`)

arrayEq(manifest.expectedTierOrder, catalog.tierOrder)
  ? ok('player progression manifest tier order matches expert catalog', `${catalog.tierOrder.length} tiers`)
  : fail('player progression manifest tier order matches expert catalog', `${JSON.stringify(manifest.expectedTierOrder)} != ${JSON.stringify(catalog.tierOrder)}`)

const tierSet = new Set(catalog.tierOrder || [])
const unknownTiers = milestones.filter(milestone => !tierSet.has(milestone.tier)).map(milestone => `${milestone.id}:${milestone.tier}`)
unknownTiers.length
  ? fail('player progression milestone tiers are catalog tiers', unknownTiers.join(', '))
  : ok('player progression milestone tiers are catalog tiers')

const idSet = new Set(milestoneIds)
const missingPrevious = milestones
  .filter(milestone => milestone.requiresPrevious && !idSet.has(milestone.requiresPrevious))
  .map(milestone => `${milestone.id}->${milestone.requiresPrevious}`)
missingPrevious.length
  ? fail('player progression milestone predecessor refs resolve', missingPrevious.join(', '))
  : ok('player progression milestone predecessor refs resolve')

const machineMilestones = milestones.filter(milestone => (milestone.outputs || []).some(output => output.startsWith('kubejs:') && output.endsWith('_casing')))
const manifestCasings = machineMilestones.flatMap(milestone => milestone.outputs || []).filter(output => output.startsWith('kubejs:') && output.endsWith('_casing'))
const catalogCasings = (catalog.machineTiers || []).map(tier => tier.casing)
arrayEq(manifestCasings, catalogCasings)
  ? ok('player progression machine milestones mirror casing catalog', `${manifestCasings.length} casings`)
  : fail('player progression machine milestones mirror casing catalog', `${JSON.stringify(manifestCasings)} != ${JSON.stringify(catalogCasings)}`)

const sparseMilestones = milestones.filter(milestone => !(milestone.outputs || []).length || !(milestone.route || []).length || !(milestone.sourceAssertions || []).length).map(milestone => milestone.id)
sparseMilestones.length
  ? fail('player progression milestones carry outputs, route notes, and source assertions', sparseMilestones.join(', '))
  : ok('player progression milestones carry outputs, route notes, and source assertions')

validateSourceAssertions(milestones)
validateBypassSurfaces(manifest)
validateRuntimeGraphReadiness(manifest)

console.log(`\nplayer progression contract validators: ${passes.length} pass(es), ${failures.length} hard failure(s)`)
if (failures.length) process.exit(1)
