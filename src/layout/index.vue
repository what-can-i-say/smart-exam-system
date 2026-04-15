<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside width="240px" class="layout-aside">
      <div class="logo">
        <span class="logo-icon">📚</span>
        <h2>考研智能刷题</h2>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        router
        class="menu"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataBoard /></el-icon>
          <span>学习仪表盘</span>
        </el-menu-item>
        
        <!-- 注意：路径改为 /practice/start -->
        <el-menu-item index="/practice/start">
          <el-icon><Edit /></el-icon>
          <span>刷题练习</span>
        </el-menu-item>
        
        <!-- 注意：路径改为 /review -->
        <el-menu-item index="/review">
          <el-icon><Clock /></el-icon>
          <span>智能复习</span>
        </el-menu-item>
        
        <el-menu-item index="/notebook">
          <el-icon><Notebook /></el-icon>
          <span>错题本</span>
        </el-menu-item>
        
        <el-menu-item index="/analysis">
          <el-icon><PieChart /></el-icon>
          <span>靶向分析</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <!-- 主内容区 -->
    <el-container>
      <el-header class="layout-header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="32" icon="UserFilled" />
              <span class="username">{{ userStore.userName }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 修复菜单高亮逻辑
const activeMenu = computed(() => {
  const path = route.path
  
  // 刷题模块：统一高亮 /practice/start
  if (path.startsWith('/practice')) {
    return '/practice/start'
  }
  
  // 复习模块：统一高亮 /review/index
  if (path.startsWith('/review')) {
    return '/review'
  }
  
  if (path.startsWith('/analysis')) {
    return '/analysis'
  }
  return path
})

const currentTitle = computed(() => route.meta.title || '')

const handleCommand = (command) => {
  if (command === 'logout') {
    userStore.logout()
    ElMessage.success('退出成功')
    router.push('/login')
  } else if (command === 'profile') {
    router.push('/profile')
  }
}
</script>

<style lang="scss" scoped>
.layout-container {
  height: 100%;
  
  .layout-aside {
    background-color: #304156;
    
    .logo {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      
      .logo-icon {
        font-size: 24px;
        margin-right: 8px;
      }
      
      h2 {
        font-size: 16px;
        font-weight: 500;
      }
    }
    
    .menu {
      border-right: none;
      background-color: #304156;
      
      :deep(.el-menu-item) {
        color: #bfcbd9;
        
        &:hover {
          background-color: #263445;
          color: #fff;
        }
        
        &.is-active {
          background-color: #409EFF;
          color: #fff;
        }
      }
    }
  }
  
  .layout-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #fff;
    border-bottom: 1px solid #e6e6e6;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
    
    .user-info {
      display: flex;
      align-items: center;
      cursor: pointer;
      
      .username {
        margin: 0 8px;
      }
    }
  }
  
  .layout-main {
    background-color: #f0f2f5;
    padding: 20px;
  }
}
</style>