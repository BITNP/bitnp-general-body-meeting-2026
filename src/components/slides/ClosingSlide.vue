<script setup lang="ts">
import AppIcon from '../AppIcon.vue'
import { meeting } from '../../data/deck'
import { useThemeLogo } from '../../composables/useThemeLogo'

/** 亮暗主题各一张 logo（见 composables/useThemeLogo.ts） */
const logoUrl = useThemeLogo()
</script>

<template>
  <section class="slide closing">
    <div class="closing__inner">
      <img class="closing__logo" :src="logoUrl" :alt="meeting.association" />
      <p class="slide-kicker closing__kicker">THANKS</p>
      <h2 class="closing__title">谢谢大家</h2>
      <p class="closing__slogan">{{ meeting.slogan }}</p>

      <!-- <div class="closing__panels">
        <article class="closing__panel surface">
          <h3 class="closing__panel-title">
            <AppIcon name="pin" size="1em" />
            <span>加入我们</span>
          </h3>
          <div class="empty-slot closing__slot">招新 / 公众号二维码</div>
          <p class="closing__note">二维码图片放进 src/assets 后替换这里即可。</p>
        </article>

        <article class="closing__panel surface">
          <h3 class="closing__panel-title">
            <AppIcon name="external" size="1em" />
            <span>找到我们</span>
          </h3>
          <ul class="closing__links">
            <li><a href="https://bitnp.net/" target="_blank" rel="noopener noreferrer">bitnp.net · 官网</a></li>
            <li><a href="https://live.bitnp.net/" target="_blank" rel="noopener noreferrer">live.bitnp.net · NPLive</a></li>
            <li><a href="https://bithesis.bitnp.net/" target="_blank" rel="noopener noreferrer">bithesis.bitnp.net · BITHESIS</a></li>
            <li><a href="https://github.com/BITNP" target="_blank" rel="noopener noreferrer">github.com/BITNP</a></li>
          </ul>
          <p class="closing__note">公众号、B 站、新生群等入口待补充。</p>
        </article>
      </div> -->
    </div>
  </section>
</template>

<style scoped>
.closing {
  justify-content: center;
  align-items: center;
}

.closing__inner {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: clamp(6px, 1.4vmin, 14px);
}

.closing__logo {
  width: clamp(60px, 13vmin, 120px);
  aspect-ratio: 1;
  object-fit: contain;
  border-radius: 50%;
  box-shadow: 0 8px 30px var(--shadow);
}

.closing__kicker::before {
  display: none;
}

.closing__title {
  font-family: 'SmileySans', sans-serif;
  font-style: oblique;
  font-weight: 500;
  font-size: clamp(1.8rem, 6.4vmin, 4.4rem);
  letter-spacing: 0.06em;
}

.closing__slogan {
  font-size: clamp(1rem, 2.3vmin, 1.4rem);
  font-weight: 800;
  letter-spacing: 0.32em;
  color: var(--primary);
}

.closing__panels {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(10px, 1.8vmin, 20px);
  width: 100%;
  margin-top: clamp(10px, 2.4vmin, 28px);
  text-align: left;
}

.closing__panel {
  padding: clamp(12px, 2vmin, 22px);
}

.closing__panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: clamp(1.05rem, 2.3vmin, 1.5rem);
  color: var(--primary);
  margin-bottom: 10px;
}

.closing__slot {
  min-height: clamp(70px, 16vmin, 130px);
}

.closing__links {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.closing__links a {
  font-size: clamp(1rem, 2.15vmin, 1.4rem);
}

.closing__note {
  margin-top: 10px;
  font-size: 0.62rem;
  color: var(--text-dim);
}

@media (max-width: 768px) {
  .closing__panels {
    grid-template-columns: 1fr;
  }
}
</style>
