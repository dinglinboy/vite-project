import axios from '@/util/axios'
import { Dept, getDeptListResponse } from '@/api/types/response'

// 获取部门列表
export const getDeptListApi = async (params: { deptName: string; pageSize: number; pageNum: number }) => {
    return axios.get<getDeptListResponse>('/api/dept/list', { params })
}

// 删除部门信息
export const deleteDeptInfoApi = async (deptId: string) => {
    return axios.delete<{ code: number; message: string }>(`/api/dept/${deptId}`)
}