import axios from '@/util/axios'
import { Result } from '@/interfaces/base.interface'

export interface CouponTemplate {
    id: number
    name: string
    type: 'full_reduction' | 'discount' | 'cash'
    thresholdAmount: string
    discountAmount: string
    discountRate: string | null
    totalCount: number
    receivedCount: number
    perUserLimit: number
    validDays: number
    status: string
    createTime: string
}

export interface CouponReceived {
    id: number
    userId: number
    status: string
    expireTime: string
    receiveTime: string
    useTime: string | null
    orderNo: string
}

export const getCouponListApi = (params: Record<string, unknown>) => {
    return axios.get<any, Result>('/coupon-template/list', { params })
}

export const addCouponApi = (data: Record<string, unknown>) => {
    return axios.post<any, Result>('/coupon-template', data)
}

export const updateCouponApi = (id: number, data: Record<string, unknown>) => {
    return axios.put<any, Result>(`/coupon-template/${id}`, data)
}

export const deleteCouponApi = (id: number) => {
    return axios.delete<any, Result>(`/coupon-template/${id}`)
}

export const getCouponDetailApi = (id: number) => {
    return axios.get<any, Result>(`/coupon-template/${id}`)
}
