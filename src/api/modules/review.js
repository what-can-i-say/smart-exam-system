import request from '@/utils/request'

// 获取每日复习清单
export function getDailyReviewList() {
  return request({
    url: '/review/daily',
    method: 'get'
  })
}

// 获取复习进度
export function getReviewProgress() {
  return request({
    url: '/review/progress',
    method: 'get'
  })
}

// 开始复习
export function startReview(data) {
  return request({
    url: '/review/start',
    method: 'post',
    data
  })
}

// 提交复习答案
export function submitReviewAnswer(data) {
  return request({
    url: '/review/answer',
    method: 'post',
    data
  })
}

// 获取复习统计
export function getReviewStatistics() {
  return request({
    url: '/review/statistics',
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