<template>
    <div class="app-header">
        <div class="app-header-left">
            <appFold></appFold>
            <appBreadcrumb></appBreadcrumb>
        </div>
        <div class="app-header-right">
            <appFullScreen></appFullScreen>
            <appProfile></appProfile>
        </div>
    </div>
</template>

<script lang="ts" setup>
import appBreadcrumb from './appBreadcrumb.vue'
import appFold from './appFold.vue'
import appFullScreen from './appFullScreen.vue'
import appProfile from './appProfile.vue'
</script>
<style lang="scss">
.app-header {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: space-between;
    &-left {
        display: flex;
        height: 100%;
        align-items: center;
        gap: 10px;
    }
    &-right {
        display: flex;
        height: 100%;
        align-items: center;
        gap: 10px;
    }
}
</style>
