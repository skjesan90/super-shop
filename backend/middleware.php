<?php
// Standalone JWT implementation (no Composer dependency)
function base64url_encode(string $data): string {
  return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode(string $data): string {
  return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', 3 - (3 + strlen($data)) % 4));
}

function generateToken(int $userId): string {
  $header = base64url_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
  $payload = base64url_encode(json_encode([
    'iss' => 'smart-shop-erp',
    'iat' => time(),
    'exp' => time() + JWT_EXPIRE,
    'sub' => $userId,
  ]));
  $signature = base64url_encode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));
  return "$header.$payload.$signature";
}

function verifyToken(): ?array {
  $auth = '';
  if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
    $auth = $_SERVER['HTTP_AUTHORIZATION'];
  } elseif (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
    $auth = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
  } elseif (function_exists('apache_request_headers')) {
    $headers = apache_request_headers();
    $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
  }
  if (!preg_match('/^Bearer\s+(.+)$/i', $auth, $m)) return null;
  try {
    $parts = explode('.', $m[1]);
    if (count($parts) !== 3) return null;
    [$header, $payload, $signature] = $parts;
    $expected = base64url_encode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));
    if (!hash_equals($expected, $signature)) return null;
    $data = json_decode(base64url_decode($payload), true);
    if (!$data || !isset($data['sub']) || $data['exp'] < time()) return null;
    $db = getDB();
    $stmt = $db->prepare("SELECT id, name, email, role, branch_id FROM users WHERE id = ? AND is_active = 1");
    $stmt->execute([$data['sub']]);
    return $stmt->fetch() ?: null;
  } catch (Exception $e) {
    return null;
  }
}

function authenticate(): array {
  $user = verifyToken();
  if (!$user) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authorized, no token']);
    exit;
  }
  $GLOBALS['auth_user'] = $user;
  return $user;
}

function authorize(array $roles): void {
  $user = $GLOBALS['auth_user'];
  if (!in_array($user['role'], $roles)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => "Role '{$user['role']}' is not authorized"]);
    exit;
  }
}
