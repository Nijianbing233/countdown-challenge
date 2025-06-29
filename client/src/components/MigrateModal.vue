<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-content">
      <h3>是否将本地任务同步到账号？</h3>
      <div class="modal-actions">
        <button @click="$emit('migrate', true)" class="btn-primary">是，同步到账号</button>
        <button @click="$emit('migrate', false)" class="btn-secondary">否，不同步</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: Boolean
})
defineEmits(['migrate'])
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.modal-content {
  background: #fff;
  border-radius: 8px;
  padding: 32px 24px;
  min-width: 320px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  text-align: center;
}
.modal-actions {
  margin-top: 24px;
  display: flex;
  gap: 16px;
  justify-content: center;
}
.btn-primary {
  background: #3b82f6;
  color: #fff;
  border: none;
  padding: 8px 24px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
}
.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: none;
  padding: 8px 24px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
}
</style> 