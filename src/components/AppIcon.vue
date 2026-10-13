<script setup lang="ts">
import { computed } from 'vue'
import { iconPaths } from '../data/icons'

const props = withDefaults(defineProps<{ name: string; size?: string }>(), {
  size: '1em',
})

/** 找不到对应图标时渲染成一个小圆点，避免页面出现空白 */
const paths = computed(() => iconPaths[props.name] ?? ['M12 12h.01'])
</script>

<template>
  <svg
    class="app-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.7"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
    :style="{ width: props.size, height: props.size }"
  >
    <path v-for="(d, i) in paths" :key="i" :d="d" />
  </svg>
</template>

<style scoped>
.app-icon {
  display: block;
  flex: none;
}
</style>
