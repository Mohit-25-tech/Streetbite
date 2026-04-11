const { query } = require('../config/db');
const { validationResult } = require('express-validator');

// @route GET /api/reviews/:vendorId
const getReviews = async (req, res) => {
    try {
        const { vendorId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const countResult = await query('SELECT COUNT(*) FROM reviews WHERE vendor_id = $1', [vendorId]);
        const result = await query(
            `SELECT r.*, u.name AS user_name, u.avatar_url AS user_avatar
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.vendor_id = $1
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
            [vendorId, parseInt(limit), offset]
        );

        const breakdown = await query(
            'SELECT rating, COUNT(*) as count FROM reviews WHERE vendor_id = $1 GROUP BY rating ORDER BY rating DESC',
            [vendorId]
        );

        res.json({
            success: true,
            reviews: result.rows,
            breakdown: breakdown.rows,
            total: parseInt(countResult.rows[0].count),
            page: parseInt(page),
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
    }
};

// @route POST /api/reviews
const createReview = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { vendor_id, rating, comment } = req.body;
    try {
        const existing = await query(
            'SELECT id FROM reviews WHERE user_id = $1 AND vendor_id = $2',
            [req.user.id, vendor_id]
        );
        if (existing.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'You have already reviewed this vendor.' });
        }

        const result = await query(
            `INSERT INTO reviews (user_id, vendor_id, rating, comment) VALUES ($1, $2, $3, $4)
       RETURNING *`,
            [req.user.id, vendor_id, rating, comment]
        );

        // Update vendor avg_rating and total_reviews
        await query(
            `UPDATE vendors SET
         avg_rating = (SELECT AVG(rating) FROM reviews WHERE vendor_id = $1),
         total_reviews = (SELECT COUNT(*) FROM reviews WHERE vendor_id = $1)
       WHERE id = $1`,
            [vendor_id]
        );

        const newReview = await query(
            `SELECT r.*, u.name AS user_name, u.avatar_url AS user_avatar FROM reviews r
       JOIN users u ON r.user_id = u.id WHERE r.id = $1`,
            [result.rows[0].id]
        );

        res.status(201).json({ success: true, review: newReview.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to create review.' });
    }
};

// @route DELETE /api/reviews/:id
const deleteReview = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await query('SELECT * FROM reviews WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Review not found.' });
        if (result.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized.' });
        }
        const vendorId = result.rows[0].vendor_id;
        await query('DELETE FROM reviews WHERE id = $1', [id]);

        // Recalculate
        await query(
            `UPDATE vendors SET
         avg_rating = COALESCE((SELECT AVG(rating) FROM reviews WHERE vendor_id = $1), 0),
         total_reviews = (SELECT COUNT(*) FROM reviews WHERE vendor_id = $1)
       WHERE id = $1`,
            [vendorId]
        );

        res.json({ success: true, message: 'Review deleted.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to delete review.' });
    }
};

// @route PUT /api/reviews/:id/helpful
const markHelpful = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await query(
            'UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = $1 RETURNING *',
            [id]
        );
        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Review not found.' });
        res.json({ success: true, review: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to mark helpful.' });
    }
};

// @route GET /api/reviews/user/my
const getUserReviews = async (req, res) => {
    try {
        const result = await query(
            `SELECT r.*, v.name AS vendor_name, v.cover_image AS vendor_image FROM reviews r
       JOIN vendors v ON r.vendor_id = v.id
       WHERE r.user_id = $1 ORDER BY r.created_at DESC`,
            [req.user.id]
        );
        res.json({ success: true, reviews: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
    }
};

module.exports = { getReviews, createReview, deleteReview, markHelpful, getUserReviews };
