import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import appLayout from '@/layout/appLayout.vue'
import productRoutes from './modules/product'
import orderRoutes from './modules/order'
import mediaRoutes from './modules/media'
import permissionRoutes from './modules/permission'
import nprogress from 'nprogress'
import 'nprogress/nprogress.css'
import { getUserInfo } from '@/util/util'
const routes: RouteRecordRaw[] = [
    {
        path: '/',
        component: appLayout,
        children: [
            {
                path: '',
                name: 'home',
                meta: {
                    title: true,
                    name: '首页'
                },
                component: () => import('../views/home/index.vue')
            },
            productRoutes,
            orderRoutes,
            mediaRoutes,
            permissionRoutes
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
const publicPage = ['login', 'signUp']
router.beforeEach((to, from, next) => {
    nprogress.start()
    const { jwt_token } = getUserInfo() || {};
    if (jwt_token) {
        next()
    } else {
        if (to.meta.noAuth) {
            //防止next无限循环的问题
            next()
            return
        }
        next({
            path: '/login',
            query: {
                redirect: to.fullPath
            }
        })
    }
})
router.afterEach(() => {
    nprogress.done()
})
export default router
