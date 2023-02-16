import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import appLayout from '@/layout/appLayout.vue'
import productRoutes from './modules/product'
import orderRoutes from './modules/order'
import mediaRoutes from './modules/media'
import permissionRoutes from './modules/permission'
import nprogress from 'nprogress'
import 'nprogress/nprogress.css'
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: appLayout,
    children: [
      {
        path: '',
        name: 'home',
        meta: {
          title: '首页'
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
    component: () => import('../views/login/signIn.vue')
  },
  {
    path: '/signUp',
    name: 'signUp',
    component: () => import('../views/login/signUp.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})
router.beforeEach(() => {
  nprogress.start()
})
router.afterEach(() => {
  nprogress.done()
})
export default router
