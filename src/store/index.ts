import { defineStore } from 'pinia'
import { getCoffees } from '@/api/index'
import type { CoffeesResponse, Pagination } from '@/api/types/index'
export const usePublicStore = defineStore('Public', {
  state: () => {
    return {
      counter: 0,
      limit: 10,
      coffees: new Array<CoffeesResponse>()
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
    async getCoffees(pagination: Pagination) {
      const coffees = await getCoffees(pagination)
      this.coffees = coffees
    }
  }
})
