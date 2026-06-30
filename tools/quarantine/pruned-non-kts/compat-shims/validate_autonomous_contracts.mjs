#!/usr/bin/env node
import { spawnSync } from 'node:child_process'

const forwarded = process.argv.slice(2)
const result = spawnSync('tools/btm', ['internal', 'validate-autonomous-contracts', ...forwarded], {
  stdio: 'inherit',
  env: process.env
})

if (result.error) {
  console.error(result.error.message)
  process.exit(4)
}

process.exit(result.status ?? 4)
