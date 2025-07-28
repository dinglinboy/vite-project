<template>
  <el-dialog v-model="dialogVisible" title="菜单详情" width="60%">
    <el-form :model="menuInfo" label-width="100px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="菜单ID">
            <el-input v-model="menuInfo.id" disabled></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="菜单名称">
            <el-input v-model="menuInfo.menuName" disabled></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="菜单类型">
            <el-input :value="menuTypeText" disabled></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="排序">
            <el-input v-model="menuInfo.sortIndex" disabled></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="父菜单">
            <el-input :value="parentText" disabled></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="路由地址">
            <el-input v-model="menuInfo.path" disabled></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="路由参数">
            <el-input v-model="menuInfo.query" disabled></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="组件路径">
            <el-input v-model="menuInfo.component" disabled></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="菜单图标">
            <el-input v-model="menuInfo.icon" disabled></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="权限标识">
            <el-input v-model="menuInfo.perms" disabled></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="是否缓存">
            <el-input :value="cacheText" disabled></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否外链">
            <el-input :value="frameText" disabled></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="菜单状态">
            <el-input :value="statusText" disabled></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="显示状态">
            <el-input :value="visibleText" disabled></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-form-item label="创建时间">
        <el-input v-model="menuInfo.createTime" disabled></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, computed } from 'vue'

interface MenuInfo {
  id: number | null
  menuName: string
  sortIndex: number
  parentId: number
  path: string
  query: string
  component: string
  icon: string
  menuType: string
  isCache: string
  isFrame: string
  status: string
  visible: string
  perms: string
  createTime: string
}

const dialogVisible = ref(false)
const menuInfo = reactive<MenuInfo>({
  id: null,
  menuName: '',
  sortIndex: 0,
  parentId: 0,
  path: '',
  query: '',
  component: '',
  icon: '',
  menuType: '',
  isCache: '0',
  isFrame: '1',
  status: '0',
  visible: '0',
  perms: '',
  createTime: ''
})

// 计算菜单类型文本
const menuTypeText = computed(() => {
  const typeMap: Record<string, string> = {
    'M': '目录',
    'C': '菜单',
    'F': '按钮'
  }
  return typeMap[menuInfo.menuType] || menuInfo.menuType
})

// 计算菜单状态文本
const statusText = computed(() => {
  return menuInfo.status === '0' ? '正常' : '停用'
})

// 计算显示状态文本
const visibleText = computed(() => {
  return menuInfo.visible === '0' ? '显示' : '隐藏'
})

// 计算缓存状态文本
const cacheText = computed(() => {
  return menuInfo.isCache === '0' ? '缓存' : '不缓存'
})

// 计算外链状态文本
const frameText = computed(() => {
  return menuInfo.isFrame === '0' ? '是' : '否'
})

const parentText = computed(() => {
  return menuInfo.parentId === 0 ? '顶级菜单' : `父菜单ID: ${menuInfo.parentId}`
})

const openDialog = (info: MenuInfo) => {
  Object.assign(menuInfo, info)
  dialogVisible.value = true
}

defineExpose({
  openDialog
})
</script>

<style lang="scss" scoped>

</style>