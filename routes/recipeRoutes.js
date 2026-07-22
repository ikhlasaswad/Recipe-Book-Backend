const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const { optionalAuth, requireAuth, requireRole } = require('../middleware/auth');
const { uploadRecipeImage } = require('../middleware/upload');

// متاحة للجميع (ضيف / مستخدم / طباخ / أدمن)
router.get('/', optionalAuth, recipeController.getRecipes);
router.get('/suggest', optionalAuth, recipeController.suggestRecipe);

// admin فقط: قائمة الوصفات المعلّقة (يجب أن تسبق "/:id" حتى لا تُفسَّر "admin" كمعرّف وصفة)
router.get('/admin/pending', requireAuth, requireRole('admin'), recipeController.getPendingRecipes);

router.get('/:id', optionalAuth, recipeController.getRecipeById);

// admin أو cook فقط
router.post('/', requireAuth, requireRole('admin', 'cook'), uploadRecipeImage.single('image'), recipeController.createRecipe);
router.put('/:id', requireAuth, requireRole('admin', 'cook'), uploadRecipeImage.single('image'), recipeController.updateRecipe);
router.delete('/:id', requireAuth, requireRole('admin', 'cook'), recipeController.deleteRecipe);

// admin فقط: اعتماد أو رفض وصفة أضافها طباخ
router.patch('/:id/approve', requireAuth, requireRole('admin'), recipeController.approveRecipe);
router.patch('/:id/reject', requireAuth, requireRole('admin'), recipeController.rejectRecipe);

module.exports = router;