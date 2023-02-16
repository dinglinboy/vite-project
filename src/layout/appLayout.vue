<template>
  <el-container>
    <el-aside width="200px">
      <appMenu></appMenu>
    </el-aside>
    <el-container>
      <el-header>Header</el-header>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script lang="ts" setup>
import appMenu from './components/appMenu.vue'
</script>
<style lang="scss">
.el-container {
  width: 100vw;
  height: 100vh;
  .el-aside {
    background: #545c64;
  }
  .el-header {
    background: red;
  }
}
</style>
