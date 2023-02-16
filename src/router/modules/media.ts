import { RouteRecordRaw } from 'vue-router'

const mediaRoutes: RouteRecordRaw = {
  path: 'media',
  name: 'media',
  component: () => import('@/views/media/index.vue')
}

export default mediaRoutes
