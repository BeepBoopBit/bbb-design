import { execFileSync } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { projectRoot } from './registry.mjs'

const directory = resolve(projectRoot, '.copy-consumer')
await mkdir(directory, { recursive: true })
execFileSync('npm', ['pack', '--workspace', '@beepboopbit/ui', '--pack-destination', directory], { cwd: projectRoot, stdio: 'inherit' })
