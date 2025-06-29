import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'
import { useTaskStore } from './tasks'

export const useUserStore = defineStore('user', () => {
  // 状态
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const loading = ref(false)
  const error = ref(null)

  // 计算属性
  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const username = computed(() => user.value?.username || '')
  const email = computed(() => user.value?.email || '')

  // 生成设备ID
  const generateDeviceId = () => {
    const userAgent = navigator.userAgent
    const language = navigator.language
    const screenRes = `${screen.width}x${screen.height}`
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    
    let hash = 0
    const str = userAgent + language + screenRes + timezone
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    
    return Math.abs(hash).toString(36)
  }

  // 保存token到localStorage
  const saveToken = (newToken) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  // 清除token
  const clearToken = () => {
    token.value = null
    localStorage.removeItem('token')
  }

  // 注册
  const register = async (userData) => {
    try {
      loading.value = true
      error.value = null
      
      const deviceId = generateDeviceId()
      const response = await api.post('/auth/register', {
        ...userData,
        deviceId
      })
      
      const { token: newToken, user: userInfo } = response
      saveToken(newToken)
      user.value = userInfo
      
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || '注册失败'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // 登录
  const login = async (credentials) => {
    try {
      loading.value = true
      error.value = null
      
      const deviceId = generateDeviceId()
      const response = await api.post('/auth/login', {
        ...credentials,
        deviceId
      })
      
      const { token: newToken, user: userInfo } = response
      saveToken(newToken)
      user.value = userInfo
      
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || '登录失败'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // 获取用户信息
  const fetchUserInfo = async () => {
    if (!token.value) return false
    
    try {
      const response = await api.get('/auth/me')
      user.value = response.user
      return true
    } catch (err) {
      console.error('获取用户信息失败:', err)
      // token可能已过期，清除本地存储
      logout()
      return false
    }
  }

  // 迁移匿名任务
  const migrateTasks = async () => {
    try {
      const deviceId = generateDeviceId()
      const response = await api.post('/auth/migrate-tasks', { deviceId })
      return response.data
    } catch (err) {
      console.error('任务迁移失败:', err)
      return { success: false, error: err.response?.data?.message || '任务迁移失败' }
    }
  }

  // 登出
  const logout = () => {
    user.value = null
    clearToken()
    error.value = null
    taskStore.clearAllData()
    taskStore.loadTasks({ forceAnonymous: true })
  }

  // 初始化：如果有token，尝试获取用户信息
  const init = async () => {
    if (token.value) {
      await fetchUserInfo()
    }
  }

  // 生成并持久化设备ID
  const getDeviceId = () => {
    let id = localStorage.getItem('deviceId')
    if (!id) {
      id = generateDeviceId()
      localStorage.setItem('deviceId', id)
    }
    return id
  }

  const taskStore = useTaskStore()

  return {
    // 状态
    user,
    token,
    loading,
    error,
    
    // 计算属性
    isLoggedIn,
    username,
    email,
    
    // 方法
    register,
    login,
    logout,
    fetchUserInfo,
    migrateTasks,
    generateDeviceId,
    init,
    getDeviceId
  }
}) 