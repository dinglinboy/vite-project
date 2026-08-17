<template>
    <div class="recommendation-container">
        <div class="page-header">
            <h1 class="page-title">首页推荐管理</h1>
            <p class="page-subtitle">管理 C 端首页"为您推荐"板块的商品（按排序字段展示）</p>
        </div>

        <el-card class="toolbar-card" shadow="never">
            <div class="toolbar">
                <el-form :inline="true" class="search-form">
                    <el-form-item label="位置">
                        <el-select v-model="searchForm.position" clearable placeholder="全部位置" style="width: 200px">
                            <el-option label="首页-为您推荐" value="home_recommend" />
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
                        <el-button :icon="Refresh" @click="handleReset">重置</el-button>
                    </el-form-item>
                </el-form>
                <el-button type="primary" :icon="Plus" v-permission="['recommendation:list:add']" @click="openDialog()">
                    新增推荐
                </el-button>
            </div>
        </el-card>

        <el-card v-loading="loading" shadow="never">
            <el-table :data="list" stripe>
                <el-table-column prop="id" label="ID" width="60" />
                <el-table-column label="商品" min-width="240">
                    <template #default="{ row }">
                        <div class="product-cell">
                            <el-image v-if="row.productImage" :src="toViewUrl(row.productImage)" fit="cover" class="product-thumb" />
                            <div class="product-info">
                                <p class="product-name">{{ row.productName || '商品不存在' }}</p>
                                <p v-if="row.productPrice != null" class="product-price">¥{{ row.productPrice }}</p>
                            </div>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="positionLabel" label="位置" width="140" />
                <el-table-column prop="sortOrder" label="排序" width="80" />
                <el-table-column label="状态" width="90">
                    <template #default="{ row }">
                        <el-switch :model-value="row.status === '0'" :disabled="!hasPermission('recommendation:list:edit')" @change="handleStatusChange(row)" />
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="160" fixed="right">
                    <template #default="{ row }">
                        <el-button type="text" size="small" v-permission="['recommendation:list:edit']" @click="openDialog(row)">编辑</el-button>
                        <el-button type="text" size="small" class="danger-text" v-permission="['recommendation:list:remove']" @click="handleDelete(row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <div class="pagination-container">
                <el-pagination v-model:current-page="pagination.currentPage" v-model:page-size="pagination.pageSize"
                    :page-sizes="[10, 20, 50]" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper"
                    @size-change="handleSizeChange" @current-change="handleCurrentChange" />
            </div>
        </el-card>

        <el-dialog v-model="dialogVisible" :title="form.id ? '编辑推荐' : '新增推荐'" width="520px" :close-on-click-modal="false">
            <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
                <el-form-item label="推荐位" prop="position">
                    <el-select v-model="form.position" style="width: 100%">
                        <el-option label="首页-为您推荐" value="home_recommend" />
                    </el-select>
                </el-form-item>
                <el-form-item label="选择商品" prop="productId">
                    <el-select v-model="form.productId" filterable remote :remote-method="searchProducts" :loading="productLoading"
                        placeholder="输入商品名搜索" style="width: 100%" @focus="searchProducts('')">
                        <el-option v-for="p in productOptions" :key="p.id" :label="`${p.name}（¥${p.price}）`" :value="p.id" />
                    </el-select>
                </el-form-item>
                <el-form-item label="排序">
                    <el-input-number v-model="form.sortOrder" :min="0" :max="999" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRecommendationListApi, addRecommendationApi, updateRecommendationApi, deleteRecommendationApi } from '@/api/recommendation'
import { getProductListApi } from '@/api/product'
import { useUserStore } from '@/store/user'

interface RecommendationItem {
    id: number
    position: string
    positionLabel: string
    productId: number
    productName: string | null
    productImage: string | null
    productPrice: string | null
    sortOrder: number
    status: string
}

interface ProductOption {
    id: number
    name: string
    price: string
}

const searchForm = reactive({ position: '' })

const pagination = reactive({ currentPage: 1, pageSize: 10, total: 0 })

const list = ref<RecommendationItem[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const saving = ref(false)
const formRef = ref()
const productOptions = ref<ProductOption[]>([])
const productLoading = ref(false)

const form = reactive<{
    id: number | null
    position: string
    productId: number
    sortOrder: number
}>({
    id: null,
    position: 'home_recommend',
    productId: 0,
    sortOrder: 0
})

const rules = {
    position: [{ required: true, message: '请选择推荐位', trigger: 'change' }],
    productId: [{ required: true, message: '请选择商品', trigger: 'change' }]
}

const toViewUrl = (url: string) => `/dev${url}`

const hasPermission = (perm: string) => {
    const userStore = useUserStore()
    return userStore.permissions.includes('*') || userStore.permissions.includes(perm)
}

const loadData = async () => {
    loading.value = true
    try {
        const res = await getRecommendationListApi({
            position: searchForm.position || undefined,
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

const searchProducts = async (keyword: string) => {
    productLoading.value = true
    try {
        const res = await getProductListApi({ name: keyword || undefined, pageNum: 1, pageSize: 20 })
        if (res.code === 0) {
            productOptions.value = res.result.data
        }
    } finally {
        productLoading.value = false
    }
}

const handleSearch = () => {
    pagination.currentPage = 1
    loadData()
}

const handleReset = () => {
    searchForm.position = ''
    handleSearch()
}

const openDialog = (row?: RecommendationItem) => {
    form.id = row?.id ?? null
    form.position = row?.position ?? 'home_recommend'
    form.productId = row?.productId ?? 0
    form.sortOrder = row?.sortOrder ?? 0
    if (row?.productId) {
        productOptions.value = [
            {
                id: row.productId,
                name: row.productName || '',
                price: row.productPrice || '0'
            }
        ]
    }
    dialogVisible.value = true
}

const handleSave = async () => {
    const valid = await formRef.value?.validate().catch(() => false)
    if (!valid) return
    saving.value = true
    try {
        const body = { position: form.position, productId: form.productId, sortOrder: form.sortOrder }
        const res = form.id ? await updateRecommendationApi(form.id, body) : await addRecommendationApi(body)
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

const handleStatusChange = async (row: RecommendationItem) => {
    const target = row.status === '0' ? '1' : '0'
    const res = await updateRecommendationApi(row.id, { status: target })
    if (res.code === 0) {
        row.status = target
        ElMessage.success(target === '0' ? '已启用' : '已停用')
    } else {
        ElMessage.error(res.msg)
        loadData()
    }
}

const handleDelete = (row: RecommendationItem) => {
    ElMessageBox.confirm(`确定要删除该推荐位吗？（${row.productName || ''}）`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    })
        .then(async () => {
            const res = await deleteRecommendationApi(row.id)
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
.recommendation-container {
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

.product-cell {
    display: flex;
    align-items: center;
    gap: 10px;
}

.product-thumb {
    width: 48px;
    height: 48px;
    border-radius: 4px;
    flex-shrink: 0;
}

.product-info {
    min-width: 0;
}

.product-name {
    margin: 0;
    font-size: 13px;
    color: #303133;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.product-price {
    margin: 2px 0 0;
    font-size: 12px;
    color: #f56c6c;
}
</style>
