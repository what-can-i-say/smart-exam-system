<template>
  <div class="review-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>🔄 智能复习</span>
          <span class="subtitle">基于艾宾浩斯遗忘曲线</span>
        </div>
      </template>
      
      <!-- 统计卡片 -->
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-value">12</div>
            <div class="stat-label">今日待复习</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-value">5</div>
            <div class="stat-label">今日已完成</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-value">7</div>
            <div class="stat-label">连续天数</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-value">72%</div>
            <div class="stat-label">记忆保持率</div>
          </div>
        </el-col>
      </el-row>
      
      <el-divider />
      
      <!-- 今日任务 -->
      <h3>📋 今日复习任务</h3>
      <el-table :data="tasks" style="width: 100%; margin-top: 20px">
        <el-table-column prop="knowledge" label="知识点" />
        <el-table-column prop="subject" label="学科" width="120" />
        <el-table-column prop="count" label="题目数" width="100" />
        <el-table-column prop="stage" label="复习阶段" width="120">
          <template #default="{ row }">
            <el-tag>第 {{ row.stage }} 次</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="memory" label="记忆水平" width="150">
          <template #default="{ row }">
            <el-progress :percentage="row.memory" :stroke-width="8" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default>
            <el-button type="primary" size="small">开始复习</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div style="margin-top: 30px; text-align: center">
        <el-button type="primary" @click="$router.push('/review/doing')">
          开始今日复习
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const tasks = ref([
  { knowledge: '极限与连续', subject: '高等数学', count: 8, stage: 3, memory: 45 },
  { knowledge: '考研核心词汇', subject: '英语', count: 20, stage: 2, memory: 72 },
  { knowledge: '马原第一章', subject: '政治', count: 12, stage: 4, memory: 85 }
])
</script>

<style scoped>
.review-page {
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.subtitle {
  font-size: 14px;
  color: #999;
  font-weight: normal;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #409EFF;
}

.stat-label {
  font-size: 13px;
  color: #999;
  margin-top: 5px;
}
</style>