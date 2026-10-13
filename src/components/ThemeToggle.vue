<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppIcon from './AppIcon.vue'

type Theme = 'light' | 'dark'
const STORAGE_KEY = 'bitnp-deck-theme'

const theme = ref<Theme>('light')

function apply(next: Theme) {
  theme.value = next
  document.documentElement.setAttribute('data-theme', next)
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {
    /* 隐私模式 / 禁用存储时忽略 */
  }
}

function toggle() {
  apply(theme.value === 'dark' ? 'light' : 'dark')
}

onMounted(() => {
  let saved: string | null = null
  try {
    saved = localStorage.getItem(STORAGE_KEY)
  } catch {
    saved = null
  }
  if (saved === 'light' || saved === 'dark') {
    apply(saved)
    return
  }
  apply(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
})
</script>

<template>
  <button
    class="theme-toggle"
    type="button"
    :aria-label="theme === 'dark' ? '切换到亮色模式' : '切换到暗色模式'"
    :title="theme === 'dark' ? '亮色模式' : '暗色模式'"
    @click="toggle"
  >
    <AppIcon :name="theme === 'dark' ? 'sun' : 'moon'" size="1.05em" />
    <span class="theme-toggle__text">{{ theme === 'dark' ? '亮色' : '暗色' }}</span>
  </button>
</template>

<style scoped>
.theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
  color: var(--text-dim);
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.theme-toggle:hover {
  color: var(--primary);
  border-color: var(--primary);
}

.theme-toggle__text {
  font-size: 0.72rem;
  letter-spacing: 0.08em;
}

@media (max-width: 560px) {
  .theme-toggle__text {
    display: none;
  }
}
</style>
