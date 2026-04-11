const { query } = require('../config/db');

// @route GET /api/admin/stats
const getStats = async (req, res) => {
    try {
        const [users, vendors, reviews, categories] = await Promise.all([
            query('SELECT COUNT(*) FROM users'),
            query('SELECT COUNT(*) FROM vendors WHERE is_verified = true'),
            query('SELECT COUNT(*) FROM reviews'),
            query('SELECT COUNT(*) FROM categories'),
        ]);
        const pendingVendors = await query('SELECT COUNT(*) FROM vendors WHERE is_verified = false');

        res.json({
            success: true,
            stats: {
                total_users: parseInt(users.rows[0].count),
                total_vendors: parseInt(vendors.rows[0].count),
                total_reviews: parseInt(reviews.rows[0].count),
                total_categories: parseInt(categories.rows[0].count),
                pending_vendors: parseInt(pendingVendors.rows[0].count),
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch stats.' });
    }
};

// @route GET /api/admin/vendors
const getAllVendors = async (req, res) => {
    try {
        const { verified } = req.query;
        let sql = `SELECT v.*, u.name AS owner_name, u.email AS owner_email
               FROM vendors v JOIN users u ON v.user_id = u.id`;
        const params = [];
        if (verified !== undefined) {
            sql += ` WHERE v.is_verified = $1`;
            params.push(verified === 'true');
        }
        sql += ' ORDER BY v.created_at DESC';
        const result = await query(sql, params);
        res.json({ success: true, vendors: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch vendors.' });
    }
};

// @route PUT /api/admin/vendors/:id/verify
const verifyVendor = async (req, res) => {
    const { id } = req.params;
    const { is_verified } = req.body;
    try {
        const result = await query(
            'UPDATE vendors SET is_verified = $1 WHERE id = $2 RETURNING *',
            [is_verified, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Vendor not found.' });
        res.json({ success: true, vendor: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update vendor.' });
    }
};

// @route GET /api/admin/users
const getAllUsers = async (req, res) => {
    try {
        const result = await query(
            'SELECT id, name, email, role, avatar_url, created_at FROM users ORDER BY created_at DESC'
        );
        res.json({ success: true, users: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch users.' });
    }
};

// @route GET /api/admin/categories
const getCategories = async (req, res) => {
    try {
        const result = await query('SELECT * FROM categories ORDER BY name');
        res.json({ success: true, categories: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
    }
};

// @route POST /api/admin/categories
const createCategory = async (req, res) => {
    const { name, icon, description } = req.body;
    try {
        const result = await query(
            'INSERT INTO categories (name, icon, description) VALUES ($1, $2, $3) RETURNING *',
            [name, icon, description]
        );
        res.status(201).json({ success: true, category: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to create category.' });
    }
};

// @route DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        if (req.user.id === parseInt(id)) return res.status(400).json({ success: false, message: 'Cannot delete yourself.' });
        await query('DELETE FROM users WHERE id = $1', [id]);
        res.json({ success: true, message: 'User deleted.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to delete user.' });
    }
};

module.exports = { getStats, getAllVendors, verifyVendor, getAllUsers, getCategories, createCategory, deleteUser };
