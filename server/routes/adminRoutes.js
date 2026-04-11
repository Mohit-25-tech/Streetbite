const express = require('express');
const router = express.Router();
const { getStats, getAllVendors, verifyVendor, getAllUsers, getCategories, createCategory, deleteUser } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('admin'));
router.get('/stats', getStats);
router.get('/vendors', getAllVendors);
router.put('/vendors/:id/verify', verifyVendor);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/categories', getCategories);
router.post('/categories', createCategory);

module.exports = router;
