<template>
    <div class="announcement-container">
        <div class="page-header">
            <h1 class="page-title">公告管理</h1>
            <p class="page-subtitle">管理 C 端首页顶部公告条（仅最新一条展示在首页）</p>
        </div>

        <el-card class="toolbar-card" shadow="never">
            <div class="toolbar">
                <el-form :inline="true" class="search-form">
                    <el-form-item label="标题">
                        <el-input
                            v-model="searchForm.title"
                            placeholder="请输入标题"
                            clearable
                            style="width: 200px"
                        />
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" :icon="Search" @click="handleSearch">
                            搜索
                        </el-button>
                        <el-button :icon="Refresh" @click="handleReset">重置</el-button>
                    </el-form-item>
                </el-form>
                <el-button
                    type="primary"
                    :icon="Plus"
                    v-permission="['announcement:list:add']"
                    @click="openDialog()"
                >
                    新增公告
                </el-button>
            </div>
        </el-card>

        <el-card v-loading="loading" shadow="never">
            <el-table :data="list" stripe>
                <el-table-column prop="id" label="ID" width="60" />
                <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
                <el-table-column
                    prop="content"
                    label="内容"
                    min-width="260"
                    show-overflow-tooltip
                />
                <el-table-column prop="publishTime" label="发布时间" width="170" />
                <el-table-column label="状态" width="90">
                    <template #default="{ row }">
                        <el-switch
                            :model-value="row.status === '0'"
                            :disabled="!hasPermission('announcement:list:edit')"
                            @change="handleStatusChange(row)"
                        />
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="160" fixed="right">
                    <template #default="{ row }">
                        <el-button
                            type="text"
                            size="small"
                            v-permission="['announcement:list:edit']"
                            @click="openDialog(row)"
                        >
                            编辑
                        </el-button>
                        <el-button
                            type="text"
                            size="small"
                            class="danger-text"
                            v-permission="['announcement:list:remove']"
                            @click="handleDelete(row)"
                        >
                            删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <div class="pagination-container">
                <el-pagination
                    v-model:current-page="pagination.currentPage"
                    v-model:page-size="pagination.pageSize"
                    :page-sizes="[10, 20, 50]"
                    :total="pagination.total"
                    layout="total, sizes, prev, pager, next, jumper"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                />
            </div>
        </el-card>

        <el-dialog
            v-model="dialogVisible"
            :title="form.id ? '编辑公告' : '新增公告'"
            width="560px"
            :close-on-click-modal="false"
        >
            <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
                <el-form-item label="标题" prop="title">
                    <el-input v-model="form.title" placeholder="请输入标题" maxlength="100" />
                </el-form-item>
                <el-form-item label="内容" prop="content">
                    <el-input
                        v-model="form.content"
                        type="textarea"
                        :rows="5"
                        placeholder="请输入公告内容"
                        maxlength="1000"
                        show-word-limit
                    />
                </el-form-item>
                <el-form-item label="发布时间">
                    <el-date-picker
                        v-model="form.publishTime"
                        type="datetime"
                        placeholder="默认当前时间"
                        style="width: 100%"
                    />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" :loading="saving" @click="handleSave">
                    保存
                </el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
    getAnnouncementListApi,
    addAnnouncementApi,
    updateAnnouncementApi,
    deleteAnnouncementApi
} from '@/api/announcement'
import { useUserStore } from '@/store/user'

interface AnnouncementItem {
    id: number
    title: string
    content: string
    publishTime: string
    status: string
}

const searchForm = reactive({ title: '' })

const pagination = reactive({
    currentPage: 1,
    pageSize: 10,
    total: 0
})

const list = ref<AnnouncementItem[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const saving = ref(false)
const formRef = ref()

const form = reactive<{
    id: number | null
    title: string
    content: string
    publishTime: string
}>({
    id: null,
    title: '',
    content: '',
    publishTime: ''
})

const rules = {
    title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
    content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
}

const hasPermission = (perm: string) => {
    const userStore = useUserStore()
    return userStore.permissions.includes('*') || userStore.permissions.includes(perm)
}

const loadData = async () => {
    loading.value = true
    try {
        const res = await getAnnouncementListApi({
            title: searchForm.title || undefined,
            pageNum: pagination.currentPage,
            pageSize: pagination.pageSize
        })
        if (res.code === 0) {
            list.value = res.result.data
            pagination.total = res.result.total
        } else {
            ElMessage.error(res.msg)
        }
    } finally {
        loading.value = false
    }
}

const handleSearch = () => {
    pagination.currentPage = 1
    loadData()
}

const handleReset = () => {
    searchForm.title = ''
    handleSearch()
}

const openDialog = (row?: AnnouncementItem) => {
    form.id = row?.id ?? null
    form.title = row?.title ?? ''
    form.content = row?.content ?? ''
    form.publishTime = row?.publishTime ?? ''
    dialogVisible.value = true
}

const handleSave = async () => {
    const valid = await formRef.value?.validate().catch(() => false)
    if (!valid) return
    saving.value = true
    try {
        const body = {
            title: form.title,
            content: form.content,
            publishTime: form.publishTime || undefined
        }
        const res = form.id
            ? await updateAnnouncementApi(form.id, body)
            : await addAnnouncementApi(body)
        if (res.code === 0) {
            ElMessage.success(res.msg)
            dialogVisible.value = false
            loadData()
        } else {
            ElMessage.error(res.msg)
        }
    } finally {
        saving.value = false
    }
}

const handleStatusChange = async (row: AnnouncementItem) => {
    const target = row.status === '0' ? '1' : '0'
    const res = await updateAnnouncementApi(row.id, { status: target })
    if (res.code === 0) {
        row.status = target
        ElMessage.success(target === '0' ? '已启用' : '已停用')
    } else {
        ElMessage.error(res.msg)
        loadData()
    }
}

const handleDelete = (row: AnnouncementItem) => {
    ElMessageBox.confirm(`确定要删除公告"${row.title}"吗？`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    })
        .then(async () => {
            const res = await deleteAnnouncementApi(row.id)
            if (res.code === 0) {
                ElMessage.success(res.msg)
                loadData()
            } else {
                ElMessage.error(res.msg)
            }
        })
        .catch(() => {})
}

const handleSizeChange = (size: number) => {
    pagination.pageSize = size
    loadData()
}

const handleCurrentChange = (page: number) => {
    pagination.currentPage = page
    loadData()
}

onMounted(() => {
    loadData()
})
</script>

<style scoped>
.announcement-container {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: 100vh;
}

.page-header {
    margin-bottom: 20px;
}

.page-title {
    font-size: 24px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 8px 0;
}

.page-subtitle {
    font-size: 14px;
    color: #909399;
    margin: 0;
}

.toolbar-card {
    margin-bottom: 20px;
    border: none;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
}

.search-form {
    margin: 0;
}

.danger-text {
    color: #f56c6c;
}

.pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
}
</style>