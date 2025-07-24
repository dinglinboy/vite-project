import { Result } from '@/interfaces/base.interface';

export interface Role {
    roleId?: number
    roleName: string
    remakr?: string
    roleKey: string
    status?: number
    remark?: string
    createTime?: string
    updateTime?: string
}
interface RoleListResult {
    data: Role[]
    total: number
}
export interface getRoleListResponse extends Result {
    redult: RoleListResult
}

export interface User {
    username: string
    password: string
}
interface UserListResult {
    data: User[]
    total: number
}
export interface getUsersResponse extends Result {
    result: UserListResult
}

export interface Dept {
    deptId?: string
    deptName: string
    createTime?: string
    updateTime?: string
}
interface DeptListResult {
    data: Dept[]
    total: number
}
export interface getDeptListResponse extends Result {
    result: DeptListResult
}