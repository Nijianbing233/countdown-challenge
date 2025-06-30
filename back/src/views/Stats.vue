<template>
  <div>
    <el-row :gutter="20">
      <!-- 统计卡片 -->
      <el-col :span="6" v-for="stat in statsCards" :key="stat.title">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" :style="{ backgroundColor: stat.color }">
              <span class="stat-emoji">{{ stat.icon }}</span>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stat.value }}</div>
              <div class="stat-title">{{ stat.title }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 热门目标 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>热门目标</span>
              <el-button type="text" @click="fetchStats">刷新</el-button>
            </div>
          </template>
          <el-table :data="popularGoals" v-loading="loading" stripe>
            <el-table-column prop="title" label="目标" min-width="150" show-overflow-tooltip />
            <el-table-column prop="count" label="数量" width="80" align="center" />
            <el-table-column prop="avgDays" label="平均天数" width="100" align="center" />
            <el-table-column prop="completionRate" label="完成率" width="100" align="center">
              <template #default="scope">
                <el-progress 
                  :percentage="scope.row.completionRate" 
                  :color="getProgressColor(scope.row.completionRate)"
                  :show-text="false"
                />
                <span style="margin-left: 8px;">{{ scope.row.completionRate }}%</span>
              </template>
            </el-table-column>
          </el-table>
          <div v-if="popularGoals.length === 0" class="empty-state">
            <el-empty description="暂无热门目标数据" />
          </div>
        </el-card>
      </el-col>

      <!-- 状态分布 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>任务状态分布</span>
            </div>
          </template>
          <div class="chart-container">
            <div class="status-distribution">
              <div 
                v-for="item in statusDistribution" 
                :key="item.status" 
                class="status-item"
                :style="{ backgroundColor: item.color }"
              >
                <div class="status-label">{{ item.label }}</div>
                <div class="status-value">{{ item.value }}</div>
                <div class="status-percentage">{{ item.percentage }}%</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const loading = ref(false)
const stats = ref({})
const popularGoals = ref([])
const pieChart = ref(null)

// 创建axios实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/admin',
  headers: {
    'x-admin-token': 'admin-token-123456'
  }
})

// 统计卡片数据
const statsCards = computed(() => [
  {
    title: '总任务数',
    value: stats.value.totalTasks || 0,
    icon: '📊',
    color: '#409EFF'
  },
  {
    title: '进行中',
    value: stats.value.activeTasks || 0,
    icon: '⏰',
    color: '#E6A23C'
  },
  {
    title: '已完成',
    value: stats.value.completedTasks || 0,
    icon: '✅',
    color: '#67C23A'
  },
  {
    title: '已过期',
    value: stats.value.expiredTasks || 0,
    icon: '⚠️',
    color: '#F56C6C'
  }
])

// 状态分布数据
const statusDistribution = computed(() => {
  const total = stats.value.totalTasks || 0
  if (total === 0) return []
  
  return [
    {
      status: 'active',
      label: '进行中',
      value: stats.value.activeTasks || 0,
      percentage: Math.round(((stats.value.activeTasks || 0) / total) * 100),
      color: '#E6A23C'
    },
    {
      status: 'completed',
      label: '已完成',
      value: stats.value.completedTasks || 0,
      percentage: Math.round(((stats.value.completedTasks || 0) / total) * 100),
      color: '#67C23A'
    },
    {
      status: 'expired',
      label: '已过期',
      value: stats.value.expiredTasks || 0,
      percentage: Math.round(((stats.value.expiredTasks || 0) / total) * 100),
      color: '#F56C6C'
    }
  ]
})

const fetchStats = async () => {
  loading.value = true
  try {
    const res = await api.get('/stats')
    if (res.data.success) {
      // 后端返回的是 { stats: {...}, popularGoals: [...] }
      stats.value = res.data.data.stats || {}
      popularGoals.value = res.data.data.popularGoals || []
      console.log('统计数据:', stats.value)
      console.log('热门目标:', popularGoals.value)
    } else {
      ElMessage.error(res.data.error || '获取统计信息失败')
    }
  } catch (e) {
    ElMessage.error('获取统计信息失败')
    console.error('获取统计信息错误:', e)
  } finally {
    loading.value = false
  }
}

const getProgressColor = (rate) => {
  if (rate >= 80) return '#67C23A'
  if (rate >= 60) return '#E6A23C'
  if (rate >= 40) return '#F56C6C'
  return '#909399'
}

onMounted(() => {
  fetchStats()
})
</script>

<style scoped>
.stat-card {
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.stat-emoji {
  font-size: 28px;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.status-distribution {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-radius: 8px;
  color: white;
  font-weight: bold;
}

.status-label {
  font-size: 16px;
}

.status-value {
  font-size: 20px;
}

.status-percentage {
  font-size: 18px;
}

.empty-state {
  padding: 40px 0;
}
</style> 