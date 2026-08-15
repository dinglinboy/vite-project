<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <el-dialog
        v-model="dialogFlag"
        :title="form.roleId ? '编辑角色' : '新增角色'"
        width="620px"
        destroy-on-close
        append-to-body
    >
        <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
            <el-form-item label="角色名称" prop="roleName">
                <el-input
                    v-model="form.roleName"
                    placeholder="请输入角色名称"
                    maxlength="30"
                ></el-input>
            </el-form-item>
            <el-form-item label="角色标识" prop="roleKey">
                <el-input
                    v-model="form.roleKey"
                    placeholder="如：common"
                    maxlength="100"
                    :disabled="form.roleKey === 'admin'"
                ></el-input>
            </el-form-item>
            <el-form-item label="显示顺序">
                <el-input-number v-model="form.roleSort" :min="0" :max="999" />
            </el-form-item>
            <el-form-item label="状态">
                <el-radio-group v-model="form.status">
                    <el-radio label="0">正常</el-radio>
                    <el-radio label="1">停用</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="菜单权限">
                <el-tree
                    ref="menuTreeRef"
                    :data="menuTree"
                    node-key="menuId"
                    show-checkbox
                    default-expand-all
                    :props="{ label: 'menuName', children: 'children' }"
                    class="menu-tree"
                >
                    <template #default="{ data }">
                        <span>
                            {{ data.menuName }}
                            <el-tag
                                v-if="data.menuType === 'F'"
                                size="small"
                                type="info"
                                >按钮</el-tag
                            >
                        </span>
                    </template>
                </el-tree>
            </el-form-item>
            <el-form-item label="角色描述">
                <el-input
                    v-model="form.remark"
                    type="textarea"
                    maxlength="200"
                ></el-input>
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="dialogFlag = false">取 消</el-button>
            <el-button type="primary" :loading="loading" @click="submitRoleInfo"
                >确 定</el-button
            >
        </template>
    </el-dialog>
</template>
<script lang="ts" setup>
import { nextTick, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Role } from '@/api/types/response'
import { addRoleInfoApi, updateRoleInfoApi } from '@/api/role'
import { getMenuTree, MenuEntity } from '@/api/menu'

const emit = defineEmits(['update:success'])
const dialogFlag = ref(false)
const loading = ref(false)
const formRef = ref<FormInstance>()
const menuTreeRef = ref()
const menuTree = ref<MenuEntity[]>([])

const form = reactive<Partial<Role> & { roleSort?: number }>({
    roleId: undefined,
    roleName: '',
    roleKey: '',
    roleSort: 0,
    status: '0',
    remark: ''
})

const rules = reactive<FormRules>({
    roleName: [
        { required: true, message: '请输入角色名称', trigger: 'change' }
    ],
    roleKey: [{ required: true, message: '请输入角色标识', trigger: 'change' }]
})

/**
 * 收集勾选的菜单ID（全选 + 半选的父级，半选父级必须带上否则菜单树断链）
 */
const collectMenuIds = (): number[] => {
    const tree = menuTreeRef.value
    if (!tree) return []
    return [...tree.getCheckedKeys(), ...tree.getHalfCheckedKeys()].map(Number)
}

/**
 * 回显勾选：只勾叶子节点，父子联动自动带出父级半选
 * （后端存的 checkedKeys 含父级 id，若直接 setCheckedKeys 会把父级下所有子级全勾）
 */
const setCheckedLeafOnly = (checkedKeys: number[]) => {
    nextTick(() => {
        const tree = menuTreeRef.value
        if (!tree) return
        const childIds = new Set<number>()
        const walk = (nodes: MenuEntity[]) => {
            nodes.forEach((n) => {
                if (n.children?.length) walk(n.children)
                else childIds.add(n.menuId as number)
            })
        }
        walk(menuTree.value)
        const leafChecked = checkedKeys.filter((id) => childIds.has(id))
        tree.setCheckedKeys(leafChecked)
    })
}

const opendialog = async (roleInfo?: Role | null) => {
    Object.assign(form, {
        roleId: undefined,
        roleName: '',
        roleKey: '',
        roleSort: 0,
        status: '0',
        remark: ''
    })
    if (roleInfo) {
        form.roleName = roleInfo.roleName
        form.roleKey = roleInfo.roleKey
        form.roleSort = roleInfo.roleSort ?? 0
        form.status = roleInfo.status ?? '0'
        form.remark = (roleInfo.remark as string) ?? ''
        form.roleId = roleInfo.roleId
    }
    dialogFlag.value = true
    // 拉菜单树；编辑时用 roleMenuTreeSelect 一次拿树+已选
    try {
        if (roleInfo?.roleId) {
            const { getRoleMenuTreeSelect } = await import('@/api/menu')
            const res = await getRoleMenuTreeSelect(roleInfo.roleId)
            if (res.code === 0) {
                menuTree.value = res.result.menus || []
                setCheckedLeafOnly(res.result.checkedKeys || [])
            }
        } else {
            const res = await getMenuTree()
            if (res.code === 0) {
                menuTree.value = res.result || []
                nextTick(() => menuTreeRef.value?.setCheckedKeys([]))
            }
        }
    } catch (error) {
        console.error(error)
    }
}

const submitRoleInfo = async () => {
    const valid = await formRef.value?.validate().catch(() => false)
    if (!valid) return
    loading.value = true
    const payload = {
        roleName: form.roleName,
        roleKey: form.roleKey,
        roleSort: form.roleSort,
        status: form.status,
        remark: form.remark,
        menuIds: collectMenuIds(),
        ...(form.roleId ? { roleId: form.roleId } : undefined)
    }
    try {
        const fn = form.roleId ? updateRoleInfoApi : addRoleInfoApi
        const res = await fn(payload as Role)
        if (res.code !== 0) {
            return ElMessage.error(res.msg || res.message || '操作失败')
        }
        ElMessage.success('操作成功')
        emit('update:success')
        dialogFlag.value = false
    } catch (error) {
        console.error(error)
    } finally {
        loading.value = false
    }
}
defineExpose({
    opendialog
})
</script>
<style lang="scss" scoped>
.menu-tree {
    width: 100%;
    max-height: 260px;
    overflow: auto;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 4px;
}
</style>
