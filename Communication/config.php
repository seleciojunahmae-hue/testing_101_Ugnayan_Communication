<?php
/**
 * Barangay Communication Module - Configuration
 * Database and application configuration settings
 */

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'barangay_user');
define('DB_PASS', 'secure_password_123');
define('DB_NAME', 'barangay_comm_db');

// Application Settings
define('APP_NAME', 'Barangay Communication Module');
define('APP_VERSION', '1.0.0');
define('APP_URL', 'http://localhost:8000');

// Session Configuration
define('SESSION_TIMEOUT', 3600); // 1 hour
define('SESSION_NAME', 'barangay_session');

// Security Settings
define('ENABLE_CSRF', true);
define('ENABLE_RATE_LIMITING', true);
define('MAX_REQUESTS_PER_MINUTE', 60);

// Error Handling
define('DEBUG_MODE', false);
define('LOG_ERRORS', true);
define('LOG_FILE', __DIR__ . '/../logs/error.log');

// Pagination
define('ITEMS_PER_PAGE', 20);

// File Upload Settings
define('MAX_FILE_SIZE', 5242880); // 5MB
define('ALLOWED_FILE_TYPES', ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png']);
define('UPLOAD_DIR', __DIR__ . '/../uploads/');

// Email Configuration
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USER', 'noreply@barangay.gov.ph');
define('SMTP_PASS', 'email_password');
define('FROM_EMAIL', 'noreply@barangay.gov.ph');
define('FROM_NAME', 'Barangay Communication System');

// API Configuration
define('API_RATE_LIMIT', 1000); // requests per hour
define('API_TIMEOUT', 30); // seconds

// Start session
session_name(SESSION_NAME);
session_start();

// Set timezone
date_default_timezone_set('Asia/Manila');

// Error reporting
if (DEBUG_MODE) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(E_ALL);
    ini_set('display_errors', 0);
}

// Include utility functions
require_once __DIR__ . '/functions.php';
require_once __DIR__ . '/database.php';
require_once __DIR__ . '/security.php';

// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Security Headers
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('X-XSS-Protection: 1; mode=block');
header('Strict-Transport-Security: max-age=31536000; includeSubDomains');

?>