<template>
    <el-dialog v-model="dialogFlag" title="角色详情">
        <el-form>
            <el-form-item label="角色名称">
                <span>{{ roleInfo.roleName }}</span>
            </el-form-item>
            <el-form-item label="角色标识">
                <span>{{ roleInfo.roleKey }}</span>
            </el-form-item>
            <el-form-item label="角色描述">
                <span>{{ roleInfo.remark }}</span>
            </el-form-item>
            <el-form-item label="创建时间">
                <span>{{ formatTime(roleInfo.createTime) }}</span>
            </el-form-item>
            <el-form-item label="更新时间">
                <span>{{ formatTime(roleInfo.updateTime) }}</span>
            </el-form-item>
        </el-form>
    </el-dialog>
</template>
<script lang="ts" setup>
import { Role } from '@/api/types/response'
import dayjs from 'dayjs'
import { ref } from 'vue'
const dialogFlag = ref(false)
const roleInfo = ref<Role>({
    roleName: '',
    roleKey: '',
    remark: '',
    createTime: '',
    updateTime: ''
})
const opendialog = (data: Role) => {
    roleInfo.value = data
    dialogFlag.value = true
}
const formatTime = (date: string | undefined) => dayjs(date).format('YYYY-MM-DD hh:mm:ss');
defineExpose({
    opendialog
})
</script>
