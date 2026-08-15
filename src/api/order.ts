import axios from '@/util/axios'
import { OrderItem } from '@/api/types/response'
import { Result } from '@/interfaces/base.interface'

/**
 * 分页查询订单
 * @param params 查询条件（orderNo/username/orderStatus + 分页）
 * @return 订单分页数据
 */
export const getOrderListApi = (params: {
    orderNo?: string
    username?: string
    orderStatus?: string
    pageNum: number
    pageSize: number
}) => {
    return axios.get<any, Result>('/order/list', { params })
}

/**
 * 订单详情（含订单项）
 * @param orderNo 订单号
 * @return 订单详情
 */
export const getOrderDetailApi = (orderNo: string) => {
    return axios.get<any, Result>(`/order/${orderNo}`)
}

/**
 * 新增订单
 * @param data 订单信息（userId/收货人/明细）
 * @return 创建结果
 */
export const addOrderApi = (data: any) => {
    return axios.post<any, Result>('/order', data)
}

/**
 * 发货（已付款 → 已发货）
 * @param orderNo 订单号
 * @param shipNo 物流单号
 * @return 操作结果
 */
export const shipOrderApi = (orderNo: string, shipNo: string) => {
    return axios.put<any, Result>(`/order/${orderNo}/ship`, { shipNo })
}

/**
 * 状态流转（完成/取消/退款）
 * @param orderNo 订单号
 * @param orderStatus 目标状态
 * @return 操作结果
 */
export const changeOrderStatusApi = (orderNo: string, orderStatus: string) => {
    return axios.put<any, Result>(`/order/${orderNo}/status`, { orderStatus })
}

/**
 * 删除订单（软删除）
 * @param orderNo 订单号
 * @return 删除结果
 */
export const deleteOrderApi = (orderNo: string) => {
    return axios.delete<any, Result>(`/order/${orderNo}`)
}

export type { OrderItem }
