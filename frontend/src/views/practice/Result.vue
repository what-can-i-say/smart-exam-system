<template>
  <div class="practice-result">
    <el-card class="result-summary">
      <div class="summary-header">
        <h2>🎉 练习完成</h2>
        <p>恭喜你完成了本次练习！</p>
      </div>
      
      <el-row :gutter="20" class="stats-row">
        <el-col :span="8">
          <div class="stat-item">
            <div class="stat-value">{{ total }}</div>
            <div class="stat-label">总题数</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-item success">
            <div class="stat-value">{{ correct }}</div>
            <div class="stat-label">答对题数</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-item" :class="accuracyClass">
            <div class="stat-value">{{ accuracy }}%</div>
            <div class="stat-label">正确率</div>
          </div>
        </el-col>
      </el-row>
      
      <!-- 进度环 -->
      <div class="progress-circle">
        <el-progress 
          type="circle" 
          :percentage="accuracy" 
          :color="progressColor"
          :width="160"
          :stroke-width="12"
        />
      </div>
    </el-card>
    
    <!-- 错题回顾 -->
    <el-card class="wrong-questions" style="margin-top: 20px">
      <template #header>
        <span>📝 错题回顾</span>
      </template>
      
      <div v-if="wrongQuestions.length === 0" class="no-wrong">
        <el-icon :size="48" color="#67C23A"><CircleCheck /></el-icon>
        <p>太棒了！全部答对！</p>
      </div>
      
      <div v-else>
        <el-collapse v-model="activeNames">
          <el-collapse-item 
            v-for="(q, index) in wrongQuestions" 
            :key="q.id"
            :name="index"
          >
            <template #title>
              <div class="collapse-title">
                <el-tag :type="q.type === 1 ? 'primary' : 'success'" size="small">
                  {{ q.type === 1 ? '单选' : '多选' }}
                </el-tag>
                <span class="title-text">{{ index + 1 }}. {{ q.content }}</span>
              </div>
            </template>
            
            <div class="wrong-detail">
              <div class="user-answer">
                <span class="label">你的答案：</span>
                <span class="value wrong">{{ q.userAnswer }}</span>
              </div>
              <div class="correct-answer">
                <span class="label">正确答案：</span>
                <span class="value correct">{{ q.answer }}</span>
              </div>
              <div class="analysis">
                <span class="label">解析：</span>
                <p>{{ q.analysis }}</p>
              </div>
              <div class="actions">
                <el-button type="primary" size="small" @click="addToNotebook(q)">
                  加入错题本
                </el-button>
                <el-button size="small" @click="practiceAgain(q.knowledgeId)">
                  练习同类题
                </el-button>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </el-card>
    
    <!-- 操作按钮 -->
    <div class="result-actions">
      <el-button size="large" @click="goBack">返回首页</el-button>
      <el-button type="primary" size="large" @click="practiceAgain">继续刷题</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

const total = ref(Number(route.query.total) || 0)
const correct = ref(Number(route.query.correct) || 0)
const accuracy = ref(Number(route.query.accuracy) || 0)

const activeNames = ref([0])

// 模拟错题数据
const wrongQuestions = ref([
  {
    id: 2,
    type: 1,
    content: '极限 lim(x→0) sinx/x 的值是？',
    options: {
      A: '0',
      B: '1',
      C: '-1',
      D: '不存在'
    },
    answer: 'B',
    analysis: '这是一个重要极限，lim(x→0) sinx/x = 1。',
    userAnswer: 'A',
    knowledgeId: 1
  }
])

const accuracyClass = computed(() => {
  if (accuracy.value >= 80) return 'excellent'
  if (accuracy.value >= 60) return 'good'
  return 'poor'
})

const progressColor = computed(() => {
  if (accuracy.value >= 80) return '#67C23A'
  if (accuracy.value >= 60) return '#E6A23C'
  return '#F56C6C'
})

const goBack = () => {
  router.push('/dashboard')
}

const practiceAgain = (knowledgeId) => {
  router.push('/practice/start')
}

const addToNotebook = (question) => {
  // 添加到错题本
  const notebook = JSON.parse(localStorage.getItem('notebook') || '[]')
  if (!notebook.find(q => q.id === question.id)) {
    notebook.push({
      ...question,
      addTime: new Date().toISOString()
    })
    localStorage.setItem('notebook', JSON.stringify(notebook))
    ElMessage.success('已添加到错题本')
  } else {
    ElMessage.info('该题已在错题本中')
  }
}
</script>

<style lang="scss" scoped>
.practice-result {
  max-width: 800px;
  margin: 0 auto;
  
  .result-summary {
    text-align: center;
    
    .summary-header {
      margin-bottom: 30px;
      
      h2 {
        color: #333;
        margin-bottom: 10px;
      }
      
      p {
        color: #999;
      }
    }
    
    .stats-row {
      margin-bottom: 30px;
      
      .stat-item {
        .stat-value {
          font-size: 36px;
          font-weight: bold;
          color: #333;
        }
        
        .stat-label {
          font-size: 14px;
          color: #999;
          margin-top: 5px;
        }
        
        &.success .stat-value { color: #67C23A; }
        &.excellent .stat-value { color: #67C23A; }
        &.good .stat-value { color: #E6A23C; }
        &.poor .stat-value { color: #F56C6C; }
      }
    }
    
    .progress-circle {
      margin: 20px 0;
    }
  }
  
  .wrong-questions {
    .no-wrong {
      text-align: center;
      padding: 40px;
      
      p {
        margin-top: 20px;
        color: #666;
        font-size: 16px;
      }
    }
    
    .collapse-title {
      display: flex;
      align-items: center;
      
      .title-text {
        margin-left: 10px;
        font-weight: normal;
      }
    }
    
    .wrong-detail {
      padding: 15px 20px;
      
      .user-answer, .correct-answer {
        margin-bottom: 10px;
        
        .label {
          font-weight: bold;
          margin-right: 10px;
        }
        
        .value.wrong {
          color: #F56C6C;
        }
        
        .value.correct {
          color: #67C23A;
        }
      }
      
      .analysis {
        margin: 15px 0;
        padding: 15px;
        background: #f5f7fa;
        border-radius: 8px;
        
        .label {
          font-weight: bold;
          display: block;
          margin-bottom: 8px;
        }
        
        p {
          color: #666;
          line-height: 1.6;
        }
      }
      
      .actions {
        margin-top: 15px;
        
        .el-button {
          margin-right: 10px;
        }
      }
    }
  }
  
  .result-actions {
    margin-top: 30px;
    text-align: center;
    
    .el-button {
      min-width: 150px;
      margin: 0 10px;
    }
  }
}
</style>