#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const repo = process.cwd()
const matrixPath = path.join(repo, 'kubejs/server_scripts/40_recipe_add/55_realistic_ores_identity_outputs.js')
const tagPath = path.join(repo, 'kubejs/server_scripts/10_tags/60_realistic_ores_deposit_tags.js')
const startupPath = path.join(repo, 'kubejs/startup_scripts/10_items_blocks/30_progression_items.js')
const questGeneratorPath = path.join(repo, 'tools/generate_expert_quest_book.mjs')
const shaderBlockPropertiesPath = path.join(repo, 'shaderpacks/ComplementaryReimagined_r5.7.1/shaders/block.properties')
const modelDir = path.join(repo, 'kubejs/assets/kubejs/models/item')
const textureDir = path.join(repo, 'kubejs/assets/kubejs/textures/item')

const failures = []
function fail(message) { failures.push(message) }
function read(file) { return fs.readFileSync(file, 'utf8') }
function walk(dir, predicate, out = []) {
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(file, predicate, out)
    else if (!predicate || predicate(file)) out.push(file)
  }
  return out
}
function section(text, name) {
  const start = text.indexOf(`var ${name} = [`)
  if (start < 0) return ''
  const bodyStart = text.indexOf('[', start)
  const end = text.indexOf('\n]', bodyStart)
  return end < 0 ? '' : text.slice(bodyStart + 1, end)
}
function idsFrom(sectionText) {
  return [...sectionText.matchAll(/\{\s*id: '([^']+)'/g)].map(m => m[1])
}
function mapKeysFrom(text, varName) {
  const start = text.indexOf(`var ${varName} = {`)
  if (start < 0) return []
  const bodyStart = text.indexOf('{', start)
  const end = text.indexOf('\n}', bodyStart)
  if (end < 0) return []
  return [...text.slice(bodyStart + 1, end).matchAll(/^\s*([a-z0-9_]+):/gm)].map(m => m[1])
}
function hasFile(file) { return fs.existsSync(file) && fs.statSync(file).size > 0 }

if (!fs.existsSync(matrixPath)) fail(`missing ${path.relative(repo, matrixPath)}`)
else {
  const text = read(matrixPath)
  const solventSection = section(text, 'BTM_RO_SOLVENTS')
  const ballSection = section(text, 'BTM_RO_BALLS')
  const depositSection = section(text, 'BTM_RO_DEPOSITS')
  const retentionSection = text.match(/var BTM_RO_RETENTION = \{([\s\S]*?)\n\}/)?.[1] || ''

  const solvents = idsFrom(solventSection)
  const balls = idsFrom(ballSection)
  const deposits = idsFrom(depositSection)
  const depositObjects = [...depositSection.matchAll(/\{\s*\n?([\s\S]*?)\n\s*\}/g)].map(m => m[1])

  if (solvents.length !== 6) fail(`expected 6 solvents, found ${solvents.length}: ${solvents.join(', ')}`)
  if (balls.length !== 8) fail(`expected 8 balls, found ${balls.length}: ${balls.join(', ')}`)
  if (deposits.length !== 21) fail(`expected 21 deposits, found ${deposits.length}`)
  if (fs.existsSync(tagPath)) {
    const tagDeposits = mapKeysFrom(read(tagPath), 'BTM_DEPOSIT_SOURCE_BLOCKS')
    const missingFromMatrix = tagDeposits.filter(id => !deposits.includes(id))
    const extraInMatrix = deposits.filter(id => !tagDeposits.includes(id))
    if (missingFromMatrix.length) fail(`deposit tag catalog missing from matrix: ${missingFromMatrix.join(', ')}`)
    if (extraInMatrix.length) fail(`matrix deposits not in tag catalog: ${extraInMatrix.join(', ')}`)
  }

  for (const solvent of solvents) {
    if (!retentionSection.includes(`${solvent}: {`)) fail(`missing retention row for ${solvent}`)
    for (const ball of balls) {
      const row = retentionSection.match(new RegExp(`${solvent}: \\{([^}]+)\\}`))?.[1] || ''
      if (!row.includes(`${ball}:`)) fail(`missing retention chance for ${solvent}/${ball}`)
    }
  }

  for (const solvent of solvents) {
    if (!depositSection.includes(`${solvent}:`)) fail(`deposit matrix does not mention solvent output key ${solvent}`)
  }
  for (const objectText of depositObjects) {
    const id = objectText.match(/id: '([^']+)'/)?.[1] || 'UNKNOWN'
    const solventOutputs = solvents.map(solvent => objectText.match(new RegExp(`${solvent}: '([^']+)'`))?.[1] || '')
    const missingSolventOutputs = solvents.filter((solvent, i) => !solventOutputs[i])
    if (missingSolventOutputs.length) fail(`${id} missing solvent outputs: ${missingSolventOutputs.join(', ')}`)
    const distinctSolventOutputs = new Set(solventOutputs.filter(Boolean))
    if (distinctSolventOutputs.size < 5) fail(`${id} has weak acid identity spread: ${distinctSolventOutputs.size} distinct solvent outputs`)
    for (const key of ['ferrous', 'nonferrous', 'hard', 'rare', 'blood', 'ae', 'gangue', 'trace']) {
      if (!objectText.includes(`${key}:`)) fail(`${id} missing ball-bias output key ${key}`)
    }
  }

  if (/kubejs:[^']+/.test(depositSection)) fail('deposit matrix contains kubejs direct output')
  if (/chemlib:[a-z0-9_]+_fluid/.test(text)) fail('Chemlib fluid IDs should use registry IDs like chemlib:ethanol, not *_fluid aliases')
  if (!text.includes('for (var d = 0; d < BTM_RO_DEPOSITS.length; d++)')) fail('missing deposit loop for matrix recipe generation')
  if (!text.includes('for (var s = 0; s < BTM_RO_SOLVENTS.length; s++)')) fail('missing solvent loop for matrix recipe generation')
  if (!text.includes('for (var b = 0; b < BTM_RO_BALLS.length; b++)')) fail('missing ball loop for matrix recipe generation')
  if (!text.includes("id('kubejs:realistic_ores/acid_ball/' + dep.id + '/' + solvent.id + '/' + ball.id)")) fail('matrix recipe IDs are not deposit/solvent/ball-specific')
}

const acidVatScript = path.join(repo, 'kubejs/server_scripts/40_recipe_add/60_acid_vat_deposit_slurries.js')
if (fs.existsSync(acidVatScript)) fail('retired Acid Vat deposit slurry script still exists')
const kubejsFiles = walk(path.join(repo, 'kubejs'), file => file.endsWith('.js'))
for (const fullPath of kubejsFiles) {
  if (read(fullPath).includes('acid_vat:')) fail(`retired acid_vat reference in ${path.relative(repo, fullPath)}`)
}
if (fs.existsSync(questGeneratorPath)) {
  const questGeneratorText = read(questGeneratorPath)
  if (questGeneratorText.includes('acid_vat:')) fail('quest generator still references retired acid_vat IDs')
  for (const stale of ['kubejs:power_grid_machine_casing', 'kubejs:oc2r_machine_casing', 'kubejs:ae2_machine_casing']) {
    if (questGeneratorText.includes(stale)) fail(`quest generator still references stale casing ID ${stale}`)
  }
}
if (fs.existsSync(shaderBlockPropertiesPath)) {
  const shaderText = read(shaderBlockPropertiesPath)
  const shaderSpecialLine = shaderText.match(/^block\.20000=.*$/m)?.[0] || ''
  for (const stale of ['kubejs:power_grid_machine_casing', 'kubejs:oc2r_machine_casing', 'kubejs:ae2_machine_casing']) {
    if (shaderSpecialLine.includes(stale)) fail(`shader special block list still references stale casing ID ${stale}`)
  }
  for (const current of ['kubejs:electrical_machine_casing', 'kubejs:circuited_machine_casing', 'kubejs:raw_impossible_casing', 'kubejs:impossible_machine_casing']) {
    if (!shaderSpecialLine.includes(current)) fail(`shader special block list missing current casing ID ${current}`)
  }
}

for (const staleAsset of [
  'kubejs/assets/kubejs/blockstates/ae2_machine_casing.json',
  'kubejs/assets/kubejs/blockstates/oc2r_machine_casing.json',
  'kubejs/assets/kubejs/blockstates/power_grid_machine_casing.json',
  'kubejs/assets/kubejs/models/block/ae2_machine_casing.json',
  'kubejs/assets/kubejs/models/block/oc2r_machine_casing.json',
  'kubejs/assets/kubejs/models/block/power_grid_machine_casing.json',
  'kubejs/assets/kubejs/models/item/ae2_machine_casing.json',
  'kubejs/assets/kubejs/models/item/oc2r_machine_casing.json',
  'kubejs/assets/kubejs/models/item/power_grid_machine_casing.json'
]) {
  if (fs.existsSync(path.join(repo, staleAsset))) fail(`stale renamed casing asset remains: ${staleAsset}`)
}

if (!fs.existsSync(startupPath) || !read(startupPath).includes("event.create('phosphoric_acid_fluid')")) {
  fail('missing kubejs phosphoric acid fluid registration')
}

const ballIds = [
  'andesite_grinding_ball',
  'iron_grinding_ball',
  'brass_grinding_ball',
  'steel_grinding_ball',
  'nickel_grinding_ball',
  'titanium_grinding_ball',
  'blood_infused_grinding_ball',
  'fluix_grinding_ball'
]

for (const id of ballIds) {
  const model = path.join(modelDir, `${id}.json`)
  const texture = path.join(textureDir, `${id}.png`)
  if (!hasFile(model)) fail(`missing model for ${id}`)
  else if (!read(model).includes(`kubejs:item/${id}`)) fail(`model for ${id} does not use dedicated kubejs texture`)
  if (!hasFile(texture)) fail(`missing texture for ${id}`)
}

if (failures.length) {
  console.error(failures.map(f => `FAIL - ${f}`).join('\n'))
  process.exit(1)
}

console.log('ok - chemistry identity matrix validates')
