import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { readLanguageSlugs } from '../../scripts/lib/readLanguageSlugs.mjs'

describe('readLanguageSlugs', () => {
  it('lists content/languages/*.md as lowercase slugs, ignoring other files', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'slugs-'))
    try {
      const dir = path.join(root, 'content', 'languages')
      fs.mkdirSync(dir, { recursive: true })
      for (const file of ['Rust.md', 'c-sharp.md', 'notes.txt']) {
        fs.writeFileSync(path.join(dir, file), '')
      }
      expect(readLanguageSlugs(root).sort()).toEqual(['c-sharp', 'rust'])
    } finally {
      fs.rmSync(root, { recursive: true })
    }
  })
})
