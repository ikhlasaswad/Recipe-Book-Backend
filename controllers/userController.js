const pool = require('../config/db');

// جلب بيانات الملف الشخصي الحالي
exports.getMe = async (req, res) => {
  try {
    const [[user]] = await pool.query(
      'SELECT id, full_name, email, role, avatar_url, bio, theme_color FROM users WHERE id = ?',
      [req.user.id]
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'تعذر جلب البيانات', error: err.message });
  }
};

// تحديث الإعدادات: الاسم، الصورة، النبذة (bio)، لون الثيم
exports.updateMe = async (req, res) => {
  try {
    const { full_name, bio, theme_color } = req.body;
    const avatar_url = req.file ? `/uploads/avatars/${req.file.filename}` : undefined;

    const fields = { full_name, bio, theme_color };
    if (avatar_url) fields.avatar_url = avatar_url;

    const keys = Object.keys(fields).filter(k => fields[k] !== undefined);
    if (keys.length === 0) return res.status(400).json({ message: 'لا توجد بيانات لتحديثها' });

    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const values = keys.map(k => fields[k]);
    await pool.query(`UPDATE users SET ${setClause} WHERE id = ?`, [...values, req.user.id]);

    res.json({ message: 'تم تحديث الإعدادات بنجاح' });
  } catch (err) {
    res.status(500).json({ message: 'تعذر تحديث الإعدادات', error: err.message });
  }
};

// (admin فقط) عرض كل المستخدمين
exports.getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, full_name, email, role, created_at FROM users ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'تعذر جلب المستخدمين', error: err.message });
  }
};

// (admin فقط) تغيير دور مستخدم (ترقيته إلى طباخ مثلاً)
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!['admin', 'cook', 'user'].includes(role)) {
      return res.status(400).json({ message: 'دور غير صالح' });
    }
    await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    res.json({ message: 'تم تحديث دور المستخدم' });
  } catch (err) {
    res.status(500).json({ message: 'تعذر تحديث الدور', error: err.message });
  }
};
