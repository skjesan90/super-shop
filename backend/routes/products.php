<?php
$db = getDB();
$authUser = authenticate();

// GET /products - list with filters
if ($method === 'GET' && !$id) {
  $category = $_GET['category'] ?? '';
  $search = $_GET['search'] ?? '';
  $lowStock = $_GET['lowStock'] ?? '';
  $outOfStock = $_GET['outOfStock'] ?? '';
  $page = max(1, (int)($_GET['page'] ?? 1));
  $limit = max(1, (int)($_GET['limit'] ?? 20));
  $offset = ($page - 1) * $limit;

  $where = ['p.is_active = 1'];
  $params = [];
  if ($category) { $where[] = 'p.category = ?'; $params[] = $category; }
  if ($search) { $where[] = '(p.name LIKE ? OR p.sku LIKE ?)'; $params[] = "%$search%"; $params[] = "%$search%"; }
  if ($lowStock === 'true') { $where[] = 'p.quantity > 0 AND p.quantity <= p.low_stock_threshold'; }
  if ($outOfStock === 'true') { $where[] = 'p.quantity = 0'; }

  $whereClause = implode(' AND ', $where);
  $totalStmt = $db->prepare("SELECT COUNT(*) FROM products p WHERE $whereClause");
  $totalStmt->execute($params);
  $total = (int)$totalStmt->fetchColumn();

  $stmt = $db->prepare("SELECT p.*, 
    CASE WHEN p.quantity = 0 THEN 'Out of Stock' WHEN p.quantity <= p.low_stock_threshold THEN 'Low Stock' ELSE 'In Stock' END as stock_status
    FROM products p WHERE $whereClause ORDER BY p.created_at DESC LIMIT $limit OFFSET $offset");
  $stmt->execute($params);
  $products = $stmt->fetchAll();

  echo json_encode(['success' => true, 'data' => $products, 'total' => $total, 'pages' => (int)ceil($total / $limit)]);
  exit;
}

// POST /products
if ($method === 'POST') {
  authorize(['admin', 'manager']);
  $data = json_decode(file_get_contents('php://input'), true);
  if (empty($data['name']) || empty($data['sku'])) {
    http_response_code(400); echo json_encode(['success' => false, 'message' => 'Name and SKU are required']); exit;
  }
  $stmt = $db->prepare("INSERT INTO products (name, sku, barcode, category, brand, buying_price, selling_price, quantity, unit, low_stock_threshold, expiry_date, image, branch_id) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
  $stmt->execute([
    $data['name'], $data['sku'], $data['barcode'] ?? null, $data['category'],
    $data['brand'] ?? null, $data['buyingPrice'] ?? 0, $data['sellingPrice'] ?? 0,
    $data['quantity'] ?? 0, $data['unit'] ?? 'Pcs', $data['lowStockThreshold'] ?? 10,
    $data['expiryDate'] ?? null, $data['image'] ?? null, $data['branch'] ?? null,
  ]);
  $id = $db->lastInsertId();
  $stmt = $db->prepare("SELECT * FROM products WHERE id = ?");
  $stmt->execute([$id]);
  $product = $stmt->fetch();
  echo json_encode(['success' => true, 'data' => $product]);
  exit;
}

// GET /products/:id
if ($method === 'GET' && $id) {
  $stmt = $db->prepare("SELECT * FROM products WHERE id = ?");
  $stmt->execute([$id]);
  $product = $stmt->fetch();
  if (!$product) { http_response_code(404); echo json_encode(['success' => false, 'message' => 'Product not found']); exit; }
  echo json_encode(['success' => true, 'data' => $product]);
  exit;
}

// PUT /products/:id
if ($method === 'PUT' && $id && !$action) {
  authorize(['admin', 'manager']);
  $data = json_decode(file_get_contents('php://input'), true);
  $fields = []; $params = [];
  foreach (['name','sku','barcode','category','brand','buying_price','selling_price','quantity','unit','low_stock_threshold','expiry_date','image','branch_id'] as $f) {
    $camel = lcfirst(str_replace('_', '', ucwords($f, '_')));
    if (isset($data[$camel])) { $fields[] = "$f = ?"; $params[] = $data[$camel]; }
  }
  if (empty($fields)) { http_response_code(400); echo json_encode(['success' => false, 'message' => 'No fields to update']); exit; }
  $params[] = $id;
  $stmt = $db->prepare("UPDATE products SET " . implode(', ', $fields) . " WHERE id = ?");
  $stmt->execute($params);
  $stmt = $db->prepare("SELECT * FROM products WHERE id = ?");
  $stmt->execute([$id]);
  echo json_encode(['success' => true, 'data' => $stmt->fetch()]);
  exit;
}

// DELETE /products/:id
if ($method === 'DELETE' && $id) {
  authorize(['admin']);
  $stmt = $db->prepare("UPDATE products SET is_active = 0 WHERE id = ?");
  $stmt->execute([$id]);
  echo json_encode(['success' => true, 'message' => 'Product deleted']);
  exit;
}

// PUT /products/:id/adjust-stock
if ($method === 'PUT' && $id && $action === 'adjust-stock') {
  authorize(['admin', 'manager']);
  $data = json_decode(file_get_contents('php://input'), true);
  $stmt = $db->prepare("SELECT id, quantity FROM products WHERE id = ?");
  $stmt->execute([$id]);
  $product = $stmt->fetch();
  if (!$product) { http_response_code(404); echo json_encode(['success' => false, 'message' => 'Product not found']); exit; }
  $previousQty = (int)$product['quantity'];
  $newQty = (int)$data['quantity'];
  $stmt = $db->prepare("UPDATE products SET quantity = ? WHERE id = ?");
  $stmt->execute([$newQty, $id]);
  $stmt = $db->prepare("INSERT INTO inventory_logs (product_id, type, quantity, previous_qty, new_qty, reason, performed_by) VALUES (?, ?, ?, ?, ?, ?, ?)");
  $stmt->execute([$id, $data['type'] ?? 'adjustment', abs($newQty - $previousQty), $previousQty, $newQty, $data['reason'] ?? '', $authUser['id']]);
  $stmt = $db->prepare("SELECT * FROM products WHERE id = ?");
  $stmt->execute([$id]);
  echo json_encode(['success' => true, 'data' => $stmt->fetch()]);
  exit;
}

http_response_code(404);
echo json_encode(['success' => false, 'message' => 'Product route not found']);
