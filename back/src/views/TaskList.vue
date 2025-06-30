<template>
  <div>
    <el-card>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <div style="display: flex; gap: 12px; align-items: center;">
          <el-input 
            v-model="search" 
            placeholder="搜索任务标题" 
            style="width: 240px;" 
            clearable 
            @input="handleSearch"
            @clear="fetchTasks(1)"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-select v-model="statusFilter" placeholder="状态筛选" clearable @change="fetchTasks(1)" style="width: 120px;">
            <el-option label="全部" value="" />
            <el-option label="进行中" value="active" />
            <el-option label="已完成" value="completed" />
            <el-option label="已过期" value="expired" />
          </el-select>
        </div>
        <div style="display: flex; gap: 8px;">
          <el-button @click="fetchTasks(1)" :loading="loading">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
          <el-button type="primary" @click="showAddDialog">
            <el-icon><Plus /></el-icon>
            新增任务
          </el-button>
        </div>
      </div>
      
      <el-table :data="tasks" style="width: 100%" v-loading="loading" stripe>
        <el-table-column prop="_id" label="ID" width="220" show-overflow-tooltip />
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="totalDays" label="天数" width="80" align="center" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startDate" label="开始时间" width="160">
          <template #default="scope">
            {{ formatDate(scope.row.startDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="endDate" label="结束时间" width="160">
          <template #default="scope">
            {{ formatDate(scope.row.endDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="editTask(scope.row)">编辑</el-button>
            <el-button 
              v-if="scope.row.status === 'active'" 
              size="small" 
              type="success" 
              @click="completeTask(scope.row._id)"
            >
              完成
            </el-button>
            <el-button size="small" type="danger" @click="deleteTask(scope.row._id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination
        v-model:current-page="page"
        :page-size="pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[10, 20, 50, 100]"
        @current-change="fetchTasks"
        @size-change="handleSizeChange"
        style="margin-top: 16px; text-align: right;"
      />
    </el-card>

    <!-- 新增/编辑任务弹窗 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="isEdit ? '编辑任务' : '新增任务'" 
      width="500px"
      @close="resetForm"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入任务标题" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input 
            v-model="form.description" 
            type="textarea" 
            :rows="3"
            placeholder="请输入任务描述（可选）" 
          />
        </el-form-item>
        <el-form-item label="天数" prop="totalDays">
          <el-input-number 
            v-model="form.totalDays" 
            :min="1" 
            :max="3650"
            placeholder="请输入任务天数"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitLoading">
            {{ isEdit ? '更新' : '创建' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

const tasks = ref([])
const loading = ref(false)
const submitLoading = ref(false)
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const search = ref('')
const statusFilter = ref('')
const dialogVisible = ref(false)
const isEdit = ref(false)
const currentEditId = ref('')
const formRef = ref()

const form = ref({
  title: '',
  description: '',
  totalDays: 30
})

const rules = {
  title: [
    { required: true, message: '请输入任务标题', trigger: 'blur' },
    { max: 100, message: '标题不能超过100个字符', trigger: 'blur' }
  ],
  totalDays: [
    { required: true, message: '请输入任务天数', trigger: 'blur' },
    { type: 'number', min: 1, max: 3650, message: '天数必须在1-3650之间', trigger: 'blur' }
  ]
}

// 创建axios实例，添加认证token
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/admin',
  headers: {
    'x-admin-token': 'admin-token-123456'
  }
})

const fetchTasks = async (p = 1) => {
  loading.value = true
  try {
    const params = {
      page: p,
      limit: pageSize.value
    }
    if (search.value) {
      params.search = search.value
    }
    if (statusFilter.value) {
      params.status = statusFilter.value
    }
    
    const res = await api.get('/tasks', { params })
    if (res.data.success) {
      tasks.value = res.data.data
      total.value = res.data.pagination.total
      page.value = p
    } else {
      ElMessage.error(res.data.error || '获取任务失败')
    }
  } catch (e) {
    ElMessage.error('获取任务失败')
    console.error(e)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  // 防抖搜索
  clearTimeout(search.value.timer)
  search.value.timer = setTimeout(() => {
    fetchTasks(1)
  }, 500)
}

const handleSizeChange = (size) => {
  pageSize.value = size
  fetchTasks(1)
}

const showAddDialog = () => {
  isEdit.value = false
  dialogVisible.value = true
}

const editTask = (task) => {
  isEdit.value = true
  currentEditId.value = task._id
  form.value = {
    title: task.title,
    description: task.description || '',
    totalDays: task.totalDays
  }
  dialogVisible.value = true
}

const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitLoading.value = true
    
    if (isEdit.value) {
      // 编辑任务
      const res = await api.put(`/tasks/${currentEditId.value}`, form.value)
      if (res.data.success) {
        ElMessage.success('更新成功')
        dialogVisible.value = false
        fetchTasks(page.value)
      } else {
        ElMessage.error(res.data.error || '更新失败')
      }
    } else {
      // 新增任务
      const res = await api.post('/tasks', form.value)
      if (res.data.success) {
        ElMessage.success('创建成功')
        dialogVisible.value = false
        fetchTasks(page.value)
      } else {
        ElMessage.error(res.data.error || '创建失败')
      }
    }
  } catch (e) {
    if (e.message) {
      ElMessage.error(e.message)
    }
    console.error(e)
  } finally {
    submitLoading.value = false
  }
}

const completeTask = async (id) => {
  try {
    await ElMessageBox.confirm('确定要标记此任务为已完成吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const res = await api.patch(`/tasks/${id}/complete`)
    if (res.data.success) {
      ElMessage.success('操作成功')
      fetchTasks(page.value)
    } else {
      ElMessage.error(res.data.error || '操作失败')
    }
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('操作失败')
      console.error(e)
    }
  }
}

const deleteTask = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除此任务吗？此操作不可恢复！', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const res = await api.delete(`/tasks/${id}`)
    if (res.data.success) {
      ElMessage.success('删除成功')
      fetchTasks(page.value)
    } else {
      ElMessage.error(res.data.error || '删除失败')
    }
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('删除失败')
      console.error(e)
    }
  }
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  form.value = {
    title: '',
    description: '',
    totalDays: 30
  }
  currentEditId.value = ''
}

const getStatusType = (status) => {
  const types = {
    active: 'primary',
    completed: 'success',
    expired: 'danger'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    active: '进行中',
    completed: '已完成',
    expired: '已过期'
  }
  return texts[status] || status
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN', { 
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false 
  })
}

onMounted(() => {
  fetchTasks()
})
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style> 