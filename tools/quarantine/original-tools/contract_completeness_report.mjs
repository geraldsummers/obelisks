#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const repo = process.cwd()
const args = new Set(process.argv.slice(2))
const writeReports = !args.has('--no-write')
const checkMode = args.has('--check')
const reportDir = process.env.BTM_REPORT_DIR || path.join(repo, 'generated', 'validation')
const contractPath = path.join(repo, 'tools/pack_contract.json')

function existsAny(ref) {
  if (!ref) return false
  if (path.isAbsolute(ref)) return fs.existsSync(ref)
  return fs.existsSync(path.join(repo, ref))
}

function rel(ref) {
  return path.isAbsolute(ref) ? ref : ref
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function mdTable(rows) {
  if (!rows.length) return '_None._\n'
  const widths = []
  for (const row of rows) row.forEach((cell, i) => { widths[i] = Math.max(widths[i] || 0, String(cell).length) })
  const line = row => '| ' + row.map((cell, i) => String(cell).padEnd(widths[i])).join(' | ') + ' |'
  return [line(rows[0]), line(rows[0].map((_, i) => '-'.repeat(Math.max(3, widths[i])))), ...rows.slice(1).map(line)].join('\n') + '\n'
}

function countBy(values, keyFn) {
  const out = {}
  for (const value of values) {
    const key = keyFn(value)
    out[key] = (out[key] || 0) + 1
  }
  return out
}

const errors = []
const warnings = []
let contract

try {
  contract = readJson(contractPath)
} catch (error) {
  console.error(`FAIL - contract completeness input parses: ${error.message}`)
  process.exit(1)
}

const completeness = contract.completeness || {}
const dimensions = completeness.dimensions || []
const allowedStatuses = new Set(completeness.allowedStatuses || [])
const strongStatuses = new Set(completeness.strongStatuses || [])
const systems = new Set((contract.systems || []).map(system => system.id))
const tiers = new Set((contract.validationTiers || []).map(tier => tier.id))
const referencedSystems = new Set()
const referencedTiers = new Set()

if (!dimensions.length) errors.push('contract.completeness.dimensions is empty')
if (!allowedStatuses.size) errors.push('contract.completeness.allowedStatuses is empty')

for (const dimension of dimensions) {
  const label = dimension.id || '<missing id>'
  if (!dimension.id) errors.push('completeness dimension missing id')
  if (!allowedStatuses.has(dimension.status)) errors.push(`${label}: invalid status ${dimension.status || '<missing>'}`)
  if (!dimension.claim) errors.push(`${label}: missing claim`)

  for (const systemRef of dimension.systemRefs || []) {
    if (!systems.has(systemRef)) errors.push(`${label}: unknown systemRef ${systemRef}`)
    referencedSystems.add(systemRef)
  }
  for (const tierRef of dimension.tierRefs || []) {
    if (!tiers.has(tierRef)) errors.push(`${label}: unknown tierRef ${tierRef}`)
    referencedTiers.add(tierRef)
  }

  const evidence = dimension.evidence || []
  const validators = dimension.validators || []
  if (!evidence.length) errors.push(`${label}: no evidence listed`)
  if (!validators.length) errors.push(`${label}: no validators listed`)

  for (const ref of [...evidence, ...validators]) {
    if (!existsAny(ref)) errors.push(`${label}: evidence/validator missing: ${ref}`)
  }

  const weakStatus = dimension.status && !strongStatuses.has(dimension.status)
  if (weakStatus && !(dimension.openRequirements || []).length) {
    errors.push(`${label}: weak status ${dimension.status} must list openRequirements`)
  }
  if (!weakStatus && (dimension.openRequirements || []).length) {
    warnings.push(`${label}: strong status ${dimension.status} still lists openRequirements`)
  }
}

for (const system of systems) {
  if (!referencedSystems.has(system)) errors.push(`system is not referenced by any completeness dimension: ${system}`)
}
for (const tier of tiers) {
  if (!referencedTiers.has(tier)) errors.push(`validation tier is not referenced by any completeness dimension: ${tier}`)
}

const statusCounts = countBy(dimensions, dimension => dimension.status || '<missing>')
const strongDimensions = dimensions.filter(dimension => strongStatuses.has(dimension.status))
const weakDimensions = dimensions.filter(dimension => !strongStatuses.has(dimension.status))
const openRequirements = weakDimensions.flatMap(dimension => (dimension.openRequirements || []).map(requirement => ({
  dimension: dimension.id,
  status: dimension.status,
  requirement
})))

const summary = {
  generatedAt: new Date().toISOString(),
  schema: 'btm.contract_completeness_report.v1',
  contract: path.relative(repo, contractPath),
  dimensions: dimensions.length,
  strongDimensions: strongDimensions.length,
  weakDimensions: weakDimensions.length,
  statusCounts,
  unclassifiedSystems: [...systems].filter(system => !referencedSystems.has(system)),
  unreferencedTiers: [...tiers].filter(tier => !referencedTiers.has(tier)),
  errors,
  warnings,
  openRequirements
}

const report = `# Contract Completeness Report

Generated: \`${summary.generatedAt}\`

Contract: \`${summary.contract}\`

## Summary

${mdTable([
  ['Metric', 'Count'],
  ['Dimensions classified', summary.dimensions],
  ['Strong proof dimensions', summary.strongDimensions],
  ['Explicit weak/open dimensions', summary.weakDimensions],
  ['Open requirements', summary.openRequirements.length],
  ['Errors', summary.errors.length],
  ['Warnings', summary.warnings.length]
])}
## Status Counts

${mdTable([['Status', 'Count'], ...Object.entries(statusCounts).sort().map(([status, count]) => [status, count])])}
## Dimension Matrix

${mdTable([
  ['Dimension', 'Status', 'Tiers', 'Systems', 'Open requirements'],
  ...dimensions.map(dimension => [
    dimension.id,
    dimension.status,
    (dimension.tierRefs || []).join(', ') || '-',
    (dimension.systemRefs || []).join(', ') || '-',
    (dimension.openRequirements || []).length
  ])
])}
## Open Requirements

${mdTable([
  ['Dimension', 'Status', 'Requirement'],
  ...openRequirements.map(item => [item.dimension, item.status, item.requirement])
])}
## Errors

${mdTable([['Error'], ...errors.map(error => [error])])}
## Warnings

${mdTable([['Warning'], ...warnings.map(warning => [warning])])}
`

if (writeReports) {
  fs.mkdirSync(reportDir, { recursive: true })
  fs.writeFileSync(path.join(reportDir, 'contract_completeness_summary.json'), JSON.stringify(summary, null, 2) + '\n')
  fs.writeFileSync(path.join(reportDir, 'contract_completeness_report.md'), report)
}

console.log(`contract completeness: ${summary.dimensions} dimensions classified; ${summary.strongDimensions} strong, ${summary.weakDimensions} explicit open; ${summary.errors.length} error(s), ${summary.warnings.length} warning(s)`)
if (writeReports) console.log(`wrote ${path.relative(repo, path.join(reportDir, 'contract_completeness_report.md'))}`)
if (checkMode && errors.length) process.exit(1)
if (!checkMode && errors.length) process.exit(1)
