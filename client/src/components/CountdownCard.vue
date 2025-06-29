<template>
  <div class="countdown-card">
    <div class="card-header">
      <h3 class="task-title">{{ task.title }}</h3>
      <div class="card-actions">
        <button 
          @click="$emit('complete', task._id)" 
          class="action-btn complete-btn"
          title="完成"
        >
          <CheckCircle class="icon" />
        </button>
        <button 
          @click="$emit('delete', task._id)" 
          class="action-btn delete-btn"
          title="删除"
        >
          <Trash2 class="icon" />
        </button>
      </div>
    </div>
    
    <p v-if="task.description" class="task-description">
      {{ task.description }}
    </p>
    
    <div class="countdown-display">
      <div class="time-unit">
        <div class="time-value">{{ timeRemaining.days }}</div>
        <div class="time-label">天</div>
      </div>
      <div class="time-unit">
        <div class="time-value">{{ timeRemaining.hours }}</div>
        <div class="time-label">时</div>
      </div>
      <div class="time-unit">
        <div class="time-value">{{ timeRemaining.minutes }}</div>
        <div class="time-label">分</div>
      </div>
      <div class="time-unit">
        <div class="time-value">{{ timeRemaining.seconds }}</div>
        <div class="time-label">秒</div>
      </div>
    </div>
    
    <div v-if="timeRemaining.isExpired" class="expired-notice">
      ⏰ 时间已到！
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { CheckCircle, Trash2 } from 'lucide-vue-next'

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['complete', 'delete'])

const currentTime = ref(new Date())

const timeRemaining = computed(() => {
  const now = currentTime.value
  const end = new Date(props.task.endDate)
  const diff = end - now
  
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true }
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  
  return { days, hours, minutes, seconds, isExpired: false }
})

let timer = null

onMounted(() => {
  timer = setInterval(() => {
    currentTime.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.countdown-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.countdown-card:hover {
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

.card-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.complete-btn {
  color: #059669;
  background: #ecfdf5;
}

.complete-btn:hover {
  background: #d1fae5;
}

.delete-btn {
  color: #dc2626;
  background: #fef2f2;
}

.delete-btn:hover {
  background: #fee2e2;
}

.icon {
  width: 1rem;
  height: 1rem;
}

.task-description {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  line-height: 1.4;
}

.countdown-display {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.time-unit {
  text-align: center;
  padding: 0.75rem;
  border-radius: 8px;
}

.time-unit:nth-child(1) {
  background: #eef2ff;
}

.time-unit:nth-child(2) {
  background: #dbeafe;
}

.time-unit:nth-child(3) {
  background: #f3e8ff;
}

.time-unit:nth-child(4) {
  background: #fdf2f8;
}

.time-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.time-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.expired-notice {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
  font-size: 0.875rem;
}

@media (max-width: 640px) {
  .countdown-display {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .time-value {
    font-size: 1.25rem;
  }
}
</style>