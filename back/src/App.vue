<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()
const isCollapse = ref(false)

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    localStorage.removeItem('back_token')
    router.push('/login')
  } catch (e) {
    // 用户取消
  }
}
</script>

<template>
  <el-container style="height: 100vh; width: 100vw;">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '200px'" style="background-color: #304156;">
      <div class="logo-container">
        <h2 v-if="!isCollapse" class="logo-text">后台管理</h2>
        <el-icon v-else class="logo-icon"><Setting /></el-icon>
      </div>
      
      <el-menu
        :default-active="route.path"
        class="sidebar-menu"
        :collapse="isCollapse"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        router
      >
        <el-menu-item index="/tasks">
          <el-icon><List /></el-icon>
          <template #title>任务管理</template>
        </el-menu-item>
        <el-menu-item index="/stats">
          <el-icon><DataAnalysis /></el-icon>
          <template #title>数据统计</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <el-container>
      <!-- 头部 -->
      <el-header height="60px" style="background-color: #fff; border-bottom: 1px solid #e6e6e6;">
        <div class="header-content">
          <div class="header-left">
            <el-button 
              type="text" 
              @click="isCollapse = !isCollapse"
              style="font-size: 18px; padding: 0;"
            >
              <el-icon><Setting /></el-icon>
            </el-button>
            <span class="header-title">目标倒计时挑战 - 后台管理系统</span>
          </div>
          <div class="header-right">
            <el-button type="text" @click="handleLogout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-button>
          </div>
        </div>
      </el-header>

      <!-- 主内容 -->
      <el-main style="background-color: #f0f2f5; padding: 20px; height: calc(100vh - 60px); overflow-y: auto;">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2b2f3a;
  color: #fff;
}

.logo-text {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
}

.logo-icon {
  font-size: 24px;
}

.sidebar-menu {
  border-right: none;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.header-right {
  display: flex;
  align-items: center;
}

/* 确保页面填满 */
:deep(.el-container) {
  height: 100vh;
  width: 100vw;
}

:deep(.el-main) {
  height: calc(100vh - 60px);
  overflow-y: auto;
}
</style>
