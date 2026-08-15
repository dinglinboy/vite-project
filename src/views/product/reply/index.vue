<template>
    <el-card class="box-card">
        <template #header>
            <div class="card-header">
                <el-form :model="searchOpt" inline>
                    <el-form-item label="商品名称">
                        <el-input
                            v-model="searchOpt.productName"
                            placeholder="请输入商品名称"
                            clearable
                            @keyup.enter="getReviewList()"
                        ></el-input>
                    </el-form-item>
                    <el-form-item label="评分">
                        <el-select
                            v-model="searchOpt.rating"
                            clearable
                            placeholder="全部"
                            style="width: 100px"
                        >
                            <el-option label="5星" :value="5" />
                            <el-option label="4星" :value="4" />
                            <el-option label="3星" :value="3" />
                            <el-option label="2星" :value="2" />
                            <el-option label="1星" :value="1" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="回复状态">
                        <el-select
                            v-model="searchOpt.replied"
                            clearable
                            placeholder="全部"
                            style="width: 120px"
                        >
                            <el-option label="未回复" value="0" />
                            <el-option label="已回复" value="1" />
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="getReviewList()"
                            >查询</el-button
                        >
                        <el-button @click="resetHandler">重置</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </template>
        <el-table :data="tableData" v-loading="loading">
            <el-table-column prop="product_name" label="商品名称" min-width="180" />
            <el-table-column prop="username" label="用户" width="110" />
            <el-table-column label="评分" width="140">
                <template #default="{ row }">
                    <el-rate
                        :model-value="row.rating"
                        disabled
                        :max="5"
                    ></el-rate>
                </template>
            </el-table-column>
            <el-table-column prop="content" label="评论内容" min-width="240" />
            <el-table-column label="回复状态" width="100">
                <template #default="{ row }">
                    <el-tag :type="row.reply_content ? 'success' : 'info'">
                        {{ row.reply_content ? '已回复' : '未回复' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
                <template #default="{ row }">
                    <el-button
                        v-permission="['product:reply:edit']"
                        type="primary"
                        link
                        @click="openReply(row)"
                        >回复</el-button
                    >
                    <el-button
                        v-permission="['product:reply:remove']"
                        type="danger"
                        link
                        @click="delReview(row)"
                        >删除</el-button
                    >
                </template>
            </el-table-column>
        </el-table>
        <div class="pagination-container">
            <el-pagination
                v-model:current-page="searchOpt.pageNum"
                v-model:page-size="searchOpt.pageSize"
                :page-sizes="[10, 20, 50, 100]"
                :total="total"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="getReviewList"
                @current-change="getReviewList"
            />
        </div>

        <!-- 回复弹窗 -->
        <el-dialog
            v-model="replyVisible"
            title="回复评论"
            width="520px"
            destroy-on-close
        >
            <div class="review-origin">
                <div class="review-user">
                    {{ currentRow?.username }}
                    <el-rate
                        :model-value="currentRow?.rating"
                        disabled
                        :max="5"
                        style="display: inline-block; margin-left: 8px"
                    ></el-rate>
                </div>
                <div class="review-content">{{ currentRow?.content }}</div>
                <div
                    v-if="currentRow?.reply_content"
                    class="review-replied"
                >
                    已回复：{{ currentRow?.reply_content }}
                </div>
            </div>
            <el-input
                v-model="replyContent"
                type="textarea"
                :rows="4"
                maxlength="500"
                placeholder="请输入回复内容"
            ></el-input>
            <template #footer>
                <el-button @click="replyVisible = false">取 消</el-button>
                <el-button
                    type="primary"
                    :loading="replyLoading"
                    @click="submitReply"
                    >确 定</el-button
                >
            </template>
        </el-dialog>
    </el-card>
</template>

<script lang="ts" setup>
import { onMounted, ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getReviewListApi, replyReviewApi, deleteReviewApi } from '@/api/review'
import { ReviewItem } from '@/api/types/response'
import { Result } from '@/interfaces/base.interface'

const loading = ref(false)
const total = ref(0)
const tableData = ref<ReviewItem[]>([])

const searchOpt = reactive({
    productName: '',
    rating: undefined as number | undefined,
    replied: '' as string,
    pageNum: 1,
    pageSize: 10
})

onMounted(() => {
    getReviewList()
})

// 分页查询评论
const getReviewList = async () => {
    loading.value = true
    try {
        const res: Result = await getReviewListApi({
            productName: searchOpt.productName.trim() || undefined,
            rating: searchOpt.rating,
            replied: searchOpt.replied || undefined,
            pageNum: searchOpt.pageNum,
            pageSize: searchOpt.pageSize
        })
        if (res.code !== 0) {
            return ElMessage.error(res.message || res.msg || '查询失败')
        }
        tableData.value = res.result?.data || []
        total.value = res.result?.total || 0
    } catch (error) {
        console.error(error)
    } finally {
        loading.value = false
    }
}

const resetHandler = () => {
    searchOpt.productName = ''
    searchOpt.rating = undefined
    searchOpt.replied = ''
    searchOpt.pageNum = 1
    getReviewList()
}

// ===== 回复 =====
const replyVisible = ref(false)
const replyLoading = ref(false)
const replyContent = ref('')
const currentRow = ref<ReviewItem | null>(null)

const openReply = (row: ReviewItem) => {
    currentRow.value = row
    replyContent.value = row.reply_content || ''
    replyVisible.value = true
}

const submitReply = async () => {
    if (!replyContent.value.trim()) {
        return ElMessage.warning('请输入回复内容')
    }
    if (!currentRow.value) return
    replyLoading.value = true
    try {
        const res = await replyReviewApi(currentRow.value.id, replyContent.value.trim())
        if (res.code !== 0) {
            return ElMessage.error(res.message || res.msg || '回复失败')
        }
        ElMessage.success('回复成功')
        replyVisible.value = false
        getReviewList()
    } catch (error) {
        console.error(error)
        ElMessage.error('回复失败，请稍后再试')
    } finally {
        replyLoading.value = false
    }
}

// ===== 删除 =====
const delReview = async (row: ReviewItem) => {
    try {
        await ElMessageBox.confirm('确定删除该评论吗？删除后不可恢复', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        })
    } catch (error) {
        return
    }
    const res = await deleteReviewApi(row.id)
    if (res.code !== 0) {
        return ElMessage.error(res.message || res.msg || '删除失败')
    }
    ElMessage.success('删除成功')
    getReviewList()
}
</script>
<style lang="scss" scoped>
.pagination-container {
    margin-top: 20px;
    text-align: right;
}

.review-origin {
    margin-bottom: 14px;
    padding: 10px;
    background: #f5f7fa;
    border-radius: 4px;

    .review-user {
        font-size: 13px;
        color: #909399;
        margin-bottom: 6px;
    }

    .review-content {
        font-size: 14px;
        line-height: 1.6;
    }

    .review-replied {
        margin-top: 8px;
        font-size: 13px;
        color: #67c23a;
    }
}
</style>