<script setup lang="ts">
import { computed, defineAsyncComponent, ref, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import type { BeaconConfig, Venue } from '../types'

// three.js 体积不小，异步加载：只有真正翻到这一屏时才会去下地图那一段代码
const BitnpMap = defineAsyncComponent(() => import('./BitnpMap.vue'))

/**
 * 「活动场地」一屏的地图区：BitnpMap（3D 据点地图）+ 据点按钮 + 详情面板。
 *
 *  · 鼠标悬停据点按钮 → 对应光柱变亮变长（与直接悬停在光柱上一致）
 *  · 点击据点按钮 → 与点击光柱完全一致（镜头推近、其它光柱熄灭、弹出详情）
 *  · 地图只在第一次进入这一屏时挂载，之后常驻但离开视口时暂停渲染
 */
const props = defineProps<{
  venues: Venue[]
  /** 这一屏是否在视口里 */
  active: boolean
}>()

const mounted = ref(false)
const selectedId = ref<string | null>(null)
const hoveredId = ref<string | null>(null)

watch(
  () => props.active,
  (isActive) => {
    if (isActive) mounted.value = true
  },
  { immediate: true },
)

const selected = computed(() => props.venues.find((venue) => venue.id === selectedId.value) ?? null)

const beacons = computed<BeaconConfig[]>(() =>
  props.venues.map((venue) => ({
    id: venue.id,
    label: venue.name,
    x: venue.x,
    z: venue.z,
  })),
)

/**
 * 设置选中项（不切换）：地图那边回传的光柱点击 / 关闭都走这里。
 * 注意这里不能用"点到了同一个就取消"的切换逻辑——选中地图光柱时，
 * 地图会再 emit 一次 beacon-select 回来，切换逻辑会立刻把选中又取消掉。
 */
function select(id?: string) {
  selectedId.value = id ?? null
}

/**
 * 点据点按钮：没选中就选中它（和点光柱完全一样），已经选中就取消，
 * 回到"没有据点被选中"的状态。
 * 悬停高亮完全由指针位置决定，这里不碰 hoveredId。
 */
function toggleVenue(id: string) {
  if (id === selectedId.value) {
    selectedId.value = null
    return
  }
  select(id)
}

/**
 * 据点按钮的"悬停"：只认鼠标 / 触控笔。
 * 触摸 tap 也会派发 pointerenter，但不会有对应的 pointerleave，
 * 高亮会一直留在信标上（取消选择后就露馅了），所以触摸直接忽略。
 */
function onChipEnter(id: string, event: PointerEvent) {
  if (event.pointerType === 'touch') return
  hoveredId.value = id
}

function onChipLeave(event: PointerEvent) {
  if (event.pointerType === 'touch') return
  hoveredId.value = null
}

/** 地图上的光柱被点击 / 关闭 */
function onBeaconSelect(beacon: BeaconConfig) {
  select(beacon.id)
}

function onBeaconClose() {
  select()
}
</script>

<template>
  <div class="outposts">
    <div class="outposts__stage">
      <BitnpMap
        v-if="mounted"
        :beacons="beacons"
        :hovered-id="hoveredId"
        :focused-id="selectedId"
        :paused="!props.active"
        @beacon-select="onBeaconSelect"
        @beacon-close="onBeaconClose"
      />
      <div v-else class="outposts__idle">
        <AppIcon name="map" size="1.6em" />
        <span>进入这一屏后加载 3D 校区地图</span>
      </div>

      <div class="outposts__chips">
        <button
          v-for="venue in props.venues"
          :key="venue.id"
          type="button"
          class="outposts__chip"
          :class="{ 'is-active': venue.id === selectedId, 'is-hover': venue.id === hoveredId }"
          @click="toggleVenue(venue.id)"
          @pointerenter="onChipEnter(venue.id, $event)"
          @pointerleave="onChipLeave($event)"
        >
          <AppIcon name="pin" size="0.95em" />
          <span>{{ venue.name }}</span>
        </button>
      </div>

      <p class="outposts__legend hint">
        移动鼠标（手机上倾斜设备）微调视角 · 点击光柱或上方按钮查看详情
      </p>
    </div>

    <Transition name="panel">
      <aside v-if="selected" class="outposts__panel">
        <button class="outposts__close" type="button" aria-label="关闭详情" @click="select()">
          ×
        </button>
        <p class="outposts__eyebrow">OUTPOST</p>
        <h3 class="outposts__title">{{ selected.name }}</h3>
        <div class="outposts__rule" />
        <p class="outposts__row">
          <span class="outposts__label">位置</span>{{ selected.location }}
        </p>
        <p class="outposts__row">
          <span class="outposts__label">服务</span>{{ selected.description }}
        </p>
        <p v-if="selected.note" class="outposts__row">
          <span class="outposts__label">备注</span>{{ selected.note }}
        </p>
        <p class="outposts__hint">点击地图空白处也可以关闭</p>
      </aside>
    </Transition>
  </div>
</template>

<style scoped>
.outposts {
  position: relative;
  flex: 1;
  min-height: 0;
  width: 100%;
  isolation: isolate;
}

/*
 * 触屏设备：地图高度只由宽度决定（宽高比），
 * 这样页面滚动时地址栏伸缩不会改变 canvas 尺寸、也就不会反复 resize。
 * 竖屏按 4:5 给足高度；横屏等矮屏由 max-height（用 svh，同样不随地址栏变化）压回来。
 */
@media (pointer: coarse) {
  .outposts {
    flex: none;
    aspect-ratio: 4 / 5;
    max-height: calc(100svh - var(--header-h) - 2 * var(--pad));
    min-height: 240px;
  }
}

.outposts__stage {
  position: relative;
  height: 100%;
  width: 100%;
  border-radius: var(--radius);
  overflow: hidden;
  background: #0b1020;
  border: 1px solid var(--border);
}

.outposts__idle {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: rgba(255, 210, 74, 0.7);
  font-size: 0.8rem;
  letter-spacing: 0.1em;
}

/* —— 地图上方的据点按钮 —— */
.outposts__chips {
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  z-index: 3;
  pointer-events: none;
}

.outposts__chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 210, 74, 0.35);
  background: rgba(12, 18, 34, 0.78);
  color: rgba(255, 210, 74, 0.85);
  font-size: 0.74rem;
  cursor: pointer;
  pointer-events: auto;
  backdrop-filter: blur(6px);
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.outposts__chip:hover,
.outposts__chip.is-hover {
  color: #ffe9a8;
  border-color: rgba(255, 210, 74, 0.9);
  box-shadow: 0 0 18px rgba(255, 210, 74, 0.35);
}

.outposts__chip.is-active {
  background: rgba(255, 210, 74, 0.92);
  color: #10131f;
  border-color: rgba(255, 210, 74, 0.92);
}

.outposts__legend {
  position: absolute;
  left: 14px;
  bottom: 10px;
  z-index: 3;
  color: rgba(255, 255, 255, 0.5);
}

/* —— 详情面板 —— */
.outposts__panel {
  position: absolute;
  top: 52px;
  right: 12px;
  bottom: 12px;
  transform: none;
  width: min(42%, 420px);
  overflow: auto;
  padding: 22px 22px 26px;
  border-radius: 16px;
  border: 1px solid rgba(255, 210, 74, 0.35);
  background: rgba(12, 18, 34, 0.94);
  box-shadow:
    0 0 0 1px rgba(255, 210, 74, 0.08) inset,
    0 24px 60px rgba(0, 0, 0, 0.55),
    0 0 42px rgba(255, 210, 74, 0.14);
  color: #ffd24a;
  backdrop-filter: blur(10px);
  z-index: 4;
}

.outposts__close {
  position: absolute;
  top: 8px;
  right: 10px;
  border: none;
  background: none;
  color: rgba(255, 210, 74, 0.7);
  font-size: 1.2rem;
  line-height: 1;
  cursor: pointer;
}

.outposts__close:hover {
  color: #ffe9a8;
}

.outposts__eyebrow {
  font-size: 0.6rem;
  letter-spacing: 0.34em;
  color: rgba(255, 210, 74, 0.55);
  margin-bottom: 6px;
}

.outposts__title {
  font-size: clamp(1rem, 2.4vmin, 1.5rem);
  letter-spacing: 0.06em;
  color: #ffe9a8;
  text-shadow: 0 0 18px rgba(255, 210, 74, 0.45);
}

.outposts__rule {
  height: 1px;
  margin: 14px 0;
  background: rgba(255, 210, 74, 0.7);
}

.outposts__row {
  margin-bottom: 12px;
  font-size: clamp(0.72rem, 1.7vmin, 0.86rem);
  line-height: 1.7;
  color: rgba(226, 232, 240, 0.85);
}

.outposts__label {
  display: block;
  margin-bottom: 2px;
  font-size: 0.62rem;
  letter-spacing: 0.2em;
  color: rgba(255, 210, 74, 0.65);
}

.outposts__hint {
  margin-top: 14px;
  font-size: 0.62rem;
  letter-spacing: 0.1em;
  color: rgba(255, 210, 74, 0.5);
}

.panel-enter-active,
.panel-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.panel-enter-from,
.panel-leave-to {
  opacity: 0;
  transform: translateX(24px);
}

/* —— 竖屏 / 窄屏：详情面板仍然靠右（约半屏）。
      被选中的据点在聚焦时会偏到画面左侧，所以这样不会挡住地图上的据点位置。—— */
@media (max-width: 900px), (orientation: portrait) {
  .outposts__panel {
    top: 44px;
    right: 8px;
    bottom: 8px;
    left: auto;
    width: min(58%, 320px);
    max-height: none;
    padding: 14px 14px 18px;
  }

  .outposts__chip {
    padding: 4px 10px;
    font-size: 0.68rem;
  }
}

@media (max-height: 560px) {
  .outposts__legend {
    display: none;
  }

  .outposts__panel {
    top: 46px;
    right: 8px;
    bottom: 8px;
    left: auto;
    width: min(52%, 340px);
    max-height: none;
    padding: 12px 14px 16px;
  }
}
</style>
