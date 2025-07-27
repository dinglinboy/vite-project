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
                        <el-button type="primary" @click="addHandler(null)"
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
            <el-table-column label="操作">
                <template #default="{ row }">
                    <el-button type="primary" @click="addHandler(row)"
                        >编辑</el-button
                    >
                    <el-button>详情</el-button>
                    <el-button type="danger">删除</el-button>
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
            @current-change="getUserList"
            @size-change="getUserList()"
        />
    </el-card>
    <el-dialog title="新增用户" v-model="formFlag">
        <el-form ref="form" label-width="100px">
            <el-form-item label="用户名">
                <el-input
                    v-model="form.username"
                    placeholder="请输入用户名"
                ></el-input>
            </el-form-item>
            <el-form-item label="密码">
                <el-input
                    v-model="form.password"
                    placeholder="请输入密码"
                ></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="submitAddUser"
                    >提交</el-button
                >
            </el-form-item>
        </el-form>
    </el-dialog>
    <Modify ref="modifyRef" />
</template>

<script lang="ts" setup>
import { getUserListApi } from '@/api/user'
import { onMounted, ref, reactive } from 'vue'
import { getUsersResponse, UserDto } from '@/api/types/response'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
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
    // 尝试调用接口获取用户列表
    try {
        // 调用获取用户列表的 API，传入搜索条件对象的副本
        const res: getUsersResponse = await getUserListApi({ ...searchOpt })
        // 检查响应状态码是否不等于 0，若不等于 0 则表示请求失败
        if (res.code !== 0) {
            // 显示错误消息并终止函数执行
            return ElMessage.error(res.message)
        }
        // 将接口返回的用户列表数据赋值给 userList 响应式对象，若数据不存在则赋值为空数组
        userList.value = res?.result?.data || []
        // 将接口返回的用户总数赋值给 total 响应式对象
        total.value = res?.result?.total
    } catch (error) {
        // 捕获请求过程中可能出现的错误并打印到控制台
        console.error(error)
    }
}

// 点击重置按钮时触发的处理函数
const resetHandler = () => {
    // 清空搜索用户名输入框的内容
    searchOpt.username = ''
    searchOpt.nickname = ''
    // 重新调用获取用户列表的函数
    getUserList()
}

// 定义表单数据的响应式引用，包含用户名和密码字段
const form = ref({
    username: '',
    password: ''
})
// 定义控制新增用户对话框显示与隐藏的响应式引用
const formFlag = ref(false)

// 点击新增用户按钮时触发的处理函数
const addHandler = (data = null) => {
    // 显示新增用户对话框
    modifyRef?.value?.openDialog(data)
}

// 点击提交新增用户表单时触发的异步处理函数
const submitAddUser = async () => ({})
</script>
<style lang="scss" scoped>
.el-pagination {
    margin-top: 10px;
}
</style>
