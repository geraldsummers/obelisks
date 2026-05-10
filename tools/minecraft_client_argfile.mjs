#!/usr/bin/env node
import { randomUUID, createHash } from 'node:crypto'
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { spawnSync } from 'node:child_process'

const args = parseArgs(process.argv.slice(2))
const clientDir = path.resolve(required(args, 'client-dir'))
const versionId = required(args, 'version-id')
const username = args.username || 'AgentClient'
const server = args.server || ''
const out = path.resolve(required(args, 'out'))
const inherited = []

const version = await loadMergedVersion(clientDir, versionId)
const librariesDir = path.join(clientDir, 'libraries')
const assetsDir = path.join(clientDir, 'assets')
const nativesDir = path.join(clientDir, 'natives', versionId)
await mkdir(path.dirname(out), { recursive: true })
await mkdir(nativesDir, { recursive: true })

const classpath = []
for (const lib of version.libraries || []) {
  if (!allowed(lib.rules)) continue
  const artifact = normalizeArtifact(lib)
  if (!artifact?.path) continue
  const file = path.join(librariesDir, artifact.path)
  if (!existsSync(file) && artifact.url) await downloadFile(artifact.url, file)
  if (existsSync(file)) classpath.push(file)
  const nativeKey = lib.natives?.linux
  const nativeArtifact = nativeKey ? lib.downloads?.classifiers?.[nativeKey] : null
  if (nativeArtifact?.path) {
    const nativeJar = path.join(librariesDir, nativeArtifact.path)
    if (!existsSync(nativeJar) && nativeArtifact.url) await downloadFile(nativeArtifact.url, nativeJar)
    if (existsSync(nativeJar)) extractNativeJar(nativeJar, nativesDir)
  }
}

for (const id of [versionId, ...inherited]) {
  if (isForgeLaunch(version) && isVanillaVersionId(id)) continue
  const jar = path.join(clientDir, 'versions', id, `${id}.jar`)
  if (!existsSync(jar) && id === inherited[inherited.length - 1] && version.downloads?.client?.url) {
    await downloadFile(version.downloads.client.url, jar)
  }
  if (existsSync(jar)) classpath.push(jar)
}

if (!classpath.length) die(`no classpath entries found under ${librariesDir}`)
if (!version.mainClass) die(`missing mainClass in ${versionId}`)

const assetIndex = version.assetIndex?.id || version.assets || '1.20'
const uuid = offlineUuid(username)
const replacements = {
  auth_player_name: username,
  version_name: versionId,
  game_directory: clientDir,
  assets_root: assetsDir,
  assets_index_name: assetIndex,
  auth_uuid: uuid,
  auth_access_token: '0',
  clientid: randomUUID(),
  auth_xuid: '0',
  user_type: 'legacy',
  version_type: version.type || 'forge',
  natives_directory: nativesDir,
  launcher_name: 'obelisks-direct',
  launcher_version: '1',
  classpath: classpath.join(':'),
  classpath_separator: ':',
  library_directory: librariesDir,
}

const fileArgs = []
const jvmArgs = normalizeJvmArgs(expandArgs(version.arguments?.jvm || [], replacements), inherited)
for (const arg of jvmArgs) fileArgs.push(arg)
if (!jvmArgs.includes(replacements.classpath)) fileArgs.push('-cp', replacements.classpath)
fileArgs.push(version.mainClass)
for (const arg of expandArgs(version.arguments?.game || legacyGameArgs(version), replacements)) fileArgs.push(arg)
if (server) {
  const [host, port] = splitServer(server)
  fileArgs.push('--quickPlayMultiplayer', `${host}:${port}`)
  fileArgs.push('--server', host, '--port', port)
}

await writeFile(out, fileArgs.map(quoteArgfile).join('\n') + '\n')
console.log(out)

async function loadMergedVersion(dir, id) {
  const file = path.join(dir, 'versions', id, `${id}.json`)
  if (!existsSync(file)) await downloadVersionJson(dir, id, file)
  let json = JSON.parse(await readFile(file, 'utf8'))
  if (isVanillaVersionId(id) && (!json.libraries?.length || !json.downloads?.client?.url)) {
    await downloadVersionJson(dir, id, file)
    json = JSON.parse(await readFile(file, 'utf8'))
  }
  if (!json.inheritsFrom) return json
  inherited.push(json.inheritsFrom)
  const parent = await loadMergedVersion(dir, json.inheritsFrom)
  return {
    ...parent,
    ...json,
    libraries: [...(parent.libraries || []), ...(json.libraries || [])],
    arguments: {
      game: [...(parent.arguments?.game || []), ...(json.arguments?.game || [])],
      jvm: [...(parent.arguments?.jvm || []), ...(json.arguments?.jvm || [])],
    },
  }
}

function isVanillaVersionId(id) {
  return /^\d+\.\d+(?:\.\d+)?$/.test(id)
}

function isForgeLaunch(version) {
  const gameArgs = version.arguments?.game || []
  return gameArgs.some(arg => {
    if (typeof arg === 'string') return arg === '--launchTarget' || arg === 'forgeclient'
    const values = Array.isArray(arg.value) ? arg.value : [arg.value]
    return values.some(value => value === '--launchTarget' || value === 'forgeclient')
  })
}

async function downloadVersionJson(dir, id, file) {
  const manifestUrl = 'https://piston-meta.mojang.com/mc/game/version_manifest_v2.json'
  const manifest = await fetchJson(manifestUrl)
  const item = manifest.versions?.find(v => v.id === id)
  if (!item?.url) die(`missing version JSON: ${file}`)
  const version = await fetchJson(item.url)
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, JSON.stringify(version, null, 2) + '\n')
}

async function fetchJson(url) {
  const res = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': 'obelisks-agent-runtime/1.0' } })
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}: ${url}`)
  return res.json()
}

async function downloadFile(url, dest) {
  const tmp = `${dest}.tmp-${process.pid}`
  await mkdir(path.dirname(dest), { recursive: true })
  try {
    const res = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': 'obelisks-agent-runtime/1.0' } })
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
    await pipeline(res.body, createWriteStream(tmp))
    await rename(tmp, dest)
  } catch (err) {
    await rm(tmp, { force: true }).catch(() => {})
    throw new Error(`download failed: ${url}: ${err.message}`)
  }
}

function extractNativeJar(file, dest) {
  const unzip = spawnSync('unzip', ['-oq', file, '-d', dest], { stdio: 'ignore' })
  if (unzip.status === 0) return
  const jar = spawnSync('jar', ['xf', file], { cwd: dest, stdio: 'ignore' })
  if (jar.status !== 0) die(`could not extract native library jar: ${file}`)
}

function expandArgs(values, replacements) {
  const out = []
  for (const value of values) {
    if (typeof value === 'string') {
      out.push(replaceVars(value, replacements))
      continue
    }
    if (!allowed(value.rules)) continue
    const vals = Array.isArray(value.value) ? value.value : [value.value]
    for (const val of vals) out.push(replaceVars(String(val), replacements))
  }
  return out
}

function legacyGameArgs(version) {
  return String(version.minecraftArguments || '').split(/\s+/).filter(Boolean)
}

function normalizeJvmArgs(values, inheritedIds) {
  const vanillaJars = inheritedIds
    .filter(isVanillaVersionId)
    .map(id => `${id}.jar`)
  if (!vanillaJars.length) return values
  return values.map(value => {
    if (!value.startsWith('-DignoreList=')) return value
    const existing = value.slice('-DignoreList='.length).split(',').filter(Boolean)
    for (const jar of vanillaJars) {
      if (!existing.includes(jar)) existing.push(jar)
    }
    return `-DignoreList=${existing.join(',')}`
  })
}

function normalizeArtifact(lib) {
  const artifact = lib.downloads?.artifact
  if (artifact?.path) return artifact
  if (!lib.name) return artifact
  const path = mavenPath(lib.name)
  if (!path) return artifact
  return {
    ...(artifact || {}),
    path,
  }
}

function mavenPath(name) {
  const parts = String(name).split(':')
  if (parts.length < 3) return ''
  const [group, artifact, version, classifier] = parts
  const file = classifier
    ? `${artifact}-${version}-${classifier}.jar`
    : `${artifact}-${version}.jar`
  return `${group.replace(/\./g, '/')}/${artifact}/${version}/${file}`
}

function allowed(rules) {
  if (!rules?.length) return true
  let result = false
  for (const rule of rules) {
    if (rule.os?.name && rule.os.name !== 'linux') continue
    if (rule.features) continue
    result = rule.action === 'allow'
  }
  return result
}

function replaceVars(text, replacements) {
  return text.replace(/\$\{([^}]+)\}/g, (_, key) => replacements[key] ?? '')
}

function offlineUuid(name) {
  const hex = createHash('md5').update(`OfflinePlayer:${name}`).digest('hex')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

function splitServer(value) {
  const idx = value.lastIndexOf(':')
  if (idx < 1) die('--server must be HOST:PORT')
  return [value.slice(0, idx), value.slice(idx + 1)]
}

function quoteArgfile(value) {
  if (/^[A-Za-z0-9_./:=+@,%${}-]+$/.test(value)) return value
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}

function parseArgs(argv) {
  const out = {}
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (!arg.startsWith('--')) die(`unknown argument: ${arg}`)
    out[arg.slice(2)] = argv[++i]
  }
  return out
}

function required(map, key) {
  if (!map[key]) die(`--${key} is required`)
  return map[key]
}

function die(message) {
  console.error(`ERROR: ${message}`)
  process.exit(2)
}
