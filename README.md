# EasyBuy — Enterprise Amazon-Inspired E-Commerce Platform

A complete, production-grade, full-stack e-commerce platform inspired by Amazon's shopping ecosystem, built with a customer-facing storefront, an administrative management portal, a scalable Node.js/Express backend, and a relational-modeled MongoDB database.

---

## 🚀 Key Architectural Highlights

- **Frontend Architecture**: Built using **React (TypeScript)**, **Vite**, **Tailwind CSS**, and **Redux Toolkit**. Server-state synchronization, automatic caching, and optimistic invalidations are powered by **RTK Query**.
- **Backend Architecture**: Enterprise **Node.js with Express (ES Modules)**, following clean separation of concerns across controllers, services, middleware, models, routes, and utilities.
- **Database Engine**: **MongoDB** with 20 normalized **Mongoose** schemas featuring indexing, compound unique constraints, and atomic inventory updates.
- **Dynamic Category Attributes**: Categories dynamically dictate required specifications (e.g., RAM/Processor for Electronics; Size/Fabric for Fashion; Shoe Size for Footwear; Weight/Ingredients for Grocery).
- **Multi-Variant Matrix**: Full support for attribute-driven variants (Size × Color) with individual SKUs, pricing overrides, and independent stock balances.
- **Location-Based Fulfillment**: PIN code lookup and delivery zone validation (e.g., standard, express, same-day delivery speeds and shipping fees).
- **Recommendation Engine**: Recommendation service providing:
  - *Frequently Bought Together* (co-purchase graph)
  - *Customers Also Viewed* (session browsing behavior)
  - *Similar Products* (category & attribute matching)
- **Comprehensive Admin Portal**:
  - Real-time revenue, order volume, and customer acquisition telemetry
  - Dynamic Product Creator with instant variant matrix generation & dynamic attribute forms
  - Inventory management with stock adjustment auditing and low-stock alerts
  - Order fulfillment workflow (Pending → Confirmed → Shipped → Out for Delivery → Delivered) with live tracking updates
  - Coupon management (flat, percentage, and minimum-spend rules)
  - Customer directory and verified review moderation
- **Theme System**: Full Light & Dark modes based on custom green accents (`rgb(26, 124, 26)` and `#66bb6a`), configured via CSS variables and an inline anti-flash script.

---

## 🛠️ Technology Stack

| Domain | Technologies |
|---|---|
| **Client** | Vite, React 19, TypeScript, Tailwind CSS, Redux Toolkit, RTK Query, React Router DOM, Framer Motion, GSAP, Lucide React, Sonner |
| **Server** | Node.js, Express.js (ES Modules - JavaScript), Mongoose, JWT, bcryptjs, Cookie-Parser, Multer, Cloudinary, Nodemailer, Helmet, Morgan |
| **Database** | MongoDB (Compass Compatible), 20 Schemas with relational population and indexing |

---

## 📂 Project Structure

```
EasyBuy/
├── client/                     # Frontend Vite + React + TypeScript Application
│   ├── src/
│   │   ├── components/         # Reusable UI components (Navbar, Footer, ProductCard, etc.)
│   │   ├── layouts/            # CustomerLayout, AdminLayout
│   │   ├── pages/              # Customer pages (Home, Products, Details, Cart, Checkout, etc.)
│   │   │   └── admin/          # Admin pages (Dashboard, Products, Orders, Inventory, etc.)
│   │   ├── redux/
│   │   │   ├── api/            # RTK Query API slices (authApi, productApi, orderApi, etc.)
│   │   │   ├── slices/         # 16 Redux Toolkit slices (auth, cart, theme, filter, etc.)
│   │   │   ├── store.ts        # Central Redux store configuration
│   │   │   └── hooks.ts        # Strongly typed useAppDispatch and useAppSelector
│   │   ├── types/              # Comprehensive TypeScript interfaces
│   │   ├── index.css           # Global theme variables and utility classes
│   │   └── App.tsx             # Route definitions with protected boundaries
│   └── package.json
│
├── server/                     # Backend Node.js + Express + MongoDB Service
│   ├── config/                 # Database and Cloudinary configurations
│   ├── controllers/            # Route handler business logic
│   ├── middleware/             # Authentication, error handling, upload middleware
│   ├── models/                 # 20 Mongoose Data Models
│   ├── routes/                 # RESTful API route definitions
│   ├── scripts/                # Database seed script with 32+ realistic products
│   ├── services/               # Recommendation engine, analytics, and notification services
│   ├── utils/                  # JWT token helpers, email notifications
│   ├── app.js                  # Express app setup with CORS, cookies, security
│   ├── server.js               # HTTP server entry point
│   └── package.json
│
├── .gitignore                  # Root Git ignore rules
└── README.md                   # Platform documentation
```

---

## 🔐 Demo Credentials

The database comes pre-seeded with accounts ready for evaluation:

### 1. Administrative Account (Full Access)
- **URL**: `http://localhost:5173/admin/login`
- **Email**: `admin@gmail.com`
- **Password**: `123456`
- **Role**: `ADMIN`

### 2. Verified Customer Account
- **URL**: `http://localhost:5173/login`
- **Email**: `customer@gmail.com`
- **Password**: `password123`
- **Features**: Pre-loaded with order history, saved addresses, and active cart items.

---

## ⚡ Quick Start & Setup

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB** running locally on default port `mongodb://127.0.0.1:27017` or a MongoDB Atlas connection string.

### 2. Environment Configuration

#### Backend (`server/.env`):
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/ecommerce_platform
JWT_SECRET=super_secret_jwt_key_easybuy_ecommerce_2026
JWT_EXPIRE=7d
COOKIE_EXPIRE=7
EMAIL_SERVICE=gmail
EMAIL_USER=demo@easybuy.com
EMAIL_PASS=demopassword
CLOUDINARY_CLOUD_NAME=demo_cloud
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=abcdef123456
```

#### Frontend (`client/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Database Seeding
Populate the database with 32+ realistic products across 8 categories, variants, dynamic attribute definitions, delivery zones, sample orders, reviews, and test accounts:

```bash
cd server
npm run seed
```

### 4. Running the Platform

#### Run the Backend Server:
```bash
cd server
npm run dev
# Server runs at http://localhost:5000
# Health check available at http://localhost:5000/api/health
```

#### Run the Frontend Client:
```bash
cd client
npm run dev
# Client runs at http://localhost:5173
```

---

## 🧪 Testing Workflows

1. **Storefront Browsing**:
   - Visit `http://localhost:5173/` to explore the full-width hero carousel, category shortcuts, flash deals, trending items, and recommendation blocks.
   - Use the top navigation bar to enter PIN code `713301` or `713302` to verify location-based delivery availability.
   - Toggle **Light/Dark Theme** using the Sun/Moon button in the header; notice persistent zero-flash theme loading.

2. **Product Discovery & Filtering**:
   - Navigate to `/products` or `/category/electronics`.
   - Apply real-time multi-facet filters: Category, Price Slider, Minimum Rating, In-Stock filter, and Sort By (Price, Rating, Newest).
   - Use the live search bar with auto-suggestions.

3. **Product Detail & Variants**:
   - Open a multi-variant product (e.g. *Ultra Wireless Noise-Cancelling Headphones* or *Premium Cotton Casual Shirt*).
   - Switch between different Color and Size combinations to observe reactive SKU, price adjustments, and stock status indicators.
   - View dynamic category-specific specification tables.

4. **Cart & Checkout**:
   - Add items with chosen variants to cart.
   - Proceed to `/checkout`, select a pre-loaded delivery address, apply coupon `WELCOME50` (50% off up to ₹500) or `FLAT100` (₹100 off), and select **Cash on Delivery (COD)** (the exclusive payment method).
   - Place the order to trigger inventory deductions and navigate to `/order-confirmation/:id`.

5. **Customer Orders & Tracking**:
   - Visit `/orders` to view placed orders.
   - Click **Track Shipment** to see the 5-stage visual delivery timeline with live tracking updates.

6. **Admin Dashboard & Management**:
   - Log in at `http://localhost:5173/admin/login` using `admin@gmail.com` / `123456`.
   - **Dashboard**: View live metrics (Total Revenue, Orders, Products, Active Customers) and recent orders.
   - **Products**: Create new products, attach dynamic attributes based on category, and auto-generate variant matrices.
   - **Orders**: Update order and shipment statuses (e.g. change an order to *Shipped* with tracking carrier info).
   - **Inventory**: View real-time stock levels, low-stock warnings, and adjust quantities with logged audit notes.
   - **Coupons**: Create and configure coupon codes, discount limits, and expiration dates.
   - **Shipping Zones**: Manage serviceable postal codes and delivery fees.

---

## 📄 License
This project is open-source and intended for production and educational demonstrations. Built with best software engineering practices.
