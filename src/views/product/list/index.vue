<template>
    <div class="product-list">
        <el-form :model="form" inline ref="formRef">
            <el-form-item label="商品名称" prop="productName">
                <el-input v-model="form.productName"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="classify">
                <el-select placeholder="" v-model="form.classify">
                    <el-option lebel="手机" value="phone"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary">查询</el-button>
                <el-button @click="resetForm(formRef)">重置</el-button>
                <el-button type="primary">添加</el-button>
            </el-form-item>
        </el-form>
    </div>
    <el-table :data="tableData" empty-text="无数据" border style="width: 100%">
        <el-table-column prop="name" label="商品名称" />
        <el-table-column prop="brand" label="商品分类" />
    </el-table>
    <el-pagination
        background
        layout="prev, pager, next, total"
        :total="pagination.total"
        :page-size="pagination.offset"
        v-model:current-page="pagination.limit"
    />
</template>
<script lang="ts" setup>
import { FormInstance } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'
import { Pagination } from '../../../util/type'
import { getCoffees } from '@/api/index'
const form = reactive({
    productName: '',
    classify: ''
})
let tableData = ref([])
const pagination = reactive<Pagination>({
    offset: 1,
    limit: 10,
    total: 0
})
const formRef = ref<FormInstance>()
const resetForm = (elForm: FormInstance | undefined) => {
    if (!elForm) return
    elForm.resetFields()
}
onMounted(async () => {
    const res = await getCoffees({
        offset: pagination.offset,
        limit: pagination.limit
    })
    tableData.value = res
})
</script>
<style lang="scss">
.el-pagination {
    margin-top: 20px;
    justify-content: center;
}
</style>
