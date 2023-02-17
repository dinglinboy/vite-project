<template>
  <el-menu
    active-text-color="#ffd04b"
    background-color="#545c64"
    class="el-menu-vertical-demo"
    default-active="2"
    text-color="#fff"
    :collapse="publicStore.isCollapse"
    router
  >
    <el-menu-item index="/">
      <el-icon><icon-menu /></el-icon>
      <span>首页</span>
    </el-menu-item>
    <el-sub-menu index="/product">
      <template #title>
        <el-icon><location /></el-icon>
        <span>商品</span>
      </template>
      <el-menu-item index="/product/list">商品列表</el-menu-item>
      <el-menu-item index="/product/classify">商品分类</el-menu-item>
      <el-menu-item index="/product/attr">商品规格</el-menu-item>
      <el-menu-item index="/product/reply">商品评论</el-menu-item>
    </el-sub-menu>
    <el-sub-menu index="/order">
      <template #title>
        <el-icon><document /></el-icon>
        <span>订单</span>
      </template>
      <el-menu-item index="/order/list">订单列表</el-menu-item>
    </el-sub-menu>
    <el-menu-item index="/media">
      <el-icon><BellFilled /></el-icon>
      <span>媒体</span>
    </el-menu-item>
    <el-sub-menu index="/permission">
      <template #title>
        <el-icon><setting /></el-icon>
        <span>权限</span>
      </template>
      <el-menu-item index="/permission/role">角色</el-menu-item>
      <el-menu-item index="/permission/admin">管理员</el-menu-item>
      <el-menu-item index="/permission/rule">权限规则</el-menu-item>
    </el-sub-menu>
  </el-menu>
</template>
<script lang="ts" setup>
import {
  Document,
  Menu as IconMenu,
  Location,
  Setting,
  BellFilled
} from '@element-plus/icons-vue'
import { usePublicStore } from '@/store'
const publicStore = usePublicStore()
</script>
<style scoped>
.el-menu {
  height: 100%;
}
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
}
</style>
