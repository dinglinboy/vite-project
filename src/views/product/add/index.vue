<template>
    <el-card class="box-card">
        <template #header>
            <div class="card-header">
                <span>{{ isEdit ? '编辑商品' : '新增商品' }}</span>
                <el-button @click="router.back()">返回</el-button>
            </div>
        </template>
        <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            label-width="100px"
            style="max-width: 900px"
            v-loading="loading"
        >
            <el-divider content-position="left">基本信息</el-divider>
            <el-form-item label="商品名称" prop="name">
                <el-input
                    v-model="form.name"
                    placeholder="请输入商品名称"
                    maxlength="100"
                ></el-input>
            </el-form-item>
            <el-form-item label="商品编号">
                <el-input
                    v-model="form.goods_no"
                    placeholder="请输入商品编号（选填）"
                    maxlength="64"
                ></el-input>
            </el-form-item>
            <el-form-item label="商品副标题">
                <el-input
                    v-model="form.subtitle"
                    type="textarea"
                    :rows="2"
                    placeholder="一句话卖点（选填）"
                    maxlength="200"
                ></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="categoryId">
                <el-tree-select
                    v-model="form.categoryId"
                    :data="categoryTree"
                    :props="{
                        label: 'name',
                        value: 'id',
                        children: 'children'
                    }"
                    node-key="id"
                    check-strictly
                    placeholder="请选择商品分类"
                    style="width: 100%"
                />
            </el-form-item>
            <el-form-item label="所属品牌">
                <el-select
                    v-model="form.brandId"
                    clearable
                    placeholder="请选择品牌（选填）"
                    style="width: 100%"
                >
                    <el-option
                        v-for="item in brandOptions"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id"
                    ></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="商品标签">
                <el-select
                    v-model="form.tags"
                    multiple
                    filterable
                    allow-create
                    default-first-option
                    placeholder="输入后回车创建标签"
                    style="width: 100%"
                ></el-select>
            </el-form-item>
            <el-form-item label="商品状态">
                <el-radio-group v-model="form.product_status">
                    <el-radio label="draft">草稿</el-radio>
                    <el-radio label="published">上架</el-radio>
                    <el-radio label="archived">下架</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="商品描述">
                <el-input
                    v-model="form.description"
                    type="textarea"
                    :rows="5"
                    placeholder="请输入商品详情描述"
                ></el-input>
            </el-form-item>

            <el-divider content-position="left">商品图片</el-divider>
            <el-form-item label="主图/轮播图">
                <el-upload
                    list-type="picture-card"
                    :file-list="imageFileList"
                    :http-request="handleImageUpload"
                    :on-remove="handleImageRemove"
                    :on-preview="handleImagePreview"
                    accept="image/*"
                >
                    <el-icon><Plus /></el-icon>
                </el-upload>
                <el-dialog
                    v-model="previewVisible"
                    width="600px"
                    append-to-body
                >
                    <img :src="previewUrl" style="width: 100%" />
                </el-dialog>
            </el-form-item>

            <el-divider content-position="left">SKU（规格库存）</el-divider>
            <el-form-item label="SKU 列表">
                <el-table :data="form.skus" border>
                    <el-table-column label="规格名称" min-width="160">
                        <template #default="{ row }">
                            <el-input
                                v-model="row.name"
                                placeholder="如：红色 / M"
                            ></el-input>
                        </template>
                    </el-table-column>
                    <el-table-column label="价格(元)" width="140">
                        <template #default="{ row }">
                            <el-input-number
                                v-model="row.price"
                                :min="0"
                                :precision="2"
                                :controls="false"
                                style="width: 100%"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column label="库存" width="120">
                        <template #default="{ row }">
                            <el-input-number
                                v-model="row.stock"
                                :min="0"
                                :precision="0"
                                :controls="false"
                                style="width: 100%"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column label="SKU 图片" min-width="160">
                        <template #default="{ row }">
                            <el-input
                                v-model="row.image"
                                placeholder="图片地址（选填）"
                            ></el-input>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="90">
                        <template #default="{ $index }">
                            <el-button
                                type="danger"
                                link
                                @click="form.skus.splice($index, 1)"
                                >删除</el-button
                            >
                        </template>
                    </el-table-column>
                </el-table>
                <el-button
                    type="primary"
                    plain
                    @click="addSkuRow"
                    style="margin-top: 10px"
                    >添加 SKU</el-button
                >
            </el-form-item>

            <el-divider content-position="left">商品参数</el-divider>
            <el-form-item label="参数列表">
                <el-table :data="form.specs" border>
                    <el-table-column label="参数名" min-width="180">
                        <template #default="{ row }">
                            <el-input
                                v-model="row.key"
                                placeholder="如：产地"
                            ></el-input>
                        </template>
                    </el-table-column>
                    <el-table-column label="参数值" min-width="220">
                        <template #default="{ row }">
                            <el-input
                                v-model="row.value"
                                placeholder="如：中国"
                            ></el-input>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="90">
                        <template #default="{ $index }">
                            <el-button
                                type="danger"
                                link
                                @click="form.specs.splice($index, 1)"
                                >删除</el-button
                            >
                        </template>
                    </el-table-column>
                </el-table>
                <el-button
                    type="primary"
                    plain
                    @click="addSpecRow"
                    style="margin-top: 10px"
                    >添加参数</el-button
                >
            </el-form-item>
        </el-form>
        <div class="footer-actions">
            <el-button @click="router.back()">取 消</el-button>
            <el-button type="primary" :loading="submitting" @click="submitForm"
                >保存商品</el-button
            >
        </div>
    </el-card>
</template>
<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import {
    getProductInfoApi,
    addProductApi,
    updateProductApi,
    uploadFileApi
} from '@/api/product'
import { getCategoryListApi } from '@/api/category'
import { getBrandOptionsApi } from '@/api/brand'
import { ProductItem, SkuItem, BrandItem } from '@/api/types/response'
import { Result } from '@/interfaces/base.interface'

const route = useRoute()
const router = useRouter()
const isEdit = !!route.query.id
const productId = route.query.id as string | undefined

const loading = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()
const categoryTree = ref([])
const brandOptions = ref<BrandItem[]>([])
const previewVisible = ref(false)
const previewUrl = ref('')

const form = reactive({
    name: '',
    goods_no: '',
    subtitle: '',
    description: '',
    categoryId: undefined as number | undefined,
    brandId: undefined as number | undefined,
    tags: [] as string[],
    product_status: 'draft',
    images: [] as string[],
    skus: [] as SkuItem[],
    specs: [] as { key: string; value: string }[]
})

const rules = reactive<FormRules>({
    name: [{ required: true, message: '请输入商品名称', trigger: 'change' }],
    categoryId: [
        { required: true, message: '请选择商品分类', trigger: 'change' }
    ]
})

// el-upload 的 file-list 需要 { name, url } 结构
const imageFileList = ref<{ name: string; url: string }[]>([])

// 上传返回 /file/xxx，浏览器访问需转 /dev/file/xxx
const toViewUrl = (url: string) => url.replace('/file/', '/dev/file/')

onMounted(async () => {
    loading.value = true
    try {
        const [categoryRes, brandRes] = await Promise.all([
            getCategoryListApi(),
            getBrandOptionsApi()
        ])
        if (categoryRes.code === 0) {
            categoryTree.value = categoryRes.result || []
        }
        if (brandRes.code === 0) {
            brandOptions.value = brandRes.result || []
        }
        if (isEdit && productId) {
            const infoRes: Result = await getProductInfoApi(productId)
            if (infoRes.code === 0) {
                const p = infoRes.result as ProductItem
                Object.assign(form, {
                    name: p.name || '',
                    goods_no: p.goods_no || '',
                    subtitle: p.subtitle || '',
                    description: p.description || '',
                    categoryId: p.category_id || p.categoryId,
                    brandId: p.brand_id || p.brandId,
                    tags: p.tags || [],
                    product_status: p.product_status || 'draft',
                    images: p.images || [],
                    skus: (p.skus || []).map((s) => ({ ...s })),
                    specs: p.specs || []
                })
                imageFileList.value = (p.images || []).map((url) => ({
                    name: url.split('/').pop() || url,
                    url: toViewUrl(url)
                }))
            } else {
                ElMessage.error(infoRes.message || infoRes.msg || '商品不存在')
            }
        }
    } catch (error) {
        console.error(error)
    } finally {
        loading.value = false
    }
})

// ===== 图片上传 =====
const handleImageUpload = async (options: any) => {
    try {
        const res = await uploadFileApi(options.file)
        if (res.code === 0) {
            const url = res.result?.url || ''
            form.images.push(url)
            options.onSuccess(url)
        } else {
            ElMessage.error(res.message || res.msg || '上传失败')
            options.onError(new Error('上传失败'))
        }
    } catch (error) {
        console.error(error)
        options.onError(error as Error)
    }
}

const handleImageRemove = (file: any) => {
    const url = file.response || file.url
    const raw =
        typeof url === 'string' ? url.replace('/dev/file/', '/file/') : ''
    const idx = form.images.findIndex((u) => u === raw)
    if (idx > -1) {
        form.images.splice(idx, 1)
    }
}

const handleImagePreview = (file: any) => {
    previewUrl.value = file.url
    previewVisible.value = true
}

// ===== SKU / 参数行 =====
const addSkuRow = () => {
    form.skus.push({
        name: '',
        price: 0,
        stock: 0
    })
}

const addSpecRow = () => {
    form.specs.push({ key: '', value: '' })
}

// ===== 提交 =====
const submitForm = async () => {
    const valid = await formRef.value?.validate().catch(() => false)
    if (!valid) return
    // SKU 校验：至少一行，价格/库存不能为 0
    if (!form.skus.length) {
        return ElMessage.warning('请至少添加一个 SKU')
    }
    if (form.skus.some((s) => !s.name || !s.price)) {
        return ElMessage.warning('SKU 名称与价格不能为空')
    }
    submitting.value = true
    const payload: Partial<ProductItem> = {
        name: form.name,
        goods_no: form.goods_no || undefined,
        subtitle: form.subtitle || undefined,
        description: form.description || undefined,
        categoryId: form.categoryId,
        brandId: form.brandId,
        tags: form.tags.length ? form.tags : undefined,
        product_status: form.product_status as ProductItem['product_status'],
        images: form.images,
        skus: form.skus,
        specs: form.specs.length ? form.specs : undefined
    }
    try {
        const res = isEdit
            ? await updateProductApi(productId as string, payload)
            : await addProductApi(payload)
        if (res.code !== 0) {
            return ElMessage.error(res.message || res.msg || '保存失败')
        }
        ElMessage.success('保存成功')
        router.push('/product/list')
    } catch (error) {
        console.error(error)
        ElMessage.error('保存失败，请稍后再试')
    } finally {
        submitting.value = false
    }
}
</script>
<style lang="scss" scoped>
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: bold;
}

.footer-actions {
    display: flex;
    justify-content: center;
    gap: 10px;
    padding-top: 20px;
}
</style>
