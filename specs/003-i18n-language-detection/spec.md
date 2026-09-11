# Feature Specification: Internationalization with Automatic Language Detection

**Feature Branch**: `003-i18n-language-detection`

**Created**: 2026-09-11

**Status**: Draft

**Amendment (2026-09-11)**: After the initial version of this feature was implemented, a gap was
identified: search engines generally crawl with a single default locale/region and cannot discover
content that only changes based on client-side detection at one shared URL. Without a distinct,
crawlable address per language, only one language (in practice, English) is realistically
indexable by search engines — the other two languages exist for human visitors who land on the
site and use the switcher, but are effectively invisible to search. This amendment adds distinct,
shareable URLs per language so each of the three languages can be discovered and indexed on its
own, while keeping the single-application architecture the original feature established (see the
revised FR-006 and new FR-013–FR-017, User Story 3, and related Success Criteria/Assumptions
below). This corrects — rather than being an exception to — the original architecture requirement,
which was about not duplicating page templates or builds, not about avoiding routes altogether.

**Input**: User description: "Internacionalizar o projeto e implementar detecção automática de idioma. Idiomas suportados: português do Brasil, inglês e espanhol. Detecção: identificar automaticamente o idioma do usuário. Fallback: aplicar inglês quando o idioma não for detectado ou estiver fora dos idiomas suportados. Idioma padrão: inglês. Regra por país: usuário de país cujo idioma seja espanhol recebe espanhol; usuário do Brasil recebe português do Brasil; demais casos recebem inglês. Arquitetura: não criar três páginas separadas. Implementar uma única versão internacionalizada, com o conteúdo exibido no idioma detectado, com opção no topo de mudar o idioma. Requisito final: garantir que a detecção de idioma e o fallback para inglês na interface web funcionem."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - The site opens in the visitor's own language automatically (Priority: P1)

A first-time visitor opens the site without taking any action and sees its interface in the language appropriate to their country: Portuguese for a visitor in Brazil, Spanish for a visitor in a Spanish-speaking country, and English for everyone else — including whenever their country can't be determined.

**Why this priority**: This is the feature's core purpose and its own stated "final requirement" — a visitor who never touches a language control must still land on the correct language, with English as a safe, guaranteed fallback.

**Independent Test**: Can be fully tested by simulating visitors from different countries (Brazil, a Spanish-speaking country, any other country, and an undeterminable one) loading the site fresh and confirming each sees the correct language — independent of the manual switcher in User Story 2.

**Acceptance Scenarios**:

1. **Given** a visitor's country is Brazil, **When** they load the site for the first time, **Then** the interface is displayed in Brazilian Portuguese.
2. **Given** a visitor's country is one where Spanish is the language, **When** they load the site for the first time, **Then** the interface is displayed in Spanish.
3. **Given** a visitor's country is any other country, **When** they load the site for the first time, **Then** the interface is displayed in English.
4. **Given** the visitor's country cannot be determined at all, **When** they load the site, **Then** the interface is displayed in English.
5. **Given** the visitor's country is determined but does not map to Portuguese or Spanish under the country rule, **When** they load the site, **Then** the interface is displayed in English (the default language).

---

### User Story 2 - Switching languages manually from anywhere on the site (Priority: P1)

A visitor who wants a different language than the one automatically selected can change it at any time using a clearly visible control near the top of the page, and the whole interface updates immediately to the chosen language.

**Why this priority**: Automatic detection will sometimes not match what a visitor actually wants (shared devices, travel, personal preference); a manual override is explicitly requested and is necessary for the feature to be usable, not just automatic.

**Independent Test**: Can be fully tested by loading the site in any auto-detected language, using the top-of-page language control to pick a different one of the three supported languages, and confirming the interface immediately switches — independent of which language was auto-detected.

**Acceptance Scenarios**:

1. **Given** the site is displayed in any of the three supported languages, **When** the visitor opens the language control at the top of the page, **Then** all three supported languages are listed as options.
2. **Given** the language control is open, **When** the visitor selects a different supported language, **Then** the entire interface immediately re-renders in that language, without a new separate page or a full site reload to a different URL structure.
3. **Given** a visitor has manually selected a language, **When** they navigate to another page or section of the same site, **Then** their manually selected language remains active.
4. **Given** a visitor has manually selected a language, **When** they return to the site later, **Then** the site shows their previously chosen language rather than re-running automatic detection.

---

### User Story 3 - Each language is reachable, shareable, and discoverable by search engines at its own address (Priority: P2)

A search engine, or a person who received a link, can reach any of the three languages directly at
its own distinct web address — not only by landing on the site and using the switcher — so that
each language can be found through search and shared/bookmarked reliably in that exact language.

**Why this priority**: Without this, only one language is realistically discoverable through
search (see Amendment note above); this is what makes the other two languages actually reachable
by new visitors, not just by people who already found the site some other way. It builds on User
Stories 1 and 2 rather than replacing them.

**Independent Test**: Can be fully tested by requesting each of the three languages' addresses
directly (as a search engine or a fresh visitor with a shared link would) and confirming each shows
the correct, complete language every time — independent of that visitor's own detected country or
any previously stored preference.

**Acceptance Scenarios**:

1. **Given** a visitor opens the site's address with no language specified, **When** the page
   loads, **Then** they end up at the address for the language automatic detection selected for
   them (or their previously stored manual choice, if any), and that address is itself
   shareable/bookmarkable.
2. **Given** a person opens a link to one specific language's address directly (e.g., one shared by
   someone else), **When** the page loads, **Then** that exact language is displayed, regardless of
   the visitor's own detected country or any language they may have previously chosen on that
   device.
3. **Given** a search engine requests any one of the three languages' addresses, **When** it reads
   the page, **Then** the page identifies its own language and points to the equivalent addresses
   of the other two languages, so the search engine can associate all three as versions of the same
   content.
4. **Given** a visitor uses the top-of-page language control described in User Story 2, **When**
   they select a different language, **Then** the address shown in the browser updates to that
   language's address for the current page (not only the displayed text).

---

### Edge Cases

- What happens when the visitor's browser or environment exposes no usable signal at all for determining their country/language? (Must resolve to the English fallback, per User Story 1 Acceptance Scenario 4.)
- What happens when a visitor is in a Spanish-speaking country but has previously and manually chosen Portuguese or English? (The manual choice takes precedence over automatic detection, per User Story 2 Acceptance Scenario 4, until they change it again.)
- How does the interface behave when translated text is noticeably longer than the English original (a known characteristic of Portuguese and Spanish UI strings)? (Layout must not break, overflow, or become illegible — consistent with the site's existing responsive-layout requirements.)
- What happens if a visitor's apparent country changes mid-session (e.g., due to a VPN or network change) after the language has already been determined for that visit? (The already-displayed language is not expected to change mid-session; the rule re-applies on a fresh, new visit.)
- What happens to a visitor whose country legitimately has Spanish as one of multiple official/common languages alongside others? (Still resolves to Spanish under the country rule, since the rule is country-based, not based on the visitor's personal language settings.)
- What happens when the visitor's browser reports a language without any region/country information (e.g., a generic "Spanish" setting with no country attached)? (Country cannot be determined from that alone, so the English fallback applies, per FR-004/FR-011.)
- What happens when a visitor who previously chose a language manually opens a link to a *different* language's address directly? (The address the visitor explicitly opened wins — per User Story 3 Acceptance Scenario 2 — since a direct link is a more specific signal than a stored past preference; the stored preference still governs the no-language address in User Story 3 Acceptance Scenario 1.)
- What happens if the language-specific addresses cannot be made to work on the site's hosting (see Assumptions)? (This is a hosting precondition, not a design choice — see Assumptions for the fallback if it cannot be met.)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support exactly three interface languages: Brazilian Portuguese, English, and Spanish.
- **FR-002**: System MUST automatically determine, on first load and without requiring any visitor action, which of the three supported languages to display.
- **FR-003**: System MUST apply this country-based rule to determine the automatically selected language: a visitor whose country is Brazil MUST see Brazilian Portuguese; a visitor whose country is a Spanish-speaking country MUST see Spanish; a visitor from any other country MUST see English.
- **FR-004**: System MUST fall back to English whenever the visitor's country cannot be determined, or when it does not map to Portuguese or Spanish under the rule in FR-003.
- **FR-005**: English MUST act as the interface's default language in every situation not explicitly resolved to Portuguese or Spanish by FR-003.
- **FR-006** *(revised by the 2026-09-11 amendment)*: System MUST implement all three languages
  from a single application and a single build/deployment (one codebase, one set of deployed
  assets) — MUST NOT duplicate page templates or produce separate builds per language. Distinct,
  per-language addresses (FR-013) are routes within this same single application, not an exception
  to this requirement; the original prohibition on "separate pages/routes" is corrected here to
  clarify it meant *duplicated templates/builds*, not addressable routes as such.
- **FR-007**: System MUST provide a visible, clearly labeled control near the top of every page that lets a visitor manually choose any of the three supported languages at any time.
- **FR-008**: When a visitor manually chooses a language, the system MUST immediately re-display the current page's interface in that language without a full navigation to a different URL structure.
- **FR-009**: Once a visitor has manually chosen a language, the system MUST continue showing that language on later pages within the same visit and on later visits, until the visitor manually changes it again — overriding what automatic detection would otherwise select.
- **FR-010**: System MUST translate into all three supported languages: (a) every piece of interface text generated by the site itself (navigation, buttons, section labels such as "Conditional"/"Calculation", the search placeholder, the sidebar heading, the footer, the page title/tagline, and the "no results" message), and (b) the full text of the History page's article. Per-language contributed content files (the code samples and their in-file labels under `content/languages/*.md`) are out of scope for this feature and remain as currently authored.
- **FR-011**: System MUST determine a visitor's country by inferring it from the region/country information the visitor's own browser already reports as part of its language settings (e.g., a locale tag such as `pt-BR`, `es-MX`, or `en-US`), without making any network call to a third-party geolocation service.
- **FR-012**: Translated interface text MUST NOT break the site's existing responsive, single-column layout (see `specs/002-responsive-sidebar-search/spec.md`) regardless of which of the three languages is active.
- **FR-013** *(added by the 2026-09-11 amendment)*: System MUST expose each of the three supported languages at its own distinct, shareable, bookmarkable address, rather than only changing displayed text at one shared address.
- **FR-014** *(added)*: Opening one language's address directly MUST display that exact language, taking precedence over automatic country-based detection (FR-002–FR-005) and over any previously stored manual preference (FR-009) for that address.
- **FR-015** *(added)*: Every page MUST declare, in a way a browser or search engine can read, both its own current language and the equivalent addresses of the other two languages for the same page, so a search engine can associate all three as versions of one another.
- **FR-016** *(added)*: The site's address with no language specified MUST resolve to one of the three language-specific addresses — a visitor's previously stored manual preference (FR-009) if one exists, otherwise the automatic country-based rule (FR-002–FR-005) — so a visitor always ends up on a language-specific, shareable address rather than an ambiguous one.
- **FR-017** *(added)*: Using the manual language control (FR-007) MUST update the visible address to the corresponding language-specific address for the page the visitor is currently on, in addition to updating the displayed text (FR-008).

### Key Entities

- **Supported Language**: One of the three interface languages the site can display (Brazilian Portuguese, English, Spanish); has a code/identifier and a human-readable name shown in the language control.
- **Language Preference**: The language currently governing what a given visitor sees — either automatically determined (via the country rule and English fallback) or manually chosen; once manually chosen, it persists and takes priority over automatic detection for that visitor. As of the 2026-09-11 amendment, opening a specific language's address directly is a third, even higher-priority source (see FR-014).
- **Language Address** *(added by the 2026-09-11 amendment)*: The distinct, shareable address at which one specific supported language is reachable; every page of the site has one such address per language, and each one links to its counterparts in the other two languages (FR-015).
- **Translatable Content**: A piece of text that must exist in all three supported languages — either a short interface string (a button, label, or message generated by the site) or the History page's article; excludes the per-language contributed code sample files, which stay as currently authored regardless of the active language.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of first-time visitors whose country is Brazil see the interface in Brazilian Portuguese without taking any action.
- **SC-002**: 100% of first-time visitors whose country is a Spanish-speaking country see the interface in Spanish without taking any action.
- **SC-003**: 100% of first-time visitors whose country cannot be determined, or whose country does not map to Portuguese or Spanish, see the interface in English without taking any action.
- **SC-004**: A visitor can switch to any of the three supported languages in a single interaction (one click/tap on the top-of-page language control) from any page of the site.
- **SC-005**: A returning visitor who previously chose a language manually sees that same language on their next visit, with no re-selection needed.
- **SC-006**: Across all three supported languages, zero pieces of translated interface text are cut off, overlapping, or cause horizontal scrolling on mobile or desktop widths.
- **SC-007**: The History page's article is fully readable, with no missing or English-only paragraphs, in all three supported languages.
- **SC-008** *(added by the 2026-09-11 amendment)*: Each of the three languages is reachable at its own distinct, bookmarkable/shareable address, for every page of the site.
- **SC-009** *(added)*: A person who opens a shared link to one specific language's address sees that exact language 100% of the time, regardless of their own browser/country signals or any previously stored preference.
- **SC-010** *(added)*: Inspecting any language's page (without running any interactive script beyond what a search-engine crawler already executes) reveals its declared language and the addresses of the other two languages' equivalent pages.

## Assumptions

- "Spanish-speaking country" means a country where Spanish is an official or de facto national language (a standard, well-known list — e.g., Spain and the Spanish-speaking countries of Latin America); this list does not change as part of this feature and is treated as static reference data.
- A visitor's manually chosen language is remembered locally for that visitor (e.g., persisted in their browser) and is not shared across different devices or browsers for the same person, consistent with how the site already has no visitor accounts or backend user storage (see `specs/001-hello-world-multilang-site/plan.md`).
- The three supported languages, their country-based selection rule, and the English default/fallback are fixed as stated in this spec; adding a fourth language or changing the country-to-language mapping is out of scope for this feature.
- This feature does not introduce visitor accounts, cookies requiring consent banners, or server-side session storage beyond what a static, backend-free site already assumes (see `specs/001-hello-world-multilang-site/research.md`).
- **(Added by the 2026-09-11 amendment)** Per-language addresses take the form of a language-code
  segment in the site's own address path (e.g., a `/en/`, `/pt-BR/`, or `/es/` prefix) — a widely
  used, search-engine-friendly pattern — rather than separate subdomains or a query parameter; the
  exact mechanism is a planning-phase decision, not a business requirement.
- **(Added)** The address with no language specified resolving to a specific language's address
  (FR-016) is expected to change what the visitor sees at that no-language address, not to
  duplicate content at two different addresses — avoiding two addresses serving identical content,
  which is unhelpful for search indexing.
- **(Added)** Making per-language addresses work requires the site's hosting to route any of those
  addresses back to the single application (the same underlying requirement a single-page
  application already has for any address beyond its home address). This is a hosting precondition
  outside this feature's control to guarantee; if the hosting cannot support it, the addresses
  described in FR-013–FR-017 cannot be delivered as specified, and the language switch would need
  to remain address-independent as it was before this amendment (User Stories 1 and 2 alone,
  without User Story 3) until hosting that supports it is available.
