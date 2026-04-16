const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { auth } = require('../middleware/auth');

// 获取今日复习任务
router.get('/tasks', auth, reviewController.getTodayTasks);

// 获取复习题目
router.get('/questions', auth, reviewController.getReviewQuestions);

// 提交复习结果
router.post('/submit', auth, reviewController.submitReview);

// 获取复习统计
router.get('/stats', auth, reviewController.getReviewStats);

// 获取艾宾浩斯曲线数据
router.get('/ebbinghaus', auth, reviewController.getEbbinghausCurve);

module.exports = router;
