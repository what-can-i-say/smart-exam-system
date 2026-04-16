import request from '@/utils/request'

// 获取整体统计
export function getOverallStats(params) {
  return request({
    url: '/analysis/stats',
    method: 'get',
    params
  })
}

// 获取知识点掌握情况
export function getKnowledgeMastery(params) {
  return request({
    url: '/analysis/knowledge',
    method: 'get',
    params
  })
}

// 获取薄弱知识点
export function getWeakKnowledge(params) {
  return request({
    url: '/analysis/weak',
    method: 'get',
    params
  })
}

// 获取知识图谱
export function getKnowledgeTree(params) {
  return request({
    url: '/analysis/tree',
    method: 'get',
    params
  })
}

// 获取雷达图数据
export function getRadarChart(params) {
  return request({
    url: '/analysis/radar',
    method: 'get',
    params
  })
}
