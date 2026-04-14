<template>
  <div class="practice-container">
    <!-- 选题面板 -->
    <el-card v-if="!isPracticing && !showResult" class="select-panel">
      <template #header>
        <span class="panel-title">📝 选择练习设置</span>
      </template>
      
      <el-form :model="practiceConfig" label-width="100px">
        <el-form-item label="选择学科">
          <el-select 
            v-model="practiceConfig.subjectId" 
            placeholder="请选择学科"
            @change="handleSubjectChange"
          >
            <el-option
              v-for="subject in subjects"
              :key="subject.id"
              :label="subject.name"
              :value="subject.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="选择知识点">
          <el-select
            v-model="practiceConfig.knowledgeId"
            placeholder="请选择知识点"
            multiple
            collapse-tags
          >
            <el-option
              v-for="kp in knowledgePoints"
              :key="kp.id"
              :label="kp.name"
              :value="kp.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="题目数量">
          <el-slider v-model="practiceConfig.questionCount" :min="5" :max="50" show-stops />
          <span class="slider-value">{{ practiceConfig.questionCount }} 题</span>
        </el-form-item>
        
        <el-form-item label="难度选择">
          <el-checkbox-group v-model="practiceConfig.difficulties">
            <el-checkbox :value="1">简单</el-checkbox>
            <el-checkbox :value="2">中等</el-checkbox>
            <el-checkbox :value="3">困难</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" size="large" @click="startPractice" :loading="loading">
            开始刷题
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 答题面板 -->
    <div v-else-if="isPracticing && !showResult" class="practice-panel">
      <div class="practice-header">
        <div class="progress-info">
          <span class="current">{{ currentIndex + 1 }}</span>
          <span class="total">/ {{ questions.length }}</span>
        </div>
        <div class="progress-bar">
          <el-progress :percentage="progressPercent" :show-text="false" />
        </div>
        <el-button @click="submitPractice">提交</el-button>
      </div>
      
      <el-card class="question-card">
        <div class="question-header">
          <el-tag :type="getDifficultyType(currentQuestion.difficulty)">
            {{ getDifficultyText(currentQuestion.difficulty) }}
          </el-tag>
          <el-tag type="info">{{ currentQuestion.knowledgeName }}</el-tag>
        </div>
        
        <div class="question-content" v-html="currentQuestion.content"></div>
        
        <div class="question-options">
          <el-radio-group 
            v-if="currentQuestion.type === 1" 
            v-model="answers[currentIndex]" 
            class="option-group"
          >
            <el-radio 
              v-for="(option, key) in currentQuestion.options" 
              :key="key"
              :value="key"
              class="option-item"
            >
              {{ key }}. {{ option }}
            </el-radio>
          </el-radio-group>
          
          <el-checkbox-group 
            v-else-if="currentQuestion.type === 2"
            v-model="answers[currentIndex]"
            class="option-group"
          >
            <el-checkbox 
              v-for="(option, key) in currentQuestion.options" 
              :key="key"
              :value="key"
              class="option-item"
            >
              {{ key }}. {{ option }}
            </el-checkbox>
          </el-checkbox-group>
          
          <div v-else-if="currentQuestion.type === 3" class="judge-group">
            <el-radio-group v-model="answers[currentIndex]">
              <el-radio value="true">正确</el-radio>
              <el-radio value="false">错误</el-radio>
            </el-radio-group>
          </div>
        </div>
      </el-card>
      
      <div class="practice-footer">
        <el-button @click="prevQuestion" :disabled="currentIndex === 0">上一题</el-button>
        <el-button 
          v-if="currentIndex < questions.length - 1" 
          type="primary" 
          @click="nextQuestion"
        >
          下一题
        </el-button>
        <el-button 
          v-else 
          type="success" 
          @click="submitPractice"
        >
          完成答题
        </el-button>
      </div>
      
      <!-- 答题卡 -->
      <el-card class="answer-sheet">
        <template #header>
          <span>📋 答题卡</span>
        </template>
        <div class="sheet-grid">
          <div 
            v-for="(q, idx) in questions" 
            :key="idx"
            :class="['sheet-item', { 
              'answered': answers[idx] !== undefined && answers[idx] !== '',
              'current': idx === currentIndex 
            }]"
            @click="currentIndex = idx"
          >
            {{ idx + 1 }}
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 结果面板 -->
    <el-card v-else-if="showResult" class="result-panel">
      <template #header>
        <span>🎉 练习完成</span>
      </template>
      
      <div class="result-summary">
        <div class="score-circle">
          <el-progress 
            type="circle" 
            :percentage="accuracy" 
            :width="180"
            :color="getScoreColor(accuracy)"
          >
            <span class="score-text">{{ accuracy }}分</span>
          </el-progress>
        </div>
        
        <div class="result-stats">
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-value">{{ totalQuestions }}</div>
                <div class="stat-label">总题数</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-item success">
                <div class="stat-value">{{ correctCount }}</div>
                <div class="stat-label">答对</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-item danger">
                <div class="stat-value">{{ wrongCount }}</div>
                <div class="stat-label">答错</div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
      
      <div class="result-actions">
        <el-button @click="resetPractice">继续刷题</el-button>
        <el-button type="primary" @click="viewAnalysis">查看解析</el-button>
      </div>
      
      <!-- 错题列表 -->
      <div v-if="wrongQuestions.length > 0" class="wrong-list">
        <h3>📌 错题列表</h3>
        <el-collapse>
          <el-collapse-item 
            v-for="(q, idx) in wrongQuestions" 
            :key="idx"
            :title="`第 ${q.index + 1} 题 - ${q.question.knowledgeName}`"
          >
            <div class="wrong-question-detail">
              <div class="question" v-html="q.question.content"></div>
              <div class="your-answer">
                你的答案：<span class="wrong">{{ q.userAnswer }}</span>
              </div>
              <div class="correct-answer">
                正确答案：<span class="correct">{{ q.question.answer }}</span>
              </div>
              <div class="analysis" v-if="q.question.analysis">
                <strong>解析：</strong>{{ q.question.analysis }}
              </div>
              <el-button 
                type="primary" 
                size="small" 
                @click="addToNotebook(q.question.id)"
              >
                加入错题本
              </el-button>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getSubjects, getKnowledgePoints, getPracticeQuestions, submitAnswer } from '@/api/modules/question'

// 模拟数据（后端接口未完成时使用）
const mockSubjects = [
  { id: 1, name: '高等数学' },
  { id: 2, name: '英语' },
  { id: 3, name: '政治' },
  { id: 4, name: '计算机专业基础' }
]

const mockKnowledgePoints = {
  1: [
    { id: 11, name: '极限与连续' },
    { id: 12, name: '导数与微分' },
    { id: 13, name: '积分' }
  ],
  2: [
    { id: 21, name: '阅读理解' },
    { id: 22, name: '词汇语法' },
    { id: 23, name: '翻译' }
  ],
  3: [
    { id: 31, name: '马原' },
    { id: 32, name: '毛中特' },
    { id: 33, name: '史纲' }
  ],
  4: [
    { id: 41, name: '数据结构' },
    { id: 42, name: '操作系统' },
    { id: 43, name: '计算机网络' }
  ]
}

const mockQuestions = [
  {
    id: 1,
    type: 1,
    difficulty: 1,
    knowledgeId: 11,
    knowledgeName: '极限与连续',
    content: '函数 f(x) = (x² - 1)/(x - 1) 在 x = 1 处的极限是多少？',
    options: { A: '0', B: '1', C: '2', D: '不存在' },
    answer: 'C'
  },
  {
    id: 2,
    type: 1,
    difficulty: 2,
    knowledgeId: 11,
    knowledgeName: '极限与连续',
    content: '极限 lim(x→0) sin(x)/x 的值是？',
    options: { A: '0', B: '1', C: '∞', D: '不存在' },
    answer: 'B'
  },
  {
    id: 3,
    type: 2,
    difficulty: 1,
    knowledgeId: 12,
    knowledgeName: '导数与微分',
    content: '下列哪些函数在 x=0 处可导？',
    options: { A: 'y = |x|', B: 'y = x²', C: 'y = x³', D: 'y = sin(x)' },
    answer: ['B', 'C', 'D']
  },
  {
    id: 4,
    type: 3,
    difficulty: 1,
    knowledgeId: 13,
    knowledgeName: '积分',
    content: '定积分 ∫(0→1) x dx 的值为 1/2。',
    answer: 'true'
  },
  {
    id: 5,
    type: 1,
    difficulty: 3,
    knowledgeId: 12,
    knowledgeName: '导数与微分',
    content: '函数 y = ln(x + √(1+x²)) 的导数是？',
    options: { A: '1/√(1+x²)', B: '1/(1+x²)', C: 'x/√(1+x²)', D: '√(1+x²)' },
    answer: 'A'
  }
]

// 状态
const isPracticing = ref(false)
const showResult = ref(false)
const loading = ref(false)

// 配置
const practiceConfig = reactive({
  subjectId: null,
  knowledgeId: [],
  questionCount: 10,
  difficulties: [1, 2, 3]
})

// 数据
const subjects = ref([])
const knowledgePoints = ref([])
const questions = ref([])
const answers = ref([])
const currentIndex = ref(0)
const results = ref([])

// 计算属性
const currentQuestion = computed(() => questions.value[currentIndex.value] || {})
const progressPercent = computed(() => ((currentIndex.value + 1) / questions.value.length) * 100)
const totalQuestions = computed(() => questions.value.length)
const correctCount = computed(() => results.value.filter(r => r.isCorrect).length)
const wrongCount = computed(() => results.value.filter(r => !r.isCorrect).length)
const accuracy = computed(() => {
  if (totalQuestions.value === 0) return 0
  return Math.round((correctCount.value / totalQuestions.value) * 100)
})

const wrongQuestions = computed(() => {
  return results.value
    .map((r, idx) => ({ ...r, index: idx }))
    .filter(r => !r.isCorrect)
})

// 方法
const loadSubjects = async () => {
  try {
    // const res = await getSubjects()
    // subjects.value = res.data
    subjects.value = mockSubjects
  } catch (error) {
    console.error('加载学科失败:', error)
  }
}

const handleSubjectChange = async (subjectId) => {
  if (!subjectId) {
    knowledgePoints.value = []
    return
  }
  
  try {
    // const res = await getKnowledgePoints(subjectId)
    // knowledgePoints.value = res.data
    knowledgePoints.value = mockKnowledgePoints[subjectId] || []
  } catch (error) {
    console.error('加载知识点失败:', error)
  }
}

const startPractice = async () => {
  if (!practiceConfig.subjectId) {
    ElMessage.warning('请选择学科')
    return
  }
  
  loading.value = true
  try {
    // const res = await getPracticeQuestions(practiceConfig)
    // questions.value = res.data
    
    // 使用模拟数据
    questions.value = mockQuestions.slice(0, practiceConfig.questionCount)
    answers.value = new Array(questions.value.length).fill('')
    results.value = []
    currentIndex.value = 0
    isPracticing.value = true
    showResult.value = false
  } catch (error) {
    console.error('获取题目失败:', error)
    ElMessage.error('获取题目失败')
  } finally {
    loading.value = false
  }
}

const prevQuestion = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

const nextQuestion = () => {
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++
  }
}

const submitPractice = async () => {
  // 检查是否全部作答
  const unanswered = answers.value.filter(a => !a || a === '').length
  if (unanswered > 0) {
    ElMessage.warning(`还有 ${unanswered} 道题未作答`)
    return
  }
  
  loading.value = true
  try {
    // 提交答案并获取结果
    const answerData = questions.value.map((q, idx) => ({
      questionId: q.id,
      answer: answers.value[idx]
    }))
    
    // const res = await submitAnswer(answerData)
    // results.value = res.data
    
    // 模拟结果
    results.value = questions.value.map((q, idx) => {
      const userAnswer = answers.value[idx]
      let isCorrect = false
      
      if (q.type === 2) {
        // 多选题比较
        const correct = q.answer.sort().join(',')
        const user = (Array.isArray(userAnswer) ? userAnswer : []).sort().join(',')
        isCorrect = correct === user
      } else {
        isCorrect = String(userAnswer).toLowerCase() === String(q.answer).toLowerCase()
      }
      
      return {
        questionId: q.id,
        userAnswer: Array.isArray(userAnswer) ? userAnswer.join(', ') : userAnswer,
        isCorrect
      }
    })
    
    isPracticing.value = false
    showResult.value = true
  } catch (error) {
    console.error('提交答案失败:', error)
    ElMessage.error('提交失败')
  } finally {
    loading.value = false
  }
}

const resetPractice = () => {
  isPracticing.value = false
  showResult.value = false
  questions.value = []
  answers.value = []
  results.value = []
  currentIndex.value = 0
}

const viewAnalysis = () => {
  // 保持结果页面，错题已经显示
}

const addToNotebook = (questionId) => {
  ElMessage.success('已加入错题本')
}

const getDifficultyType = (difficulty) => {
  const types = { 1: 'success', 2: 'warning', 3: 'danger' }
  return types[difficulty] || 'info'
}

const getDifficultyText = (difficulty) => {
  const texts = { 1: '简单', 2: '中等', 3: '困难' }
  return texts[difficulty] || '未知'
}

const getScoreColor = (score) => {
  if (score >= 80) return '#67C23A'
  if (score >= 60) return '#E6A23C'
  return '#F56C6C'
}

// 初始化
onMounted(() => {
  loadSubjects()
})
</script>

<style lang="scss" scoped>
.practice-container {
  max-width: 900px;
  margin: 0 auto;
  
  .select-panel {
    .panel-title {
      font-size: 18px;
      font-weight: 500;
    }
    
    .slider-value {
      margin-left: 15px;
      color: #409EFF;
    }
  }
  
  .practice-panel {
    .practice-header {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 20px;
      padding: 15px 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      
      .progress-info {
        font-size: 18px;
        
        .current {
          color: #409EFF;
          font-weight: bold;
          font-size: 24px;
        }
        
        .total {
          color: #999;
        }
      }
      
      .progress-bar {
        flex: 1;
      }
    }
    
    .question-card {
      margin-bottom: 20px;
      
      .question-header {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
      }
      
      .question-content {
        font-size: 16px;
        line-height: 1.8;
        margin-bottom: 30px;
        padding: 20px;
        background: #f5f7fa;
        border-radius: 8px;
      }
      
      .question-options {
        .option-group {
          display: flex;
          flex-direction: column;
          gap: 15px;
          
          .option-item {
            padding: 12px 16px;
            background: #fafafa;
            border-radius: 6px;
            transition: all 0.3s;
            
            &:hover {
              background: #ecf5ff;
            }
          }
        }
        
        .judge-group {
          display: flex;
          gap: 40px;
        }
      }
    }
    
    .practice-footer {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-bottom: 20px;
    }
    
    .answer-sheet {
      .sheet-grid {
        display: grid;
        grid-template-columns: repeat(10, 1fr);
        gap: 10px;
        
        .sheet-item {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #dcdfe6;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s;
          
          &.answered {
            background: #67C23A;
            color: white;
            border-color: #67C23A;
          }
          
          &.current {
            border-color: #409EFF;
            box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
          }
          
          &:hover {
            border-color: #409EFF;
          }
        }
      }
    }
  }
  
  .result-panel {
    .result-summary {
      display: flex;
      align-items: center;
      gap: 40px;
      padding: 20px;
      
      .score-circle {
        .score-text {
          font-size: 28px;
          font-weight: bold;
        }
      }
      
      .result-stats {
        flex: 1;
        
        .stat-item {
          text-align: center;
          
          .stat-value {
            font-size: 32px;
            font-weight: bold;
            color: #333;
          }
          
          .stat-label {
            color: #999;
            margin-top: 5px;
          }
          
          &.success .stat-value {
            color: #67C23A;
          }
          
          &.danger .stat-value {
            color: #F56C6C;
          }
        }
      }
    }
    
    .result-actions {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin: 30px 0;
    }
    
    .wrong-list {
      margin-top: 30px;
      
      h3 {
        margin-bottom: 15px;
        color: #333;
      }
      
      .wrong-question-detail {
        padding: 15px;
        
        .question {
          margin-bottom: 15px;
          padding: 10px;
          background: #f5f7fa;
          border-radius: 4px;
        }
        
        .your-answer {
          margin-bottom: 10px;
          
          .wrong {
            color: #F56C6C;
            font-weight: bold;
          }
        }
        
        .correct-answer {
          margin-bottom: 10px;
          
          .correct {
            color: #67C23A;
            font-weight: bold;
          }
        }
        
        .analysis {
          margin: 15px 0;
          padding: 10px;
          background: #ecf5ff;
          border-radius: 4px;
        }
      }
    }
  }
}
</style>