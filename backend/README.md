# 考研智能刷题系统 - 后端服务

## 技术栈

- Node.js
- Express.js
- MySQL
- JWT 认证
- Bcrypt 密码加密

## 安装依赖

```bash
npm install
```

## 配置环境变量

复制 `.env.example` 到 `.env` 并修改配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 服务器配置
PORT=3001
NODE_ENV=development

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=smart_exam
DB_USER=root
DB_PASSWORD=your_password

# JWT 配置
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# CORS 配置
CORS_ORIGIN=http://localhost:3000
```

## 数据库初始化

1. 创建数据库：
```bash
mysql -u root -p < database/init.sql
```

2. 或手动执行 SQL 文件：
```bash
mysql -u root -p
source database/init.sql
```

## 启动服务

### 开发模式
```bash
npm run dev
```

### 生产模式
```bash
npm start
```

## API 文档

### 认证相关

#### 注册
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "password": "123456",
  "nickname": "测试用户"
}
```

#### 登录
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "123456"
}
```

#### 获取当前用户信息
```
GET /api/auth/current
Authorization: Bearer <token>
```

### 题目相关

#### 获取学科列表
```
GET /api/questions/subjects
```

#### 获取章节列表
```
GET /api/questions/chapters?subjectId=1
```

#### 获取知识点列表
```
GET /api/questions/knowledge?subjectId=1
```

#### 获取题目详情
```
GET /api/questions/:id
Authorization: Bearer <token>
```

#### 获取练习题目
```
GET /api/questions/practice/questions?knowledgeId=2&count=10&difficulty=0
Authorization: Bearer <token>
```

#### 提交答案
```
POST /api/questions/answer
Authorization: Bearer <token>
Content-Type: application/json

{
  "answers": [
    {
      "questionId": 1,
      "userAnswer": "B"
    }
  ],
  "elapsed_time": 300
}
```

### 复习相关

#### 获取今日复习任务
```
GET /api/review/tasks
Authorization: Bearer <token>
```

#### 获取复习题目
```
GET /api/review/questions?knowledgeId=2&count=5
Authorization: Bearer <token>
```

#### 提交复习结果
```
POST /api/review/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "results": [
    {
      "questionId": 1,
      "isCorrect": true
    }
  ]
}
```

### 错题本相关

#### 获取错题本列表
```
GET /api/notebook?folderId=1&mastered=false&search=关键词
Authorization: Bearer <token>
```

#### 添加错题
```
POST /api/notebook
Authorization: Bearer <token>
Content-Type: application/json

{
  "questionId": 1,
  "knowledgeId": 2
}
```

#### 创建文件夹
```
POST /api/notebook/folders
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "重要错题",
  "parentId": null
}
```

#### 移动错题
```
PUT /api/notebook/:id/move
Authorization: Bearer <token>
Content-Type: application/json

{
  "folderId": 2
}
```

### 分析相关

#### 获取整体统计
```
GET /api/analysis/stats?subjectId=1
Authorization: Bearer <token>
```

#### 获取知识点掌握情况
```
GET /api/analysis/knowledge?subjectId=1
Authorization: Bearer <token>
```

#### 获取薄弱知识点
```
GET /api/analysis/weak?subjectId=1&limit=5
Authorization: Bearer <token>
```

#### 获取知识图谱
```
GET /api/analysis/tree?subjectId=1
Authorization: Bearer <token>
```

#### 获取雷达图数据
```
GET /api/analysis/radar?subjectId=1
Authorization: Bearer <token>
```

## 数据库结构

详见 `docs/database-design.md`

## 错误处理

所有 API 响应统一格式：

### 成功响应
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {}
}
```

### 错误响应
```json
{
  "code": 400,
  "message": "错误信息",
  "errors": []
}
```

## 开发说明

1. 代码遵循 RESTful API 设计规范
2. 所有需要认证的接口都需要在请求头中携带 JWT token
3. 数据库操作使用 prepared statements 防止 SQL 注入
4. 密码使用 bcrypt 加密存储
5. 敏感操作需要二次验证

## 部署建议

1. 使用 PM2 进行进程管理
2. 配置 Nginx 反向代理
3. 启用 HTTPS
4. 配置数据库主从复制
5. 设置日志轮转
6. 配置自动备份

## 测试

```bash
npm test
```

## 许可证

MIT
