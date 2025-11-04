<?php
/**
 * Response Helper - Respuestas JSON estandarizadas
 */

class Response {
    /**
     * Respuesta exitosa
     */
    public static function success($data = [], $message = 'Success', $code = 200) {
        http_response_code($code);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'message' => $message,
            'data' => $data
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    /**
     * Respuesta de error
     */
    public static function error($message = 'Error', $code = 400, $errors = []) {
        http_response_code($code);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => $message,
            'errors' => $errors
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    /**
     * No autorizado
     */
    public static function unauthorized($message = 'No autorizado') {
        self::error($message, 401);
    }
    
    /**
     * Prohibido
     */
    public static function forbidden($message = 'Acceso prohibido') {
        self::error($message, 403);
    }
    
    /**
     * No encontrado
     */
    public static function notFound($message = 'No encontrado') {
        self::error($message, 404);
    }
    
    /**
     * Too Many Requests
     */
    public static function tooManyRequests($message = 'Demasiadas solicitudes. Intenta más tarde.') {
        self::error($message, 429);
    }
}
