<script setup lang="ts">
import { usePublicStore } from '@/store/index.ts'
const PublicStore = usePublicStore()
</script>

<template>
  <div class="about" @click="PublicStore.changeName">
    {{ PublicStore.counter }}
  </div>
</template>

<style lang="scss"></style>
