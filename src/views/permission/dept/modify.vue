<template>
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="50%">
    <el-form :model="deptForm" label-width="100px">
      <el-form-item label="部门名称">
        <el-input v-model="deptForm.deptName"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { getDeptListApi } from '@/api/dept'
import { Dept } from '@/api/types/response'

const dialogVisible = ref(false)
const dialogTitle = ref('')
const deptForm = reactive<Dept>({
  deptId: '',
  deptName: '',
  createTime: '',
  updateTime: ''
})

const emit = defineEmits(['update:success'])

const openDialog = (deptInfo: Dept | null) => {
  if (deptInfo) {
    dialogTitle.value = '编辑部门'
    Object.assign(deptForm, deptInfo)
  } else {
    dialogTitle.value = '新增部门'
    Object.assign(deptForm, {
      deptId: '',
      deptName: '',
      createTime: '',
      updateTime: ''
    })
  }
  dialogVisible.value = true
}

const submitForm = async () => {
  try {
    // 此处需根据实际 API 实现修改
    // 假设存在 saveDeptInfoApi 用于保存部门信息
    // await saveDeptInfoApi(deptForm)
    ElMessage.success('操作成功')
    dialogVisible.value = false
    emit('update:success')
  } catch (error) {
    ElMessage.error('操作失败')
    console.error(error)
  }
}

defineExpose({
  openDialog: openDialog
})
</script>

<style lang="scss" scoped>

</style>