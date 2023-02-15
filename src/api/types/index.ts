export interface CoffeesResponse {
  name: string
  _id: string
  brand: string
  flavors: string[]
}

export interface Pagination {
  limit: number
  offset: number
}
