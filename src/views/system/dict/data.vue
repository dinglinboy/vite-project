<template>
    <el-card class="box-card">
        <template #header>
            <div class="card-header">
                <span
                    >字典数据管理（{{ dictName }} · {{ dictType }}）</span
                >
                <el-button @click="router.back()">返回</el-button>
            </div>
        </template>
        <el-form :model="searchOpt" inline style="margin-bottom: 14px">
            <el-form-item label="字典标签">
                <el-input
                    v-model="searchOpt.dictLabel"
                    placeholder="请输入字典标签"
                    clearable
                    @keyup.enter="getDictDataList()"
                ></el-input>
            </el-form-item>
            <el-form-item label="字典键值">
                <el-input
                    v-model="searchOpt.dictValue"
                    placeholder="请输入字典键值"
                    clearable
                    @keyup.enter="getDictDataList()"
                ></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="getDictDataList()"
                    >查询</el-button
                >
                <el-button @click="resetHandler">重置</el-button>
                <el-button
                    v-permission="['dict:data:add']"
                    type="primary"
                    @click="openDialog()"
                    >新增数据</el-button
                >
            </el-form-item>
        </el-form>
        <el-table :data="tableData" v-loading="loading">
            <el-table-column prop="dict_label" label="字典标签" min-width="140" />
            <el-table-column prop="dict_value" label="字典键值" min-width="120" />
            <el-table-column label="标签样式" width="120">
                <template #default="{ row }">
                    <el-tag :type="row.list_class || 'primary'">{{
                        row.dict_label
                    }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="dict_sort" label="排序" width="80" />
            <el-table-column label="是否默认" width="90">
                <template #default="{ row }">
                    <el-tag v-if="row.is_default === 'Y'" type="success">默认</el-tag>
                    <span v-else>-</span>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
                <template #default="{ row }">
                    <el-button
                        v-permission="['dict:data:edit']"
                        type="primary"
                        link
                        @click="openDialog(row)"
                        >编辑</el-button
                    >
                    <el-button
                        v-permission="['dict:data:remove']"
                        type="danger"
                        link
                        @click="delData(row)"
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
                @size-change="getDictDataList"
                @current-change="getDictDataList"
            />
        </div>

        <!-- 新增/编辑弹窗 -->
        <el-dialog
            v-model="dialogVisible"
            :title="form.dict_code ? '编辑字典数据' : '新增字典数据'"
            width="520px"
            destroy-on-close
        >
            <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
                <el-form-item label="字典标签" prop="dictLabel">
                    <el-input
                        v-model="form.dictLabel"
                        placeholder="显示的名称，如：男"
                        maxlength="50"
                    ></el-input>
                </el-form-item>
                <el-form-item label="字典键值" prop="dictValue">
                    <el-input
                        v-model="form.dictValue"
                        placeholder="存储的值，如：0"
                        maxlength="100"
                    ></el-input>
                </el-form-item>
                <el-form-item label="排序">
                    <el-input-number
                        v-model="form.dictSort"
                        :min="0"
                        :max="999"
                    />
                </el-form-item>
                <el-form-item label="标签样式">
                    <el-select v-model="form.listClass" clearable>
                        <el-option label="默认(primary)" value="primary" />
                        <el-option label="成功(success)" value="success" />
                        <el-option label="信息(info)" value="info" />
                        <el-option label="警告(warning)" value="warning" />
                        <el-option label="危险(danger)" value="danger" />
                    </el-select>
                </el-form-item>
                <el-form-item label="是否默认">
                    <el-switch
                        v-model="isDefaultFlag"
                        active-text="是"
                        inactive-text="否"
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
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
    getDictDataListApi,
    addDictDataApi,
    updateDictDataApi,
    deleteDictDataApi
} from '@/api/dict'
import { DictDataItem } from '@/api/types/response'
import { Result } from '@/interfaces/base.interface'

const route = useRoute()
const router = useRouter()
const dictType = (route.query.dictType as string) || ''
const dictName = (route.query.dictName as string) || ''

const loading = ref(false)
const submitting = ref(false)
const total = ref(0)
const tableData = ref<DictDataItem[]>([])
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const isDefaultFlag = ref(false)

const searchOpt = reactive({
    dictLabel: '',
    dictValue: '',
    pageNum: 1,
    pageSize: 10
})

const form = reactive({
    dict_code: undefined as number | undefined,
    dictLabel: '',
    dictValue: '',
    dictSort: 0,
    listClass: 'primary' as string
})

const rules = reactive<FormRules>({
    dictLabel: [{ required: true, message: '请输入字典标签', trigger: 'change' }],
    dictValue: [{ required: true, message: '请输入字典键值', trigger: 'change' }]
})

onMounted(() => {
    if (!dictType) {
        ElMessage.error('缺少字典类型参数')
        router.back()
        return
    }
    getDictDataList()
})

// 分页查询字典数据
const getDictDataList = async () => {
    loading.value = true
    try {
        const res: Result = await getDictDataListApi({
            dictType,
            dictLabel: searchOpt.dictLabel.trim() || undefined,
            dictValue: searchOpt.dictValue.trim() || undefined,
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
    searchOpt.dictLabel = ''
    searchOpt.dictValue = ''
    searchOpt.pageNum = 1
    getDictDataList()
}

// 打开新增/编辑弹窗
const openDialog = (row?: DictDataItem) => {
    Object.assign(form, {
        dict_code: undefined,
        dictLabel: '',
        dictValue: '',
        dictSort: 0,
        listClass: 'primary'
    })
    isDefaultFlag.value = false
    if (row) {
        Object.assign(form, {
            dict_code: row.dict_code,
            dictLabel: row.dict_label,
            dictValue: row.dict_value,
            dictSort: row.dict_sort ?? 0,
            listClass: row.list_class || 'primary'
        })
        isDefaultFlag.value = row.is_default === 'Y'
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
            dictType,
            dictLabel: form.dictLabel,
            dictValue: form.dictValue,
            dictSort: form.dictSort ?? 0,
            listClass: form.listClass,
            isDefault: isDefaultFlag.value ? 'Y' : 'N'
        }
        const res = form.dict_code
            ? await updateDictDataApi(form.dict_code, payload)
            : await addDictDataApi(payload)
        if (res.code !== 0) {
            return ElMessage.error(res.message || res.msg || '保存失败')
        }
        ElMessage.success('保存成功')
        dialogVisible.value = false
        getDictDataList()
    } catch (error) {
        console.error(error)
        ElMessage.error('保存失败，请稍后再试')
    } finally {
        submitting.value = false
    }
}

// 删除字典数据
const delData = async (row: DictDataItem) => {
    try {
        await ElMessageBox.confirm(
            `确定删除字典数据「${row.dict_label}」吗？`,
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
    const res = await deleteDictDataApi(row.dict_code)
    if (res.code !== 0) {
        return ElMessage.error(res.message || res.msg || '删除失败')
    }
    ElMessage.success('删除成功')
    getDictDataList()
}
</script>
<style lang="scss" scoped>
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: bold;
}

.pagination-container {
    margin-top: 20px;
    text-align: right;
}
</style>