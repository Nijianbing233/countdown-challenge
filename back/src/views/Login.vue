<template>
  <div class="login-bg">
    <div class="login-center">
      <el-card class="login-card">
        <h2 class="login-title">后台管理系统登录</h2>
        <el-form :model="form" @submit.prevent="onLogin" class="login-form">
          <el-form-item label="账号">
            <el-input v-model="form.username" autocomplete="off" class="login-input" placeholder="请输入账号" />
          </el-form-item>
          <el-form-item label="密码">
            <el-input v-model="form.password" type="password" autocomplete="off" class="login-input" placeholder="请输入密码" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onLogin" class="login-btn">登录</el-button>
          </el-form-item>
        </el-form>
        <el-alert v-if="error" :title="error" type="error" show-icon style="margin-top: 12px;" />
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const form = ref({ username: '', password: '' })
const error = ref('')
const router = useRouter()

const onLogin = () => {
  if (form.value.username === 'admin' && form.value.password === '123456') {
    localStorage.setItem('back_token', 'ok')
    router.push('/tasks')
  } else {
    error.value = '账号或密码错误（admin/123456）'
  }
}
</script>

<style scoped>
.login-bg {
  min-height: 100vh;
  background: linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}
.login-center {
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
}
.login-card {
  box-shadow: 0 8px 32px rgba(76, 81, 255, 0.10);
  border-radius: 24px;
  padding: 48px 40px 32px 40px;
  background: #fff;
  min-width: 340px;
  max-width: 380px;
  width: 100%;
}
.login-title {
  text-align: center;
  font-size: 2.2rem;
  font-weight: 800;
  color: #4f46e5;
  margin-bottom: 36px;
  letter-spacing: 2px;
}
.login-form {
  margin-top: 0;
}
.login-input {
  border-radius: 12px;
  font-size: 16px;
  padding: 10px 14px;
}
.login-btn {
  width: 100%;
  font-size: 1.15rem;
  border-radius: 12px;
  padding: 12px 0;
  font-weight: 700;
  letter-spacing: 1px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border: none;
}
.login-btn:hover {
  filter: brightness(1.08);
}
@media (max-width: 600px) {
  .login-card {
    padding: 24px 8px 18px 8px;
    min-width: 0;
    max-width: 95vw;
  }
  .login-title {
    font-size: 1.3rem;
    margin-bottom: 18px;
  }
}
</style> 