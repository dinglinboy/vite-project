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
                    <el-form-item>
                        <el-button
                            type="primary"
                            class="button"
                            @click="getUserList()"
                            >查询</el-button
                        >
                        <el-button @click="resetHandler">重置</el-button>
                        <el-button type="primary" @click="addHandler">新增用户</el-button>
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
            <el-table-column title="操作">
                <template #default="{ row }">
                    <el-button type="primary">编辑</el-button>
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
            @size-change="getUserList"
        />
    </el-card>
    <el-dialog title="新增用户" v-model="formFlag">
        <el-form ref="form" label-width="100px">
            <el-form-item label="用户名">
                <el-input v-model="form.username" placeholder="请输入用户名"></el-input>
            </el-form-item>
            <el-form-item label="密码">
                <el-input v-model="form.password" placeholder="请输入密码"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="submitAddUser">提交</el-button>
            </el-form-item>
        </el-form>
    </el-dialog>
</template>

<script lang="ts" setup>
import { getUsersApi } from '@/api/user'
import { onMounted, ref, reactive } from 'vue'
import { UserListDto, User } from '@/api/types/index'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
// 查询条件对象
const searchOpt = reactive({
    username: '', // 搜索用户名
    pageSize: 10, // 每页限制数量
    pageNum: 1 // 当前页面
})
// 用户总数
const total = ref(0)

// 用户列表
const userList = ref<User[]>([])

// 获取用户列表
onMounted(() => {
    getUserList()
})

// 根据查询条件获取用户列表
const getUserList = async (pageNum = 1) => {
    searchOpt.pageNum = pageNum
    searchOpt.username = searchOpt.username.trim()
    try {
        const res: UserListDto = await getUsersApi({ ...searchOpt })
        if (res.code !== 0) {
            return ElMessage.error(res.message)
        }
        userList.value = res.result.data || []
        total.value = res.result.total
    } catch (error) {
        console.error(error)
    }
}

// 点击重置按钮
const resetHandler = () => {
    searchOpt.username = ''
    getUserList()
}


const form = ref({
    username: '',
    password: ''
});
const formFlag = ref(false);
const addHandler = () => {
    console.log('新增')
    formFlag.value = true;
}
const submitAddUser = async () => {
    
}
</script>
