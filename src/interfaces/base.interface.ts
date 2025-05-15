export type Status = 0 | 1;
export interface DateParamsDTO {
    beginTime: string;
    endTime: string;
}
export interface PagingDto {
    pageNum: number;
    pageSize: number;
    orderByColumn?: string
    isAsc?: 'ascending' | 'descending'
    param?: DateParamsDTO
}

export interface Result {
    code?: number
    message?: string
    msg?: string
    result?: any
}