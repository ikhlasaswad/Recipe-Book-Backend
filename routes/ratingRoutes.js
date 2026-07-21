const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { requireAuth } = require('../middleware/auth');

router.post('/:recipeId', requireAuth, ratingController.rateRecipe);

module.exports = router;
