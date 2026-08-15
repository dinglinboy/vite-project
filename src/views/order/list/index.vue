<template>
    <div class="order-list-container">
        <div class="page-header">
            <h1 class="page-title">订单管理</h1>
            <p class="page-subtitle">管理和查看所有订单信息</p>
        </div>

        <el-card class="search-card" shadow="never">
            <el-form :model="searchForm" :inline="true" class="search-form">
                <el-form-item label="订单号">
                    <el-input
                        v-model="searchForm.orderNo"
                        placeholder="请输入订单号"
                        clearable
                        style="width: 200px"
                    />
                </el-form-item>
                <el-form-item label="用户名">
                    <el-input
                        v-model="searchForm.username"
                        placeholder="请输入用户名"
                        clearable
                        style="width: 160px"
                    />
                </el-form-item>
                <el-form-item label="订单状态">
                    <el-select
                        v-model="searchForm.orderStatus"
                        placeholder="请选择状态"
                        clearable
                        style="width: 140px"
                    >
                        <el-option
                            v-for="s in statusOptions"
                            :key="s.value"
                            :label="s.label"
                            :value="s.value"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button
                        type="primary"
                        @click="handleSearch"
                        :icon="Search"
                    >
                        搜索
                    </el-button>
                    <el-button @click="handleReset" :icon="Refresh">
                        重置
                    </el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <el-card class="table-card" shadow="never">
            <el-table v-loading="loading" :data="tableData" stripe>
                <el-table-column prop="orderNo" label="订单号" width="170">
                    <template #default="scope">
                        <el-link
                            type="primary"
                            @click="handleViewDetail(scope.row)"
                        >
                            {{ scope.row.orderNo }}
                        </el-link>
                    </template>
                </el-table-column>
                <el-table-column prop="username" label="用户" width="100" />
                <el-table-column prop="items" label="商品信息" min-width="200">
                    <template #default="scope">
                        <div class="product-info">
                            <div
                                v-for="(item, index) in scope.row.items"
                                :key="index"
                                class="product-item"
                            >
                                <span class="product-name">{{
                                    item.productName
                                }}</span>
                                <span class="product-spec">{{
                                    item.skuName || ''
                                }}</span>
                                <span class="product-quantity"
                                    >×{{ item.quantity }}</span
                                >
                            </div>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column
                    prop="totalAmount"
                    label="订单金额"
                    width="110"
                >
                    <template #default="scope">
                        <span class="amount-text"
                            >¥{{
                                Number(scope.row.totalAmount).toFixed(2)
                            }}</span
                        >
                    </template>
                </el-table-column>
                <el-table-column prop="orderStatus" label="状态" width="100">
                    <template #default="scope">
                        <el-tag
                            :type="getStatusType(scope.row.orderStatus)"
                            size="small"
                        >
                            {{ getStatusText(scope.row.orderStatus) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column
                    prop="createTime"
                    label="下单时间"
                    width="160"
                />
                <el-table-column label="操作" width="190" fixed="right">
                    <template #default="scope">
                        <el-button
                            type="text"
                            size="small"
                            @click="handleViewDetail(scope.row)"
                            :icon="View"
                        >
                            查看
                        </el-button>
                        <el-button
                            type="text"
                            size="small"
                            @click="handleShip(scope.row)"
                            :icon="Van"
                            v-if="scope.row.orderStatus === 'paid'"
                            v-permission="['order:list:ship']"
                        >
                            发货
                        </el-button>
                        <el-dropdown
                            @command="(c: any) => handleDropdownCommand(c, scope.row)"
                        >
                            <el-button type="text" size="small">
                                更多<el-icon class="el-icon--right"
                                    ><arrow-down
                                /></el-icon>
                            </el-button>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        command="complete"
                                        v-if="
                                            scope.row.orderStatus === 'shipped'
                                        "
                                        v-permission="['order:list:edit']"
                                    >
                                        标记完成
                                    </el-dropdown-item>
                                    <el-dropdown-item
                                        command="cancel"
                                        v-if="
                                            [
                                                'pending_payment',
                                                'paid'
                                            ].includes(scope.row.orderStatus)
                                        "
                                        v-permission="['order:list:edit']"
                                    >
                                        取消订单
                                    </el-dropdown-item>
                                    <el-dropdown-item
                                        command="refund"
                                        v-if="
                                            ['paid', 'shipped'].includes(
                                                scope.row.orderStatus
                                            )
                                        "
                                        v-permission="['order:list:edit']"
                                    >
                                        退款
                                    </el-dropdown-item>
                                    <el-dropdown-item
                                        command="delete"
                                        divided
                                        v-permission="['order:list:remove']"
                                    >
                                        删除
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                </el-table-column>
            </el-table>

            <div class="pagination-container">
                <el-pagination
                    v-model:current-page="pagination.currentPage"
                    v-model:page-size="pagination.pageSize"
                    :page-sizes="[10, 20, 50, 100]"
                    :total="pagination.total"
                    layout="total, sizes, prev, pager, next, jumper"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                />
            </div>
        </el-card>

        <el-dialog
            v-model="detailDialogVisible"
            title="订单详情"
            width="800px"
            :before-close="handleCloseDetail"
        >
            <div v-if="currentOrder" class="order-detail">
                <el-descriptions :column="2" border>
                    <el-descriptions-item label="订单号">{{
                        currentOrder.orderNo
                    }}</el-descriptions-item>
                    <el-descriptions-item label="订单状态">
                        <el-tag :type="getStatusType(currentOrder.orderStatus)">
                            {{ getStatusText(currentOrder.orderStatus) }}
                        </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="下单用户">{{
                        currentOrder.username
                    }}</el-descriptions-item>
                    <el-descriptions-item label="联系电话">{{
                        currentOrder.receiverPhone
                    }}</el-descriptions-item>
                    <el-descriptions-item label="收货人">{{
                        currentOrder.receiverName
                    }}</el-descriptions-item>
                    <el-descriptions-item label="物流单号">{{
                        currentOrder.shipNo || '无'
                    }}</el-descriptions-item>
                    <el-descriptions-item label="收货地址" :span="2">{{
                        currentOrder.receiverAddress
                    }}</el-descriptions-item>
                    <el-descriptions-item label="订单金额">
                        <span class="amount-text"
                            >¥{{
                                Number(currentOrder.totalAmount).toFixed(2)
                            }}</span
                        >
                    </el-descriptions-item>
                    <el-descriptions-item label="实付金额">
                        ¥{{ Number(currentOrder.payAmount).toFixed(2) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="下单时间">{{
                        currentOrder.createTime
                    }}</el-descriptions-item>
                    <el-descriptions-item label="备注" :span="2">{{
                        currentOrder.remark || '无'
                    }}</el-descriptions-item>
                </el-descriptions>

                <div class="product-detail-section">
                    <h4>商品明细</h4>
                    <el-table :data="currentOrder.items" style="width: 100%">
                        <el-table-column prop="productName" label="商品名称" />
                        <el-table-column
                            prop="skuName"
                            label="规格"
                            width="120"
                        />
                        <el-table-column prop="price" label="单价" width="100">
                            <template #default="scope">
                                ¥{{ Number(scope.row.price).toFixed(2) }}
                            </template>
                        </el-table-column>
                        <el-table-column
                            prop="quantity"
                            label="数量"
                            width="80"
                        />
                        <el-table-column label="小计" width="110">
                            <template #default="scope">
                                ¥{{ Number(scope.row.total).toFixed(2) }}
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="detailDialogVisible = false"
                        >关闭</el-button
                    >
                </span>
            </template>
        </el-dialog>

        <el-dialog
            v-model="shipDialogVisible"
            title="订单发货"
            width="420px"
            :close-on-click-modal="false"
        >
            <el-form
                ref="shipFormRef"
                :model="shipForm"
                :rules="shipRules"
                label-width="90px"
            >
                <el-form-item label="订单号">
                    <el-input :model-value="shipForm.orderNo" disabled />
                </el-form-item>
                <el-form-item label="物流单号" prop="shipNo">
                    <el-input
                        v-model="shipForm.shipNo"
                        placeholder="请输入物流单号"
                        maxlength="50"
                    />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="shipDialogVisible = false"
                        >取消</el-button
                    >
                    <el-button type="primary" @click="handleShipConfirm"
                        >确认发货</el-button
                    >
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, View, ArrowDown, Van } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules, TagProps } from 'element-plus'
import {
    getOrderListApi,
    shipOrderApi,
    changeOrderStatusApi,
    deleteOrderApi
} from '@/api/order'
import type { OrderItemRow } from '@/api/types/response'

const searchForm = reactive({
    orderNo: '',
    username: '',
    orderStatus: ''
})

const statusOptions = [
    { label: '待付款', value: 'pending_payment' },
    { label: '已付款', value: 'paid' },
    { label: '已发货', value: 'shipped' },
    { label: '已完成', value: 'completed' },
    { label: '已取消', value: 'cancelled' },
    { label: '已退款', value: 'refunded' }
]

const pagination = reactive({
    currentPage: 1,
    pageSize: 20,
    total: 0
})

const tableData = ref<OrderItemRow[]>([])
const loading = ref(false)

const detailDialogVisible = ref(false)
const currentOrder = ref<OrderItemRow | null>(null)

const shipDialogVisible = ref(false)
const shipFormRef = ref<FormInstance>()
const shipForm = reactive({ orderNo: '', shipNo: '' })
const shipRules: FormRules = {
    shipNo: [{ required: true, message: '请输入物流单号', trigger: 'blur' }]
}

const getStatusType = (status: string): TagProps['type'] => {
    const statusMap: Record<string, string> = {
        pending_payment: 'warning',
        paid: 'info',
        shipped: 'primary',
        completed: 'success',
        cancelled: 'danger',
        refunded: 'danger'
    }
    return (statusMap[status] as TagProps['type']) || 'info'
}

const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
        pending_payment: '待付款',
        paid: '已付款',
        shipped: '已发货',
        completed: '已完成',
        cancelled: '已取消',
        refunded: '已退款'
    }
    return statusMap[status] || status
}

const loadData = async () => {
    loading.value = true
    try {
        const res = await getOrderListApi({
            orderNo: searchForm.orderNo || undefined,
            username: searchForm.username || undefined,
            orderStatus: searchForm.orderStatus || undefined,
            pageNum: pagination.currentPage,
            pageSize: pagination.pageSize
        })
        if (res.code === 0) {
            tableData.value = res.result.data
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
    Object.assign(searchForm, { orderNo: '', username: '', orderStatus: '' })
    handleSearch()
}

const handleViewDetail = (row: OrderItemRow) => {
    currentOrder.value = row
    detailDialogVisible.value = true
}

const handleCloseDetail = () => {
    detailDialogVisible.value = false
    currentOrder.value = null
}

const handleShip = (row: OrderItemRow) => {
    shipForm.orderNo = row.orderNo
    shipForm.shipNo = ''
    shipDialogVisible.value = true
}

const handleShipConfirm = async () => {
    await shipFormRef.value?.validate()
    const res = await shipOrderApi(shipForm.orderNo, shipForm.shipNo)
    if (res.code === 0) {
        ElMessage.success(res.msg)
        shipDialogVisible.value = false
        loadData()
    } else {
        ElMessage.error(res.msg)
    }
}

const handleDropdownCommand = (command: string, row: OrderItemRow) => {
    const actions: Record<string, { text: string; status: string }> = {
        complete: {
            text: '确定要将该订单标记为已完成吗？',
            status: 'completed'
        },
        cancel: { text: '确定要取消该订单吗？', status: 'cancelled' },
        refund: { text: '确定要对该订单执行退款吗？', status: 'refunded' }
    }
    if (command === 'delete') {
        ElMessageBox.confirm('确定要删除该订单吗？', '删除订单', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        })
            .then(async () => {
                const res = await deleteOrderApi(row.orderNo)
                if (res.code === 0) {
                    ElMessage.success(res.msg)
                    loadData()
                } else {
                    ElMessage.error(res.msg)
                }
            })
            .catch(() => {})
        return
    }
    const action = actions[command]
    if (!action) return
    ElMessageBox.confirm(action.text, '状态变更', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    })
        .then(async () => {
            const res = await changeOrderStatusApi(row.orderNo, action.status)
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
.order-list-container {
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

.search-card,
.table-card {
    margin-bottom: 20px;
    border: none;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.search-form {
    margin: 0;
}

.product-info {
    max-height: 80px;
    overflow-y: auto;
}

.product-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
    font-size: 12px;
}

.product-name {
    font-weight: 500;
    color: #303133;
}

.product-spec {
    color: #909399;
}

.product-quantity {
    color: #409eff;
    font-weight: 500;
}

.amount-text {
    font-weight: 600;
    color: #f56c6c;
}

.pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
}

.order-detail {
    max-height: 600px;
    overflow-y: auto;
}

.product-detail-section {
    margin-top: 20px;
}

.product-detail-section h4 {
    margin: 0 0 15px 0;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}
</style>
