import axios from '@/util/axios'
import { ReviewItem, ReviewQuery } from '@/api/types/response'
import { Result } from '@/interfaces/base.interface'

/**
 * 分页查询商品评论
 * @param params 查询条件（productName/rating/replied/pageNum/pageSize）
 * @return 评论分页数据
 */
export const getReviewListApi = (params: Partial<ReviewQuery>) => {
    return axios.get<any, Result>('/review/list', { params })
}

/**
 * 新增评论
 * @param data 评论信息
 * @return 创建结果
 */
export const addReviewApi = (data: Partial<ReviewItem>) => {
    return axios.post<any, Result>('/review', data)
}

/**
 * 回复评论
 * @param id 评论id
 * @param replyContent 回复内容
 * @return 回复结果
 */
export const replyReviewApi = (id: number | string, replyContent: string) => {
    return axios.put<any, Result>(`/review/${id}/reply`, { replyContent })
}

/**
 * 删除评论
 * @param id 评论id
 * @return 删除结果
 */
export const deleteReviewApi = (id: number | string) => {
    return axios.delete<any, Result>(`/review/${id}`)
}
