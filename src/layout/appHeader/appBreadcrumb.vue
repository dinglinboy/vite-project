<template>
  <div class="app-breadcrumb cursor">
    <el-breadcrumb size="large" :separator-icon="ArrowRight">
      <el-breadcrumb-item
        v-for="item in routes"
        :key="item.path"
        :to="{ path: item.path }"
        >{{ item.meta.title }}</el-breadcrumb-item
      >
    </el-breadcrumb>
  </div>
</template>

<script lang="ts" setup>
import { ArrowRight } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { computed } from 'vue'

const router = useRouter()
const routes = computed(() => {
  return router.currentRoute.value.matched.filter((v) => v.meta.title)
})
</script>
<style lang="scss">
.app-breadcrumb {
  display: flex;
  align-items: center;
  height: 100%;
  cursor: pointer;
}
</style>
