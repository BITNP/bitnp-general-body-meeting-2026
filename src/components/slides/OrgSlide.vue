<script setup lang="ts">
import { computed, ref } from 'vue'
import AppIcon from '../AppIcon.vue'
import SlideHeader from '../SlideHeader.vue'
import { departments, presidium } from '../../data/departments'
import type { OrgGroup } from '../../types'

/**
 * 组织架构：思维导图
 *   主席团 ─┬─ 技术部 ─┬─ 部长团
 *           │          └─ 普通成员
 *           ├─ 电脑诊所部 …
 *           ├─ 数字媒体中心 …
 *           └─ 技术保障中心 …
 * 点击主席团或某个部门 → 右侧（竖屏时在下方）显示该单位的概况。
 */
interface Unit {
  key: string
  kind: string
  name: string
  color: string
  icon: string
  summary: string
  description: string
  groups: OrgGroup[]
  plan: string
}

const units: Unit[] = [
  {
    key: 'presidium',
    kind: '主席团',
    name: presidium.name,
    color: presidium.color,
    icon: presidium.icon,
    summary: presidium.summary,
    description: presidium.description,
    groups: presidium.groups,
    plan: '',
  },
  ...departments.map((dept) => ({
    key: `dept:${dept.id}`,
    kind: '部门',
    name: dept.name,
    color: dept.color,
    icon: dept.icon,
    summary: dept.summary,
    description: dept.description,
    groups: dept.groups,
    plan: dept.plan,
  })),
]

const selectedKey = ref('presidium')
const selected = computed(() => units.find((unit) => unit.key === selectedKey.value) ?? units[0])
const presidiumSize = presidium.groups[0]?.size ?? ''
</script>

<template>
  <section class="slide">
    <SlideHeader
      kicker="AGENDA 02"
      title="组织架构"
      desc="主席团统筹，四大部门各司其职，每个部门由部长团与普通成员组成。点击主席团或任意部门，右侧会显示它的概况。"
    />

    <div class="org">
      <div class="map">
        <button
          type="button"
          class="node node--root"
          :class="{ 'is-active': selectedKey === 'presidium' }"
          @click="selectedKey = 'presidium'"
        >
          <span class="node__icon"><AppIcon :name="presidium.icon" size="1.05em" /></span>
          <span class="node__text">
            <span class="node__name">{{ presidium.name }}</span>
            <!-- <span class="node__meta">{{ presidiumSize }} 人 · 统筹协调</span> -->
          </span>
        </button>

        <ul class="branches" :style="{ '--count': departments.length }">
          <li
            v-for="dept in departments"
            :key="dept.id"
            class="branch"
            :style="{ '--dept-color': dept.color, '--count': dept.groups.length }"
          >
            <button
              type="button"
              class="node node--dept"
              :class="{ 'is-active': selectedKey === `dept:${dept.id}` }"
              @click="selectedKey = `dept:${dept.id}`"
            >
              <span class="node__icon"><AppIcon :name="dept.icon" size="1em" /></span>
              <span class="node__text">
                <span class="node__name">{{ dept.name }}</span>
                <!-- <span class="node__meta">{{ dept.summary }}</span> -->
              </span>
            </button>

            <ul class="leaves">
              <li v-for="group in dept.groups" :key="group.id" class="leaf">
                <span class="leaf__name">{{ group.name }}</span>
                <span class="leaf__size">{{ group.size }}</span>
              </li>
            </ul>
          </li>
        </ul>
      </div>

      <Transition name="detail" mode="out-in">
        <aside
          :key="selected.key"
          class="detail surface"
          :style="{ '--unit-color': selected.color }"
        >
          <p class="detail__kind">{{ selected.kind }}</p>
          <h3 class="detail__name">
            <AppIcon :name="selected.icon" size="1.05em" />
            <span>{{ selected.name }}</span>
          </h3>
          <p class="detail__summary">{{ selected.summary }}</p>
          <p class="detail__desc">
            {{ selected.description || '这个单位的介绍待补充（src/data/departments.ts）。' }}
          </p>

          <ul class="detail__groups">
            <li v-for="group in selected.groups" :key="group.id" class="chip">
              {{ group.name }} · {{ group.size }}
            </li>
          </ul>

          <!-- <p class="detail__plan">
            <AppIcon name="target" size="0.95em" />
            <span>
              {{
                selected.plan ||
                '发展规划由各部门自行提供（src/data/departments.ts 的 plan 字段）'
              }}
            </span>
          </p> -->
        </aside>
      </Transition>
    </div>
  </section>
</template>

<style scoped>
.org {
  flex: 1;
  min-height: min(56vh, 460px);
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(260px, 0.85fr);
  gap: clamp(12px, 2vmin, 26px);
  align-items: start;
  justify-items: center;
}

/* ============================== 思维导图 ============================== */

.map {
  --tree-gap: clamp(14px, 2.2vmin, 26px);
  --branch-gap: clamp(14px, 2.2vmin, 26px);
  --leaf-gap: clamp(12px, 1.8vmin, 20px);
  display: flex;
  align-items: center;
  min-width: 0;
}

.node {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  text-align: left;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.node:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 26px var(--shadow);
}

.node__icon {
  display: grid;
  place-items: center;
  flex: none;
  width: clamp(26px, 3.6vmin, 34px);
  aspect-ratio: 1;
  border-radius: 9px;
  color: #fff;
  background: var(--node-color, var(--primary));
}

.node__text {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.node__name {
  font-size: clamp(1rem, 2.05vmin, 1.25rem);
  font-weight: 700;
  color: var(--node-color, var(--text));
}

.node__meta {
  font-size: clamp(0.75rem, 1.6vmin, 0.95rem);
  line-height: 1.4;
  color: var(--text-dim);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* —— 根节点：主席团 —— */
.node--root {
  flex: none;
  margin-right: var(--tree-gap);
  border-left: 4px solid var(--dept-chairman);
  --node-color: var(--dept-chairman);
}

/* —— 部门节点 —— */
.node--dept {
  width: clamp(160px, 13vw, 232px);
  border-left: 4px solid var(--dept-color);
  --node-color: var(--dept-color);
}

/* 主干 -> 部门节点的横线（挂在节点上，所以永远对准节点中线） */
.node--dept::before {
  content: '';
  position: absolute;
  left: calc(-1 * var(--branch-gap));
  top: 50%;
  width: var(--branch-gap);
  height: 2px;
  background: var(--border);
}

/* 部门节点 -> 成员主干 的横线 */
.node--dept::after {
  content: '';
  position: absolute;
  right: calc(-1 * var(--leaf-gap));
  top: 50%;
  width: var(--leaf-gap);
  height: 2px;
  background: var(--border);
}

.node.is-active {
  border-color: var(--node-color);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--node-color) 35%, transparent);
}

/* —— 部门列表（主干）—— */
.branches {
  position: relative;
  flex: 1;
  min-width: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
}

/* 主干竖线：从第一个部门中线连到最后一个 */
.branches::before {
  content: '';
  position: absolute;
  left: 0;
  top: calc(50% / var(--count));
  bottom: calc(50% / var(--count));
  width: 2px;
  background: var(--border);
}

/* 主席团 -> 主干的横线 */
.branches::after {
  content: '';
  position: absolute;
  left: calc(-1 * var(--tree-gap));
  top: 50%;
  width: var(--tree-gap);
  height: 2px;
  background: var(--border);
}

.branch {
  display: flex;
  align-items: center;
  min-height: clamp(66px, 12vh, 104px);
  padding: 6px 0 6px var(--branch-gap);
}

/* —— 部门内部的「部长团 / 普通成员」—— */
.leaves {
  position: relative;
  list-style: none;
  display: flex;
  flex-direction: column;
  margin-left: var(--leaf-gap);
}

.leaves::before {
  content: '';
  position: absolute;
  left: 0;
  top: calc(50% / var(--count));
  bottom: calc(50% / var(--count));
  width: 2px;
  background: var(--border);
}

.leaf {
  position: relative;
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 4px 0 4px var(--leaf-gap);
}

.leaf::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: var(--leaf-gap);
  height: 2px;
  background: var(--border);
}

.leaf__name {
  font-size: clamp(0.9rem, 2vmin, 1.2rem);
  color: var(--text);
  white-space: nowrap;
}

.leaf__size {
  font-family: 'Consolas', monospace;
  font-size: 0.8rem;
  color: var(--text-dim);
  white-space: nowrap;
}

/* ============================== 概况面板 ============================== */

.detail {
  /* align-self: stretch; */
  width: 100%;
  overflow: auto;
  padding: clamp(14px, 2.2vmin, 26px);
  border-top: 4px solid var(--unit-color);
}

.detail__kind {
  font-size: 0.72rem;
  letter-spacing: 0.28em;
  color: var(--text-dim);
}

.detail__name {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  font-size: clamp(1.15rem, 2.6vmin, 1.7rem);
  color: var(--unit-color);
}

.detail__summary {
  margin-top: 8px;
  font-size: clamp(0.85rem, 1.9vmin, 1.1rem);
  letter-spacing: 0.02em;
  color: var(--text-dim);
}

.detail__desc {
  margin-top: 12px;
  font-size: clamp(1rem, 2.2vmin, 1.5rem);
  line-height: 1.7;
  color: var(--text);
}

.detail__groups {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 14px;
  list-style: none;
}

.detail__plan {
  display: flex;
  gap: 8px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px dashed var(--border);
  font-size: clamp(0.9rem, 2vmin, 1.2rem);
  line-height: 1.7;
  color: var(--text-dim);
}

/* —— 切换单位：旧面板向左位移并淡出，新面板从右侧滑入并淡入 —— */
.detail-enter-active {
  transition: opacity 0.26s ease, transform 0.32s cubic-bezier(0.22, 0.68, 0.28, 1);
}

.detail-leave-active {
  transition: opacity 0.16s ease, transform 0.2s ease;
}

.detail-enter-from {
  opacity: 0;
  transform: translateX(32px);
}

.detail-leave-to {
  opacity: 0;
  transform: translateX(-26px);
}

/* ============================== 竖屏 / 窄屏 ============================== */

@media (max-width: 900px), (orientation: portrait) {
  .org {
    grid-template-columns: minmax(0, 1fr);
  }

  .map {
    flex-direction: column;
    align-items: stretch;
  }

  .node--root {
    align-self: flex-start;
    margin: 0 0 var(--tree-gap) 0;
  }

  /* 竖屏时主干贯穿整列，主席团与主干用一小段竖线相连 */
  .branches::before {
    top: 0;
    bottom: 0;
  }

  .branches::after {
    left: 0;
    top: calc(-1 * var(--tree-gap));
    width: 2px;
    height: var(--tree-gap);
  }

  .branch {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    min-height: 0;
    padding-top: 10px;
    padding-bottom: 10px;
  }

  .node--dept {
    width: auto;
    max-width: 100%;
  }

  /* 竖屏不需要"节点 -> 成员"的横线，改成列表缩进 */
  .node--dept::after {
    display: none;
  }

  .detail {
    border-top-width: 4px;
  }
}

@media (max-height: 560px) {
  .org {
    grid-template-columns: 1fr 1fr;
  }

  .branch {
    min-height: 54px;
  }

  .detail__desc {
    display: none;
  }
}
</style>
