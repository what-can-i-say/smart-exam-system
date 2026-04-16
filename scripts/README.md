# 部署脚本说明

本目录包含自动化部署脚本，帮助用户快速在本地运行考研智能刷题系统。

## 📁 文件说明

- `deploy.sh` - macOS/Linux (WSL2) 部署脚本
- `deploy.bat` - Windows 部署脚本
- `quick-start.md` - 快速启动指南

## 🚀 使用方法

### Windows 用户

1. 双击运行 `deploy.bat`
2. 按提示输入 MySQL root 密码
3. 脚本会自动：
   - 检查依赖环境
   - 创建数据库
   - 安装前后端依赖
   - 启动服务

### macOS/Linux 用户

```bash
# 给脚本执行权限
chmod +x deploy.sh

# 运行部署脚本
./deploy.sh
```

## 📋 系统要求

- Node.js >= 16.0.0
- npm >= 8.0.0
- MySQL >= 8.0.0
- MySQL root 密码

## 🛠️ 手动部署（如果脚本失败）

如果自动部署失败，可以按以下步骤手动部署：

1. **创建数据库**
   ```bash
   mysql -u root -p -e "CREATE DATABASE smart_exam DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   ```

2. **安装后端依赖**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # 编辑 .env 文件配置数据库连接
   npm run dev
   ```

3. **安装前端依赖**
   ```bash
   cd frontend
   npm install
   echo "VITE_API_BASE_URL=http://localhost:3001/api" > .env.local
   npm run dev
   ```

## ⚠️ 注意事项

1. **MySQL 服务**：确保 MySQL 服务正在运行
2. **端口占用**：默认使用 3000 和 3001 端口，确保未被占用
3. **防火墙**：如果有防火墙，可能需要开放这些端口
4. **密码安全**：不要在公共场所输入数据库密码

## 🔧 故障排除

### 常见问题

1. **MySQL 连接失败**
   - 检查 MySQL 服务是否启动
   - 验证 root 密码是否正确
   - 确认 MySQL 用户权限

2. **端口被占用**
   - 使用 `netstat -an | grep :3000` 检查端口
   - 修改 .env 文件中的端口号

3. **依赖安装失败**
   - 使用 `npm cache clean --force` 清理缓存
   - 删除 `node_modules` 后重新安装

## 📞 获取帮助

如果遇到问题，请：
1. 查看控制台错误信息
2. 检查系统要求
3. 参考上述故障排除指南
4. 提交 GitHub Issue