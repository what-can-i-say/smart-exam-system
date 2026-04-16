import { defineStore } from 'pinia'
import {
  getNotebook,
  getFolders,
  addToNotebook as addToNotebookApi,
  createFolder as createFolderApi,
  deleteFolder as deleteFolderApi,
  moveQuestion as moveQuestionApi,
  saveNote as saveNoteApi,
  toggleMastered as toggleMasteredApi,
  deleteQuestion as deleteQuestionApi,
  getNotebookStats as getNotebookStatsApi
} from '@/api/modules/notebook'

export const useNotebookStore = defineStore('notebook', {
  state: () => ({
    folders: [],
    questions: [],
    currentFolder: null
  }),

  getters: {
    // 获取文件夹树
    folderTree: (state) => {
      const buildTree = (parentId = null) => {
        return state.folders
          .filter(f => f.parent_id === parentId)
          .map(f => ({
            ...f,
            children: buildTree(f.id)
          }))
      }
      return buildTree(null)
    },

    // 获取当前文件夹下的错题
    currentFolderQuestions: (state) => {
      if (!state.currentFolder) return state.questions
      return state.questions.filter(q => q.folder_id === state.currentFolder)
    },

    // 统计数据
    stats: (state) => ({
      total: state.questions.length,
      mastered: state.questions.filter(q => q.mastered).length,
      unmastered: state.questions.filter(q => !q.mastered).length,
      folders: state.folders.length
    })
  },

  actions: {
    // 初始化数据
    async initData() {
      // 总是先尝试从后端获取数据
      await this.fetchFolders()
      await this.fetchQuestions()

      // 如果获取失败或数据为空，使用 localStorage 作为后备
      if (this.questions.length === 0) {
        this.initFromLocalStorage()
      }
    },

    // 从 localStorage 初始化（后备方案）
    initFromLocalStorage() {
      const saved = localStorage.getItem('notebook')
      if (saved) {
        const data = JSON.parse(saved)
        this.folders = data.folders || []
        this.questions = data.questions || []
      } else {
        // 初始化默认文件夹
        this.folders = [
          { id: 1, name: '默认文件夹', parent_id: null, icon: 'folder', sort_order: 0 }
        ]
        this.questions = []
        this.saveToStorage()
      }
    },

    // 保存到本地存储（后备方案）
    saveToStorage() {
      localStorage.setItem('notebook', JSON.stringify({
        folders: this.folders,
        questions: this.questions
      }))
    },

    // 获取文件夹列表
    async fetchFolders() {
      try {
        const response = await getFolders()
        this.folders = response.data
      } catch (error) {
        console.error('获取文件夹列表失败:', error)
      }
    },

    // 获取错题列表
    async fetchQuestions() {
      try {
        const response = await getNotebook()
        this.questions = response.data
      } catch (error) {
        console.error('获取错题列表失败:', error)
      }
    },

    // 获取统计数据
    async fetchStats() {
      try {
        const response = await getNotebookStats()
        return response.data
      } catch (error) {
        console.error('获取统计失败:', error)
        return this.stats
      }
    },

    // 添加错题
    async addQuestion(question) {
      try {
        const questionId = question.question_id || question.id || question.questionId
        const knowledgeId = question.knowledge_id || question.knowledgeId

        // 检查是否已存在
        const exists = this.questions.find(q => q.question_id === questionId)
        if (exists) {
          exists.wrong_count = (exists.wrong_count || 1) + 1
          exists.last_wrong_time = new Date().toISOString()
        } else {
          const response = await addToNotebookApi({
            questionId: questionId,
            knowledgeId: knowledgeId
          })
          // 从后端重新获取完整数据
          await this.fetchQuestions()
        }
        this.saveToStorage()
      } catch (error) {
        console.error('添加错题失败:', error)
        // 失败时使用 localStorage 后备方案
        this.addToNotebookLocal(question)
      }
    },

    // 本地添加错题（后备方案）
    addToNotebookLocal(question) {
      const questionId = question.question_id || question.id || question.questionId

      const exists = this.questions.find(q => q.question_id === questionId)
      if (exists) {
        exists.wrong_count = (exists.wrong_count || 1) + 1
        exists.last_wrong_time = new Date().toISOString()
      } else {
        this.questions.push({
          id: Date.now() + Math.random().toString(36).substr(2, 9),
          question_id: questionId,
          folder_id: 1,
          ...question,
          wrong_count: 1,
          last_wrong_time: new Date().toISOString(),
          mastered: false,
          notes: '',
          tags: []
        })
      }
      this.saveToStorage()
    },

    // 创建文件夹
    async createFolder(name, parentId = null) {
      try {
        const response = await createFolderApi({ name, parentId })
        this.folders.push({
          id: response.data.id,
          name,
          parent_id: parentId,
          icon: 'folder',
          sort_order: this.folders.length
        })
        this.saveToStorage()
        return response.data
      } catch (error) {
        console.error('创建文件夹失败:', error)
        throw error
      }
    },

    // 删除文件夹
    async deleteFolder(folderId) {
      try {
        await deleteFolderApi(folderId)
        // 将文件夹下的错题移到默认文件夹
        this.questions.forEach(q => {
          if (q.folder_id === folderId) {
            q.folder_id = 1
          }
        })
        // 删除子文件夹
        this.folders = this.folders.filter(f => f.id !== folderId && f.parent_id !== folderId)
        this.saveToStorage()
      } catch (error) {
        console.error('删除文件夹失败:', error)
        throw error
      }
    },

    // 移动错题到文件夹
    async moveQuestion(questionId, folderId) {
      try {
        await moveQuestionApi(questionId, { folderId })
        const question = this.questions.find(q => q.id === questionId)
        if (question) {
          question.folder_id = folderId
          this.saveToStorage()
          return true
        }
        return false
      } catch (error) {
        console.error('移动错题失败:', error)
        throw error
      }
    },

    // 保存笔记
    async saveNote(questionId, note) {
      try {
        await saveNoteApi(questionId, { notes: note })
        const question = this.questions.find(q => q.id === questionId)
        if (question) {
          question.notes = note
          this.saveToStorage()
        }
      } catch (error) {
        console.error('保存笔记失败:', error)
        throw error
      }
    },

    // 标记掌握
    async toggleMastered(questionId) {
      try {
        const response = await toggleMasteredApi(questionId)
        const question = this.questions.find(q => q.id === questionId)
        if (question) {
          question.mastered = response.data.mastered
          this.saveToStorage()
        }
        return response.data.mastered
      } catch (error) {
        console.error('标记掌握失败:', error)
        throw error
      }
    },

    // 删除错题
    async deleteQuestion(questionId) {
      try {
        await deleteQuestionApi(questionId)
        this.questions = this.questions.filter(q => q.id !== questionId)
        this.saveToStorage()
      } catch (error) {
        console.error('删除错题失败:', error)
        throw error
      }
    },

    // 批量删除
    async deleteQuestions(questionIds) {
      try {
        await Promise.all(questionIds.map(id => deleteQuestionApi(id)))
        this.questions = this.questions.filter(q => !questionIds.includes(q.id))
        this.saveToStorage()
      } catch (error) {
        console.error('批量删除错题失败:', error)
        throw error
      }
    }
  }
})
