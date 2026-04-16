import request from '@/utils/request'

// 获取学科列表
export function getSubjects() {
  return request({
    url: '/questions/subjects',
    method: 'get'
  })
}

// 获取章节列表
export function getChapters(subjectId) {
  return request({
    url: '/questions/chapters',
    method: 'get',
    params: { subjectId }
  })
}

// 获取知识点列表
export function getKnowledgePoints(subjectId) {
  return request({
    url: '/questions/knowledge',
    method: 'get',
    params: { subjectId }
  })
}

// 获取练习题目
export function getPracticeQuestions(params) {
  return request({
    url: '/questions/practice/questions',
    method: 'get',
    params
  })
}

// 提交答案
export function submitAnswer(data) {
  return request({
    url: '/questions/answer',
    method: 'post',
    data
  })
}

// 获取题目详情
export function getQuestionDetail(id) {
  return request({
    url: `/questions/${id}`,
    method: 'get'
  })
}

// 获取题目统计
export function getQuestionStats() {
  return request({
    url: '/questions/stats',
    method: 'get'
  })
}
