import { describe, it, expect } from 'vitest'
import { useExpandable } from '../../src/composables/useExpandable'

describe('useExpandable', () => {
  it('defaults to collapsed', () => {
    const { isExpanded } = useExpandable()
    expect(isExpanded.value).toBe(false)
  })

  it('toggle() flips the state', () => {
    const { isExpanded, toggle } = useExpandable()
    toggle()
    expect(isExpanded.value).toBe(true)
    toggle()
    expect(isExpanded.value).toBe(false)
  })
})
