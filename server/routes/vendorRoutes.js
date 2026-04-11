const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
    getVendors, getNearbyVendors, getFeaturedVendors, getVendorById,
    createVendor, updateVendor, deleteVendor, getMyVendor, getVendorAnalytics,
} = require('../controllers/vendorController');
const { protect, authorize, optionalAuth } = require('../middleware/authMiddleware');

const createValidation = [
    body('name').trim().notEmpty().withMessage('Vendor name is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
    body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
    body('address').notEmpty().withMessage('Address is required'),
    body('city').notEmpty().withMessage('City is required'),
];

router.get('/', optionalAuth, getVendors);
router.get('/featured', getFeaturedVendors);
router.get('/nearby', getNearbyVendors);
router.get('/my', protect, authorize('vendor', 'admin'), getMyVendor);
router.get('/:id', optionalAuth, getVendorById);
router.get('/:id/analytics', protect, authorize('vendor', 'admin'), getVendorAnalytics);
router.post('/', protect, authorize('vendor', 'admin'), createValidation, createVendor);
router.put('/:id', protect, authorize('vendor', 'admin'), updateVendor);
router.delete('/:id', protect, authorize('vendor', 'admin'), deleteVendor);

module.exports = router;
