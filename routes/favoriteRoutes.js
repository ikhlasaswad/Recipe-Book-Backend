const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { requireAuth } = require('../middleware/auth');

// المفضلة غير متاحة للضيف - يجب إنشاء حساب
router.get('/', requireAuth, favoriteController.getMyFavorites);
router.post('/:recipeId', requireAuth, favoriteController.addFavorite);
router.delete('/:recipeId', requireAuth, favoriteController.removeFavorite);

module.exports = router;
