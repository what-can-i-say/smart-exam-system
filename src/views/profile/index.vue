<template>
  <div class="profile">
    <el-row :gutter="20">
      <!-- 左侧：用户信息卡片 -->
      <el-col :span="8">
        <el-card class="user-card" shadow="hover">
          <div class="user-header">
            <el-avatar :size="80" :src="userInfo.avatar">
              <el-icon :size="40"><User /></el-icon>
            </el-avatar>
            <h3>{{ userInfo.nickname || userInfo.username }}</h3>
            <p>{{ userInfo.email }}</p>
          </div>

          <el-divider />

          <div class="user-stats">
            <el-row>
              <el-col :span="8">
                <div class="stat-item">
                  <div class="value">{{ userStats.studyDays }}</div>
                  <div class="label">学习天数</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="stat-item">
                  <div class="value">{{ userStats.totalQuestions }}</div>
                  <div class="label">刷题总数</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="stat-item">
                  <div class="value">{{ userStats.accuracy }}%</div>
                  <div class="label">正确率</div>
                </div>
              </el-col>
            </el-row>
          </div>

          <el-divider />

          <div class="user-info-list">
            <div class="info-item">
              <el-icon><User /></el-icon>
              <span class="label">用户名</span>
              <span class="value">{{ userInfo.username }}</span>
            </div>
            <div class="info-item">
              <el-icon><Phone /></el-icon>
              <span class="label">手机号</span>
              <span class="value">{{ userInfo.phone || '未绑定' }}</span>
            </div>
            <div class="info-item">
              <el-icon><Calendar /></el-icon>
              <span class="label">注册时间</span>
              <span class="value">{{ formatDate(userInfo.createTime) }}</span>
            </div>
            <div class="info-item">
              <el-icon><Trophy /></el-icon>
              <span class="label">考研目标</span>
              <span class="value">{{ userInfo.examTarget || '未设置' }}</span>
            </div>
          </div>

          <el-button type="primary" style="width: 100%; margin-top: 20px" @click="showEditDialog = true">
            编辑资料
          </el-button>
        </el-card>
      </el-col>

      <!-- 右侧：学习进度和设置 -->
      <el-col :span="16">
        <!-- 学习进度 -->
        <el-card class="progress-card" shadow="hover">
          <template #header>
            <span>📊 学习进度</span>
          </template>

          <div ref="progressChartRef" class="chart-container"></div>
        </el-card>

        <!-- 目标设置 -->
        <el-card class="target-card" shadow="hover">
          <template #header>
            <span>🎯 学习目标</span>
          </template>

          <el-form :model="targetForm" label-width="100px">
            <el-form-item label="考研目标">
              <el-input v-model="targetForm.examTarget" placeholder="如：清华大学-计算机" />
            </el-form-item>
            <el-form-item label="每日刷题目标">
              <el-slider v-model="targetForm.dailyGoal" :min="10" :max="200" :step="10" show-stops />
              <span style="margin-left: 16px">{{ targetForm.dailyGoal }} 题/天</span>
            </el-form-item>
            <el-form-item label="每周学习天数">
              <el-slider v-model="targetForm.weeklyDays" :min="3" :max="7" show-stops />
              <span style="margin-left: 16px">{{ targetForm.weeklyDays }} 天/周</span>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveTarget">保存目标</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 账号安全 -->
        <el-card class="security-card" shadow="hover">
          <template #header>
            <span>🔐 账号安全</span>
          </template>

          <div class="security-item">
            <div class="item-info">
              <el-icon><Lock /></el-icon>
              <span class="label">密码</span>
              <span class="status">已设置</span>
            </div>
            <el-button link type="primary" @click="showPasswordDialog = true">修改</el-button>
          </div>

          <div class="security-item">
            <div class="item-info">
              <el-icon><Iphone /></el-icon>
              <span class="label">手机绑定</span>
              <span class="status" :class="{ 'not-bind': !userInfo.phone }">
                {{ userInfo.phone ? '已绑定' : '未绑定' }}
              </span>
            </div>
            <el-button link type="primary" @click="showPhoneDialog = true">
              {{ userInfo.phone ? '更换' : '绑定' }}
            </el-button>
          </div>

          <div class="security-item">
            <div class="item-info">
              <el-icon><Message /></el-icon>
              <span class="label">邮箱</span>
              <span class="status">{{ userInfo.email ? '已验证' : '未验证' }}</span>
            </div>
            <el-button link type="primary" v-if="!userInfo.emailVerified" @click="verifyEmail">
              验证
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 编辑资料对话框 -->
    <el-dialog v-model="showEditDialog" title="编辑资料" width="500px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="头像">
          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :before-upload="handleAvatarUpload"
          >
            <el-avatar :size="80" :src="editForm.avatar">
              <el-icon :size="40"><User /></el-icon>
            </el-avatar>
            <el-button link type="primary" style="margin-left: 16px">更换头像</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="editForm.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="editForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="考研目标">
          <el-input v-model="editForm.examTarget" placeholder="请输入目标院校和专业" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="saveProfile">保存</el-button>
      </template>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="showPasswordDialog" title="修改密码" width="400px">
      <el-form :model="passwordForm" label-width="80px">
        <el-form-item label="原密码">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="passwordForm.newPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="changePassword">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import dayjs from 'dayjs'

const userStore = useUserStore()

// 用户信息
const userInfo = reactive({
  id: 1,
  username: 'student001',
  nickname: '考研人',
  avatar: '',
  email: 'student@example.com',
  emailVerified: true,
  phone: '138****1234',
  createTime: '2024-01-15',
  examTarget: '清华大学-计算机科学与技术'
})

// 用户统计
const userStats = reactive({
  studyDays: 45,
  totalQuestions: 1234,
  accuracy: 72.5
})

// 目标表单
const targetForm = reactive({
  examTarget: '清华大学-计算机科学与技术',
  dailyGoal: 50,
  weeklyDays: 6
})

// 编辑表单
const editForm = reactive({
  avatar: '',
  nickname: '',
  phone: '',
  examTarget: ''
})

// 密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 对话框
const showEditDialog = ref(false)
const showPasswordDialog = ref(false)
const showPhoneDialog = ref(false)

// 图表
const progressChartRef = ref(null)

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY年MM月DD日')
}

// 渲染进度图表
const renderProgressChart = () => {
  if (!progressChartRef.value) return

  const chart = echarts.init(progressChartRef.value)

  const dates = []
  const counts = []
  for (let i = 6; i >= 0; i--) {
    dates.push(dayjs().subtract(i, 'day').format('MM-DD'))
    counts.push(Math.floor(Math.random() * 30) + 30)
  }

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: dates
    },
    yAxis: {
      type: 'value',
      name: '刷题数量'
    },
    series: [{
      data: counts,
      type: 'line',
      smooth: true,
      lineStyle: {
        color: '#409EFF',
        width: 3
      },
      areaStyle: {
        color: 'rgba(64, 158, 255, 0.2)'
      },
      symbol: 'circle',
      symbolSize: 8
    }]
  }

  chart.setOption(option)

  window.addEventListener('resize', () => {
    chart.resize()
  })
}

// 保存目标
const saveTarget = () => {
  userInfo.examTarget = targetForm.examTarget
  ElMessage.success('学习目标已保存')
}

// 打开编辑对话框
const openEditDialog = () => {
  editForm.avatar = userInfo.avatar
  editForm.nickname = userInfo.nickname
  editForm.phone = userInfo.phone
  editForm.examTarget = userInfo.examTarget
  showEditDialog.value = true
}

// 保存资料
const saveProfile = () => {
  userInfo.nickname = editForm.nickname
  userInfo.phone = editForm.phone
  userInfo.examTarget = editForm.examTarget
  targetForm.examTarget = editForm.examTarget
  showEditDialog.value = false
  ElMessage.success('资料已保存')
}

// 修改密码
const changePassword = () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    ElMessage.error('两次输入的密码不一致')
    return
  }
  if (passwordForm.newPassword.length < 6) {
    ElMessage.error('密码长度不能少于6位')
    return
  }
  showPasswordDialog.value = false
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  ElMessage.success('密码修改成功')
}

// 验证邮箱
const verifyEmail = () => {
  ElMessage.info('验证邮件已发送，请查收')
}

// 头像上传
const handleAvatarUpload = (file) => {
  ElMessage.info('头像上传功能开发中')
  return false
}

onMounted(() => {
  renderProgressChart()
})
</script>

<style lang="scss" scoped>
.profile {
  .user-card {
    text-align: center;

    .user-header {
      padding: 20px 0;

      h3 {
        margin: 16px 0 8px;
        color: #333;
      }

      p {
        color: #999;
      }
    }

    .user-stats {
      .stat-item {
        .value {
          font-size: 24px;
          font-weight: bold;
          color: #333;
        }

        .label {
          font-size: 13px;
          color: #999;
          margin-top: 4px;
        }
      }
    }

    .user-info-list {
      .info-item {
        display: flex;
        align-items: center;
        padding: 10px 0;

        .el-icon {
          margin-right: 10px;
          color: #999;
        }

        .label {
          width: 70px;
          color: #666;
          text-align: left;
        }

        .value {
          flex: 1;
          color: #333;
          text-align: right;
        }
      }
    }
  }

  .progress-card {
    margin-bottom: 20px;

    .chart-container {
      height: 250px;
    }
  }

  .target-card {
    margin-bottom: 20px;
  }

  .security-card {
    .security-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 0;
      border-bottom: 1px solid #eee;

      &:last-child {
        border-bottom: none;
      }

      .item-info {
        display: flex;
        align-items: center;

        .el-icon {
          margin-right: 10px;
          color: #999;
        }

        .label {
          margin-right: 16px;
          color: #666;
        }

        .status {
          color: #67C23A;

          &.not-bind {
            color: #F56C6C;
          }
        }
      }
    }
  }
}
</style>