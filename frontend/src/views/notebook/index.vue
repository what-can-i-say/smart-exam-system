<template>
  <div class="notebook" @click="contextMenuVisible = false">
    <!-- 顶部统计 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <el-icon :size="32" color="#F56C6C"><Warning /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ notebookStore.stats.total }}</div>
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
              <div class="stat-value">{{ todayWrong }}</div>
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
              <div class="stat-value">{{ notebookStore.stats.mastered }}</div>
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
              <div class="stat-value">{{ notebookStore.stats.folders }}</div>
              <div class="stat-label">文件夹数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 主体区域 -->
    <el-row :gutter="20" class="main-row">
      <!-- 左侧文件夹树 -->
      <el-col :span="5">
        <el-card class="folder-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>📁 文件夹</span>
              <div class="folder-actions">
                <el-button type="primary" link @click.stop="showFolderDialog = true">
                  <el-icon><Plus /></el-icon>
                </el-button>
                <el-button 
                  v-if="currentFolder && currentFolder !== 1" 
                  type="danger" 
                  link 
                  @click.stop="deleteFolderConfirm"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </template>

          <el-tree
            :data="folderTree"
            :props="{ label: 'name', children: 'children' }"
            node-key="id"
            :default-expanded-keys="[1]"
            :current-node-key="currentFolder"
            highlight-current
            @node-click="handleFolderClick"
          >
            <template #default="{ data }">
              <div class="tree-node">
                <el-icon><Folder /></el-icon>
                <span class="node-label">{{ data.name }}</span>
                <span class="node-count">
                  ({{ getFolderQuestionCount(data.id) }})
                </span>
              </div>
            </template>
          </el-tree>
        </el-card>
      </el-col>

      <!-- 右侧错题列表 -->
      <el-col :span="19">
        <el-card class="questions-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>📝 错题列表（{{ filteredQuestions.length }} 道）</span>
              <div class="header-actions">
                <el-input
                  v-model="searchKeyword"
                  placeholder="搜索错题"
                  prefix-icon="Search"
                  clearable
                  style="width: 200px; margin-right: 10px"
                />
                <el-button 
                  type="warning" 
                  :disabled="selectedQuestions.length === 0"
                  @click="batchMove"
                >
                  批量移动
                </el-button>
                <el-button 
                  type="danger" 
                  :disabled="selectedQuestions.length === 0"
                  @click="batchDelete"
                >
                  批量删除
                </el-button>
              </div>
            </div>
          </template>

          <el-table
            :data="filteredQuestions"
            style="width: 100%"
            @selection-change="handleSelectionChange"
            @row-contextmenu="handleRowContextMenu"
          >
            <el-table-column type="selection" width="50" />
            <el-table-column prop="subjectName" label="学科" width="100" />
            <el-table-column prop="knowledgeName" label="知识点" width="120" />
            <el-table-column prop="content" label="题目" min-width="200">
              <template #default="{ row }">
                <div class="question-preview" @click="viewDetail(row)">
                  {{ truncateContent(row.content) }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="wrongCount" label="错误次数" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.wrongCount > 2 ? 'danger' : 'warning'">
                  {{ row.wrongCount }} 次
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="mastered" label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.mastered ? 'success' : 'info'">
                  {{ row.mastered ? '已掌握' : '未掌握' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="220" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="viewDetail(row)">详情</el-button>
                <el-button type="warning" link @click="openMoveDialog(row)">移动</el-button>
                <el-button 
                  :type="row.mastered ? 'warning' : 'success'" 
                  link 
                  @click="toggleMastered(row)"
                >
                  {{ row.mastered ? '取消' : '掌握' }}
                </el-button>
                <el-button type="danger" link @click="deleteQuestion(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 右键菜单 -->
    <div
      v-show="contextMenuVisible"
      class="context-menu"
      :style="{ left: contextMenuPosition.x + 'px', top: contextMenuPosition.y + 'px' }"
      @click.stop
    >
      <div class="menu-item" @click="handleContextMenuCommand('detail')">
        <el-icon><View /></el-icon>
        查看详情
      </div>
      <div class="menu-item" @click="handleContextMenuCommand('move')">
        <el-icon><Folder /></el-icon>
        移动到文件夹
      </div>
      <div class="menu-item" @click="handleContextMenuCommand('mastered')">
        <el-icon><CircleCheck /></el-icon>
        {{ contextMenuQuestion?.mastered ? '取消掌握' : '标记掌握' }}
      </div>
      <div class="menu-item danger" @click="handleContextMenuCommand('delete')">
        <el-icon><Delete /></el-icon>
        删除
      </div>
    </div>

    <!-- 错题详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      title="错题详情"
      width="700px"
      destroy-on-close
    >
      <div v-if="currentQuestion" class="question-detail">
        <div class="question-header">
          <el-tag :type="currentQuestion.type === 1 ? 'primary' : 'success'">
            {{ currentQuestion.type === 1 ? '单选题' : '多选题' }}
          </el-tag>
          <el-tag type="info" style="margin-left: 10px">
            当前文件夹：{{ getFolderName(currentQuestion.folderId) }}
          </el-tag>
          <span class="wrong-times">错误 {{ currentQuestion.wrongCount }} 次</span>
        </div>

        <h3>{{ currentQuestion.content }}</h3>

        <div class="options">
          <div
            v-for="(option, key) in currentQuestion.options"
            :key="key"
            class="option-item"
            :class="{
              'correct': key === currentQuestion.answer,
              'user-wrong': isUserWrong(currentQuestion, key)
            }"
          >
            <span class="option-label">{{ key }}.</span>
            <span class="option-text">{{ option }}</span>
          </div>
        </div>

        <div class="analysis">
          <h4>📖 题目解析</h4>
          <p>{{ currentQuestion.analysis }}</p>
        </div>

        <div class="notes-section">
          <h4>📝 复盘笔记</h4>
          <el-input
            v-model="currentQuestion.notes"
            type="textarea"
            :rows="4"
            placeholder="记录你的思考和总结..."
          />
        </div>

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
        <el-button type="primary" @click="saveDetail">保存笔记</el-button>
        <el-button type="success" @click="practiceAgain">练习同类题</el-button>
      </template>
    </el-dialog>

    <!-- 移动文件夹对话框 -->
    <el-dialog
      v-model="showMoveDialog"
      :title="isBatchMove ? `批量移动 (${selectedQuestions.length} 道错题)` : '移动到文件夹'"
      width="400px"
    >
      <el-form label-width="80px">
        <el-form-item label="目标文件夹">
          <el-tree-select
            v-model="targetFolderId"
            :data="folderTree"
            :props="{ label: 'name', value: 'id', children: 'children' }"
            placeholder="请选择文件夹"
            check-strictly
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showMoveDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmMove">确定</el-button>
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
      </el-form>
      <template #footer>
        <el-button @click="showFolderDialog = false">取消</el-button>
        <el-button type="primary" @click="createFolder">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotebookStore } from '@/store/modules/notebook'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'

const router = useRouter()
const notebookStore = useNotebookStore()

// 搜索和选择
const searchKeyword = ref('')
const selectedQuestions = ref([])
const currentFolder = ref(1)

// 对话框
const showDetailDialog = ref(false)
const showMoveDialog = ref(false)
const showFolderDialog = ref(false)
const currentQuestion = ref(null)

// 移动相关
const movingQuestion = ref(null)
const targetFolderId = ref(null)
const isBatchMove = ref(false)

// 新建文件夹
const newFolder = ref({ name: '' })

// 右键菜单
const contextMenuVisible = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })
const contextMenuQuestion = ref(null)

// 常用标签
const commonTags = ['易错', '重点', '难点', '公式', '概念', '计算', '记忆']

// 今日新增错题数
const todayWrong = computed(() => {
  const today = dayjs().format('YYYY-MM-DD')
  return notebookStore.questions.filter(q => {
    return q.lastWrongTime && q.lastWrongTime.startsWith(today)
  }).length
})

// 文件夹树
const folderTree = computed(() => notebookStore.folderTree)

// 过滤后的错题
const filteredQuestions = computed(() => {
  let questions = currentFolder.value
    ? notebookStore.questions.filter(q => q.folderId === currentFolder.value)
    : notebookStore.questions

  if (searchKeyword.value) {
    questions = questions.filter(q =>
      q.content?.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      q.knowledgeName?.includes(searchKeyword.value)
    )
  }

  return questions
})

// 获取文件夹下错题数量
const getFolderQuestionCount = (folderId) => {
  return notebookStore.questions.filter(q => q.folderId === folderId).length
}

// 获取文件夹名称
const getFolderName = (folderId) => {
  const folder = notebookStore.folders.find(f => f.id === folderId)
  return folder?.name || '默认文件夹'
}

// 判断用户答案是否正确
const isUserWrong = (question, key) => {
  if (!question.userAnswer) return false
  if (Array.isArray(question.userAnswer)) {
    return question.userAnswer.includes(key) && key !== question.answer
  }
  return question.userAnswer === key && key !== question.answer
}

// 截断内容
const truncateContent = (content, length = 30) => {
  if (!content) return ''
  return content.length > length ? content.slice(0, length) + '...' : content
}

// 点击文件夹
const handleFolderClick = (data) => {
  currentFolder.value = data.id
}

// 删除文件夹确认
const deleteFolderConfirm = async () => {
  if (currentFolder.value === 1) {
    ElMessage.warning('默认文件夹不能删除')
    return
  }
  
  const count = getFolderQuestionCount(currentFolder.value)
  await ElMessageBox.confirm(
    `确定删除文件夹？${count > 0 ? `其中的 ${count} 道错题将移至默认文件夹。` : ''}`,
    '警告',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  )
  
  notebookStore.deleteFolder(currentFolder.value)
  currentFolder.value = 1
  ElMessage.success('删除成功')
}

// 选择变化
const handleSelectionChange = (selection) => {
  selectedQuestions.value = selection
}

// 右键菜单
const handleRowContextMenu = (row, column, event) => {
  event.preventDefault()
  contextMenuQuestion.value = row
  contextMenuPosition.value = { x: event.clientX, y: event.clientY }
  contextMenuVisible.value = true
}

const handleContextMenuCommand = (command) => {
  switch (command) {
    case 'detail':
      viewDetail(contextMenuQuestion.value)
      break
    case 'move':
      openMoveDialog(contextMenuQuestion.value)
      break
    case 'mastered':
      toggleMastered(contextMenuQuestion.value)
      break
    case 'delete':
      deleteQuestion(contextMenuQuestion.value)
      break
  }
  contextMenuVisible.value = false
}

// 查看详情
const viewDetail = (row) => {
  currentQuestion.value = { 
    ...row,
    tags: row.tags || []
  }
  showDetailDialog.value = true
}

// 保存详情
const saveDetail = () => {
  if (currentQuestion.value) {
    notebookStore.saveNote(currentQuestion.value.id, currentQuestion.value.notes || '')
    const q = notebookStore.questions.find(q => q.id === currentQuestion.value.id)
    if (q) {
      q.tags = currentQuestion.value.tags || []
    }
    notebookStore.saveToStorage()
    ElMessage.success('保存成功')
    showDetailDialog.value = false
  }
}

// 切换掌握状态
const toggleMastered = (row) => {
  notebookStore.toggleMastered(row.id)
  ElMessage.success(row.mastered ? '已取消掌握' : '已标记为掌握')
}

// 删除错题
const deleteQuestion = async (row) => {
  await ElMessageBox.confirm('确定删除该错题？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  notebookStore.deleteQuestion(row.id)
  ElMessage.success('删除成功')
}

// 批量删除
const batchDelete = async () => {
  if (selectedQuestions.value.length === 0) return
  
  await ElMessageBox.confirm(`确定删除选中的 ${selectedQuestions.value.length} 道错题？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  
  const ids = selectedQuestions.value.map(q => q.id)
  notebookStore.deleteQuestions(ids)
  selectedQuestions.value = []
  ElMessage.success('删除成功')
}

// 打开移动对话框
const openMoveDialog = (row) => {
  movingQuestion.value = row
  targetFolderId.value = row.folderId
  isBatchMove.value = false
  showMoveDialog.value = true
}

// 批量移动
const batchMove = () => {
  if (selectedQuestions.value.length === 0) {
    ElMessage.warning('请先选择要移动的错题')
    return
  }
  movingQuestion.value = null
  targetFolderId.value = currentFolder.value
  isBatchMove.value = true
  showMoveDialog.value = true
}

// 确认移动
const confirmMove = () => {
  if (!targetFolderId.value) {
    ElMessage.warning('请选择目标文件夹')
    return
  }
  
  if (isBatchMove.value) {
    selectedQuestions.value.forEach(q => {
      notebookStore.moveQuestion(q.id, targetFolderId.value)
    })
    ElMessage.success(`已移动 ${selectedQuestions.value.length} 道错题`)
    selectedQuestions.value = []
  } else if (movingQuestion.value) {
    notebookStore.moveQuestion(movingQuestion.value.id, targetFolderId.value)
    ElMessage.success('移动成功')
  }
  
  showMoveDialog.value = false
  movingQuestion.value = null
  targetFolderId.value = null
  isBatchMove.value = false
}

// 创建文件夹
const createFolder = () => {
  if (!newFolder.value.name) {
    ElMessage.warning('请输入文件夹名称')
    return
  }
  notebookStore.createFolder(newFolder.value.name)
  showFolderDialog.value = false
  newFolder.value.name = ''
  ElMessage.success('文件夹创建成功')
}

// 练习同类题
const practiceAgain = () => {
  if (currentQuestion.value) {
    localStorage.setItem('currentPractice', JSON.stringify({
      knowledgeId: currentQuestion.value.knowledgeId,
      questionCount: 10,
      difficulty: 0
    }))
    showDetailDialog.value = false
    router.push('/practice/doing')
  }
}

// 点击其他地方关闭右键菜单
document.addEventListener('click', () => {
  contextMenuVisible.value = false
})

onMounted(() => {
  notebookStore.initData()
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
    }
  }

  .question-detail {
    .question-header {
      margin-bottom: 20px;

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
    }

    .notes-section {
      margin-bottom: 20px;

      h4 {
        margin-bottom: 10px;
      }
    }

    .tags-section {
      h4 {
        margin-bottom: 10px;
      }
    }
  }
}

// 右键菜单
.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 4px 0;
  z-index: 9999;
  min-width: 150px;

  .menu-item {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: #f5f7fa;
    }

    &.danger {
      color: #F56C6C;
    }

    .el-icon {
      margin-right: 8px;
    }
  }
}
</style>