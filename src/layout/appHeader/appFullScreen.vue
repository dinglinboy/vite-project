<template>
  <el-icon @click="toggleFullScreen" class="cursor"><iconFullScreen /></el-icon>
</template>
<script lang="ts" setup>
import { FullScreen as iconFullScreen } from '@element-plus/icons-vue'
const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else if (document.exitFullscreen) {
    document.exitFullscreen()
  }
}
</script>
