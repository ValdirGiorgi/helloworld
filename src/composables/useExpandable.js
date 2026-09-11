import { ref } from 'vue'

/**
 * Shared expand/collapse state for a single language entry's card.
 * Ephemeral, per-view UI state only — not persisted (see data-model.md).
 */
export function useExpandable(initialValue = false) {
  const isExpanded = ref(initialValue)

  function toggle() {
    isExpanded.value = !isExpanded.value
  }

  return { isExpanded, toggle }
}
