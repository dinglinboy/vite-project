import axios from '@/util/axios'
import { getUsersResponse } from '@/api/types/response'
import { UserListDto } from '@/api/types/request'
/**
 * 获取用户列表
 * @param
 */
export const getUserListApi = (params: UserListDto) => {
    return axios.get<any, getUsersResponse>('/user/list', {
        params
    })
}
