<template>
    <el-card class="box-card">
        <template #header>
            <div class="card-header">
                <el-form inline>
                    <el-form-item label="用户名">
                        <el-input
                            v-model="searchOpt.username"
                            placeholder="请输入用户名"
                        ></el-input>
                    </el-form-item>
                    <el-form-item label="用户昵称">
                        <el-input
                            v-model="searchOpt.nickname"
                            placeholder="请输入用户昵称"
                        ></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button
                            type="primary"
                            class="button"
                            @click="getUserList()"
                            >查询</el-button
                        >
                        <el-button @click="resetHandler">重置</el-button>
                        <el-button
                            v-permission="['permission:user:add']"
                            type="primary"
                            @click="addHandler(null)"
                            >新增用户</el-button
                        >
                    </el-form-item>
                </el-form>
            </div>
        </template>
        <el-table :data="userList">
            <el-table-column prop="username" label="用户名" />
            <el-table-column prop="nickname" label="用户昵称" />
            <el-table-column prop="createTime" label="创建时间">
                <template #default="{ row }">{{
                    dayjs(row.createTime).format('YYYY-MM-DD hh:mm:ss')
                }}</template>
            </el-table-column>
            <el-table-column prop="updateTime" label="更新时间">
                <template #default="{ row }">{{
                    dayjs(row.createTime).format('YYYY-MM-DD hh:mm:ss')
                }}</template>
            </el-table-column>
            <el-table-column label="操作" width="260">
                <template #default="{ row }">
                    <el-button
                        v-permission="['permission:user:edit']"
                        type="primary"
                        link
                        @click="addHandler(row)"
                        >编辑</el-button
                    >
                    <el-button
                        v-permission="['permission:user:edit']"
                        type="primary"
                        link
                        @click="openAssignRole(row)"
                        >分配角色</el-button
                    >
                    <el-button type="primary" link>详情</el-button>
                    <el-button
                        v-permission="['permission:user:remove']"
                        type="danger"
                        link
                        @click="delUser(row)"
                        >删除</el-button
                    >
                </template>
            </el-table-column>
        </el-table>
        <!-- 分页 -->
        <div class="pagination-container">
            <el-pagination
                v-model:current-page="searchOpt.pageNum"
                v-model:page-size="searchOpt.pageSize"
                :page-sizes="[10, 20, 50, 100]"
                :total="total"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="getUserList"
                @current-change="getUserList"
            />
        </div>
        <Modify ref="modifyRef" @update:success="getUserList" />
        <!-- 分配角色对话框 -->
        <el-dialog
            v-model="assignRoleVisible"
            title="分配角色"
            width="460px"
            destroy-on-close
        >
            <el-form label-width="80px">
                <el-form-item label="用户">
                    {{ currentRow?.username }}（{{ currentRow?.nickname }}）
                </el-form-item>
                <el-form-item label="角色">
                    <el-select
                        v-model="assignRoleIds"
                        multiple
                        placeholder="请选择角色"
                        style="width: 100%"
                    >
                        <el-option
                            v-for="item in roleOptions"
                            :key="item.roleId"
                            :label="item.roleName"
                            :value="item.roleId as number"
                        ></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="assignRoleVisible = false">取 消</el-button>
                <el-button
                    type="primary"
                    :loading="assignLoading"
                    @click="submitAssignRole"
                    >确 定</el-button
                >
            </template>
        </el-dialog>
    </el-card>
</template>

<script lang="ts" setup>
import {
    getUserListApi,
    getUserInfoApi,
    deleteUserApi,
    updateAuthRoleApi
} from '@/api/user'
import { getRoleListApi } from '@/api/role'
import { onMounted, ref, reactive } from 'vue'
import { getUsersResponse, UserDto, Role } from '@/api/types/response'
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'
import Modify from './modify.vue'
// 查询条件对象
const searchOpt = reactive({
    nickname: '', // 搜索用户昵称
    username: '', // 搜索用户名
    pageSize: 10, // 每页限制数量
    pageNum: 1 // 当前页面
})
// 用户总数
const total = ref(0)

// 用户列表
const userList = ref<UserDto[]>([])

const modifyRef = ref<{
    openDialog: (userInfo: UserDto | null) => void
} | null>(null)

// 获取用户列表
onMounted(() => {
    getUserList()
})

// 根据查询条件获取用户列表
const getUserList = async (pageNum = 1) => {
    searchOpt.pageNum = pageNum
    searchOpt.username = searchOpt.username.trim()
    searchOpt.nickname = searchOpt.nickname.trim()
    try {
        const res: getUsersResponse = await getUserListApi({ ...searchOpt })
        if (res.code !== 0) {
            return ElMessage.error(res.message || res.msg || '查询失败')
        }
        userList.value = res?.result?.data || []
        total.value = res?.result?.total
    } catch (error) {
        console.error(error)
    }
}

const resetHandler = () => {
    searchOpt.username = ''
    searchOpt.nickname = ''
    getUserList()
}

// 新增/编辑用户
const addHandler = (data: UserDto | null) => {
    modifyRef?.value?.openDialog(data)
}

// 删除用户
const delUser = async (row: UserDto) => {
    try {
        await ElMessageBox.confirm(
            `确定删除用户「${row.username}」吗？`,
            '提示',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }
        )
    } catch (error) {
        return
    }
    const res = await deleteUserApi(String(row.id))
    if (res.code !== 0) {
        return ElMessage.error(res.msg || res.message || '删除失败')
    }
    ElMessage.success('删除成功')
    getUserList()
}

// ===== 分配角色 =====
const assignRoleVisible = ref(false)
const assignLoading = ref(false)
const assignRoleIds = ref<number[]>([])
const roleOptions = ref<Role[]>([])
const currentRow = ref<UserDto | null>(null)

const openAssignRole = async (row: UserDto) => {
    currentRow.value = row
    assignRoleVisible.value = true
    // 并行拉角色列表 + 用户已绑角色
    const [roleRes, userRes] = await Promise.all([
        getRoleListApi({ pageNum: 1, pageSize: 1000 }),
        getUserInfoApi(String(row.id))
    ])
    if (roleRes.code === 0) {
        roleOptions.value = roleRes?.result?.data || []
    }
    if (userRes.code === 0) {
        assignRoleIds.value = (userRes.result as any)?.roleIds || []
    }
}

const submitAssignRole = async () => {
    if (!currentRow.value?.id) return
    assignLoading.value = true
    try {
        const res = await updateAuthRoleApi({
            userId: currentRow.value.id,
            roleIds: assignRoleIds.value
        })
        if (res.code !== 0) {
            return ElMessage.error(res.msg || res.message || '分配失败')
        }
        ElMessage.success('分配成功')
        assignRoleVisible.value = false
        getUserList()
    } catch (error) {
        console.error(error)
        ElMessage.error('分配失败，请稍后再试')
    } finally {
        assignLoading.value = false
    }
}
</script>
<style lang="scss" scoped>
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.pagination-container {
    margin-top: 20px;
    text-align: right;
}

.el-pagination {
    margin-top: 10px;
}
</style>
