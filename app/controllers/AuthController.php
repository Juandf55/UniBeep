<?php
/**
 * AuthController - Gestión de autenticación
 */

class AuthController {
    private $userModel;
    
    public function __construct() {
        $this->userModel = new User();
    }
    
    /**
     * Registro de usuario
     * POST /api/auth/register
     */
    public function register() {
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validaciones
        $errors = [];
        if (empty($data['name'])) $errors['name'] = 'El nombre es requerido';
        if (empty($data['email'])) $errors['email'] = 'El email es requerido';
        if (!Security::validateEmail($data['email'])) $errors['email'] = 'Email inválido';
        if (empty($data['password']) || strlen($data['password']) < 8) {
            $errors['password'] = 'La contraseña debe tener al menos 8 caracteres';
        }
        
        if (!empty($errors)) {
            Response::error('Datos inválidos', 400, $errors);
        }
        
        // Verificar si el email ya existe
        if ($this->userModel->findByEmail($data['email'])) {
            Response::error('El email ya está registrado', 400);
        }
        
        try {
            $result = $this->userModel->create($data);
            
            // TODO: Enviar email de verificación
            // $this->sendVerificationEmail($data['email'], $result['verification_token']);
            
            Response::success([
                'user_id' => $result['user_id'],
                'message' => 'Revisa tu email para verificar tu cuenta'
            ], 'Usuario registrado correctamente', 201);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }
    
    /**
     * Login de usuario
     * POST /api/auth/login
     */
    public function login() {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (empty($data['email']) || empty($data['password'])) {
            Response::error('Email y contraseña requeridos', 400);
        }
        
        $user = $this->userModel->findByEmail($data['email']);
        
        if (!$user || !Security::verifyPassword($data['password'], $user['password_hash'])) {
            Response::error('Credenciales inválidas', 401);
        }
        
        if (!$user['verified']) {
            Response::error('Debes verificar tu email primero', 403);
        }
        
        // Generar JWT
        $payload = [
            'user_id' => $user['id'],
            'email' => $user['email'],
            'is_premium' => (bool)$user['is_premium']
        ];
        
        $token = JWT::encode($payload);
        
        // Guardar sesión en BD
        $db = Database::getInstance();
        $expiresAt = date('Y-m-d H:i:s', time() + 86400); // 24 horas
        
        $db->insert('user_sessions', [
            'user_id' => $user['id'],
            'token' => $token,
            'ip_address' => Security::getClientIP(),
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
            'expires_at' => $expiresAt
        ]);
        
        // Establecer cookie con el token
        setcookie('auth_token', $token, time() + 86400, '/', '', true, true);
        
        Response::success([
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'is_premium' => (bool)$user['is_premium']
            ]
        ], 'Login exitoso');
    }
    
    /**
     * Verificar email
     * GET /api/auth/verify/{token}
     */
    public function verifyEmail($token) {
        if ($this->userModel->verifyEmail($token)) {
            // Redirigir a página de éxito
            header('Location: /verificacion-exitosa.html');
            exit;
        } else {
            Response::error('Token de verificación inválido', 400);
        }
    }
    
    /**
     * Logout
     * POST /api/auth/logout
     */
    public function logout() {
        $token = $_COOKIE['auth_token'] ?? null;
        
        if ($token) {
            // Eliminar sesión de BD
            $db = Database::getInstance();
            $db->delete('user_sessions', 'token = :token', ['token' => $token]);
            
            // Eliminar cookie
            setcookie('auth_token', '', time() - 3600, '/');
        }
        
        Response::success([], 'Logout exitoso');
    }
    
    /**
     * Obtener usuario actual
     * GET /api/auth/me
     */
    public function me($userId) {
        $user = $this->userModel->findById($userId);
        
        if (!$user) {
            Response::error('Usuario no encontrado', 404);
        }
        
        Response::success($user);
    }
}
