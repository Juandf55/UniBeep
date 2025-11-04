<?php
/**
 * Security Helper - Funciones de seguridad
 */

class Security {
    /**
     * Hash de contraseña con bcrypt
     */
    public static function hashPassword($password) {
        return password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    }
    
    /**
     * Verificar contraseña
     */
    public static function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }
    
    /**
     * Generar token aleatorio seguro
     */
    public static function generateToken($length = 32) {
        return bin2hex(random_bytes($length));
    }
    
    /**
     * Sanitizar input para prevenir XSS
     */
    public static function sanitize($input) {
        if (is_array($input)) {
            return array_map([self::class, 'sanitize'], $input);
        }
        return htmlspecialchars(strip_tags($input), ENT_QUOTES, 'UTF-8');
    }
    
    /**
     * Validar email
     */
    public static function validateEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }
    
    /**
     * Validar dominio universitario
     */
    public static function validateUniversityEmail($email) {
        $db = Database::getInstance();
        $domain = substr(strrchr($email, "@"), 1);
        
        $result = $db->fetchOne(
            "SELECT id FROM universities WHERE domain = :domain",
            ['domain' => $domain]
        );
        
        return $result !== false ? $result['id'] : false;
    }
    
    /**
     * CSRF Token
     */
    public static function generateCSRFToken() {
        if (!isset($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = self::generateToken();
        }
        return $_SESSION['csrf_token'];
    }
    
    /**
     * Verificar CSRF Token
     */
    public static function verifyCSRFToken($token) {
        return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
    }
    
    /**
     * Rate Limiting
     */
    public static function checkRateLimit($ip, $endpoint, $maxAttempts = 100, $minutes = 15) {
        $db = Database::getInstance();
        $resetAt = date('Y-m-d H:i:s', time() + ($minutes * 60));
        
        // Limpiar registros expirados
        $db->delete('rate_limits', 'reset_at < NOW()');
        
        // Verificar intentos
        $record = $db->fetchOne(
            "SELECT attempts, reset_at FROM rate_limits WHERE ip_address = :ip AND endpoint = :endpoint",
            ['ip' => $ip, 'endpoint' => $endpoint]
        );
        
        if (!$record) {
            // Primer intento
            $db->insert('rate_limits', [
                'ip_address' => $ip,
                'endpoint' => $endpoint,
                'attempts' => 1,
                'reset_at' => $resetAt
            ]);
            return true;
        }
        
        if ($record['attempts'] >= $maxAttempts) {
            return false;
        }
        
        // Incrementar intentos
        $db->query(
            "UPDATE rate_limits SET attempts = attempts + 1 WHERE ip_address = :ip AND endpoint = :endpoint",
            ['ip' => $ip, 'endpoint' => $endpoint]
        );
        
        return true;
    }
    
    /**
     * Obtener IP del cliente
     */
    public static function getClientIP() {
        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            return $_SERVER['HTTP_CLIENT_IP'];
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            return $_SERVER['HTTP_X_FORWARDED_FOR'];
        } else {
            return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        }
    }
}
