<template>
  <div class="stats-card" :class="cardTypeClass">
    <div class="stats-content">
      <div class="stats-info">
        <p class="stats-label">{{ label }}</p>
        <p class="stats-value">{{ value }}</p>
      </div>
      <div class="stats-icon">
        <component :is="iconComponent" class="icon" />
      </div>
    </div>
    
    <div v-if="trend !== undefined" class="stats-trend">
      <div class="trend-indicator" :class="trendClass">
        <TrendingUp v-if="trend > 0" class="trend-icon" />
        <TrendingDown v-else-if="trend < 0" class="trend-icon" />
        <Minus v-else class="trend-icon" />
        <span class="trend-text">
          {{ trend > 0 ? '+' : '' }}{{ trend === 0 ? '持平' : Math.abs(trend) }}
        </span>
      </div>
      <span class="trend-period">{{ trendPeriod }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { 
  Clock, 
  CheckCircle, 
  Trophy, 
  Target,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-vue-next'

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) => ['active', 'completed', 'total', 'custom'].includes(value)
  },
  label: {
    type: String,
    required: true
  },
  value: {
    type: [Number, String],
    required: true
  },
  icon: {
    type: String,
    default: 'Target'
  },
  trend: {
    type: Number,
    default: undefined
  },
  trendPeriod: {
    type: String,
    default: '较上周'
  }
})

const iconComponents = {
  Clock,
  CheckCircle,
  Trophy,
  Target
}

const iconComponent = computed(() => {
  return iconComponents[props.icon] || Target
})

const cardTypeClass = computed(() => {
  return `stats-card--${props.type}`
})

const trendClass = computed(() => {
  if (props.trend === undefined) return ''
  if (props.trend > 0) return 'trend-up'
  if (props.trend < 0) return 'trend-down'
  return 'trend-neutral'
})
</script>

<style scoped>
.stats-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 1px solid #f3f4f6;
}

.stats-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.stats-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.stats-info {
  flex: 1;
}

.stats-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.5rem 0;
  font-weight: 500;
}

.stats-value {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  line-height: 1;
}

.stats-icon {
  padding: 0.75rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon {
  width: 1.5rem;
  height: 1.5rem;
}

/* 不同类型卡片的样式 */
.stats-card--active .stats-value {
  color: #4f46e5;
}

.stats-card--active .stats-icon {
  background: #eef2ff;
  color: #4f46e5;
}

.stats-card--completed .stats-value {
  color: #059669;
}

.stats-card--completed .stats-icon {
  background: #ecfdf5;
  color: #059669;
}

.stats-card--total .stats-value {
  color: #7c3aed;
}

.stats-card--total .stats-icon {
  background: #f3e8ff;
  color: #7c3aed;
}

.stats-card--custom .stats-value {
  color: #dc2626;
}

.stats-card--custom .stats-icon {
  background: #fef2f2;
  color: #dc2626;
}

.stats-trend {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
}

.trend-indicator {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-weight: 500;
}

.trend-up {
  background: #ecfdf5;
  color: #059669;
}

.trend-down {
  background: #fef2f2;
  color: #dc2626;
}

.trend-neutral {
  background: #f3f4f6;
  color: #6b7280;
}

.trend-icon {
  width: 0.875rem;
  height: 0.875rem;
}

.trend-text {
  font-size: 0.75rem;
}

.trend-period {
  color: #9ca3af;
  font-size: 0.75rem;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .stats-card {
    padding: 1rem;
  }
  
  .stats-value {
    font-size: 1.75rem;
  }
  
  .stats-trend {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}

/* 动画效果 */
.stats-value {
  transition: all 0.3s ease;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.stats-card:hover .stats-value {
  animation: pulse 2s infinite;
}
</style>