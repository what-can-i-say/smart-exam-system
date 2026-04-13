<template>
  <div class="dashboard">
    <div class="welcome-section">
      <h1>👋 欢迎回来，{{ userStore.userName }}</h1>
      <p class="date">{{ currentDate }}</p>
    </div>
    
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon primary">
              <el-icon :size="32"><Calendar /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.studyDays }}</div>
              <div class="stat-label">学习天数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon success">
              <el-icon :size="32"><Edit /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalQuestions }}</div>
              <div class="stat-label">累计刷题</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon warning">
              <el-icon :size="32"><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.pendingReview }}</div>
              <div class="stat-label">待复习</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon danger">
              <el-icon :size="32"><Trophy /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.accuracy }}%</div>
              <div class="stat-label">正确率</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 快捷入口 -->
    <el-row :gutter="20" class="quick-row">
      <el-col :span="8">
        <el-card class="quick-card" shadow="hover" @click="$router.push('/practice')">
          <div class="quick-icon">
            <el-icon :size="40"><Edit /></el-icon>
          </div>
          <h3>开始刷题</h3>
          <p>选择科目和知识点开始练习</p>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="quick-card" shadow="hover" @click="$router.push('/review')">
          <div class="quick-icon">
            <el-icon :size="40"><Clock /></el-icon>
          </div>
          <h3>智能复习</h3>
          <p>基于艾宾浩斯记忆曲线科学复习</p>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="quick-card" shadow="hover" @click="$router.push('/analysis')">
          <div class="quick-icon">
            <el-icon :size="40"><PieChart /></el-icon>
          </div>
          <h3>薄弱分析</h3>
          <p>查看知识图谱与掌握情况</p>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 今日任务 -->
    <el-card class="task-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>📋 今日复习任务</span>
          <el-button type="primary" link @click="$router.push('/review')">
            查看全部
          </el-button>
        </div>
      </template>
      
      <el-table :data="todayTasks" style="width: 100%">
        <el-table-column prop="title" label="知识点" />
        <el-table-column prop="count" label="题目数" width="100" />
        <el-table-column prop="memoryLevel" label="记忆水平" width="150">
          <template #default="{ row }">
            <el-progress 
              :percentage="row.memoryLevel" 
              :color="getProgressColor(row.memoryLevel)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default>
            <el-button type="primary" link>开始复习</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { useUserStore } from '@/store/modules/user'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')

const userStore = useUserStore()

const currentDate = computed(() => {
  return dayjs().format('YYYY年MM月DD日 dddd')
})

const stats = reactive({
  studyDays: 45,
  totalQuestions: 1234,
  pendingReview: 12,
  accuracy: 78.5
})

const todayTasks = reactive([
  { title: '高等数学 - 极限与连续', count: 5, memoryLevel: 35 },
  { title: '英语 - 考研核心词汇', count: 20, memoryLevel: 72 },
  { title: '政治 - 马原第一章', count: 8, memoryLevel: 58 }
])

const getProgressColor = (level) => {
  if (level > 70) return '#67C23A'
  if (level > 40) return '#E6A23C'
  return '#F56C6C'
}
</script>

<style lang="scss" scoped>
.dashboard {
  .welcome-section {
    margin-bottom: 24px;
    
    h1 {
      font-size: 24px;
      color: #333;
      margin-bottom: 8px;
    }
    
    .date {
      color: #999;
    }
  }
  
  .stat-row {
    margin-bottom: 24px;
    
    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;
        
        .stat-icon {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          color: white;
          
          &.primary { background: linear-gradient(135deg, #667eea, #764ba2); }
          &.success { background: linear-gradient(135deg, #43e97b, #38f9d7); }
          &.warning { background: linear-gradient(135deg, #f6d365, #fda085); }
          &.danger { background: linear-gradient(135deg, #fa709a, #fee140); }
        }
        
        .stat-info {
          margin-left: 16px;
          
          .stat-value {
            font-size: 28px;
            font-weight: bold;
            color: #333;
          }
          
          .stat-label {
            font-size: 14px;
            color: #999;
          }
        }
      }
    }
  }
  
  .quick-row {
    margin-bottom: 24px;
    
    .quick-card {
      text-align: center;
      padding: 24px;
      cursor: pointer;
      transition: all 0.3s;
      
      &:hover {
        transform: translateY(-4px);
      }
      
      .quick-icon {
        color: #409EFF;
        margin-bottom: 16px;
      }
      
      h3 {
        margin-bottom: 8px;
        color: #333;
      }
      
      p {
        color: #999;
        font-size: 14px;
      }
    }
  }
  
  .task-card {
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }
}
</style>