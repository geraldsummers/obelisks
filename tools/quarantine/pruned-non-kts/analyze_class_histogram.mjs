#!/usr/bin/env node
import fs from 'node:fs'
const file = process.argv[2]
if (!file) throw new Error('usage: analyze_class_histogram.mjs <class_histogram.txt>')
const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/)
const rows = []
for (const line of lines) {
  const m = line.match(/^\s*\d+:\s+(\d+)\s+(\d+)\s+(.+?)(?: \(|$)/)
  if (!m) continue
  rows.push({ instances: Number(m[1]), bytes: Number(m[2]), cls: m[3] })
}
const buckets = [
  ['minecraft_model_render', /net\.minecraft\.client\.(renderer|resources\.model|model|renderer\.texture)/],
  ['minecraft_block_item_recipe', /net\.minecraft\.(world\.level\.block|world\.item|world\.item\.crafting|nbt|resources|network\.chat)/],
  ['emi', /dev\.emi\.emi|mezz\.jei|Jemi/],
  ['geckolib_citadel_models', /software\.bernie\.geckolib|com\.github\.alexthe666\.citadel|com\.eliotlash\.mclib/],
  ['gson_json', /com\.google\.gson/],
  ['collections_maps', /java\.util\.|it\.unimi\.dsi\.fastutil|com\.google\.common\.collect/],
  ['classes_reflection_mixin_asm', /java\.lang\.Class|java\.lang\.reflect|org\.objectweb\.asm|org\.spongepowered\.asm|net\.forge/],
  ['arrays', /^\[/],
]
const sums = new Map()
for (const [name] of buckets) sums.set(name, { bytes: 0, instances: 0 })
sums.set('other', { bytes: 0, instances: 0 })
for (const row of rows) {
  const hit = buckets.find(([, re]) => re.test(row.cls))?.[0] || 'other'
  const sum = sums.get(hit)
  sum.bytes += row.bytes
  sum.instances += row.instances
}
function mib(bytes) { return Math.round(bytes / 1024 / 1024 * 10) / 10 }
console.log('Bucket\tMiB\tInstances')
for (const [name, sum] of [...sums.entries()].sort((a,b)=>b[1].bytes-a[1].bytes)) {
  console.log(`${name}\t${mib(sum.bytes)}\t${sum.instances}`)
}
console.log('\nTop classes:')
for (const row of rows.slice(0, 80)) console.log(`${mib(row.bytes)} MiB\t${row.instances}\t${row.cls}`)
