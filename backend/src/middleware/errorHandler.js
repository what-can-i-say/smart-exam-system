const errorHandler = (err, req, res, next) => {
  console.error('错误:', err);

  // 数据库错误
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({
      code: 400,
      message: '数据已存在'
    });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      code: 400,
      message: '关联数据不存在'
    });
  }

  // JWT 错误
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      code: 401,
      message: '无效的认证令牌'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      code: 401,
      message: '认证令牌已过期'
    });
  }

  // 验证错误
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      code: 400,
      message: err.message,
      errors: err.errors
    });
  }

  // 默认错误
  const statusCode = err.statusCode || 500;
  const message = err.message || '服务器内部错误';

  res.status(statusCode).json({
    code: statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
