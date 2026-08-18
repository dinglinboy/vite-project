<template>
    <div class="seckill-container">
        <div class="page-header">
            <h1 class="page-title">秒杀活动</h1>
            <p class="page-subtitle">设置限时限量的秒杀商品（C 端秒杀专区展示）</p>
        </div>

        <el-card class="toolbar-card" shadow="never">
            <div class="toolbar">
                <el-form :inline="true" class="search-form">
                    <el-form-item label="活动名称">
                        <el-input v-model="searchForm.name" placeholder="活动名称" clearable style="width: 180px" />
                    </el-form-item>
                    <el-form-item label="状态">
                        <el-select v-model="searchForm.status" clearable placeholder="全部" style="width: 120px">
                            <el-option label="上架" value="0" />
                            <el-option label="下架" value="1" />
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
                        <el-button :icon="Refresh" @click="handleReset">重置</el-button>
                    </el-form-item>
                </el-form>
                <el-button type="primary" :icon="Plus" v-permission="['seckill:add']" @click="openDialog()">新增活动</el-button>
            </div>
        </el-card>

        <el-card v-loading="loading" shadow="never">
            <el-table :data="list" stripe>
                <el-table-column prop="id" label="ID" width="60" />
                <el-table-column label="商品" min-width="220">
                    <template #default="{ row }">
                        <div class="product-cell">
                            <el-image v-if="row.productImage" :src="toViewUrl(row.productImage)" fit="cover" class="product-thumb" />
                            <div class="product-info">
                                <p class="product-name">{{ row.name }}</p>
                                <p class="product-sub">{{ row.productName }}（原价 ¥{{ row.productPrice }}）</p>
                            </div>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="秒杀价" width="100">
                    <template #default="{ row }">
                        <span class="seckill-price">¥{{ row.seckillPrice }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="库存" width="100">
                    <template #default="{ row }">
                        <span>{{ row.stock }} / {{ row.totalStock }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="limitPerUser" label="限购" width="70" />
                <el-table-column label="活动时间" min-width="200">
                    <template #default="{ row }">
                        <p class="time-text">{{ fmt(row.startTime) }}</p>
                        <p class="time-text">至 {{ fmt(row.endTime) }}</p>
                    </template>
                </el-table-column>
                <el-table-column label="状态" width="90">
                    <template #default="{ row }">
                        <el-tag size="small" :type="row.status === '0' ? 'success' : 'info'">{{ row.status === '0' ? '上架' : '下架' }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="170" fixed="right">
                    <template #default="{ row }">
                        <el-button type="text" size="small" v-permission="['seckill:edit']" @click="toggleStatus(row)">{{ row.status === '0' ? '下架' : '上架' }}</el-button>
                        <el-button type="text" size="small" v-permission="['seckill:edit']" @click="openDialog(row)">编辑</el-button>
                        <el-button type="text" size="small" class="danger-text" v-permission="['seckill:remove']" @click="handleDelete(row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <div class="pagination-container">
                <el-pagination v-model:current-page="pagination.currentPage" v-model:page-size="pagination.pageSize"
                    :page-sizes="[10, 20, 50]" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper"
                    @size-change="handleSizeChange" @current-change="handleCurrentChange" />
            </div>
        </el-card>

        <el-dialog v-model="dialogVisible" :title="form.id ? '编辑活动' : '新增活动'" width="560px" :close-on-click-modal="false">
            <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
                <el-form-item label="活动名称" prop="name">
                    <el-input v-model="form.name" maxlength="50" placeholder="如：双11手机秒杀" />
                </el-form-item>
                <el-form-item label="选择商品" prop="productId">
                    <el-select v-model="form.productId" filterable remote :remote-method="searchProducts" :loading="productLoading"
                        placeholder="输入商品名搜索" style="width: 100%" @focus="searchProducts('')">
                        <el-option v-for="p in productOptions" :key="p.id" :label="`${p.name}（¥${p.price}）`" :value="p.id" />
                    </el-select>
                </el-form-item>
                <el-form-item label="秒杀价" prop="seckillPrice">
                    <el-input-number v-model="form.seckillPrice" :min="0.01" :precision="2" style="width: 180px" />
                    <span class="form-hint">元</span>
                </el-form-item>
                <el-form-item label="发行总量">
                    <el-input-number v-model="form.totalStock" :min="1" :max="999999" style="width: 180px" />
                    <span class="form-hint">件</span>
                </el-form-item>
                <el-form-item label="每人限购">
                    <el-input-number v-model="form.limitPerUser" :min="1" :max="99" style="width: 180px" />
                </el-form-item>
                <el-form-item label="开始时间" prop="startTime">
                    <el-date-picker v-model="form.startTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" style="width: 230px" placeholder="活动开始时间" />
                </el-form-item>
                <el-form-item label="结束时间" prop="endTime">
                    <el-date-picker v-model="form.endTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" style="width: 230px" placeholder="活动结束时间" />
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
import { getSeckillListApi, addSeckillApi, updateSeckillApi, deleteSeckillApi, type SeckillActivity } from '@/api/seckill'
import { getProductListApi } from '@/api/product'

interface ProductOption {
    id: number
    name: string
    price: string
}

const searchForm = reactive({ name: '', status: '' })
const pagination = reactive({ currentPage: 1, pageSize: 10, total: 0 })

const list = ref<SeckillActivity[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const saving = ref(false)
const formRef = ref()
const productOptions = ref<ProductOption[]>([])
const productLoading = ref(false)

const form = reactive({
    id: null as number | null,
    name: '',
    productId: 0 as number,
    seckillPrice: 0,
    totalStock: 100,
    limitPerUser: 1,
    startTime: '',
    endTime: ''
})

const rules = {
    name: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
    productId: [{ required: true, message: '请选择商品', trigger: 'change' }],
    seckillPrice: [{ required: true, message: '请输入秒杀价', trigger: 'change' }],
    startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
    endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
}

const toViewUrl = (url: string) => `/dev${url}`
const fmt = (t: string) => (t ? t.replace('T', ' ').slice(0, 19) : '-')

const loadData = async () => {
    loading.value = true
    try {
        const res = await getSeckillListApi({
            name: searchForm.name || undefined,
            status: searchForm.status || undefined,
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
    searchForm.name = ''
    searchForm.status = ''
    handleSearch()
}

const openDialog = (row?: SeckillActivity) => {
    form.id = row?.id ?? null
    form.name = row?.name ?? ''
    form.productId = row?.productId ?? 0
    form.seckillPrice = row ? Number(row.seckillPrice) : 0
    form.totalStock = row?.totalStock ?? 100
    form.limitPerUser = row?.limitPerUser ?? 1
    form.startTime = row ? fmt(row.startTime) : ''
    form.endTime = row ? fmt(row.endTime) : ''
    if (row?.productId) {
        productOptions.value = [
            {
                id: row.productId,
                name: row.productName || '',
                price: String(row.productPrice || '0')
            }
        ]
    }
    dialogVisible.value = true
}

const handleSave = async () => {
    const valid = await formRef.value?.validate().catch(() => false)
    if (!valid) return
    if (new Date(form.startTime) >= new Date(form.endTime)) {
        ElMessage.error('结束时间需晚于开始时间')
        return
    }
    saving.value = true
    try {
        const body = {
            name: form.name,
            productId: form.productId,
            seckillPrice: form.seckillPrice,
            totalStock: form.totalStock,
            limitPerUser: form.limitPerUser,
            startTime: form.startTime,
            endTime: form.endTime
        }
        const res = form.id ? await updateSeckillApi(form.id, body) : await addSeckillApi(body)
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

const toggleStatus = async (row: SeckillActivity) => {
    const target = row.status === '0' ? '1' : '0'
    const res = await updateSeckillApi(row.id, { status: target })
    if (res.code === 0) {
        row.status = target
        ElMessage.success(target === '0' ? '已上架' : '已下架')
    } else {
        ElMessage.error(res.msg)
    }
}

const handleDelete = (row: SeckillActivity) => {
    ElMessageBox.confirm(`确定删除「${row.name}」吗？`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    })
        .then(async () => {
            const res = await deleteSeckillApi(row.id)
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
.seckill-container {
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

.form-hint {
    margin-left: 10px;
    font-size: 12px;
    color: #909399;
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

.product-sub {
    margin: 2px 0 0;
    font-size: 12px;
    color: #909399;
}

.seckill-price {
    color: #f56c6c;
    font-weight: 600;
}

.time-text {
    margin: 0;
    font-size: 12px;
    color: #606266;
}
</style>
