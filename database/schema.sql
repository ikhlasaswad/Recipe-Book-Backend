-- ============================================
-- قاعدة بيانات تطبيق "مطبخي" (وصفات الطبخ)
-- PostgreSQL 13+
-- ============================================

-- ============ الأنواع (بديل ENUM في MySQL) ============
CREATE TYPE user_role AS ENUM ('admin', 'cook', 'user');
CREATE TYPE recipe_status AS ENUM ('pending', 'approved', 'rejected');

-- ============ دالة تحديث updated_at (بديل ON UPDATE CURRENT_TIMESTAMP) ============
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============ المستخدمون ============
-- role: admin | cook | user   (الضيف guest لا يُخزَّن)
CREATE TABLE users (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  avatar_url VARCHAR(255) DEFAULT NULL,
  bio TEXT DEFAULT NULL,
  theme_color VARCHAR(20) DEFAULT '#C62828',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============ التصنيفات ============
CREATE TABLE categories (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name_ar VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(255) DEFAULT NULL,
  sort_order INT DEFAULT 0
);

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
CREATE TABLE recipes (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  image_url VARCHAR(255) DEFAULT NULL,
  cooking_time_minutes INT NOT NULL DEFAULT 0,
  servings INT DEFAULT 4,
  category_id INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  created_by INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status recipe_status NOT NULL DEFAULT 'approved',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============ المكونات ============
CREATE TABLE recipe_ingredients (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  recipe_id INT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  quantity VARCHAR(50) DEFAULT NULL,
  sort_order INT DEFAULT 0
);

-- ============ خطوات التحضير ============
CREATE TABLE recipe_steps (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  recipe_id INT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  step_number INT NOT NULL,
  instruction TEXT NOT NULL
);

-- ============ التقييمات (1-5 نجوم) ============
CREATE TABLE ratings (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  recipe_id INT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stars SMALLINT NOT NULL CHECK (stars BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_rating UNIQUE (recipe_id, user_id)
);

-- ============ المفضلة ============
CREATE TABLE favorites (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipe_id INT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_favorite UNIQUE (user_id, recipe_id)
);

-- ============ الفهارس ============
-- ملاحظة: PostgreSQL لا ينشئ فهرساً تلقائياً على المفاتيح الأجنبية (بعكس MySQL/InnoDB)
CREATE INDEX idx_recipes_category   ON recipes(category_id);
CREATE INDEX idx_recipes_created_by ON recipes(created_by);
CREATE INDEX idx_recipes_status     ON recipes(status);
CREATE INDEX idx_ingredients_recipe ON recipe_ingredients(recipe_id);
CREATE INDEX idx_steps_recipe       ON recipe_steps(recipe_id);
CREATE INDEX idx_ratings_user       ON ratings(user_id);
CREATE INDEX idx_favorites_recipe   ON favorites(recipe_id);

-- (اختياري) لتسريع البحث ILIKE '%كلمة%' في العنوان:
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_recipes_title_trgm ON recipes USING gin (title gin_trgm_ops);