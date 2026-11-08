import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('node:child_process', () => {
  const execFileSync = vi.fn()
  return { execFileSync, default: { execFileSync } }
})

const { execFileSync } = await import('node:child_process')
const { getLastModified, buildLastModMap } = await import('../../scripts/lib/getLastModified.mjs')
const { buildPageCatalog } = await import('../../src/seo/pageCatalog.js')

const TODAY = new Date().toISOString().slice(0, 10)

describe('getLastModified', () => {
  beforeEach(() => {
    execFileSync.mockReset()
  })

  it('returns the last commit date reported by git log', () => {
    execFileSync.mockReturnValue('2026-01-02\n')
    expect(getLastModified(['content/languages/rust.md'], { cwd: '/repo' })).toBe('2026-01-02')
    expect(execFileSync).toHaveBeenCalledWith(
      'git',
      ['log', '-1', '--format=%cs', '--', 'content/languages/rust.md'],
      expect.objectContaining({ cwd: '/repo' }),
    )
  })

  it("falls back to today's UTC date when git prints nothing (no commit yet)", () => {
    execFileSync.mockReturnValue('')
    expect(getLastModified(['content/languages/new.md'], { cwd: '/repo' })).toBe(TODAY)
  })

  it("falls back to today's UTC date when git fails", () => {
    execFileSync.mockImplementation(() => {
      throw new Error('not a git repository')
    })
    expect(getLastModified(['x.md'], { cwd: '/repo' })).toBe(TODAY)
  })
})

describe('buildLastModMap', () => {
  beforeEach(() => {
    execFileSync.mockReset()
  })

  it("maps every page path to the date of its own kind's source files", () => {
    execFileSync.mockImplementation((command, args) =>
      args.includes('content/languages/rust.md') ? '2026-03-04' : '2025-12-31',
    )
    const catalog = buildPageCatalog({ locales: ['pt-BR', 'en'], languageSlugs: ['rust'] })
    const map = buildLastModMap({ catalog, cwd: '/repo' })

    expect(Object.keys(map)).toHaveLength(catalog.length)
    expect(map['/pt-BR/languages/rust']).toBe('2026-03-04')
    expect(map['/en/history']).toBe('2025-12-31')

    const historyArgs = execFileSync.mock.calls.find(([, args]) =>
      args.includes('content/history.pt-BR.md'),
    )[1]
    expect(historyArgs).toContain('src/pages/HistoryPage.vue')
  })
})
