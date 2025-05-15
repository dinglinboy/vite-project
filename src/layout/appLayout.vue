<template>
    <el-container>
        <el-aside>
            <appMenu></appMenu>
        </el-aside>
        <el-container>
            <el-header>
                <appHeader></appHeader>
            </el-header>
            <el-main>
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>
<script lang="ts" setup>
import appMenu from './appMenu/index.vue'
import appHeader from './appHeader/index.vue'
</script>
<style lang="scss">
.el-container {
    width: 100vw;
    height: 100vh;
    .el-aside {
        width: auto;
        background: #545c64;
    }
    .el-main {
        background: #ddd;
        padding: 10px;
    }
}
</style>
