<template>
    <el-menu
        active-text-color="var(--mall-sidebar-text-active)"
        background-color="transparent"
        class="el-menu-vertical-demo"
        :default-active="route.path"
        text-color="var(--mall-sidebar-text)"
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
<style lang="scss">
.el-menu {
    height: 100%;
    border-right: none;
    --el-menu-bg-color: transparent;
    --el-menu-text-color: var(--mall-sidebar-text);
    --el-menu-active-color: var(--mall-sidebar-text-active);
    --el-menu-hover-bg-color: rgba(255, 255, 255, 0.08);
    // 子菜单展开面板
    .el-menu {
        background: rgba(0, 0, 0, 0.18);
        border-radius: 0;
    }
    // 选中项：左侧品牌蓝指示条 + 微渐变
    .el-menu-item.is-active {
        background: linear-gradient(
            90deg,
            rgba(37, 99, 235, 0.45),
            rgba(37, 99, 235, 0.12)
        );
        box-shadow: inset 3px 0 0 var(--mall-primary);
        font-weight: 600;
    }
    .el-menu-item,
    .el-sub-menu__title {
        transition: background-color 0.2s ease, color 0.2s ease;
    }
}
.el-menu-vertical-demo:not(.el-menu--collapse) {
    width: 200px;
    min-height: 400px;
}
</style>
