<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>{{ isLogin ? '登录' : '注册' }}</h2>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="form">
        <div class="form-group">
          <label v-if="!isLogin" for="username">用户名</label>
          <input
            v-if="!isLogin"
            id="username"
            v-model="form.username"
            type="text"
            placeholder="请输入用户名"
            required
            minlength="3"
            maxlength="20"
          />
        </div>
        
        <div class="form-group">
          <label for="email">邮箱</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="请输入邮箱"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            required
            minlength="6"
            @input="validatePassword"
          />
          <div v-if="!isLogin && passwordError" class="error-message small">
            {{ passwordError }}
          </div>
        </div>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <button type="submit" class="submit-btn" :disabled="loading || !canRegister">
          {{ loading ? '处理中...' : (isLogin ? '登录' : '注册') }}
        </button>
      </form>
      
      <div class="modal-footer">
        <p>
          {{ isLogin ? '还没有账号？' : '已有账号？' }}
          <button class="link-btn" @click="toggleMode">
            {{ isLogin ? '立即注册' : '立即登录' }}
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '../store/user'

const props = defineProps({
  isLogin: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close', 'success', 'toggle-mode'])

const userStore = useUserStore()

const form = ref({
  username: '',
  email: '',
  password: ''
})

const loading = computed(() => userStore.loading)
const error = computed(() => userStore.error)

const passwordError = ref('')

const canRegister = computed(() => {
  if (props.isLogin) return true
  return (
    form.value.username.length >= 3 &&
    form.value.email.length > 0 &&
    form.value.password.length >= 6 &&
    !passwordError.value
  )
})

const closeModal = () => {
  emit('close')
}

const toggleMode = () => {
  emit('toggle-mode')
  validatePassword()
}

const validatePassword = () => {
  if (props.isLogin) {
    passwordError.value = ''
    return
  }
  const pwd = form.value.password
  if (!pwd || pwd.length < 6) {
    passwordError.value = '密码长度不能少于6位'
  } else {
    passwordError.value = ''
  }
}

const handleSubmit = async () => {
  validatePassword()
  if (!props.isLogin && passwordError.value) return
  try {
    let result
    
    if (props.isLogin) {
      result = await userStore.login({
        email: form.value.email,
        password: form.value.password
      })
    } else {
      result = await userStore.register({
        username: form.value.username,
        email: form.value.email,
        password: form.value.password
      })
    }
    
    if (result.success) {
      // 尝试迁移匿名任务
      await userStore.migrateTasks()
      emit('success')
      closeModal()
    }
  } catch (err) {
    console.error('操作失败:', err)
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 0;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #374151;
}

.form {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 0.875rem;
}

.submit-btn {
  width: 100%;
  background: #3b82f6;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #2563eb;
}

.submit-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  text-align: center;
}

.modal-footer p {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.link-btn {
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  font-size: 0.875rem;
  text-decoration: underline;
}

.link-btn:hover {
  color: #2563eb;
}

.error-message.small {
  font-size: 12px;
  margin-top: 4px;
  padding: 6px 8px;
}
</style> 