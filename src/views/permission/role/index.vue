<template>
    <el-card class="box-card">
        <template #header>
            <div class="card-header">
                <el-form inline>
                    <el-form-item label="角色名称">
                        <el-input
                            v-model="searchOpt.roleName"
                            placeholder="请输入角色名称"
                        ></el-input>
                    </el-form-item>
                    <el-form-item label="角色标识">
                        <el-input
                            v-model="searchOpt.roleKey"
                            placeholder="请输入角色标识"
                        ></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button
                            type="primary"
                            class="button"
                            @click="getRoleList()"
                            >查询</el-button
                        >
                        <el-button @click="resetHandler">重置</el-button>
                        <el-button type="primary" @click="openModifyDialog"
                            >新增角色</el-button
                        >
                    </el-form-item>
                </el-form>
            </div>
        </template>
        <el-table :data="roleList">
            <el-table-column prop="roleName" label="角色名称" />
            <el-table-column prop="roleKey" label="角色标识" />
            <el-table-column prop="createTime" label="创建时间">
                <template #default="{ row }">{{
                    dayjs(row.createTime).format('YYYY-MM-DD hh:mm:ss')
                }}</template>
            </el-table-column>
            <el-table-column prop="updateTime" label="更新时间">
                <template #default="{ row }">{{
                    dayjs(row.updateTime).format('YYYY-MM-DD hh:mm:ss')
                }}</template>
            </el-table-column>
            <el-table-column label="操作">
                <template #default="{ row }">
                    <el-button type="primary" @click="openModifyDialog(row)"
                        >编辑</el-button
                    >
                    <el-button @click="openDetailDialog(row)">详情</el-button>
                    <el-button type="danger" @click="delRoleInfo(row.roleId)"
                        >删除</el-button
                    >
                </template>
            </el-table-column>
        </el-table>
        <el-pagination
            layout="prev, pager, next, jumper, ->, sizes, total"
            :total="total"
            :background="true"
            :page-sizes="[10, 20, 50, 100]"
            v-model:current-page="searchOpt.pageNum"
            v-model:page-size="searchOpt.pageSize"
            @current-change="getRoleList"
            @size-change="getRoleList()"
        />
        <modify ref="modifyRef" @update:success="getRoleList"></modify>
        <detail ref="detailRef"></detail>
    </el-card>
</template>

<script lang="ts" setup>
import { getRoleListApi, deleteRoleInfoApi } from '@/api/role'
import { onMounted, ref, reactive } from 'vue'
import { Role, getRoleListResponse } from '@/api/types/response'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import modify from './modify.vue'
import detail from './detail.vue'

const searchOpt = reactive({
    roleName: '',
    roleKey: '',
    pageSize: 10,
    pageNum: 1
})
const total = ref(0)
const roleList = ref<Role[]>([])
const modifyRef = ref<{ opendialog: (roleInfo: Role | null) => void } | null>(
    null
)
const currentRoleInfo = ref<Role | null>(null)
const detailRef = ref<{ opendialog: (roleInfo: Role) => void } | null>(null)
onMounted(() => {
    getRoleList()
})

const getRoleList = async (pageNum = 1) => {
    // 更新当前页码为传入的页码，默认值为 1
    searchOpt.pageNum = pageNum
    // 去除搜索输入的角色名称前后的空格
    searchOpt.roleName = searchOpt.roleName.trim()
    try {
        // 调用获取角色列表的 API 接口，传入包含搜索条件和分页信息的对象
        const res: getRoleListResponse = await getRoleListApi({ ...searchOpt })
        // 检查接口返回的状态码，如果不等于 0 表示请求失败
        if (res.code !== 0) {
            return ElMessage.error(res.message)
        }
        roleList.value = res?.result?.data || []
        total.value = res?.result?.total
    } catch (error) {
        console.error(error)
    }
}

// 重置搜索条件的处理函数
const resetHandler = () => {
    searchOpt.roleName = ''
    searchOpt.roleKey = ''
    getRoleList()
}

// 点击新增角色按钮时触发的处理函数
const openModifyDialog = (roleInfo: Role | null) => {
    // 显示新增或编辑角色表单
    modifyRef?.value?.opendialog(roleInfo)
}

const openDetailDialog = (roleInfo: Role) => {
    // 显示角色详情对话框
    currentRoleInfo.value = roleInfo
    detailRef.value?.opendialog(roleInfo)
}

const delRoleInfo = async (roleId: string) => {
    // 调用删除角色信息的 API 接口
    const res = await deleteRoleInfoApi(roleId)
    // 检查接口返回的状态码，如果不等于 0 表示请求失败
    if (res.code !== 0) {
        return ElMessage.error(res.message)
    }
    // 显示成功消息
    ElMessage.success('删除成功')
    // 重新获取角色列表
    getRoleList()
}
// 提交新增角色表单时触发的异步处理函数
const submitAddUser = async () => {
    // 此处可添加提交表单数据到后端的逻辑
}
</script>
<style lang="scss" scoped>
.el-pagination {
    margin-top: 10px;
}
</style>
