<script setup lang="ts">
import SlideHeader from '../SlideHeader.vue'

/**
 * 小节目与小游戏 —— 现场环节，和「各部门发展规划」一样是一屏留白：
 * 标题下面只留大块空屏，具体内容现场投屏讲。
 */
</script>

<template>
  <section class="slide show">
    <SlideHeader
      kicker="AGENDA 07"
      title="小节目与小游戏"
      desc="现场小节目与小游戏活动，请看大屏。"
    />

    <!-- 留白：这一屏给台上的小节目 / 小游戏用 -->
    <div class="show__stage"></div>
  </section>
</template>

<style scoped>
/* 和「各部门发展规划」一样：标题下面留空，撑满剩下的高度 */
.show__stage {
  flex: 1;
}
</style>
