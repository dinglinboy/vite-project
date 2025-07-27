<template>
    <div class="login-page">
        <div class="particles">
            <div v-for="n in 20" :key="n" class="particle" :style="{ '--i': n }"></div>
        </div>
        <div class="signup-logo">
            <img src="/mall-logo-modern.svg" height="120" />
            <div class="signup-title">用户注册</div>
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
                ></el-input>
            </el-form-item>
            <el-form-item>
                <el-button
                    :disabled="loading"
                    size="large"
                    @click="submit(ruleFormRef)"
                    type="success"
                    class="submit"
                    :loading="loading"
                    >注册</el-button
                >
            </el-form-item>
            <div class="login-link">
                <span @click="jumpToLogin" class="cursor">已有账号？去登录</span>
            </div>
        </el-form>
    </div>
</template>
<script lang="ts" setup>
import { User, Lock } from '@element-plus/icons-vue'
import { reactive, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { register } from '@/api/index'
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
            register({ username, password })
                .then((res) => {
                    const { code, msg } = res
                    if (code === 0) {
                        ElMessage.success('注册成功,3秒后自动跳转登录页')
                        resetForm(ruleFormRef.value)
                        setTimeout(() => {
                            router.push('/login')
                        }, 3000)
                    } else {
                        ElMessage.warning(msg || '注册成功')
                    }
                })
                .catch((err) => {
                    ElMessage.error(err.message)
                })
        } else {
            resetForm(ruleFormRef.value)
        }
        loading.value = false
    })
}

// 跳转登录页面
const jumpToLogin = () => {
    router.push('/login')
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
    window.addEventListener('mousemove', handleMouseMove);
})

onBeforeUnmount(() => {
    window.removeEventListener('mousemove', handleMouseMove);
})
</script>
<style lang="scss">
@import './signUp.scss';
</style>
