<?php
$db = getDB();
$authUser = authenticate();

// GET /suppliers
if ($method === 'GET') {
  $stmt = $db->prepare("SELECT * FROM suppliers ORDER BY created_at DESC");
  $stmt->execute();
  echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
  exit;
}

// POST /suppliers
if ($method === 'POST') {
  authorize(['admin', 'manager']);
  $data = json_decode(file_get_contents('php://input'), true);
  if (empty($data['name']) || empty($data['phone'])) {
    http_response_code(400); echo json_encode(['success' => false, 'message' => 'Name and phone are required']); exit;
  }
  $stmt = $db->prepare("INSERT INTO suppliers (name, phone, email, address, products) VALUES (?, ?, ?, ?, ?)");
  $stmt->execute([$data['name'], $data['phone'], $data['email'] ?? null, $data['address'] ?? null, $data['products'] ? json_encode($data['products']) : null]);
  $id = $db->lastInsertId();
  $stmt = $db->prepare("SELECT * FROM suppliers WHERE id = ?");
  $stmt->execute([$id]);
  echo json_encode(['success' => true, 'data' => $stmt->fetch()]);
  exit;
}

// PUT /suppliers/:id
if ($method === 'PUT' && $id) {
  authorize(['admin', 'manager']);
  $data = json_decode(file_get_contents('php://input'), true);
  $fields = []; $params = [];
  foreach (['name','phone','email','address','status'] as $f) {
    if (isset($data[$f])) { $fields[] = "$f = ?"; $params[] = $data[$f]; }
  }
  if (isset($data['products'])) { $fields[] = 'products = ?'; $params[] = json_encode($data['products']); }
  if (empty($fields)) { http_response_code(400); echo json_encode(['success' => false, 'message' => 'No fields to update']); exit; }
  $params[] = $id;
  $db->prepare("UPDATE suppliers SET " . implode(', ', $fields) . " WHERE id = ?")->execute($params);
  $stmt = $db->prepare("SELECT * FROM suppliers WHERE id = ?");
  $stmt->execute([$id]);
  echo json_encode(['success' => true, 'data' => $stmt->fetch()]);
  exit;
}

// DELETE /suppliers/:id
if ($method === 'DELETE' && $id) {
  authorize(['admin']);
  $db->prepare("DELETE FROM suppliers WHERE id = ?")->execute([$id]);
  echo json_encode(['success' => true, 'message' => 'Supplier deleted']);
  exit;
}

http_response_code(404);
echo json_encode(['success' => false, 'message' => 'Supplier route not found']);
