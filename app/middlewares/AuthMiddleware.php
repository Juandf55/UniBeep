<?php
/**
 * AuthMiddleware - Verificar autenticación
 */

class AuthMiddleware {
    /**
     * Verificar si el usuario está autenticado
     */
    public static function check() {
        $token = $_COOKIE['auth_token'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? null;
        
        if (!$token) {
            // Si viene del header Authorization, extraer el token
            if (isset($_SERVER['HTTP_AUTHORIZATION']) && preg_match('/Bearer\s(\S+)/', $_SERVER['HTTP_AUTHORIZATION'], $matches)) {
                $token = $matches[1];
            }
        }
        
        if (!$token) {
            Response::unauthorized('Token no proporcionado');
        }
        
        // Decodificar JWT
        $payload = JWT::decode($token);
        
        if (!$payload) {
            Response::unauthorized('Token inválido o expirado');
        }
        
        // Verificar que la sesión existe en BD
        $db = Database::getInstance();
        $session = $db->fetchOne(
            "SELECT user_id, expires_at FROM user_sessions WHERE token = :token",
            ['token' => $token]
        );
        
        if (!$session || strtotime($session['expires_at']) < time()) {
            Response::unauthorized('Sesión expirada');
        }
        
        // Retornar user_id
        return $payload['user_id'];
    }
    
    /**
     * Verificar si el usuario es premium
     */
    public static function checkPremium($userId) {
        $userModel = new User();
        
        if (!$userModel->isPremium($userId)) {
            Response::forbidden('Esta función requiere una cuenta premium');
        }
        
        return true;
    }
}
