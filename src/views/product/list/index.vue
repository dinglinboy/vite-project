import { reactive } from 'vue';
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
    <el-table-column prop="productName" label="商品名称" />
    <el-table-column prop="classify" label="商品分类" />
  </el-table>
  <el-pagination background layout="prev, pager, next" :total="1000" />
</template>
<script lang="ts" setup>
import { FormInstance } from 'element-plus'
import { reactive, ref } from 'vue'
const form = reactive({
  productName: '',
  classify: ''
})
const tableData = reactive([
  {
    productName: 'coffee1',
    classify: '香'
  }
])
const formRef = ref<FormInstance>()
const resetForm = (elForm: FormInstance | undefined) => {
  if (!elForm) return
  elForm.resetFields()
}
</script>
<style lang="scss" scoped></style>
