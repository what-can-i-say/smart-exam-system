import request from '@/utils/request'

// 获取今日复习任务
export function getTodayTasks() {
  return request({
    url: '/review/tasks',
    method: 'get'
  })
}

// 获取复习题目
export function getReviewQuestions(params) {
  return request({
    url: '/review/questions',
    method: 'get',
    params
  })
}

// 提交复习结果
export function submitReview(data) {
  return request({
    url: '/review/submit',
    method: 'post',
    data
  })
}

// 获取复习统计
export function getReviewStats() {
  return request({
    url: '/review/stats',
    method: 'get'
  })
}

// 获取艾宾浩斯曲线数据
export function getEbbinghausCurve() {
  return request({
    url: '/review/ebbinghaus',
    method: 'get'
  })
}
