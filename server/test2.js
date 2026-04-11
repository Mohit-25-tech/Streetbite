require('dotenv').config({ path: '../.env' });
const { pool } = require('./config/db');

async function test() {
    try {
        const res = await pool.query("SELECT id FROM vendors WHERE name = 'Momo Magic'");
        if(res.rows.length === 0){
            console.log('vendor not found');
            process.exit(0);
        }
        const id = res.rows[0].id;
        console.log('Testing vendor ID:', id);
        
        const responses = await Promise.all([
            fetch('http://localhost:5000/api/vendors/' + id),
            fetch('http://localhost:5000/api/menu/' + id),
            fetch('http://localhost:5000/api/reviews/' + id + '?limit=20')
        ]);
        
        console.log('Vendor res:', responses[0].status);
        console.log('Menu res:', responses[1].status, await responses[1].text());
        console.log('Review res:', responses[2].status, await responses[2].text());
    } catch(e) {
        console.error(e);
    }
    process.exit(0);
}
test();
