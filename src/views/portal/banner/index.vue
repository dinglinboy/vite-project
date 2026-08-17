<template>
    <div class="banner-container">
        <div class="page-header">
            <h1 class="page-title">轮播图管理</h1>
            <p class="page-subtitle">管理 C 端首页顶部轮播图（建议尺寸 750×340）</p>
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
                    v-permission="['banner:list:add']"
                    @click="openDialog()"
                >
                    新增轮播图
                </el-button>
            </div>
        </el-card>

        <el-card v-loading="loading" shadow="never">
            <el-table :data="bannerList" stripe>
                <el-table-column prop="id" label="ID" width="60" />
                <el-table-column label="图片" width="140">
                    <template #default="{ row }">
                        <el-image
                            :src="toViewUrl(row.image)"
                            :preview-src-list="[toViewUrl(row.image)]"
                            preview-teleported
                            fit="cover"
                            style="width: 120px; height: 54px; border-radius: 4px"
                        />
                    </template>
                </el-table-column>
                <el-table-column prop="title" label="标题" min-width="160" />
                <el-table-column label="链接" width="160">
                    <template #default="{ row }">
                        <el-tag size="small">{{ linkTypeText(row.linkType) }}</el-tag>
                        <span v-if="row.linkId" class="link-id">#{{ row.linkId }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="sortOrder" label="排序" width="70" />
                <el-table-column label="状态" width="90">
                    <template #default="{ row }">
                        <el-switch
                            :model-value="row.status === '0'"
                            :disabled="!hasPermission('banner:list:edit')"
                            @change="handleStatusChange(row)"
                        />
                    </template>
                </el-table-column>
                <el-table-column prop="createTime" label="创建时间" width="170" />
                <el-table-column label="操作" width="160" fixed="right">
                    <template #default="{ row }">
                        <el-button
                            type="text"
                            size="small"
                            v-permission="['banner:list:edit']"
                            @click="openDialog(row)"
                        >
                            编辑
                        </el-button>
                        <el-button
                            type="text"
                            size="small"
                            class="danger-text"
                            v-permission="['banner:list:remove']"
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
            :title="form.id ? '编辑轮播图' : '新增轮播图'"
            width="520px"
            :close-on-click-modal="false"
        >
            <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
                <el-form-item label="标题" prop="title">
                    <el-input v-model="form.title" placeholder="请输入标题" maxlength="100" />
                </el-form-item>
                <el-form-item label="轮播图" prop="image">
                    <el-upload
                        :show-file-list="false"
                        :http-request="handleUpload"
                        accept="image/*"
                    >
                        <div class="upload-box">
                            <el-image
                                v-if="form.image"
                                :src="toViewUrl(form.image)"
                                fit="cover"
                                class="upload-preview"
                            />
                            <div v-else class="upload-placeholder">
                                <el-icon><Plus /></el-icon>
                                <span>上传图片</span>
                            </div>
                        </div>
                    </el-upload>
                </el-form-item>
                <el-form-item label="链接类型">
                    <el-select v-model="form.linkType" style="width: 100%">
                        <el-option label="商品" value="product" />
                        <el-option label="分类" value="category" />
                        <el-option label="活动页" value="url" />
                    </el-select>
                </el-form-item>
                <el-form-item label="链接ID">
                    <el-input
                        v-model="form.linkId"
                        placeholder="商品/分类 ID（活动页可不填）"
                    />
                </el-form-item>
                <el-form-item label="排序">
                    <el-input-number v-model="form.sortOrder" :min="0" :max="999" />
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
    getBannerListApi,
    addBannerApi,
    updateBannerApi,
    deleteBannerApi
} from '@/api/banner'
import axios from '@/util/axios'
import { Result } from '@/interfaces/base.interface'
import { useUserStore } from '@/store/user'

interface BannerItem {
    id: number
    title: string
    image: string
    linkType: string
    linkId: number | null
    sortOrder: number
    status: string
    createTime: string
}

const searchForm = reactive({ title: '' })

const pagination = reactive({
    currentPage: 1,
    pageSize: 10,
    total: 0
})

const bannerList = ref<BannerItem[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const saving = ref(false)
const formRef = ref()

const form = reactive<{
    id: number | null
    title: string
    image: string
    linkType: string
    linkId: number | null
    sortOrder: number
}>({
    id: null,
    title: '',
    image: '',
    linkType: 'product',
    linkId: null,
    sortOrder: 0
})

const rules = {
    title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
    image: [{ required: true, message: '请上传轮播图', trigger: 'change' }]
}

const toViewUrl = (url: string) => `/dev${url}`

const linkTypeText = (type: string) => {
    const map: Record<string, string> = {
        product: '商品',
        category: '分类',
        url: '活动页'
    }
    return map[type] || type
}

const hasPermission = (perm: string) => {
    const userStore = useUserStore()
    return userStore.permissions.includes('*') || userStore.permissions.includes(perm)
}

const loadData = async () => {
    loading.value = true
    try {
        const res = await getBannerListApi({
            title: searchForm.title || undefined,
            pageNum: pagination.currentPage,
            pageSize: pagination.pageSize
        })
        if (res.code === 0) {
            bannerList.value = res.result.data
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

const openDialog = (row?: BannerItem) => {
    form.id = row?.id ?? null
    form.title = row?.title ?? ''
    form.image = row?.image ?? ''
    form.linkType = row?.linkType ?? 'product'
    form.linkId = row?.linkId ?? null
    form.sortOrder = row?.sortOrder ?? 0
    dialogVisible.value = true
}

const handleUpload = async (options: any) => {
    const formData = new FormData()
    formData.append('file', options.file)
    try {
        const res = await axios.post<any, Result>(
            '/common/upload/singleFile',
            formData
        )
        if (res.code === 0) {
            form.image = res.result.url
            ElMessage.success('上传成功')
        } else {
            ElMessage.error(res.msg)
        }
    } catch (error) {
        ElMessage.error('上传失败')
    }
}

const handleSave = async () => {
    const valid = await formRef.value?.validate().catch(() => false)
    if (!valid) return
    saving.value = true
    try {
        const body = {
            title: form.title,
            image: form.image,
            linkType: form.linkType,
            linkId: form.linkId ? Number(form.linkId) : null,
            sortOrder: form.sortOrder
        }
        const res = form.id
            ? await updateBannerApi(form.id, body)
            : await addBannerApi(body)
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

const handleStatusChange = async (row: BannerItem) => {
    const target = row.status === '0' ? '1' : '0'
    const res = await updateBannerApi(row.id, { status: target })
    if (res.code === 0) {
        row.status = target
        ElMessage.success(target === '0' ? '已启用' : '已停用')
    } else {
        ElMessage.error(res.msg)
        loadData()
    }
}

const handleDelete = (row: BannerItem) => {
    ElMessageBox.confirm(`确定要删除轮播图"${row.title}"吗？`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    })
        .then(async () => {
            const res = await deleteBannerApi(row.id)
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
.banner-container {
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

.link-id {
    margin-left: 6px;
    font-size: 12px;
    color: #909399;
}

.danger-text {
    color: #f56c6c;
}

.pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
}

.upload-box {
    width: 300px;
}

.upload-preview {
    width: 100%;
    height: 136px;
    border-radius: 6px;
    display: block;
}

.upload-placeholder {
    height: 136px;
    border: 1px dashed #dcdfe6;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    color: #909399;
    font-size: 13px;
    cursor: pointer;
    background: #fafafa;
}

.upload-placeholder:hover {
    border-color: #2563eb;
    color: #2563eb;
}
</style>