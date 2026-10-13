<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    kicker?: string
    desc?: string
  }>(),
  {
    kicker: '',
    desc: '',
  },
)
</script>

<template>
  <header class="slide-head">
    <div class="slide-head__main">
      <p v-if="kicker" class="slide-kicker">{{ kicker }}</p>
      <h2 class="slide-title">{{ title }}</h2>
    </div>
    <div class="slide-head__side">
      <slot name="side" />
    </div>
  </header>
  <p v-if="desc" class="slide-desc">{{ desc }}</p>
</template>

<style scoped>
.slide-head__main {
  min-width: 0;
}

.slide-head__side {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
</style>
