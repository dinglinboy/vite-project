import { RouteRecordRaw } from 'vue-router'

const mediaRoutes: RouteRecordRaw = {
    path: 'media',
    name: 'media',
    meta: {
        title: '媒体'
    },
    component: () => import('@/views/media/index.vue')
}

export default mediaRoutes
