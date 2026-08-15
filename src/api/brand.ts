import axios from '@/util/axios'
import { BrandItem, BrandQuery } from '@/api/types/response'
import { Result } from '@/interfaces/base.interface'

/**
 * 分页查询品牌
 * @param params 查询条件（name/pageNum/pageSize）
 * @return 品牌分页数据
 */
export const getBrandListApi = (params: Partial<BrandQuery>) => {
    return axios.get<any, Result>('/brand/list', { params })
}

/**
 * 品牌下拉列表（不分页，商品表单用）
 * @return 品牌列表（id/name/logo）
 */
export const getBrandOptionsApi = () => {
    return axios.get<any, Result>('/brand/options')
}

/**
 * 新增品牌
 * @param data 品牌信息
 * @return 创建结果
 */
export const addBrandApi = (data: Partial<BrandItem>) => {
    return axios.post<any, Result>('/brand', data)
}

/**
 * 更新品牌
 * @param id 品牌id
 * @param data 品牌信息
 * @return 更新结果
 */
export const updateBrandApi = (
    id: number | string,
    data: Partial<BrandItem>
) => {
    return axios.put<any, Result>(`/brand/${id}`, data)
}

/**
 * 删除品牌（软删除）
 * @param id 品牌id
 * @return 删除结果
 */
export const deleteBrandApi = (id: number | string) => {
    return axios.delete<any, Result>(`/brand/${id}`)
}
