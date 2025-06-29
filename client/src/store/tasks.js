import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { taskAPI } from '@/services/api'
import { useUserStore } from '@/store/user'

const LOCAL_KEY = 'anonymous_tasks_v1'

export const useTaskStore = defineStore('tasks', () => {
  // 状态
  const activeTasks = ref([])
  const completedTasks = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  const userStore = useUserStore()

  // 计算属性
  const totalTasks = computed(() => activeTasks.value.length + completedTasks.value.length)
  
  const activeTasksCount = computed(() => activeTasks.value.length)
  
  const completedTasksCount = computed(() => completedTasks.value.length)
  
  const expiredTasks = computed(() => {
    return activeTasks.value.filter(task => {
      const now = new Date()
      const endDate = new Date(task.endDate)
      return endDate < now
    })
  })

  const upcomingTasks = computed(() => {
    return activeTasks.value.filter(task => {
      const now = new Date()
      const endDate = new Date(task.endDate)
      const diffDays = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))
      return diffDays <= 7 && diffDays > 0
    })
  })

  // 匿名任务本地存储
  const saveLocalTasks = (tasks) => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(tasks))
  }
  const getLocalTasks = () => {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]')
    } catch {
      return []
    }
  }
  const clearLocalTasks = () => {
    localStorage.removeItem(LOCAL_KEY)
  }

  // 加载任务（根据身份）
  const loadTasks = async () => {
    clearAllData()
    if (userStore.isLoggedIn) {
      // 登录态：查API
      await loadFromAPI()
    } else {
      // 匿名态：查本地
      const all = getLocalTasks()
      activeTasks.value = all.filter(t => t.status === 'active')
      completedTasks.value = all.filter(t => t.status === 'completed')
    }
  }

  // 清空任务
  const clearAllData = () => {
    activeTasks.value = []
    completedTasks.value = []
  }

  // API加载
  const loadFromAPI = async () => {
    try {
      isLoading.value = true
      error.value = null
      const activeResponse = await taskAPI.getTasks({ status: 'active' })
      const completedResponse = await taskAPI.getTasks({ status: 'completed' })
      if (activeResponse.success) activeTasks.value = activeResponse.data
      if (completedResponse.success) completedTasks.value = completedResponse.data
    } catch (err) {
      error.value = err.message || '加载数据失败'
    } finally {
      isLoading.value = false
    }
  }

  // 匿名任务操作
  const addLocalTask = (taskData) => {
    const all = getLocalTasks()
    const days = Number(taskData.totalDays || taskData.days || 0)
    if (!days || isNaN(days) || days <= 0) {
      throw new Error('任务天数无效')
    }
    const newTask = {
      ...taskData,
      totalDays: days,
      _id: Date.now().toString() + Math.random().toString(36).slice(2),
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString(),
      completionRate: 0
    }
    all.push(newTask)
    saveLocalTasks(all)
    loadTasks()
  }
  const completeLocalTask = (taskId) => {
    const all = getLocalTasks()
    const idx = all.findIndex(t => t._id === taskId)
    if (idx !== -1) {
      all[idx].status = 'completed'
      all[idx].completedDate = new Date().toISOString()
      all[idx].updatedAt = new Date().toISOString()
      saveLocalTasks(all)
      loadTasks()
    }
  }
  const deleteLocalTask = (taskId) => {
    const all = getLocalTasks().filter(t => t._id !== taskId)
    saveLocalTasks(all)
    loadTasks()
  }

  // 登录态任务操作
  const addTask = async (taskData) => {
    if (!userStore.isLoggedIn) {
      addLocalTask(taskData)
      return
    }
    try {
      isLoading.value = true
      error.value = null
      // 兼容days/totalDays，统一传totalDays给后端
      const payload = {
        ...taskData,
        totalDays: Number(taskData.totalDays || taskData.days || 0)
      }
      const response = await taskAPI.createTask(payload)
      if (response.success) {
        activeTasks.value.push(response.data)
        return response.data
      } else {
        throw new Error(response.error || '创建任务失败')
      }
    } catch (err) {
      error.value = err.message || '创建任务失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }
  const completeTask = async (taskId) => {
    if (!userStore.isLoggedIn) {
      completeLocalTask(taskId)
      return
    }
    try {
      isLoading.value = true
      error.value = null
      const response = await taskAPI.completeTask(taskId)
      if (response.success) {
        const idx = activeTasks.value.findIndex(t => t._id === taskId)
        if (idx !== -1) {
          const task = activeTasks.value[idx]
          activeTasks.value.splice(idx, 1)
          completedTasks.value.push(response.data)
        }
      } else {
        throw new Error(response.error || '完成任务失败')
      }
    } catch (err) {
      error.value = err.message || '完成任务失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }
  const deleteTask = async (taskId) => {
    if (!userStore.isLoggedIn) {
      deleteLocalTask(taskId)
      return
    }
    try {
      isLoading.value = true
      error.value = null
      const response = await taskAPI.deleteTask(taskId)
      if (response.success) {
        activeTasks.value = activeTasks.value.filter(t => t._id !== taskId)
        completedTasks.value = completedTasks.value.filter(t => t._id !== taskId)
      } else {
        throw new Error(response.error || '删除任务失败')
      }
    } catch (err) {
      error.value = err.message || '删除任务失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // 合并本地任务到账号
  const mergeLocalTasksToAccount = async () => {
    const all = getLocalTasks()
    for (const t of all) {
      // 只传必要字段
      await addTask({
        title: t.title,
        description: t.description,
        totalDays: t.totalDays
      })
    }
    clearLocalTasks()
    await loadTasks()
  }

  // 导出数据
  const exportData = () => {
    const data = {
      activeTasks: activeTasks.value,
      completedTasks: completedTasks.value,
      exportDate: new Date().toISOString(),
      totalTasks: totalTasks.value,
      statistics: {
        activeCount: activeTasksCount.value,
        completedCount: completedTasksCount.value,
        expiredCount: expiredTasks.value.length,
        upcomingCount: upcomingTasks.value.length
      }
    }
    
    return data
  }

  // 清除错误
  const clearError = () => {
    error.value = null
  }

  // 获取任务统计
  const getTaskStats = () => {
    return {
      total: totalTasks.value,
      active: activeTasksCount.value,
      completed: completedTasksCount.value,
      expired: expiredTasks.value.length,
      upcoming: upcomingTasks.value.length
    }
  }

  // 搜索任务
  const searchTasks = async (query) => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await taskAPI.searchTasks(query)
      
      if (response.success) {
        return response.data
      } else {
        throw new Error(response.error || '搜索失败')
      }
    } catch (err) {
      console.error('搜索任务失败:', err)
      error.value = err.message || '搜索失败'
      return []
    } finally {
      isLoading.value = false
    }
  }

  return {
    // 状态
    activeTasks,
    completedTasks,
    isLoading,
    error,
    
    // 计算属性
    totalTasks,
    activeTasksCount,
    completedTasksCount,
    expiredTasks,
    upcomingTasks,
    
    // 方法
    loadTasks,
    clearAllData,
    addTask,
    completeTask,
    deleteTask,
    exportData,
    getTaskStats,
    searchTasks,
    clearError,
    mergeLocalTasksToAccount,
    // 仅供调试
    getLocalTasks,
    saveLocalTasks,
    clearLocalTasks
  }
}) 