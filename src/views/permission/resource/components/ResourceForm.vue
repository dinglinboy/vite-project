<template>
  <el-dialog
	:title="dialogTitle"
	v-model="visible"
	width="800px"
	:before-close="handleClose"
  >
	<el-form
	  ref="formRef"
	  :model="form"
	  :rules="rules"
	  label-width="100px"
	  class="resource-form"
	>
	  <el-row :gutter="20">
		<el-col :span="12">
		  <el-form-item label="菜单名称" prop="menuName">
			<el-input v-model="form.menuName" placeholder="请输入菜单名称" />
		  </el-form-item>
		</el-col>
		<el-col :span="12">
		  <el-form-item label="排序" prop="sortIndex">
			<el-input-number v-model="form.sortIndex" :min="0" placeholder="请输入排序" />
		  </el-form-item>
		</el-col>
	  </el-row>

	  <el-row :gutter="20">
		<el-col :span="12">
		  <el-form-item label="菜单类型" prop="menuType">
			<el-select v-model="form.menuType" placeholder="请选择菜单类型">
			  <el-option label="目录" value="M" />
			  <el-option label="菜单" value="C" />
			  <el-option label="按钮" value="F" />
			</el-select>
		  </el-form-item>
		</el-col>
		<el-col :span="12">
		  <el-form-item label="父菜单">
			<el-select v-model="form.parentId" placeholder="请选择父菜单" clearable>
			  <el-option label="顶级菜单" :value="0" />
			  <el-option
				v-for="option in parentOptions"
				:key="option.value"
				:label="option.label"
				:value="option.value"
				:disabled="option.value === form.id"
			  />
			</el-select>
		  </el-form-item>
		</el-col>
	  </el-row>

	  <el-row :gutter="20">
		<el-col :span="12">
		  <el-form-item label="路由地址" prop="path">
			<el-input v-model="form.path" placeholder="请输入路由地址" />
		  </el-form-item>
		</el-col>
		<el-col :span="12">
		  <el-form-item label="路由参数">
			<el-input v-model="form.query" placeholder="请输入路由参数" />
		  </el-form-item>
		</el-col>
	  </el-row>

	  <el-row :gutter="20">
		<el-col :span="12">
		  <el-form-item label="组件路径">
			<el-input v-model="form.component" placeholder="请输入组件路径" />
		  </el-form-item>
		</el-col>
		<el-col :span="12">
		  <el-form-item label="菜单图标">
			<el-input v-model="form.icon" placeholder="请输入菜单图标" />
		  </el-form-item>
		</el-col>
	  </el-row>

	  <el-row :gutter="20">
		<el-col :span="12">
		  <el-form-item label="权限标识">
			<el-input v-model="form.perms" placeholder="请输入权限标识" />
		  </el-form-item>
		</el-col>
		<el-col :span="12">
		  <el-form-item label="是否缓存">
			<el-radio-group v-model="form.isCache">
			  <el-radio label="0">缓存</el-radio>
			  <el-radio label="1">不缓存</el-radio>
			</el-radio-group>
		  </el-form-item>
		</el-col>
	  </el-row>

	  <el-row :gutter="20">
		<el-col :span="12">
		  <el-form-item label="是否外链">
			<el-radio-group v-model="form.isFrame">
			  <el-radio label="0">是</el-radio>
			  <el-radio label="1">否</el-radio>
			</el-radio-group>
		  </el-form-item>
		</el-col>
		<el-col :span="12">
		  <el-form-item label="菜单状态">
			<el-radio-group v-model="form.status">
			  <el-radio label="0">正常</el-radio>
			  <el-radio label="1">停用</el-radio>
			</el-radio-group>
		  </el-form-item>
		</el-col>
	  </el-row>

	  <el-row :gutter="20">
		<el-col :span="12">
		  <el-form-item label="显示状态">
			<el-radio-group v-model="form.visible">
			  <el-radio label="0">显示</el-radio>
			  <el-radio label="1">隐藏</el-radio>
			</el-radio-group>
		  </el-form-item>
		</el-col>
	  </el-row>
	</el-form>

	<template #footer>
	  <div class="dialog-footer">
		<el-button @click="handleClose">取消</el-button>
		<el-button type="primary" @click="handleSubmit" :loading="loading">
		  {{ isEdit ? '更新' : '创建' }}
		</el-button>
	  </div>
	</template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {MenuData as MenuForm, ParentOption} from '../interface';



// Props
const props = defineProps<{
  modelValue: boolean
  formData?: MenuForm
  parentOptions: ParentOption[]
}>()

// Emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', data: MenuForm): void
}>()

// 响应式数据
const formRef = ref<FormInstance>()
const loading = ref(false)

// 表单数据
const form = reactive<MenuForm>({
  id: undefined,
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

// 表单验证规则
const rules: FormRules = {
  menuName: [
	{ required: true, message: '请输入菜单名称', trigger: 'blur' }
  ],
  menuType: [
	{ required: true, message: '请选择菜单类型', trigger: 'change' }
  ],
  path: [
	{ required: true, message: '请输入路由地址', trigger: 'blur' }
  ],
  sortIndex: [
	{ required: true, message: '请输入排序', trigger: 'blur' },
	{ type: 'number', message: '排序必须为数字', trigger: 'blur' }
  ]
}

// 计算属性
const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

const isEdit = computed(() => !!form.id)

const dialogTitle = computed(() => isEdit.value ? '编辑菜单' : '新增菜单')

// 方法
const resetForm = () => {
  form.id = undefined
  form.menuName = ''
  form.sortIndex = 0
  form.parentId = 0
  form.path = ''
  form.query = ''
  form.component = ''
  form.icon = ''
  form.menuType = ''
  form.isCache = '0'
  form.isFrame = '1'
  form.status = '0'
  form.visible = '0'
  form.perms = ''
  
  // 清除表单验证
  formRef.value?.clearValidate()
}

// 监听表单数据变化
watch(() => props.formData, (newData) => {
  if (newData) {
	Object.assign(form, newData)
  } else {
	resetForm()
  }
}, { immediate: true, deep: true })

const handleClose = () => {
  visible.value = false
  resetForm()
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
	await formRef.value.validate()
	loading.value = true
	
	// 提交表单数据
	emit('submit', { ...form })
	
	ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
	handleClose()
  } catch (error) {
	console.error('表单验证失败:', error)
  } finally {
	loading.value = false
  }
}
</script>

<style scoped>
.resource-form {
  padding: 20px 0;
}

.dialog-footer {
  text-align: right;
}
</style>