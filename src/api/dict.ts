import axios from '@/util/axios'
import { DictTypeItem, DictDataItem } from '@/api/types/response'
import { Result } from '@/interfaces/base.interface'

/**
 * 分页查询字典类型
 * @param params 查询条件（dictName/dictType/pageNum/pageSize）
 * @return 字典类型分页数据
 */
export const getDictTypeListApi = (params: {
    dictName?: string
    dictType?: string
    pageNum: number
    pageSize: number
}) => {
    return axios.get<any, Result>('/dict/type/list', { params })
}

/**
 * 新增字典类型
 * @param data dictName + dictType
 * @return 创建结果
 */
export const addDictTypeApi = (data: {
    dictName: string
    dictType: string
}) => {
    return axios.post<any, Result>('/dict/type', data)
}

/**
 * 更新字典类型
 * @param dictId 类型id
 * @param data 类型信息
 * @return 更新结果
 */
export const updateDictTypeApi = (dictId: number, data: any) => {
    return axios.put<any, Result>(`/dict/type/${dictId}`, data)
}

/**
 * 删除字典类型（同时软删其下所有数据）
 * @param dictId 类型id
 * @return 删除结果
 */
export const deleteDictTypeApi = (dictId: number) => {
    return axios.delete<any, Result>(`/dict/type/${dictId}`)
}

/**
 * 分页查询字典数据
 * @param params dictType + dictLabel/dictValue + 分页
 * @return 字典数据分页数据
 */
export const getDictDataListApi = (params: {
    dictType: string
    dictLabel?: string
    dictValue?: string
    pageNum: number
    pageSize: number
}) => {
    return axios.get<any, Result>('/dict/data/list', { params })
}

/**
 * 新增字典数据
 * @param data 字典数据
 * @return 创建结果
 */
export const addDictDataApi = (data: any) => {
    return axios.post<any, Result>('/dict/data', data)
}

/**
 * 更新字典数据
 * @param dictCode 数据id
 * @param data 数据信息
 * @return 更新结果
 */
export const updateDictDataApi = (dictCode: number, data: any) => {
    return axios.put<any, Result>(`/dict/data/${dictCode}`, data)
}

/**
 * 删除字典数据
 * @param dictCode 数据id
 * @return 删除结果
 */
export const deleteDictDataApi = (dictCode: number) => {
    return axios.delete<any, Result>(`/dict/data/${dictCode}`)
}

/**
 * 按类型查启用字典数据（业务表单下拉用）
 * @param dictType 字典类型标识
 * @return [{dict_label, dict_value, list_class, is_default}]
 */
export const getDictDataByTypeApi = (dictType: string) => {
    return axios.get<any, Result>(`/dict/data/type/${dictType}`)
}
