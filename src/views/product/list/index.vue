<template>
    <el-card class="box-card">
        <template #header>
            <div class="product-list">
                <el-form :model="form" inline ref="formRef">
                    <el-form-item label="商品名称" prop="productName">
                        <el-input v-model="form.productName"></el-input>
                    </el-form-item>
                    <el-form-item label="商品分类" prop="classifyId">
                        <el-input v-model="form.classifyId"></el-input>
                    </el-form-item>
                    <!-- <el-form-item>
                        <el-button type="primary" @click="queryClassifyByOption"
                            >查询</el-button
                        >
                        <el-button @click="resetForm(formRef)">重置</el-button>
                        <el-button
                            type="primary"
                            @click="setClassifyModal('add')"
                            >添加</el-button
                        >
                    </el-form-item> -->
                </el-form>
            </div>
        </template>
        <el-table :data="tableData" border style="width: 100%">
            <el-table-column prop="productName" label="商品名称" />
            <el-table-column prop="classifyId" label="商品分类" />
            <el-table-column label="操作" width="100">
                <!-- <template #default="{ row }">
                    <el-icon><iconDelete /></el-icon>
                    <el-icon><iconEdit /></el-icon>
                </template> -->
            </el-table-column>
        </el-table>
    </el-card>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { Delete as iconDelete, Edit as iconEdit } from '@element-plus/icons-vue'
const form = ref({
    productName: '',
    classifyId: ''
})
const tableData = ref([
    {
        productName: '商品1',
        classifyId: '分类1'
    }
])
</script>
<style lang="scss" scoped></style>
