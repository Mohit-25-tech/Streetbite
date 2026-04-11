require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { pool } = require('./config/db');
const fs = require('fs');
const path = require('path');

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('🔄 Running StreetBite migration...\n');
        const sql = fs.readFileSync(path.join(__dirname, 'migration.sql'), 'utf8');
        await client.query(sql);
        console.log('✅ Migration completed successfully!\n');
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
