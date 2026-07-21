const pool = require('../config/db');

// إضافة أو تحديث تقييم المستخدم لوصفة (نجمة واحدة إلى خمسة)
exports.rateRecipe = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { stars } = req.body;
    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({ message: 'التقييم يجب أن يكون بين 1 و 5 نجوم' });
    }
    await pool.query(
      `INSERT INTO ratings (recipe_id, user_id, stars) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE stars = VALUES(stars)`,
      [recipeId, req.user.id, stars]
    );
    const [[avg]] = await pool.query(
      'SELECT COALESCE(AVG(stars),0) AS avg_rating, COUNT(*) AS ratings_count FROM ratings WHERE recipe_id = ?',
      [recipeId]
    );
    res.json({ message: 'تم حفظ تقييمك', ...avg });
  } catch (err) {
    res.status(500).json({ message: 'تعذر حفظ التقييم', error: err.message });
  }
};
