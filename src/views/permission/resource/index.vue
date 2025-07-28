<template>
  <div class="app-container">
    <el-card class="box-card">
        <template #header>
            <div class="card-header">
                <el-form :model="searchForm" :inline="true" label-width="80px">
                    <el-form-item label="菜单名称">
                        <el-input v-model="searchForm.menuName" placeholder="请输入菜单名称" clearable />
                    </el-form-item>
                    <el-form-item label="菜单类型">
                        <el-select v-model="searchForm.menuType" placeholder="请选择菜单类型" clearable>
                            <el-option label="目录" value="M" />
                            <el-option label="菜单" value="C" />
                            <el-option label="按钮" value="F" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="父菜单">
                        <el-select v-model="searchForm.parentId" placeholder="请选择父菜单" clearable>
                            <el-option label="顶级菜单" :value="0" />
                            <el-option
                                v-for="option in parentResourceOptions"
                                :key="option.value"
                                :label="option.label"
                                :value="option.value"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="状态">
                        <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
                            <el-option label="正常" value="0" />
                            <el-option label="停用" value="1" />
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="handleSearch">搜索</el-button>
                        <el-button @click="handleReset">重置</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </template>

        <div class="table-header">
            <el-button type="primary" @click="handleAdd">新增菜单</el-button>
        </div>

        <el-table :data="tableData" style="width: 100%" v-loading="loading">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="menuName" label="菜单名称" min-width="120" />
            <el-table-column prop="sortIndex" label="排序" width="80" />
            <el-table-column prop="menuType" label="菜单类型" width="100">
                <template #default="{ row }">
                    <el-tag :type="getMenuTypeTagType(row.menuType)">
                        {{ getMenuTypeText(row.menuType) }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="parentId" label="父菜单" width="120">
                <template #default="{ row }">
                    <el-tag v-if="row.parentId === 0" type="info" size="small">顶级菜单</el-tag>
                    <span v-else>{{ getParentMenuName(row.parentId) }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="path" label="路由地址" min-width="150" />
            <el-table-column prop="component" label="组件路径" min-width="150" />
            <el-table-column prop="icon" label="图标" width="80" />
            <el-table-column prop="perms" label="权限标识" min-width="120" />
            <el-table-column prop="status" label="状态" width="80">
                <template #default="{ row }">
                    <el-tag :type="getStatusTagType(row.status)">
                        {{ getStatusText(row.status) }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="visible" label="显示状态" width="100">
                <template #default="{ row }">
                    <el-tag :type="getVisibleTagType(row.visible)">
                        {{ getVisibleText(row.visible) }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="180" />
            <el-table-column label="操作" width="230">
                <template #default="scope">
                    <el-button type="primary" @click="handleEdit(scope.row)">编辑</el-button>
                    <el-button type="info" @click="handleDetail(scope.row)">详情</el-button>
                    <el-button type="danger" @click="handleDelete(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container">
            <el-pagination
                v-model:current-page="pagination.currentPage"
                v-model:page-size="pagination.pageSize"
                :page-sizes="[10, 20, 50, 100]"
                :total="pagination.total"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
            />
        </div>
    </el-card>

    <!-- 资源表单组件 -->
    <ResourceForm
      v-model="dialogVisible"
      :form-data="currentFormData"
      :parent-options="parentResourceOptions"
      @submit="handleFormSubmit"
    />

    <!-- 详情对话框 -->
    <ResourceDetail ref="detailRef" />
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ResourceForm from './components/ResourceForm.vue'
import ResourceDetail from './components/detail.vue'
import {MenuData, ParentOption} from './interface';
import type { TagProps } from 'element-plus';
// 响应式数据
const loading = ref(false)
const dialogVisible = ref(false)
const currentFormData = ref<MenuData | undefined>()
const detailRef = ref()

// 搜索表单
const searchForm = reactive({
    menuName: '',
    menuType: '',
    parentId: '',
    status: ''
})

// 分页数据
const pagination = reactive({
    currentPage: 1,
    pageSize: 10,
    total: 0
})

// 表格数据
const tableData = ref<MenuData[]>([
    {
        id: 1,
        menuName: '用户管理',
        sortIndex: 1,
        parentId: 0,
        path: '/permission/user',
        query: '',
        component: 'views/permission/user/index',
        icon: 'user',
        menuType: 'C',
        isCache: '0',
        isFrame: '1',
        status: '0',
        visible: '0',
        perms: '',
        createTime: '2024-01-15 10:30:00'
    },
    {
        id: 2,
        menuName: '添加用户',
        sortIndex: 1,
        parentId: 1,
        path: '',
        query: '',
        component: '',
        icon: '',
        menuType: 'F',
        isCache: '0',
        isFrame: '1',
        status: '0',
        visible: '0',
        perms: 'user:add',
        createTime: '2024-01-15 10:31:00'
    },
    {
        id: 3,
        menuName: '删除用户',
        sortIndex: 2,
        parentId: 1,
        path: '',
        query: '',
        component: '',
        icon: '',
        menuType: 'F',
        isCache: '0',
        isFrame: '1',
        status: '1',
        visible: '0',
        perms: 'user:delete',
        createTime: '2024-01-15 10:32:00'
    },
    {
        id: 4,
        menuName: '权限管理',
        sortIndex: 2,
        parentId: 0,
        path: '/permission',
        query: '',
        component: '',
        icon: 'lock',
        menuType: 'M',
        isCache: '0',
        isFrame: '1',
        status: '0',
        visible: '0',
        perms: '',
        createTime: '2024-01-15 10:33:00'
    },
    {
        id: 5,
        menuName: '角色管理',
        sortIndex: 1,
        parentId: 4,
        path: '/permission/role',
        query: '',
        component: 'views/permission/role/index',
        icon: 'peoples',
        menuType: 'C',
        isCache: '0',
        isFrame: '1',
        status: '0',
        visible: '0',
        perms: '',
        createTime: '2024-01-15 10:34:00'
    },
    {
        id: 6,
        menuName: '添加角色',
        sortIndex: 1,
        parentId: 5,
        path: '',
        query: '',
        component: '',
        icon: '',
        menuType: 'F',
        isCache: '0',
        isFrame: '1',
        status: '0',
        visible: '0',
        perms: 'role:add',
        createTime: '2024-01-15 10:35:00'
    }
])

// 父菜单选项（只包含目录和菜单类型）
const parentResourceOptions = computed(() => {
  return tableData.value
    .filter(item => item.menuType === 'M' || item.menuType === 'C')
    .map(item => ({
      label: item.menuName,
      value: item.id
    })) as ParentOption[]
})



// 方法
// 获取菜单类型文本
const getMenuTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    'M': '目录',
    'C': '菜单',
    'F': '按钮'
  }
  return typeMap[type] || type
}

// 获取菜单类型标签类型
const getMenuTypeTagType = (type: string) => {
  const typeMap: Record<string, TagProps['type']> = {
    'M': 'warning',
    'C': 'success',
    'F': 'info'
  }
  return (typeMap[type] || 'warning') as TagProps['type']
}

// 获取状态文本
const getStatusText = (status: string) => {
  return status === '0' ? '正常' : '停用'
}

// 获取状态标签类型
const getStatusTagType = (status: string) => {
  return status === '0' ? 'success' : 'danger'
}

// 获取显示状态文本
const getVisibleText = (visible: string) => {
  return visible === '0' ? '显示' : '隐藏'
}

// 获取显示状态标签类型
const getVisibleTagType = (visible: string) => {
  return visible === '0' ? 'success' : 'info'
}

// 获取父菜单名称
const getParentMenuName = (parentId: number) => {
  const parent = tableData.value.find(item => item.id === parentId)
  return parent ? parent.menuName : '未知'
}

// 加载数据
const loadData = () => {
  loading.value = true
  // 模拟API调用
  setTimeout(() => {
    pagination.total = tableData.value.length
    loading.value = false
  }, 500)
}

// 搜索
const handleSearch = () => {
  console.log('搜索条件:', searchForm)
  loadData()
}

// 重置搜索
const handleReset = () => {
  searchForm.menuName = ''
  searchForm.menuType = ''
  searchForm.parentId = ''
  searchForm.status = ''
  loadData()
}

// 新增
const handleAdd = () => {
  currentFormData.value = undefined
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: MenuData) => {
  currentFormData.value = { ...row }
  dialogVisible.value = true
}

// 详情
const handleDetail = (row: MenuData) => {
  detailRef.value?.openDialog(row)
}

// 删除
const handleDelete = (row: MenuData) => {
  ElMessageBox.confirm(
    `确定要删除菜单"${row.menuName}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 模拟删除操作
    const index = tableData.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      tableData.value.splice(index, 1)
      ElMessage.success('删除成功')
      loadData()
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 表单提交
const handleFormSubmit = (formData: MenuData): void => {
  if (formData.id) {
    // 编辑
    const index = tableData.value.findIndex(item => item.id === formData.id)
    if (index > -1) {
      tableData.value[index] = { ...formData, createTime: tableData.value[index].createTime }
    }
  } else {
    // 新增
    const newId = Math.max(...tableData.value.map(item => item.id)) + 1
    tableData.value.push({
      ...formData,
      id: newId,
      createTime: new Date().toLocaleString()
    })
  }
  loadData()
}

// 分页
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadData()
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
  loadData()
}

// 初始化
loadData()
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}

.box-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-header {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.el-pagination {
    margin-top: 10px;
}
</style>