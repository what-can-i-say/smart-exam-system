# 考研智能刷题系统 - 数据库设计文档

## 1. 数据库概述

本系统采用 MySQL 数据库，设计遵循第三范式，确保数据一致性和完整性。

## 2. 数据库表结构

### 2.1 用户表 (users)

| 字段名 | 类型 | 长度 | 允许为空 | 默认值 | 说明 |
|--------|------|------|----------|--------|------|
| id | BIGINT | 20 | 否 | AUTO_INCREMENT | 用户ID，主键 |
| username | VARCHAR | 50 | 否 | | 用户名，唯一 |
| password | VARCHAR | 255 | 否 | | 密码，加密存储 |
| nickname | VARCHAR | 50 | 否 | | 昵称 |
| avatar | VARCHAR | 255 | 是 | NULL | 头像URL |
| email | VARCHAR | 100 | 是 | NULL | 邮箱 |
| email_verified | TINYINT | 1 | 否 | 0 | 邮箱是否验证 |
| phone | VARCHAR | 20 | 是 | NULL | 手机号 |
| exam_target | VARCHAR | 100 | 是 | NULL | 考研目标 |
| daily_goal | INT | 11 | 否 | 50 | 每日刷题目标 |
| weekly_days | TINYINT | 1 | 否 | 6 | 每周学习天数 |
| status | TINYINT | 1 | 否 | 1 | 状态：1-正常，0-禁用 |
| create_time | DATETIME | | 否 | CURRENT_TIMESTAMP | 创建时间 |
| update_time | DATETIME | | 否 | CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

**索引：**
- PRIMARY KEY (id)
- UNIQUE KEY idx_username (username)
- INDEX idx_email (email)
- INDEX idx_phone (phone)

### 2.2 学科表 (subjects)

| 字段名 | 类型 | 长度 | 允许为空 | 默认值 | 说明 |
|--------|------|------|----------|--------|------|
| id | INT | 11 | 否 | AUTO_INCREMENT | 学科ID，主键 |
| name | VARCHAR | 50 | 否 | | 学科名称 |
| code | VARCHAR | 20 | 否 | | 学科代码 |
| icon | VARCHAR | 10 | 否 | | 图标 |
| description | TEXT | | 是 | NULL | 描述 |
| sort_order | INT | 11 | 否 | 0 | 排序 |
| status | TINYINT | 1 | 否 | 1 | 状态：1-启用，0-禁用 |
| create_time | DATETIME | | 否 | CURRENT_TIMESTAMP | 创建时间 |

**索引：**
- PRIMARY KEY (id)
- UNIQUE KEY idx_code (code)

### 2.3 章节表 (chapters)

| 字段名 | 类型 | 长度 | 允许为空 | 默认值 | 说明 |
|--------|------|------|----------|--------|------|
| id | INT | 11 | 否 | AUTO_INCREMENT | 章节ID，主键 |
| subject_id | INT | 11 | 否 | | 所属学科ID |
| name | VARCHAR | 100 | 否 | | 章节名称 |
| description | TEXT | | 是 | NULL | 描述 |
| sort_order | INT | 11 | 否 | 0 | 排序 |
| status | TINYINT | 1 | 否 | 1 | 状态：1-启用，0-禁用 |
| create_time | DATETIME | | 否 | CURRENT_TIMESTAMP | 创建时间 |

**索引：**
- PRIMARY KEY (id)
- INDEX idx_subject_id (subject_id)

### 2.4 知识点表 (knowledge_points)

| 字段名 | 类型 | 长度 | 允许为空 | 默认值 | 说明 |
|--------|------|------|----------|--------|------|
| id | INT | 11 | 否 | AUTO_INCREMENT | 知识点ID，主键 |
| chapter_id | INT | 11 | 否 | | 所属章节ID |
| name | VARCHAR | 100 | 否 | | 知识点名称 |
| description | TEXT | | 是 | NULL | 描述 |
| sort_order | INT | 11 | 否 | 0 | 排序 |
| status | TINYINT | 1 | 否 | 1 | 状态：1-启用，0-禁用 |
| create_time | DATETIME | | 否 | CURRENT_TIMESTAMP | 创建时间 |

**索引：**
- PRIMARY KEY (id)
- INDEX idx_chapter_id (chapter_id)

### 2.5 题目表 (questions)

| 字段名 | 类型 | 长度 | 允许为空 | 默认值 | 说明 |
|--------|------|------|----------|--------|------|
| id | BIGINT | 20 | 否 | AUTO_INCREMENT | 题目ID，主键 |
| knowledge_id | INT | 11 | 否 | | 所属知识点ID |
| type | TINYINT | 1 | 否 | 1 | 题型：1-单选，2-多选，3-判断 |
| difficulty | TINYINT | 1 | 否 | 1 | 难度：1-简单，2-中等，3-困难 |
| content | TEXT | | 否 | | 题目内容 |
| options | JSON | | 是 | NULL | 选项（JSON格式） |
| answer | VARCHAR | 50 | 否 | | 正确答案 |
| analysis | TEXT | | 是 | NULL | 解析 |
| source | VARCHAR | 100 | 是 | NULL | 题目来源 |
| year | INT | 4 | 是 | NULL | 年份 |
| view_count | INT | 11 | 否 | 0 | 查看次数 |
| correct_count | INT | 11 | 否 | 0 | 正确次数 |
| wrong_count | INT | 11 | 否 | 0 | 错误次数 |
| status | TINYINT | 1 | 否 | 1 | 状态：1-启用，0-禁用 |
| create_time | DATETIME | | 否 | CURRENT_TIMESTAMP | 创建时间 |
| update_time | DATETIME | | 否 | CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

**索引：**
- PRIMARY KEY (id)
- INDEX idx_knowledge_id (knowledge_id)
- INDEX idx_type (type)
- INDEX idx_difficulty (difficulty)
- INDEX idx_year (year)

### 2.6 练习记录表 (practice_records)

| 字段名 | 类型 | 长度 | 允许为空 | 默认值 | 说明 |
|--------|------|------|----------|--------|------|
| id | BIGINT | 20 | 否 | AUTO_INCREMENT | 记录ID，主键 |
| user_id | BIGINT | 20 | 否 | | 用户ID |
| subject_id | INT | 11 | 否 | | 学科ID |
| knowledge_id | INT | 11 | 否 | | 知识点ID |
| question_count | INT | 11 | 否 | 0 | 题目数量 |
| correct_count | INT | 11 | 否 | 0 | 正确数量 |
| accuracy | DECIMAL | 5,2 | 否 | 0.00 | 正确率 |
| elapsed_time | INT | 11 | 否 | 0 | 用时（秒） |
| practice_date | DATE | | 否 | CURRENT_DATE | 练习日期 |
| create_time | DATETIME | | 否 | CURRENT_TIMESTAMP | 创建时间 |

**索引：**
- PRIMARY KEY (id)
- INDEX idx_user_id (user_id)
- INDEX idx_practice_date (practice_date)
- INDEX idx_knowledge_id (knowledge_id)

### 2.7 复习记录表 (review_records)

| 字段名 | 类型 | 长度 | 允许为空 | 默认值 | 说明 |
|--------|------|------|----------|--------|------|
| id | BIGINT | 20 | 否 | AUTO_INCREMENT | 记录ID，主键 |
| user_id | BIGINT | 20 | 否 | | 用户ID |
| question_id | BIGINT | 20 | 否 | | 题目ID |
| knowledge_id | INT | 11 | 否 | | 知识点ID |
| review_stage | TINYINT | 1 | 否 | 1 | 复习阶段（1-9） |
| correct_count | INT | 11 | 否 | 0 | 正确次数 |
| total_review_count | INT | 11 | 否 | 1 | 总复习次数 |
| memory_level | INT | 11 | 否 | 50 | 记忆水平（0-100） |
| last_review_time | DATETIME | | 否 | CURRENT_TIMESTAMP | 上次复习时间 |
| next_review_time | DATETIME | | 否 | | 下次复习时间 |
| status | TINYINT | 1 | 否 | 0 | 状态：0-待复习，1-已完成，2-已掌握 |

**索引：**
- PRIMARY KEY (id)
- INDEX idx_user_id (user_id)
- INDEX idx_question_id (question_id)
- INDEX idx_next_review_time (next_review_time)
- INDEX idx_status (status)

### 2.8 错题本表 (notebook)

| 字段名 | 类型 | 长度 | 允许为空 | 默认值 | 说明 |
|--------|------|------|----------|--------|------|
| id | BIGINT | 20 | 否 | AUTO_INCREMENT | 记录ID，主键 |
| user_id | BIGINT | 20 | 否 | | 用户ID |
| question_id | BIGINT | 20 | 否 | | 题目ID |
| knowledge_id | INT | 11 | 否 | | 知识点ID |
| folder_id | BIGINT | 20 | 否 | 1 | 文件夹ID |
| wrong_count | INT | 11 | 否 | 1 | 错误次数 |
| last_wrong_time | DATETIME | | 否 | CURRENT_TIMESTAMP | 最后错误时间 |
| mastered | TINYINT | 1 | 否 | 0 | 是否掌握：0-否，1-是 |
| notes | TEXT | | 是 | NULL | 笔记 |
| tags | JSON | | 是 | NULL | 标签（JSON数组） |
| create_time | DATETIME | | 否 | CURRENT_TIMESTAMP | 创建时间 |
| update_time | DATETIME | | 否 | CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

**索引：**
- PRIMARY KEY (id)
- UNIQUE KEY idx_user_question (user_id, question_id)
- INDEX idx_user_id (user_id)
- INDEX idx_folder_id (folder_id)
- INDEX idx_mastered (mastered)

### 2.9 错题文件夹表 (notebook_folders)

| 字段名 | 类型 | 长度 | 允许为空 | 默认值 | 说明 |
|--------|------|------|----------|--------|------|
| id | BIGINT | 20 | 否 | AUTO_INCREMENT | 文件夹ID，主键 |
| user_id | BIGINT | 20 | 否 | | 用户ID |
| parent_id | BIGINT | 20 | 是 | NULL | 父文件夹ID |
| name | VARCHAR | 50 | 否 | | 文件夹名称 |
| icon | VARCHAR | 20 | 否 | 'folder' | 图标 |
| sort_order | INT | 11 | 否 | 0 | 排序 |
| create_time | DATETIME | | 否 | CURRENT_TIMESTAMP | 创建时间 |

**索引：**
- PRIMARY KEY (id)
- INDEX idx_user_id (user_id)
- INDEX idx_parent_id (parent_id)

### 2.10 连续复习记录表 (review_continuous)

| 字段名 | 类型 | 长度 | 允许为空 | 默认值 | 说明 |
|--------|------|------|----------|--------|------|
| id | BIGINT | 20 | 否 | AUTO_INCREMENT | 记录ID，主键 |
| user_id | BIGINT | 20 | 否 | | 用户ID |
| continuous_days | INT | 11 | 否 | 1 | 连续天数 |
| last_review_date | DATE | | 否 | CURRENT_DATE | 最后复习日期 |
| update_time | DATETIME | | 否 | CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

**索引：**
- PRIMARY KEY (id)
- UNIQUE KEY idx_user_id (user_id)

## 3. 初始化数据

### 3.1 学科数据

```sql
INSERT INTO subjects (name, code, icon, description, sort_order) VALUES
('高等数学', 'MATH', '📐', '考研数学高等数学部分', 1),
('英语', 'ENG', '📖', '考研英语', 2),
('政治', 'POL', '📰', '考研政治', 3),
('计算机专业基础', 'CS', '💻', '计算机考研专业课', 4);
```

### 3.2 章节数据（示例）

```sql
INSERT INTO chapters (subject_id, name, sort_order) VALUES
(1, '第一章 函数与极限', 1),
(1, '第二章 导数与微分', 2),
(1, '第三章 微分中值定理', 3),
(1, '第四章 不定积分', 4),
(1, '第五章 定积分', 5),
(2, '考研核心词汇', 1),
(2, '阅读理解', 2),
(2, '完形填空', 3),
(2, '翻译', 4),
(2, '写作', 5),
(3, '马克思主义基本原理', 1),
(3, '毛泽东思想和中国特色社会主义', 2),
(3, '中国近现代史纲要', 3),
(3, '思想道德修养与法律基础', 4),
(4, '数据结构', 1),
(4, '计算机组成原理', 2),
(4, '操作系统', 3),
(4, '计算机网络', 4);
```

### 3.3 知识点数据（示例）

```sql
INSERT INTO knowledge_points (chapter_id, name, sort_order) VALUES
(1, '函数的概念与性质', 1),
(1, '极限的定义', 2),
(1, '极限的运算法则', 3),
(1, '两个重要极限', 4),
(1, '无穷小与无穷大', 5),
(1, '函数的连续性', 6);
```

## 4. 数据库建表脚本

见 `backend/database/init.sql`

## 5. 备份策略

- 每日凌晨2点自动备份
- 保留最近30天的备份
- 备份文件命名：`smart_exam_YYYYMMDD.sql`
