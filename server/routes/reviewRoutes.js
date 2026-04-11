const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getReviews, createReview, deleteReview, markHelpful, getUserReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.get('/user/my', protect, getUserReviews);
router.get('/:vendorId', getReviews);
router.post('/', protect, [
    body('vendor_id').notEmpty(),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
    body('comment').trim().isLength({ min: 10, max: 1000 }),
], createReview);
router.delete('/:id', protect, deleteReview);
router.put('/:id/helpful', markHelpful);

module.exports = router;
