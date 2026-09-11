const REQUIRED_VARIABLE_KINDS = ['integer', 'string', 'float']

const FIXED_OUTCOME_SECTIONS = [
  { field: 'calculation', heading: 'Calculation', expectedResult: '4' },
  { field: 'loop', heading: 'Loop', expectedResult: '1 2 3 4 5' },
  { field: 'function', heading: 'Function', expectedResult: '5' },
  { field: 'stringConcatenation', heading: 'String Concatenation', expectedResult: 'Olá, Mary' },
  { field: 'list', heading: 'List', expectedResult: '6' },
  { field: 'boolean', heading: 'Boolean Comparison', expectedResult: 'true' },
]

function slugFromFilename(filename) {
  return filename.replace(/\.md$/, '').toLowerCase()
}

/**
 * Minimal YAML frontmatter reader for the single field this template needs
 * (`name: "..."`) — avoids pulling in a full YAML/frontmatter parser (and its
 * Node-only Buffer dependency) for one string field.
 */
function parseFrontmatter(raw) {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/)
  if (!match) return { data: {}, content: raw }

  const [, frontmatter, content] = match
  const nameMatch = frontmatter.match(/^name:\s*["']?([^"'\n]*)["']?\s*$/m)
  return {
    data: { name: nameMatch ? nameMatch[1].trim() : undefined },
    content,
  }
}

function extractSection(content, heading) {
  const headingPattern = new RegExp(`^## ${heading}\\s*$`, 'm')
  const headingMatch = content.match(headingPattern)
  if (!headingMatch) return null

  const start = headingMatch.index + headingMatch[0].length
  const rest = content.slice(start)
  const nextHeadingMatch = rest.match(/^## .+$/m)
  const end = nextHeadingMatch ? nextHeadingMatch.index : rest.length
  return rest.slice(0, end)
}

function dedent(text) {
  const lines = text.split('\n')
  if (lines.length && lines[lines.length - 1].trim() === '') lines.pop()
  const indents = lines
    .filter((line) => line.trim().length > 0)
    .map((line) => line.match(/^ */)[0].length)
  const commonIndent = indents.length ? Math.min(...indents) : 0
  return lines.map((line) => line.slice(commonIndent)).join('\n')
}

function extractCodeBlock(text) {
  if (!text) return null
  const match = text.match(/```[^\n]*\n([\s\S]*?)```/)
  if (!match) return null
  return dedent(match[1])
}

function extractResultLabel(text) {
  if (!text) return null
  const match = text.match(/-\s*result:\s*(.+)/)
  return match ? match[1].trim() : null
}

function requireNonEmpty(value, filename, sectionName) {
  if (!value || !value.trim()) {
    throw new Error(
      `Language file "${filename}" is missing a required "${sectionName}" section (see contracts/language-template.md).`,
    )
  }
  return value
}

/**
 * Parses one "code + declared `- result:`" section shared by Calculation, Loop,
 * Function, String Concatenation, List, and Boolean Comparison. The declared
 * result MUST match the fixed constant for that example across every language
 * (spec FR-007, FR-009–FR-013) — this is a labeled-declaration check, not code
 * execution (see research.md §11).
 */
function parseFixedOutcomeSection(content, { heading, expectedResult }, filename) {
  const body = extractSection(content, heading)
  if (!body) {
    throw new Error(
      `Language file "${filename}" is missing a required "${heading}" section (see contracts/language-template.md).`,
    )
  }

  const code = extractCodeBlock(body)
  requireNonEmpty(code, filename, heading)

  const result = extractResultLabel(body)
  if (!result) {
    throw new Error(
      `Language file "${filename}" is missing the "- result: ${expectedResult}" label in its "${heading}" section.`,
    )
  }
  if (result !== expectedResult) {
    throw new Error(
      `Language file "${filename}" declares "${heading}" result "${result}", but every language MUST report "${expectedResult}" for this example (see contracts/language-entry.schema.json).`,
    )
  }

  return { code, result }
}

function parseVariables(variablesBody, filename) {
  if (!variablesBody) {
    throw new Error(
      `Language file "${filename}" is missing a required "Variables" section (see contracts/language-template.md).`,
    )
  }

  const variables = REQUIRED_VARIABLE_KINDS.map((kind) => {
    const itemPattern = new RegExp(`-\\s*${kind}:\\s*\\n\\s*` + '```[^\\n]*\\n([\\s\\S]*?)```', 'm')
    const match = variablesBody.match(itemPattern)
    if (!match) {
      throw new Error(
        `Language file "${filename}" is missing the required "${kind}" variable declaration in its "Variables" section.`,
      )
    }
    return { kind, code: dedent(match[1]) }
  })

  return variables
}

/**
 * Parses a raw Markdown string authored against contracts/language-template.md
 * into the LanguageEntry shape described in data-model.md.
 */
export function parseLanguageFile(raw, filename) {
  const { data, content } = parseFrontmatter(raw)

  const name = requireNonEmpty(data.name, filename, 'name (frontmatter)')

  const helloWorldBody = extractSection(content, 'Hello World')
  const helloWorldCode = extractCodeBlock(helloWorldBody)
  requireNonEmpty(helloWorldCode, filename, 'Hello World')

  const conditionalBody = extractSection(content, 'Conditional')
  const conditionalCode = extractCodeBlock(conditionalBody)
  requireNonEmpty(conditionalCode, filename, 'Conditional')

  const fixedOutcomeEntries = Object.fromEntries(
    FIXED_OUTCOME_SECTIONS.map((section) => [
      section.field,
      parseFixedOutcomeSection(content, section, filename),
    ]),
  )

  const variablesBody = extractSection(content, 'Variables')
  const variables = parseVariables(variablesBody, filename)

  return {
    slug: slugFromFilename(filename),
    name,
    helloWorld: { code: helloWorldCode },
    conditional: { code: conditionalCode },
    ...fixedOutcomeEntries,
    variables,
  }
}
