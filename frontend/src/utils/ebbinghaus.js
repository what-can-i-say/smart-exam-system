// 艾宾浩斯遗忘曲线算法

// 复习间隔（小时）
const REVIEW_INTERVALS = [
  0.083,  // 5分钟
  0.5,    // 30分钟
  12,     // 12小时
  24,     // 1天
  48,     // 2天
  96,     // 4天
  168,    // 7天
  336,    // 14天
  720     // 30天
]

// 记忆保持率计算
// R = e^(-t/S) 其中 S 是记忆强度系数
export function calculateRetention(hoursSinceLastReview, strengthFactor = 1.0) {
  if (hoursSinceLastReview <= 0) return 1.0
  
  const S = 1.84 * strengthFactor
  const retention = Math.exp(-hoursSinceLastReview / S)
  
  return Math.max(0.1, Math.min(1.0, retention))
}

// 计算下次复习时间
export function calculateNextReviewTime(currentStage, isCorrect, memoryLevel) {
  let nextStage
  
  if (isCorrect) {
    // 答对：进入下一阶段
    nextStage = Math.min(currentStage + 1, REVIEW_INTERVALS.length - 1)
  } else {
    // 答错：回退一个阶段
    nextStage = Math.max(currentStage - 1, 0)
  }
  
  // 根据记忆水平调整间隔
  let intervalHours = REVIEW_INTERVALS[nextStage]
  intervalHours = intervalHours * (1.5 - memoryLevel * 0.5)
  
  const nextTime = new Date()
  nextTime.setHours(nextTime.getHours() + intervalHours)
  
  return {
    nextStage,
    nextTime,
    intervalHours
  }
}

// 计算记忆强度系数
export function calculateStrengthFactor(reviewCount, correctCount, currentStage) {
  if (reviewCount === 0) return 1.0
  
  const correctRate = correctCount / reviewCount
  const stageFactor = 1 + (currentStage * 0.2)
  
  return correctRate * stageFactor
}

// 获取记忆水平等级
export function getMemoryLevel(retention) {
  if (retention >= 0.8) return { level: 'excellent', text: '熟练掌握', color: '#67C23A' }
  if (retention >= 0.6) return { level: 'good', text: '基本掌握', color: '#409EFF' }
  if (retention >= 0.4) return { level: 'fair', text: '需要复习', color: '#E6A23C' }
  return { level: 'poor', text: '急需复习', color: '#F56C6C' }
}

// 生成复习建议
export function generateReviewAdvice(retention, reviewCount, stage) {
  if (retention < 0.4) {
    return '记忆水平较低，建议立即复习并做相关练习'
  } else if (retention < 0.6) {
    return '记忆水平一般，建议加强复习频率'
  } else if (retention < 0.8) {
    return '记忆水平良好，按计划复习即可'
  } else {
    return '掌握牢固，可以适当延长复习间隔'
  }
}

// 计算复习优先级（分数越高越需要优先复习）
export function calculatePriority(retention, daysSinceLastReview, importance = 1.0) {
  const retentionFactor = 1 - retention
  const timeFactor = Math.min(daysSinceLastReview / 7, 1)
  
  return (retentionFactor * 0.6 + timeFactor * 0.4) * importance * 100
}