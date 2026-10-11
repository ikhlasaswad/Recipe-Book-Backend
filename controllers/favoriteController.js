const pool = require('../config/db');

exports.getMyFavorites = async (req, res) => {
  try {
    // ملاحظة: في PostgreSQL يجب إضافة f.created_at إلى GROUP BY لأنه مستخدم في ORDER BY
    const { rows } = await pool.query(
      `SELECT r.id, r.title, r.image_url, r.cooking_time_minutes,
              COALESCE(AVG(rt.stars), 0) AS avg_rating
       FROM favorites f
       JOIN recipes r ON r.id = f.recipe_id
       LEFT JOIN ratings rt ON rt.recipe_id = r.id
       WHERE f.user_id = $1
       GROUP BY r.id, f.created_at
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
    await pool.query(
      'INSERT INTO favorites (user_id, recipe_id) VALUES ($1, $2) ON CONFLICT (user_id, recipe_id) DO NOTHING',
      [req.user.id, recipeId]
    );
    res.status(201).json({ message: 'تمت إضافة الوصفة إلى المفضلة' });
  } catch (err) {
    res.status(500).json({ message: 'تعذر الإضافة إلى المفضلة', error: err.message });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const { recipeId } = req.params;
    await pool.query('DELETE FROM favorites WHERE user_id = $1 AND recipe_id = $2', [req.user.id, recipeId]);
    res.json({ message: 'تمت إزالة الوصفة من المفضلة' });
  } catch (err) {
    res.status(500).json({ message: 'تعذر الحذف من المفضلة', error: err.message });
  }
};