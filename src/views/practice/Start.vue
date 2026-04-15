<template>
  <div class="practice-start">
    <el-card class="setup-card">
      <template #header>
        <div class="card-header">
          <span>📝 开始刷题</span>
        </div>
      </template>
      
      <el-form :model="practiceForm" label-width="100px">
        <!-- 选择学科 -->
        <el-form-item label="选择学科">
          <el-select 
            v-model="practiceForm.subjectId" 
            placeholder="请选择学科"
            @change="handleSubjectChange"
            style="width: 100%"
          >
            <el-option
              v-for="item in subjects"
              :key="item.id"
              :label="`${item.icon} ${item.name}`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        
        <!-- 选择章节 -->
        <el-form-item label="选择章节">
          <el-select 
            v-model="practiceForm.chapterId" 
            placeholder="请选择章节"
            @change="handleChapterChange"
            style="width: 100%"
            :disabled="!practiceForm.subjectId"
          >
            <el-option
              v-for="item in currentChapters"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        
        <!-- 选择知识点 -->
        <el-form-item label="选择知识点">
          <el-select 
            v-model="practiceForm.knowledgeId" 
            placeholder="请选择知识点"
            style="width: 100%"
            :disabled="!practiceForm.chapterId"
          >
            <el-option
              v-for="item in currentKnowledgePoints"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        
        <!-- 题目数量 -->
        <el-form-item label="题目数量">
          <el-slider 
            v-model="practiceForm.questionCount" 
            :min="5" 
            :max="30" 
            :step="5"
            show-stops
          />
          <span style="margin-left: 16px">{{ practiceForm.questionCount }} 题</span>
        </el-form-item>
        
        <!-- 难度选择 -->
        <el-form-item label="题目难度">
          <el-radio-group v-model="practiceForm.difficulty">
            <el-radio-button :value="0">全部</el-radio-button>
            <el-radio-button :value="1">简单</el-radio-button>
            <el-radio-button :value="2">中等</el-radio-button>
            <el-radio-button :value="3">困难</el-radio-button>
          </el-radio-group>
        </el-form-item>
        
        <!-- 开始按钮 -->
        <el-form-item>
          <el-button 
            type="primary" 
            size="large" 
            @click="startPractice"
            :disabled="!practiceForm.knowledgeId"
            style="width: 200px"
          >
            开始刷题
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 最近练习记录 -->
    <el-card class="history-card">
      <template #header>
        <span>📋 最近练习</span>
      </template>
      
      <el-table :data="recentPractices" style="width: 100%">
        <el-table-column prop="subjectName" label="学科" width="120" />
        <el-table-column prop="knowledgeName" label="知识点" />
        <el-table-column prop="questionCount" label="题目数" width="100" />
        <el-table-column prop="correctCount" label="正确" width="80" />
        <el-table-column prop="accuracy" label="正确率" width="100">
          <template #default="{ row }">
            <span :style="{ color: row.accuracy >= 60 ? '#67C23A' : '#F56C6C' }">
              {{ row.accuracy }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="date" label="时间" width="160" />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button type="primary" link @click="continuePractice(row)">
              继续练习
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { subjects, chapters, knowledgePoints } from '../../data/subjects'
import { ElMessage } from 'element-plus'

const router = useRouter()

const practiceForm = reactive({
  subjectId: null,
  chapterId: null,
  knowledgeId: null,
  questionCount: 10,
  difficulty: 0
})

// 当前章节列表
const currentChapters = computed(() => {
  if (!practiceForm.subjectId) return []
  return chapters[practiceForm.subjectId] || []
})

// 当前知识点列表
const currentKnowledgePoints = computed(() => {
  if (!practiceForm.chapterId) return []
  return knowledgePoints[practiceForm.chapterId] || []
})

// 最近练习记录
const recentPractices = ref([])

// 学科变更
const handleSubjectChange = () => {
  practiceForm.chapterId = null
  practiceForm.knowledgeId = null
}

// 章节变更
const handleChapterChange = () => {
  practiceForm.knowledgeId = null
}

// 开始刷题
const startPractice = () => {
  // 保存练习配置
  const practiceConfig = {
    ...practiceForm,
    timestamp: Date.now()
  }
  localStorage.setItem('currentPractice', JSON.stringify(practiceConfig))
  router.push('/practice/doing')
}

// 继续练习
const continuePractice = (row) => {
  practiceForm.subjectId = subjects.find(s => s.name === row.subjectName)?.id
  practiceForm.knowledgeId = row.knowledgeId
  startPractice()
}

// 加载历史记录
const loadRecentPractices = () => {
  const saved = localStorage.getItem('practiceHistory')
  if (saved) {
    recentPractices.value = JSON.parse(saved).slice(0, 5)
  } else {
    // 模拟数据
    recentPractices.value = [
      {
        subjectName: '高等数学',
        knowledgeName: '极限的定义',
        knowledgeId: 10102,
        questionCount: 10,
        correctCount: 7,
        accuracy: 70,
        date: '2026-04-14 15:30'
      },
      {
        subjectName: '英语',
        knowledgeName: '高频词汇 A-D',
        knowledgeId: 20101,
        questionCount: 20,
        correctCount: 16,
        accuracy: 80,
        date: '2026-04-13 09:15'
      }
    ]
  }
}

onMounted(() => {
  loadRecentPractices()
})
</script>

<style lang="scss" scoped>
.practice-start {
  .setup-card {
    max-width: 600px;
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      align-items: center;
    }
  }
}
</style>