# 🛒 Smart Super Shop ERP & POS Management System

A production-ready, enterprise-grade Supermarket Management System built with React + PHP + MySQL.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PHP 8.0+ with PDO MySQL extension
- MySQL 8.0+
- Composer (PHP dependency manager)
- npm or yarn

---

## 📦 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Visit: **http://localhost:5173**

---

## 🖥️ Backend Setup (PHP + MySQL)

### 1. Create Database

```bash
mysql -u root -p < backend/database.sql
```

### 2. Install PHP Dependencies

```bash
cd backend
composer install
```

### 3. Configure Environment

```bash
cp .env.example .env        # Edit DB_HOST, DB_USER, DB_PASS, JWT_SECRET
```

### 4. Seed Demo Data

```bash
php seeder.php
```

### 5. Start PHP Server

```bash
php -S localhost:8000
```

### Demo Credentials
| Role    | Email                  | Password     |
|---------|------------------------|--------------|
| Admin   | admin@shop.com         | admin123     |
| Manager | manager@shop.com       | manager123   |
| Cashier | cashier@shop.com       | cashier123   |

---

## 📁 Project Structure

```
smart-shop-erp/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/          # Reusable UI components
│   │   │   └── layout/      # Sidebar, Header, Layout
│   │   ├── pages/           # All page components
│   │   │   ├── auth/        # Login page
│   │   │   ├── dashboard/   # Main dashboard
│   │   │   ├── pos/         # POS Billing System
│   │   │   ├── products/    # Product management
│   │   │   ├── inventory/   # Stock tracking
│   │   │   ├── customers/   # Customer CRM
│   │   │   ├── suppliers/   # Supplier management
│   │   │   ├── employees/   # Staff management
│   │   │   ├── sales/       # Sales & orders
│   │   │   ├── purchases/   # Purchase orders
│   │   │   ├── expenses/    # Expense tracking
│   │   │   ├── notifications/
│   │   │   ├── settings/
│   │   │   ├── branches/    # Multi-branch
│   │   │   └── analytics/   # Advanced analytics
│   │   ├── store/           # Redux Toolkit
│   │   │   └── slices/      # auth, theme, products, pos...
│   │   ├── services/        # Axios API layer
│   │   ├── hooks/           # Custom React hooks
│   │   └── utils/           # Helpers, dummy data, PDF gen
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── backend/
    ├── index.php            # PHP entry point / router
    ├── config.php           # Database configuration
    ├── middleware.php        # JWT auth middleware
    ├── database.sql         # MySQL schema
    ├── seeder.php           # Demo data seeder
    ├── composer.json        # PHP dependencies
    ├── .htaccess            # Apache URL rewriting
    └── routes/              # REST API routes
        ├── auth.php
        ├── products.php
        ├── customers.php
        ├── suppliers.php
        ├── employees.php
        ├── orders.php
        ├── purchases.php
        ├── expenses.php
        └── dashboard.php
```

---

## 🎯 Features

### 📊 Dashboard
- Real-time KPIs: Revenue, Orders, Products, Customers
- Sales Analytics charts (Daily / Weekly / Monthly)
- Top Selling Products widget
- Recent Transactions feed
- Low Stock & Out-of-Stock alerts

### 🧾 POS Billing
- Product search + category filter
- Shopping cart with qty control
- Customer selection (walk-in or registered)
- Discount & VAT calculation
- Cash / Card / Mobile Banking payment
- Printable Invoice + PDF export

### 📦 Product Management
- Add / Edit / Delete products
- SKU, Barcode, Category, Brand fields
- Buying & Selling price management
- Expiry date tracking
- Stock status badges

### 🏪 Inventory
- Stock level visualization (progress bar)
- Low Stock / Out of Stock / Expiring Soon / Expired filters
- Stock adjustment modal with audit log
- Expired product warning banner

### 👥 Customer CRM
- Table & Grid views
- Loyalty points tracking
- Purchase history & total spend
- Customer status management

### 🚚 Supplier Management
- Supplier card grid view
- Purchase history per supplier
- Products supplied tracking

### 👔 Employee Management
- Role-based (Admin / Manager / Cashier)
- Salary & attendance tracking
- Branch assignment

### 📈 Sales Reports
- Orders list with filters (status, search)
- Weekly sales bar chart
- Export to Excel
- Payment method tracking

### 🛒 Purchase Management
- Purchase Order creation
- Supplier-linked orders
- Receive order → auto-update inventory
- Status tracking (Pending / Received / Cancelled)

### 💸 Expense Management
- Category-wise tracking (Rent / Utilities / Salaries…)
- Pie chart breakdown
- Paid vs Pending status

### 🔔 Notifications
- Unread / Read separation
- Type icons (warning, danger, info, success)
- Mark all as read
- Per-notification dismiss

### ⚙️ Settings
- Store info (name, logo, address, currency, VAT)
- Light / Dark mode toggle
- Notification preferences
- Password change

### 🏢 Multi-Branch
- Branch cards with revenue + employee count
- Bar chart comparison
- Manager assignment

### 📉 Analytics Center
- Revenue + Profit + Expense area chart
- Customer Growth bar chart
- Branch Performance radar chart
- Product Performance table with margin %

---

## 🎨 Tech Stack

**Frontend:**  React 18 · Vite · Tailwind CSS · Redux Toolkit · React Router · Recharts · React Hook Form · React Hot Toast · Lucide Icons · jsPDF · SheetJS

**Backend:** PHP 8+ · MySQL · PDO · JWT (firebase/php-jwt) · bcrypt

---

## 🌙 Dark Mode
Toggle via the ☀️/🌙 button in the header. Persisted in localStorage.

---

## 🔐 Role-Based Access

| Feature            | Admin | Manager | Cashier |
|--------------------|-------|---------|---------|
| View Dashboard     | ✅    | ✅      | ✅      |
| POS Billing        | ✅    | ✅      | ✅      |
| Add/Edit Products  | ✅    | ✅      | ❌      |
| Delete Products    | ✅    | ❌      | ❌      |
| Manage Employees   | ✅    | ✅      | ❌      |
| View Reports       | ✅    | ✅      | ❌      |
| Settings           | ✅    | ❌      | ❌      |

---

## 📄 API Endpoints

```
POST   /api/auth/login
POST   /api/auth/register
GET    /api/auth/me

GET    /api/products
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
PUT    /api/products/:id/adjust-stock

GET    /api/customers
POST   /api/customers
PUT    /api/customers/:id
DELETE /api/customers/:id

GET    /api/orders
POST   /api/orders
GET    /api/orders/:id
PUT    /api/orders/:id/status

GET    /api/purchases
POST   /api/purchases
PUT    /api/purchases/:id/receive

GET    /api/expenses
POST   /api/expenses
DELETE /api/expenses/:id

GET    /api/dashboard/stats
GET    /api/dashboard/sales-chart
GET    /api/dashboard/top-products
GET    /api/dashboard/recent-transactions
```

---

## 🏭 Production Build

```bash
# Frontend
cd frontend && npm run build

# Backend — deploy backend/ to a PHP-capable web server (Apache/Nginx)
# Point document root to backend/ directory
```

---

*Smart Super Shop ERP — Built for real supermarket businesses.*
