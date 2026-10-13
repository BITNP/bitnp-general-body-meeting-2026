<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AppIcon from './components/AppIcon.vue'
import SideBar from './components/SideBar.vue'
import ThemeToggle from './components/ThemeToggle.vue'
import CoverSlide from './components/slides/CoverSlide.vue'
import MembersSlide from './components/slides/MembersSlide.vue'
import OrgSlide from './components/slides/OrgSlide.vue'
import VenuesSlide from './components/slides/VenuesSlide.vue'
import AssetsSlide from './components/slides/AssetsSlide.vue'
import TimelineSlide from './components/slides/TimelineSlide.vue'
import PlansSlide from './components/slides/PlansSlide.vue'
import ClosingSlide from './components/slides/ClosingSlide.vue'
import { meeting, slides } from './data/deck'
import logoUrl from './assets/logo.png'

/**
 * 外壳：整页从上往下滚动（像官网一样），左侧是章节侧栏。
 *  · 键盘：↓ / → / PgDn / 空格 下一节，↑ / ← / PgUp 上一节，Home / End 首尾，F 全屏，Esc 收起目录
 *  · 侧栏：横屏是"图标栏 + 悬停伸出"，竖屏是"右上角按钮 + 全屏抽屉"（见 SideBar.vue）
 */
const index = ref(0)
const sidebarOpen = ref(false)

const sectionEls = new Map<string, HTMLElement>()
const ratios = new Map<string, number>()
let observer: IntersectionObserver | null = null

const activeId = computed(() => slides[index.value].id)
const isActive = (id: string) => activeId.value === id

function setSectionRef(el: unknown, id: string) {
  if (el instanceof HTMLElement) sectionEls.set(id, el)
}

/** 跳到第 target 节；竖屏抽屉会被顺手收起来 */
function goTo(target: number, behavior: ScrollBehavior = 'smooth') {
  const clamped = Math.min(slides.length - 1, Math.max(0, target))
  index.value = clamped
  sidebarOpen.value = false
  sectionEls.get(slides[clamped].id)?.scrollIntoView({ behavior, block: 'start' })
}

const next = () => goTo(index.value + 1)
const prev = () => goTo(index.value - 1)

function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => undefined)
    return
  }
  document.documentElement.requestFullscreen().catch(() => undefined)
}

/* -------------------------------------------------------------------- 键盘 */

const TEXT_INPUTS = new Set(['INPUT', 'TEXTAREA', 'SELECT'])

function isTypingTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null
  if (!el) return false
  return el.isContentEditable || TEXT_INPUTS.has(el.tagName)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    sidebarOpen.value = false
    return
  }
  if (isTypingTarget(event.target)) return

  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowDown':
    case 'PageDown':
      event.preventDefault()
      next()
      break
    case 'ArrowLeft':
    case 'ArrowUp':
    case 'PageUp':
      event.preventDefault()
      prev()
      break
    case 'Home':
      event.preventDefault()
      goTo(0)
      break
    case 'End':
      event.preventDefault()
      goTo(slides.length - 1)
      break
    case ' ':
      // 焦点在按钮上时交给按钮自己处理，避免连跳两节
      if ((event.target as HTMLElement | null)?.tagName === 'BUTTON') return
      event.preventDefault()
      next()
      break
    case 'f':
    case 'F':
      toggleFullscreen()
      break
    default:
      break
  }
}

/* ---------------------------------- 滚动时更新"当前章节"（用于侧栏高亮与地图暂停） */

function setupObserver() {
  if (typeof IntersectionObserver === 'undefined') return

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = (entry.target as HTMLElement).dataset.sectionId
        if (id) ratios.set(id, entry.intersectionRatio)
      })

      const ranked = slides
        .map((slide) => ({ id: slide.id, ratio: ratios.get(slide.id) ?? 0 }))
        .sort((a, b) => b.ratio - a.ratio)
      const bestId = ranked[0]?.id
      if (!bestId) return

      const found = slides.findIndex((slide) => slide.id === bestId)
      if (found >= 0 && found !== index.value) index.value = found
    },
    { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
  )

  slides.forEach((slide) => {
    const el = sectionEls.get(slide.id)
    if (el) observer?.observe(el)
  })
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  setupObserver()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  observer?.disconnect()
  observer = null
})
</script>

<template>
  <div class="app">
    <header class="app__header">
      <div class="app__brand">
        <img class="app__logo" :src="logoUrl" :alt="meeting.association" />
        <div class="app__brand-text">
          <strong>{{ meeting.association }}</strong>
          <span>{{ meeting.title }}</span>
        </div>
      </div>

      <div class="app__tools">
        <span class="chip app__counter">
          {{ String(index + 1).padStart(2, '0') }} / {{ String(slides.length).padStart(2, '0') }}
          · {{ slides[index].nav }}
        </span>
        <ThemeToggle />
        <button
          class="app__menu"
          type="button"
          :aria-expanded="sidebarOpen"
          aria-label="打开目录"
          @click="sidebarOpen = !sidebarOpen"
        >
          <AppIcon :name="sidebarOpen ? 'x' : 'menu'" size="1.05em" />
          <span>目录</span>
        </button>
      </div>
    </header>

    <SideBar
      :sections="slides"
      :index="index"
      :open="sidebarOpen"
      @select="goTo"
      @close="sidebarOpen = false"
    />

    <main class="app__main">
      <section
        v-for="section in slides"
        :key="section.id"
        :id="`section-${section.id}`"
        :ref="(el) => setSectionRef(el, section.id)"
        :data-section-id="section.id"
        class="app__section"
      >
        <CoverSlide v-if="section.id === 'cover'" :active="isActive(section.id)" />
        <MembersSlide v-else-if="section.id === 'members'" />
        <OrgSlide v-else-if="section.id === 'org'" />
        <VenuesSlide v-else-if="section.id === 'venues'" :active="isActive(section.id)" />
        <AssetsSlide v-else-if="section.id === 'assets'" />
        <TimelineSlide v-else-if="section.id === 'timeline'" />
        <PlansSlide v-else-if="section.id === 'plans'" />
        <ClosingSlide v-else />
      </section>
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100dvh;
  background: var(--bg);
}

.app__header {
  position: sticky;
  top: 0;
  z-index: 30;
  height: var(--header-h);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 clamp(8px, 2vmin, 22px);
  background: var(--surface);
  border-bottom: 1px solid var(--border);
}

.app__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.app__logo {
  width: clamp(26px, 4vmin, 36px);
  aspect-ratio: 1;
  object-fit: contain;
  border-radius: 50%;
}

.app__brand-text {
  min-width: 0;
  display: flex;
  flex-direction: column;
  line-height: 1.25;
}

.app__brand-text strong {
  font-size: clamp(0.75rem, 1.8vmin, 0.95rem);
  letter-spacing: 0.04em;
}

.app__brand-text span {
  font-size: clamp(0.56rem, 1.4vmin, 0.72rem);
  color: var(--text-dim);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.app__tools {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: none;
}

.app__counter {
  font-family: 'Consolas', monospace;
  letter-spacing: 0.08em;
}

/* 目录按钮：只在"侧栏收起成抽屉"的形态下出现 */
.app__menu {
  display: none;
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

.app__menu:hover {
  color: var(--primary);
  border-color: var(--primary);
}

.app__menu > span {
  font-size: 0.72rem;
  letter-spacing: 0.08em;
}

.app__main {
  margin-left: var(--rail-w);
}

.app__section {
  scroll-margin-top: var(--header-h);
}

.app__section + .app__section {
  border-top: 1px solid var(--border);
}

@media (max-width: 900px), (orientation: portrait) {
  .app__menu {
    display: inline-flex;
  }
}

@media (max-width: 780px) {
  .app__counter {
    display: none;
  }
}

@media (max-height: 560px) {
  .app__brand-text span {
    display: none;
  }
}
</style>
