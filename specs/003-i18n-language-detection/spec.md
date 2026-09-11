# Feature Specification: Internationalization with Automatic Language Detection

**Feature Branch**: `003-i18n-language-detection`

**Created**: 2026-09-11

**Status**: Draft

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

### Edge Cases

- What happens when the visitor's browser or environment exposes no usable signal at all for determining their country/language? (Must resolve to the English fallback, per User Story 1 Acceptance Scenario 4.)
- What happens when a visitor is in a Spanish-speaking country but has previously and manually chosen Portuguese or English? (The manual choice takes precedence over automatic detection, per User Story 2 Acceptance Scenario 4, until they change it again.)
- How does the interface behave when translated text is noticeably longer than the English original (a known characteristic of Portuguese and Spanish UI strings)? (Layout must not break, overflow, or become illegible — consistent with the site's existing responsive-layout requirements.)
- What happens if a visitor's apparent country changes mid-session (e.g., due to a VPN or network change) after the language has already been determined for that visit? (The already-displayed language is not expected to change mid-session; the rule re-applies on a fresh, new visit.)
- What happens to a visitor whose country legitimately has Spanish as one of multiple official/common languages alongside others? (Still resolves to Spanish under the country rule, since the rule is country-based, not based on the visitor's personal language settings.)
- What happens when the visitor's browser reports a language without any region/country information (e.g., a generic "Spanish" setting with no country attached)? (Country cannot be determined from that alone, so the English fallback applies, per FR-004/FR-011.)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support exactly three interface languages: Brazilian Portuguese, English, and Spanish.
- **FR-002**: System MUST automatically determine, on first load and without requiring any visitor action, which of the three supported languages to display.
- **FR-003**: System MUST apply this country-based rule to determine the automatically selected language: a visitor whose country is Brazil MUST see Brazilian Portuguese; a visitor whose country is a Spanish-speaking country MUST see Spanish; a visitor from any other country MUST see English.
- **FR-004**: System MUST fall back to English whenever the visitor's country cannot be determined, or when it does not map to Portuguese or Spanish under the rule in FR-003.
- **FR-005**: English MUST act as the interface's default language in every situation not explicitly resolved to Portuguese or Spanish by FR-003.
- **FR-006**: System MUST present the internationalized experience as a single, unified version of the site at one set of addresses/pages — MUST NOT implement this feature as three separate pages, routes, or per-language duplicated builds.
- **FR-007**: System MUST provide a visible, clearly labeled control near the top of every page that lets a visitor manually choose any of the three supported languages at any time.
- **FR-008**: When a visitor manually chooses a language, the system MUST immediately re-display the current page's interface in that language without a full navigation to a different URL structure.
- **FR-009**: Once a visitor has manually chosen a language, the system MUST continue showing that language on later pages within the same visit and on later visits, until the visitor manually changes it again — overriding what automatic detection would otherwise select.
- **FR-010**: System MUST translate into all three supported languages: (a) every piece of interface text generated by the site itself (navigation, buttons, section labels such as "Conditional"/"Calculation", the search placeholder, the sidebar heading, the footer, the page title/tagline, and the "no results" message), and (b) the full text of the History page's article. Per-language contributed content files (the code samples and their in-file labels under `content/languages/*.md`) are out of scope for this feature and remain as currently authored.
- **FR-011**: System MUST determine a visitor's country by inferring it from the region/country information the visitor's own browser already reports as part of its language settings (e.g., a locale tag such as `pt-BR`, `es-MX`, or `en-US`), without making any network call to a third-party geolocation service.
- **FR-012**: Translated interface text MUST NOT break the site's existing responsive, single-column layout (see `specs/002-responsive-sidebar-search/spec.md`) regardless of which of the three languages is active.

### Key Entities

- **Supported Language**: One of the three interface languages the site can display (Brazilian Portuguese, English, Spanish); has a code/identifier and a human-readable name shown in the language control.
- **Language Preference**: The language currently governing what a given visitor sees — either automatically determined (via the country rule and English fallback) or manually chosen; once manually chosen, it persists and takes priority over automatic detection for that visitor.
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

## Assumptions

- "Spanish-speaking country" means a country where Spanish is an official or de facto national language (a standard, well-known list — e.g., Spain and the Spanish-speaking countries of Latin America); this list does not change as part of this feature and is treated as static reference data.
- A visitor's manually chosen language is remembered locally for that visitor (e.g., persisted in their browser) and is not shared across different devices or browsers for the same person, consistent with how the site already has no visitor accounts or backend user storage (see `specs/001-hello-world-multilang-site/plan.md`).
- The three supported languages, their country-based selection rule, and the English default/fallback are fixed as stated in this spec; adding a fourth language or changing the country-to-language mapping is out of scope for this feature.
- This feature does not introduce visitor accounts, cookies requiring consent banners, or server-side session storage beyond what a static, backend-free site already assumes (see `specs/001-hello-world-multilang-site/research.md`).
