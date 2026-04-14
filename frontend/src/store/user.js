import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}')
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.token,
    userName: (state) => state.userInfo.nickname || state.userInfo.username || '学员',
    avatar: (state) => state.userInfo.avatar || ''
  },
  
  actions: {
    setToken(token) {
      this.token = token
      localStorage.setItem('token', token)
    },
    
    setUserInfo(info) {
      this.userInfo = { ...this.userInfo, ...info }
      localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
    },
    
    logout() {
      this.token = ''
      this.userInfo = {}
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    }
  }
})