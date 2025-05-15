import axios from '@/util/axios'
import {
    RoleListDto
} from '@/api/types/request'
import { getRoleListResponse, Role } from '@/api/types/response'
import { Result } from '@/interfaces/base.interface'

export const getRoleListApi = (params: RoleListDto) => {
    return axios.get<any, getRoleListResponse>('/role/list', {
        params
    })
}

export const addRoleInfoApi = (data: Role) => {
    return axios.post<any, Result>('/role/createRole', data)
}

export const updateRoleInfoApi = (data: Role) => {
    return axios.put<any, Result>('/role', data)
}

export const deleteRoleInfoApi = (roleId: string) => {
    return axios.delete<any, Result>(`/role/${roleId}`)
}