#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const repo = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const auditPath = path.join(repo, 'generated/runtime-dumps/realistic_hands_audit.json')
const outPath = path.join(repo, 'config/rbp/block_definitions/generated_pack_solid_blocks.toml')
const reportPath = path.join(repo, 'generated/validation/rbp_pack_solid_blocks.json')

const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8'))
const groups = audit.blocks || {}
const groupById = new Map()
for (const [group, ids] of Object.entries(groups)) {
  for (const id of ids || []) {
    if (!groupById.has(id)) groupById.set(id, new Set())
    groupById.get(id).add(group)
  }
}
for (const id of audit.unassignedBreakableBlocks || []) {
  if (!groupById.has(id)) groupById.set(id, new Set())
  groupById.get(id).add('unassigned')
}

const rbpDir = path.join(repo, 'config/rbp/block_definitions')
for (const file of fs.readdirSync(rbpDir).filter(name => name.endsWith('.toml') && name !== path.basename(outPath))) {
  const text = fs.readFileSync(path.join(rbpDir, file), 'utf8')
  for (const match of text.matchAll(/"([a-z0-9_.-]+:[a-z0-9_/.-]+)"/g)) {
    const id = match[1]
    if (!groupById.has(id)) groupById.set(id, new Set())
    groupById.get(id).add('existing_rbp')
  }
}

function idPath(id) {
  return id.includes(':') ? id.split(':')[1] : id
}

function namespace(id) {
  return id.includes(':') ? id.split(':')[0] : 'minecraft'
}

function hasAny(pathPart, terms) {
  return terms.some(term => pathPart.includes(term))
}

function endsAny(pathPart, suffixes) {
  return suffixes.some(suffix => pathPart.endsWith(suffix))
}

function startsAny(pathPart, prefixes) {
  return prefixes.some(prefix => pathPart.startsWith(prefix))
}

function isAdminOrVirtual(id) {
  const p = idPath(id)
  return id === 'minecraft:bedrock' ||
    /(^|_)bedrock($|_)/.test(p) ||
    hasAny(p, [
      'barrier',
      'command_block',
      'structure_block',
      'structure_void',
      'jigsaw',
      'debug',
      'fake_air',
      'intangible_air',
      'temporary_block',
      'temporary_light_block',
      'light_block',
      'air_block'
    ]) ||
    endsAny(p, ['_portal', '_portal_frame', 'end_portal', 'end_gateway'])
}

function isPlantOrFluidLike(id) {
  const p = idPath(id)
  if (endsAny(p, ['_grass_block', '_dirt', '_clay', '_mud', '_silt', '_soil', '_farmland', '_nylium'])) return false
  if (endsAny(p, ['_leaves', '_leaf']) || hasAny(p, ['leaves'])) return false
  if (endsAny(p, ['_mushroom_block']) || p === 'mushroom_stem') return false
  return hasAny(p, [
    'potted_',
    'sapling',
    'seedling',
    'crop',
    'stem',
    'flower',
    'floret',
    'blossom',
    'bloom',
    'bush',
    'shrub',
    'sprout',
    'root',
    'vine',
    'vines',
    'reed',
    'cactus',
    'kelp',
    'seagrass',
    'sea_pickle',
    'lily_pad',
    'water_lily',
    'lichen',
    'coral_fan',
    'wall_coral',
    'fire',
    'flame',
    'water',
    'lava',
    'fluid',
    'liquid'
  ]) || endsAny(p, [
    '_grass',
    '_fern',
    '_roots',
    '_fungus',
    '_mushroom',
    '_petals'
  ])
}

function isAttachedOrThin(id) {
  const p = idPath(id)
  if (p === 'jack_o_lantern' || p === 'sea_lantern') return false
  if (endsAny(p, ['_glass', '_glass_pane']) || hasAny(p, ['glass_pane'])) return false
  if (endsAny(p, ['_bars', '_chain', '_fence', '_fence_gate', '_wall', '_slab', '_stairs', '_trapdoor'])) return false
  return hasAny(p, [
    'carpet',
    'rug',
    'mat',
    'table_cloth',
    'torch',
    'sconce',
    'candle',
    'lantern',
    'ladder',
    'sign',
    'banner',
    'skull',
    'head',
    'flower_pot',
    'tripwire',
    'string',
    'redstone_wire',
    'repeater',
    'comparator',
    'lever',
    'button',
    'pressure_plate',
    'rail',
    'track',
    'cable',
    'wire',
    'paint',
    'bud',
    'cluster',
    'conduit',
    'end_rod',
    'lightning_rod',
    'bell'
  ])
}

function isKnownSupportOwned(id) {
  const p = idPath(id)
  if (endsAny(p, ['_trapdoor', '_fence_gate'])) return false
  return endsAny(p, ['_door', '_bed']) ||
    hasAny(p, [
      'brewing_stand',
      'grindstone',
      'lectern',
      'stonecutter',
      'campfire',
      'daylight_detector',
      'wall_',
      'hanging_'
    ])
}

function isProtectedStructureBlock(id) {
  const p = idPath(id)
  return namespace(id) === 'aether' && hasAny(p, [
    'locked_',
    'trapped_',
    'boss_doorway',
    'treasure_doorway'
  ])
}

function isDynamicTreesManaged(id) {
  const ns = namespace(id)
  return ns === 'dynamictrees' ||
    ns === 'dynamictreesplus' ||
    ns === 'btmdimtrees' ||
    ns.startsWith('dt')
}

function isSolidName(id) {
  const p = idPath(id)
  if (endsAny(p, ['_leaves', '_leaf']) || hasAny(p, ['leaves'])) return true
  if (endsAny(p, ['_block', '_bricks', '_brick', '_tiles', '_tile', '_stone', '_rock', '_cobble', '_cobblestone'])) return true
  if (endsAny(p, ['_slab', '_stairs', '_wall', '_fence', '_fence_gate', '_pane', '_bars', '_trapdoor'])) return true
  if (endsAny(p, ['_log', '_wood', '_planks', '_stem', '_hyphae'])) return true
  if (endsAny(p, ['_ore', '_deepslate_ore', '_deposit', '_crystal', '_glass', '_concrete', '_terracotta'])) return true
  if (endsAny(p, ['_dirt', '_grass_block', '_sand', '_gravel', '_mud', '_clay', '_soil', '_silt', '_farmland'])) return true
  return hasAny(p, [
    'casing',
    'machine',
    'controller',
    'furnace',
    'chest',
    'barrel',
    'crate',
    'vault',
    'tank',
    'altar',
    'table',
    'font',
    'workbench',
    'bookshelf',
    'lantern_block',
    'frame',
    'framed_',
    'mushroom_block',
    'pumpkin',
    'melon',
    'jack_o_lantern',
    'sea_lantern',
    'hay_block',
    'kelp_block',
    'sponge',
    'ice',
    'snow_block',
    'obsidian',
    'netherrack',
    'end_stone',
    'deepslate',
    'sculk',
    'amethyst',
    'calcite',
    'tuff',
    'basalt',
    'sandstone',
    'limestone',
    'granite',
    'diorite',
    'andesite',
    'slate',
    'shale',
    'quartz',
    'metal',
    'ingot',
    'storage'
  ])
}

function classify(id, groupsForId) {
  if (isAdminOrVirtual(id)) return { include: false, reason: 'admin_or_virtual' }
  if (isProtectedStructureBlock(id)) return { include: false, reason: 'protected_structure' }
  if (isDynamicTreesManaged(id)) return { include: false, reason: 'dynamic_trees_managed' }
  if (isPlantOrFluidLike(id)) return { include: false, reason: 'plant_or_fluid_like' }
  if (isAttachedOrThin(id)) return { include: false, reason: 'attached_or_thin' }
  if (isKnownSupportOwned(id)) return { include: false, reason: 'support_owned' }

  const groups = Array.from(groupsForId)
  if (groups.some(group => ['axe', 'pickaxe', 'shovel', 'hoe'].includes(group))) return { include: true, reason: 'mineable_solid_candidate' }
  if (groups.includes('hand') && isSolidName(id)) return { include: true, reason: 'hand_solid_candidate' }
  if (groups.includes('knife') && isSolidName(id)) return { include: true, reason: 'knife_solid_candidate' }
  if (groups.includes('sword') && isSolidName(id)) return { include: true, reason: 'sword_solid_candidate' }
  if (groups.includes('unassigned') && isSolidName(id)) return { include: true, reason: 'unassigned_solid_name' }
  if (groups.includes('existing_rbp') && isSolidName(id)) return { include: true, reason: 'existing_rbp_solid_name' }
  return { include: false, reason: 'not_solid_candidate' }
}

const included = []
const excluded = {}
const includedByReason = {}
for (const [id, groupSet] of groupById.entries()) {
  const result = classify(id, groupSet)
  if (result.include) {
    included.push(id)
    includedByReason[result.reason] = (includedByReason[result.reason] || 0) + 1
  } else {
    excluded[result.reason] = (excluded[result.reason] || 0) + 1
  }
}
included.sort()

const header = [
  '# Generated by tools/generate_rbp_pack_solid_blocks.mjs.',
  '# Source: generated/runtime-dumps/realistic_hands_audit.json.',
  '# Policy: explicit RBP coverage for pack solid/collision-like blocks; bedrock, Dynamic Trees-managed blocks, virtual/control, plant/fluid, attached/thin, and support-owned blocks stay excluded.',
  ''
]

const body = [
  'Blocks = [',
  ...included.map((id, index) => `\t"${id}"${index === included.length - 1 ? '' : ','}`),
  ']',
  '',
  '[Physics]',
  '\tSupportStrength = 88020',
  '\tBeamStrength = 0.45',
  '\tMass = 1200.0',
  '\tCanHang = true',
  '\tCanAttach = true',
  '\tCanAttachDiagonally = false',
  '\tSlideChance = 0.45',
  '\tPlacementSlideModifier = 0.0',
  '\tEntityDamageScale = 1.0',
  '\tBreaksOnFalling = false',
  '\tStrength = 782400',
  '\tFloatsOnLiquid = false',
  '',
  '\t[Physics.ExtendedCollisionBounds]',
  '\t\tUp = false',
  '\t\tDown = false',
  '\t\tNorth = false',
  '\t\tEast = false',
  '\t\tSouth = false',
  '\t\tWest = false',
  '',
  '[ChunkAnalysis]',
  '\tEnabled = true',
  ''
]

fs.writeFileSync(outPath, header.concat(body).join('\n'))
fs.mkdirSync(path.dirname(reportPath), { recursive: true })
fs.writeFileSync(reportPath, JSON.stringify({
  schema: 'btm.rbp_pack_solid_blocks.v1',
  source: path.relative(repo, auditPath),
  output: path.relative(repo, outPath),
  runtimeBlockCount: groupById.size,
  includedCount: included.length,
  includedByReason,
  excludedByReason: excluded,
  bedrockIncluded: included.includes('minecraft:bedrock'),
  sampleIncluded: included.slice(0, 50)
}, null, 2) + '\n')

console.log(`generated ${included.length} RBP solid-block IDs from ${groupById.size} runtime block IDs`)
console.log(`wrote ${path.relative(repo, outPath)}`)
console.log(`wrote ${path.relative(repo, reportPath)}`)
