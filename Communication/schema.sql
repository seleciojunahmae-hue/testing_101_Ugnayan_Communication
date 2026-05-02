-- Barangay Communication Module - Database Schema
-- Create database
CREATE DATABASE IF NOT EXISTS barangay_comm_db;
USE barangay_comm_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    role ENUM('resident', 'admin', 'staff') DEFAULT 'resident',
    avatar VARCHAR(255),
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_status (status)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    recipient_id INT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content LONGTEXT NOT NULL,
    category ENUM('complaint', 'request', 'inquiry', 'feedback', 'announcement') NOT NULL,
    status ENUM('sent', 'read', 'replied', 'archived', 'deleted') DEFAULT 'sent',
    priority BOOLEAN DEFAULT FALSE,
    attachment_path VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_sender (sender_id),
    INDEX idx_recipient (recipient_id),
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Message replies table
CREATE TABLE IF NOT EXISTS message_replies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    message_id INT NOT NULL,
    sender_id INT NOT NULL,
    content LONGTEXT NOT NULL,
    attachment_path VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_message (message_id),
    INDEX idx_sender (sender_id)
);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content LONGTEXT NOT NULL,
    category ENUM('event', 'alert', 'healthcare', 'general') NOT NULL,
    created_by INT NOT NULL,
    published_at DATETIME,
    expires_at DATETIME,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_published_at (published_at)
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    category VARCHAR(100) NOT NULL,
    comment LONGTEXT NOT NULL,
    status ENUM('submitted', 'reviewed', 'responded') DEFAULT 'submitted',
    response TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_rating (rating),
    INDEX idx_status (status)
);

-- Quick reply templates table
CREATE TABLE IF NOT EXISTS quick_reply_templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    content LONGTEXT NOT NULL,
    category VARCHAR(100),
    created_by INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_category (category)
);

-- Communication logs table
CREATE TABLE IF NOT EXISTS communication_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
);

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
);

-- Broadcast messages table
CREATE TABLE IF NOT EXISTS broadcasts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content LONGTEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    recipients_type ENUM('all', 'specific', 'group') DEFAULT 'all',
    recipients_data JSON,
    created_by INT NOT NULL,
    sent_at DATETIME,
    status ENUM('draft', 'scheduled', 'sent') DEFAULT 'draft',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_sent_at (sent_at)
);

-- Insert sample admin user
INSERT INTO users (email, password, name, role, status) VALUES 
('admin@barangay.gov.ph', '$2y$12$R9h7cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ee8Ew5K1q0Ij3Cvm', 'Barangay Administrator', 'admin', 'active');

-- Insert sample resident users
INSERT INTO users (email, password, name, role, status) VALUES 
('maria@example.com', '$2y$12$R9h7cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ee8Ew5K1q0Ij3Cvm', 'Maria Santos', 'resident', 'active'),
('pedro@example.com', '$2y$12$R9h7cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ee8Ew5K1q0Ij3Cvm', 'Pedro Reyes', 'resident', 'active'),
('rosa@example.com', '$2y$12$R9h7cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ee8Ew5K1q0Ij3Cvm', 'Rosa Garcia', 'resident', 'active');

-- Create indexes for performance
CREATE INDEX idx_messages_search ON messages(subject, content(100));
CREATE INDEX idx_announcements_search ON announcements(title, content(100));