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
                            @keyup.enter="getSkuList()"
                        ></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="getSkuList()"
                            >查询</el-button
                        >
                        <el-button @click="resetHandler">重置</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </template>
        <el-table :data="skuList" v-loading="loading">
            <el-table-column prop="productName" label="商品名称" min-width="200" />
            <el-table-column prop="name" label="规格名称" min-width="140" />
            <el-table-column label="价格(元)" width="110">
                <template #default="{ row }">￥{{ Number(row.price) }}</template>
            </el-table-column>
            <el-table-column prop="stock" label="库存" width="90" />
            <el-table-column label="SKU 图片" width="90">
                <template #default="{ row }">
                    <el-image
                        v-if="row.image"
                        :src="row.image.replace('/file/', '/dev/file/')"
                        fit="cover"
                        style="width: 50px; height: 50px"
                        :preview-src-list="[row.image.replace('/file/', '/dev/file/')]"
                    />
                    <span v-else>-</span>
                </template>
            </el-table-column>
            <el-table-column label="商品状态" width="90">
                <template #default="{ row }">
                    <el-tag
                        :type="
                            row.productStatus === 'published'
                                ? 'success'
                                : row.productStatus === 'draft'
                                ? 'info'
                                : 'danger'
                        "
                        >{{
                            row.productStatus === 'published'
                                ? '已上架'
                                : row.productStatus === 'draft'
                                ? '草稿'
                                : '已下架'
                        }}</el-tag
                    >
                </template>
            </el-table-column>
        </el-table>
        <el-alert
            title="规格与 SKU 在「新增/编辑商品」页统一维护，此处为全量 SKU 一览"
            type="info"
            :closable="false"
            show-icon
            style="margin-top: 14px"
        />
    </el-card>
</template>

<script lang="ts" setup>
import { onMounted, ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { getProductListApi } from '@/api/product'
import { ProductItem } from '@/api/types/response'
import { Result } from '@/interfaces/base.interface'

const loading = ref(false)
const productList = ref<ProductItem[]>([])

const searchOpt = reactive({
    productName: '',
    pageNum: 1,
    pageSize: 100
})

onMounted(() => {
    getSkuList()
})

// 拉取商品（含 SKU），按商品名前端过滤
const getSkuList = async () => {
    loading.value = true
    try {
        const res: Result = await getProductListApi({
            name: searchOpt.productName.trim() || undefined,
            pageNum: searchOpt.pageNum,
            pageSize: searchOpt.pageSize
        })
        if (res.code !== 0) {
            return ElMessage.error(res.message || res.msg || '查询失败')
        }
        productList.value = res.result?.data || []
    } catch (error) {
        console.error(error)
    } finally {
        loading.value = false
    }
}

const resetHandler = () => {
    searchOpt.productName = ''
    getSkuList()
}

// 扁平化：每个 SKU 一行
const skuList = computed(() => {
    const rows: {
        productName: string
        name: string
        price: number
        stock: number
        image?: string
        productStatus: string
    }[] = []
    productList.value.forEach((p) => {
        ;(p.skus || []).forEach((s) => {
            rows.push({
                productName: p.name,
                name: s.name,
                price: s.price,
                stock: s.stock,
                image: s.image,
                productStatus: p.product_status || 'draft'
            })
        })
    })
    return rows
})
</script>
<style lang="scss" scoped>
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
</style>