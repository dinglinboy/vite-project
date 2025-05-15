import { PagingDto, Status } from '@/interfaces/base.interface'
export interface UserListDto extends PagingDto {
    username?: string
    nickname?: string
}
export interface RoleListDto extends PagingDto {
    roleName?: string
    roleKey?: string
    status?: Status
}