<?php
$db = getDB();
$authUser = authenticate();

// GET /customers
if ($method === 'GET' && !$id) {
  $search = $_GET['search'] ?? '';
  $page = max(1, (int)($_GET['page'] ?? 1));
  $limit = max(1, (int)($_GET['limit'] ?? 20));
  $offset = ($page - 1) * $limit;
  $where = []; $params = [];
  if ($search) {
    $where[] = '(name LIKE ? OR phone LIKE ? OR email LIKE ?)';
    $params = ["%$search%", "%$search%", "%$search%"];
  }
  $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';
  $countStmt = $db->prepare("SELECT COUNT(*) FROM customers $whereClause");
  $countStmt->execute($params);
  $total = (int)$countStmt->fetchColumn();
  $stmt = $db->prepare("SELECT * FROM customers $whereClause ORDER BY created_at DESC LIMIT $limit OFFSET $offset");
  $stmt->execute($params);
  echo json_encode(['success' => true, 'data' => $stmt->fetchAll(), 'total' => $total]);
  exit;
}

// POST /customers
if ($method === 'POST') {
  $data = json_decode(file_get_contents('php://input'), true);
  $name = trim($data['name'] ?? '');
  $phone = trim($data['phone'] ?? '');
  if (!$name) { http_response_code(400); echo json_encode(['success' => false, 'message' => 'Name is required']); exit; }
  if (!$phone) { http_response_code(400); echo json_encode(['success' => false, 'message' => 'Phone is required']); exit; }
  $stmt = $db->prepare("INSERT INTO customers (name, phone, email, address) VALUES (?, ?, ?, ?)");
  $stmt->execute([$name, $phone, $data['email'] ?? null, $data['address'] ?? null]);
  $id = $db->lastInsertId();
  $stmt = $db->prepare("SELECT * FROM customers WHERE id = ?");
  $stmt->execute([$id]);
  echo json_encode(['success' => true, 'data' => $stmt->fetch()]);
  exit;
}

// GET /customers/:id
if ($method === 'GET' && $id) {
  $stmt = $db->prepare("SELECT * FROM customers WHERE id = ?");
  $stmt->execute([$id]);
  $customer = $stmt->fetch();
  if (!$customer) { http_response_code(404); echo json_encode(['success' => false, 'message' => 'Customer not found']); exit; }
  echo json_encode(['success' => true, 'data' => $customer]);
  exit;
}

// PUT /customers/:id
if ($method === 'PUT' && $id) {
  $data = json_decode(file_get_contents('php://input'), true);
  $fields = []; $params = [];
  foreach (['name','phone','email','address','status'] as $f) {
    if (isset($data[$f])) { $fields[] = "$f = ?"; $params[] = $data[$f]; }
  }
  if (empty($fields)) { http_response_code(400); echo json_encode(['success' => false, 'message' => 'No fields to update']); exit; }
  $params[] = $id;
  $db->prepare("UPDATE customers SET " . implode(', ', $fields) . " WHERE id = ?")->execute($params);
  $stmt = $db->prepare("SELECT * FROM customers WHERE id = ?");
  $stmt->execute([$id]);
  echo json_encode(['success' => true, 'data' => $stmt->fetch()]);
  exit;
}

// DELETE /customers/:id
if ($method === 'DELETE' && $id) {
  authorize(['admin', 'manager']);
  $db->prepare("DELETE FROM customers WHERE id = ?")->execute([$id]);
  echo json_encode(['success' => true, 'message' => 'Customer deleted']);
  exit;
}

http_response_code(404);
echo json_encode(['success' => false, 'message' => 'Customer route not found']);
