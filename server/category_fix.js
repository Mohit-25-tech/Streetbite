require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { pool } = require('./config/db');

async function fixVendors() {
    const categories = ['Chaat', 'Momos', 'Rolls', 'Biryani', 'Juice & Drinks', 'Sandwiches', 'Sweets', 'Noodles'];
    const client = await pool.connect();
    try {
        const res = await client.query('SELECT id FROM vendors');
        for (let i = 0; i < res.rows.length; i++) {
            const cat = categories[i % categories.length];
            await client.query('UPDATE vendors SET category = $1 WHERE id = $2', [cat, res.rows[i].id]);
        }
        console.log('Categories updated successfully!');
    } catch (e) {
        console.error(e);
    } finally {
        client.release();
        await pool.end();
    }
}
fixVendors();
