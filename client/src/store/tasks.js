import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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

  // 从localStorage加载数据
  const loadFromStorage = () => {
    try {
      const savedActiveTasks = localStorage.getItem('countdown-active-tasks')
      const savedCompletedTasks = localStorage.getItem('countdown-completed-tasks')
      
      if (savedActiveTasks) {
        activeTasks.value = JSON.parse(savedActiveTasks)
      }
      if (savedCompletedTasks) {
        completedTasks.value = JSON.parse(savedCompletedTasks)
      }
    } catch (err) {
      console.error('加载数据失败:', err)
      error.value = '加载数据失败'
    }
  }

  // 保存数据到localStorage
  const saveToStorage = () => {
    try {
      localStorage.setItem('countdown-active-tasks', JSON.stringify(activeTasks.value))
      localStorage.setItem('countdown-completed-tasks', JSON.stringify(completedTasks.value))
    } catch (err) {
      console.error('保存数据失败:', err)
      error.value = '保存数据失败'
    }
  }

  // 添加新任务
  const addTask = (taskData) => {
    const task = {
      id: Date.now(),
      title: taskData.title,
      description: taskData.description,
      totalDays: taskData.days,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + taskData.days * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    }
    
    activeTasks.value.push(task)
    saveToStorage()
    return task
  }

  // 完成任务
  const completeTask = (taskId) => {
    const taskIndex = activeTasks.value.findIndex(t => t.id === taskId)
    if (taskIndex !== -1) {
      const task = activeTasks.value[taskIndex]
      const completedTask = {
        ...task,
        completedDate: new Date().toISOString(),
        status: 'completed'
      }
      
      completedTasks.value.push(completedTask)
      activeTasks.value.splice(taskIndex, 1)
      saveToStorage()
      return completedTask
    }
    return null
  }

  // 删除任务
  const deleteTask = (taskId) => {
    activeTasks.value = activeTasks.value.filter(t => t.id !== taskId)
    saveToStorage()
  }

  // 删除已完成任务
  const deleteCompletedTask = (taskId) => {
    completedTasks.value = completedTasks.value.filter(t => t.id !== taskId)
    saveToStorage()
  }

  // 编辑任务
  const editTask = (taskId, updates) => {
    const taskIndex = activeTasks.value.findIndex(t => t.id === taskId)
    if (taskIndex !== -1) {
      const task = activeTasks.value[taskIndex]
      const updatedTask = { ...task, ...updates }
      
      // 如果修改了天数，重新计算结束时间
      if (updates.totalDays) {
        const startDate = new Date(task.startDate)
        updatedTask.endDate = new Date(startDate.getTime() + updates.totalDays * 24 * 60 * 60 * 1000).toISOString()
      }
      
      activeTasks.value[taskIndex] = updatedTask
      saveToStorage()
      return updatedTask
    }
    return null
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
  const importData = (data) => {
    try {
      if (data.activeTasks) {
        activeTasks.value = data.activeTasks
      }
      if (data.completedTasks) {
        completedTasks.value = data.completedTasks
      }
      saveToStorage()
      return true
    } catch (err) {
      console.error('导入数据失败:', err)
      error.value = '导入数据失败'
      return false
    }
  }

  // 清空所有数据
  const clearAllData = () => {
    activeTasks.value = []
    completedTasks.value = []
    localStorage.removeItem('countdown-active-tasks')
    localStorage.removeItem('countdown-completed-tasks')
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
    loadFromStorage,
    saveToStorage,
    addTask,
    completeTask,
    deleteTask,
    deleteCompletedTask,
    editTask,
    exportData,
    importData,
    clearAllData,
    getTaskStats
  }
}) 