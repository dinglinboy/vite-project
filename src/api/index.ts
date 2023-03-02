import axios from '@/util/axios'
import {
    ClassifySearch,
    CoffeesResponse,
    Pagination,
    Result,
    User
} from '@/api/types/index'
export const getCoffees = (param: Pagination) => {
    const { limit, offset } = param
    return axios.get<CoffeesResponse[]>(
        `/coffees?limit=${limit}&offset=${offset}`
    )
}
export const login = (param: User) => {
    return axios.post<Result>(`/auth/admin/signIn`, param)
}

/**
 * 获取分类列表
 * @param param
 * @returns
 */
export const getClassifyList = (param: ClassifySearch) => {
    return axios.get<Result>('/classify', { params: param })
}

/**
 * 根据id删除分类
 * @param id
 * @returns
 */
export const removeClassifyById = (id: string) => {
    return axios.delete<Result>(`/classify/${id}`)
}

/**
 * 添加分类
 * @param param
 * @param param.name // 分类名称
 * @returns
 */
export const addClassifyApi = (param: { name: string; id: string }) => {
    return axios.post<Result>('/classify', { name: param.name })
}

/**
 * 修改分类
 * @param param
 * @param param.name // 分类名称
 * @returns
 */
export const updateClassifyApi = (param: { name: string; id: string }) => {
    return axios.patch<Result>(`/classify/${param.id}`, { name: param.name })
}
