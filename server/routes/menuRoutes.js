const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getMenu, createMenuItem, updateMenuItem, deleteMenuItem } = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/:vendorId', getMenu);
router.post('/', protect, authorize('vendor', 'admin'), [
    body('vendor_id').notEmpty(),
    body('name').trim().notEmpty(),
    body('price').isFloat({ min: 0 }),
], createMenuItem);
router.put('/:id', protect, authorize('vendor', 'admin'), updateMenuItem);
router.delete('/:id', protect, authorize('vendor', 'admin'), deleteMenuItem);

module.exports = router;
