const pool = require('../config/db');

// جلب كل الوصفات - يدعم البحث ?search= والتصنيف ?category= والفرز ?sort=top_rated
exports.getRecipes = async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    let sql = `
      SELECT r.id, r.title, r.image_url, r.cooking_time_minutes, r.category_id,
             c.name_ar AS category_name,
             COALESCE(AVG(rt.stars), 0) AS avg_rating,
             COUNT(DISTINCT rt.id) AS ratings_count
      FROM recipes r
      JOIN categories c ON c.id = r.category_id
      LEFT JOIN ratings rt ON rt.recipe_id = r.id
      WHERE r.status = 'approved'
    `;
    const params = [];
    if (search) {
      sql += ' AND r.title LIKE ?';
      params.push(`%${search}%`);
    }
    if (category) {
      sql += ' AND c.slug = ?';
      params.push(category);
    }
    sql += ' GROUP BY r.id';
    sql += sort === 'top_rated' ? ' ORDER BY avg_rating DESC' : ' ORDER BY r.created_at DESC';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'تعذر جلب الوصفات', error: err.message });
  }
};

// اقتراح وصفة عشوائية (لزر "اقتراح وصفة")
exports.suggestRecipe = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, c.name_ar AS category_name
       FROM recipes r JOIN categories c ON c.id = r.category_id
       WHERE r.status = 'approved'
       ORDER BY RAND() LIMIT 1`
    );
    if (rows.length === 0) return res.status(404).json({ message: 'لا توجد وصفات بعد' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'تعذر اقتراح وصفة', error: err.message });
  }
};

// تفاصيل وصفة واحدة (المكونات + الخطوات + التقييم)
exports.getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;
    const [[recipe]] = await pool.query(
      `SELECT r.*, c.name_ar AS category_name,
              COALESCE(AVG(rt.stars),0) AS avg_rating, COUNT(DISTINCT rt.id) AS ratings_count
       FROM recipes r
       JOIN categories c ON c.id = r.category_id
       LEFT JOIN ratings rt ON rt.recipe_id = r.id
       WHERE r.id = ? GROUP BY r.id`, [id]
    );
    if (!recipe) return res.status(404).json({ message: 'الوصفة غير موجودة' });

    const [ingredients] = await pool.query(
      'SELECT id, name, quantity FROM recipe_ingredients WHERE recipe_id = ? ORDER BY sort_order', [id]
    );
    const [steps] = await pool.query(
      'SELECT id, step_number, instruction FROM recipe_steps WHERE recipe_id = ? ORDER BY step_number', [id]
    );

    let userRating = null;
    if (req.user && req.user.id) {
      const [[r]] = await pool.query('SELECT stars FROM ratings WHERE recipe_id = ? AND user_id = ?', [id, req.user.id]);
      userRating = r ? r.stars : null;
    }

    res.json({ ...recipe, ingredients, steps, userRating });
  } catch (err) {
    res.status(500).json({ message: 'تعذر جلب تفاصيل الوصفة', error: err.message });
  }
};

// إضافة وصفة جديدة (admin أو cook فقط)
exports.createRecipe = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { title, description, cooking_time_minutes, servings, category_id, ingredients, steps } = req.body;
    const image_url = req.file ? `/uploads/recipes/${req.file.filename}` : null;

    await conn.beginTransaction();
    const [result] = await conn.query(
      `INSERT INTO recipes (title, description, image_url, cooking_time_minutes, servings, category_id, created_by, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, image_url, cooking_time_minutes, servings || 4, category_id, req.user.id,
       req.user.role === 'admin' ? 'approved' : 'pending']
    );
    const recipeId = result.insertId;

    const parsedIngredients = typeof ingredients === 'string' ? JSON.parse(ingredients) : (ingredients || []);
    const parsedSteps = typeof steps === 'string' ? JSON.parse(steps) : (steps || []);

    for (let i = 0; i < parsedIngredients.length; i++) {
      const ing = parsedIngredients[i];
      await conn.query('INSERT INTO recipe_ingredients (recipe_id, name, quantity, sort_order) VALUES (?, ?, ?, ?)',
        [recipeId, ing.name, ing.quantity || null, i]);
    }
    for (let i = 0; i < parsedSteps.length; i++) {
      await conn.query('INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES (?, ?, ?)',
        [recipeId, i + 1, parsedSteps[i]]);
    }

    await conn.commit();
    res.status(201).json({ id: recipeId, message: 'تمت إضافة الوصفة بنجاح' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: 'تعذر إضافة الوصفة', error: err.message });
  } finally {
    conn.release();
  }
};

// تعديل وصفة (admin أو صاحبها من الطباخين)
exports.updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const [[recipe]] = await pool.query('SELECT created_by FROM recipes WHERE id = ?', [id]);
    if (!recipe) return res.status(404).json({ message: 'الوصفة غير موجودة' });
    if (req.user.role !== 'admin' && recipe.created_by !== req.user.id) {
      return res.status(403).json({ message: 'لا يمكنك تعديل هذه الوصفة' });
    }
    const { title, description, cooking_time_minutes, servings, category_id } = req.body;
    const image_url = req.file ? `/uploads/recipes/${req.file.filename}` : undefined;

    const fields = { title, description, cooking_time_minutes, servings, category_id };
    if (image_url) fields.image_url = image_url;

    const setClause = Object.keys(fields).filter(k => fields[k] !== undefined).map(k => `${k} = ?`).join(', ');
    const values = Object.keys(fields).filter(k => fields[k] !== undefined).map(k => fields[k]);
    if (setClause) {
      await pool.query(`UPDATE recipes SET ${setClause} WHERE id = ?`, [...values, id]);
    }
    res.json({ message: 'تم تحديث الوصفة' });
  } catch (err) {
    res.status(500).json({ message: 'تعذر تحديث الوصفة', error: err.message });
  }
};

// حذف وصفة (admin أو صاحبها)
exports.deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const [[recipe]] = await pool.query('SELECT created_by FROM recipes WHERE id = ?', [id]);
    if (!recipe) return res.status(404).json({ message: 'الوصفة غير موجودة' });
    if (req.user.role !== 'admin' && recipe.created_by !== req.user.id) {
      return res.status(403).json({ message: 'لا يمكنك حذف هذه الوصفة' });
    }
    await pool.query('DELETE FROM recipes WHERE id = ?', [id]);
    res.json({ message: 'تم حذف الوصفة' });
  } catch (err) {
    res.status(500).json({ message: 'تعذر حذف الوصفة', error: err.message });
  }
};
exports.getPendingRecipes = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.id, r.title, r.image_url, r.cooking_time_minutes, c.name_ar AS category_name,
              u.full_name AS created_by_name, r.created_at
       FROM recipes r
       JOIN categories c ON c.id = r.category_id
       JOIN users u ON u.id = r.created_by
       WHERE r.status = 'pending'
       ORDER BY r.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'تعذر جلب الوصفات المعلّقة', error: err.message });
  }
};

// موافقة admin على وصفة أضافها طباخ (status: pending -> approved)
exports.approveRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE recipes SET status = ? WHERE id = ?', ['approved', id]);
    res.json({ message: 'تم اعتماد الوصفة' });
  } catch (err) {
    res.status(500).json({ message: 'تعذر اعتماد الوصفة', error: err.message });
  }
};
exports.rejectRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE recipes SET status = ? WHERE id = ?', ['rejected', id]);
    res.json({ message: 'تم رفض الوصفة' });
  } catch (err) {
    res.status(500).json({ message: 'تعذر رفض الوصفة', error: err.message });
  }
};