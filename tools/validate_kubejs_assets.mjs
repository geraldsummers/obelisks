#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const repo = process.cwd()
const assetsDir = path.join(repo, 'kubejs/assets/kubejs')
const itemModelDir = path.join(assetsDir, 'models/item')
const blockModelDir = path.join(assetsDir, 'models/block')
const blockstateDir = path.join(assetsDir, 'blockstates')
const itemTextureDir = path.join(assetsDir, 'textures/item')
const blockTextureDir = path.join(assetsDir, 'textures/block')
const progressionRegistryPath = path.join(repo, 'kubejs/startup_scripts/10_items_blocks/30_progression_items.js')
const cataloguePath = path.join(repo, 'kubejs/startup_scripts/00_globals/20_progression_catalogues.js')

const failures = []
function fail(message) { failures.push(message) }
function read(file) { return fs.readFileSync(file, 'utf8') }
function exists(file) { return fs.existsSync(file) && fs.statSync(file).size > 0 }
function rel(file) { return path.relative(repo, file) }
function readJson(file) { return JSON.parse(read(file)) }
function walk(dir, predicate, out = []) {
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(file, predicate, out)
    else if (!predicate || predicate(file)) out.push(file)
  }
  return out
}
function unique(values) { return [...new Set(values)] }

function parseProgressionItemIds() {
  if (!exists(progressionRegistryPath)) return []
  const text = read(progressionRegistryPath)
  const ids = []
  for (const match of text.matchAll(/\[\s*'([a-z0-9_]+)'\s*,\s*'[^']+'(?:\s*,\s*\d+)?\s*\]/g)) ids.push(match[1])
  for (const match of text.matchAll(/event\.create\('([a-z0-9_]+)'\)\.displayName/g)) ids.push(match[1])
  return unique(ids).filter(id => id !== 'phosphoric_acid_fluid')
}

function parseCasingIds() {
  if (!exists(cataloguePath)) return []
  const text = read(cataloguePath)
  return unique([...text.matchAll(/item:\s*'kubejs:([^']+)'/g)].map(match => match[1]))
}

function texturePath(textureRef) {
  const [namespace, rest] = textureRef.includes(':') ? textureRef.split(':') : ['minecraft', textureRef]
  if (namespace !== 'kubejs') return null
  if (rest.startsWith('item/')) return path.join(itemTextureDir, `${rest.substring('item/'.length)}.png`)
  if (rest.startsWith('block/')) return path.join(blockTextureDir, `${rest.substring('block/'.length)}.png`)
  return null
}

function modelParentPath(parentRef) {
  const [namespace, rest] = parentRef.includes(':') ? parentRef.split(':') : ['minecraft', parentRef]
  if (namespace !== 'kubejs') return null
  if (rest.startsWith('block/')) return path.join(blockModelDir, `${rest.substring('block/'.length)}.json`)
  if (rest.startsWith('item/')) return path.join(itemModelDir, `${rest.substring('item/'.length)}.json`)
  return null
}

const progressionItems = parseProgressionItemIds()
const casingIds = parseCasingIds()
const boxTierIds = Array.from({ length: 16 }, (_, index) => `box_t${String(index + 1).padStart(2, '0')}`)

for (const itemId of [...progressionItems, ...casingIds]) {
  const model = path.join(itemModelDir, `${itemId}.json`)
  if (!exists(model)) fail(`registered item missing item model: kubejs:${itemId}`)
}

for (const casingId of casingIds) {
  const blockstate = path.join(blockstateDir, `${casingId}.json`)
  const blockModel = path.join(blockModelDir, `${casingId}.json`)
  const itemModel = path.join(itemModelDir, `${casingId}.json`)
  if (!exists(blockstate)) fail(`casing missing blockstate: kubejs:${casingId}`)
  if (!exists(blockModel)) fail(`casing missing block model: kubejs:${casingId}`)
  if (!exists(itemModel)) fail(`casing missing item model: kubejs:${casingId}`)
  for (const face of ['front', 'back', 'side', 'top', 'bottom']) {
    if (!exists(path.join(blockTextureDir, `${casingId}_${face}.png`))) {
      fail(`casing missing ${face} texture: kubejs:${casingId}`)
    }
  }
}

for (const boxId of boxTierIds) {
  const blockModel = path.join(blockModelDir, `${boxId}.json`)
  const itemModel = path.join(itemModelDir, `${boxId}.json`)
  if (!exists(blockModel)) fail(`crate tier missing block model: kubejs:${boxId}`)
  if (!exists(itemModel)) fail(`crate tier missing item model: kubejs:${boxId}`)
  for (const face of ['front', 'back', 'side', 'top', 'bottom']) {
    if (!exists(path.join(blockTextureDir, `${boxId}_${face}.png`))) {
      fail(`crate tier missing ${face} texture: kubejs:${boxId}`)
    }
  }
}

const modelFiles = [
  ...walk(itemModelDir, file => file.endsWith('.json')),
  ...walk(blockModelDir, file => file.endsWith('.json'))
]
for (const modelFile of modelFiles) {
  let model
  try {
    model = readJson(modelFile)
  } catch (error) {
    fail(`model JSON does not parse: ${rel(modelFile)}: ${error.message}`)
    continue
  }
  if (typeof model.parent === 'string') {
    const parentPath = modelParentPath(model.parent)
    if (parentPath && !exists(parentPath)) fail(`model parent missing: ${rel(modelFile)} -> ${model.parent}`)
  }
  if (model.textures && typeof model.textures === 'object') {
    for (const textureRef of Object.values(model.textures)) {
      if (typeof textureRef !== 'string') continue
      const expectedTexture = texturePath(textureRef)
      if (expectedTexture && !exists(expectedTexture)) fail(`model texture missing: ${rel(modelFile)} -> ${textureRef}`)
    }
  }
}

for (const stale of [
  'ae2_machine_casing',
  'oc2r_machine_casing',
  'power_grid_machine_casing'
]) {
  for (const assetRoot of [blockstateDir, blockModelDir, itemModelDir, blockTextureDir]) {
    const staleHits = walk(assetRoot, file => path.basename(file).startsWith(stale))
    for (const hit of staleHits) fail(`stale renamed casing asset remains: ${rel(hit)}`)
  }
}

if (failures.length) {
  console.error(failures.map(f => `FAIL - ${f}`).join('\n'))
  process.exit(1)
}

console.log(`ok - kubejs assets validate (${progressionItems.length} custom items, ${casingIds.length} casings, ${boxTierIds.length} crate tiers, ${modelFiles.length} models)`)
