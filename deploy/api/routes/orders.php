<?php
$db = getDB();
$authUser = authenticate();

// GET /orders
if ($method === 'GET' && !$id) {
  $status = $_GET['status'] ?? '';
  $page = max(1, (int)($_GET['page'] ?? 1));
  $limit = max(1, (int)($_GET['limit'] ?? 20));
  $offset = ($page - 1) * $limit;
  $startDate = $_GET['startDate'] ?? '';
  $endDate = $_GET['endDate'] ?? '';
  $where = []; $params = [];
  if ($status) { $where[] = 'o.status = ?'; $params[] = $status; }
  if ($startDate) { $where[] = 'o.created_at >= ?'; $params[] = $startDate; }
  if ($endDate) { $where[] = 'o.created_at <= ?'; $params[] = $endDate . ' 23:59:59'; }
  $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';
  $countStmt = $db->prepare("SELECT COUNT(*) FROM orders o $whereClause");
  $countStmt->execute($params);
  $total = (int)$countStmt->fetchColumn();
  $stmt = $db->prepare("SELECT o.*, COALESCE(o.customer_name, c.name, 'Walk-in Customer') as customer_name, c.phone as customer_phone 
    FROM orders o LEFT JOIN customers c ON o.customer_id = c.id $whereClause ORDER BY o.created_at DESC LIMIT $limit OFFSET $offset");
  $stmt->execute($params);
  $orders = $stmt->fetchAll();
  echo json_encode(['success' => true, 'data' => $orders, 'total' => $total]);
  exit;
}

// POST /orders
if ($method === 'POST') {
  $data = json_decode(file_get_contents('php://input'), true);
  $items = $data['items'] ?? [];
  $customerId = $data['customerId'] ?? null;
  $discount = (float)($data['discount'] ?? 0);
  $vatRate = (float)($data['vatRate'] ?? 5);
  $paymentMethod = $data['paymentMethod'] ?? 'Cash';
  $subtotal = 0;
  $orderItems = [];

  foreach ($items as $item) {
    $stmt = $db->prepare("SELECT id, name, selling_price, quantity FROM products WHERE id = ?");
    $stmt->execute([$item['productId']]);
    $product = $stmt->fetch();
    if (!$product) { http_response_code(404); echo json_encode(['success' => false, 'message' => "Product {$item['productId']} not found"]); exit; }
    if ((int)$product['quantity'] < (int)$item['qty']) { http_response_code(400); echo json_encode(['success' => false, 'message' => "Insufficient stock for {$product['name']}"]); exit; }
    $itemTotal = (float)$product['selling_price'] * (int)$item['qty'];
    $subtotal += $itemTotal;
    $orderItems[] = [
      'product_id' => $product['id'],
      'name' => $product['name'],
      'qty' => (int)$item['qty'],
      'price' => (float)$product['selling_price'],
      'total' => $itemTotal,
    ];
    $db->prepare("UPDATE products SET quantity = quantity - ? WHERE id = ?")->execute([$item['qty'], $product['id']]);
  }

  $discountAmount = $subtotal * $discount / 100;
  $vatAmount = ($subtotal - $discountAmount) * $vatRate / 100;
  $total = $subtotal - $discountAmount + $vatAmount;
  $customerName = 'Walk-in Customer';

  if ($customerId) {
    $stmt = $db->prepare("SELECT id, name, total_purchases, total_orders, loyalty_points FROM customers WHERE id = ?");
    $stmt->execute([$customerId]);
    $customer = $stmt->fetch();
    if ($customer) {
      $customerName = $customer['name'];
      $db->prepare("UPDATE customers SET total_purchases = total_purchases + ?, total_orders = total_orders + 1, loyalty_points = loyalty_points + ? WHERE id = ?")
        ->execute([$total, floor($total / 100), $customerId]);
    }
  }

  // Generate order number
  $countStmt = $db->prepare("SELECT COUNT(*) FROM orders");
  $countStmt->execute();
  $count = (int)$countStmt->fetchColumn();
  $orderNo = 'ORD-' . str_pad($count + 1, 5, '0', STR_PAD_LEFT);

  $db->prepare("INSERT INTO orders (order_no, customer_id, customer_name, subtotal, discount, discount_amount, vat, vat_amount, total, payment_method, cashier_id) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")->execute([
    $orderNo, $customerId, $customerName,
    $subtotal, $discount, $discountAmount, $vatRate, $vatAmount, $total, $paymentMethod, $authUser['id'],
  ]);
  $orderId = $db->lastInsertId();

  // Insert order items
  foreach ($orderItems as $oi) {
    $db->prepare("INSERT INTO order_items (order_id, product_id, name, qty, price, total) VALUES (?, ?, ?, ?, ?, ?)")
      ->execute([$orderId, $oi['product_id'], $oi['name'], $oi['qty'], $oi['price'], $oi['total']]);
  }

  $stmt = $db->prepare("SELECT * FROM orders WHERE id = ?");
  $stmt->execute([$orderId]);
  $order = $stmt->fetch();
  $order['items'] = $orderItems;
  echo json_encode(['success' => true, 'data' => $order]);
  exit;
}

// GET /orders/:id
if ($method === 'GET' && $id) {
  $stmt = $db->prepare("SELECT o.*, c.name as customer_name, c.phone as customer_phone FROM orders o LEFT JOIN customers c ON o.customer_id = c.id WHERE o.id = ?");
  $stmt->execute([$id]);
  $order = $stmt->fetch();
  if (!$order) { http_response_code(404); echo json_encode(['success' => false, 'message' => 'Order not found']); exit; }
  $stmt = $db->prepare("SELECT * FROM order_items WHERE order_id = ?");
  $stmt->execute([$id]);
  $order['items'] = $stmt->fetchAll();
  echo json_encode(['success' => true, 'data' => $order]);
  exit;
}

// PUT /orders/:id/status
if ($method === 'PUT' && $id && $action === 'status') {
  $data = json_decode(file_get_contents('php://input'), true);
  $db->prepare("UPDATE orders SET status = ? WHERE id = ?")->execute([$data['status'], $id]);
  $stmt = $db->prepare("SELECT * FROM orders WHERE id = ?");
  $stmt->execute([$id]);
  echo json_encode(['success' => true, 'data' => $stmt->fetch()]);
  exit;
}

http_response_code(404);
echo json_encode(['success' => false, 'message' => 'Order route not found']);
