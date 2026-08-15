<template>
    <el-dropdown class="cursor">
        <span class="el-dropdown-link">
            <span class="nick-name">{{
                userStore.userInfo.nickname || userStore.userInfo.username || ''
            }}</span>
            <el-avatar
                src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
                @error="() => true"
            >
                <img
                    src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png"
                    alt=""
                />
            </el-avatar>
        </span>
        <template #dropdown>
            <el-dropdown-menu>
                <el-dropdown-item @click="handlePersonCenterClick"
                    >个人中心</el-dropdown-item
                >
                <el-dropdown-item @click="handleLogoutClick"
                    >退出登录</el-dropdown-item
                >
            </el-dropdown-menu>
        </template>
    </el-dropdown>
</template>
<script lang="ts" setup>
import 'element-plus/es/components/message-box/style/css'
import { ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import {
    clearUserInfo,
    clearJwtToken,
    clearLoginToken,
    getLoginToken
} from '@/util/util'
import { useUserStore } from '@/store/user'
import { logoutApi } from '@/api/permission'
const router = useRouter()
const userStore = useUserStore()
const handlePersonCenterClick = () => {
    router.push('/profile')
}
const handleLogoutClick = () => {
    ElMessageBox.confirm('确定登出吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(async () => {
        // 服务端登出（删除 redis token），失败不阻塞本地登出
        const loginToken = getLoginToken()
        if (loginToken) {
            logoutApi(loginToken).catch((): boolean => false)
        }
        userStore.reset()
        clearUserInfo()
        clearJwtToken()
        clearLoginToken()
        router.replace('/login')
    })
}
</script>
<style lang="scss">
.nick-name {
    margin-right: 8px;
    color: #333;
}
</style>
