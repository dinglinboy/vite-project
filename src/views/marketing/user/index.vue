<template>
    <div class="mall-user-container">
        <div class="page-header">
            <h1 class="page-title">会员管理</h1>
            <p class="page-subtitle">管理 C 端注册用户：启用/禁用、调整积分与余额</p>
        </div>

        <el-card class="toolbar-card" shadow="never">
            <div class="toolbar">
                <el-form :inline="true" class="search-form">
                    <el-form-item label="用户名">
                        <el-input v-model="searchForm.username" placeholder="用户名" clearable style="width: 150px" @keyup.enter="handleSearch" />
                    </el-form-item>
                    <el-form-item label="昵称">
                        <el-input v-model="searchForm.nickname" placeholder="昵称" clearable style="width: 150px" @keyup.enter="handleSearch" />
                    </el-form-item>
                    <el-form-item label="手机号">
                        <el-input v-model="searchForm.phone" placeholder="手机号" clearable style="width: 150px" @keyup.enter="handleSearch" />
                    </el-form-item>
                    <el-form-item label="状态">
                        <el-select v-model="searchForm.status" clearable placeholder="全部" style="width: 110px">
                            <el-option label="正常" value="0" />
                            <el-option label="禁用" value="1" />
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
                        <el-button :icon="Refresh" @click="handleReset">重置</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </el-card>

        <el-card v-loading="loading" shadow="never">
            <el-table :data="list" stripe>
                <el-table-column prop="id" label="ID" width="60" />
                <el-table-column label="用户" min-width="140">
                    <template #default="{ row }">
                        <div class="user-cell">
                            <el-avatar :size="28" :src="row.avatar" class="user-avatar">{{ (row.nickname || row.username).slice(0, 1) }}</el-avatar>
                            <div>
                                <p class="user-name">{{ row.nickname || '-' }}</p>
                                <p class="user-username">{{ row.username }}</p>
                            </div>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="phone" label="手机号" width="120">
                    <template #default="{ row }">{{ row.phone || '-' }}</template>
                </el-table-column>
                <el-table-column label="会员等级" width="90">
                    <template #default="{ row }">
                        <el-tag size="small" :type="row.memberLevel >= 3 ? 'warning' : row.memberLevel === 2 ? 'success' : 'info'">Lv{{ row.memberLevel }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="balance" label="余额" width="90" align="right">
                    <template #default="{ row }">¥{{ Number(row.balance).toFixed(2) }}</template>
                </el-table-column>
                <el-table-column prop="growth" label="成长值" width="80" align="right" />
                <el-table-column prop="points" label="积分" width="80" align="right" />
                <el-table-column label="状态" width="80">
                    <template #default="{ row }">
                        <el-tag size="small" :type="row.status === '0' ? 'success' : 'danger'">{{ row.status === '0' ? '正常' : '禁用' }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="注册时间" width="150">
                    <template #default="{ row }">{{ fmt(row.createTime) }}</template>
                </el-table-column>
                <el-table-column label="最近登录" width="150">
                    <template #default="{ row }">{{ row.lastLoginTime ? fmt(row.lastLoginTime) : '-' }}</template>
                </el-table-column>
                <el-table-column label="操作" width="200" fixed="right">
                    <template #default="{ row }">
                        <el-button type="text" size="small" v-permission="['mallUser:edit']" @click="toggleStatus(row)">{{ row.status === '0' ? '禁用' : '启用' }}</el-button>
                        <el-button type="text" size="small" v-permission="['mallUser:edit']" @click="openAdjust(row, 'points')">调积分</el-button>
                        <el-button type="text" size="small" v-permission="['mallUser:edit']" @click="openAdjust(row, 'balance')">调余额</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <div class="pagination-container">
                <el-pagination v-model:current-page="pagination.currentPage" v-model:page-size="pagination.pageSize"
                    :page-sizes="[10, 20, 50]" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper"
                    @size-change="handleSizeChange" @current-change="handleCurrentChange" />
            </div>
        </el-card>

        <el-dialog v-model="adjustVisible" :title="adjustType === 'points' ? `调整积分 - ${adjustRow?.nickname || adjustRow?.username}` : `调整余额 - ${adjustRow?.nickname || adjustRow?.username}`" width="420px" :close-on-click-modal="false">
            <el-form label-width="90px">
                <el-form-item :label="adjustType === 'points' ? '积分变动' : '余额变动'">
                    <el-input-number v-model="adjustValue" :min="-999999" :max="999999" :precision="adjustType === 'points' ? 0 : 2" style="width: 200px" />
                    <span class="form-hint">正数增加、负数扣减</span>
                </el-form-item>
                <el-form-item v-if="adjustType === 'points'" label="当前积分">
                    <span class="current-value">{{ adjustRow?.points }}</span>
                </el-form-item>
                <el-form-item v-else label="当前余额">
                    <span class="current-value">¥{{ Number(adjustRow?.balance ?? 0).toFixed(2) }}</span>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="adjustVisible = false">取消</el-button>
                <el-button type="primary" :loading="saving" @click="handleAdjust">确定</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMallUserListApi, updateMallUserStatusApi, updateMallUserPointsApi, updateMallUserBalanceApi, type MallUser } from '@/api/mallUser'

const searchForm = reactive({ username: '', nickname: '', phone: '', status: '' })
const pagination = reactive({ currentPage: 1, pageSize: 10, total: 0 })

const list = ref<MallUser[]>([])
const loading = ref(false)
const adjustVisible = ref(false)
const saving = ref(false)
const adjustType = ref<'points' | 'balance'>('points')
const adjustRow = ref<MallUser | null>(null)
const adjustValue = ref(0)

const fmt = (t: string) => (t ? t.replace('T', ' ').slice(0, 19) : '-')

const loadData = async () => {
    loading.value = true
    try {
        const res = await getMallUserListApi({
            username: searchForm.username || undefined,
            nickname: searchForm.nickname || undefined,
            phone: searchForm.phone || undefined,
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

const handleSearch = () => {
    pagination.currentPage = 1
    loadData()
}

const handleReset = () => {
    searchForm.username = ''
    searchForm.nickname = ''
    searchForm.phone = ''
    searchForm.status = ''
    handleSearch()
}

const toggleStatus = async (row: MallUser) => {
    const target = row.status === '0' ? '1' : '0'
    ElMessageBox.confirm(`确定${target === '1' ? '禁用' : '启用'}用户「${row.username}」吗？`, '状态确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    })
        .then(async () => {
            const res = await updateMallUserStatusApi(row.id, target)
            if (res.code === 0) {
                row.status = target
                ElMessage.success(res.msg)
            } else {
                ElMessage.error(res.msg)
            }
        })
        .catch(() => {})
}

const openAdjust = (row: MallUser, type: 'points' | 'balance') => {
    adjustRow.value = row
    adjustType.value = type
    adjustValue.value = 0
    adjustVisible.value = true
}

const handleAdjust = async () => {
    if (!adjustRow.value || !adjustValue.value) {
        ElMessage.warning('请输入非零变动值')
        return
    }
    saving.value = true
    try {
        const res =
            adjustType.value === 'points'
                ? await updateMallUserPointsApi(adjustRow.value.id, adjustValue.value)
                : await updateMallUserBalanceApi(adjustRow.value.id, adjustValue.value)
        if (res.code === 0) {
            ElMessage.success(res.msg)
            adjustVisible.value = false
            loadData()
        } else {
            ElMessage.error(res.msg)
        }
    } finally {
        saving.value = false
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
.mall-user-container {
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

.pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
}

.user-cell {
    display: flex;
    align-items: center;
    gap: 8px;

    .user-name {
        font-size: 13px;
        font-weight: 600;
        color: #303133;
        margin: 0;
    }

    .user-username {
        font-size: 12px;
        color: #909399;
        margin: 0;
    }
}

.user-avatar {
    flex-shrink: 0;
    background: #2563eb;
    color: #fff;
}

.form-hint {
    margin-left: 10px;
    font-size: 12px;
    color: #909399;
}

.current-value {
    font-size: 14px;
    color: #606266;
}
</style>