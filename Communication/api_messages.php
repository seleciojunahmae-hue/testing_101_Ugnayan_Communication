<?php
/**
 * Barangay Communication Module - Messages API
 * Handles all message-related operations
 */

require_once __DIR__ . '/config.php';

class MessagesAPI {
    private $db;
    private $security;

    public function __construct() {
        global $db, $security;
        $this->db = $db;
        $this->security = $security;
    }

    /**
     * Get all messages for user
     */
    public function getMessages() {
        $this->security->verifyAuth();
        $user = getCurrentUser();

        $messages = $this->db->getRows(
            "SELECT m.*, u.name as sender_name, u.avatar 
             FROM messages m 
             JOIN users u ON m.sender_id = u.id 
             WHERE m.recipient_id = ? OR m.sender_id = ? 
             ORDER BY m.created_at DESC",
            [$user['id'], $user['id']]
        );

        sendSuccessResponse($messages, 'Messages retrieved successfully');
    }

    /**
     * Get single message
     */
    public function getMessage($id) {
        $this->security->verifyAuth();
        $user = getCurrentUser();

        $message = $this->db->getRow(
            "SELECT m.*, u.name as sender_name 
             FROM messages m 
             JOIN users u ON m.sender_id = u.id 
             WHERE m.id = ? AND (m.recipient_id = ? OR m.sender_id = ?)",
            [$id, $user['id'], $user['id']]
        );

        if (!$message) {
            sendErrorResponse('Message not found', 404);
        }

        sendSuccessResponse($message, 'Message retrieved successfully');
    }

    /**
     * Create new message
     */
    public function createMessage() {
        $this->security->verifyAuth();
        $user = getCurrentUser();
        $data = getRequestData();

        // Validate input
        $validation = $this->security->validateInput($data, [
            'recipient_id' => 'required',
            'subject' => 'required|min:3|max:255',
            'content' => 'required|min:5',
            'category' => 'required'
        ]);

        if (!$validation['valid']) {
            sendErrorResponse('Validation failed: ' . implode(', ', $validation['errors']), 400);
        }

        // Create message
        $message_data = [
            'sender_id' => $user['id'],
            'recipient_id' => (int)$data['recipient_id'],
            'subject' => sanitizeInput($data['subject']),
            'content' => sanitizeInput($data['content']),
            'category' => sanitizeInput($data['category']),
            'status' => 'sent',
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ];

        $message_id = $this->db->insert('messages', $message_data);

        if ($message_id) {
            $this->security->logActivity('message_sent', 'Message ID: ' . $message_id);
            sendSuccessResponse(['id' => $message_id], 'Message sent successfully');
        }

        sendErrorResponse('Failed to send message', 500);
    }

    /**
     * Update message status
     */
    public function updateMessageStatus($id) {
        $this->security->verifyAuth();
        $user = getCurrentUser();
        $data = getRequestData();

        // Verify ownership
        $message = $this->db->getRow(
            "SELECT * FROM messages WHERE id = ? AND (recipient_id = ? OR sender_id = ?)",
            [$id, $user['id'], $user['id']]
        );

        if (!$message) {
            sendErrorResponse('Message not found', 404);
        }

        // Update status
        $this->db->update('messages',
            ['status' => sanitizeInput($data['status']), 'updated_at' => date('Y-m-d H:i:s')],
            "id = $id"
        );

        sendSuccessResponse([], 'Message status updated');
    }

    /**
     * Delete message
     */
    public function deleteMessage($id) {
        $this->security->verifyAuth();
        $user = getCurrentUser();

        // Verify ownership
        $message = $this->db->getRow(
            "SELECT * FROM messages WHERE id = ? AND sender_id = ?",
            [$id, $user['id']]
        );

        if (!$message) {
            sendErrorResponse('Message not found', 404);
        }

        // Delete message
        $this->db->delete('messages', "id = $id");
        $this->security->logActivity('message_deleted', 'Message ID: ' . $id);

        sendSuccessResponse([], 'Message deleted successfully');
    }

    /**
     * Search messages
     */
    public function searchMessages() {
        $this->security->verifyAuth();
        $user = getCurrentUser();
        $data = getRequestData();
        $query = sanitizeInput($data['query'] ?? '');

        if (strlen($query) < 2) {
            sendErrorResponse('Search query too short', 400);
        }

        $messages = $this->db->getRows(
            "SELECT m.*, u.name as sender_name 
             FROM messages m 
             JOIN users u ON m.sender_id = u.id 
             WHERE (m.recipient_id = ? OR m.sender_id = ?) 
             AND (m.subject LIKE ? OR m.content LIKE ? OR u.name LIKE ?)
             ORDER BY m.created_at DESC",
            [$user['id'], $user['id'], "%$query%", "%$query%", "%$query%"]
        );

        sendSuccessResponse($messages, 'Search results');
    }

    /**
     * Get message count
     */
    public function getMessageCount() {
        $this->security->verifyAuth();
        $user = getCurrentUser();

        $unread_count = $this->db->count('messages', "recipient_id = {$user['id']} AND status = 'unread'");
        $total_count = $this->db->count('messages', "recipient_id = {$user['id']} OR sender_id = {$user['id']}");

        sendSuccessResponse([
            'unread' => $unread_count,
            'total' => $total_count
        ], 'Message count retrieved');
    }
}

// Route handling
$method = getRequestMethod();
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$parts = explode('/', trim($path, '/'));

$api = new MessagesAPI();

if ($method === 'GET') {
    if (end($parts) === 'messages') {
        $api->getMessages();
    } elseif (end($parts) === 'count') {
        $api->getMessageCount();
    } elseif (end($parts) === 'search') {
        $api->searchMessages();
    } elseif (is_numeric(end($parts))) {
        $api->getMessage(end($parts));
    }
} elseif ($method === 'POST') {
    $api->createMessage();
} elseif ($method === 'PUT') {
    if (is_numeric(end($parts))) {
        $api->updateMessageStatus(end($parts));
    }
} elseif ($method === 'DELETE') {
    if (is_numeric(end($parts))) {
        $api->deleteMessage(end($parts));
    }
}

sendErrorResponse('Invalid request', 400);

?>