<script setup lang="ts">
import AppIcon from './AppIcon.vue'

const props = withDefaults(
  defineProps<{ src?: string | null; alt?: string; label?: string }>(),
  {
    src: null,
    alt: '',
    label: '头像待补充',
  },
)
</script>

<template>
  <div class="avatar" :class="{ 'avatar--empty': !props.src }">
    <img v-if="props.src" class="avatar__img" :src="props.src" :alt="props.alt" />
    <template v-else>
      <AppIcon name="image" size="1.7em" />
      <span class="avatar__label">{{ props.label }}</span>
    </template>
  </div>
</template>

<style scoped>
.avatar {
  position: relative;
  aspect-ratio: 1 / 1;
  width: 100%;
  max-width: 148px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--surface-2);
  border: 2px solid var(--border);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: var(--text-dim);
}

.avatar--empty {
  border-style: dashed;
}

.avatar__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar__label {
  font-size: 0.6rem;
  letter-spacing: 0.08em;
}

@media (max-height: 560px) {
  .avatar {
    max-width: 76px;
  }

  .avatar__label {
    display: none;
  }
}
</style>
