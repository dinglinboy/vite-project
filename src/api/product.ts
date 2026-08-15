import axios from '@/util/axios'
import { ProductItem, ProductQuery, SkuItem } from '@/api/types/response'
import { Result } from '@/interfaces/base.interface'

/**
 * 分页查询商品列表
 * @param params 查询条件（name/categoryId/product_status/pageNum/pageSize）
 * @return 商品分页数据
 */
export const getProductListApi = (params: Partial<ProductQuery>) => {
    return axios.get<any, Result>('/product/list', { params })
}

/**
 * 获取商品详情
 * @param id 商品id
 * @return 商品信息
 */
export const getProductInfoApi = (id: number | string) => {
    return axios.get<any, Result>(`/product/${id}`)
}

/**
 * 新增商品
 * @param data 商品信息
 * @return 创建结果
 */
export const addProductApi = (data: Partial<ProductItem>) => {
    return axios.post<any, Result>('/product', data)
}

/**
 * 更新商品
 * @param id 商品id
 * @param data 商品信息
 * @return 更新结果
 */
export const updateProductApi = (
    id: number | string,
    data: Partial<ProductItem>
) => {
    return axios.put<any, Result>(`/product/${id}`, data)
}

/**
 * 删除商品（软删除）
 * @param id 商品id
 * @return 删除结果
 */
export const deleteProductApi = (id: number | string) => {
    return axios.delete<any, Result>(`/product/${id}`)
}

/**
 * 修改商品状态（上下架）
 * @param id 商品id
 * @param productStatus draft/published/archived
 * @return 更新结果
 */
export const updateProductStatusApi = (
    id: number | string,
    productStatus: string
) => {
    return axios.put<any, Result>(`/product/${id}/status`, {
        product_status: productStatus
    })
}

/**
 * 单文件上传（商品图片）
 * @param file 文件
 * @return 上传结果（result 为文件访问路径）
 */
export const uploadFileApi = (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return axios.post<any, Result>('/common/upload/singleFile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
}

export type { SkuItem }
