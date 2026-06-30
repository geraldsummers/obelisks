#!/usr/bin/env node
import { spawnSync } from 'node:child_process'

const result = spawnSync('tools/btm', ['internal', 'validate-realistic-hands', ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: process.env
})

if (result.error) {
  console.error(result.error.message)
  process.exit(4)
}

process.exit(result.status ?? 4)
