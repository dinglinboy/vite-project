import axios from '@/util/axios'
import { Result } from '@/interfaces/base.interface'

/**
 * 分页查询公告
 * @param params 查询条件（title + 分页）
 * @return 公告分页数据
 */
export const getAnnouncementListApi = (params: {
    title?: string
    pageNum: number
    pageSize: number
}) => {
    return axios.get<any, Result>('/announcement/list', { params })
}

/**
 * 新增公告
 * @param body 公告信息
 * @return 新增结果
 */
export const addAnnouncementApi = (body: {
    title: string
    content: string
    publishTime?: string
    status?: string
}) => {
    return axios.post<any, Result>('/announcement', body)
}

/**
 * 编辑公告
 * @param id 公告id
 * @param body 公告信息
 * @return 编辑结果
 */
export const updateAnnouncementApi = (
    id: number,
    body: {
        title?: string
        content?: string
        publishTime?: string
        status?: string
    }
) => {
    return axios.put<any, Result>(`/announcement/${id}`, body)
}

/**
 * 删除公告
 * @param id 公告id
 * @return 删除结果
 */
export const deleteAnnouncementApi = (id: number) => {
    return axios.delete<any, Result>(`/announcement/${id}`)
}