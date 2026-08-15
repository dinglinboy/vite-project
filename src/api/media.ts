import axios from '@/util/axios'
import { Result } from '@/interfaces/base.interface'

/**
 * 分页查询媒体素材
 * @param params 查询条件（fileName/ext + 分页）
 * @return 媒体分页数据
 */
export const getMediaListApi = (params: {
    fileName?: string
    ext?: string
    pageNum: number
    pageSize: number
}) => {
    return axios.get<any, Result>('/media/list', { params })
}

/**
 * 删除媒体素材
 * @param uploadId 文件id
 * @return 删除结果
 */
export const deleteMediaApi = (uploadId: string) => {
    return axios.delete<any, Result>(`/media/${uploadId}`)
}
