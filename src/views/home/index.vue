<template>
    <div class="dashboard-container">
        <div class="page-header">
            <h1 class="page-title">数据仪表板</h1>
            <p class="page-subtitle">实时监控系统运行状态和业务数据</p>
        </div>

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
                    </div>
                </div>
            </el-card>
        </div>

        <div class="charts-grid">
            <el-card class="chart-card">
                <template #header>
                    <div class="card-header">
                        <span>近 7 天销售趋势</span>
                    </div>
                </template>
                <div class="chart-container">
                    <div ref="trendChart" class="chart"></div>
                </div>
            </el-card>

            <el-card class="chart-card">
                <template #header>
                    <div class="card-header">
                        <span>订单状态分布</span>
                    </div>
                </template>
                <div class="chart-container">
                    <div ref="statusChart" class="chart"></div>
                </div>
            </el-card>

            <el-card class="chart-card">
                <template #header>
                    <div class="card-header">
                        <span>商品分类分布</span>
                    </div>
                </template>
                <div class="chart-container">
                    <div ref="categoryChart" class="chart"></div>
                </div>
            </el-card>

            <el-card class="chart-card">
                <template #header>
                    <div class="card-header">
                        <span>热销商品 TOP5</span>
                    </div>
                </template>
                <div class="chart-container">
                    <div ref="topChart" class="chart"></div>
                </div>
            </el-card>
        </div>

        <el-card class="table-card">
            <template #header>
                <div class="card-header">
                    <span>最新订单</span>
                    <el-button
                        type="text"
                        size="small"
                        @click="$router.push('/order/list')"
                    >
                        查看全部
                    </el-button>
                </div>
            </template>
            <el-table :data="recentOrders" style="width: 100%" stripe>
                <el-table-column prop="orderNo" label="订单号" width="180" />
                <el-table-column prop="username" label="用户" width="120" />
                <el-table-column prop="totalAmount" label="金额" width="130">
                    <template #default="scope">
                        <span class="amount"
                            >¥{{ Number(scope.row.totalAmount).toFixed(2) }}</span
                        >
                    </template>
                </el-table-column>
                <el-table-column prop="orderStatus" label="状态" width="110">
                    <template #default="scope">
                        <el-tag
                            :type="getStatusType(scope.row.orderStatus)"
                            size="small"
                        >
                            {{ getStatusText(scope.row.orderStatus) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="createTime" label="下单时间" />
            </el-table>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import {
    Money,
    ShoppingCart,
    TrendCharts,
    Box,
    User,
    Van,
    ChatDotRound
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import type { TagProps } from 'element-plus'
import { getDashboardStatsApi } from '@/api/dashboard'

const statsData = ref<{ title: string; value: string; color: string; icon: any }[]>([])

const recentOrders = ref<any[]>([])

const trendChart = ref()
const statusChart = ref()
const categoryChart = ref()
const topChart = ref()

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

const initTrendChart = (amounts: number[], days: string[]) => {
    const chart = echarts.init(trendChart.value)
    chart.setOption({
        tooltip: { trigger: 'axis' },
        grid: { left: 50, right: 20, top: 30, bottom: 30 },
        xAxis: { type: 'category', data: days, boundaryGap: false },
        yAxis: { type: 'value' },
        series: [
            {
                name: '销售额',
                type: 'line',
                smooth: true,
                data: amounts,
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
                        { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
                    ])
                },
                lineStyle: { color: '#409EFF' },
                itemStyle: { color: '#409EFF' }
            }
        ]
    })
}

const initStatusChart = (data: { name: string; value: number }[]) => {
    const chart = echarts.init(statusChart.value)
    chart.setOption({
        tooltip: { trigger: 'item', formatter: '{b}: {c} 单 ({d}%)' },
        legend: { bottom: 0, icon: 'circle' },
        series: [
            {
                name: '订单状态',
                type: 'pie',
                radius: ['40%', '65%'],
                center: ['50%', '45%'],
                avoidLabelOverlap: false,
                itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
                label: { show: false },
                emphasis: {
                    label: { show: true, fontSize: 16, fontWeight: 'bold' }
                },
                data
            }
        ]
    })
}

const initCategoryChart = (data: { name: string; cnt: string | number }[]) => {
    const chart = echarts.init(categoryChart.value)
    chart.setOption({
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: 70, right: 30, top: 20, bottom: 30 },
        xAxis: { type: 'value' },
        yAxis: { type: 'category', data: data.map((d) => d.name) },
        series: [
            {
                name: '商品数',
                type: 'bar',
                data: data.map((d) => Number(d.cnt)),
                barWidth: 18,
                itemStyle: {
                    borderRadius: [0, 4, 4, 0],
                    color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                        { offset: 0, color: '#67C23A' },
                        { offset: 1, color: '#a8e063' }
                    ])
                }
            }
        ]
    })
}

const initTopChart = (data: { name: string; qty: string | number }[]) => {
    const chart = echarts.init(topChart.value)
    const names = [...data].map((d) => d.name).reverse()
    const qtys = [...data].map((d) => Number(d.qty)).reverse()
    chart.setOption({
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: 90, right: 30, top: 20, bottom: 30 },
        xAxis: { type: 'value' },
        yAxis: { type: 'category', data: names },
        series: [
            {
                name: '销量',
                type: 'bar',
                data: qtys,
                barWidth: 18,
                itemStyle: {
                    borderRadius: [0, 4, 4, 0],
                    color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                        { offset: 0, color: '#E6A23C' },
                        { offset: 1, color: '#f8d186' }
                    ])
                }
            }
        ]
    })
}

const loadData = async () => {
    const res = await getDashboardStatsApi()
    if (res.code !== 0) return
    const r = res.result
    statsData.value = [
        {
            title: '今日销售额',
            value: `¥${Number(r.todaySales).toFixed(2)}`,
            color: '#F56C6C',
            icon: Money
        },
        {
            title: '今日订单',
            value: `${r.todayOrders} 单`,
            color: '#67C23A',
            icon: ShoppingCart
        },
        {
            title: '累计销售额',
            value: `¥${Number(r.totalSales).toFixed(2)}`,
            color: '#E6A23C',
            icon: TrendCharts
        },
        {
            title: '总订单数',
            value: `${r.totalOrders} 单`,
            color: '#409EFF',
            icon: Box
        },
        {
            title: '待发货',
            value: `${r.toShipOrders} 单`,
            color: '#F56C6C',
            icon: Van
        },
        {
            title: '注册用户',
            value: `${r.userCount} 人`,
            color: '#909399',
            icon: User
        },
        {
            title: '在售商品',
            value: `${r.productCount} 个`,
            color: '#67C23A',
            icon: Box
        },
        {
            title: '待回复评论',
            value: `${r.replyPending} 条`,
            color: '#E6A23C',
            icon: ChatDotRound
        }
    ]
    recentOrders.value = r.recentOrders
    nextTick(() => {
        initTrendChart(r.trend.amounts, r.trend.days)
        initStatusChart(r.statusDist)
        initCategoryChart(r.categoryDist)
        initTopChart(r.topProducts)
    })
}

onMounted(() => {
    loadData()
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
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
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
    width: 52px;
    height: 52px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
    color: white;
    flex-shrink: 0;
}

.stat-info {
    flex: 1;
    min-width: 0;
}

.stat-value {
    font-size: 24px;
    font-weight: 700;
    color: #303133;
    margin: 0 0 5px 0;
    line-height: 1;
    white-space: nowrap;
}

.stat-title {
    font-size: 14px;
    color: #606266;
    margin: 0;
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

.amount {
    font-weight: 600;
    color: #67c23a;
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
        font-size: 20px;
    }
}
</style>