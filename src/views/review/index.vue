<template>
  <div class="review-page">
    <!-- 顶部统计 -->
    <el-card class="review-header">
      <div class="header-info">
        <h2>🔄 智能复习</h2>
        <p>基于艾宾浩斯遗忘曲线，科学安排复习计划</p>
      </div>
      
      <el-row :gutter="20" class="stats-row">
        <el-col :xs="12" :sm="6">
          <div class="stat-item">
            <div class="stat-value primary">{{ reviewStats.todayTotal }}</div>
            <div class="stat-label">今日待复习</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="stat-item">
            <div class="stat-value success">{{ reviewStats.completed }}</div>
            <div class="stat-label">今日已完成</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="stat-item">
            <div class="stat-value warning">{{ reviewStats.continuous }}</div>
            <div class="stat-label">连续复习天数</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="stat-item">
            <div class="stat-value danger">{{ reviewStats.retention }}%</div>
            <div class="stat-label">平均记忆保持率</div>
          </div>
        </el-col>
      </el-row>
    </el-card>
    
    <!-- 记忆曲线图 -->
    <el-card class="curve-card">
      <template #header>
        <div class="card-header">
          <span>📈 艾宾浩斯记忆保持率曲线</span>
          <el-tag type="info">复习间隔：5分钟 → 30分钟 → 12小时 → 1天 → 2天 → 4天 → 7天 → 15天</el-tag>
        </div>
      </template>
      <div ref="chartRef" class="chart-container"></div>
    </el-card>
    
    <!-- 今日复习任务 -->
    <el-card class="task-card">
      <template #header>
        <div class="card-header">
          <span>📋 今日复习任务（{{ todayTasks.length }} 个知识点）</span>
          <el-button 
            type="primary" 
            :disabled="todayTasks.length === 0"
            @click="startReview"
          >
            开始复习
          </el-button>
        </div>
      </template>
      
      <el-table :data="todayTasks" style="width: 100%">
        <el-table-column prop="knowledgeName" label="知识点" min-width="150" />
        <el-table-column prop="subjectName" label="学科" width="120" />
        <el-table-column prop="questionCount" label="题目数" width="100" align="center" />
        <el-table-column prop="reviewStage" label="复习阶段" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getStageTagType(row.reviewStage)">
              第 {{ row.reviewStage }} 次
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="memoryLevel" label="记忆水平" width="150">
          <template #default="{ row }">
            <el-progress 
              :percentage="row.memoryLevel" 
              :color="getMemoryColor(row.memoryLevel)"
              :stroke-width="8"
            />
          </template>
        </el-table-column>
        <el-table-column prop="nextReviewTime" label="建议复习" width="120">
          <template #default="{ row }">
            {{ formatNextReviewTime(row.nextReviewTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button type="primary" link @click="reviewKnowledge(row)">
              复习
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div v-if="todayTasks.length === 0" class="empty-tasks">
        <el-icon :size="48" color="#67C23A"><CircleCheck /></el-icon>
        <p>🎉 太棒了！今日复习任务已完成！</p>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import {
  generateReviewTasks,
  getReviewStatistics,
  getEbbinghausCurveData,
  getStageTagType,
  getMemoryColor,
  formatNextReviewTime
} from '@/utils/ebbinghaus'

const router = useRouter()
const chartRef = ref(null)

// 统计数据
const reviewStats = reactive({
  todayTotal: 0,
  completed: 0,
  continuous: 7,
  retention: 72
})

// 今日任务
const todayTasks = ref([])

// 所有复习记录
const reviewRecords = ref([])

// 加载复习数据
const loadReviewData = () => {
  const stored = localStorage.getItem('reviewRecords')
  
  if (stored) {
    reviewRecords.value = JSON.parse(stored)
  } else {
    // 初始化模拟复习数据
    const now = new Date()
    reviewRecords.value = [
      {
        id: 1,
        questionId: 1,
        knowledgeId: 10102, // 极限的定义
        reviewStage: 1,
        correctCount: 0,
        totalReviewCount: 1,
        lastReviewTime: new Date(now - 30 * 60 * 1000).toISOString(),
        nextReviewTime: now.toISOString(),
        memoryLevel: 45,
        status: 0
      },
      {
        id: 2,
        questionId: 6,
        knowledgeId: 10201, // 导数的定义
        reviewStage: 1,
        correctCount: 1,
        totalReviewCount: 1,
        lastReviewTime: new Date(now - 60 * 60 * 1000).toISOString(),
        nextReviewTime: now.toISOString(),
        memoryLevel: 60,
        status: 0
      },
      {
        id: 3,
        questionId: 9,
        knowledgeId: 20101, // 高频词汇 A-D
        reviewStage: 2,
        correctCount: 2,
        totalReviewCount: 2,
        lastReviewTime: new Date(now - 12 * 60 * 60 * 1000).toISOString(),
        nextReviewTime: now.toISOString(),
        memoryLevel: 72,
        status: 0
      }
    ]
    localStorage.setItem('reviewRecords', JSON.stringify(reviewRecords.value))
  }
  
  // 生成今日任务
  todayTasks.value = generateReviewTasks(reviewRecords.value)
  
  // 更新统计
  const stats = getReviewStatistics(reviewRecords.value)
  reviewStats.todayTotal = stats.todayTotal
  reviewStats.completed = stats.completed
  reviewStats.continuous = stats.continuous
  reviewStats.retention = stats.retention
}

// 渲染艾宾浩斯曲线
const renderEbbinghausCurve = () => {
  if (!chartRef.value) return
  
  const chart = echarts.init(chartRef.value)
  const { timePoints, naturalForgetting, withReview } = getEbbinghausCurveData()
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        return `${params[0].axisValue}<br/>
                ${params[0].marker} 不复习: ${params[0].value}%<br/>
                ${params[1].marker} 科学复习: ${params[1].value}%`
      }
    },
    legend: {
      data: ['不复习（自然遗忘）', '科学复习（艾宾浩斯法）'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: timePoints
    },
    yAxis: {
      type: 'value',
      name: '记忆保持率 (%)',
      max: 100
    },
    series: [
      {
        name: '不复习（自然遗忘）',
        type: 'line',
        data: naturalForgetting,
        smooth: true,
        lineStyle: { color: '#F56C6C', width: 2 },
        areaStyle: { color: 'rgba(245, 108, 108, 0.1)' },
        symbol: 'circle',
        symbolSize: 8
      },
      {
        name: '科学复习（艾宾浩斯法）',
        type: 'line',
        data: withReview,
        smooth: true,
        lineStyle: { color: '#67C23A', width: 2, type: 'dashed' },
        areaStyle: { color: 'rgba(103, 194, 58, 0.1)' },
        symbol: 'diamond',
        symbolSize: 8
      }
    ]
  }
  
  chart.setOption(option)
  window.addEventListener('resize', () => chart.resize())
}

// 开始复习
const startReview = () => {
  if (todayTasks.value.length === 0) return
  
  // 保存当前复习任务
  localStorage.setItem('currentReviewTasks', JSON.stringify(todayTasks.value))
  router.push('/review/doing')
}

// 复习指定知识点
const reviewKnowledge = (row) => {
  localStorage.setItem('currentReviewTasks', JSON.stringify([row]))
  router.push('/review/doing')
}

onMounted(() => {
  loadReviewData()
  renderEbbinghausCurve()
})
</script>

<style lang="scss" scoped>
.review-page {
  .review-header {
    margin-bottom: 20px;
    
    .header-info {
      margin-bottom: 20px;
      
      h2 { font-size: 24px; color: #333; margin-bottom: 8px; }
      p { color: #999; }
    }
    
    .stats-row {
      .stat-item {
        text-align: center;
        padding: 16px;
        background: #f5f7fa;
        border-radius: 12px;
        
        .stat-value {
          font-size: 32px;
          font-weight: bold;
          &.primary { color: #409EFF; }
          &.success { color: #67C23A; }
          &.warning { color: #E6A23C; }
          &.danger { color: #F56C6C; }
        }
        .stat-label { color: #999; margin-top: 8px; }
      }
    }
  }
  
  .curve-card {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .chart-container { height: 350px; }
  }
  
  .task-card {
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .empty-tasks {
      text-align: center;
      padding: 60px;
      color: #999;
      
      p { margin-top: 20px; font-size: 16px; }
    }
  }
}
</style>