<script setup lang="ts">
import SlideHeader from '../SlideHeader.vue'
import { useMediaQuery } from '../../composables/useMediaQuery'
import { milestones } from '../../data/timeline'

/** 竖屏窄屏用竖向时间轴；横屏手机虽然窄但很矮，仍然用横向 */
const isVertical = useMediaQuery('(max-width: 768px) and (min-height: 561px)')
</script>

<template>
  <section class="slide timeline">
    <SlideHeader
      kicker="AGENDA 05"
      title="接下来一年"
      desc="从开学到换届，一年的重要节点都在这条时间轴上。内容在 src/data/timeline.ts，确认后把「待确认」的条目替换掉即可。"
    >
      <template #side>
        <span class="chip">2026.09 – 2027.08</span>
        <span class="chip">共 {{ milestones.length }} 个节点</span>
      </template>
    </SlideHeader>

    <div class="timeline__scroller">
      <ol class="timeline__list" :class="{ 'is-vertical': isVertical }">
        <li
          v-for="milestone in milestones"
          :key="milestone.id"
          class="ms"
          :style="{ '--accent': milestone.color }"
        >
          <article class="ms__card surface">
            <div class="ms__top">
              <span class="ms__date">{{ milestone.date }}</span>
              <span class="ms__cat">{{ milestone.category }}</span>
            </div>
            <h3 class="ms__title">{{ milestone.title }}</h3>
            <p class="ms__desc">{{ milestone.description }}</p>
            <p v-if="milestone.owner" class="ms__owner">{{ milestone.owner }}</p>
          </article>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.timeline__scroller {
  flex: 1;
  min-height: clamp(200px, 38vh, 420px);
  overflow: auto hidden;
}

.timeline__list {
  position: relative;
  display: flex;
  align-items: stretch;
  gap: clamp(10px, 1.6vmin, 18px);
  min-height: 100%;
  padding: 0 8px 56px;
  list-style: none;
}

/* 横向轨道 */
.timeline__list::after {
  content: '';
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: 25px;
  height: 2px;
  background: linear-gradient(
    to right,
    transparent,
    var(--border) 3%,
    var(--border) 97%,
    transparent
  );
}

.ms {
  position: relative;
  flex: 0 0 auto;
  width: clamp(186px, 21vw, 280px);
  display: flex;
  scroll-snap-align: start;
}

/* 节点连线 + 圆点 */
.ms::before {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -30px;
  width: 2px;
  height: 30px;
  margin-left: -1px;
  background: var(--accent);
  opacity: 0.5;
}

.ms::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -36px;
  width: 12px;
  height: 12px;
  margin-left: -6px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 4px var(--surface-2), 0 0 14px var(--accent);
}

.ms__card {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: clamp(12px, 1.9vmin, 20px);
  border-top: 3px solid var(--accent);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.ms__card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 34px var(--shadow);
}

.ms__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.ms__date {
  font-family: 'Consolas', monospace;
  font-size: clamp(0.66rem, 1.5vmin, 0.78rem);
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 0.06em;
}

.ms__cat {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.58rem;
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  white-space: nowrap;
}

.ms__title {
  font-size: clamp(0.82rem, 2vmin, 1.05rem);
  line-height: 1.4;
}

.ms__desc {
  flex: 1;
  font-size: clamp(0.62rem, 1.5vmin, 0.78rem);
  line-height: 1.75;
  color: var(--text-dim);
}

.ms__owner {
  font-size: 0.6rem;
  letter-spacing: 0.06em;
  color: var(--text-dim);
  opacity: 0.85;
}

/* —— 竖向时间轴（窄屏竖屏） —— */
.timeline__list.is-vertical {
  flex-direction: column;
  padding: 0 4px 0 34px;
  overflow: visible;
}

.timeline__list.is-vertical::after {
  top: 6px;
  bottom: 6px;
  left: 12px;
  right: auto;
  width: 2px;
  height: auto;
  background: linear-gradient(to bottom, transparent, var(--border) 3%, var(--border) 97%, transparent);
}

.is-vertical .ms {
  width: auto;
}

.is-vertical .ms::before {
  left: -18px;
  top: 26px;
  bottom: auto;
  width: 18px;
  height: 2px;
  margin-left: 0;
}

.is-vertical .ms::after {
  left: -27px;
  top: 21px;
  bottom: auto;
  margin-left: 0;
}
</style>
