# 🍜 StreetBite — Street Food Locator Web Application

A full-stack, production-grade street food locator web application built with **React + Vite** (frontend) and **Node.js + Express + PostgreSQL** (backend).

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, Tailwind CSS, Framer Motion, React Router v6 |
| Maps | Leaflet.js + React-Leaflet (OpenStreetMap) |
| State | TanStack Query (React Query) + React Context |
| Forms | React Hook Form + Zod validation |
| Backend | Node.js + Express.js |
| Database | PostgreSQL with raw `pg` (node-postgres) |
| Auth | JWT (access + refresh tokens), Bcryptjs |
| Notifications | React Hot Toast |
| Icons | Lucide React |

---

## 📁 Project Structure

```
streetbite/
├── client/                  # React Vite Frontend
│   └── src/
│       ├── components/      # Navbar, VendorCard, ReviewCard, StarRating, etc.
│       ├── context/         # AuthContext, LocationContext
│       ├── hooks/           # useGeolocation
│       ├── pages/           # Home, Explore, VendorDetail, MapView, Dashboard, Profile, Admin
│       ├── services/        # api.js (all Axios calls)
│       └── utils/           # helpers.js
├── server/                  # Express Backend
│   ├── config/              # db.js (PostgreSQL pool)
│   ├── controllers/         # auth, vendor, review, menu, admin, favorites
│   ├── middleware/          # authMiddleware, errorMiddleware
│   ├── routes/              # authRoutes, vendorRoutes, reviewRoutes, etc.
│   ├── utils/               # geoHelper.js (Haversine formula)
│   ├── migration.sql        # Full DB schema
│   ├── seed.js              # Sample data seeder
│   └── server.js            # Express entry point
├── .env                     # Environment variables
└── .env.example             # Template
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js v18+
- PostgreSQL 14+
- npm 9+

### 1. Clone & Install

```bash
# Install server dependencies
cd streetbite/server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment

Edit `.env` in the `streetbite/` root:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=streetbite_db
DB_USER=postgres
DB_PASSWORD=your_actual_password   # ← CHANGE THIS

JWT_SECRET=any-long-random-string-here
JWT_REFRESH_SECRET=another-long-random-string
```

### 3. Create Database & Run Migrations

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE streetbite_db;"

# Run migrations
psql -U postgres -d streetbite_db -f streetbite/server/migration.sql
```

### 4. Seed Sample Data

```bash
cd streetbite/server
node seed.js
```

This creates:
- 1 admin user, 3 vendor users, 5 regular users
- 10 verified vendors across India
- 8 food categories
- 20 menu items
- 15 reviews with ratings

### 5. Start the Application

**Terminal 1 — Backend:**
```bash
cd streetbite/server
npm run dev       # nodemon server.js on port 5000
```

**Terminal 2 — Frontend:**
```bash
cd streetbite/client
npm run dev       # Vite dev server on port 5173
```

Open: **http://localhost:5173**

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@streetbite.com | admin123 |
| Vendor | ramesh@vendor.com | vendor123 |
| User | user1@example.com | user1234 |

---

## ✨ Features

- **Home**: Animated hero, category pills, featured vendors, stats counter, testimonials
- **Explore**: Real-time search with debounce, cuisine/rating/open filters, sort, pagination
- **Map View**: Full-screen Leaflet map, custom markers, user location detection, radius circle
- **Vendor Detail**: Hero image, categorized menu, rating breakdown, review form
- **Favorites**: Save/remove vendors, persistent across sessions
- **Vendor Dashboard**: Analytics, menu CRUD, open/close toggle, profile editing
- **User Profile**: Edit name/avatar, favorites & review history
- **Admin Panel**: Stats, vendor verification, user management, category CRUD
- **Auth**: JWT access (15m) + refresh (7d) tokens, role-based routing

---

## 🔌 API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/refresh
PUT    /api/auth/profile

GET    /api/vendors              (search, filter, sort, paginate)
GET    /api/vendors/featured
GET    /api/vendors/nearby       (?lat=&lng=&radius=)
GET    /api/vendors/my           (vendor's own profile)
GET    /api/vendors/:id
POST   /api/vendors
PUT    /api/vendors/:id
DELETE /api/vendors/:id
GET    /api/vendors/:id/analytics

GET    /api/menu/:vendorId
POST   /api/menu
PUT    /api/menu/:id
DELETE /api/menu/:id

GET    /api/reviews/:vendorId
POST   /api/reviews
DELETE /api/reviews/:id
PUT    /api/reviews/:id/helpful
GET    /api/reviews/user/my

GET    /api/favorites
GET    /api/favorites/check/:vendorId
POST   /api/favorites/:vendorId
DELETE /api/favorites/:vendorId

GET    /api/admin/stats
GET    /api/admin/vendors
PUT    /api/admin/vendors/:id/verify
GET    /api/admin/users
DELETE /api/admin/users/:id
GET    /api/admin/categories
POST   /api/admin/categories
```
