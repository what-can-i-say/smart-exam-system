import { defineStore } from 'pinia'

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
          .filter(f => f.parentId === parentId)
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
      return state.questions.filter(q => q.folderId === state.currentFolder)
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
    initData() {
      const saved = localStorage.getItem('notebook')
      if (saved) {
        const data = JSON.parse(saved)
        this.folders = data.folders || []
        this.questions = data.questions || []
      } else {
        // 初始化默认文件夹
        this.folders = [
          { id: 1, name: '默认文件夹', parentId: null, icon: 'folder', sortOrder: 0 }
        ]
        this.questions = []
        this.saveToStorage()
      }
    },
    
    // 保存到本地存储
    saveToStorage() {
      localStorage.setItem('notebook', JSON.stringify({
        folders: this.folders,
        questions: this.questions
      }))
    },
    
    // 添加错题
    addQuestion(question) {
      // 检查是否已存在
      const exists = this.questions.find(q => q.questionId === question.questionId)
      if (exists) {
        exists.wrongCount = (exists.wrongCount || 1) + 1
        exists.lastWrongTime = new Date().toISOString()
      } else {
        this.questions.push({
          id: Date.now() + Math.random().toString(36).substr(2, 9),
          questionId: question.questionId || question.id,
          folderId: 1, // 默认文件夹
          ...question,
          wrongCount: 1,
          lastWrongTime: new Date().toISOString(),
          mastered: false,
          notes: '',
          tags: []
        })
      }
      this.saveToStorage()
    },
    
    // 创建文件夹
    createFolder(name, parentId = null) {
      const newFolder = {
        id: Date.now(),
        name,
        parentId,
        icon: 'folder',
        sortOrder: this.folders.length
      }
      this.folders.push(newFolder)
      this.saveToStorage()
      return newFolder
    },
    
    // 删除文件夹
    deleteFolder(folderId) {
      // 将文件夹下的错题移到默认文件夹
      this.questions.forEach(q => {
        if (q.folderId === folderId) {
          q.folderId = 1
        }
      })
      // 删除子文件夹
      this.folders = this.folders.filter(f => f.id !== folderId && f.parentId !== folderId)
      this.saveToStorage()
    },
    
    // 重命名文件夹
    renameFolder(folderId, newName) {
      const folder = this.folders.find(f => f.id === folderId)
      if (folder) {
        folder.name = newName
        this.saveToStorage()
      }
    },
    
    // 移动错题到文件夹
    moveQuestion(questionId, folderId) {
      const question = this.questions.find(q => q.id === questionId)
      if (question) {
        question.folderId = folderId
        this.saveToStorage()
        return true
      }
      return false
    },
    
    // 保存笔记
    saveNote(questionId, note) {
      const question = this.questions.find(q => q.id === questionId)
      if (question) {
        question.notes = note
        this.saveToStorage()
      }
    },
    
    // 添加标签
    addTag(questionId, tag) {
      const question = this.questions.find(q => q.id === questionId)
      if (question && !question.tags.includes(tag)) {
        question.tags.push(tag)
        this.saveToStorage()
      }
    },
    
    // 移除标签
    removeTag(questionId, tag) {
      const question = this.questions.find(q => q.id === questionId)
      if (question) {
        question.tags = question.tags.filter(t => t !== tag)
        this.saveToStorage()
      }
    },
    
    // 标记掌握
    toggleMastered(questionId) {
      const question = this.questions.find(q => q.id === questionId)
      if (question) {
        question.mastered = !question.mastered
        this.saveToStorage()
      }
    },
    
    // 删除错题
    deleteQuestion(questionId) {
      this.questions = this.questions.filter(q => q.id !== questionId)
      this.saveToStorage()
    },
    
    // 批量删除
    deleteQuestions(questionIds) {
      this.questions = this.questions.filter(q => !questionIds.includes(q.id))
      this.saveToStorage()
    }
  }
})