<template>
    <el-card class="box-card">
        <template #header>
            <div class="classify-header">
                <el-form :model="searchForm" inline>
                    <el-form-item label="分类名称">
                        <el-input
                            v-model="searchForm.name"
                            placeholder="请输入分类名称"
                            clearable
                            @keyup.enter="handleSearch"
                        />
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="handleSearch"
                            >查询</el-button
                        >
                        <el-button @click="handleReset">重置</el-button>
                        <el-button
                            v-permission="['product:classify:add']"
                            type="primary"
                            @click="openModal('add')"
                            >添加分类</el-button
                        >
                    </el-form-item>
                </el-form>
            </div>
        </template>

        <el-table
            :data="filteredTree"
            row-key="id"
            :tree-props="{ children: 'children' }"
            empty-text="无数据"
            border
            style="width: 100%"
            v-loading="loading"
        >
            <el-table-column prop="name" label="分类名称" min-width="200" />
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="sort_order" label="排序" width="80" />
            <el-table-column
                prop="createTime"
                label="创建时间"
                width="170"
                :formatter="(row: any) => (row.createTime || '').slice(0, 19).replace('T', ' ')"
            />
            <el-table-column label="操作" width="200" fixed="right">
                <template #default="{ row }">
                    <el-button
                        v-permission="['product:classify:add']"
                        type="primary"
                        link
                        @click="openModal('add', row)"
                        >添加子分类</el-button
                    >
                    <el-button
                        v-permission="['product:classify:edit']"
                        type="primary"
                        link
                        @click="openModal('edit', row)"
                        >编辑</el-button
                    >
                    <el-button
                        v-permission="['product:classify:remove']"
                        type="danger"
                        link
                        @click="handleDelete(row)"
                        >删除</el-button
                    >
                </template>
            </el-table-column>
        </el-table>

        <el-dialog
            v-model="modal.show"
            :title="modal.title"
            width="480px"
            :close-on-click-modal="false"
        >
            <el-form
                ref="formRef"
                :model="form"
                :rules="rules"
                label-width="90px"
            >
                <el-form-item label="上级分类">
                    <el-tree-select
                        v-model="form.parentId"
                        :data="parentTree"
                        :props="{
                            label: 'name',
                            value: 'id',
                            children: 'children'
                        }"
                        node-key="id"
                        check-strictly
                        clearable
                        placeholder="不选则为顶级分类"
                        style="width: 100%"
                    />
                </el-form-item>
                <el-form-item label="分类名称" prop="name">
                    <el-input
                        v-model="form.name"
                        placeholder="请输入分类名称"
                        maxlength="30"
                    />
                </el-form-item>
                <el-form-item label="排序">
                    <el-input-number
                        v-model="form.sort_order"
                        :min="0"
                        :max="9999"
                        style="width: 100%"
                    />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="modal.show = false">取消</el-button>
                    <el-button type="primary" @click="handleSubmit"
                        >确定</el-button
                    >
                </span>
            </template>
        </el-dialog>
    </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
    getCategoryListApi,
    addCategoryApi,
    updateCategoryApi,
    deleteCategoryApi
} from '@/api/category'
import { Result } from '@/interfaces/base.interface'

interface CategoryNode {
    id: number
    name: string
    parentId: number
    sort_order: number
    children?: CategoryNode[]
    [key: string]: any
}

const loading = ref(false)
const treeData = ref<CategoryNode[]>([])
const formRef = ref<FormInstance>()

const searchForm = reactive({ name: '' })

const modal = reactive({
    show: false,
    title: '',
    type: 'add' as 'add' | 'edit',
    // 编辑时禁止选自身/后代作为父级
    disabledIds: new Set<number>()
})

const form = reactive({
    id: undefined as number | undefined,
    parentId: undefined as number | undefined,
    name: '',
    sort_order: 0
})

const rules: FormRules = {
    name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
}

// 名称过滤后的树
const filteredTree = computed(() => {
    const kw = searchForm.name.trim()
    if (!kw) return treeData.value
    const filter = (nodes: CategoryNode[]): CategoryNode[] => {
        return nodes
            .filter((n) => n.name.includes(kw) || (n.children?.length && filter(n.children).length))
            .map((n) => ({
                ...n,
                children: n.children?.length ? filter(n.children) : undefined
            }))
    }
    return filter(treeData.value)
})

// 弹窗父级选择树（编辑时排除自身及其后代）
const parentTree = computed(() => {
    const exclude = (nodes: CategoryNode[]): CategoryNode[] => {
        return nodes
            .filter((n) => !modal.disabledIds.has(n.id))
            .map((n) => ({
                ...n,
                children: n.children?.length ? exclude(n.children) : undefined
            }))
    }
    return exclude(treeData.value)
})

const loadTree = async () => {
    loading.value = true
    try {
        const res: Result = await getCategoryListApi()
        if (res.code === 0) {
            treeData.value = res.result || []
        } else {
            ElMessage.error(res.msg || '查询失败')
        }
    } finally {
        loading.value = false
    }
}

const handleSearch = () => {
    // 前端过滤（数据量小，直接拉全量树）
    loadTree()
}

const handleReset = () => {
    searchForm.name = ''
    loadTree()
}

const collectDescendantIds = (node: CategoryNode, acc: Set<number>) => {
    acc.add(node.id)
    node.children?.forEach((c) => collectDescendantIds(c, acc))
}

const openModal = (type: 'add' | 'edit', row?: CategoryNode) => {
    modal.type = type
    modal.disabledIds = new Set()
    if (type === 'edit' && row) {
        modal.title = '编辑分类'
        form.id = row.id
        form.parentId = row.parentId === 0 ? undefined : row.parentId
        form.name = row.name
        form.sort_order = row.sort_order ?? 0
        // 收集自身及所有后代 id，禁止选作父级
        const disabled = new Set<number>()
        const target = treeData.value.find((n) => n.id === row.id)
        if (target) collectDescendantIds(target, disabled)
        modal.disabledIds = disabled
    } else {
        modal.title = row ? '添加子分类' : '添加分类'
        form.id = undefined
        form.parentId = row?.id
        form.name = ''
        form.sort_order = 0
    }
    modal.show = true
}

const handleSubmit = async () => {
    await formRef.value?.validate()
    const payload = {
        name: form.name.trim(),
        parentId: form.parentId,
        sort_order: form.sort_order
    }
    let res: Result
    if (modal.type === 'edit' && form.id) {
        res = await updateCategoryApi(form.id, {
            ...payload,
            id: form.id
        })
    } else {
        res = await addCategoryApi(payload)
    }
    if (res.code === 0) {
        ElMessage.success(res.msg || '保存成功')
        modal.show = false
        loadTree()
    } else {
        ElMessage.error(res.msg || '保存失败')
    }
}

const handleDelete = (row: CategoryNode) => {
    const hasChildren = !!row.children?.length
    ElMessageBox.confirm(
        `确定要删除「${row.name}」吗？${hasChildren ? '其下所有子分类将一并删除！' : ''}`,
        '删除分类',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }
    )
        .then(async () => {
            const res: Result = await deleteCategoryApi(row.id)
            if (res.code === 0) {
                ElMessage.success(res.msg || '删除成功')
                loadTree()
            } else {
                ElMessage.error(res.msg || '删除失败')
            }
        })
        .catch(() => {})
}

onMounted(() => {
    loadTree()
})
</script>

<style scoped>
.classify-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}
</style>