<?php
/**
 * Barangay Communication Module - Utility Functions
 * Common functions used throughout the application
 */

/**
 * Log error to file
 */
function logError($message) {
    if (LOG_ERRORS && LOG_FILE) {
        $timestamp = date('Y-m-d H:i:s');
        $log_message = "[$timestamp] $message\n";
        file_put_contents(LOG_FILE, $log_message, FILE_APPEND);
    }
}

/**
 * Send JSON response
 */
function sendJsonResponse($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

/**
 * Send error response
 */
function sendErrorResponse($message, $status = 400) {
    sendJsonResponse([
        'success' => false,
        'message' => $message,
        'status' => $status
    ], $status);
}

/**
 * Send success response
 */
function sendSuccessResponse($data = [], $message = 'Success') {
    sendJsonResponse([
        'success' => true,
        'message' => $message,
        'data' => $data
    ], 200);
}

/**
 * Sanitize input
 */
function sanitizeInput($input) {
    if (is_array($input)) {
        return array_map('sanitizeInput', $input);
    }
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

/**
 * Validate email
 */
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Validate phone number
 */
function validatePhone($phone) {
    return preg_match('/^[0-9\-\+\(\)\s]{10,}$/', $phone);
}

/**
 * Generate unique ID
 */
function generateUniqueId() {
    return uniqid(bin2hex(random_bytes(8)), true);
}

/**
 * Hash password
 */
function hashPassword($password) {
    return password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
}

/**
 * Verify password
 */
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

/**
 * Generate CSRF token
 */
function generateCsrfToken() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

/**
 * Verify CSRF token
 */
function verifyCsrfToken($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

/**
 * Get current user
 */
function getCurrentUser() {
    return isset($_SESSION['user']) ? $_SESSION['user'] : null;
}

/**
 * Set current user
 */
function setCurrentUser($user) {
    $_SESSION['user'] = $user;
}

/**
 * Check if user is logged in
 */
function isLoggedIn() {
    return isset($_SESSION['user']) && !empty($_SESSION['user']);
}

/**
 * Check if user is admin
 */
function isAdmin() {
    $user = getCurrentUser();
    return $user && isset($user['role']) && $user['role'] === 'admin';
}

/**
 * Redirect to URL
 */
function redirect($url) {
    header("Location: $url");
    exit;
}

/**
 * Format date
 */
function formatDate($date, $format = 'Y-m-d H:i:s') {
    return date($format, strtotime($date));
}

/**
 * Get time ago
 */
function getTimeAgo($date) {
    $timestamp = strtotime($date);
    $time_difference = time() - $timestamp;

    if ($time_difference < 60) {
        return 'just now';
    } elseif ($time_difference < 3600) {
        $minutes = floor($time_difference / 60);
        return $minutes . ' minute' . ($minutes > 1 ? 's' : '') . ' ago';
    } elseif ($time_difference < 86400) {
        $hours = floor($time_difference / 3600);
        return $hours . ' hour' . ($hours > 1 ? 's' : '') . ' ago';
    } elseif ($time_difference < 604800) {
        $days = floor($time_difference / 86400);
        return $days . ' day' . ($days > 1 ? 's' : '') . ' ago';
    } else {
        return date('M d, Y', $timestamp);
    }
}

/**
 * Validate file upload
 */
function validateFileUpload($file) {
    $max_size = MAX_FILE_SIZE;
    $allowed_types = ALLOWED_FILE_TYPES;

    if ($file['size'] > $max_size) {
        return ['valid' => false, 'message' => 'File size exceeds maximum limit'];
    }

    $file_ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($file_ext, $allowed_types)) {
        return ['valid' => false, 'message' => 'File type not allowed'];
    }

    return ['valid' => true];
}

/**
 * Save uploaded file
 */
function saveUploadedFile($file) {
    $validation = validateFileUpload($file);
    if (!$validation['valid']) {
        return $validation;
    }

    $filename = generateUniqueId() . '.' . pathinfo($file['name'], PATHINFO_EXTENSION);
    $filepath = UPLOAD_DIR . $filename;

    if (move_uploaded_file($file['tmp_name'], $filepath)) {
        return ['valid' => true, 'filename' => $filename, 'path' => $filepath];
    }

    return ['valid' => false, 'message' => 'Failed to save file'];
}

/**
 * Send email
 */
function sendEmail($to, $subject, $body, $isHtml = true) {
    $headers = "From: " . FROM_NAME . " <" . FROM_EMAIL . ">\r\n";
    $headers .= "Reply-To: " . FROM_EMAIL . "\r\n";
    
    if ($isHtml) {
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    }

    return mail($to, $subject, $body, $headers);
}

/**
 * Get request method
 */
function getRequestMethod() {
    return $_SERVER['REQUEST_METHOD'];
}

/**
 * Get request data
 */
function getRequestData() {
    $method = getRequestMethod();
    
    if ($method === 'GET') {
        return $_GET;
    } elseif ($method === 'POST') {
        return $_POST;
    } else {
        return json_decode(file_get_contents('php://input'), true) ?? [];
    }
}

/**
 * Paginate results
 */
function paginate($total_items, $current_page = 1, $items_per_page = ITEMS_PER_PAGE) {
    $total_pages = ceil($total_items / $items_per_page);
    $offset = ($current_page - 1) * $items_per_page;

    return [
        'total_items' => $total_items,
        'total_pages' => $total_pages,
        'current_page' => $current_page,
        'items_per_page' => $items_per_page,
        'offset' => $offset,
        'has_next' => $current_page < $total_pages,
        'has_prev' => $current_page > 1
    ];
}

?>