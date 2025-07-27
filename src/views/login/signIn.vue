<template>
    <div class="login-page">
        <div class="particles">
            <div v-for="n in 20" :key="n" class="particle" :style="{ '--i': n }"></div>
        </div>
        <div class="mall-logo">
            <img src="/mall-logo-modern.svg" height="120" />
            <div class="mall-name">LUXURY MALL</div>
        </div>
        <el-form
            class="login-page-form"
            :rules="rules"
            :model="form"
            ref="ruleFormRef"
        >
            <el-form-item prop="username">
                <el-input
                    class="user-inp"
                    v-model="form.username"
                    type="text"
                    size="large"
                    :prefix-icon="User"
                    @keyup.enter="submit(ruleFormRef)"
                    placeholder="请输入用户名"
                ></el-input>
            </el-form-item>
            <el-form-item prop="password">
                <el-input
                    class="user-inp"
                    v-model="form.password"
                    :prefix-icon="Lock"
                    size="large"
                    type="password"
                    placeholder="请输入密码"
                    @keyup.enter="submit(ruleFormRef)"
                ></el-input>
            </el-form-item>
            <el-form-item class="flexSpaceBetween">
                <el-checkbox
                    v-model="form.checked"
                    label="记住密码"
                    size="large"
                />
                <span @click="jumpToRegister" class="cursor">注册账号</span>
            </el-form-item>
            <el-form-item>
                <el-button
                    :disabled="loading"
                    size="large"
                    @click="submit(ruleFormRef)"
                    type="success"
                    class="submit"
                    :loading="loading"
                    >登录</el-button
                >
            </el-form-item>
        </el-form>
    </div>
</template>
<script lang="ts" setup>
import { User, Lock } from '@element-plus/icons-vue'
import { reactive, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, LocationQueryValue } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { setUserInfo, getLoginInfo, setLoginInfo } from '@/util/util'
import { login } from '@/api/index'
import { getUserInfoByUsername } from '@/api/user'
import { ElMessage } from 'element-plus'
import { setJwtToken } from '@/util/util'
const router = useRouter()
// 设置表单
const form = reactive({
    username: '',
    password: '',
    checked: false
})
const ruleFormRef = ref<FormInstance>()
// 设置校验规则
const rules = reactive<FormRules>({
    username: [{ required: true, message: '请输入用户名', trigger: 'change' }],
    password: [{ required: true, message: '请输入密码', trigger: 'change' }]
})
// 设置loading
const loading = ref<boolean>(false)

// 设置重置表单
const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl?.resetFields()
}

// 提交登录信息
const submit = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    loading.value = true
    await formEl.validate((valid) => {
        if (valid) {
            const { username, password } = form
            login({ username, password }).then((res) => {
                if (res.code !== 0) {
                    ElMessage.error(res.msg)
                    loading.value = false
                    return
                }
                if (form.checked) {
                    setLoginInfo({
                        username: form.username,
                        password: form.password,
                        checked: form.checked
                    })
                }
                setJwtToken(res.result.jwtToken)
                getUserInfoByUsername({ username: form.username }).then(userRes => {
                    console.log(userRes)
                    if (userRes.code === 0) {
                        setUserInfo(userRes.result)
                    }
                })
                const { redirect } = router.currentRoute.value.query
                router.push((redirect as LocationQueryValue) || '/')
            })
        } else {
            resetForm(ruleFormRef.value)
        }
        loading.value = false
    })
}
// 跳转注册账号界面
const jumpToRegister = () => {
    router.push('/signUp')
}
const initForm = () => {
    const { username, password, checked } = getLoginInfo()
    if (checked) {
        form.username = username
        form.password = password
        form.checked = checked
    }
}
// 添加鼠标移动效果
const handleMouseMove = (e: MouseEvent) => {
    const particles = document.querySelectorAll('.particle');
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    
    particles.forEach((particle, index) => {
        const el = particle as HTMLElement;
        const factor = (index + 1) * 0.1;
        const offsetX = (x - 0.5) * factor * 100;
        const offsetY = (y - 0.5) * factor * 100;
        
        el.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    });
}

onMounted(() => {
    initForm();
    window.addEventListener('mousemove', handleMouseMove);
})

onBeforeUnmount(() => {
    window.removeEventListener('mousemove', handleMouseMove);
})
</script>
<style lang="scss">
@import './signIn.scss';
</style>
