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
        <el-card class="quick-card" shadow="hover" @click="$router.push('/practice/start')">
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
    
    <!-- 今日复习任务 -->
    <el-card class="task-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>📋 今日复习任务</span>
          <el-button type="primary" link @click="$router.push('/review')">
            查看全部
          </el-button>
        </div>
      </template>
      
      <el-table :data="todayTasks" style="width: 100%" :empty-text="emptyText">
        <el-table-column prop="knowledgeName" label="知识点" />
        <el-table-column prop="subjectName" label="学科" width="120" />
        <el-table-column prop="questionCount" label="题目数" width="100" />
        <el-table-column prop="memoryLevel" label="记忆水平" width="150">
          <template #default="{ row }">
            <el-progress 
              :percentage="row.memoryLevel" 
              :color="getMemoryColor(row.memoryLevel)"
              :stroke-width="8"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button type="primary" link @click="startReviewTask(row)">
              开始复习
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, computed, ref, onMounted } from 'vue'
import { useUserStore } from '@/store/modules/user'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { generateReviewTasks } from '@/utils/ebbinghaus'
import { getKnowledgeName, getSubjectNameByKnowledge } from '@/data/questions'

dayjs.locale('zh-cn')

const router = useRouter()
const userStore = useUserStore()

const currentDate = computed(() => {
  return dayjs().format('YYYY年MM月DD日 dddd')
})

// 统计数据
const stats = reactive({
  studyDays: 1,
  totalQuestions: 0,
  pendingReview: 0,
  accuracy: 0
})

// 今日任务
const todayTasks = ref([])

const emptyText = '🎉 暂无待复习任务，去刷题吧！'

// 计算统计数据
const calculateStats = () => {
  // 1. 累计刷题数 - 从答题历史获取
  const history = JSON.parse(localStorage.getItem('practiceHistory') || '[]')
  stats.totalQuestions = history.reduce((sum, h) => sum + (h.questionCount || 0), 0)
  
  // 2. 正确率
  if (history.length > 0) {
    const totalCorrect = history.reduce((sum, h) => sum + (h.correctCount || 0), 0)
    const totalQuestions = history.reduce((sum, h) => sum + (h.questionCount || 0), 0)
    stats.accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0
  } else {
    // 模拟数据
    stats.totalQuestions = 1234
    stats.accuracy = 78.5
  }
  
  // 3. 学习天数 - 从历史记录计算
  if (history.length > 0) {
    const dates = [...new Set(history.map(h => h.date?.split(' ')[0]))]
    stats.studyDays = dates.length || 1
  } else {
    stats.studyDays = 45
  }
  
  // 4. 待复习任务数
  const reviewRecords = JSON.parse(localStorage.getItem('reviewRecords') || '[]')
  const tasks = generateReviewTasks(reviewRecords)
  stats.pendingReview = tasks.length
  
  // 5. 今日复习任务（取前5个）
  todayTasks.value = tasks.slice(0, 5).map(task => ({
    ...task,
    knowledgeName: task.knowledgeName || getKnowledgeName(task.knowledgeId) || '未知知识点',
    subjectName: task.subjectName || getSubjectNameByKnowledge(task.knowledgeId) || '未知学科'
  }))
}

// 获取记忆水平颜色
const getMemoryColor = (level) => {
  if (level >= 70) return '#67C23A'
  if (level >= 40) return '#E6A23C'
  return '#F56C6C'
}

// 开始复习任务
const startReviewTask = (row) => {
  localStorage.setItem('currentReviewTasks', JSON.stringify([row]))
  router.push('/review/doing')
}

// 初始化模拟数据（如果没有历史记录）
const initMockData = () => {
  const history = JSON.parse(localStorage.getItem('practiceHistory') || '[]')
  
  if (history.length === 0) {
    // 创建模拟历史记录
    const mockHistory = [
      {
        subjectName: '高等数学',
        knowledgeName: '极限与连续',
        knowledgeId: 10102,
        questionCount: 20,
        correctCount: 14,
        accuracy: 70,
        date: '2026-04-15 14:30'
      },
      {
        subjectName: '英语',
        knowledgeName: '考研核心词汇',
        knowledgeId: 20101,
        questionCount: 30,
        correctCount: 24,
        accuracy: 80,
        date: '2026-04-14 09:15'
      },
      {
        subjectName: '政治',
        knowledgeName: '马原第一章',
        knowledgeId: 30101,
        questionCount: 15,
        correctCount: 10,
        accuracy: 67,
        date: '2026-04-13 16:00'
      }
    ]
    localStorage.setItem('practiceHistory', JSON.stringify(mockHistory))
  }
  
  const reviewRecords = JSON.parse(localStorage.getItem('reviewRecords') || '[]')
  
  if (reviewRecords.length === 0) {
    // 创建模拟复习记录
    const now = new Date()
    const mockRecords = [
      {
        id: 1,
        questionId: 1,
        knowledgeId: 10102,
        reviewStage: 3,
        correctCount: 2,
        totalReviewCount: 3,
        lastReviewTime: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
        nextReviewTime: now.toISOString(),
        memoryLevel: 35,
        status: 0
      },
      {
        id: 2,
        questionId: 9,
        knowledgeId: 20101,
        reviewStage: 2,
        correctCount: 2,
        totalReviewCount: 2,
        lastReviewTime: new Date(now - 12 * 60 * 60 * 1000).toISOString(),
        nextReviewTime: now.toISOString(),
        memoryLevel: 72,
        status: 0
      },
      {
        id: 3,
        questionId: 11,
        knowledgeId: 30101,
        reviewStage: 4,
        correctCount: 3,
        totalReviewCount: 4,
        lastReviewTime: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
        nextReviewTime: now.toISOString(),
        memoryLevel: 58,
        status: 0
      }
    ]
    localStorage.setItem('reviewRecords', JSON.stringify(mockRecords))
  }
}

onMounted(() => {
  initMockData()
  calculateStats()
})
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