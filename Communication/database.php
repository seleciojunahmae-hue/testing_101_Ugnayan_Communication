<?php
/**
 * Barangay Communication Module - Database Handler
 * Manages all database operations
 */

class Database {
    private $connection;
    private $host = DB_HOST;
    private $db_name = DB_NAME;
    private $user = DB_USER;
    private $password = DB_PASS;
    private $charset = 'utf8mb4';

    /**
     * Connect to database
     */
    public function connect() {
        $dsn = 'mysql:host=' . $this->host . ';dbname=' . $this->db_name . ';charset=' . $this->charset;
        
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];

        try {
            $this->connection = new PDO($dsn, $this->user, $this->password, $options);
            return $this->connection;
        } catch (PDOException $e) {
            logError('Database Connection Error: ' . $e->getMessage());
            die('Database connection failed');
        }
    }

    /**
     * Get database connection
     */
    public function getConnection() {
        if (!$this->connection) {
            $this->connect();
        }
        return $this->connection;
    }

    /**
     * Execute query
     */
    public function query($sql, $params = []) {
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            logError('Query Error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Get single row
     */
    public function getRow($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        if ($stmt) {
            return $stmt->fetch();
        }
        return false;
    }

    /**
     * Get all rows
     */
    public function getRows($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        if ($stmt) {
            return $stmt->fetchAll();
        }
        return [];
    }

    /**
     * Insert record
     */
    public function insert($table, $data) {
        $columns = implode(', ', array_keys($data));
        $placeholders = implode(', ', array_fill(0, count($data), '?'));
        $sql = "INSERT INTO $table ($columns) VALUES ($placeholders)";
        
        $stmt = $this->query($sql, array_values($data));
        return $stmt ? $this->connection->lastInsertId() : false;
    }

    /**
     * Update record
     */
    public function update($table, $data, $where) {
        $set = implode(', ', array_map(function($key) {
            return "$key = ?";
        }, array_keys($data)));
        
        $sql = "UPDATE $table SET $set WHERE $where";
        $params = array_merge(array_values($data), []);
        
        $stmt = $this->query($sql, array_values($data));
        return $stmt ? $stmt->rowCount() : false;
    }

    /**
     * Delete record
     */
    public function delete($table, $where) {
        $sql = "DELETE FROM $table WHERE $where";
        $stmt = $this->query($sql);
        return $stmt ? $stmt->rowCount() : false;
    }

    /**
     * Count records
     */
    public function count($table, $where = '') {
        $sql = "SELECT COUNT(*) as count FROM $table";
        if ($where) {
            $sql .= " WHERE $where";
        }
        $result = $this->getRow($sql);
        return $result ? $result['count'] : 0;
    }

    /**
     * Begin transaction
     */
    public function beginTransaction() {
        return $this->connection->beginTransaction();
    }

    /**
     * Commit transaction
     */
    public function commit() {
        return $this->connection->commit();
    }

    /**
     * Rollback transaction
     */
    public function rollback() {
        return $this->connection->rollBack();
    }

    /**
     * Close connection
     */
    public function close() {
        $this->connection = null;
    }
}

// Create global database instance
$db = new Database();
$db->connect();

?>