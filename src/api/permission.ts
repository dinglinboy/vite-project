import axios from '@/util/axios'
import { Result } from '@/interfaces/base.interface'

/** 统一响应（带泛型） */
export interface ResultData<T> extends Result {
    result?: T
}

/** 后端路由菜单节点 */
export interface MenuItem {
    menuId: number
    menuName: string
    path: string
    component: string
    icon: string
    isCache: string
    children?: MenuItem[]
}

/** getInfo 返回结构 */
export interface GetInfoResult {
    user: Record<string, any> | null
    roles: string[]
    permissions: string[]
}

/**
 * 获取当前登录用户信息（含角色、权限标识）
 */
export const getInfoApi = () => {
    return axios.get<any, ResultData<GetInfoResult>>('/getInfo')
}

/**
 * 获取当前登录用户的前端路由菜单
 */
export const getRoutersApi = () => {
    return axios.get<any, ResultData<MenuItem[]>>('/getRouters')
}

/**
 * 退出登录（服务端删除 redis token）
 */
export const logoutApi = (token: string) => {
    return axios.post<any, Result>('/logout', { token })
}
