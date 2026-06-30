#!/usr/bin/env node
import { spawnSync } from 'node:child_process'

const result = spawnSync('kotlin', ['tools/kotlin/pack_test_suite.main.kts', ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: process.env
})

if (result.error) {
  console.error(result.error.message)
  process.exit(4)
}

process.exit(result.status ?? 4)
