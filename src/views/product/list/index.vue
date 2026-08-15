<template>
    <el-card class="box-card">
        <template #header>
            <div class="card-header">
                <el-form :model="searchOpt" inline>
                    <el-form-item label="商品名称">
                        <el-input
                            v-model="searchOpt.name"
                            placeholder="请输入商品名称"
                            clearable
                            @keyup.enter="getProductList()"
                        ></el-input>
                    </el-form-item>
                    <el-form-item label="商品分类">
                        <el-tree-select
                            v-model="searchOpt.categoryId"
                            :data="categoryTree"
                            :props="{
                                label: 'name',
                                value: 'id',
                                children: 'children'
                            }"
                            node-key="id"
                            check-strictly
                            clearable
                            placeholder="请选择分类"
                            style="width: 200px"
                        />
                    </el-form-item>
                    <el-form-item label="状态">
                        <el-select
                            v-model="searchOpt.product_status"
                            clearable
                            placeholder="全部"
                            style="width: 120px"
                        >
                            <el-option label="草稿" value="draft" />
                            <el-option label="已上架" value="published" />
                            <el-option label="已下架" value="archived" />
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="getProductList()"
                            >查询</el-button
                        >
                        <el-button @click="resetHandler">重置</el-button>
                        <el-button
                            v-permission="['product:list:add']"
                            type="primary"
                            @click="goAdd"
                            >新增商品</el-button
                        >
                    </el-form-item>
                </el-form>
            </div>
        </template>
        <el-table :data="tableData" v-loading="loading">
            <el-table-column label="主图" width="90">
                <template #default="{ row }">
                    <el-image
                        v-if="row.images?.length"
                        :src="row.images[0]"
                        :preview-src-list="row.images"
                        fit="cover"
                        style="width: 60px; height: 60px"
                    />
                    <el-empty v-else :image-size="40" description="" />
                </template>
            </el-table-column>
            <el-table-column prop="name" label="商品名称" min-width="200" />
            <el-table-column prop="category.name" label="分类" width="110" />
            <el-table-column prop="brand.name" label="品牌" width="100" />
            <el-table-column label="售价" width="90">
                <template #default="{ row }"
                    >￥{{ Number(row.price) }}</template
                >
            </el-table-column>
            <el-table-column prop="stock" label="库存" width="80" />
            <el-table-column prop="sales_count" label="销量" width="80" />
            <el-table-column label="状态" width="90">
                <template #default="{ row }">
                    <el-tag
                        :type="
                            row.product_status === 'published'
                                ? 'success'
                                : row.product_status === 'draft'
                                ? 'info'
                                : 'danger'
                        "
                        >{{
                            row.product_status === 'published'
                                ? '已上架'
                                : row.product_status === 'draft'
                                ? '草稿'
                                : '已下架'
                        }}</el-tag
                    >
                </template>
            </el-table-column>
            <el-table-column label="操作" width="240" fixed="right">
                <template #default="{ row }">
                    <el-button
                        v-permission="['product:list:edit']"
                        type="primary"
                        link
                        @click="goEdit(row)"
                        >编辑</el-button
                    >
                    <el-button
                        v-permission="['product:list:status']"
                        type="primary"
                        link
                        @click="toggleStatus(row)"
                        >{{
                            row.product_status === 'published' ? '下架' : '上架'
                        }}</el-button
                    >
                    <el-button
                        v-permission="['product:list:remove']"
                        type="danger"
                        link
                        @click="delProduct(row)"
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
                @size-change="getProductList"
                @current-change="getProductList"
            />
        </div>
    </el-card>
</template>

<script lang="ts" setup>
import { onMounted, ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
    getProductListApi,
    deleteProductApi,
    updateProductStatusApi
} from '@/api/product'
import { getCategoryListApi } from '@/api/category'
import { ProductItem } from '@/api/types/response'
import { Result } from '@/interfaces/base.interface'

const router = useRouter()
const loading = ref(false)
const total = ref(0)
const tableData = ref<ProductItem[]>([])
const categoryTree = ref([])

const searchOpt = reactive({
    name: '',
    categoryId: undefined as number | undefined,
    product_status: '' as string,
    pageNum: 1,
    pageSize: 10
})

onMounted(() => {
    getProductList()
    getCategoryTree()
})

// 获取分类树（商品分类选择器用）
const getCategoryTree = async () => {
    const res: Result = await getCategoryListApi()
    if (res.code === 0) {
        categoryTree.value = res.result || []
    }
}

// 分页查询商品
const getProductList = async () => {
    loading.value = true
    try {
        const res: Result = await getProductListApi({
            name: searchOpt.name.trim() || undefined,
            categoryId: searchOpt.categoryId,
            product_status: searchOpt.product_status || undefined,
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
    searchOpt.name = ''
    searchOpt.categoryId = undefined
    searchOpt.product_status = ''
    searchOpt.pageNum = 1
    getProductList()
}

const goAdd = () => {
    router.push('/product/add')
}

const goEdit = (row: ProductItem) => {
    router.push(`/product/add?id=${row.id}`)
}

// 上架/下架
const toggleStatus = async (row: ProductItem) => {
    const target = row.product_status === 'published' ? 'archived' : 'published'
    try {
        await ElMessageBox.confirm(
            `确定${target === 'published' ? '上架' : '下架'}「${
                row.name
            }」吗？`,
            '提示',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }
        )
    } catch (error) {
        return
    }
    const res = await updateProductStatusApi(row.id, target)
    if (res.code !== 0) {
        return ElMessage.error(res.message || res.msg || '操作失败')
    }
    ElMessage.success(target === 'published' ? '已上架' : '已下架')
    getProductList()
}

// 删除商品
const delProduct = async (row: ProductItem) => {
    try {
        await ElMessageBox.confirm(
            `确定删除商品「${row.name}」吗？删除后不可恢复`,
            '提示',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }
        )
    } catch (error) {
        return
    }
    const res = await deleteProductApi(row.id)
    if (res.code !== 0) {
        return ElMessage.error(res.message || res.msg || '删除失败')
    }
    ElMessage.success('删除成功')
    getProductList()
}
</script>
<style lang="scss" scoped>
.pagination-container {
    margin-top: 20px;
    text-align: right;
}
</style>
