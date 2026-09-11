# Feature Specification: About Page

**Feature Branch**: `005-about-page`

**Created**: 2026-09-11

**Status**: Draft

**Input**: User description: "Criar uma página de sobre, mencionar que foi criado por Valdir Giorgi, para testar a ferramenta Spec Kit, colocar o repositório do GitHub do Spec Kit. Mencionar o meu blog e redirecionar também para onde eu fizer um artigo sobre Spec Kit, que vai ficar em blog.valdir.dev.br/speckit. Colocar também o repositório deste projeto e corrigir os repositórios já mencionados como teste no site — o repositório será criado em https://github.com/ValdirGiorgi/helloworld. Quem quiser contribuir, é só acessar o link do repositório, que vai ter lá o como contribuir. Criar o 'Sobre' nos três idiomas."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A visitor learns the project's origin and purpose (Priority: P1)

A visitor curious about what this site is and why it exists opens an About page and learns it was
created by Valdir Giorgi as an exercise to test the Spec Kit tool, with a way to learn more about
that tool and about the author's own account of building this project with it.

**Why this priority**: This is the core purpose of the page the user asked for — without it,
there's no About page at all.

**Independent Test**: Can be fully tested by opening the About page and confirming it states who
created the project and why, with working links to Spec Kit's own repository and the author's blog
article about the experience — independent of the contribution path (User Story 2) or the footer
link fix (User Story 3).

**Acceptance Scenarios**:

1. **Given** a visitor opens the About page, **When** it loads, **Then** it states the project was
   created by Valdir Giorgi to test the Spec Kit tool.
2. **Given** the About page, **When** a visitor looks for more information about the tool used to
   build the project, **Then** they find a link to Spec Kit's own GitHub repository.
3. **Given** the About page, **When** a visitor wants to read the author's own account of the
   experience, **Then** they find a link to the author's blog article about it.
4. **Given** a visitor is viewing the site in any of its three supported languages, **When** they
   open the About page, **Then** its content is displayed in that same language.

---

### User Story 2 - A visitor finds how to contribute (Priority: P1)

A visitor who wants to contribute a new language sees, from the About page, a clear path to the
project's own repository, where the contribution guide already lives.

**Why this priority**: Explicitly requested and directly serves the project's existing goal of
growing through community contributions (see `CONTRIBUTING.md`); without a visible link, a visitor
reading the About page has no way to act on wanting to contribute.

**Independent Test**: Can be fully tested by opening the About page and confirming it includes a
working link to the project's own repository, described as where the contribution guide is found —
independent of the page's origin-story content (User Story 1).

**Acceptance Scenarios**:

1. **Given** the About page, **When** a visitor wants to contribute a new language, **Then** they
   find a link to the project's own GitHub repository.
2. **Given** the About page, **When** a visitor reads the text around that link, **Then** it makes
   clear that the repository is where the contribution instructions are found.

---

### User Story 3 - Existing placeholder repository links are corrected (Priority: P1)

A visitor who clicks the "contribute" link already present in the site's footer is taken to the
real project repository, not a non-functional placeholder address.

**Why this priority**: This is a real, currently-live defect (the footer's GitHub link doesn't
point anywhere useful yet) that undermines the exact contribution goal User Story 2 serves; now
that the real repository address is known, there's no reason to leave it broken.

**Independent Test**: Can be fully tested by clicking the footer's GitHub link on any page and
confirming it opens the project's real repository — independent of whether the About page (User
Story 1/2) exists yet.

**Acceptance Scenarios**:

1. **Given** any page of the site, **When** a visitor clicks the footer's "GitHub" contribution
   link, **Then** they are taken to the project's real repository address, not a placeholder.

---

### Edge Cases

- What happens if a visitor clicks the blog article link before that article is published? (Out of
  this project's control — the link points to the article's intended, stated address regardless of
  whether it's live yet; the article itself is an external resource the author maintains outside
  this repository.)
- What happens if a visitor opens the About page in a language whose translation isn't complete?
  (Not an accepted state — like every other page on the site, the About page's content must be
  fully translated into all three supported languages before this feature ships.)
- How does a visitor discover the About page in the first place? (It must be reachable from the
  site's main navigation, the same way the existing Languages and History pages already are.)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an About page, reachable from the site's main navigation the
  same way the existing Languages and History pages already are.
- **FR-002**: The About page MUST state that the project was created by Valdir Giorgi as an
  exercise to test the Spec Kit tool.
- **FR-003**: The About page MUST include a link to the Spec Kit tool's own GitHub repository.
- **FR-004**: The About page MUST mention the author's blog and include a link to the specific
  article about this project's Spec Kit experience, at `blog.valdir.dev.br/speckit`.
- **FR-005**: The About page MUST include a link to this project's own GitHub repository, at
  `https://github.com/ValdirGiorgi/helloworld`.
- **FR-006**: The About page MUST state that a visitor who wants to contribute a new language can
  do so via the project's repository (FR-005), where the contribution guide is found.
- **FR-007**: The About page's content MUST be available in all three of the site's supported
  languages, and MUST display in whichever language is currently active, consistent with the rest
  of the site's translated content.
- **FR-008**: Every placeholder repository link already present in the site's rendered interface
  (currently: the footer's "contribute a new language" link) MUST be corrected to point to the
  project's real repository address (FR-005).

### Key Entities

- **About Page Content**: The set of translated text and external links the About page presents —
  the creation/purpose statement, and the three links (Spec Kit's repository, the author's blog
  article, this project's repository) — available in each of the site's three supported languages,
  the same way other translated site content already is.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of visitors who open the About page in any of the three supported languages see
  fully translated content, with no missing or wrong-language text.
- **SC-002**: A visitor can reach the About page from any other page of the site in a single
  interaction (one click from the main navigation).
- **SC-003**: Every repository link on the site (the About page's links and the existing footer
  link) resolves to a real, working GitHub repository — zero placeholder addresses remain.
- **SC-004**: A visitor who reads only the About page can correctly state who created the project,
  why, and where to go to learn more about the tool used, read the author's account of it, or
  contribute a new language.

## Assumptions

- "The repositories already mentioned as a test/placeholder on the site" refers to the footer's
  "contribute a new language" link (currently pointing at a placeholder GitHub address) — the only
  placeholder repository address currently live in the site's rendered interface; this is the link
  FR-008 corrects.
- The About page is added to the site's main navigation alongside the existing "Languages" and
  "History" links, consistent with how every other page is already discoverable.
- The blog article at `blog.valdir.dev.br/speckit` is an external resource the author maintains
  outside this repository; this feature only adds the link to the About page and isn't responsible
  for that article's content or publish status.
- Spec Kit's own GitHub repository is the well-known, official one
  (`github.com/github/spec-kit`), already referenced elsewhere in this project's own documentation.
- Per the user's own wording, the contribution link (FR-006) points to the project's repository as
  a whole (FR-005), not a separate, additional link straight to a specific file within it — a
  visitor is expected to find the contribution guide once they arrive at the repository.
- The About page's content is limited to what's described in this spec (attribution, purpose, and
  the described links); it does not need to duplicate the fuller project description already on
  the home page or in the repository's own README.
