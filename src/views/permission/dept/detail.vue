<template>
  <el-dialog v-model="dialogVisible" title="部门详情" width="50%">
    <el-form :model="deptInfo" label-width="100px">
      <el-form-item label="部门名称">
        <el-input v-model="deptInfo.deptName" disabled></el-input>
      </el-form-item>
      <el-form-item label="创建时间">
        <el-input v-model="deptInfo.createTime" disabled></el-input>
      </el-form-item>
      <el-form-item label="更新时间">
        <el-input v-model="deptInfo.updateTime" disabled></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { Dept } from '@/api/types/response'

const dialogVisible = ref(false)
const deptInfo = reactive<Dept>({
  deptId: '',
  deptName: '',
  createTime: '',
  updateTime: ''
})

const opendialog = (info: Dept) => {
  Object.assign(deptInfo, info)
  dialogVisible.value = true
}

defineExpose({
  opendialog
})
</script>

<style lang="scss" scoped>

</style>