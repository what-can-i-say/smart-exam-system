import request from '@/utils/request'

// 获取学科列表
export function getSubjects() {
  return request({
    url: '/question/subjects',
    method: 'get'
  })
}

// 获取知识点列表
export function getKnowledgePoints(subjectId) {
  return request({
    url: '/question/knowledge',
    method: 'get',
    params: { subjectId }
  })
}

// 获取练习题目
export function getPracticeQuestions(params) {
  return request({
    url: '/question/practice',
    method: 'get',
    params
  })
}

// 提交答案
export function submitAnswer(data) {
  return request({
    url: '/question/answer',
    method: 'post',
    data
  })
}

// 获取题目详情
export function getQuestionDetail(id) {
  return request({
    url: `/question/${id}`,
    method: 'get'
  })
}