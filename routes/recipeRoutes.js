const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const { optionalAuth, requireAuth, requireRole } = require('../middleware/auth');
const { uploadRecipeImage } = require('../middleware/upload');

// متاحة للجميع (ضيف / مستخدم / طباخ / أدمن)
router.get('/', optionalAuth, recipeController.getRecipes);
router.get('/suggest', optionalAuth, recipeController.suggestRecipe);
router.get('/:id', optionalAuth, recipeController.getRecipeById);

// admin أو cook فقط
router.post('/', requireAuth, requireRole('admin', 'cook'), uploadRecipeImage.single('image'), recipeController.createRecipe);
router.put('/:id', requireAuth, requireRole('admin', 'cook'), uploadRecipeImage.single('image'), recipeController.updateRecipe);
router.delete('/:id', requireAuth, requireRole('admin', 'cook'), recipeController.deleteRecipe);

// admin فقط: اعتماد وصفة أضافها طباخ
router.patch('/:id/approve', requireAuth, requireRole('admin'), recipeController.approveRecipe);

module.exports = router;
