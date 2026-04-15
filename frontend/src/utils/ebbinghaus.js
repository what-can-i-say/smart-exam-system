// 艾宾浩斯遗忘曲线算法
import { questionBank, getKnowledgeName, getSubjectNameByKnowledge } from '@/data/questions'
// 复习间隔（小时）- 只定义一次
export const REVIEW_INTERVALS_HOURS = [0.083, 0.5, 12, 24, 48, 96, 168, 336, 720]

// 复习间隔（分钟）- 用于计算
export const REVIEW_INTERVALS_MINUTES = [5, 30, 720, 1440, 2880, 5760, 10080, 20160, 43200]

// 复习阶段名称
export const REVIEW_STAGE_NAMES = [
  '首次学习',
  '5分钟后',
  '30分钟后',
  '12小时后',
  '1天后',
  '2天后',
  '4天后',
  '7天后',
  '14天后',
  '30天后'
]

// 记忆衰减系数（基于艾宾浩斯实验数据）
const DECAY_FACTOR = 1.84

// 基础记忆保持率曲线（不复习的情况）
const FORGETTING_CURVE = [100, 58.2, 44.2, 35.8, 33.7, 27.8, 25.4, 21.1]

/**
 * 计算记忆保持率
 * 基于艾宾浩斯遗忘曲线公式：R = e^(-t/S)
 * @param {Object} record - 复习记录
 * @returns {number} 记忆保持率 (0-100)
 */
export function calculateMemoryLevel(record) {
  const {
    reviewStage = 1,
    correctCount = 0,
    totalReviewCount = 0,
    lastReviewTime = null
  } = record
  
  if (!lastReviewTime || totalReviewCount === 0) {
    return FORGETTING_CURVE[Math.min(reviewStage - 1, FORGETTING_CURVE.length - 1)] || 100
  }
  
  const hoursSinceLastReview = (Date.now() - new Date(lastReviewTime).getTime()) / (1000 * 60 * 60)
  
  if (hoursSinceLastReview <= 0) return 100
  
  const correctRate = totalReviewCount > 0 ? correctCount / totalReviewCount : 0
  const strengthFactor = 1 + (correctRate * reviewStage * 0.5) + (totalReviewCount * 0.1)
  
  const retention = Math.exp(-hoursSinceLastReview / (DECAY_FACTOR * strengthFactor))
  
  return Math.round(Math.max(10, Math.min(100, retention * 100)))
}

/**
 * 计算下次复习时间
 * @param {Object} record - 当前复习记录
 * @param {boolean} isCorrect - 本次答题是否正确
 * @returns {Date} 下次复习时间
 */
export function calculateNextReviewTime(record, isCorrect) {
  let { reviewStage = 1 } = record
  
  let nextStage
  if (isCorrect) {
    nextStage = Math.min(reviewStage + 1, REVIEW_INTERVALS_MINUTES.length)
  } else {
    nextStage = 1
  }
  
  const intervalMinutes = REVIEW_INTERVALS_MINUTES[nextStage - 1] || 1440
  
  const memoryLevel = calculateMemoryLevel({ ...record, reviewStage })
  const adjustedInterval = Math.round(intervalMinutes * (1 + (100 - memoryLevel) / 200))
  
  return new Date(Date.now() + adjustedInterval * 60 * 1000)
}

/**
 * 获取复习阶段对应的间隔描述
 */
export function getStageIntervalText(stage) {
  const intervals = ['', '5分钟', '30分钟', '12小时', '1天', '2天', '4天', '7天', '14天', '30天']
  return intervals[stage] || `${stage}天后`
}

/**
 * 获取复习阶段标签类型
 */
export function getStageTagType(stage) {
  const types = ['', 'info', 'primary', 'success', 'warning', 'danger', 'danger', 'danger', 'danger']
  return types[stage] || 'info'
}

/**
 * 获取记忆水平颜色
 */
export function getMemoryColor(level) {
  if (level >= 70) return '#67C23A'
  if (level >= 40) return '#E6A23C'
  return '#F56C6C'
}

/**
 * 格式化下次复习时间
 */
export function formatNextReviewTime(nextReviewTime) {
  if (!nextReviewTime) return '未设置'
  
  const nextDate = new Date(nextReviewTime)
  const now = new Date()
  const diffDays = Math.ceil((nextDate - now) / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return '已过期'
  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '明天'
  if (diffDays === 2) return '后天'
  if (diffDays <= 7) return `${diffDays}天后`
  
  return nextDate.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
}

/**
 * 获取艾宾浩斯曲线数据
 */
export function getEbbinghausCurveData() {
  const timePoints = ['学习后', '20分钟', '1小时', '9小时', '1天', '2天', '6天', '31天']
  const naturalForgetting = [100, 58.2, 44.2, 35.8, 33.7, 27.8, 25.4, 21.1]
  const withReview = [100, 90, 85, 80, 78, 75, 72, 68]
  
  return { timePoints, naturalForgetting, withReview }
}

/**
 * 生成复习任务列表
 */
export function generateReviewTasks(reviewRecords) {
  const now = new Date()
  const tasks = []
  
  reviewRecords.forEach(record => {
    if (record.status !== 0 && record.status !== 'pending') return
    
    const nextReviewTime = new Date(record.nextReviewTime)
    if (nextReviewTime.getTime() - now.getTime() > 30 * 60 * 1000) return
    
    const memoryLevel = calculateMemoryLevel(record)
    
    // 从题库中获取知识点和学科名称
    const knowledgeName = getKnowledgeName(record.knowledgeId)
    const subjectName = getSubjectNameByKnowledge(record.knowledgeId)
    
    tasks.push({
      id: record.id,
      questionId: record.questionId,
      knowledgeId: record.knowledgeId,
      knowledgeName: knowledgeName || record.knowledgeName || '未知知识点',
      subjectName: subjectName || record.subjectName || '未知学科',
      questionCount: 1,
      reviewStage: record.reviewStage || 1,
      memoryLevel,
      nextReviewTime: record.nextReviewTime,
      correctCount: record.correctCount || 0,
      totalReviewCount: record.totalReviewCount || 0,
      status: memoryLevel < 30 ? 'urgent' : 'normal'
    })
  })
  
  tasks.sort((a, b) => a.memoryLevel - b.memoryLevel)
  return aggregateTasksByKnowledge(tasks)
}
  
/**
 * 按知识点聚合复习任务
 */
function aggregateTasksByKnowledge(tasks) {
  const aggregated = new Map()
  
  tasks.forEach(task => {
    const key = `${task.knowledgeId}-${task.reviewStage}`
    
    if (aggregated.has(key)) {
      const existing = aggregated.get(key)
      existing.questionCount++
      existing.memoryLevel = Math.min(existing.memoryLevel, task.memoryLevel)
      existing.taskIds.push(task.id)
    } else {
      aggregated.set(key, {
        ...task,
        questionCount: 1,
        taskIds: [task.id]
      })
    }
  })
  
  return Array.from(aggregated.values())
}

/**
 * 更新复习记录
 */
export function updateReviewRecord(record, isCorrect) {
  const now = new Date()
  
  let nextStage
  if (isCorrect) {
    nextStage = Math.min((record.reviewStage || 1) + 1, REVIEW_INTERVALS_MINUTES.length)
  } else {
    nextStage = 1
  }
  
  const nextReviewTime = calculateNextReviewTime(
    { ...record, reviewStage: nextStage },
    isCorrect
  )
  
  const memoryLevel = calculateMemoryLevel({
    reviewStage: nextStage,
    correctCount: (record.correctCount || 0) + (isCorrect ? 1 : 0),
    totalReviewCount: (record.totalReviewCount || 0) + 1,
    lastReviewTime: now.toISOString()
  })
  
  let status = 0
  if (nextStage >= 7 && memoryLevel > 80) {
    status = 2
  }
  
  return {
    ...record,
    reviewStage: nextStage,
    correctCount: (record.correctCount || 0) + (isCorrect ? 1 : 0),
    totalReviewCount: (record.totalReviewCount || 0) + 1,
    lastReviewTime: now.toISOString(),
    nextReviewTime: nextReviewTime.toISOString(),
    memoryLevel,
    status
  }
}

/**
 * 创建新的复习记录
 */
export function createReviewRecord(question, isCorrect) {
  const now = new Date()
  const initialStage = 1
  
  const nextReviewTime = calculateNextReviewTime(
    { reviewStage: initialStage, correctCount: 0, totalReviewCount: 0 },
    isCorrect
  )
  
  // 获取知识点和学科名称
  const knowledgeName = getKnowledgeName(question.knowledgeId)
  const subjectName = getSubjectNameByKnowledge(question.knowledgeId)
  
  return {
    id: Date.now() + Math.random().toString(36).substr(2, 9),
    questionId: question.id,
    knowledgeId: question.knowledgeId,
    knowledgeName: knowledgeName || '未知知识点',
    subjectName: subjectName || '未知学科',
    reviewStage: initialStage,
    correctCount: isCorrect ? 1 : 0,
    totalReviewCount: 1,
    lastReviewTime: now.toISOString(),
    nextReviewTime: nextReviewTime.toISOString(),
    memoryLevel: isCorrect ? 80 : 40,
    status: 0
  }
}

/**
 * 获取复习统计数据
 */
export function getReviewStatistics(reviewRecords) {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  const todayTotal = reviewRecords.filter(r => {
    if (r.status !== 0) return false
    const nextTime = new Date(r.nextReviewTime)
    return nextTime <= now
  }).length
  
  const completed = reviewRecords.filter(r => {
    if (!r.lastReviewTime) return false
    const lastTime = new Date(r.lastReviewTime)
    return lastTime >= todayStart
  }).length
  
  const avgMemory = reviewRecords.length > 0
    ? Math.round(reviewRecords.reduce((sum, r) => sum + (r.memoryLevel || 50), 0) / reviewRecords.length)
    : 75
  
  const continuousDays = getContinuousDays()
  
  return {
    todayTotal,
    completed,
    continuous: continuousDays,
    retention: avgMemory
  }
}

/**
 * 获取连续复习天数
 */
function getContinuousDays() {
  try {
    const stored = localStorage.getItem('reviewContinuous')
    if (!stored) return 1
    
    const data = JSON.parse(stored)
    const lastDate = new Date(data.lastDate)
    const today = new Date()
    
    const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return data.days
    if (diffDays === 1) return data.days + 1
    
    return 1
  } catch {
    return 1
  }
}

/**
 * 更新连续复习天数
 */
export function updateContinuousDays() {
  try {
    const stored = localStorage.getItem('reviewContinuous')
    const today = new Date().toISOString().split('T')[0]
    
    if (!stored) {
      localStorage.setItem('reviewContinuous', JSON.stringify({ days: 1, lastDate: today }))
      return 1
    }
    
    const data = JSON.parse(stored)
    const lastDate = new Date(data.lastDate)
    const now = new Date()
    const diffDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24))
    
    let days
    if (diffDays === 0) {
      days = data.days
    } else if (diffDays === 1) {
      days = data.days + 1
    } else {
      days = 1
    }
    
    localStorage.setItem('reviewContinuous', JSON.stringify({ days, lastDate: today }))
    return days
  } catch {
    return 1
  }
}