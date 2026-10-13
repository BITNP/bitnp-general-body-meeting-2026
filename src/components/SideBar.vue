<script setup lang="ts">
import AppIcon from './AppIcon.vue'
import type { SlideMeta } from '../types'

/**
 * 左侧章节侧栏。
 *  · 横屏（宽屏）：常驻一条"只显示图标"的窄栏，鼠标悬停 / 键盘聚焦时伸出显示文字
 *  · 竖屏（窄屏）：默认隐藏，靠右上角按钮打开成全屏抽屉，选完自动收起
 */
const props = defineProps<{
  sections: SlideMeta[]
  /** 当前所在章节 */
  index: number
  /** 竖屏抽屉是否展开 */
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'select', index: number): void
  (e: 'close'): void
}>()
</script>

<template>
  <nav class="rail" :class="{ 'is-open': props.open }" aria-label="章节导航">
    <div class="rail__head">
      <span class="rail__title">目录</span>
      <button class="rail__close" type="button" aria-label="收起目录" @click="emit('close')">
        <AppIcon name="x" size="1.1em" />
      </button>
    </div>

    <ol class="rail__list">
      <li v-for="(section, i) in props.sections" :key="section.id">
        <button
          type="button"
          class="nav"
          :class="{ 'is-active': i === props.index }"
          :aria-current="i === props.index ? 'true' : undefined"
          :title="section.nav"
          @click="emit('select', i)"
        >
          <span class="nav__icon"><AppIcon :name="section.icon" size="1.05em" /></span>
          <span class="nav__text">
            <span class="nav__label">{{ section.nav }}</span>
            <span class="nav__meta">{{ section.kicker }}</span>
          </span>
        </button>
      </li>
    </ol>

    <p class="rail__foot">网络无限 开拓不懈</p>
  </nav>
</template>

<style scoped>
.rail {
  position: fixed;
  left: 0;
  top: var(--header-h);
  bottom: 0;
  width: var(--rail-w);
  z-index: 40;
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border-right: 1px solid var(--border);
  overflow: hidden;
  transition: width 0.26s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.26s ease;
}

.rail:hover {
  width: 236px;
  box-shadow: 0 24px 60px var(--shadow);
}

/* 键盘聚焦时才伸出（:focus-visible 不匹配鼠标点击后的焦点，
   所以点完侧栏再移开鼠标，侧栏会自己收回去） */
.rail:has(:focus-visible) {
  width: 236px;
  box-shadow: 0 24px 60px var(--shadow);
}

.rail__head {
  display: none;
}

.rail__list {
  flex: 1;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 0;
  overflow: hidden auto;
}

.nav {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 0;
  border: none;
  background: none;
  color: var(--text-dim);
  text-align: left;
  cursor: pointer;
  transition: color 0.2s ease, background 0.2s ease;
}

/* 图标格宽度 = 收起时的栏宽，所以收起状态下图标正好居中 */
.nav__icon {
  position: relative;
  flex: none;
  width: var(--rail-w);
  height: 42px;
  display: grid;
  place-items: center;
}

.nav__icon::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 3px;
  height: 0;
  border-radius: 0 3px 3px 0;
  background: var(--primary);
  transform: translateY(-50%);
  transition: height 0.22s ease;
}

.nav.is-active .nav__icon::before {
  height: 24px;
}

.nav:hover {
  color: var(--text);
  background: var(--hover);
}

.nav.is-active {
  color: var(--primary);
  background: var(--primary-soft);
}

.nav__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.rail:hover .nav__text {
  opacity: 1;
}

.rail:has(:focus-visible) .nav__text {
  opacity: 1;
}

.nav__label {
  font-size: 0.82rem;
  color: var(--text);
}

.nav.is-active .nav__label {
  font-weight: 700;
  color: var(--primary);
}

.nav__meta {
  font-family: 'Consolas', monospace;
  font-size: 0.56rem;
  letter-spacing: 0.16em;
  opacity: 0.75;
}

.rail__foot {
  padding: 10px 16px 14px;
  font-size: 0.58rem;
  letter-spacing: 0.2em;
  color: var(--text-dim);
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.rail:hover .rail__foot {
  opacity: 1;
}

.rail:has(:focus-visible) .rail__foot {
  opacity: 1;
}

/* ==========================================================================
   竖屏 / 窄屏：默认隐藏，展开时是一层覆盖全屏的抽屉
   （媒体查询要与 src/style.css 里的 --rail-w 保持一致）
   ========================================================================== */

@media (max-width: 900px), (orientation: portrait) {
  .rail {
    top: 0;
    right: 0;
    width: auto;
    padding: clamp(14px, 4vh, 28px) clamp(16px, 6vw, 48px) clamp(18px, 5vh, 32px);
    background: var(--scrim);
    border-right: none;
    backdrop-filter: blur(16px);
    overflow: hidden auto;
    overscroll-behavior: contain;
    /* 收起状态：整体停在屏幕左侧外面（留在 DOM 里，展开时才有动画） */
    transform: translateX(-100%);
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition:
      transform 0.34s cubic-bezier(0.4, 0, 0.2, 1),
      opacity 0.34s ease,
      visibility 0.34s;
  }

  /* 点「目录」后从左侧拉伸出来 */
  .rail.is-open {
    transform: translateX(0);
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
  }

  /* 抽屉里的内容再跟一点点，形成层次感 */
  .rail__head,
  .rail__list,
  .rail__foot {
    transform: translateX(-18px);
    opacity: 0;
    transition:
      transform 0.34s cubic-bezier(0.4, 0, 0.2, 1) 0.06s,
      opacity 0.34s ease 0.06s;
  }

  .rail.is-open .rail__head,
  .rail.is-open .rail__list,
  .rail.is-open .rail__foot {
    transform: translateX(0);
    opacity: 1;
  }

  /* 抽屉形态下不参与"悬停伸出"，宽度始终是整屏 */
  .rail:hover {
    width: auto;
    box-shadow: none;
  }

  .rail:has(:focus-visible) {
    width: auto;
    box-shadow: none;
  }

  .rail__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border);
  }

  .rail__title {
    font-size: 0.78rem;
    letter-spacing: 0.32em;
    color: var(--text-dim);
  }

  .rail__close {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text-dim);
    cursor: pointer;
  }

  .rail__list {
    gap: 8px;
    padding: 14px 0 0;
    overflow: visible;
  }

  .nav {
    padding: 6px 8px 6px 0;
    border-radius: var(--radius-sm);
  }

  .nav__icon {
    width: 46px;
    height: 46px;
    border-radius: 12px;
    border: 1px solid var(--border);
    background: var(--surface);
  }

  .nav__text {
    opacity: 1;
  }

  .nav__label {
    font-size: 1rem;
  }

  .nav__meta {
    font-size: 0.6rem;
  }

  .rail__foot {
    padding: 18px 0 0;
  }
}
</style>
