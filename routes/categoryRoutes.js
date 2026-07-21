const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/', categoryController.getCategories);
router.post('/', requireAuth, requireRole('admin'), categoryController.createCategory);

module.exports = router;
