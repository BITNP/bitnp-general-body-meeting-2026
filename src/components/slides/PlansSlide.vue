<script setup lang="ts">
import AppIcon from '../AppIcon.vue'
import SlideHeader from '../SlideHeader.vue'
import { departments } from '../../data/departments'
</script>

<template>
  <section class="slide plans">
    <SlideHeader
      kicker="AGENDA 06"
      title="各部门发展规划"
      desc="这一页留给各部门自己讲：把计划填进 src/data/departments.ts 的 plan 字段，占位框会自动换成正文。"
    />

    <div class="plans__grid">
      <article
        v-for="dept in departments"
        :key="dept.id"
        class="plan surface"
        :style="{ '--dept-color': dept.color }"
      >
        <header class="plan__head">
          <span class="plan__icon"><AppIcon :name="dept.icon" size="1.05em" /></span>
          <h3 class="plan__name">{{ dept.name }}</h3>
        </header>
        <p class="plan__summary">{{ dept.summary }}</p>
        <p v-if="dept.plan" class="plan__body">{{ dept.plan }}</p>
        <div v-else class="empty-slot plan__body">
          本部门发展规划<br />（由部门自行提供）
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.plans__grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: clamp(10px, 1.8vmin, 20px);
  align-items: stretch;
}

.plan {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: clamp(12px, 2vmin, 22px);
  border-top: 4px solid var(--dept-color);
}

.plan__head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.plan__icon {
  display: grid;
  place-items: center;
  width: clamp(26px, 4.2vmin, 38px);
  aspect-ratio: 1;
  border-radius: 10px;
  color: #fff;
  background: var(--dept-color);
}

.plan__name {
  font-size: clamp(0.85rem, 2.1vmin, 1.1rem);
  color: var(--dept-color);
}

.plan__summary {
  font-size: clamp(0.6rem, 1.4vmin, 0.74rem);
  line-height: 1.6;
  color: var(--text-dim);
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border);
}

.plan__body {
  flex: 1;
  font-size: clamp(0.64rem, 1.55vmin, 0.8rem);
  line-height: 1.8;
  color: var(--text-dim);
}

@media (max-width: 1100px) {
  .plans__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 620px) {
  .plans__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-height: 560px) {
  .plans__grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
