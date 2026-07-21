const jwt = require('jsonwebtoken');

// يسمح بالدخول كضيف: إن لم يوجد توكن، يُعامل الطلب كـ "guest" بدون بيانات مستخدم
function optionalAuth(req, res, next) {
  const header = req.headers['authorization'];
  if (!header) {
    req.user = { role: 'guest' };
    return next();
  }
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    req.user = { role: 'guest' };
  }
  next();
}

// يتطلب تسجيل دخول فعلي (يرفض الضيف)
function requireAuth(req, res, next) {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ message: 'يجب تسجيل الدخول' });
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role === 'guest') {
      return res.status(403).json({ message: 'هذه الميزة غير متاحة للضيوف، يرجى إنشاء حساب' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'جلسة الدخول غير صالحة' });
  }
}

// يسمح فقط للأدوار المحددة (مثال: requireRole('admin','cook'))
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'ليس لديك صلاحية للقيام بهذا الإجراء' });
    }
    next();
  };
}

module.exports = { optionalAuth, requireAuth, requireRole };
