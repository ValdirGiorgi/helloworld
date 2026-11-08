// One-off: renders design/*.svg into the committed brand assets in public/
// (research.md §7). Run with `node scripts/render-brand-assets.mjs` after
// changing a design source, then commit the generated files. Uses the
// Playwright Chromium the E2E suite already installs, so no image library.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { chromium } from '@playwright/test'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const DESIGN = path.join(ROOT, 'design')
const PUBLIC = path.join(ROOT, 'public')

async function renderPng(browser, svgFile, width, height, { transparent = true } = {}) {
  const svg = fs.readFileSync(path.join(DESIGN, svgFile), 'utf8')
  const page = await browser.newPage({ viewport: { width, height } })
  await page.setContent(
    `<html><body style="margin:0;background:#ffffff"><img src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}" width="${width}" height="${height}" style="display:block"></body></html>`,
  )
  await page.locator('img').evaluate((img) => img.decode())
  const png = await page.screenshot({
    clip: { x: 0, y: 0, width, height },
    omitBackground: transparent,
  })
  await page.close()
  return png
}

/**
 * Wraps PNG images in an ICO container (ICONDIR + one ICONDIRENTRY per image),
 * which every browser accepts since Windows Vista's PNG-in-ICO format.
 */
export function buildIco(images) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type: icon
  header.writeUInt16LE(images.length, 4)

  let offset = 6 + 16 * images.length
  const entries = images.map(({ size, png }) => {
    const entry = Buffer.alloc(16)
    entry.writeUInt8(size >= 256 ? 0 : size, 0) // width
    entry.writeUInt8(size >= 256 ? 0 : size, 1) // height
    entry.writeUInt8(0, 2) // palette colors
    entry.writeUInt8(0, 3) // reserved
    entry.writeUInt16LE(1, 4) // color planes
    entry.writeUInt16LE(32, 6) // bits per pixel
    entry.writeUInt32LE(png.length, 8)
    entry.writeUInt32LE(offset, 12)
    offset += png.length
    return entry
  })

  return Buffer.concat([header, ...entries, ...images.map(({ png }) => png)])
}

async function main() {
  const browser = await chromium.launch()
  try {
    fs.writeFileSync(
      path.join(PUBLIC, 'og-image.png'),
      await renderPng(browser, 'og-image.svg', 1200, 630),
    )
    fs.writeFileSync(
      path.join(PUBLIC, 'apple-touch-icon.png'),
      // Opaque: iOS applies its own rounded mask and shows transparency as black.
      await renderPng(browser, 'favicon.svg', 180, 180, { transparent: false }),
    )
    const icons = []
    for (const size of [32, 16]) {
      icons.push({ size, png: await renderPng(browser, 'favicon.svg', size, size) })
    }
    fs.writeFileSync(path.join(PUBLIC, 'favicon.ico'), buildIco(icons))
    fs.copyFileSync(path.join(DESIGN, 'favicon.svg'), path.join(PUBLIC, 'favicon.svg'))
  } finally {
    await browser.close()
  }
  console.log('Wrote public/og-image.png, apple-touch-icon.png, favicon.ico and favicon.svg.')
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main()
}
