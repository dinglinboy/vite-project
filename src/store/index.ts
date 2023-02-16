import { defineStore } from 'pinia'
export const usePublicStore = defineStore('Public', {
  state: () => {
    return {
      isCollapse: false
    }
  },
  getters: {},
  actions: {
    setMenuCollapse() {
      this.isCollapse = !this.isCollapse
    }
  }
})
