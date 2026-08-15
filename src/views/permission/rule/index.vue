<template>
    <el-card class="box-card">
        <template #header>
            <div class="card-header">
                <el-form inline>
                    <el-form-item label="菜单名称">
                        <el-input
                            v-model="searchOpt.menuName"
                            placeholder="请输入菜单名称"
                            @keyup.enter="getMenuTreeList"
                        ></el-input>
                    </el-form-item>
                    <el-form-item label="状态">
                        <el-select
                            v-model="searchOpt.status"
                            placeholder="菜单状态"
                            clearable
                            style="width: 140px"
                        >
                            <el-option label="正常" value="0" />
                            <el-option label="停用" value="1" />
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button
                            type="primary"
                            class="button"
                            @click="getMenuTreeList()"
                            >查询</el-button
                        >
                        <el-button @click="resetHandler">重置</el-button>
                        <el-button
                            v-permission="['permission:menu:add']"
                            type="primary"
                            @click="openModifyDialog(null)"
                            >新增菜单</el-button
                        >
                    </el-form-item>
                </el-form>
            </div>
        </template>
        <el-table
            v-loading="loading"
            :data="menuList"
            row-key="menuId"
            border
            default-expand-all
            :tree-props="{ children: 'children' }"
        >
            <el-table-column
                prop="menuName"
                label="菜单名称"
                min-width="140"
                fixed
            />
            <el-table-column label="图标" width="60" align="center">
                <template #default="{ row }">
                    <el-icon v-if="row.icon && iconMap[row.icon]">
                        <component :is="iconMap[row.icon]" />
                    </el-icon>
                </template>
            </el-table-column>
            <el-table-column
                prop="sortIndex"
                label="排序"
                width="60"
                align="center"
            />
            <el-table-column label="类型" width="70" align="center">
                <template #default="{ row }">
                    <el-tag :type="typeTag[row.menuType]">
                        {{ typeName[row.menuType] }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="perms" label="权限标识" min-width="150" />
            <el-table-column prop="path" label="路由地址" min-width="100" />
            <el-table-column
                prop="component"
                label="组件路径"
                min-width="150"
            />
            <el-table-column label="状态" width="70" align="center">
                <template #default="{ row }">
                    <el-tag :type="row.status === '0' ? 'success' : 'danger'">
                        {{ row.status === '0' ? '正常' : '停用' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="创建时间" width="160">
                <template #default="{ row }">{{
                    dayjs(row.createTime).format('YYYY-MM-DD hh:mm:ss')
                }}</template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
                <template #default="{ row }">
                    <el-button
                        v-permission="['permission:menu:edit']"
                        type="primary"
                        link
                        @click="openModifyDialog(row)"
                        >编辑</el-button
                    >
                    <el-button
                        v-permission="['permission:menu:add']"
                        type="primary"
                        link
                        @click="openAddChildDialog(row)"
                        >新增</el-button
                    >
                    <el-button
                        v-permission="['permission:menu:remove']"
                        type="danger"
                        link
                        @click="delMenu(row)"
                        >删除</el-button
                    >
                </template>
            </el-table-column>
        </el-table>
        <modify ref="modifyRef" @update:success="getMenuTreeList"></modify>
    </el-card>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import { getMenuTree, deleteMenu, MenuEntity, MenuStatus } from '@/api/menu'
import { iconMap } from '@/util/iconMap'
import modify from './modify.vue'

const typeName: Record<string, string> = {
    M: '目录',
    C: '菜单',
    F: '按钮'
}
const typeTag: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
    M: 'info',
    C: 'success',
    F: 'warning'
}

const searchOpt = reactive({
    menuName: '',
    status: '' as '' | MenuStatus
})
const loading = ref(false)
const menuList = ref<MenuEntity[]>([])
const modifyRef = ref<{
    openDialog: (menuInfo: MenuEntity | null, parent?: MenuEntity) => void
} | null>(null)

onMounted(() => {
    getMenuTreeList()
})

/**
 * 拉取菜单树并按搜索条件过滤（命中节点的子级整棵保留）
 */
const getMenuTreeList = async () => {
    loading.value = true
    try {
        const res = await getMenuTree()
        if (res.code !== 0) {
            return ElMessage.error(res.msg || res.message || '查询失败')
        }
        menuList.value = filterTree(res.result || [])
    } catch (error) {
        console.error(error)
    } finally {
        loading.value = false
    }
}

/**
 * 递归过滤树：名称/状态任一命中则保留该节点（连同子树）
 */
const filterTree = (nodes: MenuEntity[]): MenuEntity[] => {
    const res: MenuEntity[] = []
    const name = searchOpt.menuName.trim()
    nodes.forEach((node) => {
        const nameMatch = !name || node.menuName.includes(name)
        const statusMatch =
            !searchOpt.status || node.status === searchOpt.status
        if (nameMatch && statusMatch) {
            res.push(node)
        } else if (node.children?.length) {
            const filteredChildren = filterTree(node.children)
            if (filteredChildren.length) {
                res.push({ ...node, children: filteredChildren })
            }
        }
    })
    return res
}

const resetHandler = () => {
    searchOpt.menuName = ''
    searchOpt.status = ''
    getMenuTreeList()
}

const openModifyDialog = (menuInfo: MenuEntity | null) => {
    modifyRef.value?.openDialog(menuInfo)
}

/**
 * 行内“新增”：在该菜单下新增子项
 */
const openAddChildDialog = (parent: MenuEntity) => {
    modifyRef.value?.openDialog(null, parent)
}

const delMenu = async (row: MenuEntity) => {
    try {
        await ElMessageBox.confirm(
            `确定删除菜单「${row.menuName}」吗？`,
            '提示',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }
        )
    } catch (error) {
        // 用户取消
        return
    }
    const res = await deleteMenu(row.menuId as number)
    if (res.code !== 0) {
        return ElMessage.error(res.msg || res.message || '删除失败')
    }
    ElMessage.success('删除成功')
    getMenuTreeList()
}
</script>

<style lang="scss" scoped>
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
</style>
