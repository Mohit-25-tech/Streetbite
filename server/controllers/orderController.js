const { query, getClient } = require('../config/db');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
    const userId = req.user.id;
    const { vendorId, items, totalAmount, paymentMethod, distanceKm } = req.body;

    if (!vendorId || !items || items.length === 0 || !totalAmount) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const client = await getClient();
    try {
        await client.query('BEGIN');

        // Insert order
        const orderRes = await client.query(
            `INSERT INTO orders (user_id, vendor_id, total_amount, payment_method, delivery_distance_km) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [userId, vendorId, totalAmount, paymentMethod, distanceKm || null]
        );
        const order = orderRes.rows[0];

        // Insert order items
        for (const item of items) {
            await client.query(
                `INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price) 
                 VALUES ($1, $2, $3, $4)`,
                [order.id, item.menu_item_id, item.quantity, item.unit_price]
            );
        }

        await client.query('COMMIT');
        res.status(201).json({ success: true, order });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Create order error:', error);
        res.status(500).json({ message: 'Server error placing order' });
    } finally {
        client.release();
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my
// @access  Private
const getMyOrders = async (req, res) => {
    const userId = req.user.id;

    try {
        // Fetch orders with vendor details
        const ordersRes = await query(
            `SELECT o.*, v.name as vendor_name, v.logo as vendor_logo 
             FROM orders o 
             JOIN vendors v ON o.vendor_id = v.id 
             WHERE o.user_id = $1 
             ORDER BY o.created_at DESC`,
            [userId]
        );

        const orders = ordersRes.rows;

        // Fetch items for these orders
        if (orders.length > 0) {
            const orderIds = orders.map(o => o.id);
            const placeholders = orderIds.map((_, i) => `$${i + 1}`).join(',');
            
            const itemsRes = await query(
                `SELECT oi.*, m.name as item_name, m.image_url 
                 FROM order_items oi 
                 JOIN menu_items m ON oi.menu_item_id = m.id 
                 WHERE oi.order_id IN (${placeholders})`,
                orderIds
            );

            const allItems = itemsRes.rows;
            
            // Attach items to orders
            for (let order of orders) {
                order.items = allItems.filter(item => item.order_id === order.id);
            }
        }

        res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error('Get my orders error:', error);
        res.status(500).json({ message: 'Server error fetching orders' });
    }
};

module.exports = {
    createOrder,
    getMyOrders
};
