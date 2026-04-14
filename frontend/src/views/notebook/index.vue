<template>
  <div class="notebook">
    <!-- 顶部统计 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <el-icon :size="32" color="#F56C6C"><Warning /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalWrong }}</div>
              <div class="stat-label">错题总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <el-icon :size="32" color="#E6A23C"><Clock /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.todayWrong }}</div>
              <div class="stat-label">今日新增</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <el-icon :size="32" color="#67C23A"><CircleCheck /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.mastered }}</div>
              <div class="stat-label">已掌握</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <el-icon :size="32" color="#409EFF"><Folder /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.folders }}</div>
              <div class="stat-label">文件夹数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 主体区域：文件夹树 + 错题列表 -->
    <el-row :gutter="20" class="main-row">
      <!-- 左侧文件夹树 -->
      <el-col :span="6">
        <el-card class="folder-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>📁 文件夹</span>
              <el-button type="primary" link @click="showFolderDialog = true">
                <el-icon><Plus /></el-icon>
                新建
              </el-button>
            </div>
          </template>

          <el-tree
            :data="folderTree"
            :props="treeProps"
            node-key="id"
            :default-expanded-keys="expandedKeys"
            :current-node-key="currentFolder"
            highlight-current
            @node-click="handleFolderClick"
          >
            <template #default="{ node, data }">
              <div class="tree-node">
                <el-icon><Folder /></el-icon>
                <span class="node-label">{{ node.label }}</span>
                <span class="node-count">({{ data.count || 0 }})</span>
              </div>
            </template>
          </el-tree>
        </el-card>
      </el-col>

      <!-- 右侧错题列表 -->
      <el-col :span="18">
        <el-card class="questions-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>📝 错题列表</span>
              <div class="header-actions">
                <el-input
                  v-model="searchKeyword"
                  placeholder="搜索错题"
                  prefix-icon="Search"
                  clearable
                  style="width: 200px; margin-right: 10px"
                />
                <el-button type="primary" @click="exportWrongQuestions">
                  导出错题
                </el-button>
              </div>
            </div>
          </template>

          <!-- 错题列表 -->
          <el-table
            :data="filteredQuestions"
            style="width: 100%"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="50" />
            <el-table-column prop="subjectName" label="学科" width="100" />
            <el-table-column prop="knowledgeName" label="知识点" width="150" />
            <el-table-column prop="content" label="题目" min-width="200">
              <template #default="{ row }">
                <div class="question-preview">{{ truncateContent(row.content) }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="wrongCount" label="错误次数" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.wrongCount > 2 ? 'danger' : 'warning'">
                  {{ row.wrongCount }} 次
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="lastWrongTime" label="最后错误" width="160">
              <template #default="{ row }">
                {{ formatDate(row.lastWrongTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="mastered" label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.mastered ? 'success' : 'info'">
                  {{ row.mastered ? '已掌握' : '未掌握' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="viewDetail(row)">详情</el-button>
                <el-button type="success" link @click="markMastered(row)">
                  掌握
                </el-button>
                <el-button type="danger" link @click="deleteQuestion(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :total="total"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next"
              @size-change="handleSizeChange"
              @current-change="handlePageChange"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 错题详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      title="错题详情"
      width="700px"
      destroy-on-close
    >
      <div v-if="currentQuestion" class="question-detail">
        <!-- 题目信息 -->
        <div class="question-header">
          <el-tag :type="getTypeTag(currentQuestion.type)">
            {{ getTypeText(currentQuestion.type) }}
          </el-tag>
          <el-tag :type="getDifficultyTag(currentQuestion.difficulty)" style="margin-left: 10px">
            {{ getDifficultyText(currentQuestion.difficulty) }}
          </el-tag>
          <span class="wrong-times">错误 {{ currentQuestion.wrongCount }} 次</span>
        </div>

        <h3>{{ currentQuestion.content }}</h3>

        <!-- 选项 -->
        <div class="options">
          <div
            v-for="(option, key) in currentQuestion.options"
            :key="key"
            class="option-item"
            :class="{
              'correct': key === currentQuestion.answer,
              'user-wrong': key === currentQuestion.userAnswer && key !== currentQuestion.answer
            }"
          >
            <span class="option-label">{{ key }}.</span>
            <span class="option-text">{{ option }}</span>
            <el-icon v-if="key === currentQuestion.answer" class="check-icon"><CircleCheck /></el-icon>
            <el-icon v-if="key === currentQuestion.userAnswer && key !== currentQuestion.answer" class="wrong-icon"><CircleClose /></el-icon>
          </div>
        </div>

        <!-- 解析 -->
        <div class="analysis">
          <h4>📖 题目解析</h4>
          <p>{{ currentQuestion.analysis }}</p>
        </div>

        <!-- 富文本笔记 -->
        <div class="notes-section">
          <h4>📝 复盘笔记</h4>
          <el-input
            v-model="currentQuestion.notes"
            type="textarea"
            :rows="4"
            placeholder="记录你的思考和总结..."
          />
          <div class="note-actions">
            <el-button @click="saveNotes">保存笔记</el-button>
          </div>
        </div>

        <!-- 标签 -->
        <div class="tags-section">
          <h4>🏷️ 标签</h4>
          <el-select
            v-model="currentQuestion.tags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="添加标签"
            style="width: 100%"
          >
            <el-option
              v-for="tag in commonTags"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
        </div>
      </div>

      <template #footer>
        <el-button @click="showDetailDialog = false">关闭</el-button>
        <el-button type="primary" @click="practiceAgain(currentQuestion)">
          练习同类题
        </el-button>
      </template>
    </el-dialog>

    <!-- 新建文件夹对话框 -->
    <el-dialog
      v-model="showFolderDialog"
      title="新建文件夹"
      width="400px"
    >
      <el-form :model="newFolder" label-width="80px">
        <el-form-item label="文件夹名">
          <el-input v-model="newFolder.name" placeholder="请输入文件夹名称" />
        </el-form-item>
        <el-form-item label="父文件夹">
          <el-tree-select
            v-model="newFolder.parentId"
            :data="folderTree"
            :props="{ label: 'name', value: 'id', children: 'children' }"
            placeholder="请选择（可选）"
            clearable
            check-strictly
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showFolderDialog = false">取消</el-button>
        <el-button type="primary" @click="createFolder">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'

const router = useRouter()

// 统计数据
const stats = reactive({
  totalWrong: 45,
  todayWrong: 3,
  mastered: 18,
  folders: 5
})

// 文件夹树
const folderTree = ref([
  {
    id: 1,
    name: '默认文件夹',
    count: 15,
    children: []
  },
  {
    id: 2,
    name: '高等数学',
    count: 20,
    children: [
      {
        id: 5,
        name: '极限与连续',
        count: 8,
        children: []
      },
      {
        id: 6,
        name: '导数与微分',
        count: 12,
        children: []
      }
    ]
  },
  {
    id: 3,
    name: '英语',
    count: 8,
    children: []
  },
  {
    id: 4,
    name: '政治',
    count: 2,
    children: []
  }
])

const treeProps = {
  children: 'children',
  label: 'name'
}

const expandedKeys = ref([1, 2])
const currentFolder = ref(1)

// 错题列表
const questions = ref([
  {
    id: 1,
    subjectName: '高等数学',
    knowledgeName: '极限与连续',
    type: 1,
    difficulty: 2,
    content: '函数 f(x) = (x²-1)/(x-1) 在 x→1 时的极限是？',
    options: {
      A: '0',
      B: '1',
      C: '2',
      D: '不存在'
    },
    answer: 'C',
    userAnswer: 'B',
    analysis: '当 x≠1 时，f(x) = x+1，所以 x→1 时极限为 2。',
    wrongCount: 3,
    lastWrongTime: '2026-04-14 10:30',
    mastered: false,
    notes: '',
    tags: ['重要极限', '易错']
  },
  {
    id: 2,
    subjectName: '高等数学',
    knowledgeName: '导数与微分',
    type: 1,
    difficulty: 2,
    content: '函数 y = ln(x) 的导数是？',
    options: {
      A: '1/x',
      B: 'x',
      C: 'e^x',
      D: 'ln(x)'
    },
    answer: 'A',
    userAnswer: 'C',
    analysis: '(ln x)\' = 1/x',
    wrongCount: 1,
    lastWrongTime: '2026-04-13 15:20',
    mastered: false,
    notes: '',
    tags: ['导数公式']
  },
  {
    id: 3,
    subjectName: '英语',
    knowledgeName: '考研词汇',
    type: 1,
    difficulty: 1,
    content: 'The word "abandon" means:',
    options: {
      A: '接受',
      B: '放弃',
      C: '获得',
      D: '开始'
    },
    answer: 'B',
    userAnswer: 'A',
    analysis: 'abandon 意为"放弃、遗弃"。',
    wrongCount: 2,
    lastWrongTime: '2026-04-14 09:00',
    mastered: false,
    notes: '',
    tags: ['词汇']
  }
])

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(45)

// 搜索
const searchKeyword = ref('')
const selectedQuestions = ref([])

// 对话框
const showDetailDialog = ref(false)
const showFolderDialog = ref(false)
const currentQuestion = ref(null)

// 新建文件夹
const newFolder = reactive({
  name: '',
  parentId: null
})

// 常用标签
const commonTags = ref(['易错', '重点', '难点', '公式', '概念', '计算'])

// 计算属性：过滤后的错题
const filteredQuestions = computed(() => {
  let filtered = questions.value
  if (searchKeyword.value) {
    filtered = filtered.filter(q =>
      q.content.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      q.knowledgeName.includes(searchKeyword.value)
    )
  }
  return filtered
})

// 截断题目内容
const truncateContent = (content) => {
  return content.length > 30 ? content.slice(0, 30) + '...' : content
}

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('MM-DD HH:mm')
}

// 获取类型标签
const getTypeTag = (type) => {
  return type === 1 ? 'primary' : 'success'
}

const getTypeText = (type) => {
  return type === 1 ? '单选题' : '多选题'
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

// 点击文件夹
const handleFolderClick = (data) => {
  currentFolder.value = data.id
  // 加载该文件夹下的错题
  ElMessage.info(`切换到文件夹：${data.name}`)
}

// 选择变化
const handleSelectionChange = (selection) => {
  selectedQuestions.value = selection
}

// 分页变化
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}

const handlePageChange = (val) => {
  currentPage.value = val
}

// 查看详情
const viewDetail = (row) => {
  currentQuestion.value = { ...row }
  showDetailDialog.value = true
}

// 标记掌握
const markMastered = async (row) => {
  await ElMessageBox.confirm('确定已掌握该题目？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'success'
  })
  row.mastered = true
  stats.mastered++
  ElMessage.success('已标记为掌握')
}

// 删除错题
const deleteQuestion = async (row) => {
  await ElMessageBox.confirm('确定删除该错题？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  const index = questions.value.findIndex(q => q.id === row.id)
  if (index > -1) {
    questions.value.splice(index, 1)
    stats.totalWrong--
  }
  ElMessage.success('删除成功')
}

// 保存笔记
const saveNotes = () => {
  ElMessage.success('笔记已保存')
}

// 练习同类题
const practiceAgain = (question) => {
  showDetailDialog.value = false
  router.push({
    path: '/practice/start',
    query: { knowledgeId: question.knowledgeId }
  })
}

// 创建文件夹
const createFolder = () => {
  if (!newFolder.name) {
    ElMessage.warning('请输入文件夹名称')
    return
  }
  // 添加到树
  const newId = Date.now()
  folderTree.value.push({
    id: newId,
    name: newFolder.name,
    count: 0,
    children: []
  })
  stats.folders++
  showFolderDialog.value = false
  newFolder.name = ''
  newFolder.parentId = null
  ElMessage.success('文件夹创建成功')
}

// 导出错题
const exportWrongQuestions = () => {
  ElMessage.info('导出功能开发中...')
}

onMounted(() => {
  // 加载错题数据
})
</script>

<style lang="scss" scoped>
.notebook {
  .stats-row {
    margin-bottom: 20px;

    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;

        .stat-info {
          margin-left: 12px;

          .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #333;
          }

          .stat-label {
            font-size: 13px;
            color: #999;
          }
        }
      }
    }
  }

  .main-row {
    .folder-card {
      height: 600px;
      overflow-y: auto;

      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .tree-node {
        display: flex;
        align-items: center;
        flex: 1;

        .el-icon {
          margin-right: 6px;
          color: #E6A23C;
        }

        .node-label {
          flex: 1;
        }

        .node-count {
          color: #999;
          font-size: 12px;
        }
      }
    }

    .questions-card {
      height: 600px;
      display: flex;
      flex-direction: column;

      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .header-actions {
          display: flex;
          align-items: center;
        }
      }

      .question-preview {
        cursor: pointer;

        &:hover {
          color: #409EFF;
        }
      }

      .pagination {
        margin-top: 20px;
        display: flex;
        justify-content: flex-end;
      }
    }
  }

  .question-detail {
    .question-header {
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #eee;

      .wrong-times {
        float: right;
        color: #F56C6C;
      }
    }

    h3 {
      margin-bottom: 20px;
      line-height: 1.6;
    }

    .options {
      margin-bottom: 20px;

      .option-item {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        margin-bottom: 10px;
        background: #f5f7fa;
        border-radius: 8px;

        &.correct {
          background: #f0f9eb;
          border: 1px solid #67C23A;
        }

        &.user-wrong {
          background: #fef0f0;
          border: 1px solid #F56C6C;
        }

        .option-label {
          font-weight: bold;
          margin-right: 12px;
          min-width: 24px;
        }

        .option-text {
          flex: 1;
        }

        .check-icon {
          color: #67C23A;
        }

        .wrong-icon {
          color: #F56C6C;
        }
      }
    }

    .analysis {
      margin-bottom: 20px;
      padding: 16px;
      background: #f5f7fa;
      border-radius: 8px;

      h4 {
        margin-bottom: 10px;
      }

      p {
        color: #666;
        line-height: 1.6;
      }
    }

    .notes-section {
      margin-bottom: 20px;

      h4 {
        margin-bottom: 10px;
      }

      .note-actions {
        margin-top: 10px;
        text-align: right;
      }
    }

    .tags-section {
      h4 {
        margin-bottom: 10px;
      }
    }
  }
}

// 响应式
@media (max-width: 992px) {
  .main-row {
    .el-col-6 {
      width: 100%;
      margin-bottom: 20px;
    }

    .el-col-18 {
      width: 100%;
    }
  }
}
</style>