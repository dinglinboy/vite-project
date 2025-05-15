import { PagingDto, Result } from '@/interfaces/base.interface';
export interface CoffeesResponse {
    name: string
    _id: string
    brand: string
    flavors: string[]
}

export interface Pagination {
    pageSize: number
    pageNum: number
}

export interface User {
    username: string
    password: string
}

export interface ClassifySearch {
    name?: string
    pageSize?: number
    pageNum?: number
}

export type UserInfoResult = Result & { result: { jwtToken: string } }

export interface ClassifyResponse {
    code: number
    message: string
    total: number
    result: []
}

export interface UserListDto extends Result  {
    result: {
        data: User[],
        total: number
    }
}