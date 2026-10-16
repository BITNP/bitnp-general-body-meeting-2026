<script setup lang="ts">
import AvatarPlaceholder from '../AvatarPlaceholder.vue'
import SlideHeader from '../SlideHeader.vue'
import { members } from '../../data/members'
</script>

<template>
  <section class="slide members">
    <SlideHeader
      kicker="AGENDA 01"
      title="主席团成员"
      desc="网络开拓者协会第30届主席团。自我介绍部分可上下滚动。"
    />

    <div class="members__grid">
      <article v-for="(member, i) in members" :key="member.id" class="member surface">
        <span class="member__index">0{{ i + 1 }}</span>

        <AvatarPlaceholder
          :src="member.avatar"
          :alt="member.name || '主席团成员头像'"
          :label="`头像 ${i + 1}`"
        />

        <div class="member__id">
          <h3 class="member__name">{{ member.name || '姓名待补充' }}</h3>
          <p class="member__role">{{ member.role || '职务待补充' }}</p>
        </div>

        <!-- 卡片高度是固定的，简介太长只在这一段里滚：上面的头像、姓名、职务都不会动 -->
        <div v-if="member.bio" class="member__bio-scroll">
          <span v-for="paragraph in member.bio.split('\n')" class="member__bio">{{ paragraph }}<br></span>
        </div>
        <div v-else class="empty-slot member__bio member__bio--empty">
          一段自我介绍<br />（负责方向 · 想对大家说的话）
        </div>

        <ul v-if="member.tags.length" class="member__tags">
          <li v-for="tag in member.tags" :key="tag" class="chip">{{ tag }}</li>
        </ul>
      </article>
    </div>
  </section>
</template>

<style scoped>
.members__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  /*
   * 卡片高度固定成一屏里剩下的那段：行高按可用高度均分，
   * minmax(0, …) 让行高不被内容撑大（否则长简介会把整块顶高、卡片高低不齐）。
   * 简介超出卡片时不再往外溢，改由 .member__bio-scroll 自己滚。
   */
  grid-auto-rows: minmax(0, 1fr);
  gap: clamp(10px, 1.8vmin, 22px);
  align-items: stretch;
  flex: 1;
  /* 允许它被压到比内容还矮，行高才真的由屏幕高度说了算 */
  min-height: 0;
}

.member {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(8px, 1.6vmin, 16px);
  padding: clamp(14px, 2.4vmin, 28px);
  min-height: 0;
  overflow: hidden;
  transition: transform 0.3s ease, border-color 0.3s ease;
}

.member::before {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: 4px;
  background: linear-gradient(to right, var(--primary), #f1c40f);
  opacity: 0.85;
}

.member:hover {
  transform: translateY(-4px);
  border-color: var(--primary);
}

/* 高度固定后，头像跟姓名/职务固定不参与收缩：长简介只挤自己那一段 */
.member .avatar,
.member__id {
  flex: none;
}

.member__index {
  align-self: flex-start;
  font-family: 'Consolas', monospace;
  font-size: 0.85rem;
  letter-spacing: 0.2em;
  color: var(--primary);
}

.member__id {
  text-align: center;
}

.member__name {
  font-size: clamp(1.2rem, 2.7vmin, 1.85rem);
  font-weight: 700;
  letter-spacing: 0.04em;
}

.member__role {
  margin-top: 2px;
  font-size: clamp(0.85rem, 1.95vmin, 1.15rem);
  letter-spacing: 0.12em;
  color: var(--text-dim);
}

/* 简介的滚动区：占满卡片里除头像/姓名/标签之外的那一段 */
.member__bio-scroll {
  flex: 1;
  width: 100%;
  min-height: 0;
  overflow-y: auto;
  /* 像 markdown 里的代码块：底色比卡片深一档、四周留白、一圈圆角小方块 */
  padding: clamp(8px, 1.4vmin, 14px);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface-3);
}

.member__bio {
  width: 100%;
  font-size: clamp(1rem, 2.2vmin, 1.5rem);
  line-height: 1.5;
  color: var(--text-dim);
}

/* 没填简介时的虚线占位框：同样把这一段填满，卡片看起来才对称 */
.member__bio--empty {
  flex: 1;
  min-height: 0;
  line-height: 1.6;
}

.member__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  list-style: none;
  justify-content: center;
}

@media (max-width: 1100px) {
  .members__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 620px) {
  .members__grid {
    grid-template-columns: 1fr;
  }

  .member {
    align-items: center;
  }
}

/* 横屏手机：一排放得下，横向压缩 */
@media (max-height: 560px) {
  .members__grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .member {
    gap: 6px;
    padding: 10px;
  }

  .member__bio--empty {
    min-height: 40px;
    font-size: 0.6rem;
  }
}

/* ==================== 卡片高度固定 ==================== */

/*
 * 4 张卡排成一排时，这一节正好占一屏（和 3D 地图那一节同一个做法）。
 * 这一步是必须的：只有这一节的高度确定了，上面那条 minmax(0, 1fr) 的行高
 * 才会"按屏幕均分"成固定值、简介区才真的会溢出滚动 ——
 * 高度还是 auto 的话，长简介照样能把行高和整节一起顶大。
 */
@media (min-width: 1101px), (max-height: 560px) {
  .members {
    height: calc(100dvh - var(--header-h));
    overflow: hidden;
  }
}

/*
 * 2 列 / 1 列时卡片要换行，一屏塞不下 4 张，所以改成"每张卡各自固定高度"：
 * 卡片仍然张张等高、长简介仍然自己滚，装不下的部分交给页面滚动。
 */
@media (max-width: 1100px) and (min-height: 561px) {
  .members__grid {
    grid-auto-rows: clamp(340px, 54vh, 480px);
  }
}
</style>
