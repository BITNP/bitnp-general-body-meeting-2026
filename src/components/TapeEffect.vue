<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

/**
 * 官网首页的「胶带」装饰：半透明胶带 + 滚动文字。
 * canvas 上逐字做球面投影（中间大、两侧小），文字颜色跟随亮/暗主题。
 */
const props = withDefaults(
  defineProps<{
    text: string
    /** 旋转角度（度） */
    rotation?: number
    /** 滚动速度（像素 / 秒） */
    speed?: number
    /** 不在当前页时暂停动画，省电 */
    active?: boolean
  }>(),
  {
    rotation: 0,
    speed: 30,
    active: true,
  },
)

interface Glyph {
  char: string
  width: number
  position: number
}

const rootRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

let rootEl: HTMLElement | null = null
let canvasEl: HTMLCanvasElement | null = null
let ctx: CanvasRenderingContext2D | null = null
let observer: ResizeObserver | null = null

let rafId = 0
let running = false
let lastTime = 0

let viewWidth = 1
let viewHeight = 1
let fontSize = 42
let totalWidth = 1
let glyphs: Glyph[] = []

function measure() {
  if (!rootEl || !canvasEl || !ctx) return

  const rect = rootEl.getBoundingClientRect()
  if (rect.width < 1 || rect.height < 1) return
  viewWidth = rect.width
  viewHeight = rect.height

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvasEl.width = Math.round(viewWidth * dpr)
  canvasEl.height = Math.round(viewHeight * dpr)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  fontSize = Math.round(12 + viewWidth * 0.05)
  ctx.font = `oblique ${fontSize}px SmileySans, sans-serif`

  let fullText = `${props.text} `
  let guard = 0
  while (ctx.measureText(fullText).width < viewWidth * 2 && guard < 40) {
    fullText += `${props.text} `
    guard += 1
  }

  totalWidth = Math.max(1, ctx.measureText(fullText).width)
  glyphs = Array.from(fullText).map((char) => ({
    char,
    width: ctx ? ctx.measureText(char).width : 0,
    position: 0,
  }))
  glyphs[0].position = -totalWidth / 2
  for (let i = 1; i < glyphs.length; i += 1) {
    glyphs[i].position = glyphs[i - 1].position + glyphs[i - 1].width
  }
}

function draw(now: number) {
  if (!running || !ctx) return
  rafId = requestAnimationFrame(draw)

  const delta = lastTime ? Math.min(now - lastTime, 100) : 0
  lastTime = now

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
  const centerY = viewHeight / 2
  const screenCenter = viewWidth / 2

  ctx.clearRect(0, 0, viewWidth, viewHeight)
  ctx.font = `oblique ${fontSize}px SmileySans, sans-serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = isDark ? '#f8e8bf' : '#1c1a17'

  for (let i = 0; i < glyphs.length; i += 1) {
    const glyph = glyphs[i]
    glyph.position -= props.speed * (delta / 1000)
    if (glyph.position < -totalWidth / 2) glyph.position += totalWidth

    // 归一化到 0~1（屏幕左侧 → 右侧）
    const normalized = (glyph.position + glyph.width / 2 + screenCenter) / viewWidth
    if (normalized < -0.1 || normalized > 1.1) continue

    // 球面投影：把等距的字重新铺到「圆弧」上，中间疏、两侧密
    const x = ((1 - Math.cos(normalized * Math.PI)) / 2) * viewWidth
    const distance = Math.abs(normalized - 0.5)
    const yScale = Math.max(0.3, 1.2 * (1.4 - distance * distance))
    const xScale = Math.max(0.1, Math.cos(distance * Math.PI) * 0.7)

    ctx.save()
    ctx.translate(x, centerY)
    ctx.scale(xScale, yScale)
    ctx.fillText(glyph.char, -glyph.width / 2, 0)
    ctx.restore()
  }
}

function start() {
  if (running || !ctx) return
  running = true
  lastTime = 0
  rafId = requestAnimationFrame(draw)
}

function stop() {
  running = false
  cancelAnimationFrame(rafId)
}

onMounted(() => {
  rootEl = rootRef.value
  canvasEl = canvasRef.value
  ctx = canvasEl?.getContext('2d') ?? null
  if (!rootEl || !canvasEl || !ctx) return

  measure()
  if (props.active) start()

  observer = new ResizeObserver(measure)
  observer.observe(rootEl)

  // 字体加载完成后再量一次，避免用后备字体的宽度排版
  document.fonts?.ready.then(() => measure()).catch(() => undefined)
})

watch(
  () => props.active,
  (isActive) => {
    if (!isActive) {
      stop()
      return
    }
    measure()
    start()
  },
)

onBeforeUnmount(() => {
  stop()
  observer?.disconnect()
  observer = null
})
</script>

<template>
  <div
    ref="rootRef"
    class="tape"
    aria-hidden="true"
    :style="{ '--tape-rotation': `${props.rotation}deg` }"
  >
    <svg class="tape__shape" viewBox="0 0 200 80" preserveAspectRatio="none">
      <path
        d="M 0 20 Q 20 15, 100 15 Q 180 15, 200 20 L 200 50 Q 180 55, 100 55 Q 20 55, 0 50 L 0 20 Z"
        fill="rgba(212, 146, 74, 0.45)"
      />
      <path
        d="M 0 20 Q 20 15, 100 15 Q 180 15, 200 20"
        fill="none"
        stroke="var(--tape-stroke)"
        stroke-width="2"
      />
      <path
        d="M 0 50 Q 20 55, 100 55 Q 180 55, 200 50"
        fill="none"
        stroke="var(--tape-stroke)"
        stroke-width="2"
      />
    </svg>
    <canvas ref="canvasRef" class="tape__canvas" />
  </div>
</template>

<style scoped>
.tape {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 126%;
  height: 80px;
  z-index: 5;
  transform: translate(-50%, -50%) rotate(var(--tape-rotation, 0deg));
  pointer-events: none;
}

.tape__shape,
.tape__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
</style>
