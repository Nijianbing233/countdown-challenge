<template>
  <div v-if="show" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">添加新目标</h2>
        <button @click="closeModal" class="close-btn">
          <X class="icon" />
        </button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="modal-form">
        <div class="form-group">
          <label for="taskTitle" class="form-label">目标名称</label>
          <input
            id="taskTitle"
            v-model="formData.title"
            type="text"
            class="form-input"
            placeholder="例如：100天阅读挑战"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="taskDays" class="form-label">时间周期（天）</label>
          <input
            id="taskDays"
            v-model.number="formData.days"
            type="number"
            class="form-input"
            placeholder="例如：100"
            min="1"
            max="3650"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="taskDescription" class="form-label">描述（可选）</label>
          <textarea
            id="taskDescription"
            v-model="formData.description"
            class="form-textarea"
            placeholder="描述你的目标..."
            rows="3"
          />
        </div>
        
        <div class="form-actions">
          <button type="button" @click="closeModal" class="btn btn-secondary">
            取消
          </button>
          <button type="submit" class="btn btn-primary" :disabled="!isFormValid">
            添加目标
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { X } from 'lucide-vue-next'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'submit'])

const formData = ref({
  title: '',
  days: '',
  description: ''
})

const isFormValid = computed(() => {
  return formData.value.title.trim() && 
         formData.value.days && 
         formData.value.days > 0
})

const resetForm = () => {
  formData.value = {
    title: '',
    days: '',
    description: ''
  }
}

const closeModal = () => {
  resetForm()
  emit('close')
}

const handleOverlayClick = () => {
  closeModal()
}

const handleSubmit = () => {
  if (!isFormValid.value) return
  
  const taskData = {
    title: formData.value.title.trim(),
    days: parseInt(formData.value.days),
    description: formData.value.description.trim()
  }
  
  emit('submit', taskData)
  resetForm()
}

// 监听弹窗显示状态，处理ESC键关闭
watch(() => props.show, (newVal) => {
  if (newVal) {
    document.addEventListener('keydown', handleEscapeKey)
  } else {
    document.removeEventListener('keydown', handleEscapeKey)
  }
})

const handleEscapeKey = (e) => {
  if (e.key === 'Escape') {
    closeModal()
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 28rem;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: modalEnter 0.2s ease-out;
}

@keyframes modalEnter {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 0;
  margin-bottom: 1.5rem;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.close-btn {
  padding: 0.5rem;
  border: none;
  background: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
}

.modal-form {
  padding: 0 1.5rem 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 4rem;
  font-family: inherit;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover:not(:disabled) {
  background: #e5e7eb;
}

.btn-primary {
  background: #4f46e5;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #4338ca;
}

@media (max-width: 640px) {
  .modal-content {
    margin: 1rem;
    max-width: calc(100% - 2rem);
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>