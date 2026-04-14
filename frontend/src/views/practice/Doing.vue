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
        <span class="question-id">题目 ID: {{ currentQuestion.id }}</span>
      </div>
      
      <!-- 题目内容 -->
      <div class="question-content">
        <h3>{{ currentIndex + 1 }}. {{ currentQuestion.content }}</h3>
      </div>
      
      <!-- 选项 -->
      <div class="question-options">
        <el-radio-group v-model="selectedAnswer" v-if="currentQuestion.type === 1">
          <el-radio 
            v-for="(option, key) in currentQuestion.options" 
            :key="key"
            :label="key"
            class="option-item"
          >
            <span class="option-label">{{ key }}.</span>
            <span class="option-text">{{ option }}</span>
          </el-radio>
        </el-radio-group>
        
        <el-checkbox-group 
          v-model="selectedAnswers" 
          v-else-if="currentQuestion.type === 2"
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
      </div>
      
      <!-- 答题结果展示 -->
      <div v-if="showResult" class="answer-result">
        <el-alert 
          :type="isCorrect ? 'success' : 'error'"
          :title="isCorrect ? '回答正确！' : '回答错误'"
          :closable="false"
        >
          <template v-if="!isCorrect">
            <p>正确答案：{{ currentQuestion.answer }}</p>
          </template>
          <p>解析：{{ currentQuestion.analysis }}</p>
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
    <el-card class="answer-sheet" style="margin-top: 20px">
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

// 模拟题目数据
const questions = ref([
  {
    id: 1,
    type: 1, // 1-单选 2-多选
    difficulty: 1,
    content: '函数 f(x) = x² 在 x=0 处的极限是多少？',
    options: {
      A: '0',
      B: '1',
      C: '不存在',
      D: '无穷大'
    },
    answer: 'A',
    analysis: '当 x 趋近于 0 时，x² 趋近于 0。',
    userAnswer: null,
    isCorrect: null
  },
  {
    id: 2,
    type: 1,
    difficulty: 2,
    content: '极限 lim(x→0) sinx/x 的值是？',
    options: {
      A: '0',
      B: '1',
      C: '-1',
      D: '不存在'
    },
    answer: 'B',
    analysis: '这是一个重要极限，lim(x→0) sinx/x = 1。',
    userAnswer: null,
    isCorrect: null
  },
  {
    id: 3,
    type: 2,
    difficulty: 2,
    content: '下列哪些是无穷小量？',
    options: {
      A: 'x (x→0)',
      B: 'sinx (x→0)',
      C: '1/x (x→∞)',
      D: 'e^x (x→-∞)'
    },
    answer: 'ABCD',
    analysis: '当 x→0 时，x 和 sinx 是无穷小；当 x→∞ 时，1/x 是无穷小；当 x→-∞ 时，e^x 是无穷小。',
    userAnswer: null,
    isCorrect: null
  }
])

const currentIndex = ref(0)
const selectedAnswer = ref('')
const selectedAnswers = ref([])
const showResult = ref(false)

// 当前题目
const currentQuestion = computed(() => questions.value[currentIndex.value])

// 进度百分比
const progressPercent = computed(() => {
  const answered = questions.value.filter(q => q.userAnswer !== null).length
  return Math.round((answered / questions.value.length) * 100)
})

// 进度条颜色
const progressColor = computed(() => {
  if (progressPercent.value < 30) return '#F56C6C'
  if (progressPercent.value < 70) return '#E6A23C'
  return '#67C23A'
})

// 题目类型标签
const questionTypeTag = computed(() => {
  return currentQuestion.value?.type === 1 ? 'primary' : 'success'
})

const questionTypeText = computed(() => {
  return currentQuestion.value?.type === 1 ? '单选题' : '多选题'
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
  if (currentQuestion.value?.type === 1) {
    return selectedAnswer.value !== ''
  } else {
    return selectedAnswers.value.length > 0
  }
})

// 是否正确
const isCorrect = computed(() => {
  return currentQuestion.value?.isCorrect
})

// 提交答案
const submitAnswer = () => {
  let userAnswer
  if (currentQuestion.value.type === 1) {
    userAnswer = selectedAnswer.value
  } else {
    userAnswer = selectedAnswers.value.sort().join('')
  }
  
  const correct = userAnswer === currentQuestion.value.answer
  currentQuestion.value.userAnswer = userAnswer
  currentQuestion.value.isCorrect = correct
  showResult.value = true
  
  // 保存到本地存储
  saveProgress()
}

// 下一题
const nextQuestion = () => {
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++
    selectedAnswer.value = ''
    selectedAnswers.value = []
    showResult.value = false
    
    // 如果已经答过，显示之前的结果
    if (currentQuestion.value.userAnswer) {
      showResult.value = true
      if (currentQuestion.value.type === 1) {
        selectedAnswer.value = currentQuestion.value.userAnswer
      } else {
        selectedAnswers.value = currentQuestion.value.userAnswer.split('')
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
  
  if (currentQuestion.value.userAnswer) {
    showResult.value = true
    if (currentQuestion.value.type === 1) {
      selectedAnswer.value = currentQuestion.value.userAnswer
    } else {
      selectedAnswers.value = currentQuestion.value.userAnswer.split('')
    }
  }
}

// 获取答题卡样式
const getSheetItemClass = (index) => {
  const q = questions.value[index]
  if (index === currentIndex.value) return 'current'
  if (q.userAnswer) {
    return q.isCorrect ? 'correct' : 'wrong'
  }
  return 'pending'
}

// 保存进度
const saveProgress = () => {
  const progress = {
    questions: questions.value,
    currentIndex: currentIndex.value,
    timestamp: Date.now()
  }
  localStorage.setItem('practiceProgress', JSON.stringify(progress))
}

// 完成刷题
const finishPractice = () => {
  const total = questions.value.length
  const correct = questions.value.filter(q => q.isCorrect).length
  const accuracy = Math.round((correct / total) * 100)
  
  ElMessageBox.confirm(
    `您已完成 ${total} 道题目，正确 ${correct} 道，正确率 ${accuracy}%。是否查看详细结果？`,
    '刷题完成',
    {
      confirmButtonText: '查看结果',
      cancelButtonText: '返回首页',
      type: 'success'
    }
  ).then(() => {
    router.push({
      path: '/practice/result',
      query: { total, correct, accuracy }
    })
  }).catch(() => {
    router.push('/dashboard')
  })
}

onMounted(() => {
  // 尝试恢复进度
  const saved = localStorage.getItem('practiceProgress')
  if (saved) {
    const progress = JSON.parse(saved)
    // 可以询问是否继续上次的练习
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