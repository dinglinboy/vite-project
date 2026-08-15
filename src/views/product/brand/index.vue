<template>
    <el-card class="box-card">
        <template #header>
            <div class="card-header">
                <el-form :model="searchOpt" inline>
                    <el-form-item label="品牌名称">
                        <el-input
                            v-model="searchOpt.name"
                            placeholder="请输入品牌名称"
                            clearable
                            @keyup.enter="getBrandList()"
                        ></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="getBrandList()"
                            >查询</el-button
                        >
                        <el-button @click="resetHandler">重置</el-button>
                        <el-button
                            v-permission="['product:brand:add']"
                            type="primary"
                            @click="openDialog()"
                            >新增品牌</el-button
                        >
                    </el-form-item>
                </el-form>
            </div>
        </template>
        <el-table :data="tableData" v-loading="loading">
            <el-table-column label="Logo" width="100">
                <template #default="{ row }">
                    <el-image
                        v-if="row.logo"
                        :src="row.logo.replace('/file/', '/dev/file/')"
                        :preview-src-list="[row.logo.replace('/file/', '/dev/file/')]"
                        fit="cover"
                        style="width: 48px; height: 48px"
                    />
                    <span v-else>-</span>
                </template>
            </el-table-column>
            <el-table-column prop="name" label="品牌名称" min-width="160" />
            <el-table-column
                prop="description"
                label="品牌描述"
                min-width="240"
                show-overflow-tooltip
            />
            <el-table-column prop="sort_order" label="排序" width="80" />
            <el-table-column label="操作" width="150" fixed="right">
                <template #default="{ row }">
                    <el-button
                        v-permission="['product:brand:edit']"
                        type="primary"
                        link
                        @click="openDialog(row)"
                        >编辑</el-button
                    >
                    <el-button
                        v-permission="['product:brand:remove']"
                        type="danger"
                        link
                        @click="delBrand(row)"
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
                @size-change="getBrandList"
                @current-change="getBrandList"
            />
        </div>

        <!-- 新增/编辑弹窗 -->
        <el-dialog
            v-model="dialogVisible"
            :title="form.id ? '编辑品牌' : '新增品牌'"
            width="520px"
            destroy-on-close
        >
            <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
                <el-form-item label="品牌名称" prop="name">
                    <el-input
                        v-model="form.name"
                        placeholder="请输入品牌名称"
                        maxlength="50"
                    ></el-input>
                </el-form-item>
                <el-form-item label="Logo 地址">
                    <el-input
                        v-model="form.logo"
                        placeholder="图片地址（选填）"
                    ></el-input>
                </el-form-item>
                <el-form-item label="品牌描述">
                    <el-input
                        v-model="form.description"
                        type="textarea"
                        :rows="3"
                        maxlength="500"
                        placeholder="品牌介绍（选填）"
                    ></el-input>
                </el-form-item>
                <el-form-item label="排序">
                    <el-input-number
                        v-model="form.sort_order"
                        :min="0"
                        :max="999"
                    />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button
                    type="primary"
                    :loading="submitting"
                    @click="submitForm"
                    >确 定</el-button
                >
            </template>
        </el-dialog>
    </el-card>
</template>

<script lang="ts" setup>
import { onMounted, ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
    getBrandListApi,
    addBrandApi,
    updateBrandApi,
    deleteBrandApi
} from '@/api/brand'
import { BrandItem } from '@/api/types/response'
import { Result } from '@/interfaces/base.interface'

const loading = ref(false)
const submitting = ref(false)
const total = ref(0)
const tableData = ref<BrandItem[]>([])
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()

const searchOpt = reactive({
    name: '',
    pageNum: 1,
    pageSize: 10
})

const form = reactive<Partial<BrandItem>>({
    id: undefined,
    name: '',
    logo: '',
    description: '',
    sort_order: 0
})

const rules = reactive<FormRules>({
    name: [{ required: true, message: '请输入品牌名称', trigger: 'change' }]
})

onMounted(() => {
    getBrandList()
})

// 分页查询品牌
const getBrandList = async () => {
    loading.value = true
    try {
        const res: Result = await getBrandListApi({
            name: searchOpt.name.trim() || undefined,
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
    searchOpt.pageNum = 1
    getBrandList()
}

// 打开新增/编辑弹窗
const openDialog = (row?: BrandItem) => {
    Object.assign(form, {
        id: undefined,
        name: '',
        logo: '',
        description: '',
        sort_order: 0
    })
    if (row) {
        Object.assign(form, {
            id: row.id,
            name: row.name,
            logo: row.logo || '',
            description: row.description || '',
            sort_order: row.sort_order ?? 0
        })
    }
    dialogVisible.value = true
}

// 提交
const submitForm = async () => {
    const valid = await formRef.value?.validate().catch(() => false)
    if (!valid) return
    submitting.value = true
    try {
        const payload = {
            name: form.name,
            logo: form.logo || undefined,
            description: form.description || undefined,
            sort_order: form.sort_order ?? 0
        }
        const res = form.id
            ? await updateBrandApi(form.id, payload)
            : await addBrandApi(payload)
        if (res.code !== 0) {
            return ElMessage.error(res.message || res.msg || '保存失败')
        }
        ElMessage.success('保存成功')
        dialogVisible.value = false
        getBrandList()
    } catch (error) {
        console.error(error)
        ElMessage.error('保存失败，请稍后再试')
    } finally {
        submitting.value = false
    }
}

// 删除品牌
const delBrand = async (row: BrandItem) => {
    try {
        await ElMessageBox.confirm(`确定删除品牌「${row.name}」吗？`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        })
    } catch (error) {
        return
    }
    const res = await deleteBrandApi(row.id)
    if (res.code !== 0) {
        return ElMessage.error(res.message || res.msg || '删除失败')
    }
    ElMessage.success('删除成功')
    getBrandList()
}
</script>
<style lang="scss" scoped>
.pagination-container {
    margin-top: 20px;
    text-align: right;
}
</style>