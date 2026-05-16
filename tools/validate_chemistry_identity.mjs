#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const repo = process.cwd()
const matrixPath = path.join(repo, 'kubejs/server_scripts/40_recipe_add/55_realistic_ores_identity_outputs.js')
const startupPath = path.join(repo, 'kubejs/startup_scripts/10_items_blocks/30_progression_items.js')
const modelDir = path.join(repo, 'kubejs/assets/kubejs/models/item')
const textureDir = path.join(repo, 'kubejs/assets/kubejs/textures/item')

const failures = []
function fail(message) { failures.push(message) }
function read(file) { return fs.readFileSync(file, 'utf8') }
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

  if (solvents.length !== 6) fail(`expected 6 solvents, found ${solvents.length}: ${solvents.join(', ')}`)
  if (balls.length !== 8) fail(`expected 8 balls, found ${balls.length}: ${balls.join(', ')}`)
  if (deposits.length !== 21) fail(`expected 21 deposits, found ${deposits.length}`)

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

  if (/kubejs:[^']+/.test(depositSection)) fail('deposit matrix contains kubejs direct output')
  if (!text.includes('for (var d = 0; d < BTM_RO_DEPOSITS.length; d++)')) fail('missing deposit loop for matrix recipe generation')
  if (!text.includes('for (var s = 0; s < BTM_RO_SOLVENTS.length; s++)')) fail('missing solvent loop for matrix recipe generation')
  if (!text.includes('for (var b = 0; b < BTM_RO_BALLS.length; b++)')) fail('missing ball loop for matrix recipe generation')
  if (!text.includes("id('kubejs:realistic_ores/acid_ball/' + dep.id + '/' + solvent.id + '/' + ball.id)")) fail('matrix recipe IDs are not deposit/solvent/ball-specific')
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
