import axios from '@/util/axios'
import { CoffeesResponse, Pagination, User } from '@/api/types/index'
export const getCoffees = (param: Pagination) => {
    const { limit, offset } = param
    return axios.get<CoffeesResponse[]>(
        `/coffees?limit=${limit}&offset=${offset}`
    )
}
export const login = (param: User) => {
    return axios.post(`/auth/admin/signIn`, param)
}
