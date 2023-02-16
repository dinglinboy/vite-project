import { RouteRecordRaw, RouterView } from 'vue-router'

const orderRoutes: RouteRecordRaw = {
  path: 'order',
  name: 'order',
  component: RouterView,
  children: [
    {
      path: 'list',
      name: 'order-list',
      component: () => import('@/views/order/list/index.vue')
    }
  ]
}

export default orderRoutes
