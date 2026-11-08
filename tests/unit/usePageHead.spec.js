import { describe, it, expect, vi } from 'vitest'
import { createApp, nextTick } from 'vue'
import { createHead } from '@unhead/vue/client'
import { createSiteI18n } from '../../src/i18n/index.js'
import { usePageHead } from '../../src/composables/usePageHead.js'
import { createTestRouter } from './helpers/testRouter.js'

// The real module runs `git log` per page (vite.config.js); unit tests don't.
vi.mock('virtual:page-lastmod', () => ({ default: { '/pt-BR/languages/rust': '2026-01-01' } }))

async function mountWithPageHead(initialPath) {
  const router = await createTestRouter(initialPath)
  const head = createHead()
  const app = createApp({
    setup() {
      usePageHead()
      return () => null
    },
  })
  app.use(createSiteI18n())
  app.use(router)
  app.use(head)
  app.mount(document.createElement('div'))
  return { router, head }
}

/** Flattens the resolved head into the parts these tests look at. */
async function resolve(head) {
  await nextTick()
  const tags = await head.resolveTags()
  const find = (predicate) => tags.filter(predicate)
  return {
    title: find((tag) => tag.tag === 'title')[0]?.textContent,
    lang: find((tag) => tag.tag === 'htmlAttrs')[0]?.props.lang,
    description: find((tag) => tag.tag === 'meta' && tag.props.name === 'description')[0]?.props
      .content,
    canonical: find((tag) => tag.tag === 'link' && tag.props.rel === 'canonical').map(
      (tag) => tag.props.href,
    ),
    alternates: find((tag) => tag.tag === 'link' && tag.props.rel === 'alternate').map(
      (tag) => `${tag.props.hreflang} ${tag.props.href}`,
    ),
    jsonLd: find((tag) => tag.tag === 'script').map((tag) => JSON.parse(tag.innerHTML)),
    robots: find((tag) => tag.tag === 'meta' && tag.props.name === 'robots')[0]?.props.content,
  }
}

describe('usePageHead', () => {
  it('builds the head of /pt-BR/languages/rust from the page catalog', async () => {
    const { head } = await mountWithPageHead('/pt-BR/languages/rust')
    const resolved = await resolve(head)

    expect(resolved.lang).toBe('pt-BR')
    expect(resolved.title).toBe('Hello World em Rust — exemplos de código')
    expect(resolved.description).toContain('Rust')
    expect(resolved.canonical).toEqual(['https://helloworld.valdir.dev.br/pt-BR/languages/rust'])
    expect(resolved.alternates).toEqual([
      'pt-BR https://helloworld.valdir.dev.br/pt-BR/languages/rust',
      'en https://helloworld.valdir.dev.br/en/languages/rust',
      'es https://helloworld.valdir.dev.br/es/languages/rust',
      'x-default https://helloworld.valdir.dev.br/en/languages/rust',
    ])
    expect(resolved.jsonLd).toEqual([
      expect.objectContaining({ '@type': 'TechArticle', dateModified: '2026-01-01' }),
    ])
  })

  it('replaces every tag after client navigation to /en', async () => {
    const { head, router } = await mountWithPageHead('/pt-BR/languages/rust')
    await router.push('/en')
    const resolved = await resolve(head)

    expect(resolved.lang).toBe('en')
    expect(resolved.title).toBe('Hello World in Many Languages')
    expect(resolved.canonical).toEqual(['https://helloworld.valdir.dev.br/en'])
    expect(resolved.alternates).toHaveLength(4)
    expect(resolved.alternates).toContain('x-default https://helloworld.valdir.dev.br/en')
  })

  it('gives a language page with an unknown slug the pt-BR not-found head', async () => {
    const { head } = await mountWithPageHead('/pt-BR/languages/xyz')
    const resolved = await resolve(head)

    expect(resolved.lang).toBe('pt-BR')
    expect(resolved.title).toBe('Página não encontrada — Hello World em Muitas Linguagens')
    expect(resolved.robots).toBe('noindex, follow')
    expect(resolved.canonical).toEqual([])
    expect(resolved.alternates).toEqual([])
    expect(resolved.jsonLd).toEqual([])
  })

  it('gives an address without a locale the English not-found head', async () => {
    const { head } = await mountWithPageHead('/history')
    const resolved = await resolve(head)

    expect(resolved.lang).toBe('en')
    expect(resolved.title).toBe('Page not found — Hello World in Many Languages')
    expect(resolved.robots).toBe('noindex, follow')
  })

  it('gives the root chooser its fixed English title, noindex', async () => {
    const { head } = await mountWithPageHead('/')
    const resolved = await resolve(head)

    expect(resolved.lang).toBe('en')
    expect(resolved.title).toBe('Hello World in Many Languages — choose your language')
    expect(resolved.robots).toBe('noindex, follow')
    expect(resolved.canonical).toEqual([])
  })
})
