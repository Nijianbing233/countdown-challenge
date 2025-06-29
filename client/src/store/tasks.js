import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { taskAPI } from '@/services/api'

export const useTaskStore = defineStore('tasks', () => {
  // 状态
  const activeTasks = ref([])
  const completedTasks = ref([])
  const isLoading = ref(false)
  const error = ref(null)

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

  // 从API加载数据
  const loadFromAPI = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      // 获取进行中的任务
      const activeResponse = await taskAPI.getTasks({ status: 'active' })
      if (activeResponse.success) {
        activeTasks.value = activeResponse.data
      }
      
      // 获取已完成的任务
      const completedResponse = await taskAPI.getTasks({ status: 'completed' })
      if (completedResponse.success) {
        completedTasks.value = completedResponse.data
      }
    } catch (err) {
      console.error('从API加载数据失败:', err)
      error.value = err.message || '加载数据失败'
    } finally {
      isLoading.value = false
    }
  }

  // 添加新任务
  const addTask = async (taskData) => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await taskAPI.createTask({
        title: taskData.title,
        description: taskData.description,
        totalDays: taskData.days
      })
      
      if (response.success) {
        activeTasks.value.push(response.data)
        return response.data
      } else {
        throw new Error(response.error || '创建任务失败')
      }
    } catch (err) {
      console.error('创建任务失败:', err)
      error.value = err.message || '创建任务失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // 完成任务
  const completeTask = async (taskId) => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await taskAPI.completeTask(taskId)
      
      if (response.success) {
        const taskIndex = activeTasks.value.findIndex(t => t._id === taskId)
        if (taskIndex !== -1) {
          const task = activeTasks.value[taskIndex]
          activeTasks.value.splice(taskIndex, 1)
          completedTasks.value.push(response.data)
          return response.data
        }
      } else {
        throw new Error(response.error || '完成任务失败')
      }
    } catch (err) {
      console.error('完成任务失败:', err)
      error.value = err.message || '完成任务失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // 删除任务
  const deleteTask = async (taskId) => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await taskAPI.deleteTask(taskId)
      
      if (response.success) {
        activeTasks.value = activeTasks.value.filter(t => t._id !== taskId)
      } else {
        throw new Error(response.error || '删除任务失败')
      }
    } catch (err) {
      console.error('删除任务失败:', err)
      error.value = err.message || '删除任务失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // 删除已完成任务
  const deleteCompletedTask = async (taskId) => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await taskAPI.deleteTask(taskId)
      
      if (response.success) {
        completedTasks.value = completedTasks.value.filter(t => t._id !== taskId)
      } else {
        throw new Error(response.error || '删除任务失败')
      }
    } catch (err) {
      console.error('删除已完成任务失败:', err)
      error.value = err.message || '删除任务失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // 编辑任务
  const editTask = async (taskId, updates) => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await taskAPI.updateTask(taskId, updates)
      
      if (response.success) {
        const taskIndex = activeTasks.value.findIndex(t => t._id === taskId)
        if (taskIndex !== -1) {
          activeTasks.value[taskIndex] = response.data
          return response.data
        }
      } else {
        throw new Error(response.error || '更新任务失败')
      }
    } catch (err) {
      console.error('更新任务失败:', err)
      error.value = err.message || '更新任务失败'
      throw err
    } finally {
      isLoading.value = false
    }
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

  // 导入数据
  const importData = async (data) => {
    try {
      isLoading.value = true
      error.value = null
      
      // 清空现有数据
      activeTasks.value = []
      completedTasks.value = []
      
      // 导入进行中的任务
      if (data.activeTasks && Array.isArray(data.activeTasks)) {
        for (const task of data.activeTasks) {
          await addTask({
            title: task.title,
            description: task.description,
            days: task.totalDays
          })
        }
      }
      
      // 导入已完成的任务（这里需要特殊处理，因为已完成的任务不能直接创建）
      if (data.completedTasks && Array.isArray(data.completedTasks)) {
        for (const task of data.completedTasks) {
          // 先创建任务，然后标记为完成
          const newTask = await addTask({
            title: task.title,
            description: task.description,
            days: task.totalDays
          })
          if (newTask) {
            await completeTask(newTask._id)
          }
        }
      }
      
      return true
    } catch (err) {
      console.error('导入数据失败:', err)
      error.value = err.message || '导入数据失败'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // 清空所有数据
  const clearAllData = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      // 删除所有进行中的任务
      for (const task of activeTasks.value) {
        await taskAPI.deleteTask(task._id)
      }
      
      // 删除所有已完成的任务
      for (const task of completedTasks.value) {
        await taskAPI.deleteTask(task._id)
      }
      
      activeTasks.value = []
      completedTasks.value = []
    } catch (err) {
      console.error('清空数据失败:', err)
      error.value = err.message || '清空数据失败'
    } finally {
      isLoading.value = false
    }
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
    loadFromAPI,
    addTask,
    completeTask,
    deleteTask,
    deleteCompletedTask,
    editTask,
    exportData,
    importData,
    clearAllData,
    getTaskStats,
    searchTasks
  }
}) 