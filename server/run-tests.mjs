import { readdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const mode = process.argv[2]
if (mode !== 'unit' && mode !== 'integration') {
  throw new Error('Expected test mode: unit or integration')
}

const testDir = new URL('./src/scripts/test/', import.meta.url)
const files = readdirSync(testDir)
  .filter(name => name.endsWith('.test.ts'))
  .filter(name => name.endsWith('.integration.test.ts') === (mode === 'integration'))
  .map(name => fileURLToPath(new URL(name, testDir)))

if (files.length === 0) {
  throw new Error(`No ${mode} test files found`)
}

const result = spawnSync(process.execPath, ['--import', 'tsx', '--test', ...files], {
  stdio: 'inherit',
  cwd: fileURLToPath(new URL('.', import.meta.url))
})

if (result.error) throw result.error
process.exitCode = result.status ?? 1
