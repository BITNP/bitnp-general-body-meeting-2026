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
      desc="4 个位置已经排好版：头像、姓名与一段自我介绍。内容填在 src/data/members.ts 里，留空时显示占位框。"
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

        <p v-if="member.bio" class="member__bio">{{ member.bio }}</p>
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
  gap: clamp(10px, 1.8vmin, 22px);
  align-items: stretch;
  flex: 1;
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

.member__index {
  align-self: flex-start;
  font-family: 'Consolas', monospace;
  font-size: 0.72rem;
  letter-spacing: 0.2em;
  color: var(--primary);
}

.member__id {
  text-align: center;
}

.member__name {
  font-size: clamp(0.95rem, 2.4vmin, 1.3rem);
  font-weight: 700;
  letter-spacing: 0.04em;
}

.member__role {
  margin-top: 2px;
  font-size: clamp(0.66rem, 1.6vmin, 0.8rem);
  letter-spacing: 0.12em;
  color: var(--text-dim);
}

.member__bio {
  flex: 1;
  width: 100%;
  font-size: clamp(0.68rem, 1.6vmin, 0.84rem);
  line-height: 1.75;
  color: var(--text-dim);
}

.member__bio--empty {
  min-height: 78px;
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
</style>
