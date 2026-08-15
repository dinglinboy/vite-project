<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <el-dialog
        v-model="visibleDialog"
        :title="isEdit ? '编辑用户' : '新增用户'"
        width="560px"
        destroy-on-close
    >
        <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
            <el-form-item label="用户名" prop="username">
                <el-input
                    v-model="form.username"
                    placeholder="请输入用户名"
                    maxlength="30"
                    :disabled="isEdit"
                ></el-input>
            </el-form-item>
            <el-form-item v-if="!isEdit" label="密码" prop="password">
                <el-input
                    v-model="form.password"
                    type="password"
                    show-password
                    placeholder="请输入密码（5-20位）"
                ></el-input>
            </el-form-item>
            <el-form-item label="昵称" prop="nickname">
                <el-input
                    v-model="form.nickname"
                    placeholder="不填默认同用户名"
                    maxlength="30"
                ></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
                <el-input
                    v-model="form.email"
                    placeholder="请输入邮箱"
                    maxlength="30"
                ></el-input>
            </el-form-item>
            <el-form-item label="角色" prop="roleIds">
                <el-select
                    v-model="form.roleIds"
                    multiple
                    placeholder="请选择角色（可多选）"
                    style="width: 100%"
                >
                    <el-option
                        v-for="item in roles"
                        :key="item.roleId"
                        :label="item.roleName"
                        :value="item.roleId as number"
                        :disabled="item.status === '1'"
                    ></el-option>
                </el-select>
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="visibleDialog = false">取 消</el-button>
            <el-button type="primary" :loading="loading" @click="submitForm"
                >确 定</el-button
            >
        </template>
    </el-dialog>
</template>
<script lang="ts" setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
    addUserApi,
    updateUserApi,
    getUserInfoApi,
    updateAuthRoleApi
} from '@/api/user'
import { getRoleListApi } from '@/api/role'
import { Role, UserDto } from '@/api/types/response'

interface UserForm {
    id?: number
    username: string
    password: string
    nickname: string
    email: string
    roleIds: number[]
}

const emit = defineEmits(['update:success'])
const visibleDialog = ref(false)
const loading = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const roles = ref<Role[]>([])

const form = reactive<UserForm>({
    id: undefined,
    username: '',
    password: '',
    nickname: '',
    email: '',
    roleIds: []
})

const rules = reactive<FormRules>({
    username: [{ required: true, message: '请输入用户名', trigger: 'change' }],
    password: [
        { required: true, message: '请输入密码', trigger: 'change' },
        { min: 5, max: 20, message: '密码长度 5-20 位', trigger: 'change' }
    ],
    email: [{ type: 'email', message: '邮箱格式不正确', trigger: 'change' }]
})

const dialogTitle = computed(() => (isEdit.value ? '编辑用户' : '新增用户'))

const getRoles = async () => {
    const res = await getRoleListApi({ pageNum: 1, pageSize: 1000 })
    if (res.code !== 0) {
        return ElMessage.error(res.message || res.msg || '获取角色列表失败')
    }
    roles.value = res?.result?.data || []
}

/**
 * 打开对话框
 * @param userInfo 编辑时传行数据（需含 id）；新增传 null
 */
const openDialog = async (userInfo: (UserDto & { id?: number }) | null) => {
    Object.assign(form, {
        id: undefined,
        username: '',
        password: '',
        nickname: '',
        email: '',
        roleIds: []
    })
    isEdit.value = !!userInfo?.id
    visibleDialog.value = true
    getRoles()
    // 编辑：拉详情回显（含已绑角色 roleIds）
    if (userInfo?.id) {
        const res = await getUserInfoApi(String(userInfo.id))
        if (res.code === 0 && res.result) {
            const { username, nickname, email, roleIds } = res.result as any
            Object.assign(form, {
                id: userInfo.id,
                username,
                nickname: nickname || '',
                email: email || '',
                roleIds: roleIds || []
            })
        }
    }
}

const submitForm = async () => {
    const valid = await formRef.value?.validate().catch(() => false)
    if (!valid) return
    loading.value = true
    try {
        if (isEdit.value) {
            // 编辑：更新基础信息 + 全量替换角色
            await updateUserApi({
                id: form.id,
                username: form.username,
                nickname: form.nickname,
                email: form.email
            })
            await updateAuthRoleApi({
                userId: form.id as number,
                roleIds: form.roleIds
            })
            ElMessage.success('更新成功')
        } else {
            // 新增：一次提交（后端同时建角色关联）
            const res = await addUserApi({
                username: form.username,
                password: form.password,
                nickname: form.nickname || form.username,
                email: form.email,
                roleIds: form.roleIds
            })
            if (res.code !== 0) {
                return ElMessage.error(res.msg || res.message || '新增失败')
            }
            ElMessage.success('新增成功')
        }
        emit('update:success')
        visibleDialog.value = false
    } catch (error) {
        console.error(error)
        ElMessage.error('操作失败，请稍后再试')
    } finally {
        loading.value = false
    }
}

defineExpose({
    openDialog
})
</script>
