-- Smart Super Shop ERP - MySQL Database Schema

CREATE DATABASE IF NOT EXISTS pos_api CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pos_api;

-- Users / Auth
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','manager','cashier') DEFAULT 'cashier',
  branch_id INT DEFAULT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Branches
CREATE TABLE branches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(255) DEFAULT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  manager VARCHAR(100) DEFAULT NULL,
  status ENUM('Active','Inactive') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Products
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  sku VARCHAR(50) NOT NULL UNIQUE,
  barcode VARCHAR(100) DEFAULT NULL UNIQUE,
  category VARCHAR(100) NOT NULL,
  brand VARCHAR(100) DEFAULT NULL,
  buying_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  selling_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  quantity INT NOT NULL DEFAULT 0,
  unit VARCHAR(20) DEFAULT 'Pcs',
  low_stock_threshold INT DEFAULT 10,
  expiry_date DATE DEFAULT NULL,
  image VARCHAR(255) DEFAULT NULL,
  branch_id INT DEFAULT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_sku (sku),
  INDEX idx_branch (branch_id)
) ENGINE=InnoDB;

-- Customers
CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(100) DEFAULT NULL,
  address TEXT DEFAULT NULL,
  loyalty_points INT DEFAULT 0,
  total_purchases DECIMAL(12,2) DEFAULT 0,
  total_orders INT DEFAULT 0,
  status ENUM('Active','Inactive') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_phone (phone)
) ENGINE=InnoDB;

-- Suppliers
CREATE TABLE suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(100) DEFAULT NULL,
  address TEXT DEFAULT NULL,
  products TEXT DEFAULT NULL,
  total_purchases DECIMAL(12,2) DEFAULT 0,
  status ENUM('Active','Inactive') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Employees
CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  position VARCHAR(100) DEFAULT NULL,
  role ENUM('admin','manager','cashier') DEFAULT 'cashier',
  phone VARCHAR(50) DEFAULT NULL,
  email VARCHAR(100) DEFAULT NULL,
  salary DECIMAL(10,2) NOT NULL DEFAULT 0,
  attendance DECIMAL(5,2) DEFAULT 100,
  branch_id INT DEFAULT NULL,
  status ENUM('Active','Inactive') DEFAULT 'Active',
  join_date DATE DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_branch (branch_id)
) ENGINE=InnoDB;

-- Orders (Sales)
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_no VARCHAR(50) UNIQUE DEFAULT NULL,
  customer_id INT DEFAULT NULL,
  customer_name VARCHAR(100) DEFAULT 'Walk-in Customer',
  subtotal DECIMAL(12,2) DEFAULT 0,
  discount DECIMAL(5,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  vat DECIMAL(5,2) DEFAULT 5,
  vat_amount DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  payment_method ENUM('Cash','Card','Mobile Banking') DEFAULT 'Cash',
  payment_status ENUM('Paid','Pending','Partial') DEFAULT 'Paid',
  status ENUM('Completed','Pending','Cancelled') DEFAULT 'Completed',
  branch_id INT DEFAULT NULL,
  cashier_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_customer (customer_id),
  INDEX idx_status (status),
  INDEX idx_created (created_at)
) ENGINE=InnoDB;

-- Order Items
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT DEFAULT NULL,
  name VARCHAR(200) DEFAULT NULL,
  qty INT NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_order (order_id)
) ENGINE=InnoDB;

-- Purchases
CREATE TABLE purchases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  po_number VARCHAR(50) UNIQUE DEFAULT NULL,
  supplier_id INT DEFAULT NULL,
  invoice_no VARCHAR(100) DEFAULT NULL,
  total_amount DECIMAL(12,2) DEFAULT 0,
  status ENUM('Pending','Received','Cancelled') DEFAULT 'Pending',
  branch_id INT DEFAULT NULL,
  received_at DATETIME DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_supplier (supplier_id),
  INDEX idx_status (status)
) ENGINE=InnoDB;

-- Purchase Items
CREATE TABLE purchase_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  purchase_id INT NOT NULL,
  product_id INT DEFAULT NULL,
  name VARCHAR(200) DEFAULT NULL,
  qty INT NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
  INDEX idx_purchase (purchase_id)
) ENGINE=InnoDB;

-- Expenses
CREATE TABLE expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  description TEXT DEFAULT NULL,
  date DATE DEFAULT NULL,
  status ENUM('Paid','Pending') DEFAULT 'Paid',
  branch_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_date (date)
) ENGINE=InnoDB;

-- Inventory Log
CREATE TABLE inventory_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  type ENUM('stock_in','stock_out','adjustment','damage') NOT NULL,
  quantity INT DEFAULT 0,
  previous_qty INT DEFAULT 0,
  new_qty INT DEFAULT 0,
  reason TEXT DEFAULT NULL,
  performed_by INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_product (product_id)
) ENGINE=InnoDB;
