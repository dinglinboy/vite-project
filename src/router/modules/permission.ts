import { RouteRecordRaw, RouterView } from 'vue-router'

const permissionRoutes: RouteRecordRaw = {
  path: 'permission',
  name: 'permission',
  meta: {
    title: '权限'
  },
  component: RouterView,
  children: [
    {
      path: 'role',
      name: 'permission-role',
      meta: {
        title: '角色'
      },
      component: () => import('@/views/permission/role/index.vue')
    },
    {
      path: 'admin',
      name: 'permission-admin',
      meta: {
        title: '管理员'
      },
      component: () => import('@/views/permission/admin/index.vue')
    },
    {
      path: 'rule',
      name: 'permission-rule',
      meta: {
        title: '权限规则'
      },
      component: () => import('@/views/permission/rule/index.vue')
    }
  ]
}

export default permissionRoutes
