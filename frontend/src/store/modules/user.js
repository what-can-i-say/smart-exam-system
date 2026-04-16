import { defineStore } from 'pinia'
import { login as loginApi, getCurrentUser, updateProfile as updateProfileApi } from '@/api/modules/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}')
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    userName: (state) => state.userInfo.nickname || state.userInfo.username || '学员'
  },

  actions: {
    setToken(token) {
      this.token = token
      localStorage.setItem('token', token)
    },

    setUserInfo(info) {
      this.userInfo = info
      localStorage.setItem('userInfo', JSON.stringify(info))
    },

    // 用户登录
    async login(loginForm) {
      try {
        const response = await loginApi(loginForm)
        const { user, token } = response.data

        this.setToken(token)
        this.setUserInfo(user)

        return Promise.resolve(user)
      } catch (error) {
        return Promise.reject(error)
      }
    },

    // 获取用户信息
    async fetchUserInfo() {
      try {
        const response = await getCurrentUser()
        this.setUserInfo(response.data)
        return response.data
      } catch (error) {
        return Promise.reject(error)
      }
    },

    // 更新用户信息
    async updateProfile(profileData) {
      try {
        await updateProfileApi(profileData)
        await this.fetchUserInfo()
        return Promise.resolve()
      } catch (error) {
        return Promise.reject(error)
      }
    },

    // 登出
    logout() {
      this.token = ''
      this.userInfo = {}
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    }
  }
})
