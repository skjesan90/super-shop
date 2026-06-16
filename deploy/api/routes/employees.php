<?php
$db = getDB();
$authUser = authenticate();

// GET /employees
if ($method === 'GET') {
  $stmt = $db->prepare("SELECT e.*, b.name as branch_name FROM employees e LEFT JOIN branches b ON e.branch_id = b.id ORDER BY e.created_at DESC");
  $stmt->execute();
  echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
  exit;
}

// POST /employees
if ($method === 'POST') {
  authorize(['admin', 'manager']);
  $data = json_decode(file_get_contents('php://input'), true);
  if (empty($data['name'])) {
    http_response_code(400); echo json_encode(['success' => false, 'message' => 'Name is required']); exit;
  }
  $stmt = $db->prepare("INSERT INTO employees (name, position, role, phone, email, salary, branch_id, join_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  $stmt->execute([
    $data['name'], $data['position'] ?? null, $data['role'] ?? 'cashier',
    $data['phone'] ?? null, $data['email'] ?? null, $data['salary'] ?? 0,
    $data['branch'] ?? null, $data['joinDate'] ?? date('Y-m-d'),
  ]);
  $id = $db->lastInsertId();
  $stmt = $db->prepare("SELECT e.*, b.name as branch_name FROM employees e LEFT JOIN branches b ON e.branch_id = b.id WHERE e.id = ?");
  $stmt->execute([$id]);
  echo json_encode(['success' => true, 'data' => $stmt->fetch()]);
  exit;
}

// PUT /employees/:id
if ($method === 'PUT' && $id) {
  authorize(['admin', 'manager']);
  $data = json_decode(file_get_contents('php://input'), true);
  $fields = []; $params = [];
  foreach (['name','position','role','phone','email','salary','attendance','status'] as $f) {
    if (isset($data[$f])) { $fields[] = "$f = ?"; $params[] = $data[$f]; }
  }
  if (isset($data['branch'])) { $fields[] = 'branch_id = ?'; $params[] = $data['branch']; }
  if (empty($fields)) { http_response_code(400); echo json_encode(['success' => false, 'message' => 'No fields to update']); exit; }
  $params[] = $id;
  $db->prepare("UPDATE employees SET " . implode(', ', $fields) . " WHERE id = ?")->execute($params);
  $stmt = $db->prepare("SELECT e.*, b.name as branch_name FROM employees e LEFT JOIN branches b ON e.branch_id = b.id WHERE e.id = ?");
  $stmt->execute([$id]);
  echo json_encode(['success' => true, 'data' => $stmt->fetch()]);
  exit;
}

// DELETE /employees/:id
if ($method === 'DELETE' && $id) {
  authorize(['admin']);
  $db->prepare("UPDATE employees SET status = 'Inactive' WHERE id = ?")->execute([$id]);
  echo json_encode(['success' => true, 'message' => 'Employee removed']);
  exit;
}

http_response_code(404);
echo json_encode(['success' => false, 'message' => 'Employee route not found']);
