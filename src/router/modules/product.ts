import { RouteRecordRaw, RouterView } from 'vue-router'
const productRoutes: RouteRecordRaw = {
  path: 'product',
  name: 'product',
  component: RouterView,
  children: [
    {
      path: 'list',
      name: 'product-list',
      component: () => import('@/views/product/list/index.vue')
    },
    {
      path: 'classify',
      name: 'product_classify',
      component: () => import('@/views/product/classify/index.vue')
    },
    {
      path: 'attr',
      name: 'product_attr',
      component: () => import('@/views/product/attr/index.vue')
    },
    {
      path: 'reply',
      name: 'product_reply',
      component: () => import('@/views/product/reply/index.vue')
    }
  ]
}
export default productRoutes
