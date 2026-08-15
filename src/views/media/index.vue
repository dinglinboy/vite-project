<template>
    <div class="media-container">
        <div class="page-header">
            <h1 class="page-title">媒体管理</h1>
            <p class="page-subtitle">图片素材库（上传后可复制链接到商品/品牌等处使用）</p>
        </div>

        <el-card class="toolbar-card" shadow="never">
            <div class="toolbar">
                <el-form :inline="true" class="search-form">
                    <el-form-item label="文件名">
                        <el-input
                            v-model="searchForm.fileName"
                            placeholder="请输入文件名"
                            clearable
                            style="width: 200px"
                        />
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="handleSearch" :icon="Search">
                            搜索
                        </el-button>
                        <el-button @click="handleReset" :icon="Refresh">
                            重置
                        </el-button>
                    </el-form-item>
                </el-form>
                <div>
                    <el-upload
                        :show-file-list="false"
                        :http-request="handleUpload"
                        accept="image/*"
                    >
                        <el-button type="primary" :icon="Upload">上传图片</el-button>
                    </el-upload>
                </div>
            </div>
        </el-card>

        <el-card v-loading="loading" class="grid-card" shadow="never">
            <el-empty v-if="!mediaList.length" description="暂无素材" />
            <div v-else class="media-grid">
                <div v-for="item in mediaList" :key="item.uploadId" class="media-item">
                    <div class="media-thumb">
                        <el-image
                            :src="toViewUrl(item.url)"
                            :preview-src-list="[toViewUrl(item.url)]"
                            preview-teleported
                            fit="cover"
                        />
                        <el-tag v-if="item.ext" class="ext-tag" size="small">
                            {{ item.ext.replace('.', '').toUpperCase() }}
                        </el-tag>
                    </div>
                    <div class="media-info">
                        <el-tooltip :content="item.fileName" placement="top">
                            <p class="media-name">{{ item.fileName }}</p>
                        </el-tooltip>
                        <p class="media-meta">{{ formatSize(item.size) }}</p>
                    </div>
                    <div class="media-actions">
                        <el-button
                            type="text"
                            size="small"
                            :icon="CopyDocument"
                            @click="handleCopy(item)"
                        >
                            复制链接
                        </el-button>
                        <el-button
                            type="text"
                            size="small"
                            :icon="Delete"
                            @click="handleDelete(item)"
                            v-permission="['media:remove']"
                        >
                            删除
                        </el-button>
                    </div>
                </div>
            </div>

            <div class="pagination-container">
                <el-pagination
                    v-model:current-page="pagination.currentPage"
                    v-model:page-size="pagination.pageSize"
                    :page-sizes="[12, 24, 48]"
                    :total="pagination.total"
                    layout="total, sizes, prev, pager, next, jumper"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                />
            </div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, Upload, CopyDocument, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMediaListApi, deleteMediaApi } from '@/api/media'
import axios from '@/util/axios'
import { Result } from '@/interfaces/base.interface'

interface MediaItem {
    uploadId: string
    size: number
    filePath: string
    fileName: string
    url: string
    ext: string
}

const searchForm = reactive({ fileName: '' })

const pagination = reactive({
    currentPage: 1,
    pageSize: 12,
    total: 0
})

const mediaList = ref<MediaItem[]>([])
const loading = ref(false)

const toViewUrl = (url: string) => `/dev${url}`

const formatSize = (size: number) => {
    if (!size) return '-'
    if (size < 1024) return `${size}B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}KB`
    return `${(size / 1024 / 1024).toFixed(2)}MB`
}

const loadData = async () => {
    loading.value = true
    try {
        const res = await getMediaListApi({
            fileName: searchForm.fileName || undefined,
            pageNum: pagination.currentPage,
            pageSize: pagination.pageSize
        })
        if (res.code === 0) {
            mediaList.value = res.result.data
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
    searchForm.fileName = ''
    handleSearch()
}

const handleUpload = async (options: any) => {
    const formData = new FormData()
    formData.append('file', options.file)
    try {
        const res = await axios.post<any, Result>('/common/upload/singleFile', formData)
        if (res.code === 0) {
            ElMessage.success('上传成功')
            handleSearch()
        } else {
            ElMessage.error(res.msg)
        }
    } catch (error) {
        ElMessage.error('上传失败')
    }
}

const handleCopy = async (item: MediaItem) => {
    try {
        await navigator.clipboard.writeText(toViewUrl(item.url))
        ElMessage.success('链接已复制')
    } catch (error) {
        ElMessage.error('复制失败，请手动复制')
    }
}

const handleDelete = (item: MediaItem) => {
    ElMessageBox.confirm(`确定要删除"${item.fileName}"吗？`, '删除素材', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    })
        .then(async () => {
            const res = await deleteMediaApi(item.uploadId)
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
.media-container {
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

.toolbar-card,
.grid-card {
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

.media-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
}

.media-item {
    border: 1px solid #ebeef5;
    border-radius: 6px;
    overflow: hidden;
    background: #fff;
    transition: box-shadow 0.2s;
}

.media-item:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.media-thumb {
    position: relative;
    height: 150px;
    background: #f5f7fa;
}

.media-thumb .el-image {
    width: 100%;
    height: 100%;
    display: block;
}

.ext-tag {
    position: absolute;
    top: 8px;
    right: 8px;
}

.media-info {
    padding: 8px 12px;
}

.media-name {
    margin: 0 0 4px 0;
    font-size: 13px;
    color: #303133;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.media-meta {
    margin: 0;
    font-size: 12px;
    color: #909399;
}

.media-actions {
    display: flex;
    justify-content: space-between;
    padding: 0 8px 8px;
}

.pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
}
</style>