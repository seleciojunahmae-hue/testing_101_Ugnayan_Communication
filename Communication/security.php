<?php
/**
 * Barangay Communication Module - Security Handler
 * Manages authentication, authorization, and security checks
 */

class Security {
    private $db;

    public function __construct() {
        global $db;
        $this->db = $db;
    }

    /**
     * Register new user
     */
    public function registerUser($email, $password, $name, $role = 'resident') {
        // Validate input
        if (!validateEmail($email)) {
            return ['success' => false, 'message' => 'Invalid email address'];
        }

        if (strlen($password) < 8) {
            return ['success' => false, 'message' => 'Password must be at least 8 characters'];
        }

        // Check if user already exists
        $existing_user = $this->db->getRow(
            "SELECT id FROM users WHERE email = ?",
            [$email]
        );

        if ($existing_user) {
            return ['success' => false, 'message' => 'Email already registered'];
        }

        // Create user
        $user_data = [
            'email' => $email,
            'password' => hashPassword($password),
            'name' => sanitizeInput($name),
            'role' => $role,
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ];

        $user_id = $this->db->insert('users', $user_data);

        if ($user_id) {
            return ['success' => true, 'message' => 'User registered successfully', 'user_id' => $user_id];
        }

        return ['success' => false, 'message' => 'Failed to register user'];
    }

    /**
     * Login user
     */
    public function loginUser($email, $password) {
        // Validate input
        if (!validateEmail($email)) {
            return ['success' => false, 'message' => 'Invalid email address'];
        }

        // Get user
        $user = $this->db->getRow(
            "SELECT id, email, password, name, role FROM users WHERE email = ?",
            [$email]
        );

        if (!$user) {
            return ['success' => false, 'message' => 'Invalid email or password'];
        }

        // Verify password
        if (!verifyPassword($password, $user['password'])) {
            return ['success' => false, 'message' => 'Invalid email or password'];
        }

        // Set session
        unset($user['password']);
        setCurrentUser($user);

        // Update last login
        $this->db->update('users', 
            ['last_login' => date('Y-m-d H:i:s')],
            "id = {$user['id']}"
        );

        return ['success' => true, 'message' => 'Login successful', 'user' => $user];
    }

    /**
     * Logout user
     */
    public function logoutUser() {
        session_destroy();
        return ['success' => true, 'message' => 'Logout successful'];
    }

    /**
     * Verify authentication
     */
    public function verifyAuth() {
        if (!isLoggedIn()) {
            sendErrorResponse('Unauthorized', 401);
        }
    }

    /**
     * Verify admin access
     */
    public function verifyAdminAccess() {
        $this->verifyAuth();
        
        if (!isAdmin()) {
            sendErrorResponse('Access denied', 403);
        }
    }

    /**
     * Rate limiting
     */
    public function checkRateLimit($identifier, $limit = MAX_REQUESTS_PER_MINUTE) {
        if (!ENABLE_RATE_LIMITING) {
            return true;
        }

        $key = "rate_limit_" . md5($identifier);
        $current_time = time();
        $window = $current_time - 60;

        // Get request count from session
        if (!isset($_SESSION[$key])) {
            $_SESSION[$key] = [];
        }

        // Remove old requests outside the window
        $_SESSION[$key] = array_filter($_SESSION[$key], function($timestamp) use ($window) {
            return $timestamp > $window;
        });

        // Check if limit exceeded
        if (count($_SESSION[$key]) >= $limit) {
            return false;
        }

        // Add current request
        $_SESSION[$key][] = $current_time;

        return true;
    }

    /**
     * Validate CSRF protection
     */
    public function validateCsrf($token) {
        if (!ENABLE_CSRF) {
            return true;
        }

        return verifyCsrfToken($token);
    }

    /**
     * Get CSRF token
     */
    public function getCsrfToken() {
        return generateCsrfToken();
    }

    /**
     * Sanitize input
     */
    public function sanitizeInput($input) {
        return sanitizeInput($input);
    }

    /**
     * Validate input
     */
    public function validateInput($data, $rules) {
        $errors = [];

        foreach ($rules as $field => $rule) {
            $value = isset($data[$field]) ? $data[$field] : '';

            if (strpos($rule, 'required') !== false && empty($value)) {
                $errors[$field] = ucfirst($field) . ' is required';
            }

            if (strpos($rule, 'email') !== false && !empty($value) && !validateEmail($value)) {
                $errors[$field] = 'Invalid email address';
            }

            if (strpos($rule, 'phone') !== false && !empty($value) && !validatePhone($value)) {
                $errors[$field] = 'Invalid phone number';
            }

            if (preg_match('/min:(\d+)/', $rule, $matches) && strlen($value) < $matches[1]) {
                $errors[$field] = ucfirst($field) . ' must be at least ' . $matches[1] . ' characters';
            }

            if (preg_match('/max:(\d+)/', $rule, $matches) && strlen($value) > $matches[1]) {
                $errors[$field] = ucfirst($field) . ' must not exceed ' . $matches[1] . ' characters';
            }
        }

        return [
            'valid' => count($errors) === 0,
            'errors' => $errors
        ];
    }

    /**
     * Log activity
     */
    public function logActivity($action, $details = '') {
        $user = getCurrentUser();
        $user_id = $user ? $user['id'] : null;
        $ip_address = $_SERVER['REMOTE_ADDR'];
        $timestamp = date('Y-m-d H:i:s');

        $log_data = [
            'user_id' => $user_id,
            'action' => $action,
            'details' => $details,
            'ip_address' => $ip_address,
            'created_at' => $timestamp
        ];

        return $this->db->insert('activity_logs', $log_data);
    }
}

// Create global security instance
$security = new Security();

?>