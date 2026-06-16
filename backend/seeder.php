<?php
// Smart Super Shop ERP - Database Seeder
// Run: php seeder.php

require_once __DIR__ . '/config.php';

echo "Seeding database...\n";

$db = getDB();

// Clear existing data
$tables = ['inventory_logs', 'order_items', 'purchase_items', 'orders', 'purchases', 'expenses', 'employees', 'suppliers', 'customers', 'products', 'users', 'branches'];
foreach ($tables as $t) {
  $db->exec("DELETE FROM $t");
  $db->exec("ALTER TABLE $t AUTO_INCREMENT = 1");
}
echo "Cleared existing data\n";

// Branches
$db->prepare("INSERT INTO branches (name, location, phone, manager) VALUES 
  ('Main Branch - Gulshan', 'Gulshan, Dhaka', '01711-100200', 'Rahman Ahmed'),
  ('Branch 2 - Dhanmondi', 'Dhanmondi, Dhaka', '01811-200300', 'Karim Hassan'),
  ('Branch 3 - Uttara', 'Uttara, Dhaka', '01911-300400', 'Aisha Khatun')")->execute();
echo "Branches seeded\n";

// Users
$users = [
  ['Admin User', 'admin@shop.com', password_hash('admin123', PASSWORD_BCRYPT), 'admin', 1],
  ['Rahman Ahmed', 'manager@shop.com', password_hash('manager123', PASSWORD_BCRYPT), 'manager', 1],
  ['Fatima Begum', 'cashier@shop.com', password_hash('cashier123', PASSWORD_BCRYPT), 'cashier', 1],
  ['Karim Hassan', 'cashier2@shop.com', password_hash('cashier123', PASSWORD_BCRYPT), 'cashier', 2],
  ['Aisha Khatun', 'cashier3@shop.com', password_hash('cashier123', PASSWORD_BCRYPT), 'cashier', 3],
];
$stmt = $db->prepare("INSERT INTO users (name, email, password, role, branch_id) VALUES (?, ?, ?, ?, ?)");
foreach ($users as $u) $stmt->execute($u);
echo "Users seeded\n";

// Products
$db->prepare("INSERT INTO products (name, sku, barcode, category, brand, buying_price, selling_price, quantity, unit, low_stock_threshold, expiry_date, branch_id) VALUES
  ('Fresh Milk 1L', 'MLK-001', '8901234567890', 'Dairy', 'FreshFarm', 80, 120, 5, 'Pcs', 10, '2024-06-15', 1),
  ('Basmati Rice 1kg', 'RIC-001', '8901234567891', 'Grocery', 'RoyalGrain', 120, 180, 8, 'Kg', 10, '2025-12-31', 1),
  ('Sugar 1kg', 'SUG-001', '8901234567892', 'Grocery', 'PureCane', 60, 90, 3, 'Kg', 10, '2025-06-30', 1),
  ('Cooking Oil 1L', 'OIL-001', '8901234567893', 'Grocery', 'GoldenDrop', 110, 160, 4, 'Pcs', 10, '2025-03-20', 1),
  ('Egg (12 pcs)', 'EGG-001', '8901234567894', 'Dairy', 'FarmFresh', 90, 130, 150, 'Pack', 10, '2024-06-10', 1),
  ('Bread Loaf', 'BRD-001', '8901234567895', 'Bakery', 'BakeMaster', 40, 60, 25, 'Pcs', 10, '2024-06-07', 1),
  ('Orange Juice 1L', 'JUI-001', '8901234567896', 'Beverages', 'FreshSqueeze', 75, 120, 30, 'Pcs', 10, '2024-07-01', 1),
  ('Mineral Water 1.5L', 'WAT-001', '8901234567897', 'Beverages', 'ClearFlow', 20, 35, 80, 'Pcs', 10, NULL, 1),
  ('Butter 200g', 'BTR-001', '8901234567898', 'Dairy', 'CreamyBest', 65, 95, 0, 'Pcs', 10, '2024-08-15', 1),
  ('Noodles Pack', 'NOD-001', '8901234567899', 'Snacks', 'QuickBite', 25, 40, 60, 'Pack', 10, '2025-09-30', 1)
")->execute();
echo "Products seeded\n";

// Customers
$db->prepare("INSERT INTO customers (name, phone, email, address, loyalty_points, total_purchases, total_orders) VALUES
  ('John Doe', '01711-234567', 'john@email.com', 'Gulshan, Dhaka', 450, 15600, 24),
  ('Sara Khan', '01811-345678', 'sara@email.com', 'Dhanmondi, Dhaka', 320, 9800, 16),
  ('Ali Ahmed', '01911-456789', 'ali@email.com', 'Uttara, Dhaka', 180, 5400, 9)
")->execute();
echo "Customers seeded\n";

// Suppliers
$db->prepare("INSERT INTO suppliers (name, phone, email, address, products, total_purchases) VALUES
  ('FreshFarm Suppliers', '01711-111222', 'fresh@farm.com', 'Gazipur, Dhaka', '[\"Fresh Milk\",\"Eggs\"]', 145000),
  ('GrainMaster Co.', '01811-222333', 'grain@master.com', 'Narayanganj', '[\"Rice\",\"Flour\",\"Sugar\"]', 278000),
  ('BeveragePro Ltd.', '01911-333444', 'bev@pro.com', 'Chittagong', '[\"Juice\",\"Water\"]', 132000)
")->execute();
echo "Suppliers seeded\n";

// Employees
$db->prepare("INSERT INTO employees (name, position, role, phone, email, salary, attendance, branch_id) VALUES
  ('Rahman Ahmed', 'Store Manager', 'manager', '01711-999888', 'rahman@shop.com', 35000, 96, 1),
  ('Fatima Begum', 'Cashier', 'cashier', '01811-888777', 'fatima@shop.com', 18000, 92, 1),
  ('Karim Hassan', 'Inventory Manager', 'manager', '01911-777666', 'karim@shop.com', 22000, 98, 2),
  ('Aisha Khatun', 'Cashier', 'cashier', '01611-666555', 'aisha@shop.com', 18000, 88, 3)
")->execute();
echo "Employees seeded\n";

// Expenses
$db->prepare("INSERT INTO expenses (category, amount, description, date, status) VALUES
  ('Shop Rent', 45000, 'Monthly shop rent for May 2024', '2024-05-01', 'Paid'),
  ('Utility Bills', 8500, 'Electricity bill for May', '2024-05-10', 'Paid'),
  ('Salaries', 93000, 'Employee salaries for May', '2024-05-25', 'Paid'),
  ('Transportation', 5200, 'Delivery and logistics costs', '2024-05-15', 'Pending')
")->execute();
echo "Expenses seeded\n";

$today = date('Y-m-d');
$ym = date('Y-m');

// Orders (Sales) with dates relative to today
$orderStmt = $db->prepare("INSERT INTO orders (order_no, customer_id, customer_name, subtotal, discount, discount_amount, vat, vat_amount, total, payment_method, payment_status, status, branch_id, cashier_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
$orderItemStmt = $db->prepare("INSERT INTO order_items (order_id, product_id, name, qty, price, total) VALUES (?, ?, ?, ?, ?, ?)");

$orderData = [
  ['ORD-' . $ym . '-0001', 1, 'John Doe', 690, 5, 34.50, 5, 32.78, 688.28, 'Cash', 'Paid', 'Completed', 1, 3, -9, [
    [1, 'Fresh Milk 1L', 2, 120, 240],
    [5, 'Egg (12 pcs)', 1, 130, 130],
    [10, 'Noodles Pack', 2, 40, 80],
  ]],
  ['ORD-' . $ym . '-0002', 2, 'Sara Khan', 360, 0, 0, 5, 18, 378, 'Card', 'Paid', 'Completed', 1, 3, -8, [
    [2, 'Basmati Rice 1kg', 1, 180, 180],
    [8, 'Mineral Water 1.5L', 3, 35, 105],
    [6, 'Bread Loaf', 1, 60, 60],
  ]],
  ['ORD-' . $ym . '-0003', 1, 'John Doe', 520, 10, 52, 5, 23.40, 491.40, 'Cash', 'Paid', 'Completed', 1, 2, -7, [
    [4, 'Cooking Oil 1L', 2, 160, 320],
    [7, 'Orange Juice 1L', 1, 120, 120],
  ]],
  ['ORD-' . $ym . '-0004', 3, 'Ali Ahmed', 270, 0, 0, 5, 13.50, 283.50, 'Mobile Banking', 'Pending', 'Pending', 2, 2, -6, [
    [3, 'Sugar 1kg', 2, 90, 180],
    [9, 'Butter 200g', 1, 95, 95],
  ]],
  ['ORD-' . $ym . '-0005', NULL, 'Walk-in Customer', 120, 0, 0, 5, 6, 126, 'Cash', 'Paid', 'Pending', 1, 3, -5, [
    [1, 'Fresh Milk 1L', 1, 120, 120],
  ]],
  ['ORD-' . $ym . '-0006', 2, 'Sara Khan', 180, 0, 0, 5, 9, 189, 'Card', 'Pending', 'Cancelled', 3, 2, -4, [
    [2, 'Basmati Rice 1kg', 1, 180, 180],
  ]],
  ['ORD-' . $ym . '-0007', 3, 'Ali Ahmed', 420, 15, 63, 5, 17.85, 374.85, 'Cash', 'Paid', 'Completed', 2, 3, -3, [
    [5, 'Egg (12 pcs)', 2, 130, 260],
    [7, 'Orange Juice 1L', 1, 120, 120],
    [10, 'Noodles Pack', 1, 40, 40],
  ]],
  ['ORD-' . $ym . '-0008', 1, 'John Doe', 395, 0, 0, 5, 19.75, 414.75, 'Mobile Banking', 'Paid', 'Completed', 1, 3, -2, [
    [3, 'Sugar 1kg', 1, 90, 90],
    [4, 'Cooking Oil 1L', 1, 160, 160],
    [6, 'Bread Loaf', 2, 60, 120],
  ]],
  ['ORD-' . $ym . '-0009', NULL, 'Walk-in Customer', 350, 0, 0, 5, 17.50, 367.50, 'Cash', 'Paid', 'Completed', 1, 2, -1, [
    [1, 'Fresh Milk 1L', 1, 120, 120],
    [8, 'Mineral Water 1.5L', 4, 35, 140],
    [6, 'Bread Loaf', 1, 60, 60],
  ]],
  ['ORD-' . $ym . '-0010', 2, 'Sara Khan', 175, 0, 0, 5, 8.75, 183.75, 'Card', 'Paid', 'Completed', 3, 3, 0, [
    [5, 'Egg (12 pcs)', 1, 130, 130],
    [10, 'Noodles Pack', 1, 40, 40],
  ]],
];
foreach ($orderData as $o) {
  list($orderNo, $custId, $custName, $subtotal, $disc, $discAmt, $vat, $vatAmt, $total, $pmt, $pmtStatus, $status, $branchId, $cashierId, $dayOffset, $items) = $o;
  $createdAt = date('Y-m-d H:i:s', strtotime("$dayOffset days 09:00:00"));
  $orderStmt->execute([$orderNo, $custId, $custName, $subtotal, $disc, $discAmt, $vat, $vatAmt, $total, $pmt, $pmtStatus, $status, $branchId, $cashierId, $createdAt]);
  $orderId = $db->lastInsertId();
  foreach ($items as $it) {
    $orderItemStmt->execute([$orderId, $it[0], $it[1], $it[2], $it[3], $it[4]]);
  }
}
echo "Orders seeded\n";

// Purchases with relative dates
$purchStmt = $db->prepare("INSERT INTO purchases (po_number, supplier_id, invoice_no, total_amount, status, branch_id, received_at, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
$purchItemStmt = $db->prepare("INSERT INTO purchase_items (purchase_id, product_id, name, qty, price) VALUES (?, ?, ?, ?, ?)");

$purchData = [
  ['PO-' . $ym . '-001', 1, 'INV-FS-' . $ym, 34200, 'Received', 1, -15, 'Monthly dairy restock', -20, [
    [1, 'Fresh Milk 1L', 100, 80],
    [5, 'Egg (12 pcs)', 60, 90],
  ]],
  ['PO-' . $ym . '-002', 2, 'INV-GM-' . $ym, 72000, 'Received', 1, -12, 'Grain shipment', -18, [
    [2, 'Basmati Rice 1kg', 200, 120],
    [3, 'Sugar 1kg', 150, 60],
  ]],
  ['PO-' . $ym . '-003', 3, 'INV-BP-' . $ym, 18000, 'Received', 2, -8, 'Beverage stock for Branch 2', -14, [
    [7, 'Orange Juice 1L', 80, 75],
    [8, 'Mineral Water 1.5L', 200, 20],
  ]],
  ['PO-' . $ym . '-004', 1, 'INV-FS2-' . $ym, 15600, 'Pending', 1, NULL, 'Additional dairy order', -6, [
    [1, 'Fresh Milk 1L', 60, 80],
    [9, 'Butter 200g', 40, 65],
  ]],
  ['PO-' . $ym . '-005', 2, NULL, 28000, 'Pending', 3, NULL, 'New supplier for Branch 3', -4, [
    [4, 'Cooking Oil 1L', 100, 110],
    [5, 'Egg (12 pcs)', 80, 90],
  ]],
  ['PO-' . $ym . '-006', 3, 'INV-BP2-' . $ym, 5000, 'Cancelled', 1, NULL, 'Cancelled - supplier out of stock', -2, [
    [7, 'Orange Juice 1L', 30, 75],
    [10, 'Noodles Pack', 50, 25],
  ]],
];
foreach ($purchData as $p) {
  list($poNo, $suppId, $invNo, $totalAmt, $status, $branchId, $receivedOffset, $notes, $createdOffset, $items) = $p;
  $createdAt = date('Y-m-d H:i:s', strtotime("$createdOffset days 10:00:00"));
  $receivedAt = $receivedOffset !== null ? date('Y-m-d H:i:s', strtotime("$receivedOffset days 14:00:00")) : null;
  $purchStmt->execute([$poNo, $suppId, $invNo, $totalAmt, $status, $branchId, $receivedAt, $notes, $createdAt]);
  $purchId = $db->lastInsertId();
  foreach ($items as $it) {
    $purchItemStmt->execute([$purchId, $it[0], $it[1], $it[2], $it[3]]);
  }
}
echo "Purchases seeded\n";

echo "\nDatabase seeded successfully!\n";
echo "─────────────────────────────\n";
echo "Demo Credentials:\n";
echo "  Admin   -> admin@shop.com / admin123\n";
echo "  Manager -> manager@shop.com / manager123\n";
echo "  Cashier -> cashier@shop.com / cashier123\n";
echo "─────────────────────────────\n";
