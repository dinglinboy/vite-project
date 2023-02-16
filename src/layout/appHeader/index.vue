<template>
  <div class="app-header-breadcrumb">
    <el-icon @click="publicStore.setMenuCollapse"
      ><Fold size="large"
    /></el-icon>
    <el-breadcrumb size="large" :separator-icon="ArrowRight">
      <el-breadcrumb-item :to="{ path: '/' }">商品</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script lang="ts" setup>
import { ArrowRight, Fold } from '@element-plus/icons-vue'
import { usePublicStore } from '@/store'
const publicStore = usePublicStore()
</script>
<style lang="scss">
.app-header-breadcrumb {
  display: flex;
  align-items: center;
  height: 100%;
}
</style>
