import axios from '@/util/axios'
import { getUsersResponse, getUsersDto } from '@/api/types/index'
/**
 * 获取用户列表
 * @param
 */
export const getUsersApi = (params: getUsersDto) => {
    return axios.get<any, getUsersResponse>('/auth/admin/getUsers', {
        params
    })
}
