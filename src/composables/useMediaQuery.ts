import { onBeforeUnmount, onMounted, ref } from 'vue'

/** 响应式的 window.matchMedia（用于少数没法只用 CSS 表达的分支） */
export function useMediaQuery(query: string) {
  const matches = ref(false)
  let list: MediaQueryList | null = null

  function update(event: MediaQueryList | MediaQueryListEvent) {
    matches.value = event.matches
  }

  onMounted(() => {
    list = window.matchMedia(query)
    matches.value = list.matches
    list.addEventListener('change', update)
  })

  onBeforeUnmount(() => {
    list?.removeEventListener('change', update)
    list = null
  })

  return matches
}
