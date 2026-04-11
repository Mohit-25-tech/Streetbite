const { query } = require('../config/db');
const { validationResult } = require('express-validator');

// @route GET /api/menu/:vendorId
const getMenu = async (req, res) => {
    try {
        const { vendorId } = req.params;
        const result = await query(
            'SELECT * FROM menu_items WHERE vendor_id = $1 ORDER BY category, name',
            [vendorId]
        );

        // Group by category
        const grouped = result.rows.reduce((acc, item) => {
            const cat = item.category || 'Other';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(item);
            return acc;
        }, {});

        res.json({ success: true, items: result.rows, grouped });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch menu.' });
    }
};

// @route POST /api/menu
const createMenuItem = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { vendor_id, name, description, price, image_url, category, is_veg } = req.body;
    try {
        const vendor = await query('SELECT id FROM vendors WHERE id = $1 AND user_id = $2', [vendor_id, req.user.id]);
        if (vendor.rows.length === 0 && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized.' });
        }

        const result = await query(
            `INSERT INTO menu_items (vendor_id, name, description, price, image_url, category, is_veg)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [vendor_id, name, description, parseFloat(price), image_url, category, is_veg ?? true]
        );
        res.status(201).json({ success: true, item: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to create menu item.' });
    }
};

// @route PUT /api/menu/:id
const updateMenuItem = async (req, res) => {
    const { id } = req.params;
    try {
        const item = await query(
            `SELECT mi.*, v.user_id FROM menu_items mi JOIN vendors v ON mi.vendor_id = v.id WHERE mi.id = $1`,
            [id]
        );
        if (item.rows.length === 0) return res.status(404).json({ success: false, message: 'Item not found.' });
        if (item.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized.' });
        }

        const fields = ['name', 'description', 'price', 'image_url', 'category', 'is_veg', 'is_available'];
        const updates = [];
        const params = [];
        let idx = 1;
        for (const field of fields) {
            if (req.body[field] !== undefined) {
                updates.push(`${field} = $${idx}`);
                params.push(req.body[field]);
                idx++;
            }
        }
        if (updates.length === 0) return res.status(400).json({ success: false, message: 'Nothing to update.' });

        params.push(id);
        const result = await query(
            `UPDATE menu_items SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
            params
        );
        res.json({ success: true, item: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update item.' });
    }
};

// @route DELETE /api/menu/:id
const deleteMenuItem = async (req, res) => {
    const { id } = req.params;
    try {
        const item = await query(
            'SELECT mi.*, v.user_id FROM menu_items mi JOIN vendors v ON mi.vendor_id = v.id WHERE mi.id = $1',
            [id]
        );
        if (item.rows.length === 0) return res.status(404).json({ success: false, message: 'Item not found.' });
        if (item.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized.' });
        }
        await query('DELETE FROM menu_items WHERE id = $1', [id]);
        res.json({ success: true, message: 'Item deleted.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to delete item.' });
    }
};

module.exports = { getMenu, createMenuItem, updateMenuItem, deleteMenuItem };
