import axios from '@/util/axios'
import { Result } from '@/interfaces/base.interface'

/**
 * 分页查询推荐位
 * @param params 查询条件（position + 分页）
 * @return 推荐位分页数据
 */
export const getRecommendationListApi = (params: {
    position?: string
    pageNum: number
    pageSize: number
}) => {
    return axios.get<any, Result>('/recommendation/list', { params })
}

/**
 * 新增推荐位
 * @param body 推荐位信息
 * @return 新增结果
 */
export const addRecommendationApi = (body: {
    position: string
    productId: number
    sortOrder?: number
}) => {
    return axios.post<any, Result>('/recommendation', body)
}

/**
 * 编辑推荐位
 * @param id 推荐位id
 * @param body 推荐位信息
 * @return 编辑结果
 */
export const updateRecommendationApi = (
    id: number,
    body: {
        productId?: number
        sortOrder?: number
        status?: string
    }
) => {
    return axios.put<any, Result>(`/recommendation/${id}`, body)
}

/**
 * 删除推荐位
 * @param id 推荐位id
 * @return 删除结果
 */
export const deleteRecommendationApi = (id: number) => {
    return axios.delete<any, Result>(`/recommendation/${id}`)
}