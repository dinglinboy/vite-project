import axios from '@/util/axios'
import { Result } from '@/interfaces/base.interface'

/**
 * 分页查询轮播图
 * @param params 查询条件（title + 分页）
 * @return 轮播图分页数据
 */
export const getBannerListApi = (params: {
    title?: string
    pageNum: number
    pageSize: number
}) => {
    return axios.get<any, Result>('/banner/list', { params })
}

/**
 * 新增轮播图
 * @param body 轮播图信息
 * @return 新增结果
 */
export const addBannerApi = (body: {
    title: string
    image: string
    linkType: string
    linkId?: number
    sortOrder?: number
    status?: string
}) => {
    return axios.post<any, Result>('/banner', body)
}

/**
 * 编辑轮播图
 * @param id 轮播图id
 * @param body 轮播图信息
 * @return 编辑结果
 */
export const updateBannerApi = (
    id: number,
    body: {
        title?: string
        image?: string
        linkType?: string
        linkId?: number
        sortOrder?: number
        status?: string
    }
) => {
    return axios.put<any, Result>(`/banner/${id}`, body)
}

/**
 * 删除轮播图
 * @param id 轮播图id
 * @return 删除结果
 */
export const deleteBannerApi = (id: number) => {
    return axios.delete<any, Result>(`/banner/${id}`)
}