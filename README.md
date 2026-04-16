# 🍜 StreetBite — Street Food Locator & Multi-Vendor Ordering Platform

A full-stack, production-grade street food locator and food-ordering web application built with **React + Vite** (frontend) and **Node.js + Express + PostgreSQL** (backend).

StreetBite allows users to discover local street food, view menus, and place orders seamlessly across **multiple vendors simultaneously** using a global sliding cart architecture.

---

## 🚀 Live Demo

- **Frontend (Vercel)**: [View Live App](https://streetbite-gamma.vercel.app/)
- **Backend API (Render)**: [API Endpoint](https://streetbite-server.onrender.com/) *(Returns 404 for root `/`, use `/api/health`)*

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite, Vanilla CSS, Framer Motion, React Router v6 |
| **Maps & Geolocation**| Leaflet.js + React-Leaflet (OpenStreetMap) |
| **State Management** | TanStack Query (React Query) + Custom React Contexts (Auth, Location, Cart) |
| **Forms** | React Hook Form + Zod validation |
| **Backend** | Node.js + Express.js |
| **Database** | PostgreSQL with raw `pg` (node-postgres) hosted on Neon.tech |
| **Auth** | JWT (access + refresh tokens), Bcryptjs |
| **Notifications** | React Hot Toast |
| **Icons** | Lucide React |

---

## 📁 Project Structure

```
streetbite/
├── client/                  # React Vite Frontend (Deployed on Vercel)
│   └── src/
│       ├── components/      # GlobalCart, Navbar, VendorCard, ReviewCard, etc.
│       ├── context/         # AuthContext, LocationContext, CartContext
│       ├── hooks/           # useGeolocation
│       ├── pages/           # Home, Explore, VendorDetail, MapView, Login, Register, ForgotPassword, ResetPassword, PastOrders
│       ├── services/        # api.js (Axios configuration)
│       └── utils/           # helpers.js
├── server/                  # Node.js Express Backend (Deployed on Render)
│   ├── config/              # db.js (PostgreSQL pool with Neon support)
│   ├── controllers/         # auth, vendor, review, menu, admin, favorites, order
│   ├── middleware/          # authMiddleware, errorMiddleware
│   ├── routes/              # Express API Routes
│   ├── migration.sql        # Core DB schema (Users, Vendors, Menu)
│   ├── orders_migration.sql # Orders & Order Items DB schema
│   ├── seed.js              # Sample data seeder (10 Vendors, 20 Items, etc.)
│   └── server.js            # Express entry point
└── .env                     # Environment variables
```

---

## ✨ Key Features

- **Multi-Vendor Global Cart**: Order from multiple street food stalls at the same time. The cart intelligently splits and processes independent orders per vendor.
- **Interactive Checkout Flow**: Multi-step checkout including Map Validation, Summary, Payment options, and order tracking.
- **Modern Demo Payments**: Card, UPI, wallet, net banking, and COD flows with stored payment metadata and payment status history.
- **Password Recovery**: Token-backed forgot-password and reset-password flow built into the login experience.
- **Order Ledger**: Every checkout stores payment method, payment provider, status, reference, and JSON payment details for order history.
- **Real-Time Discovery**: Animated hero, category pills, featured vendors, and live search with debounce filters.
- **Interactive Map View**: Full-screen Leaflet map, custom markers, user location detection, and proximity radius circles.
- **Vendor Dashboards**: Analytics, menu CRUD operations, open/close shop toggle, and profile editing.
- **Admin Panel**: High-level platform statistics, vendor verification approval, and user management.
- **Robust Authentication**: JWT access (15m) + secure HTTP-only refresh (7d) tokens with strict role-based routing (Admin, Vendor, User).

---

## 🔑 Demo Credentials

Test out the live application using the following seeded credentials:

| Role | Email | Password |
|---|---|---|
| **Admin** | admin@streetbite.com | admin123 |
| **Vendor** | ramesh@vendor.com | vendor123 |
| **User** | user1@example.com | user1234 |

---

## ⚡ Deployment Guide (Cloud)

This application is designed to be completely decoupled and natively ready for Cloud Deployment without needing local databases.

### 1. Database (Neon.tech)
1. Create a free PostgreSQL database on [Neon.tech](https://neon.tech/).
2. Copy the **Pooled Connection String** (e.g. `postgres://...-pooler...`).

### 2. Backend (Render.com)
1. Connect your GitHub repository to a new **Web Service** on Render.
2. **Root Directory**: `server`
3. **Build Command**: `npm install`
4. **Start Command**: `node run_orders_migration.js && npm start` *(The migration automatically structures the DB on boot!)*
5. **Environment Variables**:
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = `[Your Neon Connection String]`
   - `JWT_SECRET` = `[Random Secret]`
   - `JWT_REFRESH_SECRET` = `[Random Secret]`
   - `CLIENT_URL` = `[Your Vercel URL]` *(Add this after deploying frontend)*
6. If you are deploying on an older database, make sure the order migration runs once so the payment metadata columns and password reset table are created.

### 3. Frontend (Vercel)
1. Import your repository into a new **Vercel** project.
2. **Root Directory**: `client`
3. **Framework Preset**: `Vite`
4. **Environment Variables**:
   - `VITE_API_URL` = `https://[your-render-backend-url]/api`
5. Click **Deploy**. Update Render's `CLIENT_URL` with your new Vercel URL to fix CORS.

*Looking to populate test data? Change the Render Start Command temporarily to:* 
`node run_orders_migration.js && npm run seed && npm start`

---

## 🔌 Core API Endpoints

```
[AUTH]
POST   /api/auth/register, /api/auth/login, /api/auth/refresh
POST   /api/auth/forgot-password, /api/auth/reset-password

[PAYMENTS]
POST   /api/orders               (stores payment_method, payment_status, provider, reference, details)

[VENDORS & MENU]
GET    /api/vendors              (search, filter, sort, paginate)
GET    /api/vendors/nearby       (?lat=&lng=&radius=)
GET    /api/menu/:vendorId       (fetch grouped menus)

[ORDERS & CART]
POST   /api/orders               (Create multi-vendor orders)
GET    /api/orders/my            (Fetch past orders & items)
POST   /api/reviews              (Review system strictly attached to Past Orders)

[ADMIN]
GET    /api/admin/stats          (Platform-wide analytics)
PUT    /api/admin/vendors/:id/verify
```
