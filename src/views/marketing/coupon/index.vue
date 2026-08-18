<template>
    <div class="coupon-container">
        <div class="page-header">
            <h1 class="page-title">优惠券模板</h1>
            <p class="page-subtitle">创建 C 端可领取的优惠券（满减/折扣/无门槛立减）</p>
        </div>

        <el-card class="toolbar-card" shadow="never">
            <div class="toolbar">
                <el-form :inline="true" class="search-form">
                    <el-form-item label="券名称">
                        <el-input v-model="searchForm.name" placeholder="券名称" clearable style="width: 180px" />
                    </el-form-item>
                    <el-form-item label="类型">
                        <el-select v-model="searchForm.type" clearable placeholder="全部" style="width: 140px">
                            <el-option label="满减" value="full_reduction" />
                            <el-option label="折扣" value="discount" />
                            <el-option label="无门槛立减" value="cash" />
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
                        <el-button :icon="Refresh" @click="handleReset">重置</el-button>
                    </el-form-item>
                </el-form>
                <el-button type="primary" :icon="Plus" v-permission="['coupon:template:add']" @click="openDialog()">新增券</el-button>
            </div>
        </el-card>

        <el-card v-loading="loading" shadow="never">
            <el-table :data="list" stripe>
                <el-table-column prop="id" label="ID" width="60" />
                <el-table-column prop="name" label="券名称" min-width="150" />
                <el-table-column label="类型" width="110">
                    <template #default="{ row }">
                        <el-tag size="small" :type="typeTag(row.type)">{{ typeText(row.type) }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="优惠内容" min-width="140">
                    <template #default="{ row }">
                        <span v-if="row.type === 'discount'">满{{ row.thresholdAmount }}元 享{{ Math.round(Number(row.discountRate) * 10) }}折</span>
                        <span v-else-if="row.type === 'cash'">无门槛减 ¥{{ row.discountAmount }}</span>
                        <span v-else>满{{ row.thresholdAmount }}元 减 ¥{{ row.discountAmount }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="发行/已领" width="130">
                    <template #default="{ row }">
                        <span>{{ row.receivedCount }} / {{ row.totalCount ? row.totalCount : '不限' }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="perUserLimit" label="限领" width="70" />
                <el-table-column prop="validDays" label="有效期" width="100">
                    <template #default="{ row }">领取后{{ row.validDays }}天</template>
                </el-table-column>
                <el-table-column label="状态" width="90">
                    <template #default="{ row }">
                        <el-tag size="small" :type="row.status === '0' ? 'success' : 'info'">{{ row.status === '0' ? '上架' : '下架' }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="220" fixed="right">
                    <template #default="{ row }">
                        <el-button type="text" size="small" v-permission="['coupon:template:edit']" @click="toggleStatus(row)">{{ row.status === '0' ? '下架' : '上架' }}</el-button>
                        <el-button type="text" size="small" v-permission="['coupon:template:list']" @click="openDetail(row)">明细</el-button>
                        <el-button type="text" size="small" v-permission="['coupon:template:edit']" @click="openDialog(row)">编辑</el-button>
                        <el-button type="text" size="small" class="danger-text" v-permission="['coupon:template:remove']" @click="handleDelete(row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <div class="pagination-container">
                <el-pagination v-model:current-page="pagination.currentPage" v-model:page-size="pagination.pageSize"
                    :page-sizes="[10, 20, 50]" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper"
                    @size-change="handleSizeChange" @current-change="handleCurrentChange" />
            </div>
        </el-card>

        <el-dialog v-model="dialogVisible" :title="form.id ? '编辑券' : '新增券'" width="560px" :close-on-click-modal="false">
            <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
                <el-form-item label="券名称" prop="name">
                    <el-input v-model="form.name" maxlength="50" placeholder="如：新人满减券" />
                </el-form-item>
                <el-form-item label="券类型" prop="type">
                    <el-radio-group v-model="form.type">
                        <el-radio label="full_reduction">满减</el-radio>
                        <el-radio label="discount">折扣</el-radio>
                        <el-radio label="cash">无门槛立减</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item v-if="form.type !== 'cash'" label="使用门槛">
                    <el-input-number v-model="form.thresholdAmount" :min="0" :precision="2" style="width: 180px" />
                    <span class="form-hint">元起可用（0 表示无门槛）</span>
                </el-form-item>
                <el-form-item v-if="form.type !== 'discount'" label="优惠金额">
                    <el-input-number v-model="form.discountAmount" :min="0.01" :precision="2" style="width: 180px" />
                    <span class="form-hint">元</span>
                </el-form-item>
                <el-form-item v-else label="折扣率">
                    <el-input-number v-model="form.discountRate" :min="0.01" :max="0.99" :precision="2" :step="0.05" style="width: 180px" />
                    <span class="form-hint">如 0.85 = 85 折</span>
                </el-form-item>
                <el-form-item label="发行总量">
                    <el-input-number v-model="form.totalCount" :min="0" :max="999999" style="width: 180px" />
                    <span class="form-hint">0 表示不限量</span>
                </el-form-item>
                <el-form-item label="每人限领">
                    <el-input-number v-model="form.perUserLimit" :min="1" :max="99" style="width: 180px" />
                </el-form-item>
                <el-form-item label="有效天数">
                    <el-input-number v-model="form.validDays" :min="1" :max="365" style="width: 180px" />
                    <span class="form-hint">领取后 N 天内有效</span>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
            </template>
        </el-dialog>

        <el-dialog v-model="detailVisible" :title="`领取明细 - ${detailTemplate?.name || ''}`" width="640px">
            <div class="detail-summary">
                已领取 <b>{{ detailTotal }}</b> 张
                <el-tag size="small" type="success" class="summary-tag">未使用 {{ unusedCount }}</el-tag>
                <el-tag size="small" type="info" class="summary-tag">已使用 {{ usedCount }}</el-tag>
            </div>
            <el-table :data="receivedList" size="small" max-height="400">
                <el-table-column prop="id" label="券ID" width="70" />
                <el-table-column prop="userId" label="用户ID" width="80" />
                <el-table-column label="状态" width="90">
                    <template #default="{ row }">
                        <el-tag size="small" :type="row.status === 'unused' ? 'success' : 'info'">{{ row.status === 'unused' ? '未使用' : '已使用' }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="领取时间" width="150">
                    <template #default="{ row }">{{ fmt(row.receiveTime) }}</template>
                </el-table-column>
                <el-table-column label="到期时间" width="150">
                    <template #default="{ row }">{{ fmt(row.expireTime) }}</template>
                </el-table-column>
                <el-table-column prop="orderNo" label="使用订单" min-width="150" />
            </el-table>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCouponListApi, addCouponApi, updateCouponApi, deleteCouponApi, getCouponDetailApi, type CouponTemplate, type CouponReceived } from '@/api/coupon'

const searchForm = reactive({ name: '', type: '' })
const pagination = reactive({ currentPage: 1, pageSize: 10, total: 0 })

const list = ref<CouponTemplate[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const saving = ref(false)
const formRef = ref()
const detailVisible = ref(false)
const detailTemplate = ref<CouponTemplate | null>(null)
const receivedList = ref<CouponReceived[]>([])
const detailTotal = ref(0)
const unusedCount = ref(0)
const usedCount = ref(0)

const form = reactive({
    id: null as number | null,
    name: '',
    type: 'full_reduction',
    thresholdAmount: 0,
    discountAmount: 0,
    discountRate: 0.85,
    totalCount: 0,
    perUserLimit: 1,
    validDays: 7
})

const rules = {
    name: [{ required: true, message: '请输入券名称', trigger: 'blur' }],
    type: [{ required: true, message: '请选择券类型', trigger: 'change' }]
}

const typeText = (t: string) => ({ full_reduction: '满减', discount: '折扣', cash: '无门槛立减' }[t] || t)
const typeTag = (t: string) => (t === 'discount' ? 'warning' : t === 'cash' ? 'danger' : 'success')
const fmt = (t: string) => (t ? t.replace('T', ' ').slice(0, 19) : '-')

const loadData = async () => {
    loading.value = true
    try {
        const res = await getCouponListApi({
            name: searchForm.name || undefined,
            type: searchForm.type || undefined,
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
    searchForm.name = ''
    searchForm.type = ''
    handleSearch()
}

const openDialog = (row?: CouponTemplate) => {
    form.id = row?.id ?? null
    form.name = row?.name ?? ''
    form.type = row?.type ?? 'full_reduction'
    form.thresholdAmount = row ? Number(row.thresholdAmount) : 0
    form.discountAmount = row ? Number(row.discountAmount) : 0
    form.discountRate = row?.discountRate ? Number(row.discountRate) : 0.85
    form.totalCount = row?.totalCount ?? 0
    form.perUserLimit = row?.perUserLimit ?? 1
    form.validDays = row?.validDays ?? 7
    dialogVisible.value = true
}

const handleSave = async () => {
    const valid = await formRef.value?.validate().catch(() => false)
    if (!valid) return
    saving.value = true
    try {
        const body: Record<string, unknown> = {
            name: form.name,
            type: form.type,
            thresholdAmount: form.thresholdAmount,
            discountAmount: form.discountAmount,
            discountRate: form.type === 'discount' ? form.discountRate : undefined,
            totalCount: form.totalCount,
            perUserLimit: form.perUserLimit,
            validDays: form.validDays
        }
        const res = form.id ? await updateCouponApi(form.id, body) : await addCouponApi(body)
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

const toggleStatus = async (row: CouponTemplate) => {
    const target = row.status === '0' ? '1' : '0'
    const res = await updateCouponApi(row.id, { status: target })
    if (res.code === 0) {
        row.status = target
        ElMessage.success(target === '0' ? '已上架' : '已下架')
    } else {
        ElMessage.error(res.msg)
    }
}

const handleDelete = (row: CouponTemplate) => {
    ElMessageBox.confirm(`确定删除「${row.name}」吗？`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    })
        .then(async () => {
            const res = await deleteCouponApi(row.id)
            if (res.code === 0) {
                ElMessage.success(res.msg)
                loadData()
            } else {
                ElMessage.error(res.msg)
            }
        })
        .catch(() => {})
}

const openDetail = async (row: CouponTemplate) => {
    detailTemplate.value = row
    const res = await getCouponDetailApi(row.id)
    if (res.code === 0) {
        receivedList.value = res.result.received
        detailTotal.value = res.result.total
        unusedCount.value = res.result.received.filter((r: CouponReceived) => r.status === 'unused').length
        usedCount.value = res.result.received.filter((r: CouponReceived) => r.status === 'used').length
        detailVisible.value = true
    } else {
        ElMessage.error(res.msg)
    }
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
.coupon-container {
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

.detail-summary {
    margin-bottom: 12px;
    font-size: 13px;
    color: #606266;
}

.summary-tag {
    margin-left: 8px;
}
</style>
