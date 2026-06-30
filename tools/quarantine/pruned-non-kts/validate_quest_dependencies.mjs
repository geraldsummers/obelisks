#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const dir = path.join(process.cwd(), 'config/ftbquests/quests/chapters')
const hexId = /^[0-9A-Fa-f]{16}$/
const ids = new Map()
const refs = []
const chapterOf = new Map()
for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.snbt'))) {
  const text = fs.readFileSync(path.join(dir, file), 'utf8')
  for (const m of text.matchAll(/\{id:"([^"]+)"/g)) {
    const id = m[1]
    ids.set(id, (ids.get(id) || 0) + 1)
    chapterOf.set(id, file)
  }
  for (const m of text.matchAll(/dependencies:\[([^\]]*)\]/g)) {
    for (const r of m[1].matchAll(/"([^"]+)"/g)) refs.push({ file, id: r[1] })
  }
}
const duplicate = [...ids.entries()].filter(([, count]) => count > 1)
const badIds = [...ids.keys()].filter(id => !hexId.test(id))
const missing = refs.filter(r => !ids.has(r.id))
const badRefs = refs.filter(r => !hexId.test(r.id))
const crossChapter = refs.filter(r => ids.has(r.id) && chapterOf.get(r.id) !== r.file)
if (duplicate.length || badIds.length || missing.length || badRefs.length) {
  if (duplicate.length) console.error('Duplicate FTB object ids:\n' + duplicate.map(([id, count]) => `${id} x${count}`).join('\n'))
  if (badIds.length) console.error('Non-hex FTB object ids:\n' + badIds.join('\n'))
  if (badRefs.length) console.error('Non-hex dependency refs:\n' + badRefs.map(r => `${r.file}: ${r.id}`).join('\n'))
  if (missing.length) console.error('Missing quest dependency refs:\n' + missing.map(m => `${m.file}: ${m.id}`).join('\n'))
  process.exit(1)
}
console.log(`quest dependencies ok: ${refs.length} refs, ${ids.size} FTB ids, ${crossChapter.length} cross-chapter refs`)
if (crossChapter.length) console.log('note: cross-chapter refs gate progress but only same-chapter refs draw visible lines')
