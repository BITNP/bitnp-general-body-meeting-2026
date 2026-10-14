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
      desc="从开学到换届，一年的重要节点都在这条时间轴上。"
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
  width: clamp(200px, 24vw, 320px);
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
  font-size: clamp(0.8rem, 1.85vmin, 1.05rem);
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 0.06em;
}

.ms__cat {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.78rem;
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  white-space: nowrap;
}

.ms__title {
  font-size: clamp(1.05rem, 2.4vmin, 1.5rem);
  line-height: 1.4;
}

.ms__desc {
  flex: 1;
  font-size: clamp(1rem, 2.2vmin, 1.45rem);
  line-height: 1.7;
  color: var(--text-dim);
}

.ms__owner {
  font-size: 0.85rem;
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

/* ==================== PC / 宽屏：上下交错的横向时间轴 ==================== */

/*
 * 只在「横屏且够高」的屏上启用 —— 正好是上面那段竖屏时间轴（is-vertical）的补集，
 * 于是手机横竖屏、矮窗口都还是原来那套紧凑版，移动端完全不变。
 *
 *  · 轴线挪到正中，上下两条卡片带对称；列表用 max-content，
 *    轨道线才会铺满整条时间轴（默认只铺一屏宽，往右滚就"断"了）
 *  · 每个 li 只占半个卡位：上排卡片（奇数张）占第 0、2、4… 个位，下排（偶数张）占第 1、3、5…
 *    个位 → 同侧相邻卡片就按 --card-gap 紧挨着排，上下两排正好错开半个卡位（≈半张卡片）
 *  · 每张卡撑满自己那一带（一条带高减去 --stem-len 的连线），上下两排等高、关于轴线对称，
 *    圆点永远正落在轴线上
 */
@media (min-width: 769px) and (min-height: 561px) {
  .timeline__scroller {
    /* 滚动区高度的下限（上下两条卡片带通常比这高，不够高时靠上面那条 overflow 兜底） */
    min-height: clamp(260px, 42vh, 480px);
    /* 万一视口太矮、两条带放不下，至少还能上下滚，而不是把卡片裁掉 */
    overflow: auto;
  }

  .timeline__list {
    --card-w: clamp(200px, 24vw, 320px);
    /* 同一侧相邻卡片的间距 */
    --card-gap: clamp(10px, 1.6vmin, 18px);
    /* 每个 li 的占位宽度 = 半个卡位；卡片本身比它宽，多出来的部分往右探出 */
    --slot-w: calc((var(--card-w) + var(--card-gap)) / 2);
    /* 一条卡片带的高度（卡片 + 卡片到轴线的连线） */
    --band-h: clamp(150px, 32vh, 360px);
    --stem-len: clamp(18px, 2.4vmin, 30px);
    /* 间距已经算进 --slot-w 里了，格子之间不再留 gap */
    gap: 0;
    width: max-content;
    min-width: 100%;
    padding: 6px 8px;
    /* 卡片比格子宽、会往右探出半个差值；右边留出这段，轴线才能铺到最后一排卡片 */
    padding-right: calc(8px + var(--card-w) - var(--slot-w));
  }

  /* 轴线：挪到正中、横向铺满整条内容 */
  .timeline__list::after {
    left: 8px;
    right: 8px;
    top: 50%;
    bottom: auto;
    margin-top: -1px;
  }

  .ms {
    width: var(--slot-w);
    /*
     * 卡片是绝对定位的，不会再撑高 li，所以这里必须显式给 li 高度 ——
     * 否则 li 会被算成 0 高：50% = 0，上排卡片被推到可视区外（整排消失），
     * 下排卡片的高度被算成负数而被压扁成一条线。
     * 高度 = 上下两条卡片带。
     */
    min-height: calc(var(--band-h) * 2);
  }

  .ms__card {
    position: absolute;
    left: 0;
    width: var(--card-w);
    /* 卡片比 li 宽、会压到后面几个 li 的格子上：抬一层，免得悬停被判到 li 上 */
    z-index: 1;
    /*
     * 高度 = 一条卡片带减去连线：上下两排一样高、都撑满自己那一带，
     * 和原来"卡片撑满整屏"的比例一致（内容多出来的空间归 .ms__desc）。
     */
    height: calc(50% - var(--stem-len));
    overflow: hidden;
  }

  /* 上排：卡片贴在轴线上方，连线从卡片下沿拉到轴线 */
  .ms:nth-child(odd) .ms__card {
    top: auto;
    bottom: calc(50% + var(--stem-len));
  }

  /* 下排：卡片贴在轴线下方 */
  .ms:nth-child(even) .ms__card {
    top: calc(50% + var(--stem-len));
    bottom: auto;
  }

  .ms::before {
    /* li 只有半个卡位宽，连线要挂到卡片中线上，不能再用 50% */
    left: calc(var(--card-w) / 2);
    height: var(--stem-len);
    margin-left: -1px;
  }

  .ms:nth-child(odd)::before {
    top: auto;
    bottom: 50%;
  }

  .ms:nth-child(even)::before {
    top: 50%;
    bottom: auto;
  }

  /* 圆点：正落在轴线上 */
  .ms::after {
    left: calc(var(--card-w) / 2);
    top: 50%;
    bottom: auto;
    margin-top: -6px;
  }
}
</style>
