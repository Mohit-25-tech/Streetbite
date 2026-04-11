const { query } = require('../config/db');
const { haversineSql } = require('../utils/geoHelper');
const { validationResult } = require('express-validator');

// @route GET /api/vendors
const getVendors = async (req, res) => {
    try {
        const {
            lat, lng, radius = 10, category, search,
            rating, sort = 'distance', page = 1, limit = 12,
            open_now, veg_only,
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        let conditions = ['v.is_verified = true'];
        let params = [];
        let idx = 1;
        let distanceSelect = 'NULL AS distance_km';
        let orderBy = 'v.avg_rating DESC';

        if (lat && lng) {
            distanceSelect = `${haversineSql(parseFloat(lat), parseFloat(lng))} AS distance_km`;
            if (radius) {
                conditions.push(`${haversineSql(parseFloat(lat), parseFloat(lng))} <= $${idx}`);
                params.push(parseFloat(radius));
                idx++;
            }
            if (sort === 'distance') orderBy = 'distance_km ASC';
        }

        if (category) {
            conditions.push(`v.category ILIKE $${idx}`);
            params.push(category);
            idx++;
        }

        if (search) {
            conditions.push(`(v.name ILIKE $${idx} OR v.description ILIKE $${idx} OR v.cuisine_type ILIKE $${idx} OR v.address ILIKE $${idx})`);
            params.push(`%${search}%`);
            idx++;
        }

        if (rating) {
            conditions.push(`v.avg_rating >= $${idx}`);
            params.push(parseFloat(rating));
            idx++;
        }

        if (open_now === 'true') {
            conditions.push(`v.is_open = true`);
        }

        if (sort === 'rating') orderBy = 'v.avg_rating DESC';
        if (sort === 'newest') orderBy = 'v.created_at DESC';
        if (sort === 'popularity') orderBy = 'v.total_reviews DESC';

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const countResult = await query(
            `SELECT COUNT(*) FROM vendors v ${whereClause}`,
            params
        );
        const total = parseInt(countResult.rows[0].count);

        params.push(parseInt(limit), offset);
        const result = await query(
            `SELECT v.*, u.name AS owner_name, ${distanceSelect}
       FROM vendors v
       JOIN users u ON v.user_id = u.id
       ${whereClause}
       ORDER BY ${orderBy}
       LIMIT $${idx} OFFSET $${idx + 1}`,
            params
        );

        res.json({
            success: true,
            vendors: result.rows,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
                limit: parseInt(limit),
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to fetch vendors.' });
    }
};

// @route GET /api/vendors/nearby
const getNearbyVendors = async (req, res) => {
    try {
        const { lat, lng, radius = 5, limit = 6 } = req.query;
        if (!lat || !lng) return res.status(400).json({ success: false, message: 'lat and lng required.' });

        const result = await query(
            `SELECT v.*, ${haversineSql(parseFloat(lat), parseFloat(lng))} AS distance_km
       FROM vendors v
       WHERE v.is_verified = true
         AND ${haversineSql(parseFloat(lat), parseFloat(lng))} <= $1
       ORDER BY distance_km ASC
       LIMIT $2`,
            [parseFloat(radius), parseInt(limit)]
        );
        res.json({ success: true, vendors: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch nearby vendors.' });
    }
};

// @route GET /api/vendors/featured
const getFeaturedVendors = async (req, res) => {
    try {
        const result = await query(
            `SELECT v.*, u.name AS owner_name FROM vendors v
       JOIN users u ON v.user_id = u.id
       WHERE v.is_verified = true
       ORDER BY v.avg_rating DESC, v.total_reviews DESC
       LIMIT 8`
        );
        res.json({ success: true, vendors: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch featured vendors.' });
    }
};

// @route GET /api/vendors/:id
const getVendorById = async (req, res) => {
    try {
        const { id } = req.params;
        const { lat, lng } = req.query;

        let distanceSelect = 'NULL AS distance_km';
        let params = [id];
        if (lat && lng) {
            distanceSelect = `${haversineSql(parseFloat(lat), parseFloat(lng))} AS distance_km`;
        }

        const result = await query(
            `SELECT v.*, u.name AS owner_name, u.email AS owner_email, ${distanceSelect}
       FROM vendors v
       JOIN users u ON v.user_id = u.id
       WHERE v.id = $1`,
            params
        );

        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Vendor not found.' });
        res.json({ success: true, vendor: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch vendor.' });
    }
};

// @route POST /api/vendors
const createVendor = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { name, description, category, cuisine_type, latitude, longitude, address, city, opening_time, closing_time, cover_image, logo } = req.body;
    try {
        const existing = await query('SELECT id FROM vendors WHERE user_id = $1', [req.user.id]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'You already have a vendor profile.' });
        }

        const result = await query(
            `INSERT INTO vendors (user_id, name, description, category, cuisine_type, latitude, longitude, address, city, opening_time, closing_time, cover_image, logo)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
            [req.user.id, name, description, category, cuisine_type, latitude, longitude, address, city, opening_time, closing_time, cover_image, logo]
        );
        res.status(201).json({ success: true, vendor: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to create vendor.' });
    }
};

// @route PUT /api/vendors/:id
const updateVendor = async (req, res) => {
    const { id } = req.params;
    try {
        const existing = await query('SELECT * FROM vendors WHERE id = $1', [id]);
        if (existing.rows.length === 0) return res.status(404).json({ success: false, message: 'Vendor not found.' });
        if (existing.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized.' });
        }

        const fields = ['name', 'description', 'category', 'cuisine_type', 'latitude', 'longitude', 'address', 'city', 'opening_time', 'closing_time', 'cover_image', 'logo', 'is_open'];
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
        if (updates.length === 0) return res.status(400).json({ success: false, message: 'No fields to update.' });

        params.push(id);
        const result = await query(
            `UPDATE vendors SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
            params
        );
        res.json({ success: true, vendor: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to update vendor.' });
    }
};

// @route DELETE /api/vendors/:id
const deleteVendor = async (req, res) => {
    const { id } = req.params;
    try {
        const existing = await query('SELECT * FROM vendors WHERE id = $1', [id]);
        if (existing.rows.length === 0) return res.status(404).json({ success: false, message: 'Vendor not found.' });
        if (existing.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized.' });
        }
        await query('DELETE FROM vendors WHERE id = $1', [id]);
        res.json({ success: true, message: 'Vendor deleted.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to delete vendor.' });
    }
};

// @route GET /api/vendors/my (vendor's own profile)
const getMyVendor = async (req, res) => {
    try {
        const result = await query('SELECT * FROM vendors WHERE user_id = $1', [req.user.id]);
        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'No vendor profile found.' });
        res.json({ success: true, vendor: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch vendor.' });
    }
};

// @route GET /api/vendors/:id/analytics
const getVendorAnalytics = async (req, res) => {
    const { id } = req.params;
    try {
        const vendor = await query('SELECT * FROM vendors WHERE id = $1 AND user_id = $2', [id, req.user.id]);
        if (vendor.rows.length === 0) return res.status(403).json({ success: false, message: 'Not authorized.' });

        const favCount = await query('SELECT COUNT(*) FROM favorites WHERE vendor_id = $1', [id]);
        const reviewCount = await query('SELECT COUNT(*), AVG(rating) FROM reviews WHERE vendor_id = $1', [id]);
        const menuCount = await query('SELECT COUNT(*) FROM menu_items WHERE vendor_id = $1', [id]);
        const ratingBreakdown = await query(
            'SELECT rating, COUNT(*) as count FROM reviews WHERE vendor_id = $1 GROUP BY rating ORDER BY rating DESC',
            [id]
        );

        res.json({
            success: true,
            analytics: {
                favorites: parseInt(favCount.rows[0].count),
                reviews: parseInt(reviewCount.rows[0].count),
                avg_rating: parseFloat(reviewCount.rows[0].avg) || 0,
                menu_items: parseInt(menuCount.rows[0].count),
                rating_breakdown: ratingBreakdown.rows,
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch analytics.' });
    }
};

module.exports = { getVendors, getNearbyVendors, getFeaturedVendors, getVendorById, createVendor, updateVendor, deleteVendor, getMyVendor, getVendorAnalytics };
