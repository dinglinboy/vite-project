<template>
	<el-dialog
		v-model="dialogFlag"
		title="角色详情">
		<el-form>
			<el-form-item label="角色名称">
				<el-input :value="roleInfo.roleName" readonly></el-input>
			</el-form-item>
			<el-form-item label="角色标识">
				<el-input :value="roleInfo.roleKey" readonly></el-input>
			</el-form-item>
			<el-form-item label="角色描述">
				<el-input :value="roleInfo.remark" readonly></el-input>
			</el-form-item>
			<el-form-item label="创建时间">
				<el-input :value="roleInfo.createTime" readonly></el-input>
			</el-form-item>
			<el-form-item label="更新时间">
				<el-input :value="roleInfo.updateTime" readonly></el-input>
			</el-form-item>
		</el-form>
	</el-dialog>
</template>
<script lang="ts" setup>
import { Role } from '@/api/types/response'
import { ref } from 'vue'
const dialogFlag = ref(false)
const roleInfo = ref<Role>({
	roleName: '',
	roleKey: '',
	remark: '',
	createTime: '',
	updateTime: ''
})
const opendialog = (data: Role) => {
	roleInfo.value = data
	dialogFlag.value = true
}
defineExpose({
	opendialog
})
</script>