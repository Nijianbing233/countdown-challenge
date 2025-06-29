<template>
  <div class="empty-state">
    <div class="empty-icon">
      <component :is="iconComponent" class="icon" />
    </div>
    
    <div class="empty-content">
      <h3 class="empty-title">{{ title }}</h3>
      <p class="empty-description">{{ description }}</p>
    </div>
    
    <div v-if="showAction" class="empty-action">
      <button 
        @click="$emit('action')" 
        class="action-btn"
        :class="actionButtonClass"
      >
        <component :is="actionIconComponent" class="btn-icon" />
        {{ actionText }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { 
  Target, 
  Trophy, 
  Plus,
  Search,
  Calendar,
  CheckCircle
} from 'lucide-vue-next'

const props = defineProps({
  type: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'no-tasks', 'no-completed', 'search', 'error'].includes(value)
  },
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  showAction: {
    type: Boolean,
    default: false
  },
  actionText: {
    type: String,
    default: '开始操作'
  },
  actionIcon: {
    type: String,
    default: 'Plus'
  }
})

const emit = defineEmits(['action'])

const iconComponents = {
  Target,
  Trophy,
  Plus,
  Search,
  Calendar,
  CheckCircle
}

// 根据类型设置默认配置
const typeConfig = {
  'no-tasks': {
    icon: 'Target',
    title: '还没有目标',
    description: '开始设定你的第一个倒计时目标吧！',
    actionText: '添加目标',
    actionIcon: 'Plus'
  },
  'no-completed': {
    icon: 'Trophy',
    title: '还没有完成的目标',
    description: '完成你的第一个目标来解锁成就！',
    actionText: '',
    actionIcon: 'Trophy'
  },
  'search': {
    icon: 'Search',
    title: '没有找到相关内容',
    description: '试试调整搜索条件或创建新的目标',
    actionText: '清除筛选',
    actionIcon: 'Plus'
  },
  'error': {
    icon: 'Target',
    title: '出现了一些问题',
    description: '请刷新页面重试，或联系客服支持',
    actionText: '重新加载',
    actionIcon: 'Plus'
  },
  'default': {
    icon: 'Target',
    title: '暂无内容',
    description: '这里还没有任何内容',
    actionText: '开始操作',
    actionIcon: 'Plus'
  }
}

const currentConfig = computed(() => {
  return typeConfig[props.type] || typeConfig.default
})

const iconComponent = computed(() => {
  const iconName = props.title ? 'Target' : currentConfig.value.icon
  return iconComponents[iconName] || Target
})

const finalTitle = computed(() => {
  return props.title || currentConfig.value.title
})

const finalDescription = computed(() => {
  return props.description || currentConfig.value.description
})

const finalActionText = computed(() => {
  return props.actionText !== '开始操作' ? props.actionText : currentConfig.value.actionText
})

const actionIconComponent = computed(() => {
  const iconName = props.actionIcon !== 'Plus' ? props.actionIcon : currentConfig.value.actionIcon
  return iconComponents[iconName] || Plus
})

const actionButtonClass = computed(() => {
  const baseClass = 'action-btn'
  switch (props.type) {
    case 'no-tasks':
      return `${baseClass} btn-primary`
    case 'no-completed':
      return `${baseClass} btn-success`
    case 'search':
      return `${baseClass} btn-secondary`
    case 'error':
      return `${baseClass} btn-warning`
    default:
      return `${baseClass} btn-primary`
  }
})
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem 1.5rem;
  min-height: 20rem;
}

.empty-icon {
  margin-bottom: 1.5rem;
  padding: 1rem;
  border-radius: 50%;
  background: #f9fafb;
  border: 2px solid #f3f4f6;
}

.icon {
  width: 3rem;
  height: 3rem;
  color: #d1d5db;
}

.empty-content {
  margin-bottom: 2rem;
  max-width: 28rem;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.75rem 0;
}

.empty-description {
  font-size: 0.95rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.empty-action {
  display: flex;
  justify-content: center;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn-icon {
  width: 1rem;
  height: 1rem;
}

/* 按钮样式变体 */
.btn-primary {
  background: #4f46e5;
  color: white;
}

.btn-primary:hover {
  background: #4338ca;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.btn-success {
  background: #059669;
  color: white;
}

.btn-success:hover {
  background: #047857;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #e5e7eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-warning {
  background: #f59e0b;
  color: white;
}

.btn-warning:hover {
  background: #d97706;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

/* 动画效果 */
.empty-state {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.empty-icon {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

/* 响应式设计 */
@media (max-width: 640px) {
  .empty-state {
    padding: 2rem 1rem;
    min-height: 16rem;
  }
  
  .empty-icon {
    margin-bottom: 1rem;
  }
  
  .icon {
    width: 2.5rem;
    height: 2.5rem;
  }
  
  .empty-title {
    font-size: 1.125rem;
  }
  
  .empty-description {
    font-size: 0.875rem;
  }
}
</style>