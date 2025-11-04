<?php
/**
 * API Entry Point
 * Todas las peticiones a /api/* pasan por aquí
 */

// Iniciar sesión
session_start();

// Headers CORS (ajustar en producción)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Manejar preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Autoload
require_once __DIR__ . '/../app/helpers/Database.php';
require_once __DIR__ . '/../app/helpers/JWT.php';
require_once __DIR__ . '/../app/helpers/Security.php';
require_once __DIR__ . '/../app/helpers/Response.php';
require_once __DIR__ . '/../app/middlewares/AuthMiddleware.php';
require_once __DIR__ . '/../app/models/User.php';
require_once __DIR__ . '/../app/models/Ride.php';
require_once __DIR__ . '/../app/models/Message.php';
require_once __DIR__ . '/../app/controllers/AuthController.php';
require_once __DIR__ . '/../app/controllers/RideController.php';
require_once __DIR__ . '/../app/controllers/MessageController.php';
require_once __DIR__ . '/../app/Router.php';

// Manejo de errores
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    error_log("Error [{$errno}]: {$errstr} in {$errfile}:{$errline}");
    Response::error('Error interno del servidor', 500);
});

// Rate limiting
$config = require __DIR__ . '/../config/app.php';
if ($config['rate_limit']['enabled']) {
    $ip = Security::getClientIP();
    $endpoint = $_SERVER['REQUEST_URI'];
    
    if (!Security::checkRateLimit($ip, $endpoint, $config['rate_limit']['max_requests'], $config['rate_limit']['per_minutes'])) {
        Response::tooManyRequests();
    }
}

// Crear router
$router = new Router();

// ========== RUTAS PÚBLICAS ==========

// Auth
$router->post('/api/auth/register', function() {
    $controller = new AuthController();
    $controller->register();
});

$router->post('/api/auth/login', function() {
    $controller = new AuthController();
    $controller->login();
});

$router->get('/api/auth/verify/{token}', function($token) {
    $controller = new AuthController();
    $controller->verifyEmail($token);
});

$router->post('/api/auth/logout', function() {
    $controller = new AuthController();
    $controller->logout();
});

// Búsqueda de viajes (público)
$router->get('/api/rides/search', function() {
    $controller = new RideController();
    $controller->search();
});

$router->get('/api/rides/{id}', function($id) {
    $controller = new RideController();
    $controller->show($id);
});

// ========== RUTAS PROTEGIDAS (requieren autenticación) ==========

// Perfil de usuario
$router->get('/api/auth/me', function() {
    $userId = AuthMiddleware::check();
    $controller = new AuthController();
    $controller->me($userId);
});

// Gestión de viajes
$router->post('/api/rides', function() {
    $userId = AuthMiddleware::check();
    $controller = new RideController();
    $controller->create($userId);
});

$router->get('/api/rides/my-rides', function() {
    $userId = AuthMiddleware::check();
    $controller = new RideController();
    $controller->myRides($userId);
});

$router->post('/api/rides/{id}/join', function($id) {
    $userId = AuthMiddleware::check();
    $controller = new RideController();
    $controller->join($id, $userId);
});

$router->put('/api/rides/{id}/status', function($id) {
    $userId = AuthMiddleware::check();
    $controller = new RideController();
    $controller->updateStatus($id, $userId);
});

// Chat
$router->post('/api/messages', function() {
    $userId = AuthMiddleware::check();
    $controller = new MessageController();
    $controller->send($userId);
});

$router->get('/api/messages/chats', function() {
    $userId = AuthMiddleware::check();
    $controller = new MessageController();
    $controller->getChats($userId);
});

$router->get('/api/messages/conversation/{otherUserId}', function($otherUserId) {
    $userId = AuthMiddleware::check();
    $controller = new MessageController();
    $controller->getConversation($userId, $otherUserId);
});

// Ejecutar router
$router->run();
