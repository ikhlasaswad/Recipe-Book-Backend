const pool = require('../config/db');

exports.getCategories = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY sort_order');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'تعذر جلب التصنيفات', error: err.message });
  }
};

// (اختياري) admin فقط: إضافة تصنيف جديد
exports.createCategory = async (req, res) => {
  try {
    const { name_ar, slug, sort_order } = req.body;
    const [result] = await pool.query(
      'INSERT INTO categories (name_ar, slug, sort_order) VALUES (?, ?, ?)',
      [name_ar, slug, sort_order || 0]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'تعذر إضافة التصنيف', error: err.message });
  }
};
