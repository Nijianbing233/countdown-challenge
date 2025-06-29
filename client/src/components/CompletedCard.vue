<template>
  <div class="completed-card">
    <div class="card-header">
      <h3 class="task-title">{{ task.title }}</h3>
      <div class="completion-icon">
        <CheckCircle class="icon" />
      </div>
    </div>
    
    <p v-if="task.description" class="task-description">
      {{ task.description }}
    </p>
    
    <div class="completion-info">
      <div class="completion-badge">
        🎉 目标已完成！
      </div>
      
      <div class="completion-details">
        <div class="detail-item">
          <span class="detail-label">完成时间:</span>
          <span class="detail-value">{{ formattedCompletionDate }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">目标周期:</span>
          <span class="detail-value">{{ task.totalDays }} 天</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">开始时间:</span>
          <span class="detail-value">{{ formattedStartDate }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { CheckCircle } from 'lucide-vue-next'

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

const formattedCompletionDate = computed(() => {
  return new Date(props.task.completedDate).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const formattedStartDate = computed(() => {
  return new Date(props.task.startDate).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})
</script>

<style scoped>
.completed-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #059669;
  transition: box-shadow 0.3s ease;
}

.completed-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.task-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  flex: 1;
}

.completion-icon {
  color: #059669;
}

.icon {
  width: 1.5rem;
  height: 1.5rem;
}

.task-description {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  line-height: 1.4;
}

.completion-info {
  background: #ecfdf5;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #d1fae5;
}

.completion-badge {
  font-weight: 600;
  color: #065f46;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.completion-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.detail-label {
  color: #059669;
  font-weight: 500;
}

.detail-value {
  color: #065f46;
  font-weight: 600;
}

@media (max-width: 640px) {
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>