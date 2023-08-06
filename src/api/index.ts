import axios from '@/util/axios'
import {
    ClassifySearch,
    CoffeesResponse,
    ClassifyResponse,
    Pagination,
    Result,
    UserInfoResult,
    User
} from '@/api/types/index'
export const getCoffees = (param: Pagination) => {
    const { pageNum, pageSize } = param
    return axios.get<any, CoffeesResponse[]>(
        `/coffees?limit=${pageSize}&offset=${pageNum}`
    )
}

/**
 * 用户登录
 * @param param
 * @returns
 */
export const login = (param: User) => {
    return axios.post<any, UserInfoResult>(`/auth/admin/signIn`, param)
}

/**
 * 用户注册账号
 * @param param
 * @returns
 */
export const register = (param: User) => {
    return axios.post<any, Result>(`/auth/admin/signUp`, param)
}

/**
 * 获取分类列表
 * @param param
 * @returns
 */
export const getClassifyList = (params: ClassifySearch) => {
    return axios.get<any, ClassifyResponse>('/classify', { params })
}

/**
 * 根据id删除分类
 * @param id
 * @returns
 */
export const removeClassifyById = (id: string) => {
    return axios.delete<any, Result>(`/classify/${id}`)
}

/**
 * 添加分类
 * @param param
 * @param param.name // 分类名称
 * @returns
 */
export const addClassifyApi = (param: { name: string; id: string }) => {
    return axios.post<any, Result>('/classify', { name: param.name })
}

/**
 * 修改分类
 * @param param
 * @param param.name // 分类名称
 * @returns
 */
export const updateClassifyApi = (param: { name: string; id: string }) => {
    return axios.patch<any, Result>(`/classify/${param.id}`, {
        name: param.name
    })
}
