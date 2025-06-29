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
          >
            <Download class="btn-icon" />
            <span class="btn-text">导出数据</span>
          </button>
          <button
            @click="showAddModal = true"
            class="action-btn add-btn"
            title="添加目标"
          >
            <Plus class="btn-icon" />
            <span class="btn-text">添加目标</span>
          </button>
        </div>
      </div>
    </header>

    <main class="app-main">
      <div class="main-container">
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
              :key="task.id"
              :task="task"
              @complete="handleCompleteTask"
              @delete="handleDeleteTask"
            />
          </template>

          <!-- 已完成的任务 -->
          <template v-if="activeTab === 'completed'">
            <CompletedCard
              v-for="task in taskStore.completedTasks"
              :key="task.id"
              :task="task"
            />
          </template>
        </div>

        <!-- 空状态 -->
        <EmptyState
          v-if="activeTab === 'active' && taskStore.activeTasksCount === 0"
          type="no-tasks"
          @action="showAddModal = true"
        />
        <EmptyState
          v-if="activeTab === 'completed' && taskStore.completedTasksCount === 0"
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
const handleAddTask = (taskData) => {
  taskStore.addTask(taskData)
  showAddModal.value = false
}

// 处理完成任务
const handleCompleteTask = (taskId) => {
  taskStore.completeTask(taskId)
}

// 处理删除任务
const handleDeleteTask = (taskId) => {
  taskStore.deleteTask(taskId)
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

// 组件挂载时加载数据
onMounted(() => {
  taskStore.loadFromStorage()
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

.export-btn {
  background: #059669;
  color: white;
}

.export-btn:hover {
  background: #047857;
  transform: translateY(-1px);
}

.add-btn {
  background: #4f46e5;
  color: white;
}

.add-btn:hover {
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
}

.main-container {
  max-width: 1200px;
  margin: 0 auto;
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
