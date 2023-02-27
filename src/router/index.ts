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
  // const { jwt_token } = getUserInfo()
  // if ('/login' !== to.path && jwt_token) {
  //   next()
  // } else if ('/login' === to.path) {
  //   next()
  // } else {
  //   router.push('/login')
  //   next()
  // }
})
router.afterEach(() => {
  nprogress.done()
})
export default router
