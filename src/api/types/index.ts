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

export interface Result {
    code?: number
    message?: string
    msg?: string
    result?: [] | string | object | null | boolean | string
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

export interface getUsersDto extends PagingDto {
    username?: string
}

interface DateParamsDTO {
    beginTime: string;
    endTime: string;
}
interface PagingDto {
    pageNum: number;
    pageSize: number;
    orderByColumn?: string
    isAsc?: 'ascending' | 'descending'
    param?: DateParamsDTO
}