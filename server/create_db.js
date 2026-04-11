const { Client } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: 'postgres' // Connect to the default database
});

async function main() {
    try {
        await client.connect();
        await client.query('CREATE DATABASE streetbite_db');
        console.log('Database streetbite_db created successfully');
    } catch (e) {
        if (e.code === '42P04') {
            console.log('Database already exists.');
        } else {
            console.error('Error creating database:', e);
			process.exit(1);
        }
    } finally {
        await client.end();
    }
}
main();
