import { RouteRecordRaw, RouterView } from 'vue-router'

const orderRoutes: RouteRecordRaw = {
    path: 'order',
    name: 'order',
    meta: {
        title: true,
        name: '订单'
    },
    component: RouterView,
    children: [
        {
            path: 'list',
            name: 'order-list',
            meta: {
                title: true,
                name: '订单列表'
            },
            component: () => import('@/views/order/list/index.vue')
        }
    ]
}

export default orderRoutes
