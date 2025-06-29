<template>
  <div class="countdown-app">
    <!-- 头部 -->
    <header class="app-header">
      <div class="header-container">
        <div class="header-left">
          <Target class="header-icon" />
          <h1 class="app-title">目标倒计时</h1>
        </div>
        <div class="header-actions">
          <button
            @click="exportData"
            class="action-btn export-btn"
            title="导出数据"
            :disabled="taskStore.isLoading"
          >
            <Download class="btn-icon" />
            <span class="btn-text">导出数据</span>
          </button>
          <button
            @click="showAddModal = true"
            class="action-btn add-btn"
            title="添加目标"
            :disabled="taskStore.isLoading"
          >
            <Plus class="btn-icon" />
            <span class="btn-text">添加目标</span>
          </button>
        </div>
      </div>
    </header>

    <main class="app-main">
      <div class="main-container">
        <!-- 错误提示 -->
        <div v-if="taskStore.error" class="error-message">
          <div class="error-content">
            <span class="error-text">{{ taskStore.error }}</span>
            <button @click="clearError" class="error-close">×</button>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="taskStore.isLoading" class="loading-overlay">
          <div class="loading-spinner"></div>
          <p class="loading-text">加载中...</p>
        </div>

        <!-- 统计卡片 -->
        <div class="stats-grid">
          <StatsCard
            type="active"
            label="进行中的目标"
            :value="taskStore.activeTasksCount"
            icon="Clock"
          />
          <StatsCard
            type="completed"
            label="已完成目标"
            :value="taskStore.completedTasksCount"
            icon="CheckCircle"
          />
          <StatsCard
            type="total"
            label="总计目标"
            :value="taskStore.totalTasks"
            icon="Trophy"
          />
        </div>

        <!-- 标签页 -->
        <div class="tab-container">
          <button
            @click="activeTab = 'active'"
            class="tab-btn"
            :class="{ active: activeTab === 'active' }"
          >
            进行中 ({{ taskStore.activeTasksCount }})
          </button>
          <button
            @click="activeTab = 'completed'"
            class="tab-btn"
            :class="{ active: activeTab === 'completed' }"
          >
            已完成 ({{ taskStore.completedTasksCount }})
          </button>
        </div>

        <!-- 任务列表 -->
        <div class="tasks-grid">
          <!-- 进行中的任务 -->
          <template v-if="activeTab === 'active'">
            <CountdownCard
              v-for="task in taskStore.activeTasks"
              :key="task._id"
              :task="task"
              @complete="handleCompleteTask"
              @delete="handleDeleteTask"
            />
          </template>

          <!-- 已完成的任务 -->
          <template v-if="activeTab === 'completed'">
            <CompletedCard
              v-for="task in taskStore.completedTasks"
              :key="task._id"
              :task="task"
            />
          </template>
        </div>

        <!-- 空状态 -->
        <EmptyState
          v-if="activeTab === 'active' && taskStore.activeTasksCount === 0 && !taskStore.isLoading"
          type="no-tasks"
          @action="showAddModal = true"
        />
        <EmptyState
          v-if="activeTab === 'completed' && taskStore.completedTasksCount === 0 && !taskStore.isLoading"
          type="no-completed"
        />
      </div>
    </main>

    <!-- 添加任务弹窗 -->
    <AddTaskModal
      :show="showAddModal"
      @close="showAddModal = false"
      @submit="handleAddTask"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Target, Plus, Download } from 'lucide-vue-next'
import { useTaskStore } from '@/store/tasks'
import CountdownCard from '@/components/CountdownCard.vue'
import CompletedCard from '@/components/CompletedCard.vue'
import AddTaskModal from '@/components/AddTaskModal.vue'
import StatsCard from '@/components/StatsCard.vue'
import EmptyState from '@/components/EmptyState.vue'

// 使用Pinia store
const taskStore = useTaskStore()

// 本地状态
const showAddModal = ref(false)
const activeTab = ref('active')

// 处理添加任务
const handleAddTask = async (taskData) => {
  try {
    await taskStore.addTask(taskData)
    showAddModal.value = false
  } catch (error) {
    console.error('添加任务失败:', error)
    // 错误已经在store中处理
  }
}

// 处理完成任务
const handleCompleteTask = async (taskId) => {
  try {
    await taskStore.completeTask(taskId)
  } catch (error) {
    console.error('完成任务失败:', error)
    // 错误已经在store中处理
  }
}

// 处理删除任务
const handleDeleteTask = async (taskId) => {
  try {
    await taskStore.deleteTask(taskId)
  } catch (error) {
    console.error('删除任务失败:', error)
    // 错误已经在store中处理
  }
}

// 导出数据
const exportData = () => {
  const data = taskStore.exportData()
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { 
    type: 'application/json' 
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `countdown-data-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 清除错误
const clearError = () => {
  taskStore.error = null
}

// 组件挂载时加载数据
onMounted(async () => {
  try {
    await taskStore.loadFromAPI()
  } catch (error) {
    console.error('初始化加载失败:', error)
  }
})
</script>

<style scoped>
.countdown-app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.app-header {
  background: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-icon {
  width: 2rem;
  height: 2rem;
  color: #4f46e5;
}

.app-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.export-btn {
  background: #059669;
  color: white;
}

.export-btn:hover:not(:disabled) {
  background: #047857;
  transform: translateY(-1px);
}

.add-btn {
  background: #4f46e5;
  color: white;
}

.add-btn:hover:not(:disabled) {
  background: #4338ca;
  transform: translateY(-1px);
}

.btn-icon {
  width: 1rem;
  height: 1rem;
}

.btn-text {
  font-size: 0.875rem;
}

.app-main {
  padding: 2rem 1rem;
  position: relative;
}

.main-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* 错误消息样式 */
.error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.error-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error-text {
  color: #dc2626;
  font-weight: 500;
}

.error-close {
  background: none;
  border: none;
  color: #dc2626;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
}

.error-close:hover {
  background: #fee2e2;
}

/* 加载状态样式 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #4f46e5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.loading-text {
  color: #6b7280;
  font-weight: 500;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.tab-container {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 2rem;
  background: white;
  padding: 0.25rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tab-btn {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: transparent;
  color: #6b7280;
}

.tab-btn.active {
  background: #4f46e5;
  color: white;
  box-shadow: 0 2px 4px rgba(79, 70, 229, 0.3);
}

.tab-btn:hover:not(.active) {
  background: #f3f4f6;
  color: #374151;
}

.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-container {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .header-actions {
    width: 100%;
    justify-content: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .tasks-grid {
    grid-template-columns: 1fr;
  }
  
  .tab-container {
    flex-direction: column;
  }
  
  .btn-text {
    display: none;
  }
  
  .action-btn {
    padding: 0.75rem;
  }
}

@media (max-width: 480px) {
  .app-main {
    padding: 1rem 0.5rem;
  }
  
  .header-container {
    padding: 1rem 0.5rem;
  }
}
</style>
