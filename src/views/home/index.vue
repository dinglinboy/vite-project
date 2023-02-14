<script setup lang="ts">
import { usePublicStore } from '@/store/index.ts'
import { onMounted } from 'vue'
const publicStore = usePublicStore()
let limit = 10,
  offset = 1
const next = () => {
  offset++
  publicStore.getCoffees(limit, offset)
}
onMounted(() => {
  publicStore.getCoffees(limit, offset)
})
</script>

<template>
  <ul>
    <li v-for="item in publicStore.coffees" :key="item._id">{{ item.name }}</li>
  </ul>
  <button @click="next">next</button>
</template>

<style></style>
