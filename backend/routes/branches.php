<?php
$db = getDB();
$authUser = authenticate();

// GET /branches
if ($method === 'GET' && !$id) {
  $stmt = $db->prepare("SELECT b.*,
    (SELECT COUNT(*) FROM employees e WHERE e.branch_id = b.id AND e.status = 'Active') as employees,
    (SELECT COALESCE(SUM(total), 0) FROM orders o WHERE o.branch_id = b.id AND o.status = 'Completed') as revenue
    FROM branches b ORDER BY b.created_at DESC");
  $stmt->execute();
  echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
  exit;
}

// POST /branches
if ($method === 'POST') {
  authorize(['admin']);
  $data = json_decode(file_get_contents('php://input'), true);
  $stmt = $db->prepare("INSERT INTO branches (name, location, phone, manager) VALUES (?, ?, ?, ?)");
  $stmt->execute([$data['name'], $data['location'] ?? null, $data['phone'] ?? null, $data['manager'] ?? null]);
  $id = $db->lastInsertId();
  $stmt = $db->prepare("SELECT * FROM branches WHERE id = ?");
  $stmt->execute([$id]);
  echo json_encode(['success' => true, 'data' => $stmt->fetch()]);
  exit;
}

// PUT /branches/:id
if ($method === 'PUT' && $id) {
  authorize(['admin']);
  $data = json_decode(file_get_contents('php://input'), true);
  $fields = []; $params = [];
  foreach (['name','location','phone','manager','status'] as $f) {
    if (isset($data[$f])) { $fields[] = "$f = ?"; $params[] = $data[$f]; }
  }
  if (empty($fields)) { http_response_code(400); echo json_encode(['success' => false, 'message' => 'No fields to update']); exit; }
  $params[] = $id;
  $db->prepare("UPDATE branches SET " . implode(', ', $fields) . " WHERE id = ?")->execute($params);
  $stmt = $db->prepare("SELECT * FROM branches WHERE id = ?");
  $stmt->execute([$id]);
  echo json_encode(['success' => true, 'data' => $stmt->fetch()]);
  exit;
}

http_response_code(404);
echo json_encode(['success' => false, 'message' => 'Branch route not found']);
