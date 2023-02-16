<template>
  <div class="login-page">
    <div class="login-page-logo">
      <img src="/public/vite.svg" height="200" />
    </div>
    <div class="login-page-form">
      <el-input
        class="user-inp"
        v-model="form.username"
        type="text"
        size="large"
        :prefix-icon="User"
        placeholder="请输入用户名"
      ></el-input>
      <el-input
        v-model="form.password"
        :prefix-icon="Lock"
        size="large"
        type="password"
        placeholder="请输入密码"
      ></el-input>
      <el-checkbox v-model="form.checked" label="记住密码" size="large" />
      <el-button
        :disabled="loading"
        size="large"
        @click="submit"
        type="success"
        class="submit"
        >登陆{{ loading ? '中' : '' }}</el-button
      >
    </div>
  </div>
</template>
<script lang="ts" setup>
import { User, Lock } from '@element-plus/icons-vue'
import { reactive, ref } from 'vue'
const form = reactive({
  username: '',
  password: '',
  checked: false
})
// 设置loading
const loading = ref(false)
const submit = () => {
  loading.value = !loading.value
  setTimeout(() => {
    loading.value = !loading.value
  }, 3000)
}
</script>
<style lang="scss">
.login-page {
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
  }
  &-form {
    margin: auto;
    padding: 20px;
    border-radius: 5px;
    width: 300px;
    background: #fff;
    .user-inp {
      margin-bottom: 20px;
    }
    .submit {
      width: 100%;
    }
  }
}
</style>
