const jwt = require('jsonwebtoken');

// JWT 验证中间件
const auth = (req, res, next) => {
  try {
    // 从请求头获取 token
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        code: 401,
        message: '未提供认证令牌'
      });
    }

    // 验证 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 将用户信息添加到请求对象
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      code: 401,
      message: '无效的认证令牌'
    });
  }
};

// 可选认证中间件（不强制要求登录）
const optionalAuth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    }

    next();
  } catch (error) {
    // token 无效但不阻塞请求
    next();
  }
};

module.exports = { auth, optionalAuth };
