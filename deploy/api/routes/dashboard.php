<?php
$db = getDB();
$authUser = authenticate();

// GET /dashboard/stats
if ($method === 'GET' && $id === 'stats') {
  $today = date('Y-m-d');
  $startOfWeek = date('Y-m-d', strtotime('monday this week'));
  $startOfMonth = date('Y-m-01');

  $totalProducts = $db->prepare("SELECT COUNT(*) FROM products WHERE is_active = 1");
  $totalProducts->execute(); $totalProducts = (int)$totalProducts->fetchColumn();

  $totalCustomers = $db->prepare("SELECT COUNT(*) FROM customers");
  $totalCustomers->execute(); $totalCustomers = (int)$totalCustomers->fetchColumn();

  $totalSuppliers = $db->prepare("SELECT COUNT(*) FROM suppliers");
  $totalSuppliers->execute(); $totalSuppliers = (int)$totalSuppliers->fetchColumn();

  $totalEmployees = $db->prepare("SELECT COUNT(*) FROM employees WHERE status = 'Active'");
  $totalEmployees->execute(); $totalEmployees = (int)$totalEmployees->fetchColumn();

  $todayOrders = $db->prepare("SELECT COALESCE(SUM(total), 0) as total, COUNT(*) as count FROM orders WHERE DATE(created_at) = ? AND status = 'Completed'");
  $todayOrders->execute([$today]); $todayData = $todayOrders->fetch();

  $weekOrders = $db->prepare("SELECT COALESCE(SUM(total), 0) as total, COUNT(*) as count FROM orders WHERE created_at >= ? AND status = 'Completed'");
  $weekOrders->execute([$startOfWeek]); $weekData = $weekOrders->fetch();

  $monthOrders = $db->prepare("SELECT COALESCE(SUM(total), 0) as total, COUNT(*) as count FROM orders WHERE created_at >= ? AND status = 'Completed'");
  $monthOrders->execute([$startOfMonth]); $monthData = $monthOrders->fetch();

  $lowStockCount = $db->prepare("SELECT COUNT(*) FROM products WHERE quantity > 0 AND quantity <= low_stock_threshold AND is_active = 1");
  $lowStockCount->execute(); $lowStockCount = (int)$lowStockCount->fetchColumn();

  $outOfStockCount = $db->prepare("SELECT COUNT(*) FROM products WHERE quantity = 0 AND is_active = 1");
  $outOfStockCount->execute(); $outOfStockCount = (int)$outOfStockCount->fetchColumn();

  echo json_encode(['success' => true, 'data' => [
    'totalProducts' => $totalProducts, 'totalCustomers' => $totalCustomers,
    'totalSuppliers' => $totalSuppliers, 'totalEmployees' => $totalEmployees,
    'dailyRevenue' => (float)$todayData['total'], 'dailyOrders' => (int)$todayData['count'],
    'weeklyRevenue' => (float)$weekData['total'], 'weeklyOrders' => (int)$weekData['count'],
    'monthlyRevenue' => (float)$monthData['total'], 'monthlyOrders' => (int)$monthData['count'],
    'lowStockCount' => $lowStockCount, 'outOfStockCount' => $outOfStockCount,
  ]]);
  exit;
}

// GET /dashboard/sales-chart
if ($method === 'GET' && $id === 'sales-chart') {
  $period = $_GET['period'] ?? 'monthly';
  $now = new DateTime();
  if ($period === 'yearly') {
    $start = (clone $now)->modify('-4 years')->format('Y-01-01');
    $groupFormat = '%Y';
  } elseif ($period === 'monthly') {
    $start = (clone $now)->modify('-5 months')->format('Y-m-01');
    $groupFormat = '%Y-%m';
  } elseif ($period === 'weekly') {
    $start = (clone $now)->modify('-5 weeks')->format('Y-m-d');
    $groupFormat = '%Y-%u';
  } else {
    $start = (clone $now)->modify('-6 days')->format('Y-m-d');
    $groupFormat = '%Y-%m-%d';
  }
  $stmt = $db->prepare("SELECT DATE_FORMAT(created_at, '$groupFormat') as period, SUM(total) as sales, COUNT(*) as orders 
    FROM orders WHERE created_at >= ? AND status = 'Completed' GROUP BY period ORDER BY period ASC");
  $stmt->execute([$start]);
  echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
  exit;
}

// GET /dashboard/top-products
if ($method === 'GET' && $id === 'top-products') {
  $stmt = $db->prepare("SELECT oi.product_id as _id, oi.name, SUM(oi.qty) as totalSold, SUM(oi.total) as revenue 
    FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE o.status = 'Completed' 
    GROUP BY oi.product_id, oi.name ORDER BY totalSold DESC LIMIT 5");
  $stmt->execute();
  echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
  exit;
}

// GET /dashboard/recent-transactions
if ($method === 'GET' && $id === 'recent-transactions') {
  $stmt = $db->prepare("SELECT o.*, COALESCE(o.customer_name, c.name, 'Walk-in Customer') as customer_name FROM orders o LEFT JOIN customers c ON o.customer_id = c.id ORDER BY o.created_at DESC LIMIT 10");
  $stmt->execute();
  echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
  exit;
}

// GET /dashboard/customer-growth
if ($method === 'GET' && $id === 'customer-growth') {
  $period = $_GET['period'] ?? 'monthly';
  $now = new DateTime();
  if ($period === 'yearly') {
    $start = (clone $now)->modify('-4 years')->format('Y-01-01');
    $fmt = '%Y';
  } elseif ($period === 'monthly') {
    $start = (clone $now)->modify('-11 months')->format('Y-m-01');
    $fmt = '%Y-%m';
  } else {
    $start = (clone $now)->modify('-29 days')->format('Y-m-d');
    $fmt = '%Y-%m-%d';
  }

  $newStmt = $db->prepare("SELECT DATE_FORMAT(created_at, '$fmt') as period, COUNT(*) as count FROM customers
    WHERE created_at >= ? GROUP BY period ORDER BY period ASC");
  $newStmt->execute([$start]);
  $newRows = $newStmt->fetchAll();

  $activeStmt = $db->prepare("SELECT DATE_FORMAT(o.created_at, '$fmt') as period, COUNT(DISTINCT o.customer_id) as count
    FROM orders o WHERE o.customer_id IS NOT NULL AND o.created_at >= ?
    GROUP BY period ORDER BY period ASC");
  $activeStmt->execute([$start]);
  $activeRows = $activeStmt->fetchAll();

  echo json_encode(['success' => true, 'data' => [
    'newCustomers' => $newRows, 'activeCustomers' => $activeRows
  ]]);
  exit;
}

// GET /dashboard/monthly-expenses
if ($method === 'GET' && $id === 'monthly-expenses') {
  $period = $_GET['period'] ?? 'monthly';
  $now = new DateTime();
  if ($period === 'yearly') {
    $start = (clone $now)->modify('-4 years')->format('Y-01-01');
    $fmt = '%Y';
  } elseif ($period === 'monthly') {
    $start = (clone $now)->modify('-11 months')->format('Y-m-01');
    $fmt = '%Y-%m';
  } else {
    $start = (clone $now)->modify('-29 days')->format('Y-m-d');
    $fmt = '%Y-%m-%d';
  }

  $stmt = $db->prepare("SELECT DATE_FORMAT(date, '$fmt') as period, COALESCE(SUM(amount), 0) as total
    FROM expenses WHERE date >= ? GROUP BY period ORDER BY period ASC");
  $stmt->execute([$start]);
  echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
  exit;
}

http_response_code(404);
echo json_encode(['success' => false, 'message' => 'Dashboard route not found']);
