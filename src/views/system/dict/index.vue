<template>
    <el-card class="box-card">
        <template #header>
            <div class="card-header">
                <el-form :model="searchOpt" inline>
                    <el-form-item label="字典名称">
                        <el-input
                            v-model="searchOpt.dictName"
                            placeholder="请输入字典名称"
                            clearable
                            @keyup.enter="getDictTypeList()"
                        ></el-input>
                    </el-form-item>
                    <el-form-item label="字典类型">
                        <el-input
                            v-model="searchOpt.dictType"
                            placeholder="请输入字典类型"
                            clearable
                            @keyup.enter="getDictTypeList()"
                        ></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="getDictTypeList()"
                            >查询</el-button
                        >
                        <el-button @click="resetHandler">重置</el-button>
                        <el-button
                            v-permission="['dict:type:add']"
                            type="primary"
                            @click="openDialog()"
                            >新增字典</el-button
                        >
                    </el-form-item>
                </el-form>
            </div>
        </template>
        <el-table :data="tableData" v-loading="loading">
            <el-table-column prop="dict_name" label="字典名称" min-width="160" />
            <el-table-column prop="dict_type" label="字典类型" min-width="160" />
            <el-table-column label="操作" width="220" fixed="right">
                <template #default="{ row }">
                    <el-button
                        v-permission="['dict:data:list']"
                        type="primary"
                        link
                        @click="goData(row)"
                        >字典数据</el-button
                    >
                    <el-button
                        v-permission="['dict:type:edit']"
                        type="primary"
                        link
                        @click="openDialog(row)"
                        >编辑</el-button
                    >
                    <el-button
                        v-permission="['dict:type:remove']"
                        type="danger"
                        link
                        @click="delType(row)"
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
                @size-change="getDictTypeList"
                @current-change="getDictTypeList"
            />
        </div>

        <!-- 新增/编辑弹窗 -->
        <el-dialog
            v-model="dialogVisible"
            :title="form.dict_id ? '编辑字典类型' : '新增字典类型'"
            width="480px"
            destroy-on-close
        >
            <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
                <el-form-item label="字典名称" prop="dictName">
                    <el-input
                        v-model="form.dictName"
                        placeholder="如：用户性别"
                        maxlength="50"
                    ></el-input>
                </el-form-item>
                <el-form-item label="字典类型" prop="dictType">
                    <el-input
                        v-model="form.dictType"
                        placeholder="如：sys_user_sex"
                        maxlength="100"
                        :disabled="!!form.dict_id"
                    ></el-input>
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
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
    getDictTypeListApi,
    addDictTypeApi,
    updateDictTypeApi,
    deleteDictTypeApi
} from '@/api/dict'
import { DictTypeItem } from '@/api/types/response'
import { Result } from '@/interfaces/base.interface'

const router = useRouter()
const loading = ref(false)
const submitting = ref(false)
const total = ref(0)
const tableData = ref<DictTypeItem[]>([])
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()

const searchOpt = reactive({
    dictName: '',
    dictType: '',
    pageNum: 1,
    pageSize: 10
})

const form = reactive({
    dict_id: undefined as number | undefined,
    dictName: '',
    dictType: ''
})

const rules = reactive<FormRules>({
    dictName: [{ required: true, message: '请输入字典名称', trigger: 'change' }],
    dictType: [{ required: true, message: '请输入字典类型', trigger: 'change' }]
})

onMounted(() => {
    getDictTypeList()
})

// 分页查询字典类型
const getDictTypeList = async () => {
    loading.value = true
    try {
        const res: Result = await getDictTypeListApi({
            dictName: searchOpt.dictName.trim() || undefined,
            dictType: searchOpt.dictType.trim() || undefined,
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
    searchOpt.dictName = ''
    searchOpt.dictType = ''
    searchOpt.pageNum = 1
    getDictTypeList()
}

// 跳转字典数据页
const goData = (row: DictTypeItem) => {
    router.push(
        `/system/dict/data?dictType=${row.dict_type}&dictName=${row.dict_name}`
    )
}

// 打开新增/编辑弹窗
const openDialog = (row?: DictTypeItem) => {
    Object.assign(form, {
        dict_id: undefined,
        dictName: '',
        dictType: ''
    })
    if (row) {
        Object.assign(form, {
            dict_id: row.dict_id,
            dictName: row.dict_name,
            dictType: row.dict_type
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
        const res = form.dict_id
            ? await updateDictTypeApi(form.dict_id, {
                  dictName: form.dictName,
                  dictType: form.dictType
              })
            : await addDictTypeApi({
                  dictName: form.dictName,
                  dictType: form.dictType
              })
        if (res.code !== 0) {
            return ElMessage.error(res.message || res.msg || '保存失败')
        }
        ElMessage.success('保存成功')
        dialogVisible.value = false
        getDictTypeList()
    } catch (error) {
        console.error(error)
        ElMessage.error('保存失败，请稍后再试')
    } finally {
        submitting.value = false
    }
}

// 删除字典类型
const delType = async (row: DictTypeItem) => {
    try {
        await ElMessageBox.confirm(
            `确定删除字典「${row.dict_name}」吗？其下所有字典数据将一并删除`,
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
    const res = await deleteDictTypeApi(row.dict_id)
    if (res.code !== 0) {
        return ElMessage.error(res.message || res.msg || '删除失败')
    }
    ElMessage.success('删除成功')
    getDictTypeList()
}
</script>
<style lang="scss" scoped>
.pagination-container {
    margin-top: 20px;
    text-align: right;
}
</style>