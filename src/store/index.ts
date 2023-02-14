import { defineStore } from 'pinia'
import { getCoffees } from '../api/index'
import { getCoffees } from '@/api/index'
interface Coffee {
  name: string
  _id: string
}
export const usePublicStore = defineStore('Public', {
  state: () => {
    return {
      counter: 0,
      limit: 10,
      coffees: new Array<Coffee>()
    }
  },
  getters: {
    getUserMsg: (state) => {
      return state.counter
    }
  },
  actions: {
    changeName() {
      this.counter++
    },
    async getCoffees(limit: number, offset: number) {
      const coffees = await getCoffees(limit, offset)
      this.coffees = coffees
    }
  }
})
