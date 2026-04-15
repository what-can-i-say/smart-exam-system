// 靶向分析数据计算工具
import { questionBank, getKnowledgeName, getSubjectNameByKnowledge } from '@/data/questions'
import { subjects, chapters, knowledgePoints } from '@/data/subjects'

/**
 * 计算知识点掌握程度
 * 基于答题历史、错题本、复习记录综合计算
 */
export function calculateKnowledgeMastery(knowledgeId) {
  // 1. 从答题历史获取数据
  const history = JSON.parse(localStorage.getItem('practiceHistory') || '[]')
  const knowledgeHistory = history.filter(h => h.knowledgeId === knowledgeId)
  
  // 2. 从错题本获取数据
  const notebook = JSON.parse(localStorage.getItem('notebook') || '{"questions":[]}')
  const wrongQuestions = notebook.questions?.filter(q => q.knowledgeId === knowledgeId) || []
  
  // 3. 从复习记录获取数据
  const reviewRecords = JSON.parse(localStorage.getItem('reviewRecords') || '[]')
  const knowledgeReviews = reviewRecords.filter(r => r.knowledgeId === knowledgeId)
  
  // 计算基础分数
  let baseScore = 50 // 默认基础分
  
  // 根据答题正确率调整（权重40%）
  if (knowledgeHistory.length > 0) {
    const totalCorrect = knowledgeHistory.reduce((sum, h) => sum + (h.correctCount || 0), 0)
    const totalQuestions = knowledgeHistory.reduce((sum, h) => sum + (h.questionCount || 0), 0)
    const accuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 50
    baseScore = baseScore * 0.6 + accuracy * 0.4
  }
  
  // 根据错题情况调整（权重30%）
  if (wrongQuestions.length > 0) {
    const masteredCount = wrongQuestions.filter(q => q.mastered).length
    const masterRate = wrongQuestions.length > 0 ? (masteredCount / wrongQuestions.length) * 100 : 0
    const penalty = Math.min(30, wrongQuestions.length * 5)
    baseScore = Math.max(0, baseScore - penalty)
    baseScore = baseScore * 0.7 + masterRate * 0.3
  }
  
  // 根据复习情况奖励（权重30%）
  if (knowledgeReviews.length > 0) {
    const avgMemory = knowledgeReviews.reduce((sum, r) => sum + (r.memoryLevel || 50), 0) / knowledgeReviews.length
    baseScore = baseScore * 0.7 + avgMemory * 0.3
  }
  
  return Math.min(100, Math.max(0, Math.round(baseScore)))
}

/**
 * 获取学科下所有知识点的掌握程度
 */
export function getSubjectKnowledgeMastery(subjectId) {
  const result = []
  
  // 遍历该学科的所有章节
  const subjectChapters = chapters[subjectId] || []
  
  subjectChapters.forEach(chapter => {
    const chapterKnowledge = knowledgePoints[chapter.id] || []
    
    chapterKnowledge.forEach(kp => {
      const mastery = calculateKnowledgeMastery(kp.id)
      result.push({
        id: kp.id,
        name: kp.name,
        chapterId: chapter.id,
        chapterName: chapter.name,
        mastery,
        totalQuestions: getKnowledgeQuestionCount(kp.id),
        answeredQuestions: getKnowledgeAnsweredCount(kp.id),
        correctRate: getKnowledgeCorrectRate(kp.id),
        masteryLevel: getMasteryLevel(mastery)
      })
    })
  })
  
  return result
}

/**
 * 获取雷达图数据
 */
export function getRadarChartData(subjectId) {
  const knowledgeData = getSubjectKnowledgeMastery(subjectId)
  
  // 取前6个知识点（或全部）
  const topKnowledge = knowledgeData
    .sort((a, b) => a.mastery - b.mastery) // 按掌握度排序，低的优先
    .slice(0, 6)
  
  const indicators = topKnowledge.map(k => ({
    name: k.name,
    max: 100
  }))
  
  const values = topKnowledge.map(k => k.mastery)
  
  return { indicators, values, knowledgeData }
}

/**
 * 获取薄弱知识点 TOP N
 */
export function getWeakKnowledgeTop(subjectId, limit = 5) {
  const knowledgeData = getSubjectKnowledgeMastery(subjectId)
  
  return knowledgeData
    .sort((a, b) => a.mastery - b.mastery)
    .slice(0, limit)
    .map(k => ({
      ...k,
      weakScore: 100 - k.mastery
    }))
}

/**
 * 获取知识图谱树形数据
 */
export function getKnowledgeTreeData(subjectId) {
  const subjectChapters = chapters[subjectId] || []
  
  return subjectChapters.map(chapter => {
    const chapterKnowledge = knowledgePoints[chapter.id] || []
    
    const children = chapterKnowledge.map(kp => {
      const mastery = calculateKnowledgeMastery(kp.id)
      return {
        id: kp.id,
        name: kp.name,
        level: 2,
        totalQuestions: getKnowledgeQuestionCount(kp.id),
        answeredQuestions: getKnowledgeAnsweredCount(kp.id),
        correctRate: getKnowledgeCorrectRate(kp.id),
        masteryLevel: getMasteryLevel(mastery),
        mastery
      }
    })
    
    // 计算章节整体掌握度
    const avgMastery = children.length > 0
      ? Math.round(children.reduce((sum, c) => sum + c.mastery, 0) / children.length)
      : 50
    
    return {
      id: chapter.id,
      name: chapter.name,
      level: 1,
      totalQuestions: children.reduce((sum, c) => sum + c.totalQuestions, 0),
      answeredQuestions: children.reduce((sum, c) => sum + c.answeredQuestions, 0),
      correctRate: children.length > 0
        ? Math.round(children.reduce((sum, c) => sum + c.correctRate, 0) / children.length)
        : 0,
      masteryLevel: getMasteryLevel(avgMastery),
      mastery: avgMastery,
      children
    }
  })
}

/**
 * 获取整体统计数据
 */
export function getOverallStats(subjectId) {
  const knowledgeData = getSubjectKnowledgeMastery(subjectId)
  
  const totalQuestions = knowledgeData.reduce((sum, k) => sum + k.totalQuestions, 0)
  const answeredQuestions = knowledgeData.reduce((sum, k) => sum + k.answeredQuestions, 0)
  const avgMastery = knowledgeData.length > 0
    ? Math.round(knowledgeData.reduce((sum, k) => sum + k.mastery, 0) / knowledgeData.length)
    : 0
  
  // 从答题历史计算正确题数
  const history = JSON.parse(localStorage.getItem('practiceHistory') || '[]')
  const subjectHistory = history.filter(h => {
    const subjectName = getSubjectNameByKnowledge(h.knowledgeId)
    const subject = subjects.find(s => s.name === subjectName)
    return subject?.id === subjectId
  })
  
  const correctQuestions = subjectHistory.reduce((sum, h) => sum + (h.correctCount || 0), 0)
  const wrongQuestions = subjectHistory.reduce((sum, h) => sum + (h.questionCount - h.correctCount) || 0, 0)
  
  return {
    masteryRate: avgMastery,
    totalQuestions,
    answeredQuestions,
    correctQuestions,
    wrongQuestions
  }
}

/**
 * 获取知识点题目数量
 */
function getKnowledgeQuestionCount(knowledgeId) {
  return questionBank.filter(q => q.knowledgeId === knowledgeId).length
}

/**
 * 获取知识点已答题数量
 */
function getKnowledgeAnsweredCount(knowledgeId) {
  const history = JSON.parse(localStorage.getItem('practiceHistory') || '[]')
  const knowledgeHistory = history.filter(h => h.knowledgeId === knowledgeId)
  return knowledgeHistory.reduce((sum, h) => sum + (h.questionCount || 0), 0)
}

/**
 * 获取知识点正确率
 */
function getKnowledgeCorrectRate(knowledgeId) {
  const history = JSON.parse(localStorage.getItem('practiceHistory') || '[]')
  const knowledgeHistory = history.filter(h => h.knowledgeId === knowledgeId)
  
  if (knowledgeHistory.length === 0) return 0
  
  const totalCorrect = knowledgeHistory.reduce((sum, h) => sum + (h.correctCount || 0), 0)
  const totalQuestions = knowledgeHistory.reduce((sum, h) => sum + (h.questionCount || 0), 0)
  
  return totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0
}

/**
 * 获取掌握程度等级
 */
export function getMasteryLevel(score) {
  if (score >= 85) return 5 // 优秀
  if (score >= 70) return 4 // 良好
  if (score >= 55) return 3 // 一般
  if (score >= 40) return 2 // 较差
  return 1 // 很差
}

/**
 * 获取掌握程度文本
 */
export function getMasteryText(level) {
  const texts = ['', '很差', '较差', '一般', '良好', '优秀']
  return texts[level] || '未知'
}

/**
 * 获取掌握程度标签类型
 */
export function getMasteryTagType(level) {
  const types = ['', 'danger', 'warning', 'primary', 'success', 'success']
  return types[level] || 'info'
}

/**
 * 获取进度条颜色
 */
export function getProgressColor(rate) {
  if (rate >= 80) return '#67C23A'
  if (rate >= 60) return '#E6A23C'
  return '#F56C6C'
}

/**
 * 生成推荐练习题
 */
export function getRecommendQuestions(knowledgeId, count = 5) {
  let questions = questionBank.filter(q => q.knowledgeId === knowledgeId)
  
  if (questions.length === 0) {
    // 如果没有该知识点的题目，返回其他题目
    questions = questionBank.slice(0, count)
  }
  
  // 随机打乱
  questions = [...questions].sort(() => Math.random() - 0.5)
  
  return questions.slice(0, count).map(q => ({
    id: q.id,
    content: q.content,
    difficulty: q.difficulty,
    type: q.type
  }))
}

/**
 * 初始化模拟数据（如果没有历史记录）
 */
export function initMockAnalysisData() {
  const history = JSON.parse(localStorage.getItem('practiceHistory') || '[]')
  
  if (history.length === 0) {
    const mockHistory = [
      // 高等数学
      { knowledgeId: 10102, questionCount: 15, correctCount: 9, accuracy: 60, date: '2026-04-15' },
      { knowledgeId: 10103, questionCount: 10, correctCount: 5, accuracy: 50, date: '2026-04-14' },
      { knowledgeId: 10201, questionCount: 12, correctCount: 10, accuracy: 83, date: '2026-04-15' },
      { knowledgeId: 10202, questionCount: 8, correctCount: 6, accuracy: 75, date: '2026-04-13' },
      // 英语
      { knowledgeId: 20101, questionCount: 20, correctCount: 14, accuracy: 70, date: '2026-04-15' },
      { knowledgeId: 20102, questionCount: 15, correctCount: 12, accuracy: 80, date: '2026-04-14' },
      // 政治
      { knowledgeId: 30101, questionCount: 10, correctCount: 7, accuracy: 70, date: '2026-04-15' },
      { knowledgeId: 30102, questionCount: 8, correctCount: 5, accuracy: 63, date: '2026-04-13' },
      // 计算机
      { knowledgeId: 40101, questionCount: 12, correctCount: 8, accuracy: 67, date: '2026-04-14' },
      { knowledgeId: 40102, questionCount: 10, correctCount: 9, accuracy: 90, date: '2026-04-15' }
    ]
    localStorage.setItem('practiceHistory', JSON.stringify(mockHistory))
  }
  
  // 初始化错题本数据
  const notebook = JSON.parse(localStorage.getItem('notebook') || '{"questions":[]}')
  if (!notebook.questions || notebook.questions.length === 0) {
    const mockNotebook = {
      folders: [
        { id: 1, name: '默认文件夹', parentId: null, icon: 'folder', sortOrder: 0 }
      ],
      questions: [
        {
          id: 1,
          questionId: 1,
          knowledgeId: 10102,
          mastered: false,
          wrongCount: 3
        },
        {
          id: 2,
          questionId: 3,
          knowledgeId: 10103,
          mastered: false,
          wrongCount: 2
        },
        {
          id: 3,
          questionId: 9,
          knowledgeId: 20101,
          mastered: true,
          wrongCount: 1
        }
      ]
    }
    localStorage.setItem('notebook', JSON.stringify(mockNotebook))
  }
}