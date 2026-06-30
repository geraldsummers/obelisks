#!/usr/bin/env node
import { spawnSync } from 'node:child_process'

const result = spawnSync('tools/btm', ['internal', 'validate-kubejs-assets'], {
  stdio: 'inherit',
  cwd: process.cwd(),
})

if (result.error) {
  console.error(`FAIL - could not launch KTS validator: ${result.error.message}`)
  process.exit(1)
}

process.exit(result.status ?? 1)
