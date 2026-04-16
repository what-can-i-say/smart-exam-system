# 🚀 快速启动指南

## 一键启动

### Windows 用户
```bash
# 双击运行
scripts\deploy.bat
```

### Mac/Linux 用户
```bash
# 给脚本权限
chmod +x scripts/deploy.sh

# 运行脚本
./scripts/deploy.sh
```

## 手动启动

1. **准备数据库**
   ```bash
   mysql -u root -p -e "CREATE DATABASE smart_exam DEFAULT CHARSET utf8mb4;"
   mysql -u root -p smart_exam < backend/database/init.sql
   ```

2. **启动后端**（新终端）
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # 编辑 .env 文件
   npm run dev
   ```

3. **启动前端**（另一个终端）
   ```bash
   cd frontend
   npm install
   echo "VITE_API_BASE_URL=http://localhost:3001/api" > .env.local
   npm run dev
   ```

## 访问系统

- 前端地址：http://localhost:3000
- 后端API：http://localhost:3001/api
- API文档：http://localhost:3001/api-docs

## 默认账户

任意用户名和密码即可登录（测试模式）