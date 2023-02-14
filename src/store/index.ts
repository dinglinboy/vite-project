import { defineStore } from 'pinia'
export const usePublicStore = defineStore('Public', {
  state: () => {
    return {
      counter: 0
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
    }
  }
})
