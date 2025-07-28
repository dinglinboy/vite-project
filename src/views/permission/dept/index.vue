<template>
    <el-card class="box-card">
        <template #header>
            <div class="card-header">
                <el-form inline>
                    <el-form-item label="部门名称">
                        <el-input
                            v-model="searchOpt.deptName"
                            placeholder="请输入部门名称"
                        ></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button
                            type="primary"
                            class="button"
                            @click="getDeptList()"
                            >查询</el-button>
                        <el-button @click="resetHandler">重置</el-button>
                        <el-button type="primary" @click="openModifyDialog(null)"
                            >新增部门</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </template>
        <el-table :data="deptList" border>
            <el-table-column prop="deptName" label="部门名称" />
            <el-table-column prop="createTime" label="创建时间">
                <template #default="{ row }">{{
                    dayjs(row.createTime).format('YYYY-MM-DD hh:mm:ss')
                }}</template>
            </el-table-column>
            <el-table-column prop="updateTime" label="更新时间">
                <template #default="{ row }">{{
                    dayjs(row.updateTime).format('YYYY-MM-DD hh:mm:ss')
                }}</template>
            </el-table-column>
            <el-table-column label="操作">
                <template #default="{ row }">
                    <el-button type="primary" @click="openModifyDialog(row)"
                        >编辑</el-button>
                    <el-button @click="openDetailDialog(row)">详情</el-button>
                    <el-button type="danger" @click="delDeptInfo(row.deptId)"
                        >删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <!-- 分页 -->
        <div class="pagination-container">
            <el-pagination
                v-model:current-page="searchOpt.pageNum"
                v-model:page-size="searchOpt.pageSize"
                :page-sizes="[10, 20, 50, 100]"
                :total="total"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="getDeptList"
                @current-change="getDeptList"
            />
        </div>
        <modify ref="modifyRef" @update:success="getDeptList"></modify>
        <detail ref="detailRef"></detail>
    </el-card>
</template>

<script lang="ts" setup>
// 若找不到模块，可能需要检查路径是否正确，以下假设路径为相对路径进行修改
import { getDeptListApi, deleteDeptInfoApi } from '@/api/dept'
import { onMounted, ref, reactive } from 'vue'
import { Dept, getDeptListResponse } from '@/api/types/response'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import modify from './modify.vue'
import detail from './detail.vue'

const searchOpt = reactive({
    deptName: '',
    pageSize: 10,
    pageNum: 1
})
const total = ref(0)
const deptList = ref<Dept[]>([])
const modifyRef = ref<{ openDialog: (deptInfo: Dept | null) => void } | null>(null)
const currentDeptInfo = ref<Dept | null>(null)
const detailRef = ref<{ opendialog: (deptInfo: Dept) => void } | null>(null)

onMounted(() => {
    getDeptList()
})

const getDeptList = async (pageNum = 1) => {
    searchOpt.pageNum = pageNum
    searchOpt.deptName = searchOpt.deptName.trim()
    try {
        const res: getDeptListResponse = await getDeptListApi({ ...searchOpt })
        if (res.code !== 0) {
            return ElMessage.error(res.message)
        }
        deptList.value = res?.result?.data || []
        total.value = res?.result?.total
    } catch (error) {
        console.error(error)
    }
}

const resetHandler = () => {
    searchOpt.deptName = ''
    getDeptList()
}

const openModifyDialog = (deptInfo: Dept | null) => {
    modifyRef?.value?.openDialog(deptInfo)
}

const openDetailDialog = (deptInfo: Dept) => {
    currentDeptInfo.value = deptInfo
    detailRef.value?.opendialog(deptInfo)
}

const delDeptInfo = async (deptId: string) => {
    const res = await deleteDeptInfoApi(deptId)
    if (res.code !== 0) {
        return ElMessage.error(res.message)
    }
    ElMessage.success('删除成功')
    getDeptList()
}
</script>

<style lang="scss" scoped>
.box-card {
    margin-bottom: 20px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.pagination-container {
    margin-top: 20px;
    text-align: right;
}

.el-pagination {
    margin-top: 10px;
}

.dept-list {
    padding: 20px;
}
</style>