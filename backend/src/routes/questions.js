const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { auth, optionalAuth } = require('../middleware/auth');

// 获取学科列表
router.get('/subjects', optionalAuth, questionController.getSubjects);

// 获取章节列表
router.get('/chapters', optionalAuth, questionController.getChapters);

// 获取知识点列表
router.get('/knowledge', optionalAuth, questionController.getKnowledgePoints);

// 获取题目详情
router.get('/:id', optionalAuth, questionController.getQuestionDetail);

// 获取练习题目
router.get('/practice/questions', auth, questionController.getPracticeQuestions);

// 提交答案
router.post('/answer', auth, questionController.submitAnswer);

// 获取题目统计
router.get('/stats', optionalAuth, questionController.getQuestionStats);

module.exports = router;
