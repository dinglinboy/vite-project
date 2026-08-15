import axios from '@/util/axios'
import { Result } from '@/interfaces/base.interface'

/**
 * 获取分类树
 * @return 树形分类列表（id/name/children）
 */
export const getCategoryListApi = () => {
    return axios.get<any, Result>('/category/list')
}

/**
 * 创建分类
 * @param data 分类信息（name/parentId/sort_order）
 * @return 创建结果
 */
export const addCategoryApi = (data: {
    name: string
    parentId?: number
    sort_order?: number
}) => {
    return axios.post<any, Result>('/category', data)
}

/**
 * 更新分类
 * @param id 分类id
 * @param data 分类信息
 * @return 更新结果
 */
export const updateCategoryApi = (
    id: number | string,
    data: { id: number; name: string; parentId?: number; sort_order?: number }
) => {
    return axios.put<any, Result>(`/category/${id}`, data)
}

/**
 * 删除分类（连带软删子分类）
 * @param id 分类id
 * @return 删除结果
 */
export const deleteCategoryApi = (id: number | string) => {
    return axios.delete<any, Result>(`/category/${id}`)
}
