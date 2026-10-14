<script setup lang="ts">
import TapeEffect from '../TapeEffect.vue'
import logoUrl from '../../assets/logo.png'
import { meeting } from '../../data/deck'

/** 封面不是当前页时，胶带动画会暂停（省电） */
const props = withDefaults(defineProps<{ active?: boolean }>(), { active: true })

const tapeText = `${meeting.association} · 网络无限 开拓不懈 · ${meeting.associationEn} · `
</script>

<template>
  <section class="slide cover">
    <div class="cover__grid">
      <div class="cover__logo">
        <img class="cover__logo-img" :src="logoUrl" :alt="meeting.association" />
        <TapeEffect :text="tapeText" :rotation="-15" :active="props.active" />
        <TapeEffect :text="tapeText" :rotation="10" :active="props.active" />
      </div>

      <div class="cover__body">
        <p class="slide-kicker">2026–2027 · GENERAL MEETING</p>
        <h1 class="cover__title">{{ meeting.association }}</h1>
        <p class="cover__en">{{ meeting.associationEn }}</p>
        <p class="cover__meeting">{{ meeting.title }}</p>

        <div class="cover__slogan">
          <span class="cover__slogan-text">{{ meeting.slogan }}</span>
          <span class="cover__slogan-bar" aria-hidden="true" />
        </div>

        <dl class="cover__meta">
          <div>
            <dt>时间</dt>
            <dd>{{ meeting.date }}</dd>
          </div>
          <div>
            <dt>地点</dt>
            <dd>{{ meeting.place }}</dd>
          </div>
          <div>
            <dt>主持</dt>
            <dd>{{ meeting.host }}</dd>
          </div>
        </dl>

        <!-- <p class="hint">← → 或空格翻页 · 底部可以切换「分页 / 连续」模式</p> -->
      </div>
    </div>
  </section>
</template>

<style scoped>
.cover {
  justify-content: center;
}

.cover__grid {
  display: grid;
  grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
  align-items: center;
  gap: clamp(20px, 5vmin, 80px);
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.cover__logo {
  position: relative;
  width: min(100%, 42vh, 460px);
  aspect-ratio: 1 / 1;
  margin: 0 auto;
}

.cover__logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 50%;
  box-shadow: 0 10px 40px var(--shadow), 0 0 30px rgba(var(--primary-rgb), 0.25);
}

.cover__body {
  min-width: 0;
}

.cover__title {
  font-family: 'SmileySans', sans-serif;
  font-style: oblique;
  font-weight: 500;
  font-size: clamp(2rem, 7.4vmin, 5.6rem);
  line-height: 1.1;
  letter-spacing: 0.04em;
  margin-top: 6px;
}

.cover__en {
  font-family: 'Consolas', 'Segoe UI', monospace;
  font-size: clamp(0.7rem, 2vmin, 1.4rem);
  font-weight: 700;
  letter-spacing: 0.14em;
  color: transparent;
  -webkit-text-stroke: 1px var(--primary);
  text-stroke: 1px var(--primary);
  opacity: 0.85;
  text-align: right;
  margin-top: 4px;
}

.cover__meeting {
  margin-top: clamp(8px, 2vmin, 22px);
  font-size: clamp(1rem, 2.4vmin, 1.5rem);
  font-weight: 600;
  color: var(--text);
  letter-spacing: 0.02em;
}

.cover__slogan {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: clamp(8px, 1.8vmin, 18px);
}

.cover__slogan-text {
  font-size: clamp(0.95rem, 2.2vmin, 1.35rem);
  font-weight: 800;
  letter-spacing: 0.24em;
  color: var(--primary);
  white-space: nowrap;
}

.cover__slogan-bar {
  flex: 1;
  min-width: 40px;
  height: 3px;
  border-radius: 3px;
  background: linear-gradient(to right, var(--primary), #f1c40f);
}

.cover__meta {
  display: flex;
  flex-wrap: wrap;
  gap: clamp(10px, 3vmin, 40px);
  margin-top: clamp(12px, 3vmin, 32px);
  padding-top: clamp(10px, 2vmin, 20px);
  border-top: 1px solid var(--border);
}

.cover__meta dt {
  font-size: 0.72rem;
  letter-spacing: 0.24em;
  color: var(--text-dim);
  margin-bottom: 4px;
}

.cover__meta dd {
  font-size: clamp(0.95rem, 2.1vmin, 1.4rem);
  font-weight: 600;
}

@media (max-width: 900px) {
  .cover__grid {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    gap: clamp(12px, 3vmin, 28px);
    text-align: left;
  }

  .cover__logo {
    width: min(58vw, 30vh);
  }

  .cover__en {
    text-align: left;
  }
}

@media (max-height: 560px) {
  .cover__grid {
    grid-template-columns: minmax(0, 0.6fr) minmax(0, 1.4fr);
    gap: 24px;
  }

  .cover__logo {
    width: min(38vw, 60vh);
  }
}
</style>
