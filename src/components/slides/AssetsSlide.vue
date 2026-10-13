<script setup lang="ts">
import { computed, ref } from 'vue'
import AppIcon from '../AppIcon.vue'
import SlideHeader from '../SlideHeader.vue'
import { assetCategories, assetItems } from '../../data/assets'

const activeCategoryId = ref(assetCategories[0].id)

const firstOfCategory = (categoryId: string) => assetItems.find((item) => item.category === categoryId)
const activeItemId = ref(firstOfCategory(assetCategories[0].id)?.id ?? assetItems[0].id)

const activeCategory = computed(
  () => assetCategories.find((category) => category.id === activeCategoryId.value) ?? assetCategories[0],
)
const items = computed(() => assetItems.filter((item) => item.category === activeCategoryId.value))
const activeItem = computed(
  () => assetItems.find((item) => item.id === activeItemId.value) ?? null,
)

const countOf = (categoryId: string) =>
  assetItems.filter((item) => item.category === categoryId).length

function selectCategory(categoryId: string) {
  if (categoryId === activeCategoryId.value) return
  activeCategoryId.value = categoryId
  const first = firstOfCategory(categoryId)
  if (first) activeItemId.value = first.id
}
</script>

<template>
  <section class="slide assets">
    <SlideHeader
      kicker="AGENDA 04"
      title="数字资产概况"
      desc="先选分类，再点具体条目，右侧会展示这一项资产的详细信息。数据只改了 src/data/assets.ts 一个文件。"
    >
      <template #side>
        <span class="chip">
          共 {{ assetItems.length }} 项 · {{ assetCategories.length }} 个分类
        </span>
      </template>
    </SlideHeader>

    <div class="assets__grid">
      <nav class="assets__cats" data-no-swipe aria-label="资产分类">
        <button
          v-for="category in assetCategories"
          :key="category.id"
          type="button"
          class="cat"
          :class="{ 'is-active': category.id === activeCategoryId }"
          :style="{ '--cat-color': category.color }"
          @click="selectCategory(category.id)"
        >
          <span class="cat__icon"><AppIcon :name="category.icon" size="1.05em" /></span>
          <span class="cat__text">
            <span class="cat__name">{{ category.name }}</span>
            <span class="cat__desc">{{ category.description }}</span>
          </span>
          <span class="cat__count">{{ countOf(category.id) }}</span>
        </button>
      </nav>

      <ul class="assets__items" data-no-swipe>
        <li v-for="item in items" :key="item.id">
          <button
            type="button"
            class="item"
            :class="{ 'is-active': item.id === activeItemId }"
            :style="{ '--cat-color': activeCategory.color }"
            @click="activeItemId = item.id"
          >
            <span class="item__name">{{ item.name }}</span>
            <span class="item__summary">{{ item.summary }}</span>
          </button>
        </li>
      </ul>

      <Transition name="fade" mode="out-in">
        <article v-if="activeItem" :key="activeItem.id" class="detail surface">
          <header class="detail__head">
            <div>
              <p class="detail__cat">{{ activeCategory.name }}</p>
              <h3 class="detail__title">{{ activeItem.name }}</h3>
            </div>
            <span v-if="activeItem.status" class="detail__status" :style="{ '--cat-color': activeCategory.color }">
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
  gap: clamp(10px, 1.6vmin, 18px);
  grid-template-columns: minmax(160px, 208px) minmax(190px, 1fr) minmax(300px, 1.35fr);
  grid-template-areas: 'cats items detail';
}

/* —— 分类 —— */
.assets__cats {
  grid-area: cats;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  overflow: auto;
}

.cat {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  text-align: left;
  border: 1px solid var(--border);
  border-left: 3px solid transparent;
  border-radius: var(--radius-sm);
  background: var(--surface);
  cursor: pointer;
  transition: border-color 0.2s ease, transform 0.2s ease, background 0.2s ease;
}

.cat:hover {
  transform: translateX(2px);
  background: var(--hover);
}

.cat.is-active {
  border-left-color: var(--cat-color);
  border-color: var(--cat-color);
}

.cat__icon {
  display: grid;
  place-items: center;
  width: 26px;
  aspect-ratio: 1;
  border-radius: 8px;
  color: var(--cat-color);
  background: color-mix(in srgb, var(--cat-color) 14%, transparent);
}

.cat__name {
  display: block;
  font-size: clamp(0.72rem, 1.7vmin, 0.86rem);
  font-weight: 700;
}

.cat__desc {
  display: none;
  font-size: 0.6rem;
  color: var(--text-dim);
  line-height: 1.5;
}

.cat.is-active .cat__desc {
  display: block;
}

.cat__count {
  font-family: 'Consolas', monospace;
  font-size: 0.7rem;
  color: var(--text-dim);
}

/* —— 条目 —— */
.assets__items {
  grid-area: items;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  overflow: auto;
}

.item {
  display: block;
  width: 100%;
  padding: 10px 12px;
  text-align: left;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.item:hover {
  background: var(--hover);
}

.item.is-active {
  border-color: var(--cat-color);
  box-shadow: inset 3px 0 0 var(--cat-color);
}

.item__name {
  display: block;
  font-size: clamp(0.72rem, 1.7vmin, 0.86rem);
  font-weight: 700;
  line-height: 1.4;
}

.item__summary {
  display: block;
  margin-top: 3px;
  font-size: clamp(0.58rem, 1.4vmin, 0.72rem);
  color: var(--text-dim);
  line-height: 1.5;
}

/* —— 详情 —— */
.detail {
  grid-area: detail;
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

/* —— 中屏：分类在左，条目在上、详情在下 —— */
@media (max-width: 1200px) {
  .assets__grid {
    grid-template-columns: minmax(150px, 190px) minmax(0, 1fr);
    grid-template-rows: minmax(0, 0.85fr) minmax(0, 1.15fr);
    grid-template-areas:
      'cats items'
      'cats detail';
  }
}

/* —— 小屏：三段竖排，分类和条目横向滑动 —— */
@media (max-width: 768px) {
  .assets__grid {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto auto minmax(0, 1fr);
    grid-template-areas:
      'cats'
      'items'
      'detail';
  }

  .assets__cats {
    flex-direction: row;
    overflow: auto hidden;
  }

  .cat {
    flex: none;
    min-width: 130px;
  }

  .assets__items {
    flex-direction: row;
    overflow: auto hidden;
  }

  .assets__items > li {
    flex: none;
    width: min(62vw, 240px);
  }

  .cat__desc {
    display: none;
  }
}
</style>
