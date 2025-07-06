<template>
    <el-dialog v-model="visibleDialog" :title="dialogTitle" width="500px">
        <div class="user-modify">
            <el-form
                :model="form"
                ref="formRef"
                label-width="80px"
                class="form"
            >
                <el-form-item label="用户名" prop="username">
                    <el-input
                        v-model="form.username"
                        placeholder="请输入用户名"
                    ></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input
                        v-model="form.password"
                        type="password"
                        placeholder="请输入密码"
                    ></el-input>
                </el-form-item>
                <el-form-item label="角色" prop="role">
                    <el-select v-model="form.roleId" placeholder="请选择角色">
                        <el-option
                            v-for="item in roles"
                            :key="item.roleId"
                            :label="item.roleName"
                            :value="item.roleId"
                        ></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="submitForm"
                        >提交</el-button
                    >
                    <el-button @click="cancel">取消</el-button>
                </el-form-item>
            </el-form>
        </div>
    </el-dialog>
</template>
<script lang="ts" setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { addUserApi, updateUserApi } from '@/api/user'
import { getRoleListApi } from '@/api/role'
import { User } from '@/api/types/response'
const visibleDialog = ref(false)
const isEdit = ref(false)
const router = useRouter()
const formRef = ref()
interface UserForm extends User {
    roleId: string
}
type Role = {
    roleId: string
    roleName: string
}
const form = reactive<UserForm>({
    username: '',
    password: '',
    roleId: ''
})
const roles = ref<Role[]>([])
const dialogTitle = computed(() => (isEdit.value ? '编辑用户' : '新增用户'))
const submitForm = async () => {
    if (!form.username || !form.password || !form.roleId) {
        return ElMessage.error('请填写完整信息')
    }
    try {
        if (router.currentRoute.value.query.id) {
            // 编辑用户
            await updateUserApi({
                ...form,
                id: router.currentRoute.value.query.id
            })
            ElMessage.success('用户信息更新成功')
        } else {
            // 新增用户
            await addUserApi(form)
            ElMessage.success('用户添加成功')
        }
        router.back()
    } catch (error) {
        ElMessage.error('操作失败，请稍后再试')
    }
}
// 获取角色列表
const getRoles = async () => {
    // 调用获取角色列表的 API 接口，传入包含搜索条件和分页信息的对象
    const res: any = await getRoleListApi({ pageNum: 1, pageSize: 1000 })
    // 检查接口返回的状态码，如果不等于 0 表示请求失败
    if (res.code !== 0) {
        return ElMessage.error(res.message)
    }
    roles.value = res?.result?.data || []
}
const openDialog = (userInfo: UserForm | null) => {
    visibleDialog.value = true
    isEdit.value = !!userInfo
    if (userInfo) {
        form.username = userInfo.username
        form.password = '' // 密码不显示
        form.roleId = userInfo.roleId || ''
    } else {
        form.username = ''
        form.password = ''
        form.roleId = ''
    }
    getRoles()
}
const cancel = () => {
    visibleDialog.value = false
    formRef.value?.resetFields()
}
defineExpose({
    openDialog
})
</script>
