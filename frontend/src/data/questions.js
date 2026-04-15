// 题库数据
export const questionBank = [
  // ==================== 高等数学 - 极限 ====================
  {
    id: 1,
    knowledgeId: 10102,
    type: 1, // 1-单选 2-多选 3-判断
    difficulty: 1,
    content: '极限 lim(x→0) sinx/x 的值是？',
    options: {
      A: '0',
      B: '1',
      C: '-1',
      D: '不存在'
    },
    answer: 'B',
    analysis: '这是一个重要极限，lim(x→0) sinx/x = 1。可以通过夹逼定理或洛必达法则证明。'
  },
  {
    id: 2,
    knowledgeId: 10102,
    type: 1,
    difficulty: 1,
    content: '函数 f(x) = (x² - 1)/(x - 1) 在 x→1 时的极限是？',
    options: {
      A: '0',
      B: '1',
      C: '2',
      D: '不存在'
    },
    answer: 'C',
    analysis: '当 x≠1 时，f(x) = x + 1，所以 x→1 时极限为 2。注意 x=1 时函数无定义，但极限存在。'
  },
  {
    id: 3,
    knowledgeId: 10103,
    type: 1,
    difficulty: 2,
    content: '极限 lim(x→0) (1 - cosx)/x² 的值是？',
    options: {
      A: '0',
      B: '1/2',
      C: '1',
      D: '2'
    },
    answer: 'B',
    analysis: '使用等价无穷小：1 - cosx ~ x²/2，所以极限为 1/2。'
  },
  {
    id: 4,
    knowledgeId: 10103,
    type: 1,
    difficulty: 2,
    content: '极限 lim(x→∞) (1 + 1/x)^x 的值是？',
    options: {
      A: '1',
      B: 'e',
      C: '1/e',
      D: '∞'
    },
    answer: 'B',
    analysis: '这是第二个重要极限，lim(x→∞) (1 + 1/x)^x = e。'
  },
  {
    id: 5,
    knowledgeId: 10104,
    type: 1,
    difficulty: 2,
    content: '当 x→0 时，下列哪个是 x 的高阶无穷小？',
    options: {
      A: 'sinx',
      B: 'tanx',
      C: 'x²',
      D: 'ln(1+x)'
    },
    answer: 'C',
    analysis: 'sinx ~ x，tanx ~ x，ln(1+x) ~ x，都是 x 的同阶无穷小。x² 是 x 的高阶无穷小。'
  },
  {
    id: 6,
    knowledgeId: 10105,
    type: 2, // 多选题
    difficulty: 2,
    content: '下列哪些是无穷小量（当 x→0 时）？',
    options: {
      A: 'x²',
      B: 'sinx',
      C: '1 - cosx',
      D: 'e^x - 1'
    },
    answer: 'ABCD',
    analysis: '当 x→0 时，x²→0，sinx→0，1-cosx→0，e^x-1→0，都是无穷小量。'
  },
  {
    id: 7,
    knowledgeId: 10106,
    type: 1,
    difficulty: 3,
    content: '函数 f(x) = |x|/x 在 x=0 处的连续性如何？',
    options: {
      A: '连续',
      B: '可去间断点',
      C: '跳跃间断点',
      D: '无穷间断点'
    },
    answer: 'C',
    analysis: '当 x→0⁺ 时，f(x)=1；当 x→0⁻ 时，f(x)=-1。左右极限存在但不相等，是跳跃间断点。'
  },

  // ==================== 高等数学 - 导数 ====================
  {
    id: 8,
    knowledgeId: 10201,
    type: 1,
    difficulty: 1,
    content: '函数 y = ln(x) 的导数是？',
    options: {
      A: '1/x',
      B: 'x',
      C: 'e^x',
      D: '1/x²'
    },
    answer: 'A',
    analysis: '(ln x)\' = 1/x，这是基本导数公式。'
  },
  {
    id: 9,
    knowledgeId: 10202,
    type: 1,
    difficulty: 1,
    content: '函数 y = x³ 的二阶导数是？',
    options: {
      A: '3x²',
      B: '6x',
      C: '6',
      D: 'x'
    },
    answer: 'B',
    analysis: 'y\' = 3x²，y\'\' = 6x。'
  },
  {
    id: 10,
    knowledgeId: 10202,
    type: 1,
    difficulty: 2,
    content: '函数 y = e^x · sinx 的导数是？',
    options: {
      A: 'e^x(sinx + cosx)',
      B: 'e^x(sinx - cosx)',
      C: 'e^x · cosx',
      D: 'e^x · sinx'
    },
    answer: 'A',
    analysis: '使用乘积求导法则：(uv)\' = u\'v + uv\'，所以 y\' = e^x·sinx + e^x·cosx = e^x(sinx + cosx)。'
  },

  // ==================== 英语 ====================
  {
    id: 11,
    knowledgeId: 20101,
    type: 1,
    difficulty: 1,
    content: 'The word "abandon" means:',
    options: {
      A: '接受',
      B: '放弃',
      C: '获得',
      D: '开始'
    },
    answer: 'B',
    analysis: 'abandon 意为"放弃、遗弃"。常见搭配：abandon oneself to 沉溺于。'
  },
  {
    id: 12,
    knowledgeId: 20101,
    type: 1,
    difficulty: 1,
    content: 'Which word means "有益的"?',
    options: {
      A: 'beneficial',
      B: 'harmful',
      C: 'useless',
      D: 'dangerous'
    },
    answer: 'A',
    analysis: 'beneficial = 有益的，harmful = 有害的，useless = 无用的，dangerous = 危险的。'
  },
  {
    id: 13,
    knowledgeId: 20102,
    type: 1,
    difficulty: 2,
    content: 'The phrase "call off" means:',
    options: {
      A: '打电话',
      B: '取消',
      C: '拜访',
      D: '叫醒'
    },
    answer: 'B',
    analysis: 'call off = cancel，意为"取消"。例如：The meeting was called off. 会议被取消了。'
  },

  // ==================== 政治 ====================
  {
    id: 14,
    knowledgeId: 30101,
    type: 1,
    difficulty: 1,
    content: '马克思主义哲学的基本问题是？',
    options: {
      A: '物质和意识的关系问题',
      B: '认识和实践的关系问题',
      C: '生产力和生产关系的问题',
      D: '经济基础和上层建筑的问题'
    },
    answer: 'A',
    analysis: '哲学基本问题是思维和存在的关系问题，即物质和意识的关系问题。'
  },
  {
    id: 15,
    knowledgeId: 30101,
    type: 1,
    difficulty: 2,
    content: '物质的唯一特性是？',
    options: {
      A: '运动',
      B: '客观实在性',
      C: '可知性',
      D: '无限性'
    },
    answer: 'B',
    analysis: '列宁指出："物质是标志客观实在的哲学范畴"，客观实在性是物质的唯一特性。'
  },
  {
    id: 16,
    knowledgeId: 30102,
    type: 2,
    difficulty: 2,
    content: '实践的基本特征包括？',
    options: {
      A: '客观物质性',
      B: '主观能动性',
      C: '社会历史性',
      D: '抽象思维性'
    },
    answer: 'ABC',
    analysis: '实践具有客观物质性、主观能动性和社会历史性三个基本特征。'
  },

  // ==================== 数据结构 ====================
  {
    id: 17,
    knowledgeId: 40101,
    type: 1,
    difficulty: 1,
    content: '在单链表中，删除一个节点需要修改几个指针？',
    options: {
      A: '1个',
      B: '2个',
      C: '3个',
      D: '0个'
    },
    answer: 'A',
    analysis: '删除单链表节点只需修改其前驱节点的指针，指向被删节点的后继即可。'
  },
  {
    id: 18,
    knowledgeId: 40102,
    type: 1,
    difficulty: 1,
    content: '栈的特点是？',
    options: {
      A: '先进先出',
      B: '先进后出',
      C: '随机存取',
      D: '按值存取'
    },
    answer: 'B',
    analysis: '栈是先进后出（FILO）的数据结构，队列是先进先出（FIFO）。'
  },
  {
    id: 19,
    knowledgeId: 40103,
    type: 1,
    difficulty: 2,
    content: '深度为 k 的完全二叉树最多有多少个节点？',
    options: {
      A: '2^k - 1',
      B: '2^(k-1)',
      C: '2^k',
      D: '2^k + 1'
    },
    answer: 'A',
    analysis: '深度为 k 的满二叉树有 2^k - 1 个节点，完全二叉树最多也是这么多。'
  },
  {
    id: 20,
    knowledgeId: 40106,
    type: 1,
    difficulty: 2,
    content: '快速排序的平均时间复杂度是？',
    options: {
      A: 'O(n)',
      B: 'O(n log n)',
      C: 'O(n²)',
      D: 'O(log n)'
    },
    answer: 'B',
    analysis: '快速排序平均时间复杂度为 O(n log n)，最坏情况下为 O(n²)。'
  }
]

// 根据知识点ID获取题目
export function getQuestionsByKnowledge(knowledgeId) {
  return questionBank.filter(q => q.knowledgeId === knowledgeId)
}

// 根据知识点ID和数量获取题目
export function getPracticeQuestions(knowledgeId, count = 10, difficulty = 0) {
  let questions = questionBank.filter(q => q.knowledgeId === knowledgeId)
  
  if (difficulty > 0) {
    questions = questions.filter(q => q.difficulty === difficulty)
  }
  
  // 随机打乱
  questions = [...questions].sort(() => Math.random() - 0.5)
  
  return questions.slice(0, count)
}

// 根据多个知识点获取题目
export function getQuestionsByKnowledgeList(knowledgeIds, count = 10) {
  let questions = questionBank.filter(q => knowledgeIds.includes(q.knowledgeId))
  questions = [...questions].sort(() => Math.random() - 0.5)
  return questions.slice(0, count)
}

// 获取知识点名称
export function getKnowledgeName(knowledgeId) {
  const knowledgeMap = {
    10102: '极限的定义',
    10103: '极限的运算法则',
    10104: '两个重要极限',
    10105: '无穷小与无穷大',
    10106: '函数的连续性',
    10201: '导数的定义',
    10202: '求导法则',
    20101: '高频词汇 A-D',
    20102: '高频词汇 E-H',
    30101: '世界的物质性及发展规律',
    30102: '实践与认识及其发展规律',
    40101: '线性表',
    40102: '栈和队列',
    40103: '树与二叉树',
    40106: '排序'
  }
  return knowledgeMap[knowledgeId] || '未知知识点'
}

// 获取学科名称
export function getSubjectNameByKnowledge(knowledgeId) {
  if (knowledgeId >= 10000 && knowledgeId < 20000) return '高等数学'
  if (knowledgeId >= 20000 && knowledgeId < 30000) return '英语'
  if (knowledgeId >= 30000 && knowledgeId < 40000) return '政治'
  if (knowledgeId >= 40000) return '计算机专业基础'
  return '未知学科'
}