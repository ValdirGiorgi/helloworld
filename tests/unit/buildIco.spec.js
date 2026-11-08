import { describe, it, expect } from 'vitest'
import { buildIco } from '../../scripts/render-brand-assets.mjs'

describe('buildIco', () => {
  it('wraps PNG payloads in an ICONDIR with one entry per image, pointing at each payload', () => {
    const png32 = Buffer.from('png-32-bytes')
    const png16 = Buffer.from('png-16')
    const ico = buildIco([
      { size: 32, png: png32 },
      { size: 16, png: png16 },
    ])

    expect(ico.readUInt16LE(0)).toBe(0)
    expect(ico.readUInt16LE(2)).toBe(1)
    expect(ico.readUInt16LE(4)).toBe(2)

    const headerSize = 6 + 16 * 2
    const entries = [0, 1].map((index) => {
      const at = 6 + 16 * index
      return {
        width: ico.readUInt8(at),
        bitsPerPixel: ico.readUInt16LE(at + 6),
        size: ico.readUInt32LE(at + 8),
        offset: ico.readUInt32LE(at + 12),
      }
    })
    expect(entries).toEqual([
      { width: 32, bitsPerPixel: 32, size: png32.length, offset: headerSize },
      { width: 16, bitsPerPixel: 32, size: png16.length, offset: headerSize + png32.length },
    ])
    expect(ico.subarray(headerSize, headerSize + png32.length)).toEqual(png32)
    expect(ico.length).toBe(headerSize + png32.length + png16.length)
  })

  it('writes 0 as the width of a 256-pixel image, as the format requires', () => {
    const ico = buildIco([{ size: 256, png: Buffer.from('x') }])
    expect(ico.readUInt8(6)).toBe(0)
  })
})
