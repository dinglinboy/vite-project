<template>
  <el-icon class="cursor" @click="publicStore.setMenuCollapse">
    <Fold v-if="!publicStore.isCollapse" />
    <Expand v-else />
  </el-icon>
</template>
<script lang="ts" setup>
import { Fold, Expand } from '@element-plus/icons-vue'
import { usePublicStore } from '@/store'
const publicStore = usePublicStore()
</script>
<style lang="scss"></style>
