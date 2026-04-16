const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');
const { auth } = require('../middleware/auth');

// 获取整体统计
router.get('/stats', auth, analysisController.getOverallStats);

// 获取知识点掌握情况
router.get('/knowledge', auth, analysisController.getKnowledgeMastery);

// 获取薄弱知识点
router.get('/weak', auth, analysisController.getWeakKnowledge);

// 获取知识图谱
router.get('/tree', auth, analysisController.getKnowledgeTree);

// 获取雷达图数据
router.get('/radar', auth, analysisController.getRadarChart);

module.exports = router;
