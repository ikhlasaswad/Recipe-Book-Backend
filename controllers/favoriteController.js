const pool = require('../config/db');

exports.getMyFavorites = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.id, r.title, r.image_url, r.cooking_time_minutes,
              COALESCE(AVG(rt.stars),0) AS avg_rating
       FROM favorites f
       JOIN recipes r ON r.id = f.recipe_id
       LEFT JOIN ratings rt ON rt.recipe_id = r.id
       WHERE f.user_id = ?
       GROUP BY r.id
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'تعذر جلب المفضلة', error: err.message });
  }
};

exports.addFavorite = async (req, res) => {
  try {
    const { recipeId } = req.params;
    await pool.query('INSERT IGNORE INTO favorites (user_id, recipe_id) VALUES (?, ?)', [req.user.id, recipeId]);
    res.status(201).json({ message: 'تمت إضافة الوصفة إلى المفضلة' });
  } catch (err) {
    res.status(500).json({ message: 'تعذر الإضافة إلى المفضلة', error: err.message });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const { recipeId } = req.params;
    await pool.query('DELETE FROM favorites WHERE user_id = ? AND recipe_id = ?', [req.user.id, recipeId]);
    res.json({ message: 'تمت إزالة الوصفة من المفضلة' });
  } catch (err) {
    res.status(500).json({ message: 'تعذر الحذف من المفضلة', error: err.message });
  }
};
