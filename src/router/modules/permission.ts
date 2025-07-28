import { RouteRecordRaw, RouterView } from 'vue-router'

const permissionRoutes: RouteRecordRaw = {
    path: 'permission',
    name: 'permission',
    meta: {
        title: true,
        name: '权限'
    },
    component: RouterView,
    children: [
        {
            path: 'role',
            name: 'permission-role',
            meta: {
                title: true,
                name: '角色'
            },
            component: () => import('@/views/permission/role/index.vue')
        },
        {
            path: 'admin',
            name: 'permission-admin',
            meta: {
                title: true,
                name: '管理员'
            },
            component: () => import('@/views/permission/admin/index.vue')
        },
        {
            path: 'rule',
            name: 'permission-rule',
            meta: {
                title: true,
                name: '权限规则'
            },
            component: () => import('@/views/permission/rule/index.vue')
        },
        {
            path: 'user',
            name: 'permission-user',
            meta: {
                title: true,
                name: '用户管理'
            },
            component: () => import('@/views/permission/user/index.vue')
        },
        {
            path: 'dept',
            name: 'permission-dept',
            meta: {
                title: true,
                name: '部门管理'
            },
            component: () => import('@/views/permission/dept/index.vue')
        },
        {
            path: 'resource',
            name: 'permission-resource',
            meta: {
                title: true,
                name: '资源管理'
            },
            component: () => import('@/views/permission/resource/index.vue')
        }
    ]
}

export default permissionRoutes
