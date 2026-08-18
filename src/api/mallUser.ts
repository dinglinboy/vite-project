import axios from '@/util/axios'

export interface MallUser {
    id: number
    username: string
    nickname: string
    phone: string
    avatar: string | null
    balance: number
    growth: number
    points: number
    memberLevel: number
    status: string
    lastLoginTime: string | null
    createTime: string
}

/** C 端用户分页列表 */
export function getMallUserListApi(params: {
    username?: string
    nickname?: string
    phone?: string
    status?: string
    pageNum: number
    pageSize: number
}) {
    return axios.get<any, { code: number; msg: string; result: { data: MallUser[]; total: number } }>('/mall-user/list', { params })
}

/** 启用/禁用 */
export function updateMallUserStatusApi(id: number, status: string) {
    return axios.put<any, { code: number; msg: string; result: null }>(`/mall-user/${id}/status`, { status })
}

/** 调整积分 */
export function updateMallUserPointsApi(id: number, points: number) {
    return axios.put<any, { code: number; msg: string; result: { points: number } }>(`/mall-user/${id}/points`, { points })
}

/** 调整余额 */
export function updateMallUserBalanceApi(id: number, balance: number) {
    return axios.put<any, { code: number; msg: string; result: { balance: number } }>(`/mall-user/${id}/balance`, { balance })
}