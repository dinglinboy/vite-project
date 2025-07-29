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
            <el-table-column prop="menuId" label="菜单ID" width="80" />
            <el-table-column prop="menuName" label="菜单名称" min-width="120" />
            <el-table-column prop="sortIndex" label="排序" width="80" />
            <el-table-column prop="menuType" label="菜单类型" width="100">
                <template #default="{ row }">
                    <el-tag :type="getMenuTypeTagType(row.menuType)">
                        {{ getMenuTypeText(row.menuType) }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="parentId" label="父菜单" min-width="120">
                <template #default="{ row }">
                    {{ getParentMenuName(row.parentId) }}
                </template>
            </el-table-column>
            <el-table-column prop="path" label="路由地址" min-width="150" />
            <el-table-column prop="component" label="组件路径" min-width="150" />
            <el-table-column prop="icon" label="图标" width="80">
                <template #default="{ row }">
                    <i :class="row.icon" v-if="row.icon"></i>
                </template>
            </el-table-column>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ResourceForm from './components/ResourceForm.vue'
import ResourceDetail from './components/detail.vue'
import { MenuData, ParentOption } from './interface'
import type { TagProps } from 'element-plus'
import { 
  getMenuList, 
  getMenuTree, 
  createMenu, 
  updateMenu, 
  deleteMenu,
  type MenuEntity,
  type ListMenuDto,
  type CreateMenuDto,
  type UpdateMenuDto,
  MenuType,
  MenuStatus,
  MenuVisible
} from '@/api/menu'
// 响应式数据
const loading = ref(false)
const dialogVisible = ref(false)
const currentFormData = ref<MenuData | undefined>()
const detailRef = ref()

// 搜索表单
const searchForm = reactive({
    menuName: '',
    menuType: '',
    parentId: 0,
    status: ''
})

// 分页数据
const pagination = reactive({
    currentPage: 1,
    pageSize: 10,
    total: 0
})

// 表格数据
const tableData = ref<MenuEntity[]>([])

// 父菜单选项数据
const parentMenuData = ref<MenuEntity[]>([])

// 父菜单选项（只包含目录和菜单类型）
const parentResourceOptions = computed(() => {
  return parentMenuData.value
    .filter(item => item.menuType === MenuType.DIRECTORY || item.menuType === MenuType.MENU)
    .map(item => ({
      label: item.menuName,
      value: item.menuId!
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
const getParentMenuName = (parentId: number | null) => {
  if (!parentId) return '顶级菜单'
  const parent = parentMenuData.value.find(item => item.menuId === parentId)
  return parent ? parent.menuName : '未知'
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const params: ListMenuDto = {
      pageNum: pagination.currentPage,
      pageSize: pagination.pageSize,
      menuName: searchForm.menuName || undefined,
      menuType: searchForm.menuType as any || undefined,
      parentId: searchForm.parentId || 0,
      status: searchForm.status as MenuStatus || undefined
    }
    
    const response = await getMenuList(params)
    if (response.code === 0) {
      tableData.value = response.result.data
      pagination.total = response.result.total
    } else {
      ElMessage.error(response.msg || '获取菜单列表失败')
    }
  } catch (error) {
    console.error('获取菜单列表失败:', error)
    ElMessage.error('获取菜单列表失败')
  } finally {
    loading.value = false
  }
}

// 加载父菜单选项
const loadParentMenuOptions = async () => {
  try {
    const response = await getMenuTree()
    if (response.code === 0) {
      parentMenuData.value = response.result
    }
  } catch (error) {
    console.error('获取父菜单选项失败:', error)
  }
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
  searchForm.parentId = 0
  searchForm.status = ''
  loadData()
}

// 新增
const handleAdd = () => {
  currentFormData.value = undefined
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: MenuEntity) => {
  // 转换数据格式以适配现有的表单组件
  const formData: MenuData = {
    id: row.menuId,
    menuName: row.menuName,
    sortIndex: row.sortIndex || 0,
    parentId: row.parentId || 0,
    path: row.path || '',
    query: row.query || '',
    component: row.component || '',
    icon: row.icon || '',
    menuType: row.menuType,
    isCache: row.isCache || '0',
    isFrame: row.isFrame || '1',
    status: row.status || '0',
    visible: row.visible || '0',
    perms: row.perms || '',
    createTime: row.createTime || ''
  }
  currentFormData.value = formData
  dialogVisible.value = true
}

// 详情
const handleDetail = (row: MenuEntity) => {
  // 转换数据格式以适配现有的详情组件
  const detailData: MenuData = {
    id: row.menuId,
    menuName: row.menuName,
    sortIndex: row.sortIndex || 0,
    parentId: row.parentId || 0,
    path: row.path || '',
    query: row.query || '',
    component: row.component || '',
    icon: row.icon || '',
    menuType: row.menuType,
    isCache: row.isCache || '0',
    isFrame: row.isFrame || '1',
    status: row.status || '0',
    visible: row.visible || '0',
    perms: row.perms || '',
    createTime: row.createTime || ''
  }
  detailRef.value?.openDialog(detailData)
}

// 删除
const handleDelete = async (row: MenuEntity) => {
  ElMessageBox.confirm(
    `确定要删除菜单"${row.menuName}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const response = await deleteMenu(row.menuId!)
      if (response.code === 0) {
        ElMessage.success('删除成功')
        loadData()
        loadParentMenuOptions() // 重新加载父菜单选项
      } else {
        ElMessage.error(response.msg || '删除失败')
      }
    } catch (error) {
      console.error('删除菜单失败:', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 表单提交
const handleFormSubmit = async (formData: MenuData) => {
  try {
    if (formData.id) {
      // 编辑模式
      const updateData: UpdateMenuDto = {
        menuId: formData.id,
        menuName: formData.menuName,
        sortIndex: formData.sortIndex,
        parentId: formData.parentId || 0,
        path: formData.path,
        query: formData.query,
        component: formData.component,
        icon: formData.icon,
        menuType: formData.menuType as MenuType,
        isCache: formData.isCache,
        isFrame: formData.isFrame,
        status: formData.status as MenuStatus,
        visible: formData.visible as MenuVisible,
        perms: formData.perms
      }
      
      const response = await updateMenu(updateData)
      if (response.code === 0) {
        ElMessage.success('更新成功')
        dialogVisible.value = false
        loadData()
        loadParentMenuOptions() // 重新加载父菜单选项
      } else {
        ElMessage.error(response.msg || '更新失败')
      }
    } else {
      // 新增模式
      const createData: CreateMenuDto = {
        menuName: formData.menuName,
        sortIndex: formData.sortIndex,
        parentId: formData.parentId || 0,
        path: formData.path,
        query: formData.query,
        component: formData.component,
        icon: formData.icon,
        menuType: formData.menuType as MenuType,
        isCache: formData.isCache,
        isFrame: formData.isFrame,
        status: formData.status as MenuStatus,
        visible: formData.visible as MenuVisible,
        perms: formData.perms
      }
      
      const response = await createMenu(createData)
      if (response.code === 0) {
        ElMessage.success('创建成功')
        dialogVisible.value = false
        loadData()
        loadParentMenuOptions() // 重新加载父菜单选项
      } else {
        ElMessage.error(response.msg || '创建失败')
      }
    }
  } catch (error) {
    console.error('提交表单失败:', error)
    ElMessage.error('操作失败')
  }
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
onMounted(() => {
  loadParentMenuOptions()
  loadData()
})
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