-- ============================================
-- قاعدة بيانات تطبيق "مطبخي" (وصفات الطبخ)
-- MySQL 8+
-- ============================================

USE railway;

-- ============ المستخدمون ============
-- role: admin | cook | user   (الضيف guest لا يُخزَّن، يُعامل كجلسة مؤقتة بدون توكن دائم)
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','cook','user') NOT NULL DEFAULT 'user',
  avatar_url VARCHAR(255) DEFAULT NULL,
  bio TEXT DEFAULT NULL,
  theme_color VARCHAR(20) DEFAULT '#C62828', -- تدرج أحمر افتراضي، قابل للتغيير من الإعدادات
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============ التصنيفات ============
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name_ar VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(255) DEFAULT NULL,
  sort_order INT DEFAULT 0
) ENGINE=InnoDB;

INSERT INTO categories (name_ar, slug, sort_order) VALUES
('وصفات لحم', 'meat', 1),
('وصفات دجاج', 'chicken', 2),
('وصفات سمك', 'fish', 3),
('وصفات خضار', 'vegetables', 4),
('وصفات تحلية', 'desserts', 5),
('عصائر وكوكتيلات', 'juices-cocktails', 6),
('صوصات', 'sauces', 7),
('وصفات خفيفة للعشاء', 'light-dinner', 8),
('وصفات خفيفة للفطور', 'light-breakfast', 9),
('طرق تخزين الطعام', 'food-storage', 10),
('وصفات أطفال رضع', 'baby-food', 11);

-- ============ الوصفات ============
-- created_by: يمكن أن يكون admin أو cook
CREATE TABLE recipes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  image_url VARCHAR(255) DEFAULT NULL,
  cooking_time_minutes INT NOT NULL DEFAULT 0,
  servings INT DEFAULT 4,
  category_id INT NOT NULL,
  created_by INT NOT NULL,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'approved',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============ المكونات ============
CREATE TABLE recipe_ingredients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipe_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  quantity VARCHAR(50) DEFAULT NULL,
  sort_order INT DEFAULT 0,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============ خطوات التحضير ============
CREATE TABLE recipe_steps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipe_id INT NOT NULL,
  step_number INT NOT NULL,
  instruction TEXT NOT NULL,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============ التقييمات (1-5 نجوم) ============
CREATE TABLE ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipe_id INT NOT NULL,
  user_id INT NOT NULL,
  stars TINYINT NOT NULL CHECK (stars BETWEEN 1 AND 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_rating (recipe_id, user_id),
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============ المفضلة ============
CREATE TABLE favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  recipe_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_favorite (user_id, recipe_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- فهرسة لتحسين الأداء عند البحث والفرز حسب التقييم
CREATE INDEX idx_recipes_category ON recipes(category_id);
CREATE INDEX idx_recipes_title ON recipes(title);
