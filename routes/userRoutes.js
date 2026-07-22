const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth, requireRole } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');

router.get('/me', requireAuth, userController.getMe);
router.put('/me', requireAuth, uploadAvatar.single('avatar'), userController.updateMe);

// admin فقط
router.get('/', requireAuth, requireRole('admin'), userController.getAllUsers);
router.patch('/:id/role', requireAuth, requireRole('admin'), userController.updateUserRole);
router.delete('/:id', requireAuth, requireRole('admin'), userController.deleteUser);

module.exports = router;
