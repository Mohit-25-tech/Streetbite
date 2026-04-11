require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { query, pool } = require('./config/db');
const bcrypt = require('bcryptjs');

async function seed() {
    console.log('🌱 Starting seed...');
    try {
        // Users
        const adminHash = await bcrypt.hash('admin123', 12);
        const userHash = await bcrypt.hash('user1234', 12);
        const vendorHash = await bcrypt.hash('vendor123', 12);

        const adminRes = await query(
            `INSERT INTO users (name, email, password_hash, role) VALUES ('Admin User','admin@streetbite.com',$1,'admin') ON CONFLICT (email) DO UPDATE SET role='admin' RETURNING id`,
            [adminHash]
        );

        // Create 3 vendor users
        const vendorUsers = [];
        const vendorNames = ['Ramesh Kumar', 'Priya Sharma', 'Ahmed Khan'];
        const vendorEmails = ['ramesh@vendor.com', 'priya@vendor.com', 'ahmed@vendor.com'];
        for (let i = 0; i < 3; i++) {
            const r = await query(
                `INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,'vendor') ON CONFLICT (email) DO UPDATE SET name=$1 RETURNING id`,
                [vendorNames[i], vendorEmails[i], vendorHash]
            );
            vendorUsers.push(r.rows[0].id);
        }

        // Regular users
        const regularUsers = [];
        for (let i = 1; i <= 5; i++) {
            const r = await query(
                `INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,'user') ON CONFLICT (email) DO UPDATE SET name=$1 RETURNING id`,
                [`User ${i}`, `user${i}@example.com`, userHash]
            );
            regularUsers.push(r.rows[0].id);
        }

        console.log('✅ Users seeded');

        // Categories
        const cats = [
            { name: 'Chaat', icon: '🥗', description: 'Tangy, spicy street snacks' },
            { name: 'Momos', icon: '🥟', description: 'Steamed & fried dumplings' },
            { name: 'Rolls', icon: '🌯', description: 'Delicious wraps and rolls' },
            { name: 'Biryani', icon: '🍚', description: 'Fragrant rice dishes' },
            { name: 'Juice & Drinks', icon: '🥤', description: 'Fresh juices and beverages' },
            { name: 'Sandwiches', icon: '🥪', description: 'Grilled and toasted sandwiches' },
            { name: 'Sweets', icon: '🍮', description: 'Traditional Indian sweets' },
            { name: 'Noodles', icon: '🍜', description: 'Hakka noodles and Chinese' },
        ];
        for (const c of cats) {
            await query(`INSERT INTO categories (name, icon, description) VALUES ($1,$2,$3) ON CONFLICT (name) DO NOTHING`, [c.name, c.icon, c.description]);
        }
        console.log('✅ Categories seeded');

        // Vendors (10 vendors)
        const vendors = [
            { user_id: vendorUsers[0], name: 'Ramesh Chaat Corner', description: 'Famous for crispy golgappas and tangy aloo tikki since 1985. A street food institution loved by all age groups.', category: 'Chaat', cuisine_type: 'North Indian', latitude: 28.6139, longitude: 77.2090, address: 'Connaught Place, Block A', city: 'New Delhi', is_open: true, avg_rating: 4.5, total_reviews: 5, cover_image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800', logo: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200' },
            { user_id: vendorUsers[0], name: 'Momo Magic', description: 'Authentic Tibetan momos made fresh daily. Try our spicy schezwan and tandoori momos!', category: 'Momos', cuisine_type: 'Tibetan', latitude: 28.6200, longitude: 77.2150, address: 'Lajpat Nagar Market', city: 'New Delhi', is_open: true, avg_rating: 4.7, total_reviews: 4, cover_image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800', logo: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=200' },
            { user_id: vendorUsers[1], name: 'Priya Roll Station', description: 'Kolkata-style kathi rolls and egg rolls made with love. Best rolls in town guaranteed.', category: 'Rolls', cuisine_type: 'Kolkata Street', latitude: 22.5726, longitude: 88.3639, address: 'Park Street, Near Flurys', city: 'Kolkata', is_open: true, avg_rating: 4.3, total_reviews: 3, cover_image: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=800', logo: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=200' },
            { user_id: vendorUsers[1], name: 'Biryani Baadshah', description: 'Dum biryani cooked on slow flame with premium basmati rice. Royal taste, street price.', category: 'Biryani', cuisine_type: 'Hyderabadi', latitude: 17.3850, longitude: 78.4867, address: 'Charminar Road, Old City', city: 'Hyderabad', is_open: true, avg_rating: 4.8, total_reviews: 4, cover_image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800', logo: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200' },
            { user_id: vendorUsers[2], name: 'Juice Junction Ahmed', description: 'Fresh fruit juices, sugarcane juice, and cold drinks. Made with real fruits, no artificial flavors.', category: 'Juice & Drinks', cuisine_type: 'Beverages', latitude: 19.0760, longitude: 72.8777, address: 'Juhu Beach Road', city: 'Mumbai', is_open: true, avg_rating: 4.2, total_reviews: 3, cover_image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=800', logo: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=200' },
            { user_id: vendorUsers[2], name: 'Bombay Sandwich House', description: 'Iconic Mumbai-style grilled sandwiches with special green chutney and cheese. A must-try!', category: 'Sandwiches', cuisine_type: 'Mumbai Street', latitude: 19.0820, longitude: 72.8800, address: 'CST Station Road', city: 'Mumbai', is_open: false, avg_rating: 4.6, total_reviews: 3, cover_image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800', logo: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=200' },
            { user_id: vendorUsers[0], name: 'Chole Bhature Wala', description: 'Crispy, fluffy bhaturas served with spicy chole. Delhi breakfast staple for over 30 years.', category: 'Chaat', cuisine_type: 'Punjabi', latitude: 28.6500, longitude: 77.1000, address: 'Rajouri Garden Main Market', city: 'New Delhi', is_open: true, avg_rating: 4.4, total_reviews: 2, cover_image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800', logo: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200' },
            { user_id: vendorUsers[1], name: 'Sweet Tooth Jalebi', description: 'Piping hot jalebis and rabdi made fresh every morning. Traditional recipes from Rajasthan.', category: 'Sweets', cuisine_type: 'Rajasthani', latitude: 26.9124, longitude: 75.7873, address: 'Johari Bazaar, Pink City', city: 'Jaipur', is_open: true, avg_rating: 4.9, total_reviews: 2, cover_image: 'https://images.unsplash.com/photo-1548365328-8c6db3220e4c?w=800', logo: 'https://images.unsplash.com/photo-1548365328-8c6db3220e4c?w=200' },
            { user_id: vendorUsers[2], name: 'Dragon Noodle Cart', description: 'Street-style hakka noodles and Manchurian with authentic Indo-Chinese flavors.', category: 'Noodles', cuisine_type: 'Indo-Chinese', latitude: 22.5726, longitude: 88.3700, address: 'Tiretti Bazaar, Chinatown', city: 'Kolkata', is_open: true, avg_rating: 4.1, total_reviews: 2, cover_image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800', logo: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200' },
            { user_id: vendorUsers[0], name: 'Vada Pav Express', description: 'Mumbai\'s soul food - spicy vada pav with 5 types of chutneys. Quick, affordable, delicious.', category: 'Chaat', cuisine_type: 'Maharashtrian', latitude: 19.1000, longitude: 72.8600, address: 'Andheri West Station', city: 'Mumbai', is_open: true, avg_rating: 4.6, total_reviews: 2, cover_image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800', logo: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=200' },
        ];

        const vendorIds = [];
        for (const v of vendors) {
            const r = await query(
                `INSERT INTO vendors (user_id, name, description, category, cuisine_type, latitude, longitude, address, city, is_open, avg_rating, total_reviews, cover_image, logo, is_verified)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,true) RETURNING id`,
                [v.user_id, v.name, v.description, v.category, v.cuisine_type, v.latitude, v.longitude, v.address, v.city, v.is_open, v.avg_rating, v.total_reviews, v.cover_image, v.logo]
            );
            vendorIds.push(r.rows[0].id);
        }
        console.log('✅ Vendors seeded');

        // Menu Items (20 items across vendors)
        const menuItems = [
            { vendor_id: vendorIds[0], name: 'Pani Puri (6 pcs)', description: 'Crispy golgappas with mint water', price: 40, category: 'Snacks', is_veg: true, image_url: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400' },
            { vendor_id: vendorIds[0], name: 'Aloo Tikki Chaat', description: 'Crispy potato patties with chutneys', price: 60, category: 'Chaat', is_veg: true, image_url: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400' },
            { vendor_id: vendorIds[0], name: 'Bhel Puri', description: 'Puffed rice with vegetables and chutneys', price: 50, category: 'Chaat', is_veg: true, image_url: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400' },
            { vendor_id: vendorIds[1], name: 'Veg Steam Momos (8 pcs)', description: 'Classic steamed vegetable dumplings', price: 80, category: 'Momos', is_veg: true, image_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400' },
            { vendor_id: vendorIds[1], name: 'Chicken Fried Momos (8 pcs)', description: 'Crispy fried chicken dumplings', price: 120, category: 'Momos', is_veg: false, image_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400' },
            { vendor_id: vendorIds[1], name: 'Tandoori Momos (6 pcs)', description: 'Grilled momos with spicy coating', price: 140, category: 'Momos', is_veg: true, image_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400' },
            { vendor_id: vendorIds[2], name: 'Egg Kathi Roll', description: 'Egg-wrapped paratha with filling', price: 70, category: 'Rolls', is_veg: false, image_url: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=400' },
            { vendor_id: vendorIds[2], name: 'Chicken Roll', description: 'Juicy chicken in crispy paratha', price: 100, category: 'Rolls', is_veg: false, image_url: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=400' },
            { vendor_id: vendorIds[3], name: 'Veg Dum Biryani', description: 'Fragrant vegetable biryani', price: 150, category: 'Biryani', is_veg: true, image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400' },
            { vendor_id: vendorIds[3], name: 'Chicken Hyderabadi Biryani', description: 'Authentic Hyderabadi dum biryani', price: 200, category: 'Biryani', is_veg: false, image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400' },
            { vendor_id: vendorIds[4], name: 'Fresh Sugarcane Juice', description: 'Cold fresh pressed sugarcane', price: 30, category: 'Juices', is_veg: true, image_url: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400' },
            { vendor_id: vendorIds[4], name: 'Mixed Fruit Juice', description: 'Seasonal fresh fruit blend', price: 60, category: 'Juices', is_veg: true, image_url: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400' },
            { vendor_id: vendorIds[5], name: 'Grilled Cheese Sandwich', description: 'Loaded cheesy grilled sandwich', price: 80, category: 'Sandwiches', is_veg: true, image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400' },
            { vendor_id: vendorIds[5], name: 'Bombay Club Sandwich', description: 'Triple-decker with chutney', price: 110, category: 'Sandwiches', is_veg: true, image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400' },
            { vendor_id: vendorIds[6], name: 'Chole Bhature', description: 'Two fluffy bhaturas with spicy chole', price: 90, category: 'Main', is_veg: true, image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400' },
            { vendor_id: vendorIds[7], name: 'Hot Jalebi (250g)', description: 'Fresh hot crispy jalebis', price: 60, category: 'Sweets', is_veg: true, image_url: 'https://images.unsplash.com/photo-1548365328-8c6db3220e4c?w=400' },
            { vendor_id: vendorIds[7], name: 'Jalebi Rabdi', description: 'Jalebi with creamy rabdi', price: 90, category: 'Sweets', is_veg: true, image_url: 'https://images.unsplash.com/photo-1548365328-8c6db3220e4c?w=400' },
            { vendor_id: vendorIds[8], name: 'Veg Hakka Noodles', description: 'Stir-fried noodles with vegetables', price: 80, category: 'Noodles', is_veg: true, image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400' },
            { vendor_id: vendorIds[8], name: 'Chicken Manchurian', description: 'Crispy chicken in schezwan sauce', price: 120, category: 'Starters', is_veg: false, image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400' },
            { vendor_id: vendorIds[9], name: 'Vada Pav', description: 'Spicy potato fritter in bun', price: 20, category: 'Snacks', is_veg: true, image_url: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400' },
        ];

        for (const item of menuItems) {
            await query(
                'INSERT INTO menu_items (vendor_id, name, description, price, category, is_veg, image_url) VALUES ($1,$2,$3,$4,$5,$6,$7)',
                [item.vendor_id, item.name, item.description, item.price, item.category, item.is_veg, item.image_url]
            );
        }
        console.log('✅ Menu items seeded');

        // Reviews (15 reviews)
        const reviews = [
            { user_id: regularUsers[0], vendor_id: vendorIds[0], rating: 5, comment: 'Best pani puri in all of Delhi! The mint water is absolutely divine. I visit here every weekend without fail.' },
            { user_id: regularUsers[1], vendor_id: vendorIds[0], rating: 4, comment: 'Amazing aloo tikki chaat. The chutneys are perfectly balanced. A bit crowded on weekends.' },
            { user_id: regularUsers[2], vendor_id: vendorIds[0], rating: 5, comment: 'Authentic street food experience. Worth every rupee. The uncle is so friendly!' },
            { user_id: regularUsers[3], vendor_id: vendorIds[0], rating: 4, comment: 'Great quality and hygiene. My go-to place for evening snacks.' },
            { user_id: regularUsers[4], vendor_id: vendorIds[0], rating: 4, comment: 'Crispy golgappas and generous portions. Highly recommend!' },
            { user_id: regularUsers[0], vendor_id: vendorIds[1], rating: 5, comment: 'Tandoori momos are out of this world! Spicy, juicy, and perfectly cooked. This is the best momo stall I\'ve found.' },
            { user_id: regularUsers[1], vendor_id: vendorIds[1], rating: 5, comment: 'Authentic Tibetan momos, just like Dharamsala. The skin is perfectly thin and the filling is delicious.' },
            { user_id: regularUsers[2], vendor_id: vendorIds[1], rating: 4, comment: 'Really good momos with variety of options. The fried momos are super crispy.' },
            { user_id: regularUsers[3], vendor_id: vendorIds[1], rating: 5, comment: 'Can\'t stop coming back! The schezwan chutney pairs perfectly with every momo.' },
            { user_id: regularUsers[0], vendor_id: vendorIds[2], rating: 4, comment: 'Classic Kolkata rolls done right. The egg roll is flaky and the filling is generous.' },
            { user_id: regularUsers[1], vendor_id: vendorIds[2], rating: 5, comment: 'Authentic kathi rolls! Reminds me of Nizam\'s but way more affordable.' },
            { user_id: regularUsers[2], vendor_id: vendorIds[2], rating: 4, comment: 'Good quality, fresh ingredients. Chicken roll was excellent!' },
            { user_id: regularUsers[0], vendor_id: vendorIds[3], rating: 5, comment: 'Best biryani I have ever had from a street vendor. The slow-cooked dum biryani is heavenly.' },
            { user_id: regularUsers[1], vendor_id: vendorIds[3], rating: 5, comment: 'Hyderabadi biryani that tastes like the real thing. Perfectly spiced and fragrant.' },
            { user_id: regularUsers[2], vendor_id: vendorIds[3], rating: 4, comment: 'Generous portion and great taste. Will definitely order again.' },
        ];

        for (const r of reviews) {
            await query(
                'INSERT INTO reviews (user_id, vendor_id, rating, comment) VALUES ($1,$2,$3,$4) ON CONFLICT (user_id, vendor_id) DO NOTHING',
                [r.user_id, r.vendor_id, r.rating, r.comment]
            );
        }
        console.log('✅ Reviews seeded');

        // Add some favorites
        for (let i = 0; i < Math.min(5, regularUsers.length); i++) {
            for (let j = 0; j < 3; j++) {
                await query(
                    'INSERT INTO favorites (user_id, vendor_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
                    [regularUsers[i], vendorIds[j * 2]]
                );
            }
        }
        console.log('✅ Favorites seeded');

        console.log('\n🎉 Seed completed successfully!');
        console.log('\n📋 Test Credentials:');
        console.log('   Admin: admin@streetbite.com / admin123');
        console.log('   Vendor: ramesh@vendor.com / vendor123');
        console.log('   User: user1@example.com / user1234');
    } catch (err) {
        console.error('❌ Seed failed:', err.message);
        console.error(err.stack);
    } finally {
        await pool.end();
    }
}

seed();
