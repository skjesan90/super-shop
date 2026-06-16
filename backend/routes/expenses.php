<?php
$db = getDB();
$authUser = authenticate();

// GET /expenses
if ($method === 'GET') {
  $category = $_GET['category'] ?? '';
  $startDate = $_GET['startDate'] ?? '';
  $endDate = $_GET['endDate'] ?? '';
  $where = []; $params = [];
  if ($category) { $where[] = 'category = ?'; $params[] = $category; }
  if ($startDate) { $where[] = 'date >= ?'; $params[] = $startDate; }
  if ($endDate) { $where[] = 'date <= ?'; $params[] = $endDate; }
  $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';
  $stmt = $db->prepare("SELECT * FROM expenses $whereClause ORDER BY date DESC");
  $stmt->execute($params);
  $expenses = $stmt->fetchAll();
  $total = array_sum(array_column($expenses, 'amount'));
  echo json_encode(['success' => true, 'data' => $expenses, 'total' => $total]);
  exit;
}

// POST /expenses
if ($method === 'POST') {
  authorize(['admin', 'manager']);
  $data = json_decode(file_get_contents('php://input'), true);
  $stmt = $db->prepare("INSERT INTO expenses (category, amount, description, date, status, branch_id) VALUES (?, ?, ?, ?, ?, ?)");
  $stmt->execute([$data['category'], $data['amount'], $data['description'] ?? null, $data['date'] ?? date('Y-m-d'), $data['status'] ?? 'Paid', $data['branch'] ?? null]);
  $id = $db->lastInsertId();
  $stmt = $db->prepare("SELECT * FROM expenses WHERE id = ?");
  $stmt->execute([$id]);
  echo json_encode(['success' => true, 'data' => $stmt->fetch()]);
  exit;
}

// PUT /expenses/:id
if ($method === 'PUT' && $id) {
  authorize(['admin', 'manager']);
  $data = json_decode(file_get_contents('php://input'), true);
  $fields = []; $params = [];
  foreach (['category', 'amount', 'description', 'date', 'status'] as $f) {
    if (isset($data[$f])) { $fields[] = "$f = ?"; $params[] = $data[$f]; }
  }
  if (empty($fields)) { http_response_code(400); echo json_encode(['success' => false, 'message' => 'No fields to update']); exit; }
  $params[] = $id;
  $db->prepare("UPDATE expenses SET " . implode(', ', $fields) . " WHERE id = ?")->execute($params);
  $stmt = $db->prepare("SELECT * FROM expenses WHERE id = ?");
  $stmt->execute([$id]);
  echo json_encode(['success' => true, 'data' => $stmt->fetch()]);
  exit;
}

// DELETE /expenses/:id
if ($method === 'DELETE' && $id) {
  authorize(['admin']);
  $db->prepare("DELETE FROM expenses WHERE id = ?")->execute([$id]);
  echo json_encode(['success' => true, 'message' => 'Expense deleted']);
  exit;
}

http_response_code(404);
echo json_encode(['success' => false, 'message' => 'Expense route not found']);
