<template>
  <div class="user-avatar">
    <div v-if="isLoggedIn" class="user-info" @click="toggleDropdown">
      <div class="avatar">
        {{ username.charAt(0).toUpperCase() }}
      </div>
      <span class="username">{{ username }}</span>
      <svg class="dropdown-icon" :class="{ 'rotated': showDropdown }" width="12" height="12" viewBox="0 0 12 12">
        <path d="M2 4L6 8L10 4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      
      <div v-if="showDropdown" class="dropdown-menu">
        <div class="dropdown-item">
          <span class="label">邮箱:</span>
          <span class="value">{{ email }}</span>
        </div>
        <div class="dropdown-item">
          <span class="label">注册时间:</span>
          <span class="value">{{ formatDate(user?.createdAt) }}</span>
        </div>
        <div class="dropdown-item">
          <span class="label">最后登录:</span>
          <span class="value">{{ formatDate(user?.lastLoginAt) }}</span>
        </div>
        <div class="dropdown-divider"></div>
        <button class="dropdown-item logout-btn" @click="handleLogout">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 12H3C2.46957 12 1.96086 11.7893 1.58579 11.4142C1.21071 11.0391 1 10.5304 1 10V6C1 5.46957 1.21071 4.96086 1.58579 4.58579C1.96086 4.21071 2.46957 4 3 4H6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M10 9L15 4L10 -1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M15 4H6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          退出登录
        </button>
      </div>
    </div>
    
    <button v-else class="login-btn" @click="$emit('login')">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 8C10.21 8 12 6.21 12 4C12 1.79 10.21 0 8 0C5.79 0 4 1.79 4 4C4 6.21 5.79 8 8 8Z" stroke="currentColor" stroke-width="2"/>
        <path d="M2 14C2 11.34 4.34 9 7 9H9C11.66 9 14 11.34 14 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      登录
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '../store/user'

const emit = defineEmits(['login'])

const userStore = useUserStore()
const showDropdown = ref(false)

const isLoggedIn = computed(() => userStore.isLoggedIn)
const username = computed(() => userStore.username)
const email = computed(() => userStore.email)
const user = computed(() => userStore.user)

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const handleLogout = () => {
  userStore.logout()
  showDropdown.value = false
}

const formatDate = (dateString) => {
  if (!dateString) return '未知'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// 点击外部关闭下拉菜单
const handleClickOutside = (event) => {
  if (!event.target.closest('.user-avatar')) {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.user-avatar {
  position: relative;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 14px;
  height: 44px;
  transition: background-color 0.2s;
}

.user-info:hover {
  background-color: #f3f4f6;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.username {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.dropdown-icon {
  color: #6b7280;
  transition: transform 0.2s;
}

.dropdown-icon.rotated {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  min-width: 200px;
  z-index: 1000;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  font-size: 14px;
  color: #374151;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #f9fafb;
}

.dropdown-item .label {
  font-weight: 500;
  min-width: 60px;
}

.dropdown-item .value {
  color: #6b7280;
  flex: 1;
}

.dropdown-divider {
  height: 1px;
  background-color: #e5e7eb;
  margin: 4px 0;
}

.logout-btn {
  color: #dc2626;
  font-weight: 500;
}

.logout-btn:hover {
  background-color: #fef2f2;
}

.login-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0.75rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  height: 44px;
  transition: background-color 0.2s;
}

.login-btn:hover {
  background: #2563eb;
}
</style> 