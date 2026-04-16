-- 考研智能刷题系统数据库初始化脚本

-- 创建数据库
CREATE DATABASE IF NOT EXISTS smart_exam DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smart_exam;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  nickname VARCHAR(50) NOT NULL,
  avatar VARCHAR(255),
  email VARCHAR(100),
  email_verified TINYINT(1) NOT NULL DEFAULT 0,
  phone VARCHAR(20),
  exam_target VARCHAR(100),
  daily_goal INT NOT NULL DEFAULT 50,
  weekly_days TINYINT NOT NULL DEFAULT 6,
  status TINYINT NOT NULL DEFAULT 1,
  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_email (email),
  INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 学科表
CREATE TABLE IF NOT EXISTS subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  code VARCHAR(20) NOT NULL UNIQUE,
  icon VARCHAR(10) NOT NULL,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  status TINYINT NOT NULL DEFAULT 1,
  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 章节表
CREATE TABLE IF NOT EXISTS chapters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  status TINYINT NOT NULL DEFAULT 1,
  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  INDEX idx_subject_id (subject_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 知识点表
CREATE TABLE IF NOT EXISTS knowledge_points (
  id INT AUTO_INCREMENT PRIMARY KEY,
  chapter_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  status TINYINT NOT NULL DEFAULT 1,
  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
  INDEX idx_chapter_id (chapter_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 题目表
CREATE TABLE IF NOT EXISTS questions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  knowledge_id INT NOT NULL,
  type TINYINT NOT NULL DEFAULT 1 COMMENT '1-单选，2-多选，3-判断',
  difficulty TINYINT NOT NULL DEFAULT 1 COMMENT '1-简单，2-中等，3-困难',
  content TEXT NOT NULL,
  options JSON COMMENT '选项（JSON格式）',
  answer VARCHAR(50) NOT NULL,
  analysis TEXT,
  source VARCHAR(100),
  year INT,
  view_count INT NOT NULL DEFAULT 0,
  correct_count INT NOT NULL DEFAULT 0,
  wrong_count INT NOT NULL DEFAULT 0,
  status TINYINT NOT NULL DEFAULT 1,
  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (knowledge_id) REFERENCES knowledge_points(id) ON DELETE CASCADE,
  INDEX idx_knowledge_id (knowledge_id),
  INDEX idx_type (type),
  INDEX idx_difficulty (difficulty),
  INDEX idx_year (year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 练习记录表
CREATE TABLE IF NOT EXISTS practice_records (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  subject_id INT NOT NULL,
  knowledge_id INT NOT NULL,
  question_count INT NOT NULL DEFAULT 0,
  correct_count INT NOT NULL DEFAULT 0,
  accuracy DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  elapsed_time INT NOT NULL DEFAULT 0,
  practice_date DATE NOT NULL,
  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_practice_date (practice_date),
  INDEX idx_knowledge_id (knowledge_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 复习记录表
CREATE TABLE IF NOT EXISTS review_records (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  question_id BIGINT NOT NULL,
  knowledge_id INT NOT NULL,
  review_stage TINYINT NOT NULL DEFAULT 1 COMMENT '复习阶段（1-9）',
  correct_count INT NOT NULL DEFAULT 0,
  total_review_count INT NOT NULL DEFAULT 1,
  memory_level INT NOT NULL DEFAULT 50 COMMENT '记忆水平（0-100）',
  last_review_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  next_review_time DATETIME,
  status TINYINT NOT NULL DEFAULT 0 COMMENT '0-待复习，1-已完成，2-已掌握',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_question_id (question_id),
  INDEX idx_next_review_time (next_review_time),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 错题本表
CREATE TABLE IF NOT EXISTS notebook (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  question_id BIGINT NOT NULL,
  knowledge_id INT NOT NULL,
  folder_id BIGINT NOT NULL DEFAULT 1,
  wrong_count INT NOT NULL DEFAULT 1,
  last_wrong_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  mastered TINYINT NOT NULL DEFAULT 0 COMMENT '0-否，1-是',
  notes TEXT,
  tags JSON COMMENT '标签（JSON数组）',
  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  UNIQUE KEY idx_user_question (user_id, question_id),
  INDEX idx_user_id (user_id),
  INDEX idx_folder_id (folder_id),
  INDEX idx_mastered (mastered)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 错题文件夹表
CREATE TABLE IF NOT EXISTS notebook_folders (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  parent_id BIGINT,
  name VARCHAR(50) NOT NULL,
  icon VARCHAR(20) NOT NULL DEFAULT 'folder',
  sort_order INT NOT NULL DEFAULT 0,
  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 连续复习记录表
CREATE TABLE IF NOT EXISTS review_continuous (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE,
  continuous_days INT NOT NULL DEFAULT 1,
  last_review_date DATE NOT NULL DEFAULT CURRENT_DATE,
  update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入初始数据

-- 学科数据
INSERT INTO subjects (name, code, icon, description, sort_order) VALUES
('高等数学', 'MATH', '📐', '考研数学高等数学部分', 1),
('英语', 'ENG', '📖', '考研英语', 2),
('政治', 'POL', '📰', '考研政治', 3),
('计算机专业基础', 'CS', '💻', '计算机考研专业课', 4);

-- 章节数据
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

-- 知识点数据
INSERT INTO knowledge_points (chapter_id, name, sort_order) VALUES
(1, '函数的概念与性质', 1),
(1, '极限的定义', 2),
(1, '极限的运算法则', 3),
(1, '两个重要极限', 4),
(1, '无穷小与无穷大', 5),
(1, '函数的连续性', 6),
(2, '导数的定义', 1),
(2, '求导法则', 2),
(2, '高阶导数', 3),
(2, '隐函数求导', 4),
(2, '微分的概念', 5),
(6, '高频词汇 A-D', 1),
(6, '高频词汇 E-H', 2),
(6, '高频词汇 I-M', 3),
(6, '高频词汇 N-R', 4),
(6, '高频词汇 S-Z', 5),
(11, '世界的物质性及发展规律', 1),
(11, '实践与认识及其发展规律', 2),
(11, '人类社会及其发展规律', 3),
(11, '资本主义的本质及规律', 4),
(15, '线性表', 1),
(15, '栈和队列', 2),
(15, '树与二叉树', 3),
(15, '图', 4),
(15, '查找', 5),
(15, '排序', 6);

-- 示例题目数据
INSERT INTO questions (knowledge_id, type, difficulty, content, options, answer, analysis, source, year) VALUES
(2, 1, 1, '极限 lim(x→0) sinx/x 的值是？',
 '{"A": "0", "B": "1", "C": "-1", "D": "不存在"}',
 'B',
 '这是一个重要极限，lim(x→0) sinx/x = 1。可以通过夹逼定理或洛必达法则证明。',
 '考研真题', 2023),
(3, 1, 2, '极限 lim(x→0) (1 - cosx)/x² 的值是？',
 '{"A": "0", "B": "1/2", "C": "1", "D": "2"}',
 'B',
 '使用等价无穷小：1 - cosx ~ x²/2，所以极限为 1/2。',
 '考研真题', 2022),
(7, 1, 1, '函数 y = ln(x) 的导数是？',
 '{"A": "1/x", "B": "x", "C": "e^x", "D": "1/x²"}',
 'A',
 '(ln x)\\' = 1/x，这是基本导数公式。',
 '考研真题', 2023),
(17, 1, 2, '在单链表中，删除一个节点需要修改几个指针？',
 '{"A": "1个", "B": "2个", "C": "3个", "D": "0个"}',
 'A',
 '删除单链表节点只需修改其前驱节点的指针，指向被删节点的后继即可。',
 '考研真题', 2022);
