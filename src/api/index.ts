import axios from '@/util/axios'
interface Response {
  name: string
  _id: string
  brand: string
  flavors: string[]
}
export const getCoffees = (limit: number, offset: number) => {
  return axios.get<Response[]>(`/coffees?limit=${limit}&offset=${offset}`)
}
