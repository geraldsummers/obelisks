#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const repo = process.cwd()
const contractPath = path.join(repo, 'tools/pack_contract.json')
const catalogPath = path.join(repo, 'kubejs/config/btm_expert_graph_catalog.json')
const failures = []
const findings = []
const passes = []

function exists(relPath) { return fs.existsSync(path.join(repo, relPath)) }
function full(relPath) { return path.join(repo, relPath) }
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
function finding(name, detail, severity = 'SHOULD') {
  findings.push({ name, detail, severity })
  console.warn(`${severity} - ${name}: ${detail}`)
}
function walk(relRoot, pred = () => true, out = []) {
  const root = full(relRoot)
  if (!fs.existsSync(root)) return out
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const file = path.join(root, entry.name)
    const relFile = path.relative(repo, file).replaceAll(path.sep, '/')
    if (entry.isDirectory()) walk(relFile, pred, out)
    else if (pred(relFile)) out.push(relFile)
  }
  return out
}
function sha256(relPath) {
  return crypto.createHash('sha256').update(fs.readFileSync(full(relPath))).digest('hex')
}
function arraysEqual(a, b) {
  return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((value, index) => value === b[index])
}
function getByPath(value, keys) {
  let current = value
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return undefined
    current = current[key]
  }
  return current
}
function parseIndex(indexText) {
  const entries = []
  for (const match of indexText.matchAll(/\[\[files\]\]\s+file = "([^"]+)"\s+hash = "([0-9a-f]+)"/g)) {
    entries.push({ file: match[1], hash: match[2] })
  }
  return entries
}
function countCodeFiles(absRoot) {
  if (!fs.existsSync(absRoot)) return 0
  let count = 0
  for (const entry of fs.readdirSync(absRoot, { withFileTypes: true })) {
    const file = path.join(absRoot, entry.name)
    if (entry.isDirectory()) count += countCodeFiles(file)
    else if (/\.(kt|java)$/.test(entry.name)) count++
  }
  return count
}
function countTestFiles(absRoot) {
  const testRoot = path.join(absRoot, 'src/test')
  return countCodeFiles(testRoot)
}

let contract
try {
  contract = readJson('tools/pack_contract.json')
  ok('pack contract parses', contract.schema)
} catch (error) {
  fail('pack contract parses', error.message)
  contract = {}
}

function validatePackVersions() {
  const pack = exists('pack.toml') ? read('pack.toml') : ''
  if (!pack) return fail('pack.toml exists', 'missing pack.toml')
  const mc = pack.match(/minecraft = "([^"]+)"/)?.[1]
  const forge = pack.match(/forge = "([^"]+)"/)?.[1]
  mc === contract.pack?.minecraft ? ok('Minecraft version contract matches pack.toml', mc) : fail('Minecraft version contract matches pack.toml', `${mc || '<missing>'} != ${contract.pack?.minecraft}`)
  forge === contract.pack?.forge ? ok('Forge version contract matches pack.toml', forge) : fail('Forge version contract matches pack.toml', `${forge || '<missing>'} != ${contract.pack?.forge}`)
}

function validateSourceSurface() {
  const roots = contract.sourceSurface?.authoritativeRoots || []
  const missingRoots = roots.filter(root => !exists(root))
  missingRoots.length ? fail('authoritative source roots exist', missingRoots.join(', ')) : ok('authoritative source roots exist', `${roots.length} roots`)

  const total = roots.reduce((sum, root) => sum + walk(root).length, 0)
  total >= contract.sourceSurface.minimumTotalFiles
    ? ok('source surface minimum file count', `${total} >= ${contract.sourceSurface.minimumTotalFiles}`)
    : fail('source surface minimum file count', `${total} < ${contract.sourceSurface.minimumTotalFiles}`)

  for (const [root, minCount] of Object.entries(contract.sourceSurface.rootFileMinimums || {})) {
    const count = walk(root).length
    count >= minCount ? ok(`${root} file count floor`, `${count} >= ${minCount}`) : fail(`${root} file count floor`, `${count} < ${minCount}`)
  }

  const jsCount = walk('kubejs', file => file.endsWith('.js')).length
  const jsonCount = walk('kubejs', file => file.endsWith('.json')).length
  jsCount >= contract.sourceSurface.kubejsMinimums.js ? ok('KubeJS JS surface floor', `${jsCount} files`) : fail('KubeJS JS surface floor', `${jsCount} < ${contract.sourceSurface.kubejsMinimums.js}`)
  jsonCount >= contract.sourceSurface.kubejsMinimums.json ? ok('KubeJS JSON surface floor', `${jsonCount} files`) : fail('KubeJS JSON surface floor', `${jsonCount} < ${contract.sourceSurface.kubejsMinimums.json}`)

  const expectedDocs = contract.sourceSurface.livingDocs || []
  const actualDocs = walk('docs', file => file.endsWith('.md')).map(file => path.basename(file)).sort()
  const missingDocs = expectedDocs.filter(doc => !actualDocs.includes(doc))
  const extraDocs = actualDocs.filter(doc => !expectedDocs.includes(doc))
  if (missingDocs.length || extraDocs.length) {
    fail('docs contain exactly the five living summaries', `missing=${missingDocs.join(', ') || 'none'} extra=${extraDocs.join(', ') || 'none'}`)
  } else {
    ok('docs contain exactly the five living summaries', actualDocs.join(', '))
  }
}

function validatePackwiz() {
  const indexRel = contract.packwiz?.indexFile || 'index.toml'
  const packRel = contract.packwiz?.packFile || 'pack.toml'
  if (!exists(indexRel)) return fail('packwiz index exists', indexRel)

  const indexText = read(indexRel)
  const entries = parseIndex(indexText)
  const byFile = new Map(entries.map(entry => [entry.file, entry.hash]))
  const excludedHits = entries.filter(entry => (contract.packwiz.excludedIndexPrefixes || []).some(prefix => entry.file.startsWith(prefix)))
  excludedHits.length ? fail('packwiz index excludes generated/tool roots', excludedHits.map(entry => entry.file).slice(0, 20).join(', ')) : ok('packwiz index excludes generated/tool roots')

  const missing = []
  const badHashes = []
  for (const entry of entries) {
    if (!exists(entry.file)) missing.push(entry.file)
    else {
      const actual = sha256(entry.file)
      if (actual !== entry.hash) badHashes.push(`${entry.file}: ${actual} != ${entry.hash}`)
    }
  }
  missing.length ? fail('packwiz indexed files exist', missing.slice(0, 40).join('\n')) : ok('packwiz indexed files exist', `${entries.length} entries`)
  badHashes.length ? fail('packwiz indexed file hashes match', badHashes.slice(0, 40).join('\n')) : ok('packwiz indexed file hashes match', `${entries.length} entries`)

  if (exists(packRel)) {
    const packText = read(packRel)
    const declaredHash = packText.match(/\[index\][\s\S]*?hash = "([0-9a-f]+)"/)?.[1]
    const actualHash = sha256(indexRel)
    if (declaredHash && declaredHash !== actualHash) {
      finding('pack.toml index hash is stale', `${declaredHash} != ${actualHash}`, contract.packwiz.hashDriftSeverity || 'SHOULD')
    } else if (declaredHash) {
      ok('pack.toml index hash matches index.toml')
    }
  }

  return byFile
}

function validateMods(indexByFile) {
  const manifests = walk('mods', file => file.endsWith('.pw.toml'))
  const jars = walk('mods', file => file.endsWith('.jar'))
  manifests.length >= contract.mods.minimumManifestCount ? ok('pack manifest count floor', `${manifests.length} manifests`) : fail('pack manifest count floor', `${manifests.length} < ${contract.mods.minimumManifestCount}`)
  jars.length >= contract.mods.minimumBundledJarCount ? ok('bundled custom jar count floor', `${jars.length} jars`) : fail('bundled custom jar count floor', `${jars.length} < ${contract.mods.minimumBundledJarCount}`)

  for (const file of contract.mods.requiredManifests || []) {
    exists(file) ? ok(`required manifest exists: ${file}`) : fail('required manifest exists', file)
  }
  for (const file of contract.mods.requiredBundledJars || []) {
    if (!exists(file)) fail('required bundled jar exists', file)
    else if (!indexByFile?.has(file)) fail('required bundled jar is indexed', file)
    else ok(`required bundled jar exists and is indexed: ${file}`)
  }
  const forbidden = (contract.mods.forbiddenFiles || []).filter(exists)
  forbidden.length ? fail('forbidden retired/bypass files are absent', forbidden.join(', ')) : ok('forbidden retired/bypass files are absent')
}

function validateProgressionCatalog() {
  let catalog
  try {
    catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'))
  } catch (error) {
    return fail('expert graph catalog parses', error.message)
  }
  arraysEqual(catalog.tierOrder, contract.progression.tierOrder)
    ? ok('progression tier order matches contract', `${catalog.tierOrder.length} tiers`)
    : fail('progression tier order matches contract', `${JSON.stringify(catalog.tierOrder)} != ${JSON.stringify(contract.progression.tierOrder)}`)

  const coins = (catalog.coinTiers || []).map(tier => tier.item)
  arraysEqual(coins, contract.progression.coinTiers)
    ? ok('coin tier order matches contract', `${coins.length} tiers`)
    : fail('coin tier order matches contract', `${JSON.stringify(coins)} != ${JSON.stringify(contract.progression.coinTiers)}`)

  const casings = (catalog.machineTiers || []).map(tier => tier.casing)
  arraysEqual(casings, contract.progression.machineCasings)
    ? ok('machine casing ladder matches contract', `${casings.length} casings`)
    : fail('machine casing ladder matches contract', `${JSON.stringify(casings)} != ${JSON.stringify(contract.progression.machineCasings)}`)

  const bloodGates = (catalog.bloodMagicTiers || []).map(tier => tier.gate)
  const missingGates = contract.progression.bloodMagicGates.filter(gate => !bloodGates.includes(gate))
  missingGates.length ? fail('Blood Magic gate catalog covers contract', missingGates.join(', ')) : ok('Blood Magic gate catalog covers contract', `${bloodGates.length} gates`)
}

function validateContainsRule(rule, owner) {
  if (!exists(rule.file)) return fail(`${owner} marker file exists`, rule.file)
  const text = read(rule.file)
  const missingAll = (rule.all || []).filter(needle => !text.includes(needle))
  const anyHits = !rule.any || rule.any.some(needle => text.includes(needle))
  const presentAbsent = (rule.absent || []).filter(needle => text.includes(needle))
  if (missingAll.length || !anyHits || presentAbsent.length) {
    const parts = []
    if (missingAll.length) parts.push(`missing=${missingAll.join(', ')}`)
    if (!anyHits) parts.push(`none of any=${rule.any.join(', ')}`)
    if (presentAbsent.length) parts.push(`forbidden=${presentAbsent.join(', ')}`)
    fail(`${owner} markers hold in ${rule.file}`, parts.join(' '))
  } else {
    ok(`${owner} markers hold in ${rule.file}`)
  }
}

function validateSystems() {
  for (const system of contract.systems || []) {
    const owner = `system ${system.id}`
    const missingFiles = (system.requiredFiles || []).filter(file => !exists(file))
    const missingDirs = (system.requiredDirs || []).filter(dir => !exists(dir))
    missingFiles.length ? fail(`${owner} required files exist`, missingFiles.join(', ')) : ok(`${owner} required files exist`, `${(system.requiredFiles || []).length} files`)
    missingDirs.length ? fail(`${owner} required dirs exist`, missingDirs.join(', ')) : ok(`${owner} required dirs exist`, `${(system.requiredDirs || []).length} dirs`)

    for (const rule of system.contains || []) validateContainsRule(rule, owner)
    for (const jsonRule of system.jsonMinimums || []) {
      if (!exists(jsonRule.file)) {
        fail(`${owner} JSON minimum source exists`, jsonRule.file)
        continue
      }
      try {
        const value = getByPath(readJson(jsonRule.file), jsonRule.path)
        const count = Array.isArray(value) ? value.length : -1
        count >= jsonRule.minLength
          ? ok(`${owner} JSON minimum ${jsonRule.file}:${jsonRule.path.join('.')}`, `${count} >= ${jsonRule.minLength}`)
          : fail(`${owner} JSON minimum ${jsonRule.file}:${jsonRule.path.join('.')}`, `${count} < ${jsonRule.minLength}`)
      } catch (error) {
        fail(`${owner} JSON minimum parses`, `${jsonRule.file}: ${error.message}`)
      }
    }
  }
}

function validateValidationTiers() {
  for (const tier of contract.validationTiers || []) {
    const missing = (tier.requiredTools || []).filter(file => !exists(file))
    missing.length ? fail(`validation tier ${tier.id} has required tools`, missing.join(', ')) : ok(`validation tier ${tier.id} has required tools`, tier.name)
  }
}

function validateCustomMods(indexByFile) {
  const sourceRoot = process.env.BTM_CUSTOM_MODS_DIR || contract.customMods?.sourceRoot
  if (!sourceRoot || !fs.existsSync(sourceRoot)) {
    return fail('custom mod source root exists', sourceRoot || '<missing>')
  }
  ok('custom mod source root exists', sourceRoot)

  for (const mod of contract.customMods.entries || []) {
    const modRoot = path.join(sourceRoot, mod.repo)
    if (!fs.existsSync(modRoot)) {
      fail(`custom mod source exists: ${mod.id}`, modRoot)
      continue
    }
    const hasBuild = fs.existsSync(path.join(modRoot, 'build.gradle')) || fs.existsSync(path.join(modRoot, 'build.gradle.kts'))
    hasBuild ? ok(`custom mod build file exists: ${mod.id}`) : fail(`custom mod build file exists: ${mod.id}`, modRoot)

    const codeFiles = countCodeFiles(path.join(modRoot, 'src'))
    const testFiles = countTestFiles(modRoot)
    codeFiles >= mod.minCodeFiles ? ok(`custom mod code surface: ${mod.id}`, `${codeFiles} >= ${mod.minCodeFiles}`) : fail(`custom mod code surface: ${mod.id}`, `${codeFiles} < ${mod.minCodeFiles}`)
    testFiles >= mod.minTestFiles ? ok(`custom mod test surface: ${mod.id}`, `${testFiles} >= ${mod.minTestFiles}`) : fail(`custom mod test surface: ${mod.id}`, `${testFiles} < ${mod.minTestFiles}`)

    if (!exists(mod.jar)) fail(`custom mod bundled jar exists: ${mod.id}`, mod.jar)
    else if (!indexByFile?.has(mod.jar)) fail(`custom mod bundled jar is indexed: ${mod.id}`, mod.jar)
    else ok(`custom mod bundled jar exists and is indexed: ${mod.id}`)
  }
}

validatePackVersions()
validateSourceSurface()
const indexByFile = validatePackwiz()
validateMods(indexByFile)
validateProgressionCatalog()
validateSystems()
validateValidationTiers()
validateCustomMods(indexByFile)

console.log(`\npack contract audit: ${passes.length} pass(es), ${findings.length} finding(s), ${failures.length} hard failure(s)`)
if (failures.length) process.exit(1)
