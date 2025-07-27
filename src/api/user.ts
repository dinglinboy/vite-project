import axios from '@/util/axios'
import { getUsersResponse, getUsersResponseDto } from '@/api/types/response'
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

/**
 * 获取用户信息
 * @param userId 用户id
 * @return 用户信息
 */
export const getUserInfoApi = (userId: string) => {
    return axios.get<any, getUsersResponse>(`/user/${userId}`)
}

/**
 * 根据用户名获取用户信息
 * @param params 查询参数
 * @return 用户信息
 */
export const getUserInfoByUsername = (params: any) => {
    return axios.get<any, getUsersResponseDto>('/user/getUserInfo', { params })
}

/**
 * 删除用户
 * @param userId 用户id
 * @return 删除结果
 */
export const deleteUserApi = (userId: string) => {
    return axios.delete<any, getUsersResponse>(`/user/${userId}`)
}
/**
 * 更新用户信息
 * @param userId 用户id
 * @param userInfo 用户信息
 * @return 更新结果
 */
export const updateUserApi = (userInfo: any) => {
    return axios.put<any, getUsersResponse>('/user/update', userInfo)
}
/**
 * 添加用户
 * @param userInfo 用户信息
 * @return 添加结果
 */
export const addUserApi = (userInfo: any) => {
    return axios.post<any, getUsersResponse>('/user', userInfo)
}
