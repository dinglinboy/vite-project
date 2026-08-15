import { RouteRecordRaw, RouterView } from 'vue-router'
import type { MenuItem } from '@/api/permission'

// 映射 views 下所有页面组件（供后端 component 字符串动态定位）
const viewModules = import.meta.glob('../views/**/*.vue')

/**
 * 根据 component 字符串找页面组件
 * 约定：component 形如 'product/list/index' → ../views/product/list/index.vue
 */
export const resolveViewComponent = (component: string) => {
    const key = `../views/${component}.vue`
    return viewModules[key]
}

/**
 * 把一级菜单节点转成挂在 Layout 下的路由记录
 */
const buildRouteRecord = (menu: MenuItem, isRoot: boolean): RouteRecordRaw => {
    // 一级菜单 path 为绝对路径（'/' 或 '/product'），挂到 Layout 下需转为相对
    let path = menu.path
    if (isRoot) {
        path = path === '/' ? '' : path.replace(/^\//, '')
    }
    const children = (menu.children || []).map((child) =>
        buildRouteRecord(child, false)
    )
    // 目录节点（M）：无页面，用 RouterView 占位承接子路由
    if (!menu.component && children.length) {
        return {
            path,
            name: `menu_${menu.menuId}`,
            meta: { title: true, name: menu.menuName },
            component: RouterView,
            children
        }
    }
    return {
        path,
        name: `menu_${menu.menuId}`,
        meta: { title: true, name: menu.menuName },
        component: resolveViewComponent(menu.component),
        children: children.length ? children : undefined
    }
}

/**
 * 后端菜单树 → 动态路由记录数组（挂到 Layout 下）
 */
export const buildRoutes = (menus: MenuItem[]): RouteRecordRaw[] => {
    return menus.map((menu) => buildRouteRecord(menu, true))
}
