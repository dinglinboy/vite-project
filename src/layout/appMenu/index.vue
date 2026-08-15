<template>
    <el-menu
        active-text-color="#ffd04b"
        background-color="#545c64"
        class="el-menu-vertical-demo"
        :default-active="route.path"
        text-color="#fff"
        :collapse="publicStore.isCollapse"
        router
    >
        <template v-for="item in userStore.routers" :key="item.menuId">
            <!-- 目录：有子菜单 -->
            <el-sub-menu
                v-if="item.children && item.children.length"
                :index="resolvePath(item)"
            >
                <template #title>
                    <el-icon>
                        <component :is="iconMap[item.icon] || iconMap.Menu" />
                    </el-icon>
                    <span>{{ item.menuName }}</span>
                </template>
                <el-menu-item
                    v-for="child in item.children"
                    :key="child.menuId"
                    :index="resolvePath(item, child)"
                >
                    {{ child.menuName }}
                </el-menu-item>
            </el-sub-menu>
            <!-- 菜单：无子菜单 -->
            <el-menu-item v-else :index="resolvePath(item)">
                <el-icon>
                    <component :is="iconMap[item.icon] || iconMap.Menu" />
                </el-icon>
                <span>{{ item.menuName }}</span>
            </el-menu-item>
        </template>
    </el-menu>
</template>
<script lang="ts" setup>
import { usePublicStore } from '@/store'
import { useUserStore } from '@/store/user'
import { useRoute } from 'vue-router'
import type { MenuItem } from '@/api/permission'
import { iconMap } from '@/util/iconMap'

const route = useRoute()
const publicStore = usePublicStore()
const userStore = useUserStore()

/**
 * 拼接菜单跳转路径：一级为绝对路径，二级为相对路径
 */
const resolvePath = (parent: MenuItem, child?: MenuItem): string => {
    if (!child) return parent.path
    if (parent.path === '/') return `/${child.path}`
    return `${parent.path}/${child.path}`
}
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
