import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 添加认证token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API请求失败:', error)
    
    if (error.response) {
      // 服务器返回错误状态码
      const { status, data } = error.response
      
      // 如果是401错误，清除本地token
      if (status === 401) {
        localStorage.removeItem('token')
        // 可以在这里触发重新登录
      }
      
      switch (status) {
        case 400:
          throw new Error(data.error || data.message || '请求参数错误')
        case 401:
          throw new Error(data.message || '未授权访问')
        case 403:
          throw new Error('访问被拒绝')
        case 404:
          throw new Error('资源不存在')
        case 429:
          throw new Error('请求过于频繁，请稍后再试')
        case 500:
          throw new Error('服务器内部错误')
        default:
          throw new Error(data.error || data.message || '请求失败')
      }
    } else if (error.request) {
      // 网络错误
      throw new Error('网络连接失败，请检查网络设置')
    } else {
      // 其他错误
      throw new Error('请求配置错误')
    }
  }
)

// 用户认证相关API
export const authAPI = {
  // 用户注册
  register: (userData) => api.post('/auth/register', userData),
  
  // 用户登录
  login: (credentials) => api.post('/auth/login', credentials),
  
  // 获取用户信息
  getMe: () => api.get('/auth/me'),
  
  // 迁移匿名任务
  migrateTasks: (deviceId) => api.post('/auth/migrate-tasks', { deviceId })
}

// 任务相关API
export const taskAPI = {
  // 获取所有任务
  getTasks: (params = {}) => api.get('/tasks', { params }),
  
  // 获取单个任务
  getTask: (id) => api.get(`/tasks/${id}`),
  
  // 创建任务
  createTask: (taskData) => api.post('/tasks', taskData),
  
  // 更新任务
  updateTask: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  
  // 完成任务
  completeTask: (id) => api.patch(`/tasks/${id}/complete`),
  
  // 删除任务
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  
  // 批量操作
  batchOperation: (action, taskIds) => api.post('/tasks/batch', { action, taskIds }),
  
  // 搜索任务
  searchTasks: (query, limit = 20) => api.get(`/tasks/search/${encodeURIComponent(query)}`, {
    params: { limit }
  })
}

// 统计相关API
export const statsAPI = {
  // 获取全局统计
  getGlobalStats: () => api.get('/stats/global'),
  
  // 获取热门目标
  getPopularGoals: (limit = 10) => api.get('/stats/popular-goals', { params: { limit } }),
  
  // 获取用户统计
  getUserStats: () => api.get('/stats/user'),
  
  // 获取趋势统计
  getTrends: (days = 30) => api.get('/stats/trends', { params: { days } }),
  
  // 获取目标类型统计
  getGoalTypes: () => api.get('/stats/goal-types'),
  
  // 获取成就统计
  getAchievements: () => api.get('/stats/achievements')
}

// 健康检查
export const healthAPI = {
  checkHealth: () => api.get('/health')
}

export default api 