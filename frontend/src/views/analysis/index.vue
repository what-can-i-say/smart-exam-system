<template>
  <div class="analysis">
    <!-- 标题 -->
    <div class="page-header">
      <h2>📊 靶向分析</h2>
      <p>基于知识图谱的薄弱点分析，精准定位知识盲区</p>
    </div>

    <!-- 学科选择 -->
    <el-card class="subject-card">
      <el-radio-group v-model="currentSubject" size="large">
        <el-radio-button :value="1">高等数学</el-radio-button>
        <el-radio-button :value="2">英语</el-radio-button>
        <el-radio-button :value="3">政治</el-radio-button>
        <el-radio-button :value="4">专业课</el-radio-button>
      </el-radio-group>
    </el-card>

    <el-row :gutter="20">
      <!-- 左侧：雷达图 -->
      <el-col :span="12">
        <el-card class="radar-card">
          <template #header>
            <span>🎯 知识点掌握情况雷达图</span>
          </template>
          <div ref="radarChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 右侧：整体统计 -->
      <el-col :span="12">
        <el-card class="stats-card">
          <template #header>
            <span>📈 整体掌握情况</span>
          </template>

          <div class="overall-stats">
            <div class="stat-item">
              <div class="stat-value primary">{{ overallStats.masteryRate }}%</div>
              <div class="stat-label">整体掌握率</div>
              <el-progress
                :percentage="overallStats.masteryRate"
                :color="getProgressColor(overallStats.masteryRate)"
                :stroke-width="10"
              />
            </div>

            <el-row :gutter="20" class="detail-stats">
              <el-col :span="8">
                <div class="detail-item">
                  <div class="value">{{ overallStats.totalQuestions }}</div>
                  <div class="label">总题数</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="detail-item">
                  <div class="value success">{{ overallStats.correctQuestions }}</div>
                  <div class="label">答对题数</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="detail-item">
                  <div class="value danger">{{ overallStats.wrongQuestions }}</div>
                  <div class="label">答错题数</div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>

        <!-- 薄弱点 Top 5 -->
        <el-card class="weak-top-card">
          <template #header>
            <span>⚠️ 薄弱知识点 TOP 5</span>
          </template>

          <div class="weak-list">
            <div
              v-for="(item, index) in weakTop5"
              :key="item.id"
              class="weak-item"
              @click="showRecommendation(item)"
            >
              <div class="rank">{{ index + 1 }}</div>
              <div class="info">
                <div class="name">{{ item.name }}</div>
                <el-progress
                  :percentage="item.weakScore"
                  :color="getWeakColor(item.weakScore)"
                  :stroke-width="6"
                />
              </div>
              <div class="score">{{ item.weakScore }}%</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 知识图谱树 -->
    <el-card class="knowledge-tree-card">
      <template #header>
        <span>🌳 知识图谱</span>
      </template>

      <el-table
        :data="knowledgeList"
        row-key="id"
        :tree-props="{ children: 'children' }"
        style="width: 100%"
      >
        <el-table-column prop="name" label="知识点" min-width="200">
          <template #default="{ row }">
            <span :style="{ paddingLeft: (row.level - 1) * 20 + 'px' }">
              {{ row.name }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="totalQuestions" label="总题数" width="100" align="center" />
        <el-table-column prop="answeredQuestions" label="已答题数" width="100" align="center" />
        <el-table-column prop="correctRate" label="正确率" width="150">
          <template #default="{ row }">
            <el-progress
              :percentage="row.correctRate"
              :color="getProgressColor(row.correctRate)"
              :stroke-width="8"
            />
          </template>
        </el-table-column>
        <el-table-column prop="masteryLevel" label="掌握程度" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getMasteryTag(row.masteryLevel)">
              {{ getMasteryText(row.masteryLevel) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button type="primary" link @click="practiceKnowledge(row)">
              针对性练习
            </el-button>
            <el-button type="success" link @click="viewDetail(row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 推荐练习对话框 -->
    <el-dialog
      v-model="showRecommendDialog"
      title="📚 针对性练习推荐"
      width="600px"
    >
      <div v-if="currentWeakPoint" class="recommend-content">
        <div class="weak-info">
          <h4>{{ currentWeakPoint.name }}</h4>
          <p>薄弱程度：{{ currentWeakPoint.weakScore }}%</p>
          <p>建议：多练习基础题，巩固概念理解</p>
        </div>

        <div class="recommend-questions">
          <h5>推荐题目</h5>
          <el-table :data="recommendQuestions" style="width: 100%">
            <el-table-column prop="content" label="题目" />
            <el-table-column prop="difficulty" label="难度" width="80">
              <template #default="{ row }">
                <el-tag :type="getDifficultyTag(row.difficulty)" size="small">
                  {{ getDifficultyText(row.difficulty) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <template #footer>
        <el-button @click="showRecommendDialog = false">关闭</el-button>
        <el-button type="primary" @click="startRecommendedPractice">
          开始练习
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'

const router = useRouter()

// 当前学科
const currentSubject = ref(1)

// 图表
const radarChartRef = ref(null)
let radarChart = null

// 整体统计
const overallStats = reactive({
  masteryRate: 68,
  totalQuestions: 156,
  correctQuestions: 106,
  wrongQuestions: 50
})

// 薄弱点 Top 5
const weakTop5 = ref([
  { id: 1, name: '极限的运算法则', weakScore: 78 },
  { id: 2, name: '导数应用', weakScore: 65 },
  { id: 3, name: '中值定理', weakScore: 58 },
  { id: 4, name: '不定积分', weakScore: 52 },
  { id: 5, name: '定积分应用', weakScore: 45 }
])

// 知识图谱列表
const knowledgeList = ref([
  {
    id: 1,
    name: '函数与极限',
    level: 1,
    totalQuestions: 50,
    answeredQuestions: 45,
    correctRate: 72,
    masteryLevel: 3,
    children: [
      {
        id: 11,
        name: '函数概念',
        level: 2,
        totalQuestions: 15,
        answeredQuestions: 15,
        correctRate: 85,
        masteryLevel: 4
      },
      {
        id: 12,
        name: '极限定义',
        level: 2,
        totalQuestions: 20,
        answeredQuestions: 18,
        correctRate: 65,
        masteryLevel: 2
      },
      {
        id: 13,
        name: '极限运算法则',
        level: 2,
        totalQuestions: 15,
        answeredQuestions: 12,
        correctRate: 58,
        masteryLevel: 2
      }
    ]
  },
  {
    id: 2,
    name: '导数与微分',
    level: 1,
    totalQuestions: 45,
    answeredQuestions: 40,
    correctRate: 70,
    masteryLevel: 3,
    children: [
      {
        id: 21,
        name: '导数定义',
        level: 2,
        totalQuestions: 15,
        answeredQuestions: 15,
        correctRate: 80,
        masteryLevel: 4
      },
      {
        id: 22,
        name: '求导法则',
        level: 2,
        totalQuestions: 20,
        answeredQuestions: 18,
        correctRate: 68,
        masteryLevel: 3
      },
      {
        id: 23,
        name: '高阶导数',
        level: 2,
        totalQuestions: 10,
        answeredQuestions: 7,
        correctRate: 55,
        masteryLevel: 2
      }
    ]
  }
])

// 对话框
const showRecommendDialog = ref(false)
const currentWeakPoint = ref(null)
const recommendQuestions = ref([
  { id: 1, content: '求极限 lim(x→0) (sin3x)/x', difficulty: 1 },
  { id: 2, content: '求极限 lim(x→∞) (1+1/x)^x', difficulty: 2 },
  { id: 3, content: '求极限 lim(x→0) (e^x-1)/x', difficulty: 2 }
])

// 雷达图指标
const radarIndicators = [
  { name: '函数与极限', max: 100 },
  { name: '导数与微分', max: 100 },
  { name: '中值定理', max: 100 },
  { name: '不定积分', max: 100 },
  { name: '定积分', max: 100 },
  { name: '微分方程', max: 100 }
]

const radarData = [72, 70, 58, 65, 60, 45]

// 渲染雷达图
const renderRadarChart = () => {
  if (!radarChartRef.value) return

  radarChart = echarts.init(radarChartRef.value)

  const option = {
    radar: {
      indicator: radarIndicators,
      shape: 'circle',
      center: ['50%', '50%'],
      radius: '65%',
      axisName: {
        color: '#333',
        fontSize: 12
      }
    },
    series: [{
      type: 'radar',
      data: [{
        value: radarData,
        name: '掌握程度',
        areaStyle: {
          color: 'rgba(64, 158, 255, 0.3)'
        },
        lineStyle: {
          color: '#409EFF',
          width: 2
        },
        itemStyle: {
          color: '#409EFF'
        }
      }]
    }]
  }

  radarChart.setOption(option)

  window.addEventListener('resize', () => {
    radarChart?.resize()
  })
}

// 获取进度条颜色
const getProgressColor = (rate) => {
  if (rate >= 80) return '#67C23A'
  if (rate >= 60) return '#E6A23C'
  return '#F56C6C'
}

// 获取薄弱程度颜色
const getWeakColor = (score) => {
  if (score >= 70) return '#F56C6C'
  if (score >= 40) return '#E6A23C'
  return '#67C23A'
}

// 获取掌握程度标签
const getMasteryTag = (level) => {
  const tags = ['', 'danger', 'warning', 'primary', 'success', 'success']
  return tags[level] || 'info'
}

const getMasteryText = (level) => {
  const texts = ['', '很差', '较差', '一般', '良好', '优秀']
  return texts[level] || '未知'
}

// 获取难度标签
const getDifficultyTag = (difficulty) => {
  const tags = ['', 'success', 'warning', 'danger']
  return tags[difficulty] || 'info'
}

const getDifficultyText = (difficulty) => {
  const texts = ['', '简单', '中等', '困难']
  return texts[difficulty] || '未知'
}

// 显示推荐
const showRecommendation = (item) => {
  currentWeakPoint.value = item
  showRecommendDialog.value = true
}

// 针对性练习
const practiceKnowledge = (row) => {
  router.push({
    path: '/practice/start',
    query: { knowledgeId: row.id }
  })
}

// 查看详情
const viewDetail = (row) => {
  console.log('查看详情:', row)
}

// 开始推荐练习
const startRecommendedPractice = () => {
  showRecommendDialog.value = false
  router.push('/practice/start')
}

// 监听学科变化
watch(currentSubject, () => {
  // 重新加载数据
  renderRadarChart()
})

onMounted(() => {
  renderRadarChart()
})
</script>

<style lang="scss" scoped>
.analysis {
  .page-header {
    margin-bottom: 24px;

    h2 {
      font-size: 24px;
      color: #333;
      margin-bottom: 8px;
    }

    p {
      color: #999;
    }
  }

  .subject-card {
    margin-bottom: 20px;
    text-align: center;
  }

  .radar-card,
  .stats-card {
    margin-bottom: 20px;

    .chart-container {
      height: 350px;
    }
  }

  .overall-stats {
    .stat-item {
      text-align: center;
      margin-bottom: 24px;

      .stat-value {
        font-size: 48px;
        font-weight: bold;

        &.primary {
          color: #409EFF;
        }
      }

      .stat-label {
        color: #999;
        margin-bottom: 16px;
      }
    }

    .detail-stats {
      .detail-item {
        text-align: center;
        padding: 16px;
        background: #f5f7fa;
        border-radius: 8px;

        .value {
          font-size: 28px;
          font-weight: bold;

          &.success {
            color: #67C23A;
          }

          &.danger {
            color: #F56C6C;
          }
        }

        .label {
          color: #999;
          font-size: 13px;
        }
      }
    }
  }

  .weak-top-card {
    .weak-list {
      .weak-item {
        display: flex;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #eee;
        cursor: pointer;

        &:hover {
          background: #f5f7fa;
        }

        .rank {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0f2f5;
          border-radius: 50%;
          font-weight: bold;
          margin-right: 12px;
        }

        .info {
          flex: 1;

          .name {
            margin-bottom: 6px;
            font-weight: 500;
          }
        }

        .score {
          min-width: 50px;
          text-align: right;
          font-weight: bold;
          color: #F56C6C;
        }
      }
    }
  }

  .knowledge-tree-card {
    margin-top: 20px;
  }

  .recommend-content {
    .weak-info {
      padding: 16px;
      background: #f5f7fa;
      border-radius: 8px;
      margin-bottom: 20px;

      h4 {
        margin-bottom: 10px;
        color: #333;
      }

      p {
        color: #666;
        margin-bottom: 5px;
      }
    }

    .recommend-questions {
      h5 {
        margin-bottom: 15px;
      }
    }
  }
}
</style>