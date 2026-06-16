<?php
$db = getDB();
$authUser = authenticate();

// GET /purchases
if ($method === 'GET') {
  $stmt = $db->prepare("SELECT p.*, s.name as supplier_name, s.phone as supplier_phone FROM purchases p LEFT JOIN suppliers s ON p.supplier_id = s.id ORDER BY p.created_at DESC");
  $stmt->execute();
  $purchases = $stmt->fetchAll();
  foreach ($purchases as &$p) {
    $itemStmt = $db->prepare("SELECT * FROM purchase_items WHERE purchase_id = ?");
    $itemStmt->execute([$p['id']]);
    $p['items'] = $itemStmt->fetchAll();
  }
  echo json_encode(['success' => true, 'data' => $purchases]);
  exit;
}

// POST /purchases
if ($method === 'POST') {
  authorize(['admin', 'manager']);
  $data = json_decode(file_get_contents('php://input'), true);
  $totalAmount = (float)($data['amount'] ?? $data['totalAmount'] ?? 0);

  $countStmt = $db->prepare("SELECT COUNT(*) FROM purchases");
  $countStmt->execute();
  $count = (int)$countStmt->fetchColumn();
  $poNumber = 'PO-' . str_pad($count + 1, 3, '0', STR_PAD_LEFT);

  $db->prepare("INSERT INTO purchases (po_number, supplier_id, invoice_no, total_amount, branch_id, notes) VALUES (?, ?, ?, ?, ?, ?)")
    ->execute([$poNumber, $data['supplierId'] ?? null, $data['invoiceNo'] ?? null, $totalAmount, $data['branch'] ?? null, $data['notes'] ?? null]);
  $purchaseId = $db->lastInsertId();

  // Handle items if provided as array
  $purchaseItems = [];
  if (isset($data['items']) && is_array($data['items'])) {
    foreach ($data['items'] as $item) {
      $db->prepare("INSERT INTO purchase_items (purchase_id, product_id, name, qty, price) VALUES (?, ?, ?, ?, ?)")
        ->execute([$purchaseId, $item['productId'] ?? null, $item['name'] ?? '', (int)($item['qty'] ?? 0), (float)($item['price'] ?? 0)]);
      $purchaseItems[] = $item;
    }
  }

  $stmt = $db->prepare("SELECT p.*, s.name as supplier_name FROM purchases p LEFT JOIN suppliers s ON p.supplier_id = s.id WHERE p.id = ?");
  $stmt->execute([$purchaseId]);
  $purchase = $stmt->fetch();
  $purchase['items'] = $purchaseItems;
  echo json_encode(['success' => true, 'data' => $purchase]);
  exit;
}

// PUT /purchases/:id/receive
if ($method === 'PUT' && $id && $action === 'receive') {
  authorize(['admin', 'manager']);
  $stmt = $db->prepare("SELECT * FROM purchases WHERE id = ?");
  $stmt->execute([$id]);
  $purchase = $stmt->fetch();
  if (!$purchase) { http_response_code(404); echo json_encode(['success' => false, 'message' => 'Purchase order not found']); exit; }
  if ($purchase['status'] === 'Received') { http_response_code(400); echo json_encode(['success' => false, 'message' => 'Already received']); exit; }
  $itemStmt = $db->prepare("SELECT * FROM purchase_items WHERE purchase_id = ?");
  $itemStmt->execute([$id]);
  foreach ($itemStmt->fetchAll() as $item) {
    if ($item['product_id']) {
      $db->prepare("UPDATE products SET quantity = quantity + ? WHERE id = ?")->execute([$item['qty'], $item['product_id']]);
    }
  }
  $db->prepare("UPDATE purchases SET status = 'Received', received_at = NOW() WHERE id = ?")->execute([$id]);
  $stmt->execute([$id]);
  $purchase = $stmt->fetch();
  $itemStmt->execute([$id]);
  $purchase['items'] = $itemStmt->fetchAll();
  echo json_encode(['success' => true, 'data' => $purchase]);
  exit;
}

// PUT /purchases/:id
if ($method === 'PUT' && $id) {
  authorize(['admin', 'manager']);
  $data = json_decode(file_get_contents('php://input'), true);
  $fields = []; $params = [];
  foreach (['invoice_no', 'notes', 'status'] as $f) {
    if (isset($data[$f])) { $fields[] = "$f = ?"; $params[] = $data[$f]; }
  }
  if (empty($fields)) { http_response_code(400); echo json_encode(['success' => false, 'message' => 'No fields to update']); exit; }
  $params[] = $id;
  $db->prepare("UPDATE purchases SET " . implode(', ', $fields) . " WHERE id = ?")->execute($params);
  $stmt = $db->prepare("SELECT p.*, s.name as supplier_name FROM purchases p LEFT JOIN suppliers s ON p.supplier_id = s.id WHERE p.id = ?");
  $stmt->execute([$id]);
  echo json_encode(['success' => true, 'data' => $stmt->fetch()]);
  exit;
}

http_response_code(404);
echo json_encode(['success' => false, 'message' => 'Purchase route not found']);
