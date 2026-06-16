// ============================================
// DUMMY DATA - Smart Super Shop ERP
// ============================================

export const DUMMY_PRODUCTS = [
  { id: 'P001', name: 'Fresh Milk 1L', sku: 'MLK-001', barcode: '8901234567890', category: 'Dairy', brand: 'FreshFarm', buyingPrice: 80, sellingPrice: 120, quantity: 5, unit: 'Pcs', expiryDate: '2024-06-15' },
  { id: 'P002', name: 'Basmati Rice 1kg', sku: 'RIC-001', barcode: '8901234567891', category: 'Grocery', brand: 'RoyalGrain', buyingPrice: 120, sellingPrice: 180, quantity: 8, unit: 'Kg', expiryDate: '2025-12-31' },
  { id: 'P003', name: 'Sugar 1kg', sku: 'SUG-001', barcode: '8901234567892', category: 'Grocery', brand: 'PureCane', buyingPrice: 60, sellingPrice: 90, quantity: 3, unit: 'Kg', expiryDate: '2025-06-30' },
  { id: 'P004', name: 'Cooking Oil 1L', sku: 'OIL-001', barcode: '8901234567893', category: 'Grocery', brand: 'GoldenDrop', buyingPrice: 110, sellingPrice: 160, quantity: 4, unit: 'Pcs', expiryDate: '2025-03-20' },
  { id: 'P005', name: 'Egg (12 pcs)', sku: 'EGG-001', barcode: '8901234567894', category: 'Dairy', brand: 'FarmFresh', buyingPrice: 90, sellingPrice: 130, quantity: 150, unit: 'Pack', expiryDate: '2024-06-10' },
  { id: 'P006', name: 'Bread Loaf', sku: 'BRD-001', barcode: '8901234567895', category: 'Bakery', brand: 'BakeMaster', buyingPrice: 40, sellingPrice: 60, quantity: 25, unit: 'Pcs', expiryDate: '2024-06-07' },
  { id: 'P007', name: 'Orange Juice 1L', sku: 'JUI-001', barcode: '8901234567896', category: 'Beverages', brand: 'FreshSqueeze', buyingPrice: 75, sellingPrice: 120, quantity: 30, unit: 'Pcs', expiryDate: '2024-07-01' },
  { id: 'P008', name: 'Mineral Water 1.5L', sku: 'WAT-001', barcode: '8901234567897', category: 'Beverages', brand: 'ClearFlow', buyingPrice: 20, sellingPrice: 35, quantity: 80, unit: 'Pcs', expiryDate: '2026-01-01' },
  { id: 'P009', name: 'Butter 200g', sku: 'BTR-001', barcode: '8901234567898', category: 'Dairy', brand: 'CreamyBest', buyingPrice: 65, sellingPrice: 95, quantity: 0, unit: 'Pcs', expiryDate: '2024-08-15' },
  { id: 'P010', name: 'Noodles Pack', sku: 'NOD-001', barcode: '8901234567899', category: 'Snacks', brand: 'QuickBite', buyingPrice: 25, sellingPrice: 40, quantity: 60, unit: 'Pack', expiryDate: '2025-09-30' },
  { id: 'P011', name: 'Biscuits 200g', sku: 'BSC-001', barcode: '8901234567900', category: 'Snacks', brand: 'CrunchTime', buyingPrice: 35, sellingPrice: 55, quantity: 45, unit: 'Pack', expiryDate: '2025-04-15' },
  { id: 'P012', name: 'Tea Leaves 200g', sku: 'TEA-001', barcode: '8901234567901', category: 'Beverages', brand: 'GoldenLeaf', buyingPrice: 80, sellingPrice: 130, quantity: 20, unit: 'Pack', expiryDate: '2025-08-20' },
];

export const DUMMY_CUSTOMERS = [
  { id: 'C001', name: 'John Doe', phone: '01711-234567', email: 'john@email.com', address: 'Gulshan, Dhaka', loyaltyPoints: 450, totalPurchases: 15600, totalOrders: 24, joinDate: '2024-01-15', status: 'Active' },
  { id: 'C002', name: 'Sara Khan', phone: '01811-345678', email: 'sara@email.com', address: 'Dhanmondi, Dhaka', loyaltyPoints: 320, totalPurchases: 9800, totalOrders: 16, joinDate: '2024-02-20', status: 'Active' },
  { id: 'C003', name: 'Ali Ahmed', phone: '01911-456789', email: 'ali@email.com', address: 'Uttara, Dhaka', loyaltyPoints: 180, totalPurchases: 5400, totalOrders: 9, joinDate: '2024-03-10', status: 'Active' },
  { id: 'C004', name: 'James Wilson', phone: '01611-567890', email: 'james@email.com', address: 'Mirpur, Dhaka', loyaltyPoints: 90, totalPurchases: 2700, totalOrders: 5, joinDate: '2024-04-05', status: 'Active' },
  { id: 'C005', name: 'Maria Santos', phone: '01711-678901', email: 'maria@email.com', address: 'Mohammadpur, Dhaka', loyaltyPoints: 560, totalPurchases: 21000, totalOrders: 35, joinDate: '2023-12-01', status: 'Active' },
  { id: 'C006', name: 'David Kim', phone: '01811-789012', email: 'david@email.com', address: 'Banani, Dhaka', loyaltyPoints: 210, totalPurchases: 7200, totalOrders: 12, joinDate: '2024-01-28', status: 'Inactive' },
];

export const DUMMY_SUPPLIERS = [
  { id: 'S001', name: 'FreshFarm Suppliers', phone: '01711-111222', email: 'fresh@farm.com', address: 'Gazipur, Dhaka', products: ['Fresh Milk', 'Eggs'], totalPurchases: 145000, status: 'Active', lastOrder: '2024-05-24' },
  { id: 'S002', name: 'GrainMaster Co.', phone: '01811-222333', email: 'grain@master.com', address: 'Narayanganj', products: ['Rice', 'Flour', 'Sugar'], totalPurchases: 278000, status: 'Active', lastOrder: '2024-05-22' },
  { id: 'S003', name: 'BeveragePro Ltd.', phone: '01911-333444', email: 'bev@pro.com', address: 'Chittagong', products: ['Juice', 'Water', 'Soft Drinks'], totalPurchases: 132000, status: 'Active', lastOrder: '2024-05-20' },
  { id: 'S004', name: 'OilTrade Bangladesh', phone: '01611-444555', email: 'oil@trade.com', address: 'Dhaka', products: ['Cooking Oil', 'Butter'], totalPurchases: 156000, status: 'Inactive', lastOrder: '2024-04-15' },
];

export const DUMMY_EMPLOYEES = [
  { id: 'E001', name: 'Rahman Ahmed', position: 'Store Manager', phone: '01711-999888', email: 'rahman@shop.com', salary: 35000, role: 'manager', attendance: 96, joinDate: '2023-01-10', status: 'Active', branch: 'Main Branch' },
  { id: 'E002', name: 'Fatima Begum', position: 'Cashier', phone: '01811-888777', email: 'fatima@shop.com', salary: 18000, role: 'cashier', attendance: 92, joinDate: '2023-06-15', status: 'Active', branch: 'Main Branch' },
  { id: 'E003', name: 'Karim Hassan', position: 'Inventory Manager', phone: '01911-777666', email: 'karim@shop.com', salary: 22000, role: 'manager', attendance: 98, joinDate: '2023-03-20', status: 'Active', branch: 'Branch 2' },
  { id: 'E004', name: 'Aisha Khatun', position: 'Cashier', phone: '01611-666555', email: 'aisha@shop.com', salary: 18000, role: 'cashier', attendance: 88, joinDate: '2024-01-05', status: 'Active', branch: 'Branch 3' },
];

export const DUMMY_ORDERS = [
  { id: 'ORD-00123', customer: 'John Doe', customerId: 'C001', amount: 850, status: 'Completed', date: '2024-05-26', items: 5, paymentMethod: 'Cash' },
  { id: 'ORD-00122', customer: 'Sara Khan', customerId: 'C002', amount: 1250, status: 'Completed', date: '2024-05-26', items: 7, paymentMethod: 'Card' },
  { id: 'ORD-00121', customer: 'Ali Ahmed', customerId: 'C003', amount: 560, status: 'Pending', date: '2024-05-26', items: 3, paymentMethod: 'Mobile Banking' },
  { id: 'ORD-00120', customer: 'Walk-in Customer', customerId: null, amount: 1100, status: 'Completed', date: '2024-05-26', items: 8, paymentMethod: 'Cash' },
  { id: 'ORD-00119', customer: 'James Wilson', customerId: 'C004', amount: 720, status: 'Cancelled', date: '2024-05-26', items: 4, paymentMethod: 'Card' },
  { id: 'ORD-00118', customer: 'Maria Santos', customerId: 'C005', amount: 2100, status: 'Completed', date: '2024-05-25', items: 12, paymentMethod: 'Mobile Banking' },
  { id: 'ORD-00117', customer: 'Walk-in Customer', customerId: null, amount: 450, status: 'Completed', date: '2024-05-25', items: 2, paymentMethod: 'Cash' },
  { id: 'ORD-00116', customer: 'David Kim', customerId: 'C006', amount: 980, status: 'Completed', date: '2024-05-24', items: 6, paymentMethod: 'Card' },
];

export const DUMMY_EXPENSES = [
  { id: 'EXP-001', category: 'Shop Rent', amount: 45000, date: '2024-05-01', description: 'Monthly shop rent for May 2024', status: 'Paid' },
  { id: 'EXP-002', category: 'Utility Bills', amount: 8500, date: '2024-05-10', description: 'Electricity bill for May', status: 'Paid' },
  { id: 'EXP-003', category: 'Salaries', amount: 93000, date: '2024-05-25', description: 'Employee salaries for May', status: 'Paid' },
  { id: 'EXP-004', category: 'Transportation', amount: 5200, date: '2024-05-15', description: 'Delivery and logistics costs', status: 'Pending' },
  { id: 'EXP-005', category: 'Miscellaneous', amount: 2800, date: '2024-05-20', description: 'Office supplies and cleaning', status: 'Paid' },
  { id: 'EXP-006', category: 'Utility Bills', amount: 3200, date: '2024-05-12', description: 'Water bill for May', status: 'Paid' },
];

export const DUMMY_PURCHASES = [
  { id: 'PO-001', supplier: 'FreshFarm Suppliers', supplierId: 'S001', amount: 24000, items: 8, status: 'Received', date: '2024-05-24', invoiceNo: 'FF-2024-105' },
  { id: 'PO-002', supplier: 'GrainMaster Co.', supplierId: 'S002', amount: 36000, items: 12, status: 'Received', date: '2024-05-22', invoiceNo: 'GM-2024-089' },
  { id: 'PO-003', supplier: 'BeveragePro Ltd.', supplierId: 'S003', amount: 18500, items: 6, status: 'Pending', date: '2024-05-20', invoiceNo: 'BP-2024-234' },
  { id: 'PO-004', supplier: 'OilTrade Bangladesh', supplierId: 'S004', amount: 28000, items: 4, status: 'Cancelled', date: '2024-05-18', invoiceNo: 'OT-2024-067' },
];

export const SALES_CHART_DATA = [
  { date: 'May 1', sales: 28000, orders: 45 },
  { date: 'May 6', sales: 35000, orders: 58 },
  { date: 'May 11', sales: 31000, orders: 52 },
  { date: 'May 16', sales: 42000, orders: 70 },
  { date: 'May 21', sales: 45000, orders: 75 },
  { date: 'May 26', sales: 38000, orders: 63 },
];

export const MONTHLY_REVENUE = [
  { month: 'Jan', revenue: 285000, profit: 95000, expenses: 154000 },
  { month: 'Feb', revenue: 312000, profit: 105000, expenses: 168000 },
  { month: 'Mar', revenue: 298000, profit: 98000, expenses: 162000 },
  { month: 'Apr', revenue: 345000, profit: 118000, expenses: 185000 },
  { month: 'May', revenue: 380000, profit: 132000, expenses: 204000 },
  { month: 'Jun', revenue: 365000, profit: 125000, expenses: 197000 },
];

export const CATEGORY_DATA = [
  { name: 'Grocery', value: 45, color: '#2563EB' },
  { name: 'Beverages', value: 20, color: '#10B981' },
  { name: 'Dairy', value: 15, color: '#F59E0B' },
  { name: 'Snacks', value: 10, color: '#8B5CF6' },
  { name: 'Others', value: 10, color: '#EC4899' },
];

export const TOP_PRODUCTS = [
  { rank: 1, name: 'Fresh Milk 1L', price: 120, sold: 320, revenue: 38400, trend: 'up' },
  { rank: 2, name: 'Basmati Rice 1kg', price: 180, sold: 250, revenue: 45000, trend: 'up' },
  { rank: 3, name: 'Sugar 1kg', price: 90, sold: 210, revenue: 18900, trend: 'down' },
  { rank: 4, name: 'Cooking Oil 1L', price: 160, sold: 180, revenue: 28800, trend: 'up' },
  { rank: 5, name: 'Egg (12 pcs)', price: 130, sold: 150, revenue: 19500, trend: 'down' },
];

export const BRANCHES = [
  { id: 'B001', name: 'Main Branch - Gulshan', location: 'Gulshan, Dhaka', manager: 'Rahman Ahmed', employees: 12, revenue: 450000, status: 'Active', phone: '01711-100200' },
  { id: 'B002', name: 'Branch 2 - Dhanmondi', location: 'Dhanmondi, Dhaka', manager: 'Karim Hassan', employees: 8, revenue: 320000, status: 'Active', phone: '01811-200300' },
  { id: 'B003', name: 'Branch 3 - Uttara', location: 'Uttara, Dhaka', manager: 'Aisha Khatun', employees: 6, revenue: 180000, status: 'Active', phone: '01911-300400' },
];

export const NOTIFICATIONS_DATA = [
  { id: 1, type: 'warning', title: 'Low Stock Alert', message: 'Fresh Milk 1L - Only 5 units left', time: '2 min ago', read: false },
  { id: 2, type: 'info', title: 'New Order', message: 'Order ORD-00123 placed by John Doe', time: '5 min ago', read: false },
  { id: 3, type: 'danger', title: 'Expired Product', message: 'Butter 200g expired yesterday', time: '1 hour ago', read: false },
  { id: 4, type: 'warning', title: 'Low Stock Alert', message: 'Sugar 1kg - Only 3 units left', time: '2 hours ago', read: true },
  { id: 5, type: 'success', title: 'Payment Received', message: 'Invoice INV-00122 payment confirmed', time: '3 hours ago', read: true },
  { id: 6, type: 'info', title: 'Employee Check-in', message: 'Fatima Begum checked in at 9:02 AM', time: '4 hours ago', read: true },
  { id: 7, type: 'warning', title: 'Low Stock Alert', message: 'Cooking Oil 1L - Only 4 units left', time: '5 hours ago', read: true },
  { id: 8, type: 'danger', title: 'Out of Stock', message: 'Butter 200g is now out of stock', time: '6 hours ago', read: true },
];
