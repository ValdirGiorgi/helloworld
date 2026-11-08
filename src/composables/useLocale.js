import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import spanishSpeakingCountries from '../i18n/spanishSpeakingCountries.js'

const STORAGE_KEY = 'site-locale'

export const SUPPORTED_LOCALES = [
  { code: 'pt-BR', name: 'Português', flag: '🇧🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
]

export const SUPPORTED_CODES = SUPPORTED_LOCALES.map((entry) => entry.code)

function readStoredLocale() {
  // Nothing is stored while pre-rendering (no browser).
  if (import.meta.env.SSR || typeof window === 'undefined') return null
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return SUPPORTED_CODES.includes(stored) ? stored : null
  } catch {
    return null
  }
}

function writeStoredLocale(code) {
  try {
    window.localStorage.setItem(STORAGE_KEY, code)
  } catch {
    // Storage unavailable (e.g. private browsing) — the manual choice simply
    // won't persist across visits; the active locale for this visit is
    // unaffected.
  }
}

/**
 * Reads the browser's own reported locale preferences and returns the first
 * explicit region subtag found (e.g. "pt-BR" -> "BR"), or null if none of the
 * reported tags carries a region. Deliberately does not call
 * Intl.Locale#maximize() to guess a region from a bare language tag — see
 * research.md §2.
 */
function detectCountry() {
  if (typeof navigator === 'undefined') return null
  const tags = navigator.languages?.length ? navigator.languages : [navigator.language]
  for (const tag of tags) {
    if (!tag) continue
    try {
      const region = new Intl.Locale(tag).region
      if (region) return region
    } catch {
      // Not a parseable BCP 47 tag — skip it.
    }
  }
  return null
}

/**
 * Applies the country rule (spec.md FR-003/FR-004): Brazil -> pt-BR, a
 * Spanish-speaking country -> es, anything else or undetermined -> en.
 */
function detectLocale() {
  const country = detectCountry()
  if (country === 'BR') return 'pt-BR'
  if (country && spanishSpeakingCountries.includes(country)) return 'es'
  return 'en'
}

/**
 * Resolves the locale the bare root address redirects to (data-model.md
 * `LocalePreference` derivation rule 2): a stored manual choice if present,
 * otherwise the country-based detection above. Used by RootPage after mount.
 */
export function resolveInitialLocale() {
  return readStoredLocale() ?? detectLocale()
}

/**
 * Wraps vue-i18n's useI18n() with the router-driven locale this feature's
 * amendment requires (see contracts/component-contracts.md): the active
 * locale is now derived from the current route's `:locale` param (the URL is
 * the source of truth — data-model.md `LocalePreference`), and switching
 * locale navigates to the equivalent address under the new locale rather than
 * only mutating an in-memory value.
 */
export function useLocale() {
  const { locale: i18nLocale, t } = useI18n({ useScope: 'global' })
  const route = useRoute()
  const router = useRouter()

  // `en` is the default for routes without a :locale param (data-model.md).
  const locale = computed(() => route.params.locale ?? 'en')

  watch(
    locale,
    (value) => {
      if (value) i18nLocale.value = value
    },
    { immediate: true },
  )

  function setLocale(code) {
    if (!SUPPORTED_CODES.includes(code)) return
    writeStoredLocale(code)
    // Routes without a :locale param (root, English not-found) have no
    // equivalent page in another locale, so go to that locale's home.
    if (!route.params.locale) {
      router.push({ name: 'home', params: { locale: code } })
      return
    }
    if (code === route.params.locale) return
    router.push({ name: route.name, params: { ...route.params, locale: code } })
  }

  return {
    locale,
    t,
    setLocale,
    supportedLocales: SUPPORTED_LOCALES,
  }
}
