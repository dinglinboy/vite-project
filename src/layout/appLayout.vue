<template>
    <el-container class="app-shell">
        <el-aside class="app-aside">
            <appMenu></appMenu>
        </el-aside>
        <el-container>
            <el-header class="app-header">
                <appHeader></appHeader>
            </el-header>
            <el-main class="app-main">
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
.app-shell {
    width: 100vw;
    height: 100vh;
    .app-aside {
        width: auto;
        background: var(--mall-sidebar-bg);
        box-shadow: 2px 0 12px rgba(15, 23, 42, 0.12);
        z-index: 2;
    }
    .app-header {
        height: 56px;
        background: var(--mall-header-bg);
        backdrop-filter: blur(var(--mall-header-blur));
        -webkit-backdrop-filter: blur(var(--mall-header-blur));
        border-bottom: 1px solid var(--mall-header-border);
        padding: 0 16px;
        position: sticky;
        top: 0;
        z-index: 1;
    }
    .app-main {
        background: var(--mall-bg);
        padding: 16px;
        overflow-y: auto;
    }
}
</style>
