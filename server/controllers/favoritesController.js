const { query } = require('../config/db');

// @route GET /api/favorites
const getFavorites = async (req, res) => {
    try {
        const result = await query(
            `SELECT v.*, f.created_at AS favorited_at FROM favorites f
       JOIN vendors v ON f.vendor_id = v.id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
            [req.user.id]
        );
        res.json({ success: true, favorites: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch favorites.' });
    }
};

// @route POST /api/favorites/:vendorId
const addFavorite = async (req, res) => {
    const { vendorId } = req.params;
    try {
        const existing = await query(
            'SELECT id FROM favorites WHERE user_id = $1 AND vendor_id = $2',
            [req.user.id, vendorId]
        );
        if (existing.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'Already in favorites.' });
        }
        await query('INSERT INTO favorites (user_id, vendor_id) VALUES ($1, $2)', [req.user.id, vendorId]);
        res.status(201).json({ success: true, message: 'Added to favorites.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to add favorite.' });
    }
};

// @route DELETE /api/favorites/:vendorId
const removeFavorite = async (req, res) => {
    const { vendorId } = req.params;
    try {
        await query('DELETE FROM favorites WHERE user_id = $1 AND vendor_id = $2', [req.user.id, vendorId]);
        res.json({ success: true, message: 'Removed from favorites.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to remove favorite.' });
    }
};

// @route GET /api/favorites/check/:vendorId
const checkFavorite = async (req, res) => {
    const { vendorId } = req.params;
    try {
        const result = await query(
            'SELECT id FROM favorites WHERE user_id = $1 AND vendor_id = $2',
            [req.user.id, vendorId]
        );
        res.json({ success: true, isFavorite: result.rows.length > 0 });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to check favorite.' });
    }
};

module.exports = { getFavorites, addFavorite, removeFavorite, checkFavorite };
