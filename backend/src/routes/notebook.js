const express = require('express');
const router = express.Router();
const notebookController = require('../controllers/notebookController');
const { auth } = require('../middleware/auth');

// 获取错题本列表
router.get('/', auth, notebookController.getNotebook);

// 获取文件夹列表
router.get('/folders', auth, notebookController.getFolders);

// 添加错题
router.post('/', auth, notebookController.addToNotebook);

// 创建文件夹
router.post('/folders', auth, notebookController.createFolder);

// 删除文件夹
router.delete('/folders/:id', auth, notebookController.deleteFolder);

// 移动错题
router.put('/:id/move', auth, notebookController.moveQuestion);

// 保存笔记
router.put('/:id/notes', auth, notebookController.saveNote);

// 标记掌握
router.put('/:id/mastered', auth, notebookController.toggleMastered);

// 删除错题
router.delete('/:id', auth, notebookController.deleteQuestion);

// 获取错题本统计
router.get('/stats', auth, notebookController.getNotebookStats);

module.exports = router;
