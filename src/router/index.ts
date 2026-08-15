import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import appLayout from '@/layout/appLayout.vue'
import nprogress from 'nprogress'
import 'nprogress/nprogress.css'
import { getJwtToken, clearJwtToken } from '@/util/util'
import { useUserStore } from '@/store/user'

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'Layout',
        component: appLayout,
        children: [
            {
                // 个人中心不进菜单，所有登录用户可用
                path: 'profile',
                name: 'profile',
                meta: {
                    title: true,
                    name: '个人中心'
                },
                component: () => import('../views/profile/index.vue')
            },
            {
                // 商品新增/编辑页不进菜单（从列表页跳转，query.id 区分新增/编辑）
                path: 'product/add',
                name: 'productAdd',
                meta: {
                    title: true,
                    name: '新增商品'
                },
                component: () => import('../views/product/add/index.vue')
            },
            {
                // 字典数据页不进菜单（从字典管理跳转，query.dictType 定位）
                path: 'system/dict/data',
                name: 'dictData',
                meta: {
                    title: true,
                    name: '字典数据'
                },
                component: () => import('../views/system/dict/data.vue')
            }
        ]
    },
    {
        path: '/login',
        name: 'login',
        meta: {
            noAuth: true,
            title: true,
            name: '登录'
        },
        component: () => import('../views/login/signIn.vue')
    },
    {
        path: '/signUp',
        name: 'signUp',
        meta: {
            noAuth: true,
            title: true,
            name: '注册'
        },
        component: () => import('../views/login/signUp.vue')
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

router.beforeEach(async (to, from, next) => {
    nprogress.start()
    const jwtToken = getJwtToken() || ''
    // 未登录：仅放行公开页
    if (!jwtToken) {
        if (to.meta.noAuth) {
            next()
        } else {
            next({
                path: '/login',
                query: {
                    redirect: to.fullPath
                }
            })
        }
        return
    }
    // 已登录但未加载用户信息/动态路由（首次进入或刷新）
    const userStore = useUserStore()
    if (!userStore.isLoaded) {
        try {
            await userStore.loadUserState()
            // 重新进入目标路由，让新增路由生效
            next({ ...to, replace: true })
        } catch (error) {
            // 加载失败（token 失效等）：清理本地登录态
            clearJwtToken()
            next({
                path: '/login',
                query: {
                    redirect: to.fullPath
                }
            })
        }
        return
    }
    next()
})

router.afterEach(() => {
    nprogress.done()
})
export default router
