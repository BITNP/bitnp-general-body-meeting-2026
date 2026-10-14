import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import logoLight from '../assets/logo.png'
import logoDark from '../assets/logo-dark.png'

/**
 * 亮 / 暗主题各有一张 logo，按当前主题换着用。
 * 主题是打在 <html data-theme="light|dark"> 上的（见 ThemeToggle.vue），
 * 这里监听这个属性，返回该用的那张图。
 */
export function useThemeLogo() {
  const isDark = ref(false)
  let observer: MutationObserver | null = null

  function read() {
    isDark.value = document.documentElement.getAttribute('data-theme') === 'dark'
  }

  onMounted(() => {
    read()
    if (typeof MutationObserver === 'undefined') return
    observer = new MutationObserver(read)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    observer = null
  })

  return computed(() => (isDark.value ? logoDark : logoLight))
}
