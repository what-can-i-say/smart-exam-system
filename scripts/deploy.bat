@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: 考研智能刷题系统 - Windows 本地部署脚本
:: 支持 Windows 10/11

echo ======================================
echo     考研智能刷题系统 - 本地部署脚本
echo ======================================
echo.

:: 颜色定义 (Windows 10+)
for /f %%i in ('echo prompt $E^| cmd') do set "ESC=%%i"
set "RED=%ESC%[91m"
set "GREEN=%ESC%[92m"
set "YELLOW=%ESC%[93m"
set "BLUE=%ESC%[94m"
set "NC=%ESC%[0m"

:: 打印带颜色的信息
:print_info
echo %BLUE%[INFO]%NC% %*
goto :eof

:print_success
echo %GREEN%[SUCCESS]%NC% %*
goto :eof

:print_warning
echo %YELLOW%[WARNING]%NC% %*
goto :eof

:print_error
echo %RED%[ERROR]%NC% %*
goto :eof

:: 检查命令是否存在
:check_command
where %1 >nul 2>&1
if errorlevel 1 (
    call :print_error "%1 未安装，请先安装 %1"
    pause
    exit /b 1
)
goto :eof

:: 检查依赖
:check_dependencies
call :print_info "检查运行环境..."

call :check_command "node"
call :check_command "npm"
call :check_command "mysql"

:: 检查 Node.js 版本
for /f "tokens=2" %%i in ('node -v') do set "NODE_VERSION=%%i"
set "NODE_MAJOR=!NODE_VERSION:~1,1!"
if !NODE_MAJOR! LSS 16 (
    call :print_error "Node.js 版本过低，需要 >= 16.0.0，当前版本: !NODE_VERSION!"
    pause
    exit /b 1
)

call :print_success "依赖检查通过"
goto :eof

:: 创建数据库
:create_database
call :print_info "准备创建数据库..."

set /p DB_PASSWORD="请输入 MySQL root 密码: "

:: 创建数据库
mysql -u root -p"%DB_PASSWORD%" -e "CREATE DATABASE IF NOT EXISTS smart_exam DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>nul

if errorlevel 1 (
    call :print_error "数据库创建失败，请检查密码是否正确"
    pause
    exit /b 1
)

call :print_success "数据库创建成功"
goto :eof

:: 安装后端依赖
:install_backend
call :print_info "安装后端依赖..."

cd backend

:: 检查是否存在 package-lock.json
if not exist "package-lock.json" (
    call :print_warning "正在生成 package-lock.json..."
    npm install
) else (
    npm install
)

:: 检查 .env 文件
if not exist ".env" (
    copy .env.example .env >nul
    call :print_info "已创建 .env 文件，请根据需要修改配置"
)

cd ..

call :print_success "后端依赖安装完成"
goto :eof

:: 安装前端依赖
:install_frontend
call :print_info "安装前端依赖..."

cd frontend

:: 检查是否存在 package-lock.json
if not exist "package-lock.json" (
    call :print_warning "正在生成 package-lock.json..."
    npm install
) else (
    npm install
)

:: 检查环境变量文件
if not exist ".env.local" (
    echo VITE_API_BASE_URL=http://localhost:3001/api > .env.local
    call :print_info "已创建 .env.local 文件"
)

cd ..

call :print_success "前端依赖安装完成"
goto :eof

:: 启动服务
:start_services
call :print_info "准备启动服务..."

:: 启动后端
start "后端服务" cmd /k "cd backend ^&^& npm run dev"

:: 等待后端启动
timeout /t 5 /nobreak >nul

call :print_success "后端服务正在启动..."
call :print_info "后端地址: http://localhost:3001"
call :print_info "API 文档: http://localhost:3001/api-docs"

:: 启动前端
start "前端服务" cmd /k "cd frontend ^&^& npm run dev"

call :print_success "前端服务正在启动..."
call :print_info "前端地址: http://localhost:3000"

echo.
call :print_success "🎉 所有服务启动完成！"
echo.
call :print_info "请在浏览器中打开 http://localhost:3000 访问系统"
echo.
call :print_warning "提示："
call :print_warning "1. 确保 MySQL 服务正在运行"
call :print_warning "2. 新打开的终端窗口中已启动服务"
call :print_warning "3. 关闭终端窗口即可停止服务"
call :print_warning "4. 数据库信息已在 backend/.env 中配置"

goto :eof

:: 主函数
:main
call :check_dependencies
call :create_database
call :install_backend
call :install_frontend
call :start_services

echo.
pause
exit /b 0

:: 运行主函数
call :main