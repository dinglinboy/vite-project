import { Result } from '@/interfaces/base.interface'

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
export interface UserDto {
    id?: number | null
    username?: string
    nickname?: string
    email?: string
    phoneNum?: string
    sex?: string
    remark?: string
    avatar?: string
}
interface UserListResult {
    data: UserDto[]
    total: number
}
export interface getUsersResponse extends Result {
    result: UserListResult
}
export interface getUsersResponseDto extends Result {
    result: UserDto
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
