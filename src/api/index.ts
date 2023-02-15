import axios from '@/util/axios'
import { CoffeesResponse } from '@/api/types/index'
export const getCoffees = (param) => {
  const { limit, offset } = param
  return axios.get<CoffeesResponse[]>(
    `/coffees?limit=${limit}&offset=${offset}`
  )
}
