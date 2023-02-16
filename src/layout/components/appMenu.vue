<template>
  <el-menu
    active-text-color="#ffd04b"
    background-color="#545c64"
    class="el-menu-vertical-demo"
    default-active="2"
    text-color="#fff"
    router
  >
    <el-menu-item index="/">
      <!-- <el-icon><icon-menu /></el-icon> -->
      <span>首页</span>
    </el-menu-item>
    <el-sub-menu index="/product">
      <template #title>
        <span>商品</span>
      </template>
      <el-menu-item index="/product/list">商品列表</el-menu-item>
      <el-menu-item index="/product/classify">商品分类</el-menu-item>
      <el-menu-item index="/product/attr">商品规格</el-menu-item>
      <el-menu-item index="/product/reply">商品评论</el-menu-item>
    </el-sub-menu>
    <el-sub-menu index="/order">
      <template #title>
        <span>订单</span>
      </template>
      <el-menu-item index="/order/list">订单列表</el-menu-item>
    </el-sub-menu>
    <el-menu-item index="/media">媒体 </el-menu-item>
    <el-sub-menu index="/permission">
      <template #title>
        <span>权限</span>
      </template>
      <el-menu-item index="/permission/role">角色</el-menu-item>
      <el-menu-item index="/permission/admin">管理员</el-menu-item>
      <el-menu-item index="/permission/rule">权限规则</el-menu-item>
    </el-sub-menu>
  </el-menu>
</template>
<script lang="ts" setup></script>
