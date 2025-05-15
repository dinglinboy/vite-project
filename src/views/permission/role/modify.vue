<template>
    <el-dialog
        v-model="dialogFlag"
        title="修改角色">
        <el-form>
            <el-form-item label="角色名称">
                <el-input v-model="form.roleName"></el-input>
            </el-form-item>
            <el-form-item label="角色标识">
                <el-input v-model="form.roleKey"></el-input>
            </el-form-item>
            <el-form-item label="角色描述">
                <el-input v-model="form.remark"></el-input>
            </el-form-item>
        </el-form>
        <template #footer class="dialog-footer">
            <el-button @click="dialogFlag = false">取 消</el-button>
            <el-button type="primary" @click="submitRoleInfo">确 定</el-button>
        </template>
    </el-dialog>
</template>
<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { Role } from '@/api/types/response'
import { addRoleInfoApi, updateRoleInfoApi } from '@/api/role'
import { ElMessage } from 'element-plus'
const emit = defineEmits(['update:success'])
const dialogFlag = ref(false)
const form = reactive({
    roleId: '',
    roleName: '',
    roleKey: '',
    remark: ''
})
const opendialog = (roleInfo?: Role | null) => {
    if (roleInfo) {
        form.roleName = roleInfo.roleName
        form.roleKey = roleInfo.roleKey
        form.roleId = roleInfo.roleId || ''
        form.remark = roleInfo.remark || ''
    } else {
        form.roleName = ''
        form.roleKey = ''
        form.roleId = ''
        form.remark = ''
    }
    dialogFlag.value = true
}
const submitRoleInfo = async () => {
    const fn = form.roleId ? updateRoleInfoApi : addRoleInfoApi
    fn({...form}).then((res) => {
        if (res.code !== 0) {
            return ElMessage.error(res.message)
        }
        ElMessage.success('操作成功')
        emit('update:success');
        dialogFlag.value = false
    }).catch((err) => {
        console.error(err)
    })
}
defineExpose({
    opendialog
})
</script>