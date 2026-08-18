import axios from '@/util/axios'
import { Result } from '@/interfaces/base.interface'

export interface SeckillActivity {
    id: number
    name: string
    productId: number
    skuId: number | null
    seckillPrice: string
    totalStock: number
    stock: number
    limitPerUser: number
    startTime: string
    endTime: string
    status: string
    createTime: string
    productName?: string
    productImage?: string | null
    productPrice?: number
}

export const getSeckillListApi = (params: Record<string, unknown>) => {
    return axios.get<any, Result>('/seckill/list', { params })
}

export const addSeckillApi = (data: Record<string, unknown>) => {
    return axios.post<any, Result>('/seckill', data)
}

export const updateSeckillApi = (id: number, data: Record<string, unknown>) => {
    return axios.put<any, Result>(`/seckill/${id}`, data)
}

export const deleteSeckillApi = (id: number) => {
    return axios.delete<any, Result>(`/seckill/${id}`)
}