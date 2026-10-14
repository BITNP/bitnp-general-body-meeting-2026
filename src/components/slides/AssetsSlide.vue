<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import AppIcon from '../AppIcon.vue'
import SlideHeader from '../SlideHeader.vue'
import { useMediaQuery } from '../../composables/useMediaQuery'
import { assetCategories, assetItems } from '../../data/assets'

/**
 * 数字资产：两级转盘（整块用 Canvas 画）
 *  · 内圈 = 分类，外圈 = 当前分类下的条目
 *  · 两个圈共用一个圆心，圆心贴住画布边缘：横屏贴左边缘（只露右半圆）、
 *    竖屏贴上边缘（只露下半圆），选中的那张永远停在"基准方向"上
 *  · 滚轮 / 拖动 / 点击都能操作。几何、描边、扇形、文字换行、命中判定、
 *    转动动画全部自己算，不依赖 CSS transform / mask / conic-gradient，
 *    所以任何浏览器画出来的都是同一个样子
 */

/* --------------------------------- 选中 --------------------------------- */

const activeCategoryId = ref(assetCategories[0].id)
const firstOfCategory = (categoryId: string) => assetItems.find((item) => item.category === categoryId)
const activeItemId = ref(firstOfCategory(assetCategories[0].id)?.id ?? assetItems[0].id)

const activeCategory = computed(
  () => assetCategories.find((category) => category.id === activeCategoryId.value) ?? assetCategories[0],
)
const items = computed(() => assetItems.filter((item) => item.category === activeCategoryId.value))
const activeItem = computed(() => assetItems.find((item) => item.id === activeItemId.value) ?? null)
const categoryIndex = computed(() =>
  Math.max(
    0,
    assetCategories.findIndex((category) => category.id === activeCategoryId.value),
  ),
)
const itemIndex = computed(() => Math.max(0, items.value.findIndex((item) => item.id === activeItemId.value)))

/* --------------------------------- 参数 --------------------------------- */

/** 每格 60°：半圆里正好是「选中 + 两侧各一」 */
const STEP = 60
/** 扇形底纹的角宽（比格子窄一点，块与块之间留缝） */
const SLICE = 46
const ITEM_FONT = 13
const CAT_FONT = 11.5
const LINE_RATIO = 1.35
const ITEM_PAD_X = 12
const ITEM_PAD_Y = 8
const CAT_PAD_X = 10
const CAT_PAD_Y = 7
const CARD_RADIUS = 10

const portrait = useMediaQuery('(max-width: 900px), (orientation: portrait)')
/** 选中卡片停在哪个方向：横屏朝右（东），竖屏朝下（南） */
const baseAngle = computed(() => (portrait.value ? 180 : 90))

type RingName = 'cat' | 'item'
const RINGS: RingName[] = ['cat', 'item']

/* -------------------------------- 运行时 -------------------------------- */

const canvasEl = ref<HTMLCanvasElement | null>(null)
const dragging = ref<RingName | null>(null)

/** 渲染用的额外角度（度）：拖动时跟手，松手后缓缓归零，这就是转动动画 */
const spin: Record<RingName, number> = { cat: 0, item: 0 }
/** 换分类时外圈整体淡入 */
let itemAlpha = 1

let frame = 0
let dragAngle = 0
let wheelAccumulator = 0

interface Layout {
  cx: number
  cy: number
  rCat: number
  rItem: number
  catW: number
  itemW: number
}

interface WrappedCard {
  lines: string[]
  height: number
}

interface Palette {
  surface: string
  border: string
  text: string
  textDim: string
  font: string
}

let layout: Layout | null = null
let palette: Palette = {
  surface: '#ffffff',
  border: '#eaeaea',
  text: '#333333',
  textDim: '#6b6375',
  font: 'sans-serif',
}
/** 分类色：把数据里的 var(--xxx) 解析成真实色值 */
let categoryColors: Record<string, string> = {}
/** 文字换行缓存：key = 圈 + 字体 + 宽度 */
let wrapCache = new Map<string, WrappedCard[]>()

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const activeIndexOf = (ring: RingName) => (ring === 'cat' ? categoryIndex.value : itemIndex.value)
const listOf = (ring: RingName) => (ring === 'cat' ? assetCategories : items.value)

/* ------------------------------ 选择与动画 ------------------------------ */

/** 索引差折到 (-n/2, n/2]：让转盘就近转过去 */
function wrapDiff(diff: number, count: number) {
  if (count <= 0) return 0
  let value = diff % count
  if (value > count / 2) value -= count
  if (value <= -count / 2) value += count
  return value
}

function applyIndex(ring: RingName, index: number) {
  if (ring === 'cat') {
    const category = assetCategories[index]
    if (!category) return
    if (category.id === activeCategoryId.value) return
    activeCategoryId.value = category.id
    const first = firstOfCategory(category.id)
    activeItemId.value = first ? first.id : activeItemId.value
    // 外圈整圈换了一批条目：重新淡入，并把它的转动角清零
    spin.item = 0
    itemAlpha = 0
    return
  }

  const item = items.value[index]
  if (item) activeItemId.value = item.id
}

/**
 * 把某个圈转到指定索引。
 * 先把 spin 补上一个整格，渲染位置就与转动前完全重合（连续），
 * 再让 spin 缓缓归零 —— 看上去就是转盘平滑地转了一格。
 */
function selectIndex(ring: RingName, index: number) {
  const count = listOf(ring).length
  if (count === 0) return
  const target = ((index % count) + count) % count
  const current = activeIndexOf(ring)
  if (target === current) return
  spin[ring] += wrapDiff(target - current, count) * STEP
  applyIndex(ring, target)
  schedulePaint()
}

function animateStep(ring: RingName, step: number) {
  if (step !== 0) selectIndex(ring, activeIndexOf(ring) + step)
}

/** 每帧把 spin / itemAlpha 往目标推一点，返回是否还需要继续 */
function stepAnimation() {
  let busy = false
  for (const ring of RINGS) {
    if (dragging.value === ring) continue
    const value = spin[ring]
    if (Math.abs(value) < 0.08) {
      spin[ring] = 0
      continue
    }
    spin[ring] = value * 0.82
    busy = true
  }
  if (itemAlpha < 1) {
    itemAlpha = Math.min(1, itemAlpha + 0.1)
    busy = true
  }
  return busy
}

function schedulePaint() {
  if (frame) return
  frame = window.requestAnimationFrame(() => {
    frame = 0
    const busy = stepAnimation()
    paint()
    if (busy) schedulePaint()
  })
}

/* --------------------------------- 画布 --------------------------------- */

function readPalette() {
  const root = getComputedStyle(document.documentElement)
  const read = (name: string, fallback: string) => root.getPropertyValue(name).trim() || fallback
  palette = {
    surface: read('--surface', '#ffffff'),
    border: read('--border', '#eaeaea'),
    text: read('--text', '#333333'),
    textDim: read('--text-dim', '#6b6375'),
    font: getComputedStyle(document.body).fontFamily || 'sans-serif',
  }

  categoryColors = {}
  for (const category of assetCategories) {
    const match = /var\(\s*(--[\w-]+)\s*\)/.exec(category.color)
    const value = match ? root.getPropertyValue(match[1]).trim() : category.color
    categoryColors[category.id] = value || '#d97319'
  }

  wrapCache = new Map()
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + width - r, y)
  ctx.arcTo(x + width, y, x + width, y + r, r)
  ctx.lineTo(x + width, y + height - r)
  ctx.arcTo(x + width, y + height, x + width - r, y + height, r)
  ctx.lineTo(x + r, y + height)
  ctx.arcTo(x, y + height, x, y + height - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

/** 按宽度把中文/英文折成最多两行，超出补省略号 */
function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines = 2,
): string[] {
  if (ctx.measureText(text).width <= maxWidth) return [text]

  const lines: string[] = []
  let line = ''
  for (const char of text) {
    const next = line + char
    if (line && ctx.measureText(next).width > maxWidth) {
      lines.push(line)
      line = char
      if (lines.length === maxLines) break
    } else {
      line = next
    }
  }

  if (lines.length < maxLines && line) lines.push(line)

  // 还有剩的：最后一行收省略号
  const consumed = lines.join('').length
  if (consumed < text.length) {
    let last = lines[lines.length - 1] ?? ''
    while (last && ctx.measureText(`${last}…`).width > maxWidth) last = last.slice(0, -1)
    lines[lines.length - 1] = `${last}…`
  }
  return lines.length ? lines : [text]
}

/** 折行结果（带缓存，避免每帧都 measureText） */
function cardsFor(ctx: CanvasRenderingContext2D, ring: RingName, texts: string[], width: number) {
  const fontSize = ring === 'cat' ? CAT_FONT : ITEM_FONT
  const padX = ring === 'cat' ? CAT_PAD_X : ITEM_PAD_X
  const padY = ring === 'cat' ? CAT_PAD_Y : ITEM_PAD_Y
  const key = `${ring}:${fontSize}:${width}:${texts.join('|')}`
  const cached = wrapCache.get(key)
  if (cached) return cached

  ctx.font = `600 ${fontSize}px ${palette.font}`
  const lineHeight = Math.round(fontSize * LINE_RATIO)
  const cards = texts.map((text) => {
    const lines = wrapLines(ctx, text, width - padX * 2)
    return { lines, height: Math.round(padY * 2 + lines.length * lineHeight) }
  })
  wrapCache.set(key, cards)
  return cards
}

const toRad = (degrees: number) => (degrees * Math.PI) / 180

/** 角度按"以北为 0、顺时针为正"，换成画布坐标 */
function pointAt(cx: number, cy: number, angle: number, radius: number) {
  const rad = toRad(angle)
  return { x: cx + Math.sin(rad) * radius, y: cy - Math.cos(rad) * radius }
}

/** 卡片越靠近基准方向越亮，转出半圆就完全隐藏 */
function alphaFor(distance: number) {
  if (distance > 92) return 0
  if (distance < 46) return 1
  return (92 - distance) / 46
}

function paint() {
  const canvas = canvasEl.value
  const ctx = canvas?.getContext('2d')
  if (!canvas || !ctx) return

  const width = canvas.clientWidth
  const height = canvas.clientHeight
  if (width < 2 || height < 2) return

  const dpr = window.devicePixelRatio || 1
  const pixelWidth = Math.round(width * dpr)
  const pixelHeight = Math.round(height * dpr)
  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth
    canvas.height = pixelHeight
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, width, height)

  const isPortrait = portrait.value
  const cx = isPortrait ? width / 2 : 0
  const cy = isPortrait ? 0 : height / 2

  const itemW = isPortrait ? clamp(width * 0.34, 112, 164) : clamp(width * 0.26, 128, 176)
  const catW = isPortrait ? clamp(width * 0.25, 86, 116) : clamp(width * 0.15, 86, 116)

  const catCards = cardsFor(
    ctx,
    'cat',
    assetCategories.map((category) => category.name),
    catW,
  )
  const itemCards = cardsFor(
    ctx,
    'item',
    items.value.map((item) => item.name),
    itemW,
  )

  const itemMaxH = itemCards.reduce((max, card) => Math.max(max, card.height), 34)
  const catMaxH = catCards.reduce((max, card) => Math.max(max, card.height), 32)

  // 半径：既要放得下两侧卡片（±60°），也要让卡片本身不顶到边上
  const rItem = isPortrait
    ? clamp(Math.min(0.577 * (width - itemW), height - itemMaxH / 2 - 8), 88, 200)
    : clamp(Math.min(width - itemW / 2 - 10, 0.577 * (height - itemMaxH)), 104, 228)
  const rCat = Math.max(rItem * 0.46, (catMaxH + itemMaxH) / 2 + 10)

  layout = { cx, cy, rCat, rItem, catW, itemW }

  // —— 两圈虚线圆环 ——
  ctx.save()
  ctx.strokeStyle = palette.border
  ctx.lineWidth = 1
  ctx.setLineDash([4, 6])
  for (const radius of [rCat, rItem]) {
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.setLineDash([])
  ctx.restore()

  // —— 扇形底纹（在卡片下面）——
  const drawWedge = (ring: RingName, offset: number, accent: string) => {
    const distance = Math.abs(offset)
    if (distance > 104) return
    const alpha = (distance < 44 ? 1 : (104 - distance) / 60) * 0.16
    if (alpha <= 0.002) return
    const radius = ring === 'cat' ? rCat : rItem
    const center = baseAngle.value + offset
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.fillStyle = accent
    ctx.beginPath()
    ctx.arc(cx, cy, radius + 40, toRad(center - SLICE / 2 - 90), toRad(center + SLICE / 2 - 90))
    ctx.arc(cx, cy, radius - 40, toRad(center + SLICE / 2 - 90), toRad(center - SLICE / 2 - 90), true)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  assetCategories.forEach((category, index) => {
    const offset = wrapDiff(index - categoryIndex.value, assetCategories.length) * STEP + spin.cat
    drawWedge('cat', offset, categoryColors[category.id] ?? palette.textDim)
  })
  items.value.forEach((_, index) => {
    const offset = wrapDiff(index - itemIndex.value, items.value.length) * STEP + spin.item
    drawWedge('item', offset, categoryColors[activeCategoryId.value] ?? palette.textDim)
  })

  // —— 卡片 ——
  const drawCard = (ring: RingName, offset: number, card: WrappedCard, accent: string, active: boolean) => {
    const alpha = alphaFor(Math.abs(offset))
    if (alpha <= 0.01) return
    const radius = ring === 'cat' ? rCat : rItem
    const cardWidth = ring === 'cat' ? catW : itemW
    const fontSize = ring === 'cat' ? CAT_FONT : ITEM_FONT
    const padX = ring === 'cat' ? CAT_PAD_X : ITEM_PAD_X
    const lineHeight = Math.round(fontSize * LINE_RATIO)
    const point = pointAt(cx, cy, baseAngle.value + offset, radius)

    ctx.save()
    ctx.globalAlpha = alpha * (ring === 'item' ? itemAlpha : 1)

    if (active) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.16)'
      ctx.shadowBlur = 18
      ctx.shadowOffsetY = 7
    }
    roundedRect(ctx, point.x - cardWidth / 2, point.y - card.height / 2, cardWidth, card.height, CARD_RADIUS)
    ctx.fillStyle = palette.surface
    ctx.fill()
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0

    if (active) {
      ctx.globalAlpha = alpha * 0.12
      ctx.fillStyle = accent
      ctx.fill()
      ctx.globalAlpha = alpha * (ring === 'item' ? itemAlpha : 1)
    }

    ctx.lineWidth = active ? 1.6 : 1
    ctx.strokeStyle = active ? accent : palette.border
    ctx.stroke()

    ctx.font = `${active ? 700 : 600} ${fontSize}px ${palette.font}`
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'
    ctx.fillStyle = active && ring === 'cat' ? accent : palette.text
    const totalHeight = card.lines.length * lineHeight
    let ty = point.y - totalHeight / 2 + lineHeight / 2
    for (const line of card.lines) {
      ctx.fillText(line, point.x, ty, cardWidth - padX * 2)
      ty += lineHeight
    }

    ctx.restore()
  }

  const itemAccent = categoryColors[activeCategoryId.value] ?? palette.textDim

  assetCategories.forEach((category, index) => {
    const offset = wrapDiff(index - categoryIndex.value, assetCategories.length) * STEP + spin.cat
    const card = catCards[index]
    if (card) {
      drawCard('cat', offset, card, categoryColors[category.id] ?? palette.textDim, index === categoryIndex.value)
    }
  })
  items.value.forEach((_, index) => {
    const offset = wrapDiff(index - itemIndex.value, items.value.length) * STEP + spin.item
    const card = itemCards[index]
    if (card) drawCard('item', offset, card, itemAccent, index === itemIndex.value)
  })

  // —— 圆心的小圆点 ——
  ctx.save()
  ctx.globalAlpha = 0.8
  ctx.fillStyle = palette.border
  ctx.beginPath()
  ctx.arc(cx, cy, 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

/* ------------------------------ 指针 / 滚轮 ------------------------------ */

function canvasRect() {
  return canvasEl.value?.getBoundingClientRect() ?? null
}

function centerPoint() {
  const rect = canvasRect()
  if (!rect) return null
  return { x: portrait.value ? rect.width / 2 : 0, y: portrait.value ? 0 : rect.height / 2 }
}

/** 指针位置（相对画布） */
function localPoint(event: { clientX: number; clientY: number }) {
  const rect = canvasRect()
  if (!rect) return null
  return { x: event.clientX - rect.left, y: event.clientY - rect.top }
}

/** 指针方向：以北为 0、顺时针为正 */
function angleAt(point: { x: number; y: number }) {
  const center = centerPoint()
  if (!center) return 0
  return (Math.atan2(point.x - center.x, -(point.y - center.y)) * 180) / Math.PI
}

function radiusAt(point: { x: number; y: number }) {
  const center = centerPoint()
  if (!center) return 0
  return Math.hypot(point.x - center.x, point.y - center.y)
}

/** 指针离哪一圈更近 */
function ringAt(point: { x: number; y: number }): RingName {
  if (!layout) return 'item'
  const distance = radiusAt(point)
  return Math.abs(distance - layout.rCat) <= Math.abs(distance - layout.rItem) ? 'cat' : 'item'
}

/** 命中判定：指针下是哪张卡片 */
function cardAt(event: { clientX: number; clientY: number }) {
  const point = localPoint(event)
  if (!point) return null
  const ring = ringAt(point)
  const count = listOf(ring).length
  if (count === 0) return null
  const offset = angleAt(point) - baseAngle.value - spin[ring]
  const index = Math.round(offset / STEP)
  return { ring, index: (((activeIndexOf(ring) + index) % count) + count) % count }
}

function startWindowDragTracking() {
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
  window.addEventListener('pointercancel', onPointerUp)
}

function stopWindowDragTracking() {
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerUp)
}

function onPointerDown(event: PointerEvent) {
  if (event.pointerType === 'mouse' && event.button !== 0) return
  const point = localPoint(event)
  if (!point) return
  dragging.value = ringAt(point)
  dragAngle = angleAt(point)
  startWindowDragTracking()
}

function onPointerMove(event: PointerEvent) {
  const ring = dragging.value
  if (!ring) return
  const angle = angleAt(event)
  let delta = angle - dragAngle
  if (delta > 180) delta -= 360
  if (delta < -180) delta += 360
  dragAngle = angle
  spin[ring] += delta
  paint()
}

/** 松手：转得不多就当点击（选中手指下那张），否则吸附到最近一格 */
function onPointerUp(event: PointerEvent) {
  stopWindowDragTracking()
  const ring = dragging.value
  dragging.value = null
  if (!ring) return

  const total = spin[ring]
  if (Math.abs(total) < 6) {
    const hit = cardAt(event)
    if (hit) selectIndex(hit.ring, hit.index)
    paint()
    return
  }
  animateStep(ring, Math.round(-total / STEP))
  schedulePaint()
}

function onWheel(event: WheelEvent) {
  event.preventDefault()
  const point = localPoint(event)
  if (!point) return
  const ring = ringAt(point)
  if (listOf(ring).length < 2) return

  wheelAccumulator += event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY
  if (Math.abs(wheelAccumulator) < 40) return
  const step = wheelAccumulator > 0 ? 1 : -1
  wheelAccumulator = 0
  animateStep(ring, step)
}

/* ------------------------------- 生命周期 ------------------------------- */

let observer: ResizeObserver | null = null
let themeObserver: MutationObserver | null = null

onMounted(() => {
  readPalette()
  const canvas = canvasEl.value
  if (canvas && typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(() => {
      wrapCache = new Map()
      paint()
    })
    observer.observe(canvas)
  }
  if (typeof MutationObserver !== 'undefined') {
    themeObserver = new MutationObserver(() => {
      readPalette()
      paint()
    })
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  }
  window.addEventListener('resize', paint)
  paint()
})

onBeforeUnmount(() => {
  stopWindowDragTracking()
  observer?.disconnect()
  themeObserver?.disconnect()
  window.removeEventListener('resize', paint)
  if (frame) window.cancelAnimationFrame(frame)
})

watch(portrait, () => {
  wrapCache = new Map()
  paint()
})

/** 数据/选中变了重画（详情卡片走正常的模板渲染） */
watch([categoryIndex, itemIndex, activeCategoryId, () => items.value.length], () => schedulePaint())
</script>

<template>
  <section class="slide assets">
    <SlideHeader
      kicker="AGENDA 04"
      title="数字资产概况"
      desc="内圈选分类、外圈选条目：滚轮或手指滑动可以转动转盘，也可以直接点扇形卡片，选中条目的详情显示在右侧。"
    >
      <template #side>
        <span class="chip">
          共 {{ assetItems.length }} 项 · {{ assetCategories.length }} 个分类
        </span>
        <span class="chip">滚轮 / 滑动旋转 · 点卡片选择</span>
      </template>
    </SlideHeader>

    <div class="assets__grid">
      <div
        class="dial"
        :class="{ 'is-dragging': dragging !== null }"
        data-no-swipe
        @pointerdown="onPointerDown"
        @wheel="onWheel"
      >
        <canvas ref="canvasEl" class="dial__canvas" aria-hidden="true" />

        <!-- 键盘 / 读屏用的替身（画布本身不可聚焦） -->
        <ul class="dial__a11y">
          <li v-for="(category, index) in assetCategories" :key="category.id">
            <button type="button" :aria-current="category.id === activeCategoryId" @click="selectIndex('cat', index)">
              {{ category.name }}
            </button>
          </li>
          <li v-for="(item, index) in items" :key="item.id">
            <button type="button" :aria-current="item.id === activeItemId" @click="selectIndex('item', index)">
              {{ item.name }}
            </button>
          </li>
        </ul>
      </div>

      <Transition name="fade" mode="out-in">
        <article
          v-if="activeItem"
          :key="activeItem.id"
          class="detail surface"
          :style="{ '--cat-color': activeCategory.color }"
        >
          <header class="detail__head">
            <div>
              <p class="detail__cat">{{ activeCategory.name }}</p>
              <h3 class="detail__title">{{ activeItem.name }}</h3>
            </div>
            <span v-if="activeItem.status" class="detail__status">
              {{ activeItem.status }}
            </span>
          </header>

          <p class="detail__text">{{ activeItem.description }}</p>

          <dl v-if="activeItem.metrics.length" class="detail__metrics">
            <div v-for="metric in activeItem.metrics" :key="metric.label">
              <dt>{{ metric.label }}</dt>
              <dd>{{ metric.value }}</dd>
            </div>
          </dl>

          <ul v-if="activeItem.tags.length" class="detail__tags">
            <li v-for="tag in activeItem.tags" :key="tag" class="chip">{{ tag }}</li>
          </ul>

          <a
            v-if="activeItem.href"
            class="detail__link"
            :href="activeItem.href"
            target="_blank"
            rel="noopener noreferrer"
          >
            <AppIcon name="external" size="0.95em" />
            <span>{{ activeItem.href.replace(/^https?:\/\//, '').replace(/\/$/, '') }}</span>
          </a>
        </article>
      </Transition>
    </div>
  </section>
</template>

<style scoped>
.assets__grid {
  flex: 1;
  min-height: min(58vh, 480px);
  display: grid;
  grid-template-columns: minmax(0, 1.12fr) minmax(300px, 0.88fr);
  gap: clamp(12px, 2vmin, 26px);
}

/* ============================== 转盘 ============================== */

.dial {
  position: relative;
  min-width: 0;
  min-height: min(58vh, 460px);
  cursor: grab;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.dial.is-dragging {
  cursor: grabbing;
}

.dial__canvas {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
}

/* 画布的键盘替身：视觉上藏起来，Tab 能聚焦 */
.dial__a11y {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  border: 0;
  overflow: hidden;
  clip-path: inset(50%);
  list-style: none;
}

/* ============================== 详情 ============================== */

.detail {
  min-height: 0;
  overflow: auto;
  padding: clamp(14px, 2.2vmin, 26px);
}

.detail__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.detail__cat {
  font-size: 0.6rem;
  letter-spacing: 0.24em;
  color: var(--text-dim);
  margin-bottom: 4px;
}

.detail__title {
  font-size: clamp(0.95rem, 2.3vmin, 1.35rem);
  line-height: 1.35;
}

.detail__status {
  flex: none;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.6rem;
  color: var(--cat-color);
  border: 1px solid var(--cat-color);
  background: color-mix(in srgb, var(--cat-color) 12%, transparent);
}

.detail__text {
  margin-top: 12px;
  font-size: clamp(0.7rem, 1.65vmin, 0.88rem);
  line-height: 1.85;
  color: var(--text-dim);
}

.detail__metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 10px;
  margin-top: 16px;
}

.detail__metrics > div {
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  background: var(--surface-2);
  border: 1px solid var(--border);
}

.detail__metrics dt {
  font-size: 0.6rem;
  letter-spacing: 0.14em;
  color: var(--text-dim);
}

.detail__metrics dd {
  margin-top: 3px;
  font-size: clamp(0.78rem, 1.9vmin, 1rem);
  font-weight: 700;
}

.detail__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 16px;
  list-style: none;
}

.detail__link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
  font-size: clamp(0.66rem, 1.5vmin, 0.78rem);
  word-break: break-all;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.22s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ============================== 竖屏 / 窄屏 ============================== */

/* 圆心在上边缘中点：转盘在上方只露下半圆，详情卡片在下方 */
@media (max-width: 900px), (orientation: portrait) {
  .assets__grid {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto minmax(0, 1fr);
  }

  .dial {
    height: clamp(210px, 32vh, 320px);
    min-height: 0;
  }
}
</style>
