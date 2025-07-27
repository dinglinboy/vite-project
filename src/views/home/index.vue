<template>
    <div class="dashboard-container">
        <!-- 页面标题 -->
        <div class="page-header">
            <h1 class="page-title">数据仪表板</h1>
            <p class="page-subtitle">实时监控系统运行状态和业务数据</p>
        </div>

        <!-- 统计卡片区域 -->
        <div class="stats-grid">
            <el-card
                class="stat-card"
                v-for="stat in statsData"
                :key="stat.title"
            >
                <div class="stat-content">
                    <div
                        class="stat-icon"
                        :style="{ backgroundColor: stat.color }"
                    >
                        <el-icon :size="24">
                            <component :is="stat.icon" />
                        </el-icon>
                    </div>
                    <div class="stat-info">
                        <h3 class="stat-value">{{ stat.value }}</h3>
                        <p class="stat-title">{{ stat.title }}</p>
                        <div
                            class="stat-trend"
                            :class="stat.trend > 0 ? 'positive' : 'negative'"
                        >
                            <el-icon :size="12">
                                <ArrowUp v-if="stat.trend > 0" />
                                <ArrowDown v-else />
                            </el-icon>
                            <span>{{ Math.abs(stat.trend) }}%</span>
                        </div>
                    </div>
                </div>
            </el-card>
        </div>

        <!-- 图表和数据区域 -->
        <div class="charts-grid">
            <!-- 用户增长趋势 -->
            <el-card class="chart-card">
                <template #header>
                    <div class="card-header">
                        <span>用户增长趋势</span>
                        <el-button type="text" size="small">查看详情</el-button>
                    </div>
                </template>
                <div class="chart-container">
                    <div ref="userGrowthChart" class="chart"></div>
                </div>
            </el-card>

            <!-- 销售数据分析 -->
            <el-card class="chart-card">
                <template #header>
                    <div class="card-header">
                        <span>销售数据分析</span>
                        <el-button type="text" size="small">查看详情</el-button>
                    </div>
                </template>
                <div class="chart-container">
                    <div ref="salesChart" class="chart"></div>
                </div>
            </el-card>
        </div>

        <!-- 数据表格区域 -->
        <el-card class="table-card">
            <template #header>
                <div class="card-header">
                    <span>最新订单</span>
                    <div class="header-actions">
                        <el-input
                            v-model="searchText"
                            placeholder="搜索订单"
                            size="small"
                            style="width: 200px; margin-right: 10px"
                        >
                            <template #prefix>
                                <el-icon><Search /></el-icon>
                            </template>
                        </el-input>
                        <el-button type="primary" size="small"
                            >导出数据</el-button
                        >
                    </div>
                </div>
            </template>
            <el-table :data="filteredTableData" style="width: 100%" stripe>
                <el-table-column prop="id" label="订单ID" width="120" />
                <el-table-column prop="customer" label="客户名称" width="150" />
                <el-table-column prop="product" label="产品" width="200" />
                <el-table-column prop="amount" label="金额" width="120">
                    <template #default="scope">
                        <span class="amount"
                            >¥{{ scope.row.amount.toLocaleString() }}</span
                        >
                    </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                    <template #default="scope">
                        <el-tag
                            :type="getStatusType(scope.row.status)"
                            size="small"
                        >
                            {{ scope.row.status }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="date" label="创建时间" width="180" />
                <el-table-column label="操作" width="150">
                    <template #default="scope">
                        <el-button
                            type="text"
                            size="small"
                            @click="viewOrder(scope.row)"
                            >查看</el-button
                        >
                        <el-button
                            type="text"
                            size="small"
                            @click="editOrder(scope.row)"
                            >编辑</el-button
                        >
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination-container">
                <el-pagination
                    v-model:current-page="currentPage"
                    v-model:page-size="pageSize"
                    :page-sizes="[10, 20, 50, 100]"
                    :total="totalItems"
                    layout="total, sizes, prev, pager, next, jumper"
                />
            </div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue'
import {
    User,
    ShoppingCart,
    TrendCharts,
    Money,
    ArrowUp,
    ArrowDown,
    Search
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'

// 统计数据
const statsData = ref([
    {
        title: '总用户数',
        value: '12,345',
        trend: 12.5,
        color: '#409EFF',
        icon: User
    },
    {
        title: '今日订单',
        value: '1,234',
        trend: 8.2,
        color: '#67C23A',
        icon: ShoppingCart
    },
    {
        title: '总收入',
        value: '¥98,765',
        trend: -2.1,
        color: '#E6A23C',
        icon: Money
    },
    {
        title: '转化率',
        value: '3.45%',
        trend: 5.8,
        color: '#F56C6C',
        icon: TrendCharts
    }
])

// 表格数据
const tableData = ref([
    {
        id: 'ORD001',
        customer: '张三',
        product: 'iPhone 14 Pro',
        amount: 8999,
        status: '已完成',
        date: '2024-01-15 10:30:00'
    },
    {
        id: 'ORD002',
        customer: '李四',
        product: 'MacBook Air',
        amount: 12999,
        status: '处理中',
        date: '2024-01-15 09:15:00'
    },
    {
        id: 'ORD003',
        customer: '王五',
        product: 'iPad Pro',
        amount: 6999,
        status: '已发货',
        date: '2024-01-15 08:45:00'
    },
    {
        id: 'ORD004',
        customer: '赵六',
        product: 'AirPods Pro',
        amount: 1999,
        status: '已完成',
        date: '2024-01-14 16:20:00'
    },
    {
        id: 'ORD005',
        customer: '钱七',
        product: 'Apple Watch',
        amount: 3999,
        status: '已取消',
        date: '2024-01-14 14:10:00'
    }
])

// 搜索和分页
const searchText = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalItems = ref(100)

// 图表引用
const userGrowthChart = ref()
const salesChart = ref()

// 过滤后的表格数据
const filteredTableData = computed(() => {
    if (!searchText.value) return tableData.value
    return tableData.value.filter(
        (item) =>
            item.customer.includes(searchText.value) ||
            item.product.includes(searchText.value) ||
            item.id.includes(searchText.value)
    )
})

type TagType = 'success' | 'warning' | 'info' | 'danger'
// 获取状态类型
const getStatusType = (status: string): TagType => {
    const statusMap: Record<string, string> = {
        已完成: 'success',
        处理中: 'warning',
        已发货: 'info',
        已取消: 'danger'
    }
    return (statusMap[status] as TagType) || 'info'
}

// 查看订单
const viewOrder = (row: any) => {
    console.log('查看订单:', row)
}

// 编辑订单
const editOrder = (row: any) => {
    console.log('编辑订单:', row)
}

// 初始化用户增长图表
const initUserGrowthChart = () => {
    const chart = echarts.init(userGrowthChart.value)
    const option = {
        title: {
            text: '近30天用户增长',
            textStyle: {
                fontSize: 14,
                color: '#333'
            }
        },
        tooltip: {
            trigger: 'axis'
        },
        xAxis: {
            type: 'category',
            data: [
                '1月1日',
                '1月5日',
                '1月10日',
                '1月15日',
                '1月20日',
                '1月25日',
                '1月30日'
            ]
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                data: [120, 200, 150, 80, 70, 110, 130],
                type: 'line',
                smooth: true,
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                            offset: 0,
                            color: 'rgba(64, 158, 255, 0.3)'
                        },
                        {
                            offset: 1,
                            color: 'rgba(64, 158, 255, 0.1)'
                        }
                    ])
                },
                lineStyle: {
                    color: '#409EFF'
                },
                itemStyle: {
                    color: '#409EFF'
                }
            }
        ]
    }
    chart.setOption(option)
}

// 初始化销售图表
const initSalesChart = () => {
    const chart = echarts.init(salesChart.value)
    const option = {
        title: {
            text: '产品销售占比',
            textStyle: {
                fontSize: 14,
                color: '#333'
            }
        },
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        series: [
            {
                name: '销售占比',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: '18',
                        fontWeight: 'bold'
                    }
                },
                labelLine: {
                    show: false
                },
                data: [
                    { value: 335, name: 'iPhone' },
                    { value: 310, name: 'MacBook' },
                    { value: 234, name: 'iPad' },
                    { value: 135, name: 'AirPods' },
                    { value: 148, name: 'Apple Watch' }
                ]
            }
        ]
    }
    chart.setOption(option)
}

// 组件挂载后初始化图表
onMounted(() => {
    nextTick(() => {
        initUserGrowthChart()
        initSalesChart()
    })
})
</script>

<style scoped>
.dashboard-container {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: 100vh;
}

.page-header {
    margin-bottom: 30px;
}

.page-title {
    font-size: 28px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 8px 0;
}

.page-subtitle {
    font-size: 14px;
    color: #909399;
    margin: 0;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.stat-card {
    border: none;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.stat-content {
    display: flex;
    align-items: center;
    padding: 10px 0;
}

.stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20px;
    color: white;
}

.stat-info {
    flex: 1;
}

.stat-value {
    font-size: 32px;
    font-weight: 700;
    color: #303133;
    margin: 0 0 5px 0;
    line-height: 1;
}

.stat-title {
    font-size: 14px;
    color: #606266;
    margin: 0 0 8px 0;
}

.stat-trend {
    display: flex;
    align-items: center;
    font-size: 12px;
    font-weight: 500;
}

.stat-trend.positive {
    color: #67c23a;
}

.stat-trend.negative {
    color: #f56c6c;
}

.stat-trend span {
    margin-left: 4px;
}

.charts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.chart-card {
    border: none;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.chart-container {
    height: 300px;
}

.chart {
    width: 100%;
    height: 100%;
}

.table-card {
    border: none;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    color: #303133;
}

.header-actions {
    display: flex;
    align-items: center;
}

.amount {
    font-weight: 600;
    color: #67c23a;
}

.pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
}

@media (max-width: 768px) {
    .dashboard-container {
        padding: 15px;
    }

    .stats-grid {
        grid-template-columns: 1fr;
    }

    .charts-grid {
        grid-template-columns: 1fr;
    }

    .page-title {
        font-size: 24px;
    }

    .stat-value {
        font-size: 28px;
    }
}
</style>
