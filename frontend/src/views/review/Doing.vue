<template>
  <div class="review-doing">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>📝 复习答题</span>
          <el-button @click="$router.push('/review')">返回任务列表</el-button>
        </div>
      </template>
      
      <div class="doing-content">
        <p style="text-align: center; padding: 40px; color: #999;">
          复习答题功能开发中，敬请期待...
        </p>
      </div>
    </el-card>
  </div>
</template>

<script setup>
// 复习答题页面
</script>

<style scoped>
.review-doing {
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>