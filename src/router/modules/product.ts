import { RouteRecordRaw, RouterView } from 'vue-router'
const productRoutes: RouteRecordRaw = {
    path: 'product',
    name: 'product',
    meta: {
        title: '商品'
    },
    component: RouterView,
    children: [
        {
            path: 'list',
            name: 'product-list',
            meta: {
                title: '商品列表'
            },
            component: () => import('@/views/product/list/index.vue')
        },
        {
            path: 'classify',
            name: 'product_classify',
            meta: {
                title: '商品分类'
            },
            component: () => import('@/views/product/classify/index.vue')
        },
        {
            path: 'attr',
            name: 'product_attr',
            meta: {
                title: '商品规格'
            },
            component: () => import('@/views/product/attr/index.vue')
        },
        {
            path: 'reply',
            name: 'product_reply',
            meta: {
                title: '商品评论'
            },
            component: () => import('@/views/product/reply/index.vue')
        }
    ]
}
export default productRoutes
