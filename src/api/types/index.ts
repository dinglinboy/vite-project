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
    result?: [] | string | object | null | boolean | string
}
