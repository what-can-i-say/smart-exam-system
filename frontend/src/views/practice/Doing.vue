<template>
  <div class="practice-doing">
    <!-- 进度条 -->
    <el-card class="progress-card">
      <div class="progress-info">
        <div class="progress-text">
          <span>答题进度</span>
          <span>{{ currentIndex + 1 }} / {{ questions.length }}</span>
        </div>
        <el-progress 
          :percentage="progressPercent" 
          :color="progressColor"
          :stroke-width="10"
        />
      </div>
    </el-card>
    
    <!-- 题目卡片 -->
    <el-card class="question-card" v-if="currentQuestion">
      <!-- 题目类型和难度 -->
      <div class="question-header">
        <el-tag :type="questionTypeTag">{{ questionTypeText }}</el-tag>
        <el-tag :type="difficultyTag" style="margin-left: 10px">
          {{ difficultyText }}
        </el-tag>
        <span class="question-id">题目 {{ currentIndex + 1 }}</span>
      </div>
      
      <!-- 题目内容 -->
      <div class="question-content">
        <h3>{{ currentQuestion.content }}</h3>
      </div>
      
      <!-- 选项 -->
      <div class="question-options">
        <el-radio-group 
          v-model="selectedAnswer" 
          v-if="currentQuestion.type === 1"
          :disabled="showResult"
        >
          <el-radio 
            v-for="(option, key) in currentQuestion.options" 
            :key="key"
            :label="key"
            class="option-item"
            :class="{
              'correct-option': showResult && key === currentQuestion.answer,
              'wrong-option': showResult && selectedAnswer === key && key !== currentQuestion.answer
            }"
          >
            <span class="option-label">{{ key }}.</span>
            <span class="option-text">{{ option }}</span>
          </el-radio>
        </el-radio-group>
        
        <el-checkbox-group 
          v-model="selectedAnswers" 
          v-else-if="currentQuestion.type === 2"
          :disabled="showResult"
        >
          <el-checkbox 
            v-for="(option, key) in currentQuestion.options" 
            :key="key"
            :label="key"
            class="option-item"
          >
            <span class="option-label">{{ key }}.</span>
            <span class="option-text">{{ option }}</span>
          </el-checkbox>
        </el-checkbox-group>
        
        <el-radio-group 
          v-model="selectedAnswer" 
          v-else-if="currentQuestion.type === 3"
          :disabled="showResult"
        >
          <el-radio label="true" class="option-item">正确</el-radio>
          <el-radio label="false" class="option-item">错误</el-radio>
        </el-radio-group>
      </div>
      
      <!-- 答题结果展示 -->
      <div v-if="showResult" class="answer-result">
        <el-alert 
          :type="isCorrect ? 'success' : 'error'"
          :title="isCorrect ? '✓ 回答正确！' : '✗ 回答错误'"
          :closable="false"
        >
          <template v-if="!isCorrect">
            <p class="correct-answer-text">
              正确答案：{{ formatAnswer(currentQuestion.answer) }}
            </p>
          </template>
          <p class="analysis-text">
            <strong>解析：</strong>{{ currentQuestion.analysis }}
          </p>
        </el-alert>
      </div>
      
      <!-- 操作按钮 -->
      <div class="question-actions">
        <el-button 
          v-if="!showResult"
          type="primary" 
          size="large"
          @click="submitAnswer"
          :disabled="!canSubmit"
        >
          提交答案
        </el-button>
        
        <template v-else>
          <el-button 
            v-if="currentIndex < questions.length - 1"
            type="primary" 
            size="large"
            @click="nextQuestion"
          >
            下一题
          </el-button>
          
          <el-button 
            v-else
            type="success" 
            size="large"
            @click="finishPractice"
          >
            完成刷题
          </el-button>
        </template>
      </div>
    </el-card>
    
    <!-- 答题卡 -->
    <el-card class="answer-sheet">
      <template #header>
        <span>📋 答题卡</span>
      </template>
      
      <div class="sheet-grid">
        <div 
          v-for="(q, index) in questions" 
          :key="q.id"
          :class="['sheet-item', getSheetItemClass(index)]"
          @click="jumpToQuestion(index)"
        >
          {{ index + 1 }}
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPracticeQuestions, getKnowledgeName, getSubjectNameByKnowledge } from '../../data/questions'

const router = useRouter()

// 题目列表
const questions = ref([])
const currentIndex = ref(0)
const selectedAnswer = ref('')
const selectedAnswers = ref([])
const showResult = ref(false)

// 练习记录
const practiceRecord = ref({
  startTime: Date.now(),
  answers: [],
  correctCount: 0
})

// 计时器
const timer = ref(null)
const elapsedTime = ref(0)

// 当前题目
const currentQuestion = computed(() => questions.value[currentIndex.value])

// 进度百分比
const progressPercent = computed(() => {
  return Math.round(((currentIndex.value + 1) / questions.value.length) * 100)
})

// 进度条颜色
const progressColor = computed(() => {
  if (progressPercent.value < 30) return '#F56C6C'
  if (progressPercent.value < 70) return '#E6A23C'
  return '#67C23A'
})

// 题目类型
const questionTypeTag = computed(() => {
  const type = currentQuestion.value?.type
  if (type === 1) return 'primary'
  if (type === 2) return 'success'
  return 'warning'
})

const questionTypeText = computed(() => {
  const type = currentQuestion.value?.type
  if (type === 1) return '单选题'
  if (type === 2) return '多选题'
  return '判断题'
})

// 难度标签
const difficultyTag = computed(() => {
  const diff = currentQuestion.value?.difficulty
  if (diff === 1) return 'success'
  if (diff === 2) return 'warning'
  return 'danger'
})

const difficultyText = computed(() => {
  const diff = currentQuestion.value?.difficulty
  if (diff === 1) return '简单'
  if (diff === 2) return '中等'
  return '困难'
})

// 是否可以提交
const canSubmit = computed(() => {
  const q = currentQuestion.value
  if (!q) return false
  if (q.type === 1) return selectedAnswer.value !== ''
  if (q.type === 2) return selectedAnswers.value.length > 0
  return selectedAnswer.value !== ''
})

// 是否正确
const isCorrect = computed(() => {
  const q = currentQuestion.value
  if (!q || !q.userAnswer) return false
  return q.isCorrect
})

// 格式化答案
const formatAnswer = (answer) => {
  if (!answer) return ''
  if (answer === 'true') return '正确'
  if (answer === 'false') return '错误'
  return answer.split('').sort().join('')
}

// 获取答题卡样式
const getSheetItemClass = (index) => {
  const q = questions.value[index]
  if (index === currentIndex.value) return 'current'
  if (q.userAnswer !== undefined) {
    return q.isCorrect ? 'correct' : 'wrong'
  }
  return 'pending'
}

// 加载题目
const loadQuestions = () => {
  const config = JSON.parse(localStorage.getItem('currentPractice') || '{}')
  
  if (!config.knowledgeId) {
    ElMessage.error('请先选择练习内容')
    router.push('/practice/start')
    return
  }
  
  // 获取题目
  let qs = getPracticeQuestions(
    config.knowledgeId, 
    config.questionCount || 10,
    config.difficulty || 0
  )
  
  // 如果没有足够的题目，补充其他知识点的题目
  if (qs.length < config.questionCount) {
    qs = getPracticeQuestions(config.knowledgeId, 100, 0).slice(0, config.questionCount)
  }
  
  questions.value = qs.map(q => ({
    ...q,
    userAnswer: undefined,
    isCorrect: undefined
  }))
  
  // 如果还是没有题目，使用模拟数据
  if (questions.value.length === 0) {
    questions.value = generateMockQuestions(config.questionCount)
  }
  
   // 重置答题记录
  practiceRecord.value = {
    startTime: Date.now(),
    answers: [],
    correctCount: 0
  }
}

// 生成模拟题目
const generateMockQuestions = (count) => {
  const mockQuestions = []
  for (let i = 0; i < count; i++) {
    mockQuestions.push({
      id: 1000 + i,
      knowledgeId: 10102,
      type: 1,
      difficulty: Math.floor(Math.random() * 3) + 1,
      content: `模拟题目 ${i + 1}：这是第 ${i + 1} 道测试题目`,
      options: {
        A: `选项 A - 第${i + 1}题`,
        B: `选项 B - 第${i + 1}题`,
        C: `选项 C - 第${i + 1}题`,
        D: `选项 D - 第${i + 1}题`
      },
      answer: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
      analysis: '这是模拟题目的解析。',
      userAnswer: undefined,
      isCorrect: undefined
    })
  }
  return mockQuestions
}

// 提交答案
const submitAnswer = () => {
  const q = currentQuestion.value
  let userAnswer
  
  if (q.type === 1) {
    userAnswer = selectedAnswer.value
  } else if (q.type === 2) {
    userAnswer = selectedAnswers.value.sort().join('')
  } else {
    userAnswer = selectedAnswer.value
  }
  
  const isCorrect = userAnswer === q.answer
  
  // 如果这道题之前没答过，才记录
  if (q.userAnswer === undefined) {
    q.userAnswer = userAnswer
    q.isCorrect = isCorrect
    
    practiceRecord.value.answers.push({
      questionId: q.id,
      userAnswer,
      isCorrect,
      time: elapsedTime.value
    })
    
    if (isCorrect) {
      practiceRecord.value.correctCount++
    }
  } else {
    // 更新答案（如果修改）
    const oldIsCorrect = q.isCorrect
    q.userAnswer = userAnswer
    q.isCorrect = isCorrect
    
    // 更新统计
    if (oldIsCorrect && !isCorrect) {
      practiceRecord.value.correctCount--
    } else if (!oldIsCorrect && isCorrect) {
      practiceRecord.value.correctCount++
    }
  }
  
  showResult.value = true
  saveProgress()
}
// 下一题
const nextQuestion = () => {
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++
    selectedAnswer.value = ''
    selectedAnswers.value = []
    showResult.value = false
    
    // 如果已经答过，恢复之前的状态
    const q = currentQuestion.value
    if (q.userAnswer !== undefined) {
      showResult.value = true
      if (q.type === 1) {
        selectedAnswer.value = q.userAnswer
      } else if (q.type === 2) {
        selectedAnswers.value = q.userAnswer.split('')
      } else {
        selectedAnswer.value = q.userAnswer
      }
    }
  }
}

// 跳转到指定题目
const jumpToQuestion = (index) => {
  currentIndex.value = index
  selectedAnswer.value = ''
  selectedAnswers.value = []
  showResult.value = false
  
  const q = currentQuestion.value
  if (q.userAnswer !== undefined) {
    showResult.value = true
    if (q.type === 1) {
      selectedAnswer.value = q.userAnswer
    } else if (q.type === 2) {
      selectedAnswers.value = q.userAnswer.split('')
    } else {
      selectedAnswer.value = q.userAnswer
    }
  }
}

// 保存进度
const saveProgress = () => {
  const progress = {
    questions: questions.value,
    currentIndex: currentIndex.value,
    record: practiceRecord.value,
    elapsedTime: elapsedTime.value,
    timestamp: Date.now()
  }
  localStorage.setItem('practiceProgress', JSON.stringify(progress))
}

// 完成刷题
  const finishPractice = () => {
  const total = questions.value.length
  const correct = practiceRecord.value.correctCount
  const accuracy = Math.round((correct / total) * 100)
  
  // 保存历史记录
  saveHistory(accuracy, correct, total)
  
  // 更新复习记录
  updateReviewRecords()
  
  // 准备传递给结果页的数据
  const resultData = {
    questions: questions.value,
    record: practiceRecord.value,
    accuracy,
    correct,
    total,
    elapsedTime: elapsedTime.value
  }
  
  // 保存到 localStorage，确保结果页能获取
  localStorage.setItem('practiceResult', JSON.stringify(resultData))
  
  // 清除进度
  localStorage.removeItem('practiceProgress')
  localStorage.removeItem('currentPractice')
  
  // 跳转到结果页
  router.push('/practice/result')
}


// 保存历史记录
const saveHistory = (accuracy, correct, total) => {
  const config = JSON.parse(localStorage.getItem('currentPractice') || '{}')
  const history = JSON.parse(localStorage.getItem('practiceHistory') || '[]')
  
  history.unshift({
    subjectName: getSubjectNameByKnowledge(config.knowledgeId),
    knowledgeName: getKnowledgeName(config.knowledgeId),
    knowledgeId: config.knowledgeId,
    questionCount: total,
    correctCount: correct,
    accuracy,
    date: new Date().toLocaleString('zh-CN')
  })
  
  // 只保留最近10条
  localStorage.setItem('practiceHistory', JSON.stringify(history.slice(0, 10)))
}

// 更新复习记录（用于艾宾浩斯）
const updateReviewRecords = () => {
  const config = JSON.parse(localStorage.getItem('currentPractice') || '{}')
  const records = JSON.parse(localStorage.getItem('reviewRecords') || '[]')
  
  // 为每个答错的题目创建复习记录
  questions.value.forEach(q => {
    if (!q.isCorrect) {
      records.push({
        questionId: q.id,
        knowledgeId: q.knowledgeId,
        reviewStage: 1,
        memoryLevel: 30,
        correctCount: 0,
        totalReviewCount: 1,
        lastReviewTime: new Date().toISOString(),
        nextReviewTime: getNextReviewTime(1),
        status: 0 // 待复习
      })
    }
  })
  
  localStorage.setItem('reviewRecords', JSON.stringify(records))
}

// 计算下次复习时间（艾宾浩斯）
const getNextReviewTime = (stage) => {
  const intervals = [5, 30, 720, 1440, 2880, 5760, 10080] // 分钟
  const minutes = intervals[Math.min(stage - 1, intervals.length - 1)]
  return new Date(Date.now() + minutes * 60 * 1000).toISOString()
}

// 计时
const startTimer = () => {
  timer.value = setInterval(() => {
    elapsedTime.value++
  }, 1000)
}

// 尝试恢复进度
const tryRestoreProgress = async () => {
  const saved = localStorage.getItem('practiceProgress')
  if (!saved) return false
  
  try {
    const progress = JSON.parse(saved)
    // 只恢复2小时内的进度
    if (Date.now() - progress.timestamp < 2 * 60 * 60 * 1000) {
      const result = await ElMessageBox.confirm(
        '检测到未完成的练习，是否继续？',
        '提示',
        {
          confirmButtonText: '继续练习',
          cancelButtonText: '重新开始',
          type: 'info'
        }
      ).catch(() => false)
      
      if (result) {
        questions.value = progress.questions
        currentIndex.value = progress.currentIndex
        practiceRecord.value = progress.record
        elapsedTime.value = progress.elapsedTime || 0
        return true
      }
    }
  } catch (e) {
    console.error('恢复进度失败:', e)
  }
  
  localStorage.removeItem('practiceProgress')
  return false
}

onMounted(async () => {
  const restored = await tryRestoreProgress()
  if (!restored) {
    loadQuestions()
  }
  startTimer()
})

onBeforeUnmount(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
  // 如果没有完成，保存进度
  if (questions.value.length > 0 && !showResult.value) {
    saveProgress()
  }
})
</script>

<style lang="scss" scoped>
.practice-doing {
  max-width: 800px;
  margin: 0 auto;
  
  .progress-card {
    margin-bottom: 20px;
    
    .progress-info {
      .progress-text {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
      }
    }
  }
  
  .question-card {
    margin-bottom: 20px;
    
    .question-header {
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #eee;
      
      .question-id {
        float: right;
        color: #999;
        font-size: 14px;
      }
    }
    
    .question-content {
      margin-bottom: 30px;
      
      h3 {
        font-size: 18px;
        line-height: 1.6;
        color: #333;
      }
    }
    
    .question-options {
      margin-bottom: 30px;
      
      .option-item {
        display: block;
        margin-bottom: 15px;
        padding: 12px 16px;
        background: #f5f7fa;
        border-radius: 8px;
        transition: all 0.3s;
        
        &:hover {
          background: #e8eaed;
        }
        
        &.correct-option {
          background: #f0f9eb;
          border: 1px solid #67C23A;
        }
        
        &.wrong-option {
          background: #fef0f0;
          border: 1px solid #F56C6C;
        }
        
        .option-label {
          font-weight: bold;
          margin-right: 12px;
          color: #409EFF;
        }
        
        .option-text {
          color: #333;
        }
      }
      
      :deep(.el-radio) {
        display: block;
        margin-bottom: 10px;
      }
      
      :deep(.el-checkbox) {
        display: block;
        margin-bottom: 10px;
      }
    }
    
    .answer-result {
      margin: 20px 0;
      
      .correct-answer-text {
        margin: 10px 0 5px;
        font-weight: bold;
        color: #67C23A;
      }
      
      .analysis-text {
        margin-top: 10px;
        line-height: 1.6;
      }
    }
    
    .question-actions {
      text-align: center;
      margin-top: 30px;
      
      .el-button {
        min-width: 150px;
      }
    }
  }
  
  .answer-sheet {
    .sheet-grid {
      display: grid;
      grid-template-columns: repeat(10, 1fr);
      gap: 10px;
      
      .sheet-item {
        aspect-ratio: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s;
        
        &.current {
          background: #409EFF;
          color: white;
        }
        
        &.correct {
          background: #67C23A;
          color: white;
        }
        
        &.wrong {
          background: #F56C6C;
          color: white;
        }
        
        &.pending {
          background: #f0f2f5;
          color: #666;
          
          &:hover {
            background: #e6e8eb;
          }
        }
      }
    }
  }
}
</style>