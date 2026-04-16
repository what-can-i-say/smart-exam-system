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

      <el-table :data="todayTasks" style="width: 100%" :empty-text="emptyText" v-loading="loading">
        <el-table-column prop="knowledge_name" label="知识点" />
        <el-table-column prop="subject_name" label="学科" width="120" />
        <el-table-column prop="question_count" label="题目数" width="100" />
        <el-table-column prop="memory_level" label="记忆水平" width="150">
          <template #default="{ row }">
            <el-progress
              :percentage="row.memory_level"
              :color="getMemoryColor(row.memory_level)"
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
import { getTodayTasks } from '@/api/modules/review'
import { getKnowledgeName, getSubjectNameByKnowledge } from '@/data/questions'

dayjs.locale('zh-cn')

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)

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
const calculateStats = async () => {
  try {
    // 1. 从 localStorage 获取历史记录（作为后备方案）
    const history = JSON.parse(localStorage.getItem('practiceHistory') || '[]')
    stats.totalQuestions = history.reduce((sum, h) => sum + (h.questionCount || 0), 0)

    // 2. 正确率
    if (history.length > 0) {
      const totalCorrect = history.reduce((sum, h) => sum + (h.correctCount || 0), 0)
      const totalQuestions = history.reduce((sum, h) => sum + (h.questionCount || 0), 0)
      stats.accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0
    } else {
      stats.totalQuestions = 1234
      stats.accuracy = 78.5
    }

    // 3. 学习天数
    if (history.length > 0) {
      const dates = [...new Set(history.map(h => h.date?.split(' ')[0]))]
      stats.studyDays = dates.length || 1
    } else {
      stats.studyDays = 45
    }

    // 4. 待复习任务数
    stats.pendingReview = todayTasks.value.length
  } catch (error) {
    console.error('计算统计数据失败:', error)
  }
}

// 加载今日复习任务
const loadTodayTasks = async () => {
  loading.value = true
  try {
    // 尝试从后端 API 获取
    const response = await getTodayTasks()
    todayTasks.value = response.data
  } catch (error) {
    console.warn('无法从后端获取复习任务，使用本地数据')
    // 如果 API 调用失败，使用本地数据
    const reviewRecords = JSON.parse(localStorage.getItem('reviewRecords') || '[]')
    const now = new Date()
    const tasks = reviewRecords.map(record => ({
      ...record,
      knowledge_name: getKnowledgeName(record.knowledgeId) || '未知知识点',
      subject_name: getSubjectNameByKnowledge(record.knowledgeId) || '未知学科',
      question_count: 1
    }))

    todayTasks.value = tasks.filter(t => {
      const nextTime = new Date(t.nextReviewTime)
      return nextTime <= now && nextTime >= new Date(now - 24 * 60 * 60 * 1000)
    })
  } finally {
    loading.value = false
  }
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

onMounted(async () => {
  await loadTodayTasks()
  await calculateStats()
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
