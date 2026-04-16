const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// 注册
router.post('/register', authController.registerValidation, authController.register);

// 登录
router.post('/login', authController.loginValidation, authController.login);

// 获取当前用户信息
router.get('/current', auth, authController.getCurrentUser);

// 更新用户信息
router.put('/profile', auth, authController.updateProfile);

// 修改密码
router.put('/password', auth, authController.changePasswordValidation, authController.changePassword);

module.exports = router;
