<template>
    <div class="login-page">
        <div class="login-page-logo">
            <img src="/public/vite.svg" height="200" />
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
                    >登陆</el-button
                >
            </el-form-item>
        </el-form>
    </div>
</template>
<script lang="ts" setup>
import { User, Lock } from '@element-plus/icons-vue'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { setUserInfo } from '@/util/util'
import { login } from '@/api/index'
const router = useRouter()
// 设置表单
const form = reactive({
    username: 'dinglin12',
    password: '12345678',
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
                console.log(res)
                setUserInfo({
                    username: form.username,
                    checked: form.checked,
                    jwt_token: res.jwt_token
                })
                const { redirect } = router.currentRoute.value.query
                router.push(redirect || '/')
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
</script>
<style lang="scss">
.login-page {
    font-size: 18px;
    box-sizing: border-box;
    width: 100vw;
    height: 100vh;
    background: cornflowerblue;
    &-logo {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 300px;
        img:hover {
            transform: scale(1.2);
            transition: all 0.3s linear;
        }
    }
    &-form {
        margin: auto;
        padding: 20px;
        border-radius: 5px;
        width: 500px;
        background: #fff;
        .user-inp {
            height: 50px;
            font-size: 18px;
            .el-input__icon {
                font-size: 18px;
            }
        }
        .submit {
            height: 50px;
            width: 100%;
            font-size: 18px;
        }
        .flexSpaceBetween {
            .el-form-item__content {
                width: 100%;
                display: flex;
                justify-content: space-between;
            }
        }
    }
}
</style>
