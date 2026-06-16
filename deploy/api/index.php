<?php
// Smart Super Shop ERP - PHP Backend API Router
// Start: php -S localhost:8000 index.php

// PHP built-in server router: serve existing static files, route everything else
if (php_sapi_name() === 'cli-server') {
  $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
  if ($path !== '/' && file_exists(__DIR__ . $path)) {
    return false; // Let built-in server serve the file
  }
}

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = rtrim($uri, '/');

// Remove /api prefix if present (from frontend calls)
$uri = preg_replace('#^/api#', '', $uri);
if ($uri === '') $uri = '/';

$parts = explode('/', trim($uri, '/'));
$resource = $parts[0] ?? '';
$id = $parts[1] ?? null;
$action = $parts[2] ?? null;

try {
  switch ($resource) {
    case '':
      echo json_encode(['success' => true, 'message' => 'Smart Shop ERP API', 'endpoints' => ['health', 'auth', 'products', 'customers', 'suppliers', 'employees', 'orders', 'purchases', 'expenses', 'dashboard', 'branches']]);
      break;
    case 'health':
      echo json_encode(['success' => true, 'status' => 'OK', 'timestamp' => date('c')]);
      break;
    case 'auth':
      require __DIR__ . '/routes/auth.php';
      break;
    case 'products':
      require __DIR__ . '/routes/products.php';
      break;
    case 'customers':
      require __DIR__ . '/routes/customers.php';
      break;
    case 'suppliers':
      require __DIR__ . '/routes/suppliers.php';
      break;
    case 'employees':
      require __DIR__ . '/routes/employees.php';
      break;
    case 'orders':
      require __DIR__ . '/routes/orders.php';
      break;
    case 'purchases':
      require __DIR__ . '/routes/purchases.php';
      break;
    case 'expenses':
      require __DIR__ . '/routes/expenses.php';
      break;
    case 'dashboard':
      require __DIR__ . '/routes/dashboard.php';
      break;
    case 'branches':
      require __DIR__ . '/routes/branches.php';
      break;
    default:
      http_response_code(404);
      echo json_encode(['success' => false, 'message' => 'Route not found']);
  }
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
