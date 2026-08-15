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
 * 添加用户
 * @param userInfo 用户信息（含 roleIds 角色绑定）
 * @return 添加结果
 */
export const addUserApi = (userInfo: any) => {
    return axios.post<any, getUsersResponse>('/user', userInfo)
}
/**
 * 更新用户信息
 * @param userInfo 用户信息（id 必传）
 * @return 更新结果
 */
export const updateUserApi = (userInfo: any) => {
    return axios.put<any, getUsersResponse>('/user/update', userInfo)
}
/**
 * 更新用户绑定的角色（全量替换，空数组=清除全部）
 * @param data userId + roleIds
 * @return 更新结果
 */
export const updateAuthRoleApi = (data: {
    userId: number
    roleIds: number[]
}) => {
    return axios.put<any, getUsersResponse>('/user/authRole', data)
}
