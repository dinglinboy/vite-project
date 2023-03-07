<template>
    <div class="product-list">
        <el-form :model="form" inline ref="formRef">
            <el-form-item label="商品名称" prop="classifyName">
                <el-input v-model="form.classifyName"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="queryClassifyByOption"
                    >查询</el-button
                >
                <el-button @click="resetForm(formRef)">重置</el-button>
                <el-button type="primary" @click="setClassifyModal('add')"
                    >添加</el-button
                >
            </el-form-item>
        </el-form>
    </div>
    <el-table :data="tableData" empty-text="无数据" border style="width: 100%">
        <el-table-column prop="name" label="分类名称" />
        <el-table-column label="操作" width="100">
            <template #default="{ row }">
                <el-icon @click="removeClassify(row)"><iconDelete /></el-icon>
                <el-icon @click="setClassifyModal('edit', row)"
                    ><iconEdit
                /></el-icon>
            </template>
        </el-table-column>
    </el-table>
    <el-dialog
        v-model="classifyModal.showModal"
        :title="classifyModal.modalTitle"
        center
    >
        <el-input v-model:model-value="classifyModal.classifyName"></el-input>
        <template #footer>
            <el-button
                type="primary"
                @click="submitClassify(classifyModal.modalType)"
                >提交</el-button
            >
        </template>
    </el-dialog>
    <el-pagination
        background
        layout="prev, pager, next, total"
        :total="pagination.total"
        :page-size="pagination.pageSize"
        @current-change="queryClassifyByOption"
        v-model:current-page="pagination.pageNum"
    />
</template>
<script lang="ts" setup>
import { Delete as iconDelete, Edit as iconEdit } from '@element-plus/icons-vue'
import { FormInstance, ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'
import { Pagination } from '@/util/type'
import {
    getClassifyList,
    removeClassifyById,
    addClassifyApi,
    updateClassifyApi
} from '@/api/index'
import type { Action } from 'element-plus'
const form = reactive({
    classifyName: ''
})
let tableData = ref([])
const pagination = reactive<Pagination>({
    pageNum: 1,
    pageSize: 5,
    total: 0
})
const formRef = ref<FormInstance>()
const resetForm = (elForm: FormInstance | undefined) => {
    if (!elForm) return
    elForm.resetFields()
    pagination.pageNum = 1
    pagination.total = 0
    queryClassifyByOption()
}
onMounted(async () => {
    queryClassifyByOption()
})
/**
 * 查询分类
 */
const queryClassifyByOption = async () => {
    const { pageNum, pageSize } = pagination
    const { classifyName } = form
    const res = await getClassifyList({
        pageNum,
        pageSize,
        name: classifyName + ''
    })
    tableData.value = res.result
    pagination.total = res.total
}

/**
 * 删除分类
 * @param data
 */
const removeClassify = async (row: { id: string }) => {
    ElMessageBox.alert('确定要删除该分类？', '删除分类', {
        confirmButtonText: '确定',
        callback: async (action: Action) => {
            if (action === 'confirm') {
                const { message, code } = await removeClassifyById(row.id)
                ElMessage.closeAll()
                if (code === 0) {
                    queryClassifyByOption()
                    ElMessage.success(message || '删除成功')
                } else {
                    ElMessage.error(message || '删除失败')
                }
            }
        }
    })
}

/**
 * 添加或修改分类
 */
const classifyModal = reactive({
    showModal: false,
    modalType: 'add',
    modalTitle: '',
    classifyName: '',
    id: ''
})
// 设置对话框类型，添加或修改
const modalTitleMap = {
    add: {
        title: '添加分类',
        successText: '添加成功',
        failedText: '添加失败',
        api: addClassifyApi
    },
    edit: {
        title: '修改分类',
        successText: '修改成功',
        failedText: '修改失败',
        api: updateClassifyApi
    }
}
const setClassifyModal = (
    modalType: string,
    classify?: { name: string; id: string }
) => {
    classifyModal.modalType = modalType
    classifyModal.modalTitle = modalTitleMap[modalType].title
    classifyModal.showModal = true
    classifyModal.classifyName = ''
    classifyModal.id = ''
    if (classify) {
        classifyModal.classifyName = classify.name
        classifyModal.id = classify.id
    }
}
// 提交添加分类的数据
const submitClassify = async (modalType: string) => {
    const { successText, failedText, api } = modalTitleMap[modalType]
    const res = await api({
        name: classifyModal.classifyName,
        id: classifyModal.id
    })
    ElMessage.closeAll()
    console.log(res)
    if (res.code === 0) {
        ElMessage.success(successText)
        queryClassifyByOption()
        classifyModal.showModal = false
    } else {
        ElMessage.error(res.message || failedText)
    }
}
</script>
<style lang="scss">
.el-pagination {
    margin-top: 20px;
    justify-content: center;
}
</style>
