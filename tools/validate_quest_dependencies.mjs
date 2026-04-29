#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const dir = path.join(process.cwd(), 'config/ftbquests/quests/chapters')
const ids = new Set()
const refs = []
for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.snbt'))) {
  const text = fs.readFileSync(path.join(dir, file), 'utf8')
  for (const m of text.matchAll(/\{id:"([^"]+)"/g)) ids.add(m[1])
  for (const m of text.matchAll(/dependencies:\[([^\]]*)\]/g)) {
    for (const r of m[1].matchAll(/"([^"]+)"/g)) refs.push({ file, id: r[1] })
  }
}
const missing = refs.filter(r => !ids.has(r.id))
if (missing.length) {
  console.error('Missing quest dependency refs:')
  for (const m of missing) console.error(`${m.file}: ${m.id}`)
  process.exit(1)
}
console.log(`quest dependencies ok: ${refs.length} refs, ${ids.size} ids`)
