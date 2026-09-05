#!/usr/bin/env node
import { runCommand } from '../lib/cli.js'

try {
  const result = await runCommand(process.argv.slice(2))
  if (result.help && !process.argv.includes('--json')) process.stdout.write(result.help)
  else process.stdout.write(`${JSON.stringify({ success: true, ...result })}\n`)
} catch (error) {
  const result = { success: false, error: { code: error.code ?? 'INTERNAL_ERROR', message: error.message, details: error.details ?? null } }
  process.stdout.write(`${JSON.stringify(result)}\n`)
  process.stderr.write(`${result.error.code}: ${result.error.message}\n`)
  process.exitCode = 1
}
