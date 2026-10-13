<script setup lang="ts">
import SlideHeader from '../SlideHeader.vue'
import OutpostsMap from '../OutpostsMap.vue'
import { venues } from '../../data/venues'

defineProps<{
  /** 这一页是否是当前页（用来决定什么时候挂载 3D 场景） */
  active: boolean
}>()
</script>

<template>
    <section class="slide slide--screen venues">
    <SlideHeader
      kicker="AGENDA 03"
      title="我们的据点"
      desc="良乡校区的三处活动场地。移动鼠标（手机上倾斜设备）会让视角微微转动，点击黄色光柱或上方按钮查看每个据点的位置与服务。"
    />
    <OutpostsMap :venues="venues" :active="active" />
  </section>
</template>

<style scoped>
.venues {
  gap: clamp(8px, 1.4vmin, 16px);
}
</style>
