#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const repo = process.cwd()
const inputPath = process.argv[2] || path.join(repo, 'generated/runtime-dumps/block_hardness_probe.json')
const outputJsonPath = process.argv[3] || path.join(repo, 'generated/runtime-dumps/ntp_breakability_audit.json')
const outputJsPath = process.argv[4] || path.join(repo, 'kubejs/startup_scripts/99_ntp_audit_assignments.js')
const runtimeRoot = process.argv[5] || inferRuntimeRoot(inputPath)
const outputMdPath = outputJsonPath.replace(/\.json$/i, '.md')

const blockToolTags = {
  axe: 'minecraft:mineable/axe',
  pickaxe: 'minecraft:mineable/pickaxe',
  shovel: 'minecraft:mineable/shovel',
  hoe: 'minecraft:mineable/hoe',
  sword: 'minecraft:sword_efficient'
}

const knifeBlockTags = new Set([
  'minecraft:crops',
  'minecraft:flowers',
  'minecraft:leaves',
  'minecraft:replaceable',
  'minecraft:saplings'
])

const itemToolTags = {
  knife: ['forge:tools/knives', 'forge:knives', 'c:tools/knives', 'c:knives', 'farmersdelight:tools/knives'],
  axe: ['minecraft:axes', 'forge:tools/axes', 'forge:axes'],
  pickaxe: ['minecraft:pickaxes', 'forge:tools/pickaxes', 'forge:pickaxes'],
  shovel: ['minecraft:shovels', 'forge:tools/shovels', 'forge:shovels'],
  hoe: ['minecraft:hoes', 'forge:tools/hoes', 'forge:hoes'],
  sword: ['minecraft:swords', 'forge:tools/swords', 'forge:swords']
}

const pickOnlyBlockIds = new Set([
  'unearthed:beige_limestone_grassy_regolith',
  'unearthed:conglomerate_grassy_regolith',
  'unearthed:dolomite_grassy_regolith',
  'unearthed:gabbro_grassy_regolith',
  'unearthed:granodiorite_grassy_regolith',
  'unearthed:grey_limestone_grassy_regolith',
  'unearthed:kimberlite_grassy_regolith',
  'unearthed:limestone_grassy_regolith',
  'unearthed:mudstone_grassy_regolith',
  'unearthed:overgrown_andesite',
  'unearthed:overgrown_diorite',
  'unearthed:overgrown_granite',
  'unearthed:phyllite_grassy_regolith',
  'unearthed:quartzite_grassy_regolith',
  'unearthed:rhyolite_grassy_regolith',
  'unearthed:sandstone_grassy_regolith',
  'unearthed:siltstone_grassy_regolith',
  'unearthed:slate_grassy_regolith',
  'unearthed:stone_grassy_regolith',
  'unearthed:white_granite_grassy_regolith',
  'unearthed:white_granite_regolith'
])

function inferRuntimeRoot(file) {
  const normalized = path.resolve(file)
  const marker = `${path.sep}generated${path.sep}runtime-dumps${path.sep}`
  const idx = normalized.indexOf(marker)
  return idx >= 0 ? normalized.slice(0, idx) : repo
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function ensureDir(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
}

function rel(file) {
  return path.relative(repo, file)
}

function has(tags, tag) {
  return Array.isArray(tags) && tags.includes(tag)
}

function sortUnique(values) {
  return [...new Set(values.filter(Boolean).map(String))].sort()
}

function breakableBlock(record) {
  return record && !record.missing && Number(record.defaultDestroyTime) >= 0
}

function listFiles(root, predicate) {
  if (!fs.existsSync(root)) return []
  const out = []
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const file = path.join(root, entry.name)
    if (entry.isDirectory()) out.push(...listFiles(file, predicate))
    else if (predicate(file)) out.push(file)
  }
  return out
}

function tagIdFromParts(parts, kind) {
  const dataIndex = parts.lastIndexOf('data')
  if (dataIndex < 0) return null
  const namespace = parts[dataIndex + 1]
  const tagsIndex = parts.indexOf('tags', dataIndex)
  if (!namespace || tagsIndex < 0 || parts[tagsIndex + 1] !== kind) return null
  const relParts = parts.slice(tagsIndex + 2)
  if (!relParts.length) return null
  relParts[relParts.length - 1] = relParts[relParts.length - 1].replace(/\.json$/i, '')
  return `${namespace}:${relParts.join('/')}`
}

function tagIdFromFile(file, kind) {
  return tagIdFromParts(file.split(path.sep), kind)
}

function addTagValues(map, tag, values) {
  if (!tag || !Array.isArray(values)) return
  if (!map.has(tag)) map.set(tag, [])
  map.get(tag).push(...values)
}

function parseTagJson(text) {
  const parsed = JSON.parse(text)
  if (!Array.isArray(parsed.values)) return []
  return parsed.values.map((value) => {
    if (typeof value === 'string') return value
    if (value && typeof value.id === 'string') return value.id
    return null
  }).filter(Boolean)
}

function readDirTagMaps(root, kind) {
  const map = new Map()
  for (const file of listFiles(root, (candidate) => candidate.endsWith('.json'))) {
    const tag = tagIdFromFile(file, kind)
    if (!tag) continue
    try {
      addTagValues(map, tag, parseTagJson(fs.readFileSync(file, 'utf8')))
    } catch (err) {
      console.warn(`Skipping unreadable tag file ${file}: ${err.message}`)
    }
  }
  return map
}

function zipList(file) {
  try {
    return execFileSync('zipinfo', ['-1', file], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
      .split(/\r?\n/)
      .filter(Boolean)
  } catch {
    return []
  }
}

function zipRead(file, entry) {
  return execFileSync('unzip', ['-p', file, entry], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 })
}

function readJarTagMaps(root, kind) {
  const map = new Map()
  const jars = [
    ...listFiles(path.join(root, 'mods'), (file) => file.endsWith('.jar')),
    ...listFiles(path.join(root, 'libraries'), (file) => file.endsWith('.jar'))
  ]
  const marker = `/tags/${kind}/`

  for (const jar of jars) {
    for (const entry of zipList(jar)) {
      if (!entry.startsWith('data/') || !entry.endsWith('.json') || !entry.includes(marker)) continue
      const tag = tagIdFromParts(entry.split('/'), kind)
      if (!tag) continue
      try {
        addTagValues(map, tag, parseTagJson(zipRead(jar, entry)))
      } catch (err) {
        console.warn(`Skipping unreadable tag entry ${jar}:${entry}: ${err.message}`)
      }
    }
  }

  return map
}

function mergeTagMaps(...maps) {
  const out = new Map()
  for (const map of maps) {
    for (const [tag, values] of map.entries()) addTagValues(out, tag, values)
  }
  return out
}

function resolveTagValues(map, tag, seen = new Set()) {
  if (seen.has(tag)) return []
  seen.add(tag)
  const out = []
  for (const value of map.get(tag) || []) {
    if (value.startsWith('#')) out.push(...resolveTagValues(map, value.slice(1), seen))
    else out.push(value)
  }
  return sortUnique(out)
}

function buildTagEvidence(root) {
  const blockTags = mergeTagMaps(
    readJarTagMaps(root, 'blocks'),
    readDirTagMaps(path.join(root, 'kubejs/data'), 'blocks')
  )
  const itemTags = mergeTagMaps(
    readJarTagMaps(root, 'items'),
    readDirTagMaps(path.join(root, 'kubejs/data'), 'items')
  )
  const blockEvidenceTags = sortUnique(['kubejs:hand_breakable', ...Object.values(blockToolTags), ...knifeBlockTags])
  const itemEvidenceTags = sortUnique(Object.values(itemToolTags).flat())

  return {
    runtimeRoot: rel(root),
    blockMembers: Object.fromEntries(blockEvidenceTags.map((tag) => [tag, resolveTagValues(blockTags, tag)])),
    itemMembers: Object.fromEntries(itemEvidenceTags.map((tag) => [tag, resolveTagValues(itemTags, tag)]))
  }
}

function tagEvidenceHas(evidence, tag, id, kind) {
  const members = kind === 'item' ? evidence.itemMembers : evidence.blockMembers
  return Array.isArray(members[tag]) && members[tag].includes(id)
}

function knifeBlock(record, evidence) {
  const tags = record.runtimeTags || []
  if (pickOnlyBlockIds.has(record.id)) return false
  return (record.ntpr && record.ntpr.knifeOnly === true) ||
    [...knifeBlockTags].some((tag) => has(tags, tag) || tagEvidenceHas(evidence, tag, record.id, 'block'))
}

function handBlock(record, evidence) {
  if (pickOnlyBlockIds.has(record.id)) return false
  return ((record.ntpr && record.ntpr.handBreakable === true) ||
    has(record.runtimeTags || [], 'kubejs:hand_breakable') ||
    tagEvidenceHas(evidence, 'kubejs:hand_breakable', record.id, 'block')) &&
    !knifeBlock(record, evidence)
}

function blockHasTool(record, tool, evidence) {
  if (pickOnlyBlockIds.has(record.id)) return tool === 'pickaxe'
  const tag = blockToolTags[tool]
  return has(record.runtimeTags || [], tag) || tagEvidenceHas(evidence, tag, record.id, 'block')
}

function itemHasAction(record, action) {
  return Array.isArray(record.toolActions) && record.toolActions.includes(action)
}

function itemHasTool(record, tool, evidence) {
  if (itemHasAction(record, tool)) return true
  return (itemToolTags[tool] || []).some((tag) => tagEvidenceHas(evidence, tag, record.id, 'item'))
}

function makeAssignments(dump, evidence) {
  const blocks = (dump.allBlocks && dump.allBlocks.length ? dump.allBlocks : dump.selectedBlocks || [])
    .filter(breakableBlock)
  const items = (dump.allItems || []).filter((record) => record && !record.missing)

  const out = {
    schema: 'obelisks.ntp_audit_assignments.v2',
    generatedBy: 'tools/audit_ntp_breakability.mjs',
    input: rel(inputPath),
    tagEvidenceRoot: evidence.runtimeRoot,
    runtimeProbeSchema: dump.schema || 'UNKNOWN',
    blockCount: blocks.length,
    itemCount: items.length,
    blocks: {
      hand: sortUnique(blocks.filter((record) => handBlock(record, evidence)).map((record) => record.id)),
      knife: sortUnique(blocks.filter((record) => knifeBlock(record, evidence)).map((record) => record.id)),
      axe: sortUnique(blocks.filter((record) => blockHasTool(record, 'axe', evidence) && !handBlock(record, evidence) && !knifeBlock(record, evidence)).map((record) => record.id)),
      pickaxe: sortUnique(blocks.filter((record) => blockHasTool(record, 'pickaxe', evidence) && !handBlock(record, evidence) && !knifeBlock(record, evidence)).map((record) => record.id)),
      shovel: sortUnique(blocks.filter((record) => blockHasTool(record, 'shovel', evidence) && !handBlock(record, evidence) && !knifeBlock(record, evidence)).map((record) => record.id)),
      hoe: sortUnique(blocks.filter((record) => blockHasTool(record, 'hoe', evidence) && !handBlock(record, evidence) && !knifeBlock(record, evidence)).map((record) => record.id)),
      sword: sortUnique(blocks.filter((record) => blockHasTool(record, 'sword', evidence) && !handBlock(record, evidence) && !knifeBlock(record, evidence)).map((record) => record.id))
    },
    items: {
      knife: sortUnique(items.filter((record) => itemHasTool(record, 'knife', evidence)).map((record) => record.id)),
      axe: sortUnique(items.filter((record) => itemHasTool(record, 'axe', evidence)).map((record) => record.id)),
      pickaxe: sortUnique(items.filter((record) => itemHasTool(record, 'pickaxe', evidence)).map((record) => record.id)),
      shovel: sortUnique(items.filter((record) => itemHasTool(record, 'shovel', evidence)).map((record) => record.id)),
      hoe: sortUnique(items.filter((record) => itemHasTool(record, 'hoe', evidence)).map((record) => record.id)),
      sword: sortUnique(items.filter((record) => itemHasTool(record, 'sword', evidence)).map((record) => record.id))
    }
  }

  const assignedBlocks = new Set()
  for (const values of Object.values(out.blocks)) for (const id of values) assignedBlocks.add(id)
  out.unassignedBreakableBlocks = sortUnique(blocks
    .filter((record) => !assignedBlocks.has(record.id))
    .map((record) => record.id))

  return out
}

function writeJs(assignments) {
  const payload = JSON.stringify(assignments, null, 2)
  const js = `// Generated by tools/audit_ntp_breakability.mjs from a full runtime probe.\n` +
    `// Do not hand-edit block or item membership here; rerun the audit instead.\n` +
    `global.BTM_NTPR_AUDIT_ASSIGNMENTS = ${payload}\n`
  ensureDir(outputJsPath)
  fs.writeFileSync(outputJsPath, js)
}

function writeMd(assignments) {
  const lines = [
    '# NTP Breakability Audit',
    '',
    `Input: \`${assignments.input}\``,
    `Tag evidence root: \`${assignments.tagEvidenceRoot}\``,
    `Runtime probe schema: \`${assignments.runtimeProbeSchema}\``,
    '',
    '## Totals',
    '',
    `- Breakable block records: ${assignments.blockCount}`,
    `- Item records: ${assignments.itemCount}`,
    `- Hand blocks: ${assignments.blocks.hand.length}`,
    `- Knife blocks: ${assignments.blocks.knife.length}`,
    `- Axe blocks: ${assignments.blocks.axe.length}`,
    `- Pickaxe blocks: ${assignments.blocks.pickaxe.length}`,
    `- Shovel blocks: ${assignments.blocks.shovel.length}`,
    `- Hoe blocks: ${assignments.blocks.hoe.length}`,
    `- Sword blocks: ${assignments.blocks.sword.length}`,
    `- Unassigned breakable blocks: ${assignments.unassignedBreakableBlocks.length}`,
    '',
    '## Tool Items',
    '',
    `- Knife items: ${assignments.items.knife.length}`,
    `- Axe items: ${assignments.items.axe.length}`,
    `- Pickaxe items: ${assignments.items.pickaxe.length}`,
    `- Shovel items: ${assignments.items.shovel.length}`,
    `- Hoe items: ${assignments.items.hoe.length}`,
    `- Sword items: ${assignments.items.sword.length}`,
    '',
    '## Key Blocks',
    '',
    `- minecraft:gravel hand: ${assignments.blocks.hand.includes('minecraft:gravel')}`,
    `- minecraft:stone pickaxe: ${assignments.blocks.pickaxe.includes('minecraft:stone')}`,
    `- projectvibrantjourneys:short_grass knife: ${assignments.blocks.knife.includes('projectvibrantjourneys:short_grass')}`,
    '',
    '## Unassigned Breakable Block Samples',
    '',
    ...assignments.unassignedBreakableBlocks.slice(0, 80).map((id) => `- ${id}`)
  ]
  fs.writeFileSync(outputMdPath, `${lines.join('\n')}\n`)
}

if (!fs.existsSync(inputPath)) {
  console.error(`Missing runtime probe dump: ${inputPath}`)
  console.error('Run a disposable runtime with kubejs/config/block_hardness_probe.json enabled and writeAllBlocks=true.')
  process.exit(1)
}

const dump = readJson(inputPath)
const evidence = buildTagEvidence(runtimeRoot)
const assignments = makeAssignments(dump, evidence)

ensureDir(outputJsonPath)
fs.writeFileSync(outputJsonPath, `${JSON.stringify(assignments, null, 2)}\n`)
writeJs(assignments)
writeMd(assignments)

console.log(`Wrote ${rel(outputJsonPath)}`)
console.log(`Wrote ${rel(outputJsPath)}`)
console.log(`Wrote ${rel(outputMdPath)}`)
console.log(`minecraft:gravel hand=${assignments.blocks.hand.includes('minecraft:gravel')}`)
console.log(`minecraft:stone pickaxe=${assignments.blocks.pickaxe.includes('minecraft:stone')}`)
console.log(`projectvibrantjourneys:short_grass knife=${assignments.blocks.knife.includes('projectvibrantjourneys:short_grass')}`)
