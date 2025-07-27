<template>
    <div class="order-list-container">
        <!-- 页面标题 -->
        <div class="page-header">
            <h1 class="page-title">订单管理</h1>
            <p class="page-subtitle">管理和查看所有订单信息</p>
        </div>

        <!-- 搜索和筛选区域 -->
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
                <el-form-item label="客户名称">
                    <el-input
                        v-model="searchForm.customerName"
                        placeholder="请输入客户名称"
                        clearable
                        style="width: 200px"
                    />
                </el-form-item>
                <el-form-item label="订单状态">
                    <el-select
                        v-model="searchForm.status"
                        placeholder="请选择状态"
                        clearable
                        style="width: 150px"
                    >
                        <el-option label="全部" value="" />
                        <el-option label="待付款" value="pending" />
                        <el-option label="已付款" value="paid" />
                        <el-option label="已发货" value="shipped" />
                        <el-option label="已完成" value="completed" />
                        <el-option label="已取消" value="cancelled" />
                    </el-select>
                </el-form-item>
                <el-form-item label="创建时间">
                    <el-date-picker
                        v-model="searchForm.dateRange"
                        type="daterange"
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                        format="YYYY-MM-DD"
                        value-format="YYYY-MM-DD"
                        style="width: 240px"
                    />
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

        <!-- 操作按钮区域 -->
        <el-card class="action-card" shadow="never">
            <div class="action-bar">
                <div class="action-left">
                    <el-button type="primary" @click="handleAdd" :icon="Plus">
                        新增订单
                    </el-button>
                    <el-button
                        type="success"
                        @click="handleBatchExport"
                        :icon="Download"
                    >
                        批量导出
                    </el-button>
                    <el-button
                        type="danger"
                        @click="handleBatchDelete"
                        :disabled="!selectedOrders.length"
                        :icon="Delete"
                    >
                        批量删除
                    </el-button>
                </div>
                <div class="action-right">
                    <el-tooltip content="刷新数据" placement="top">
                        <el-button
                            circle
                            @click="handleRefresh"
                            :icon="Refresh"
                        />
                    </el-tooltip>
                </div>
            </div>
        </el-card>

        <!-- 数据表格 -->
        <el-card class="table-card" shadow="never">
            <el-table
                v-loading="loading"
                :data="tableData"
                style="width: 100%"
                stripe
                @selection-change="handleSelectionChange"
                @sort-change="handleSortChange"
            >
                <el-table-column type="selection" width="55" />
                <el-table-column
                    prop="orderNo"
                    label="订单号"
                    width="160"
                    sortable="custom"
                >
                    <template #default="scope">
                        <el-link
                            type="primary"
                            @click="handleViewDetail(scope.row)"
                        >
                            {{ scope.row.orderNo }}
                        </el-link>
                    </template>
                </el-table-column>
                <el-table-column
                    prop="customerName"
                    label="客户名称"
                    width="120"
                />
                <el-table-column
                    prop="customerPhone"
                    label="联系电话"
                    width="130"
                />
                <el-table-column
                    prop="products"
                    label="商品信息"
                    min-width="200"
                >
                    <template #default="scope">
                        <div class="product-info">
                            <div
                                v-for="(product, index) in scope.row.products"
                                :key="index"
                                class="product-item"
                            >
                                <span class="product-name">{{
                                    product.name
                                }}</span>
                                <span class="product-spec">{{
                                    product.spec
                                }}</span>
                                <span class="product-quantity"
                                    >×{{ product.quantity }}</span
                                >
                            </div>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column
                    prop="totalAmount"
                    label="订单金额"
                    width="120"
                    sortable="custom"
                >
                    <template #default="scope">
                        <span class="amount-text"
                            >¥{{ scope.row.totalAmount.toLocaleString() }}</span
                        >
                    </template>
                </el-table-column>
                <el-table-column prop="status" label="订单状态" width="100">
                    <template #default="scope">
                        <el-tag
                            :type="getStatusType(scope.row.status)"
                            size="small"
                        >
                            {{ getStatusText(scope.row.status) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column
                    prop="paymentMethod"
                    label="支付方式"
                    width="100"
                />
                <el-table-column
                    prop="createTime"
                    label="创建时间"
                    width="160"
                    sortable="custom"
                />
                <el-table-column label="操作" width="200" fixed="right">
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
                            @click="handleEdit(scope.row)"
                            :icon="Edit"
                            v-if="scope.row.status === 'pending'"
                        >
                            编辑
                        </el-button>
                        <el-dropdown
                            @command="
                                (command: any) =>
                                    handleDropdownCommand(command, scope.row)
                            "
                        >
                            <el-button type="text" size="small">
                                更多<el-icon class="el-icon--right"
                                    ><arrow-down
                                /></el-icon>
                            </el-button>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        command="ship"
                                        v-if="scope.row.status === 'paid'"
                                    >
                                        发货
                                    </el-dropdown-item>
                                    <el-dropdown-item
                                        command="complete"
                                        v-if="scope.row.status === 'shipped'"
                                    >
                                        完成订单
                                    </el-dropdown-item>
                                    <el-dropdown-item
                                        command="cancel"
                                        v-if="
                                            ['pending', 'paid'].includes(
                                                scope.row.status
                                            )
                                        "
                                    >
                                        取消订单
                                    </el-dropdown-item>
                                    <el-dropdown-item command="delete" divided>
                                        删除
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页 -->
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

        <!-- 订单详情弹窗 -->
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
                        <el-tag :type="getStatusType(currentOrder.status)">
                            {{ getStatusText(currentOrder.status) }}
                        </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="客户名称">{{
                        currentOrder.customerName
                    }}</el-descriptions-item>
                    <el-descriptions-item label="联系电话">{{
                        currentOrder.customerPhone
                    }}</el-descriptions-item>
                    <el-descriptions-item label="收货地址" :span="2">{{
                        currentOrder.address
                    }}</el-descriptions-item>
                    <el-descriptions-item label="支付方式">{{
                        currentOrder.paymentMethod
                    }}</el-descriptions-item>
                    <el-descriptions-item label="订单金额">
                        <span class="amount-text"
                            >¥{{
                                currentOrder.totalAmount.toLocaleString()
                            }}</span
                        >
                    </el-descriptions-item>
                    <el-descriptions-item label="创建时间">{{
                        currentOrder.createTime
                    }}</el-descriptions-item>
                    <el-descriptions-item label="备注" :span="2">{{
                        currentOrder.remark || '无'
                    }}</el-descriptions-item>
                </el-descriptions>

                <div class="product-detail-section">
                    <h4>商品详情</h4>
                    <el-table :data="currentOrder.products" style="width: 100%">
                        <el-table-column prop="name" label="商品名称" />
                        <el-table-column prop="spec" label="规格" />
                        <el-table-column prop="price" label="单价">
                            <template #default="scope">
                                ¥{{ scope.row.price.toLocaleString() }}
                            </template>
                        </el-table-column>
                        <el-table-column prop="quantity" label="数量" />
                        <el-table-column label="小计">
                            <template #default="scope">
                                ¥{{
                                    (
                                        scope.row.price * scope.row.quantity
                                    ).toLocaleString()
                                }}
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
                    <el-button type="primary" @click="handlePrint"
                        >打印订单</el-button
                    >
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
    Search,
    Refresh,
    Plus,
    Download,
    Delete,
    View,
    Edit,
    ArrowDown
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { TagProps } from 'element-plus'
interface SearchForm {
    orderNo: string
    customerName: string
    status: string
    dateRange: [Date, Date]
}
// 搜索表单
const searchForm = reactive<SearchForm>({
    orderNo: '',
    customerName: '',
    status: '',
    dateRange: [new Date(), new Date()]
})

// 分页信息
const pagination = reactive({
    currentPage: 1,
    pageSize: 20,
    total: 0
})

// 表格数据
const tableData = ref<any[]>([])
const loading = ref(false)
const selectedOrders = ref<any[]>([])

// 弹窗相关
const detailDialogVisible = ref(false)
const currentOrder = ref<any>(null)

// 模拟数据
const mockData = [
    {
        id: 1,
        orderNo: 'ORD202401150001',
        customerName: '张三',
        customerPhone: '13800138001',
        address: '北京市朝阳区xxx街道xxx号',
        products: [
            {
                name: 'iPhone 14 Pro',
                spec: '256GB 深空黑',
                price: 8999,
                quantity: 1
            },
            { name: 'AirPods Pro', spec: '第二代', price: 1999, quantity: 1 }
        ],
        totalAmount: 10998,
        status: 'completed',
        paymentMethod: '微信支付',
        createTime: '2024-01-15 10:30:00',
        remark: '请尽快发货'
    },
    {
        id: 2,
        orderNo: 'ORD202401150002',
        customerName: '李四',
        customerPhone: '13800138002',
        address: '上海市浦东新区xxx路xxx号',
        products: [
            {
                name: 'MacBook Air',
                spec: 'M2 8GB 256GB',
                price: 12999,
                quantity: 1
            }
        ],
        totalAmount: 12999,
        status: 'shipped',
        paymentMethod: '支付宝',
        createTime: '2024-01-15 09:15:00',
        remark: ''
    },
    {
        id: 3,
        orderNo: 'ORD202401150003',
        customerName: '王五',
        customerPhone: '13800138003',
        address: '广州市天河区xxx大道xxx号',
        products: [
            {
                name: 'iPad Pro',
                spec: '11英寸 128GB',
                price: 6999,
                quantity: 1
            },
            { name: 'Apple Pencil', spec: '第二代', price: 999, quantity: 1 }
        ],
        totalAmount: 7998,
        status: 'paid',
        paymentMethod: '银行卡',
        createTime: '2024-01-15 08:45:00',
        remark: '工作日配送'
    },
    {
        id: 4,
        orderNo: 'ORD202401150004',
        customerName: '赵六',
        customerPhone: '13800138004',
        address: '深圳市南山区xxx街xxx号',
        products: [
            {
                name: 'Apple Watch',
                spec: 'Series 9 45mm',
                price: 3999,
                quantity: 1
            }
        ],
        totalAmount: 3999,
        status: 'pending',
        paymentMethod: '待支付',
        createTime: '2024-01-14 16:20:00',
        remark: ''
    },
    {
        id: 5,
        orderNo: 'ORD202401150005',
        customerName: '钱七',
        customerPhone: '13800138005',
        address: '杭州市西湖区xxx路xxx号',
        products: [
            {
                name: 'Mac Studio',
                spec: 'M2 Max 32GB 512GB',
                price: 18999,
                quantity: 1
            }
        ],
        totalAmount: 18999,
        status: 'cancelled',
        paymentMethod: '已取消',
        createTime: '2024-01-14 14:10:00',
        remark: '客户取消订单'
    }
]

// 获取状态类型
const getStatusType = (status: string): TagProps['type'] => {
    const statusMap: Record<string, string> = {
        pending: 'warning',
        paid: 'info',
        shipped: 'primary',
        completed: 'success',
        cancelled: 'danger'
    }
    return (statusMap[status] as TagProps['type']) || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
        pending: '待付款',
        paid: '已付款',
        shipped: '已发货',
        completed: '已完成',
        cancelled: '已取消'
    }
    return statusMap[status] || status
}

// 搜索
const handleSearch = () => {
    loading.value = true
    // 模拟API调用
    setTimeout(() => {
        loadData()
        loading.value = false
        ElMessage.success('搜索完成')
    }, 1000)
}

// 重置
const handleReset = () => {
    Object.assign(searchForm, {
        orderNo: '',
        customerName: '',
        status: '',
        dateRange: []
    })
    handleSearch()
}

// 加载数据
const loadData = () => {
    // 模拟筛选逻辑
    let filteredData = [...mockData]

    if (searchForm.orderNo) {
        filteredData = filteredData.filter((item) =>
            item.orderNo.includes(searchForm.orderNo)
        )
    }

    if (searchForm.customerName) {
        filteredData = filteredData.filter((item) =>
            item.customerName.includes(searchForm.customerName)
        )
    }

    if (searchForm.status) {
        filteredData = filteredData.filter(
            (item) => item.status === searchForm.status
        )
    }

    tableData.value = filteredData
    pagination.total = filteredData.length
}

// 新增订单
const handleAdd = () => {
    ElMessage.info('新增订单功能开发中...')
}

// 批量导出
const handleBatchExport = () => {
    ElMessage.info('批量导出功能开发中...')
}

// 批量删除
const handleBatchDelete = () => {
    ElMessageBox.confirm(
        `确定要删除选中的 ${selectedOrders.value.length} 个订单吗？`,
        '批量删除',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }
    ).then(() => {
        ElMessage.success('删除成功')
        selectedOrders.value = []
        loadData()
    })
}

// 刷新
const handleRefresh = () => {
    loadData()
    ElMessage.success('数据已刷新')
}

// 选择变化
const handleSelectionChange = (selection: any[]) => {
    selectedOrders.value = selection
}

// 排序变化
const handleSortChange = ({ column, prop, order }: any) => {
    console.log('排序变化:', { column, prop, order })
    // 实现排序逻辑
}

// 查看详情
const handleViewDetail = (row: any) => {
    currentOrder.value = row
    detailDialogVisible.value = true
}

// 编辑订单
const handleEdit = (row: any) => {
    ElMessage.info('编辑订单功能开发中...')
}

// 下拉菜单命令
const handleDropdownCommand = (command: string, row: any) => {
    switch (command) {
        case 'ship':
            ElMessage.success('订单已发货')
            row.status = 'shipped'
            break
        case 'complete':
            ElMessage.success('订单已完成')
            row.status = 'completed'
            break
        case 'cancel':
            ElMessageBox.confirm('确定要取消这个订单吗？', '取消订单', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                ElMessage.success('订单已取消')
                row.status = 'cancelled'
            })
            break
        case 'delete':
            ElMessageBox.confirm('确定要删除这个订单吗？', '删除订单', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                ElMessage.success('订单已删除')
                loadData()
            })
            break
    }
}

// 关闭详情弹窗
const handleCloseDetail = () => {
    detailDialogVisible.value = false
    currentOrder.value = null
}

// 打印订单
const handlePrint = () => {
    ElMessage.info('打印功能开发中...')
}

// 分页大小变化
const handleSizeChange = (size: number) => {
    pagination.pageSize = size
    loadData()
}

// 当前页变化
const handleCurrentChange = (page: number) => {
    pagination.currentPage = page
    loadData()
}

// 组件挂载
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
.action-card,
.table-card {
    margin-bottom: 20px;
    border: none;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.search-form {
    margin: 0;
}

.action-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.action-left {
    display: flex;
    gap: 10px;
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

@media (max-width: 768px) {
    .order-list-container {
        padding: 15px;
    }

    .search-form {
        display: block;
    }

    .search-form .el-form-item {
        display: block;
        margin-bottom: 15px;
    }

    .action-bar {
        flex-direction: column;
        gap: 15px;
        align-items: stretch;
    }

    .action-left {
        flex-wrap: wrap;
    }
}
</style>
