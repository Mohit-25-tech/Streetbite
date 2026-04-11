const express = require('express');
const router = express.Router();
const { getFavorites, addFavorite, removeFavorite, checkFavorite } = require('../controllers/favoritesController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getFavorites);
router.get('/check/:vendorId', checkFavorite);
router.post('/:vendorId', addFavorite);
router.delete('/:vendorId', removeFavorite);

module.exports = router;
