import { defineStore } from 'pinia'
import router from '@/router/index'
import { getInfoApi, getRoutersApi, MenuItem } from '@/api/permission'
import { buildRoutes } from '@/router/helpers'
import { clearUserInfo } from '@/util/util'

interface UserState {
    userInfo: Record<string, any>
    roles: string[]
    permissions: string[]
    routers: MenuItem[]
    isLoaded: boolean
    addedRouteNames: string[]
}

export const useUserStore = defineStore('User', {
    state: (): UserState => ({
        userInfo: {},
        roles: [],
        permissions: [],
        routers: [],
        isLoaded: false,
        addedRouteNames: []
    }),
    getters: {
        /** 是否超管 */
        isSuperAdmin: (state) => state.roles.includes('admin')
    },
    actions: {
        /**
         * 登录后/刷新页面时加载：用户信息 + 动态路由注册
         */
        async loadUserState() {
            const [infoRes, routersRes] = await Promise.all([
                getInfoApi(),
                getRoutersApi()
            ])
            if (infoRes.code !== 0 || routersRes.code !== 0) {
                throw new Error(
                    infoRes.msg || routersRes.msg || '加载用户信息失败'
                )
            }
            this.userInfo = infoRes.result?.user || {}
            this.roles = infoRes.result?.roles || []
            this.permissions = infoRes.result?.permissions || []
            this.routers = routersRes.result || []
            this.registerRoutes()
            this.isLoaded = true
        },
        /**
         * 把后端菜单注册为动态路由 + 兜底重定向
         */
        registerRoutes() {
            const routes = buildRoutes(this.routers)
            routes.forEach((route) => {
                router.addRoute('Layout', route)
                this.addedRouteNames.push(route.name as string)
            })
            router.addRoute({ path: '/:pathMatch(.*)*', redirect: '/' })
        },
        /**
         * 移除动态路由（登出/切换账号时调用，防止跨账号残留）
         */
        removeRoutes() {
            this.addedRouteNames.forEach((name) => {
                if (router.hasRoute(name)) router.removeRoute(name)
            })
            if (router.hasRoute('NotFound')) router.removeRoute('NotFound')
            this.addedRouteNames = []
        },
        /**
         * 重置状态（登出）
         */
        reset() {
            this.removeRoutes()
            this.userInfo = {}
            this.roles = []
            this.permissions = []
            this.routers = []
            this.isLoaded = false
            clearUserInfo()
        }
    }
})
