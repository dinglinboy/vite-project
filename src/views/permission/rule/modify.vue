<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <el-dialog
        v-model="visible"
        :title="title"
        width="640px"
        destroy-on-close
        append-to-body
    >
        <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
            <el-form-item label="上级菜单" prop="parentId">
                <el-tree-select
                    v-model="form.parentId"
                    :data="parentOptions"
                    :props="{ label: 'menuName', value: 'menuId' }"
                    node-key="menuId"
                    check-strictly
                    default-expand-all
                    placeholder="不选则为根目录"
                    style="width: 100%"
                />
            </el-form-item>
            <el-form-item label="菜单类型" prop="menuType">
                <el-radio-group v-model="form.menuType">
                    <el-radio label="M">目录</el-radio>
                    <el-radio label="C">菜单</el-radio>
                    <el-radio label="F">按钮</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="菜单名称" prop="menuName">
                <el-input
                    v-model="form.menuName"
                    placeholder="请输入菜单名称"
                    maxlength="50"
                />
            </el-form-item>
            <el-form-item label="显示排序" prop="sortIndex">
                <el-input-number v-model="form.sortIndex" :min="0" :max="999" />
            </el-form-item>
            <template v-if="form.menuType !== MenuType.BUTTON">
                <el-form-item label="菜单图标">
                    <el-input
                        v-model="form.icon"
                        placeholder="图标名，如 Goods / Setting"
                        maxlength="100"
                    />
                </el-form-item>
                <el-form-item label="路由地址" prop="path">
                    <el-input
                        v-model="form.path"
                        :placeholder="pathPlaceholder"
                        maxlength="200"
                    />
                </el-form-item>
            </template>
            <el-form-item
                v-if="form.menuType === MenuType.MENU"
                label="组件路径"
            >
                <el-input
                    v-model="form.component"
                    placeholder="views 下相对路径，如 product/list/index"
                    maxlength="255"
                />
            </el-form-item>
            <el-form-item
                v-if="form.menuType !== MenuType.DIRECTORY"
                label="权限标识"
            >
                <el-input
                    v-model="form.perms"
                    placeholder="如 permission:user:add"
                    maxlength="100"
                />
            </el-form-item>
            <el-form-item
                v-if="form.menuType !== MenuType.BUTTON"
                label="显示状态"
            >
                <el-radio-group v-model="form.visible">
                    <el-radio label="0">显示</el-radio>
                    <el-radio label="1">隐藏</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="菜单状态">
                <el-radio-group v-model="form.status">
                    <el-radio label="0">正常</el-radio>
                    <el-radio label="1">停用</el-radio>
                </el-radio-group>
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="visible = false">取消</el-button>
            <el-button type="primary" :loading="loading" @click="submit"
                >确定</el-button
            >
        </template>
    </el-dialog>
</template>

<script lang="ts" setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
    getMenuTree,
    createMenu,
    updateMenu,
    MenuEntity,
    MenuType,
    MenuVisible,
    MenuStatus,
    CreateMenuDto
} from '@/api/menu'

/** 表单状态（字段类型比 CreateMenuDto 更严格，便于组件绑定） */
interface MenuFormState {
    menuId?: number
    parentId: number
    menuName: string
    menuType: MenuType
    sortIndex: number
    path: string
    component: string
    perms: string
    icon: string
    visible: MenuVisible
    status: MenuStatus
}

const emit = defineEmits<{
    (e: 'update:success'): void
}>()

const visible = ref(false)
const loading = ref(false)
const formRef = ref<FormInstance>()
const parentOptions = ref<MenuEntity[]>([])

const getDefaultForm = (): MenuFormState => ({
    menuId: undefined,
    parentId: 0,
    menuName: '',
    menuType: MenuType.DIRECTORY,
    sortIndex: 0,
    path: '',
    component: '',
    perms: '',
    icon: '',
    visible: MenuVisible.SHOW,
    status: MenuStatus.NORMAL
})

const form = reactive(getDefaultForm())

const title = computed(() => (form.menuId ? '编辑菜单' : '新增菜单'))

const pathPlaceholder = computed(() =>
    form.menuType === MenuType.DIRECTORY
        ? '一级填 /product，子级留空'
        : '子菜单相对路径，如 list'
)

const rules = reactive<FormRules>({
    menuName: [
        { required: true, message: '请输入菜单名称', trigger: 'change' }
    ],
    menuType: [
        { required: true, message: '请选择菜单类型', trigger: 'change' }
    ],
    path: [
        {
            validator: (_rule, value, callback) => {
                if (form.menuType !== MenuType.BUTTON && !value) {
                    callback(new Error('目录/菜单必须填写路由地址'))
                } else {
                    callback()
                }
            },
            trigger: 'change'
        }
    ]
})

/**
 * 打开对话框
 * @param menuInfo 编辑时传入的菜单行数据；新增传 null
 * @param parent 行内“新增”时传入的父菜单
 */
const openDialog = async (menuInfo: MenuEntity | null, parent?: MenuEntity) => {
    Object.assign(form, getDefaultForm())
    if (menuInfo) {
        // 编辑：回填行数据
        Object.assign(form, menuInfo, {
            children: undefined
        })
        form.parentId = menuInfo.parentId ?? 0
    } else if (parent) {
        // 新增子菜单：父级默认挂在当前行下，类型按父级推断
        form.parentId = parent.menuId ?? 0
        form.menuType =
            parent.menuType === MenuType.DIRECTORY
                ? MenuType.MENU
                : MenuType.BUTTON
    }
    visible.value = true
    loadParentOptions(menuInfo?.menuId)
}

/**
 * 加载上级菜单可选树（去掉按钮节点；编辑时去掉自己及子孙，防止成环）
 */
const loadParentOptions = async (excludeMenuId?: number) => {
    const res = await getMenuTree()
    if (res.code !== 0) return
    const tree = stripButtons(res.result || [])
    const excluded = excludeMenuId ? removeSelf(tree, excludeMenuId) : tree
    parentOptions.value = [
        { menuId: 0, menuName: '根目录', menuType: MenuType.DIRECTORY },
        ...excluded
    ]
}

/**
 * 递归去掉 F 类型按钮节点
 */
const stripButtons = (nodes: MenuEntity[]): MenuEntity[] => {
    return nodes
        .filter((node) => node.menuType !== MenuType.BUTTON)
        .map((node) => ({
            ...node,
            children: node.children?.length ? stripButtons(node.children) : []
        }))
}

/**
 * 递归移除指定 id 节点（连同子树）
 */
const removeSelf = (nodes: MenuEntity[], menuId: number): MenuEntity[] => {
    return nodes
        .filter((node) => node.menuId !== menuId)
        .map((node) => ({
            ...node,
            children: node.children?.length
                ? removeSelf(node.children, menuId)
                : []
        }))
}

const submit = async () => {
    const valid = await formRef.value?.validate().catch(() => false)
    if (!valid) return
    loading.value = true
    try {
        const payload: CreateMenuDto = {
            menuName: form.menuName,
            parentId: form.parentId ?? 0,
            menuType: form.menuType,
            sortIndex: Number(form.sortIndex ?? 0),
            path: form.path || '',
            component: form.component || '',
            perms: form.perms || '',
            icon: form.icon || '',
            visible: form.visible,
            status: form.status
        }
        const res = form.menuId
            ? await updateMenu({ ...payload, menuId: form.menuId })
            : await createMenu(payload)
        if (res.code !== 0) {
            return ElMessage.error(res.msg || res.message || '保存失败')
        }
        ElMessage.success('保存成功')
        visible.value = false
        emit('update:success')
    } catch (error) {
        console.error(error)
    } finally {
        loading.value = false
    }
}

defineExpose({
    openDialog
})
</script>
