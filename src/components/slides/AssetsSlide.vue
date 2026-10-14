<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import AppIcon from '../AppIcon.vue'
import SlideHeader from '../SlideHeader.vue'
import { assetCategories, assetItems } from '../../data/assets'

/**
 * 数字资产：两级转盘（整块用 Canvas 画）
 *  · 内圈 = 分类，外圈 = 按分类顺序摊平、上下相连的整条条目带
 *  · 两个圈共用一个圆心，圆心贴住画布边缘：横屏贴左边缘（只露右半圆）、
 *    竖屏贴上边缘（只露下半圆）
 *
 * 每个圈的转动角 rotation 是连续的：
 *  · 拖动：手上那圈的 rotation 跟手，同时按它推出来的选中项同步另一圈
 *    （拖外圈跨过分类边界 → 内圈转过去；拖内圈 → 外圈滑到该分类第一条）
 *  · 滚轮 / 点击：直接改选中项，两个圈各自补间到"把选中项对正"的位置
 *  · 松手：平滑滑到对正位置，不做离散吸附
 *  · 可见范围、透明度、命中判定都是每帧按当前 rotation 现算的
 *  · 每个圈的"一格" = 360 / 卡片数，所以转满一圈正好回到原位（首尾相接）
 */

/* --------------------------------- 选中 --------------------------------- */

/**
 * 外圈是一条"上下相连"的条目带：按分类顺序把所有条目摊平成一条，
 * 所以在最后一个条目继续往后转，就会自然滑进下一个分类的第一条
 * （最后一条再往后回到第一条）。因此外圈的一格 = 360 / 条目总数。
 */
const flatItems = assetCategories.flatMap((category) =>
  assetItems
    .filter((item) => item.category === category.id)
    .map((item) => ({ item, category })),
)

const activeCategoryId = ref(assetCategories[0].id)
const activeItemId = ref(flatItems[0]?.item.id ?? assetItems[0].id)

const activeCategory = computed(
  () => assetCategories.find((category) => category.id === activeCategoryId.value) ?? assetCategories[0],
)
const activeItem = computed(() => assetItems.find((item) => item.id === activeItemId.value) ?? null)
const categoryIndexOf = (categoryId: string) =>
  Math.max(
    0,
    assetCategories.findIndex((category) => category.id === categoryId),
  )
/** 条目带里某分类第一条的下标 */
const firstIndexOfCategory = (categoryId: string) => {
  const index = flatItems.findIndex((entry) => entry.category.id === categoryId)
  return index < 0 ? 0 : index
}
const categoryIndex = computed(() => categoryIndexOf(activeCategoryId.value))
const itemIndex = computed(() =>
  Math.max(
    0,
    flatItems.findIndex((entry) => entry.item.id === activeItemId.value),
  ),
)

/* --------------------------------- 参数 --------------------------------- */

/** 半圆外缘到画布边的留白 */
const PAD = 12
/** 扇形之间留的缝（度），免得相邻扇形糊成一坨 */
const SLICE_GAP = 6
/**
 * 外圈一格的角度：故意定成一个"疏"的常量（和原来条目最多的那个分类差不多），
 * 不按条目总数摊——摊成 360/16 = 22.5° 就太密了。
 * 因为它是整条带（不闭合），绕回一圈会和前面的格子重上，所以下面用窗口
 * 只画"离当前选中项最近的两张"，远端一律不画、不参与命中。
 */
const ITEM_STEP = 90
/** 外圈绘制/命中的窗口：以当前选中项为中心，前后各留几张 */
const ITEM_WINDOW = 2
/** 拖动灵敏度：鼠标离圆心远，一点位移换算出的转角很小，所以给个增益 */
const MOUSE_DRAG_GAIN = 2
const TOUCH_DRAG_GAIN = 1.5
/** 补间时长 */
const TWEEN_MS = 420

/*
 * 布局比例：全部相对"外圈半径 S"来定，整个转盘按 S 等比缩放。
 * 关键是这几个比例必须满足
 *   （1 - INNER_RADIUS_RATIO） >= (ITEM_WIDTH_RATIO + CAT_WIDTH_RATIO) / 2 + RING_GAP_RATIO
 * 也就是"两圈半径差 ≥ 两圈卡片半宽之和 + 空隙"；否则内圈卡片与外圈卡片
 * 会在正对方向那条射线上叠在一起（小屏最容易出这个问题）。
 * 当前取值：0.62 >= 0.48 + 0.08 ✓（还富余 0.06S）
 */
const ITEM_WIDTH_RATIO = 0.58
const CAT_WIDTH_RATIO = 0.38
const INNER_RADIUS_RATIO = 0.38
const RING_GAP_RATIO = 0.08
/** 扇形底纹的环带宽度（半径方向） */
const BAND_RATIO = 0.16

/** 字号也按 S 缩放，再夹在上下限之间，保证什么尺寸都看得清 */
const ITEM_FONT_RATIO = 0.062
const CAT_FONT_RATIO = 0.055
const ITEM_FONT_MIN = 9.5
const ITEM_FONT_MAX = 13
const CAT_FONT_MIN = 8.5
const CAT_FONT_MAX = 11.5
/** 卡片内边距、行高、圆角与字号的比例 */
const PAD_X_RATIO = 0.9
const PAD_Y_RATIO = 0.6
const LINE_RATIO = 1.35
const CARD_RADIUS_RATIO = 0.8

/*
 * 横屏 / 竖屏：这里判一次，模板会把 is-vertical 打到根元素上，
 * CSS 也只认这个 class，避免 JS 与 CSS 各判一次、判定不一致导致方向错乱。
 */
const verticalQuery = window.matchMedia('(max-width: 900px), (orientation: portrait)')
const vertical = ref(verticalQuery.matches)
const onOrientationChange = (event: MediaQueryListEvent) => {
  vertical.value = event.matches
}

/**
 * "对齐"的方向两种朝向是不同的：
 *  · 横屏露的是右半圆 → 对齐 = 把该扇形转到正右方（东，90°）
 *  · 竖屏露的是下半圆 → 对齐 = 把该扇形转到正下方（南，180°）
 */
const alignAngle = computed(() => (vertical.value ? 180 : 90))

type RingName = 'cat' | 'item'
const RINGS: RingName[] = ['cat', 'item']

/* -------------------------------- 运行时 -------------------------------- */

const canvasEl = ref<HTMLCanvasElement | null>(null)
const dialEl = ref<HTMLElement | null>(null)
const sectionEl = ref<HTMLElement | null>(null)
const gridEl = ref<HTMLElement | null>(null)
const dragging = ref<RingName | null>(null)

/** 唯一的状态：每个圈转了多少度（连续量，单位度） */
const rotation: Record<RingName, number> = { cat: 0, item: 0 }

interface Tween {
  from: number
  to: number
  startedAt: number
}

const tweens: Partial<Record<RingName, Tween>> = {}

let frame = 0
let dragAngle = 0
/** 本次拖动累计转过的角度：用来区分"拖了一把"和"点了一下" */
let dragTravel = 0
let wheelAccumulator = 0
let canvasBox = { width: 0, height: 0 }

interface Layout {
  cx: number
  cy: number
  rCat: number
  rItem: number
  catW: number
  itemW: number
  catMaxH: number
  itemMaxH: number
  catFont: number
  itemFont: number
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
/** 文字折行缓存：key = 圈 + 宽度 + 文本 */
let wrapCache = new Map<string, WrappedCard[]>()

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
/** 一圈里有几张卡片：内圈是分类，外圈是摊平后的整条条目带 */
const ringList = (ring: RingName) => (ring === 'cat' ? assetCategories : flatItems)

/**
 * 每个圈自己的"一格"：
 *  · 内圈分类：360 / 分类数（闭合圆环，转满一圈回到原位）
 *  · 外圈条目带：固定 ITEM_STEP，保持原来那种疏密，不随条目总数变密
 */
function stepOf(ring: RingName) {
  if (ring === 'item') return ITEM_STEP
  const count = assetCategories.length
  return count > 0 ? 360 / count : 360
}

/**
 * 外圈只在"当前选中项前后各 ITEM_WINDOW 张"这个窗口里画卡片、判定命中：
 * 条目带很长但格子很疏，绕回来会重叠，所以远端的直接不参与。
 * 内圈是闭合圆环，不用窗口。
 */
function inWindow(ring: RingName, index: number) {
  if (ring === 'cat') return true
  const count = flatItems.length
  if (count === 0) return false
  const diff = (((index - itemIndex.value) % count) + count) % count
  return Math.min(diff, count - diff) <= ITEM_WINDOW
}

/** 折到 (-180, 180] */
function wrap180(degrees: number) {
  return ((((degrees + 180) % 360) + 360) % 360) - 180
}

/** 条目带当前位置（单位：格），由转动角换算 */
const beltOf = (ring: RingName) => -rotation[ring] / stepOf(ring)

/**
 * 某张卡片此刻相对基准方向偏了多少度。
 * 注意要按"条目带的差（取模条目数）"来算，而不是 index × 每格角度：
 * 条目带很长、格子很疏，直接乘会让远端绕回来和近端落在同一个角度上
 * （典型表现就是停在第一个条目时，旁边的标签显示成了整条带的最后一条）。
 */
function offsetOf(ring: RingName, index: number) {
  const count = ringList(ring).length
  if (count === 0) return 0
  let diff = index - beltOf(ring)
  diff -= Math.round(diff / count) * count
  return wrap180(diff * stepOf(ring))
}

/** 离基准方向最近的那张卡片 = 当前选中项 */
function nearestIndex(ring: RingName) {
  const count = ringList(ring).length
  if (count === 0) return 0
  return ((Math.round(beltOf(ring)) % count) + count) % count
}

/* -------------------------------- 补间 -------------------------------- */

/** 是否闭合圆环：每格角度 × 卡片数 = 360（内圈是，外圈那条长条目带不是） */
const isClosedRing = (ring: RingName) => Math.abs(stepOf(ring) * ringList(ring).length - 360) < 0.001

/**
 * 平滑滑到"让第 index 张卡片对正"的位置：
 *  · 闭合圆环（内圈）：取离当前角度最近的等价角，转得最短；
 *  · 条目带（外圈）：必须转到"带的位置正好等于 index"的那个角度——
 *    否则带会和选中项差出整数圈，下次一拖就跳。差得太远（键盘直接跳到很远的条目）
 *    就直接到位，不做长距离甩动。
 */
function alignTween(ring: RingName, index: number) {
  const exact = -index * stepOf(ring)
  if (isClosedRing(ring)) {
    startTween(ring, exact + 360 * Math.round((rotation[ring] - exact) / 360))
    return
  }
  if (Math.abs(exact - rotation[ring]) > 360) {
    delete tweens[ring]
    rotation[ring] = exact
    schedulePaint()
    return
  }
  startTween(ring, exact)
}

const wrapIndex = (index: number, count: number) => (count > 0 ? ((index % count) + count) % count : 0)

/** 选中某条条目：外圈对正它，内圈跟着转到它所属的分类 */
function selectItem(index: number) {
  const target = wrapIndex(index, flatItems.length)
  const entry = flatItems[target]
  if (!entry) return
  activeItemId.value = entry.item.id
  activeCategoryId.value = entry.category.id
  alignTween('item', target)
  alignTween('cat', categoryIndexOf(entry.category.id))
}

/** 选中某个分类：内圈对正它，外圈滑到该分类的第一条 */
function selectCategory(index: number) {
  const target = wrapIndex(index, assetCategories.length)
  const category = assetCategories[target]
  if (!category) return
  const firstIndex = firstIndexOfCategory(category.id)
  activeCategoryId.value = category.id
  activeItemId.value = flatItems[firstIndex]?.item.id ?? activeItemId.value
  alignTween('cat', target)
  alignTween('item', firstIndex)
}

function stepRing(ring: RingName, step: number) {
  if (step === 0 || ringList(ring).length < 2) return
  if (ring === 'cat') selectCategory(nearestIndex('cat') + step)
  else selectItem(nearestIndex('item') + step)
}

function startTween(ring: RingName, to: number) {
  if (Math.abs(to - rotation[ring]) < 0.4) {
    rotation[ring] = to
    schedulePaint()
    return
  }
  tweens[ring] = { from: rotation[ring], to, startedAt: performance.now() }
  schedulePaint()
}

/** 每帧推进补间，返回是否还需要继续动画 */
function stepAnimation() {
  const now = performance.now()
  let busy = false

  for (const ring of RINGS) {
    const tween = tweens[ring]
    if (!tween) continue
    const progress = Math.min(1, (now - tween.startedAt) / TWEEN_MS)
    const eased = 1 - Math.pow(1 - progress, 3)
    rotation[ring] = tween.from + (tween.to - tween.from) * eased
    if (progress >= 1) {
      rotation[ring] = tween.to
      delete tweens[ring]
    } else {
      busy = true
    }
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

/** #rrggbb / #rgb → rgba(...)，给描边和底色用 */
function withAlpha(color: string, alpha: number) {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color.trim())
  if (!match) return color
  let hex = match[1]
  if (hex.length === 3) hex = hex.split('').map((char) => char + char).join('')
  const value = Number.parseInt(hex, 16)
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`
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

/** 按宽度折行（中文按字折），最多两行，超出补省略号 */
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

  if (lines.join('').length < text.length) {
    let last = lines[lines.length - 1] ?? ''
    while (last && ctx.measureText(`${last}…`).width > maxWidth) last = last.slice(0, -1)
    lines[lines.length - 1] = `${last}…`
  }
  return lines.length ? lines : [text]
}

const padXOf = (fontSize: number) => Math.round(fontSize * PAD_X_RATIO)
const lineHeightOf = (fontSize: number) => Math.round(fontSize * LINE_RATIO)
const cardRadiusOf = (fontSize: number) => Math.round(fontSize * CARD_RADIUS_RATIO)

/** 折行结果（带缓存，避免每帧 measureText） */
function cardsFor(
  ctx: CanvasRenderingContext2D,
  ring: RingName,
  texts: string[],
  width: number,
  fontSize: number,
) {
  const padX = padXOf(fontSize)
  const padY = Math.round(fontSize * PAD_Y_RATIO)
  const key = `${ring}:${Math.round(width)}:${fontSize.toFixed(1)}:${texts.join('|')}`
  const cached = wrapCache.get(key)
  if (cached) return cached

  ctx.font = `600 ${fontSize}px ${palette.font}`
  const lineHeight = lineHeightOf(fontSize)
  const cards = texts.map((text) => {
    const lines = wrapLines(ctx, text, width - padX * 2)
    return { lines, height: Math.round(padY * 2 + lines.length * lineHeight) }
  })
  wrapCache.set(key, cards)
  return cards
}

const toRad = (degrees: number) => (degrees * Math.PI) / 180

/** 角度按「以北为 0、顺时针为正」，换成画布坐标 */
function pointAt(cx: number, cy: number, angle: number, radius: number) {
  const rad = toRad(angle)
  return { x: cx + Math.sin(rad) * radius, y: cy - Math.cos(rad) * radius }
}

/**
 * 卡片能完整放进半圆的最大偏角：再往外就会被"直径线"切开。
 * 横屏直径线是竖的 → 看卡片半宽；竖屏直径线是横的 → 看卡片半高。
 */
function labelLimit(ring: RingName) {
  const current = layout
  if (!current) return 88
  const radius = ring === 'cat' ? current.rCat : current.rItem
  const span = vertical.value
    ? ring === 'cat'
      ? current.catMaxH
      : current.itemMaxH
    : ring === 'cat'
      ? current.catW
      : current.itemW
  if (radius <= 1) return 88
  const ratio = Math.min(1, span / 2 / radius)
  return clamp((Math.acos(ratio) * 180) / Math.PI, 30, 88)
}

/**
 * 卡片的落点：真实偏角贴到边线上就不再往外挪（否则会露半张卡），
 * 越靠外的越淡，转出 2 倍极限角就完全隐藏。
 */
function cardPlacement(ring: RingName, index: number) {
  const offset = offsetOf(ring, index)
  const limit = labelLimit(ring)
  const distance = Math.abs(offset)
  const alpha = distance <= limit ? 1 : Math.max(0, (2 * limit - distance) / limit)
  return { offset, display: clamp(offset, -limit, limit), alpha }
}

function paint() {
  const canvas = canvasEl.value
  const dial = dialEl.value
  const section = sectionEl.value
  const grid = gridEl.value
  const ctx = canvas?.getContext('2d')
  if (!canvas || !dial || !section || !grid || !ctx) return

  /*
   * 可用空间取"和转盘自身无关"的来源，免得转盘尺寸一贴齐 canvas 就自己收缩：
   *  · 横屏：dial 列就按 canvas 宽排，所以宽度从上层的栅格宽度反推（扣掉详情面板的最小宽度和列间距）；
   *          高度还是这一行的高度（dial 在横屏不设高，由栅格拉伸）。
   *  · 竖屏：宽度就是栅格整宽；高度用一个上限值（dial 在竖屏要贴成 canvas 高度，不能拿它自己当参照）。
   */
  const isVertical = vertical.value
  const detailMin =
    Number.parseFloat(getComputedStyle(section).getPropertyValue('--detail-min')) || 300
  const columnGap = Number.parseFloat(getComputedStyle(grid).columnGap) || 0
  const gridWidth = grid.clientWidth
  const availableWidth = isVertical
    ? gridWidth
    : Math.max(140, gridWidth - columnGap - detailMin)
  const availableHeight = isVertical
    ? clamp(210, window.innerHeight * 0.32, 320)
    : dial.clientHeight
  if (availableWidth < 60 || availableHeight < 60) return

  /*
   * 先解出"外圈半径 S"：整个转盘按 S 等比排布，所以两圈永远保持安全距离。
   *  · 宽度约束：横屏宽 = S*(1 + ITEM_WIDTH_RATIO/2) + PAD，竖屏宽 = 2*(S*(1 + ITEM_WIDTH_RATIO/2) + 4)
   *  · 高度约束：横屏高 = 2*(S + 卡片半高 + 4)，竖屏高 = S + 卡片半高 + PAD
   * 卡片高度又取决于字号（字号按 S 缩放，再夹在上下限之间），所以要迭代两轮。
   */
  const widthFactor = 1 + ITEM_WIDTH_RATIO / 2
  const widthLimit = isVertical
    ? (availableWidth / 2 - 4) / widthFactor
    : (availableWidth - PAD) / widthFactor

  const itemTexts = flatItems.map((entry) => entry.item.name)
  const catTexts = assetCategories.map((category) => category.name)
  let scale = clamp(widthLimit, 96, 340)
  let itemCards: WrappedCard[] = []
  let catCards: WrappedCard[] = []

  // 卡片高度又取决于字号，所以迭代两三轮把 S 收敛下来
  for (let pass = 0; pass < 3; pass += 1) {
    itemCards = cardsFor(
      ctx,
      'item',
      itemTexts,
      scale * ITEM_WIDTH_RATIO,
      clamp(scale * ITEM_FONT_RATIO, ITEM_FONT_MIN, ITEM_FONT_MAX),
    )
    catCards = cardsFor(
      ctx,
      'cat',
      catTexts,
      scale * CAT_WIDTH_RATIO,
      clamp(scale * CAT_FONT_RATIO, CAT_FONT_MIN, CAT_FONT_MAX),
    )

    const itemMaxH = itemCards.reduce((max, card) => Math.max(max, card.height), 34)
    const heightLimit = isVertical
      ? availableHeight - itemMaxH / 2 - PAD
      : availableHeight / 2 - itemMaxH / 2 - 4
    const next = clamp(Math.min(widthLimit, heightLimit), 96, 340)
    if (Math.abs(next - scale) < 0.5) {
      scale = next
      break
    }
    scale = next
  }

  const itemFont = clamp(scale * ITEM_FONT_RATIO, ITEM_FONT_MIN, ITEM_FONT_MAX)
  const catFont = clamp(scale * CAT_FONT_RATIO, CAT_FONT_MIN, CAT_FONT_MAX)
  const itemW = scale * ITEM_WIDTH_RATIO
  const catW = scale * CAT_WIDTH_RATIO
  const rItem = scale
  /*
   * 内圈半径：取"舒服的值"和"再多就会被外圈卡片撞到"两者的较小值。
   * 后面这一项就是两圈不重叠的硬约束：半径差 ≥ 两圈卡片半宽之和 + 空隙。
   */
  const rCat = Math.max(
    scale * 0.2,
    Math.min(scale * INNER_RADIUS_RATIO, rItem - (itemW + catW) / 2 - scale * RING_GAP_RATIO),
  )
  const itemMaxH = itemCards.reduce((max, card) => Math.max(max, card.height), 34)
  const catMaxH = catCards.reduce((max, card) => Math.max(max, card.height), 32)

  const sideMargin = itemW / 2 + 4
  const edgeMargin = itemMaxH / 2 + 4
  const boxWidth = isVertical ? 2 * (rItem + sideMargin) : rItem + sideMargin + PAD
  const boxHeight = isVertical ? rItem + edgeMargin + PAD : 2 * (rItem + edgeMargin)
  if (canvasBox.width !== boxWidth || canvasBox.height !== boxHeight) {
    // 写到根元素上：canvas 自己、以及"横屏的 dial 列宽 / 竖屏的 dial 高度"都吃这两个变量
    section.style.setProperty('--canvas-w', `${Math.round(boxWidth)}px`)
    section.style.setProperty('--canvas-h', `${Math.round(boxHeight)}px`)
    canvasBox = { width: boxWidth, height: boxHeight }
  }

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

  // 圆心贴在画布边缘
  const cx = isVertical ? width / 2 : 0
  const cy = isVertical ? 0 : height / 2
  layout = { cx, cy, rCat, rItem, catW, itemW, catMaxH, itemMaxH, catFont, itemFont }

  /** 每个条目用它自己所属分类的颜色 */
  const entryAccent = (entry: (typeof flatItems)[number]) =>
    categoryColors[entry.category.id] ?? palette.textDim

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

  /*
   * —— 扇形底纹 ——
   * 每个扇形正好占自己那一格（360 / 卡片数），所以整圈首尾相接、转起来不留空档；
   * 被半圆裁掉的另一半由画布自动裁掉，不用额外处理。
   */
  const drawWedge = (ring: RingName, offset: number, accent: string, active: boolean) => {
    if (Math.abs(offset) > 150) return
    const half = (stepOf(ring) - SLICE_GAP) / 2
    const alpha = active ? 0.34 : 0.16
    const radius = ring === 'cat' ? rCat : rItem
    const band = scale * BAND_RATIO
    const center = alignAngle.value + offset
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.fillStyle = accent
    ctx.beginPath()
    ctx.arc(cx, cy, radius + band, toRad(center - half - 90), toRad(center + half - 90))
    ctx.arc(cx, cy, radius - band, toRad(center + half - 90), toRad(center - half - 90), true)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  assetCategories.forEach((category, index) => {
    drawWedge(
      'cat',
      offsetOf('cat', index),
      categoryColors[category.id] ?? palette.textDim,
      index === categoryIndex.value,
    )
  })
  flatItems.forEach((entry, index) => {
    if (!inWindow('item', index)) return
    drawWedge('item', offsetOf('item', index), entryAccent(entry), index === itemIndex.value)
  })

  // —— 卡片 ——
  const drawCard = (
    ring: RingName,
    display: number,
    alpha: number,
    card: WrappedCard,
    accent: string,
    active: boolean,
  ) => {
    if (alpha <= 0.01) return
    const radius = ring === 'cat' ? rCat : rItem
    const cardWidth = ring === 'cat' ? catW : itemW
    const fontSize = ring === 'cat' ? catFont : itemFont
    const padX = padXOf(fontSize)
    const lineHeight = lineHeightOf(fontSize)
    const cardRadius = cardRadiusOf(fontSize)
    const point = pointAt(cx, cy, alignAngle.value + display, radius)

    ctx.save()
    ctx.globalAlpha = alpha

    if (active) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.18)'
      ctx.shadowBlur = Math.round(fontSize * 1.4)
      ctx.shadowOffsetY = Math.round(fontSize * 0.5)
    }
    roundedRect(ctx, point.x - cardWidth / 2, point.y - card.height / 2, cardWidth, card.height, cardRadius)
    ctx.fillStyle = palette.surface
    ctx.fill()
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0

    // 卡片底色统一带一点主题色，选中的更实
    ctx.fillStyle = withAlpha(accent, active ? 0.26 : 0.1)
    ctx.fill()

    ctx.lineWidth = active ? 1.6 : 1
    ctx.strokeStyle = active ? accent : withAlpha(accent, 0.45)
    ctx.stroke()

    ctx.font = `${active ? 700 : 600} ${fontSize}px ${palette.font}`
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'
    ctx.fillStyle = ring === 'cat' ? accent : palette.text
    const totalHeight = card.lines.length * lineHeight
    let ty = point.y - totalHeight / 2 + lineHeight / 2
    for (const line of card.lines) {
      ctx.fillText(line, point.x, ty, cardWidth - padX * 2)
      ty += lineHeight
    }

    ctx.restore()
  }

  /*
   * 离基准方向远的先画、近的后画：这样"贴边收敛"到同一个角度的多张卡片里，
   * 只有最靠内（也最亮）的那张会显示出来，不会出现叠在一起的乱象。
   */
  const drawOrder: Array<{ ring: RingName; index: number }> = [
    ...assetCategories.map((_, index) => ({ ring: 'cat' as RingName, index })),
    ...flatItems.map((_, index) => ({ ring: 'item' as RingName, index })),
  ].sort(
    (a, b) =>
      Math.abs(cardPlacement(b.ring, b.index).offset) -
      Math.abs(cardPlacement(a.ring, a.index).offset),
  )

  for (const entry of drawOrder) {
    if (!inWindow(entry.ring, entry.index)) continue
    const placement = cardPlacement(entry.ring, entry.index)
    const card = entry.ring === 'cat' ? catCards[entry.index] : itemCards[entry.index]
    if (!card) continue
    const flat = entry.ring === 'item' ? flatItems[entry.index] : undefined
    const accent = flat
      ? entryAccent(flat)
      : (categoryColors[assetCategories[entry.index]?.id ?? ''] ?? palette.textDim)
    const active = entry.ring === 'cat' ? entry.index === categoryIndex.value : entry.index === itemIndex.value
    drawCard(entry.ring, placement.display, placement.alpha, card, accent, active)
  }

  // —— 圆心小圆点 ——
  ctx.save()
  ctx.globalAlpha = 0.7
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

/** 圆心（画布坐标系） */
function centerPoint() {
  const rect = canvasRect()
  if (!rect) return null
  return { x: vertical.value ? rect.width / 2 : 0, y: vertical.value ? 0 : rect.height / 2 }
}

/** 指针位置（同样换算到画布坐标系，不然角度会全错） */
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

/** 命中判定：取指针方向上"看得见"的那张卡片（按当前转动角现算） */
function cardAt(event: { clientX: number; clientY: number }) {
  const point = localPoint(event)
  if (!point) return null
  const ring = ringAt(point)
  const count = ringList(ring).length
  if (count === 0) return null

  const pointer = wrap180(angleAt(point) - alignAngle.value)
  /*
   * 判定范围 = 半格：点在这一格范围内就选中它，不留空档。
   * 同一角度上可能贴边叠着几张（远端收敛到边线），此时取"离基准方向更近"的那张
   * （也就是真正画出来的那张）；距离相同时取更靠内的。
   */
  const tolerance = stepOf(ring) / 2
  const order = Array.from({ length: count }, (_, index) => index).sort(
    (a, b) => Math.abs(offsetOf(ring, a)) - Math.abs(offsetOf(ring, b)),
  )
  let best: { index: number; distance: number } | null = null
  for (const index of order) {
    if (!inWindow(ring, index)) continue
    const placement = cardPlacement(ring, index)
    if (placement.alpha <= 0.15) continue
    const distance = Math.abs(wrap180(placement.display - pointer))
    if (distance > tolerance) continue
    if (!best || distance < best.distance - 0.01) best = { index, distance }
  }
  return best ? { ring, index: best.index } : null
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
  const ring = ringAt(point)
  dragging.value = ring
  dragAngle = angleAt(point)
  dragTravel = 0
  // 手上开始拖了就中断这一圈正在跑的补间，从当前位置接着转
  delete tweens[ring]
  startWindowDragTracking()
}

function onPointerMove(event: PointerEvent) {
  const ring = dragging.value
  if (!ring) return
  const point = localPoint(event)
  if (!point) return

  const angle = angleAt(point)
  let delta = angle - dragAngle
  if (delta > 180) delta -= 360
  if (delta < -180) delta += 360
  // 鼠标/触屏给一点增益，拖起来更跟手（鼠标离圆心远，1:1 会显得很迟钝）
  delta *= event.pointerType === 'mouse' ? MOUSE_DRAG_GAIN : TOUCH_DRAG_GAIN
  dragAngle = angle
  dragTravel += Math.abs(delta)

  rotation[ring] += delta
  if (ring === 'cat') syncFromCategoryDrag()
  else syncFromItemDrag()
  paint()
}

/** 拖内圈：分类变了就把选中项落到新分类的第一条，并让外圈滑过去 */
function syncFromCategoryDrag() {
  const category = assetCategories[nearestIndex('cat')]
  if (!category || category.id === activeCategoryId.value) return
  const firstIndex = firstIndexOfCategory(category.id)
  activeCategoryId.value = category.id
  activeItemId.value = flatItems[firstIndex]?.item.id ?? activeItemId.value
  alignTween('item', firstIndex)
}

/** 拖外圈：条目带滑到哪条就选哪条；跨过分类边界时内圈跟着转过去 */
function syncFromItemDrag() {
  const index = nearestIndex('item')
  const entry = flatItems[index]
  if (!entry) return
  if (entry.item.id !== activeItemId.value) activeItemId.value = entry.item.id
  if (entry.category.id !== activeCategoryId.value) {
    activeCategoryId.value = entry.category.id
    alignTween('cat', categoryIndexOf(entry.category.id))
  }
}

/**
 * 松手：不管刚才是在拖还是点了一下，都补间到"让当前选中的那张对正"的位置。
 *  · 基本没动 = 点击 → 直接选中点到的那张，再滑到对正
 *  · 拖了一段 → 选中项已经实时跟着转了，这里只把最后那点偏差平滑收掉
 */
function onPointerUp(event: PointerEvent) {
  stopWindowDragTracking()
  const ring = dragging.value
  dragging.value = null
  if (!ring) return

  if (dragTravel < 6) {
    const hit = cardAt(event)
    if (hit) {
      // 点条目 → 选中它并让外圈对正、内圈跟着转到它所属分类
      // 点分类 → 选中该分类并让内圈对正、外圈滑到它的第一条
      if (hit.ring === 'item') selectItem(hit.index)
      else selectCategory(hit.index)
      return
    }
  }
  alignTween(ring, nearestIndex(ring))
  schedulePaint()
}

function onWheel(event: WheelEvent) {
  event.preventDefault()
  const point = localPoint(event)
  if (!point) return
  const ring = ringAt(point)
  if (ringList(ring).length < 2) return

  wheelAccumulator += event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY
  if (Math.abs(wheelAccumulator) < 40) return
  const step = wheelAccumulator > 0 ? 1 : -1
  wheelAccumulator = 0
  stepRing(ring, step)
}

/* ------------------------------- 生命周期 ------------------------------- */

let observer: ResizeObserver | null = null
let themeObserver: MutationObserver | null = null

onMounted(() => {
  readPalette()
  verticalQuery.addEventListener('change', onOrientationChange)
  if (typeof ResizeObserver !== 'undefined' && dialEl.value) {
    observer = new ResizeObserver(() => {
      wrapCache = new Map()
      paint()
    })
    observer.observe(dialEl.value)
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
  verticalQuery.removeEventListener('change', onOrientationChange)
  observer?.disconnect()
  themeObserver?.disconnect()
  window.removeEventListener('resize', paint)
  if (frame) window.cancelAnimationFrame(frame)
})

watch(vertical, () => {
  wrapCache = new Map()
  paint()
})

/** 选中项变了重画（详情卡片走正常模板渲染） */
watch([categoryIndex, itemIndex], () => schedulePaint())
</script>

<template>
  <section ref="sectionEl" class="slide assets" :class="{ 'is-vertical': vertical }">
    <SlideHeader
      kicker="AGENDA 04"
      title="数字资产概况"
      desc="内圈选分类、外圈选条目：滚轮或手指滑动可以转动转盘，也可以直接点扇形卡片。外圈是一条首尾相连的条目带，转到一个分类的最后一条会顺下去进入下一个分类。"
    >
      <template #side>
        <span class="chip">
          共 {{ assetItems.length }} 项 · {{ assetCategories.length }} 个分类
        </span>
        <span class="chip">滚轮 / 滑动旋转 · 点卡片对正</span>
      </template>
    </SlideHeader>

    <div ref="gridEl" class="assets__grid">
      <div ref="dialEl" class="dial" data-no-swipe>
        <canvas
          ref="canvasEl"
          class="dial__canvas"
          :class="{ 'is-dragging': dragging !== null }"
          @pointerdown="onPointerDown"
          @wheel="onWheel"
        />

        <!-- 键盘 / 读屏替身（canvas 本身不能聚焦） -->
        <ul class="dial__a11y">
          <li v-for="(category, index) in assetCategories" :key="category.id">
            <button
              type="button"
              :aria-current="category.id === activeCategoryId"
              @click="selectCategory(index)"
            >
              {{ category.name }}
            </button>
          </li>
          <li v-for="(entry, index) in flatItems" :key="entry.item.id">
            <button
              type="button"
              :aria-current="entry.item.id === activeItemId"
              @click="selectItem(index)"
            >
              {{ entry.item.name }}
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
.assets {
  /* 详情面板的最小宽度（脚本会读这个值去反推转盘可用宽度） */
  --detail-min: 300px;
  /* canvas 尺寸：脚本算好后会覆盖这两个变量 */
  --canvas-w: clamp(200px, 26vw, 340px);
  --canvas-h: 220px;
}

.assets__grid {
  flex: 1;
  min-height: min(58vh, 480px);
  display: grid;
  gap: clamp(12px, 2vmin, 26px);
  /* 横屏：左列严格按 canvas 宽，右列（详情）吃掉剩下的空间 → 详情更宽 */
  grid-template-columns: var(--canvas-w) minmax(var(--detail-min), 1fr);
}

/* ============================== 转盘 ============================== */

.dial {
  position: relative;
  /* 横屏：与 canvas 同宽；高度由栅格这一行拉伸 */
  width: var(--canvas-w);
  min-width: 0;
  min-height: min(58vh, 460px);
}

/* 画布只占 UI 本身那么大：横屏贴在左上、垂直居中 */
.dial__canvas {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: var(--canvas-w);
  height: var(--canvas-h);
  touch-action: none;
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.dial__canvas.is-dragging {
  cursor: grabbing;
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
  max-width: 92ch;
  font-size: clamp(0.7rem, 1.65vmin, 0.88rem);
  line-height: 1.85;
  color: var(--text-dim);
}

.detail__metrics {
  display: grid;
  /* 详情面板变宽了，指标块别再被拉成一整行那么宽 */
  grid-template-columns: repeat(auto-fit, minmax(110px, 200px));
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

/*
 * 圆心换到画布上边缘中点：转盘在上方只露下半圆，详情卡片在下方。
 * 这里只认脚本打在根元素上的 .is-vertical —— 竖屏判定只做一次，
 * 免得 CSS 与 canvas 各自判断、朝向不一致（对齐方向也就跟着错）。
 */
.assets.is-vertical .assets__grid {
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: auto minmax(0, 1fr);
}

.assets.is-vertical .dial {
  width: auto;
  /* 竖屏：与 canvas 同高，省下的高度留给下方详情 */
  height: var(--canvas-h);
  min-height: 0;
}

.assets.is-vertical .dial__canvas {
  left: 50%;
  top: 0;
  transform: translateX(-50%);
}
</style>
