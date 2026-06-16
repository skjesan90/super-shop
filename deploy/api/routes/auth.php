<?php
$db = getDB();

// POST /auth/register
if ($method === 'POST' && $uri === '/auth/register') {
  $data = json_decode(file_get_contents('php://input'), true);
  $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
  $stmt->execute([$data['email']]);
  if ($stmt->fetch()) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email already registered']);
    exit;
  }
  $hash = password_hash($data['password'], PASSWORD_BCRYPT);
  $stmt = $db->prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)");
  $stmt->execute([$data['name'], $data['email'], $hash, $data['role'] ?? 'cashier']);
  $userId = $db->lastInsertId();
  $token = generateToken($userId);
  echo json_encode(['success' => true, 'token' => $token, 'user' => [
    'id' => (int)$userId, 'name' => $data['name'], 'email' => $data['email'], 'role' => $data['role'] ?? 'cashier',
  ]]);
  exit;
}

// POST /auth/login
if ($method === 'POST' && $uri === '/auth/login') {
  $data = json_decode(file_get_contents('php://input'), true);
  if (empty($data['email']) || empty($data['password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email and password required']);
    exit;
  }
  $stmt = $db->prepare("SELECT id, name, email, password, role, branch_id FROM users WHERE email = ?");
  $stmt->execute([$data['email']]);
  $user = $stmt->fetch();
  if (!$user || !password_verify($data['password'], $user['password'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
    exit;
  }
  $token = generateToken($user['id']);
  echo json_encode(['success' => true, 'token' => $token, 'user' => [
    'id' => (int)$user['id'], 'name' => $user['name'], 'email' => $user['email'], 'role' => $user['role'], 'branch_id' => (int)$user['branch_id'],
  ]]);
  exit;
}

// GET /auth/me
if ($method === 'GET' && $uri === '/auth/me') {
  $user = authenticate();
  echo json_encode(['success' => true, 'user' => $user]);
  exit;
}

// PUT /auth/change-password
if ($method === 'PUT' && $uri === '/auth/change-password') {
  $authUser = authenticate();
  $data = json_decode(file_get_contents('php://input'), true);
  $stmt = $db->prepare("SELECT password FROM users WHERE id = ?");
  $stmt->execute([$authUser['id']]);
  $user = $stmt->fetch();
  if (!password_verify($data['currentPassword'], $user['password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Current password incorrect']);
    exit;
  }
  $hash = password_hash($data['newPassword'], PASSWORD_BCRYPT);
  $stmt = $db->prepare("UPDATE users SET password = ? WHERE id = ?");
  $stmt->execute([$hash, $authUser['id']]);
  echo json_encode(['success' => true, 'message' => 'Password updated successfully']);
  exit;
}

http_response_code(404);
echo json_encode(['success' => false, 'message' => 'Auth route not found']);
