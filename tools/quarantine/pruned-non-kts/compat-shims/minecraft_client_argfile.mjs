#!/usr/bin/env node
import { spawnSync } from 'node:child_process'

const result = spawnSync('tools/btm', ['internal', 'minecraft-client-argfile', ...process.argv.slice(2)], {
  stdio: 'inherit',
  shell: true
})

process.exit(result.status ?? 1)
