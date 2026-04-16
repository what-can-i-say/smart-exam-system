import request from '@/utils/request'

// 获取错题本列表
export function getNotebook(params) {
  return request({
    url: '/notebook',
    method: 'get',
    params
  })
}

// 获取文件夹列表
export function getFolders() {
  return request({
    url: '/notebook/folders',
    method: 'get'
  })
}

// 添加错题
export function addToNotebook(data) {
  return request({
    url: '/notebook',
    method: 'post',
    data
  })
}

// 创建文件夹
export function createFolder(data) {
  return request({
    url: '/notebook/folders',
    method: 'post',
    data
  })
}

// 删除文件夹
export function deleteFolder(id) {
  return request({
    url: `/notebook/folders/${id}`,
    method: 'delete'
  })
}

// 移动错题
export function moveQuestion(id, data) {
  return request({
    url: `/notebook/${id}/move`,
    method: 'put',
    data
  })
}

// 保存笔记
export function saveNote(id, data) {
  return request({
    url: `/notebook/${id}/notes`,
    method: 'put',
    data
  })
}

// 标记掌握
export function toggleMastered(id) {
  return request({
    url: `/notebook/${id}/mastered`,
    method: 'put'
  })
}

// 删除错题
export function deleteQuestion(id) {
  return request({
    url: `/notebook/${id}`,
    method: 'delete'
  })
}

// 获取错题本统计
export function getNotebookStats() {
  return request({
    url: '/notebook/stats',
    method: 'get'
  })
}
