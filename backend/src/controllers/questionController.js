const pool = require('../config/database');

// 获取学科列表
exports.getSubjects = async (req, res) => {
  try {
    const [subjects] = await pool.execute(
      'SELECT id, name, code, icon, description FROM subjects WHERE status = 1 ORDER BY sort_order'
    );

    res.status(200).json({
      code: 200,
      data: subjects
    });
  } catch (error) {
    console.error('获取学科列表错误:', error);
    res.status(500).json({
      code: 500,
      message: '获取学科列表失败'
    });
  }
};

// 获取章节列表
exports.getChapters = async (req, res) => {
  try {
    const { subjectId } = req.query;

    let query = 'SELECT id, name, description, sort_order FROM chapters WHERE status = 1';
    const params = [];

    if (subjectId) {
      query += ' AND subject_id = ?';
      params.push(subjectId);
    }

    query += ' ORDER BY sort_order';

    const [chapters] = await pool.execute(query, params);

    res.status(200).json({
      code: 200,
      data: chapters
    });
  } catch (error) {
    console.error('获取章节列表错误:', error);
    res.status(500).json({
      code: 500,
      message: '获取章节列表失败'
    });
  }
};

// 获取知识点列表
exports.getKnowledgePoints = async (req, res) => {
  try {
    const { subjectId, chapterId } = req.query;

    let query = `
      SELECT kp.id, kp.name, kp.description, kp.sort_order,
             c.name as chapter_name, s.name as subject_name
      FROM knowledge_points kp
      LEFT JOIN chapters c ON kp.chapter_id = c.id
      LEFT JOIN subjects s ON c.subject_id = s.id
      WHERE kp.status = 1
    `;
    const params = [];

    if (chapterId) {
      query += ' AND kp.chapter_id = ?';
      params.push(chapterId);
    } else if (subjectId) {
      query += ' AND c.subject_id = ?';
      params.push(subjectId);
    }

    query += ' ORDER BY kp.sort_order';

    const [knowledgePoints] = await pool.execute(query, params);

    res.status(200).json({
      code: 200,
      data: knowledgePoints
    });
  } catch (error) {
    console.error('获取知识点列表错误:', error);
    res.status(500).json({
      code: 500,
      message: '获取知识点列表失败'
    });
  }
};

// 获取题目详情
exports.getQuestionDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const [questions] = await pool.execute(
      `SELECT q.id, q.knowledge_id, q.type, q.difficulty, q.content, q.options, q.answer, q.analysis,
              kp.name as knowledge_name, s.name as subject_name
       FROM questions q
       LEFT JOIN knowledge_points kp ON q.knowledge_id = kp.id
       LEFT JOIN subjects s ON kp.chapter_id IN (SELECT id FROM chapters WHERE subject_id = s.id)
       WHERE q.id = ? AND q.status = 1`,
      [id]
    );

    if (questions.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '题目不存在'
      });
    }

    // 解析 JSON 格式的选项
    const question = questions[0];
    if (question.options) {
      question.options = JSON.parse(question.options);
    }

    // 增加查看次数
    await pool.execute(
      'UPDATE questions SET view_count = view_count + 1 WHERE id = ?',
      [id]
    );

    res.status(200).json({
      code: 200,
      data: question
    });
  } catch (error) {
    console.error('获取题目详情错误:', error);
    res.status(500).json({
      code: 500,
      message: '获取题目详情失败'
    });
  }
};

// 获取练习题目
exports.getPracticeQuestions = async (req, res) => {
  try {
    const { knowledgeId, count = 10, difficulty = 0 } = req.query;

    let query = `
      SELECT id, knowledge_id, type, difficulty, content, options, answer, analysis
      FROM questions
      WHERE status = 1
    `;
    const params = [];

    if (knowledgeId) {
      query += ' AND knowledge_id = ?';
      params.push(knowledgeId);
    }

    if (difficulty > 0) {
      query += ' AND difficulty = ?';
      params.push(difficulty);
    }

    query += ' ORDER BY RAND() LIMIT ?';
    params.push(parseInt(count));

    const [questions] = await pool.execute(query, params);

    // 解析 JSON 格式的选项
    questions.forEach(q => {
      if (q.options) {
        q.options = JSON.parse(q.options);
      }
    });

    res.status(200).json({
      code: 200,
      data: questions
    });
  } catch (error) {
    console.error('获取练习题目错误:', error);
    res.status(500).json({
      code: 500,
      message: '获取练习题目失败'
    });
  }
};

// 提交答案
exports.submitAnswer = async (req, res) => {
  try {
    const { answers, elapsed_time } = req.body;
    const userId = req.user.userId;

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '答案数据无效'
      });
    }

    // 获取题目信息
    const questionIds = answers.map(a => a.questionId);
    const [questions] = await pool.execute(
      `SELECT id, knowledge_id, answer FROM questions WHERE id IN (${questionIds.map(() => '?').join(',')})`,
      questionIds
    );

    const questionMap = new Map(questions.map(q => [q.id, q]));

    // 统计结果
    let correctCount = 0;
    const results = [];
    const knowledgeStats = new Map();

    // 验证答案并更新统计
    for (const answer of answers) {
      const question = questionMap.get(answer.questionId);
      if (!question) continue;

      const isCorrect = answer.userAnswer === question.answer;

      if (isCorrect) {
        correctCount++;
        await pool.execute(
          'UPDATE questions SET correct_count = correct_count + 1 WHERE id = ?',
          [answer.questionId]
        );
      } else {
        await pool.execute(
          'UPDATE questions SET wrong_count = wrong_count + 1 WHERE id = ?',
          [answer.questionId]
        );
      }

      // 收集知识点统计
      const knowledgeId = question.knowledge_id;
      if (!knowledgeStats.has(knowledgeId)) {
        knowledgeStats.set(knowledgeId, { total: 0, correct: 0 });
      }
      const stats = knowledgeStats.get(knowledgeId);
      stats.total++;
      if (isCorrect) stats.correct++;

      results.push({
        questionId: answer.questionId,
        userAnswer: answer.userAnswer,
        correctAnswer: question.answer,
        isCorrect
      });
    }

    // 保存练习记录
    for (const [knowledgeId, stats] of knowledgeStats) {
      // 获取学科ID
      const [knowledgePoints] = await pool.execute(
        'SELECT chapter_id FROM knowledge_points WHERE id = ?',
        [knowledgeId]
      );

      if (knowledgePoints.length > 0) {
        const [chapters] = await pool.execute(
          'SELECT subject_id FROM chapters WHERE id = ?',
          [knowledgePoints[0].chapter_id]
        );

        const subjectId = chapters[0]?.subject_id;

        await pool.execute(
          `INSERT INTO practice_records (user_id, subject_id, knowledge_id, question_count, correct_count, accuracy, elapsed_time, practice_date)
           VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())`,
          [
            userId,
            subjectId,
            knowledgeId,
            stats.total,
            stats.correct,
            stats.total > 0 ? (stats.correct / stats.total * 100).toFixed(2) : 0,
            elapsed_time || 0
          ]
        );
      }

      // 为错误的题目创建复习记录
      const wrongAnswers = answers.filter(a => {
        const question = questionMap.get(a.questionId);
        return question && question.knowledge_id === knowledgeId && a.userAnswer !== question.answer;
      });

      for (const wrongAnswer of wrongAnswers) {
        const existing = await pool.execute(
          'SELECT id FROM review_records WHERE user_id = ? AND question_id = ?',
          [userId, wrongAnswer.questionId]
        );

        if (existing.length === 0) {
          await pool.execute(
            `INSERT INTO review_records (user_id, question_id, knowledge_id, review_stage, correct_count, total_review_count, memory_level, last_review_time, next_review_time)
             VALUES (?, ?, ?, 1, 0, 1, 40, NOW(), DATE_ADD(NOW(), INTERVAL 5 MINUTE))`,
            [userId, wrongAnswer.questionId, knowledgeId]
          );
        }
      }
    }

    res.status(200).json({
      code: 200,
      message: '提交成功',
      data: {
        total: answers.length,
        correct: correctCount,
        accuracy: answers.length > 0 ? ((correctCount / answers.length) * 100).toFixed(2) : 0,
        results
      }
    });
  } catch (error) {
    console.error('提交答案错误:', error);
    res.status(500).json({
      code: 500,
      message: '提交答案失败'
    });
  }
};

// 获取题目统计
exports.getQuestionStats = async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN type = 1 THEN 1 ELSE 0 END) as single_choice,
        SUM(CASE WHEN type = 2 THEN 1 ELSE 0 END) as multiple_choice,
        SUM(CASE WHEN type = 3 THEN 1 ELSE 0 END) as true_false
      FROM questions WHERE status = 1
    `);

    res.status(200).json({
      code: 200,
      data: stats[0]
    });
  } catch (error) {
    console.error('获取题目统计错误:', error);
    res.status(500).json({
      code: 500,
      message: '获取题目统计失败'
    });
  }
};
