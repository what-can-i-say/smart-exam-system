// 学科数据
export const subjects = [
  { id: 1, name: '高等数学', code: 'MATH', icon: '📐' },
  { id: 2, name: '英语', code: 'ENG', icon: '📖' },
  { id: 3, name: '政治', code: 'POL', icon: '📰' },
  { id: 4, name: '计算机专业基础', code: 'CS', icon: '💻' }
]

// 章节数据
export const chapters = {
  1: [ // 高等数学
    { id: 101, name: '第一章 函数与极限', subjectId: 1 },
    { id: 102, name: '第二章 导数与微分', subjectId: 1 },
    { id: 103, name: '第三章 微分中值定理', subjectId: 1 },
    { id: 104, name: '第四章 不定积分', subjectId: 1 },
    { id: 105, name: '第五章 定积分', subjectId: 1 }
  ],
  2: [ // 英语
    { id: 201, name: '考研核心词汇', subjectId: 2 },
    { id: 202, name: '阅读理解', subjectId: 2 },
    { id: 203, name: '完形填空', subjectId: 2 },
    { id: 204, name: '翻译', subjectId: 2 },
    { id: 205, name: '写作', subjectId: 2 }
  ],
  3: [ // 政治
    { id: 301, name: '马克思主义基本原理', subjectId: 3 },
    { id: 302, name: '毛泽东思想和中国特色社会主义', subjectId: 3 },
    { id: 303, name: '中国近现代史纲要', subjectId: 3 },
    { id: 304, name: '思想道德修养与法律基础', subjectId: 3 }
  ],
  4: [ // 计算机
    { id: 401, name: '数据结构', subjectId: 4 },
    { id: 402, name: '计算机组成原理', subjectId: 4 },
    { id: 403, name: '操作系统', subjectId: 4 },
    { id: 404, name: '计算机网络', subjectId: 4 }
  ]
}

// 知识点数据
export const knowledgePoints = {
  101: [ // 函数与极限
    { id: 10101, name: '函数的概念与性质', chapterId: 101 },
    { id: 10102, name: '极限的定义', chapterId: 101 },
    { id: 10103, name: '极限的运算法则', chapterId: 101 },
    { id: 10104, name: '两个重要极限', chapterId: 101 },
    { id: 10105, name: '无穷小与无穷大', chapterId: 101 },
    { id: 10106, name: '函数的连续性', chapterId: 101 }
  ],
  102: [ // 导数与微分
    { id: 10201, name: '导数的定义', chapterId: 102 },
    { id: 10202, name: '求导法则', chapterId: 102 },
    { id: 10203, name: '高阶导数', chapterId: 102 },
    { id: 10204, name: '隐函数求导', chapterId: 102 },
    { id: 10205, name: '微分的概念', chapterId: 102 }
  ],
  201: [ // 考研核心词汇
    { id: 20101, name: '高频词汇 A-D', chapterId: 201 },
    { id: 20102, name: '高频词汇 E-H', chapterId: 201 },
    { id: 20103, name: '高频词汇 I-M', chapterId: 201 },
    { id: 20104, name: '高频词汇 N-R', chapterId: 201 },
    { id: 20105, name: '高频词汇 S-Z', chapterId: 201 }
  ],
  301: [ // 马原
    { id: 30101, name: '世界的物质性及发展规律', chapterId: 301 },
    { id: 30102, name: '实践与认识及其发展规律', chapterId: 301 },
    { id: 30103, name: '人类社会及其发展规律', chapterId: 301 },
    { id: 30104, name: '资本主义的本质及规律', chapterId: 301 }
  ],
  401: [ // 数据结构
    { id: 40101, name: '线性表', chapterId: 401 },
    { id: 40102, name: '栈和队列', chapterId: 401 },
    { id: 40103, name: '树与二叉树', chapterId: 401 },
    { id: 40104, name: '图', chapterId: 401 },
    { id: 40105, name: '查找', chapterId: 401 },
    { id: 40106, name: '排序', chapterId: 401 }
  ]
}