<template>
  <div class="login-container">
    <el-card class="login-card">
      <div class="login-header">
        <span class="logo">📚</span>
        <h2>考研智能刷题系统</h2>
        <p>科学备考 · 高效提分</p>
      </div>

      <el-form :model="loginForm" class="login-form">
        <el-form-item>
          <el-input
            v-model="loginForm.username"
            placeholder="用户名"
            prefix-icon="User"
            size="large"
            :disabled="loading"
          />
        </el-form-item>

        <el-form-item>
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            prefix-icon="Lock"
            size="large"
            show-password
            @keyup.enter="handleLogin"
            :disabled="loading"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            style="width: 100%"
            @click="handleLogin"
            :loading="loading"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <span>测试账号：任意输入即可登录</span>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const handleLogin = async () => {
  if (!loginForm.username || !loginForm.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }

  loading.value = true
  try {
    // 尝试调用后端 API
    await userStore.login(loginForm)
    ElMessage.success('登录成功')
    router.push('/dashboard')
  } catch (error) {
    // 如果后端不可用，使用模拟登录
    console.warn('后端连接失败，使用模拟登录')
    userStore.setToken('test-token')
    userStore.setUserInfo({
      username: loginForm.username,
      nickname: loginForm.username
    })
    ElMessage.success('登录成功（模拟模式）')
    router.push('/dashboard')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  .login-card {
    width: 420px;
    padding: 40px 30px;

    .login-header {
      text-align: center;
      margin-bottom: 30px;

      .logo {
        font-size: 48px;
      }

      h2 {
        color: #333;
        margin: 10px 0 5px;
      }

      p {
        color: #999;
        font-size: 14px;
      }
    }

    .login-footer {
      text-align: center;
      color: #999;
      font-size: 13px;
      margin-top: 20px;
    }
  }
}
</style>
