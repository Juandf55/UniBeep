<?php
/**
 * Modelo User - Gestión de usuarios
 */

class User {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    /**
     * Crear nuevo usuario
     */
    public function create($data) {
        // Validar email universitario
        $universityId = Security::validateUniversityEmail($data['email']);
        if (!$universityId) {
            throw new Exception("Debes usar un email universitario válido");
        }
        
        // Hash password
        $data['password_hash'] = Security::hashPassword($data['password']);
        unset($data['password']);
        
        // Token de verificación
        $data['verification_token'] = Security::generateToken();
        $data['university_id'] = $universityId;
        
        // Insertar usuario
        $userId = $this->db->insert('users', [
            'name' => $data['name'],
            'email' => $data['email'],
            'password_hash' => $data['password_hash'],
            'phone' => $data['phone'] ?? null,
            'university_id' => $data['university_id'],
            'verification_token' => $data['verification_token']
        ]);
        
        return [
            'user_id' => $userId,
            'verification_token' => $data['verification_token']
        ];
    }
    
    /**
     * Buscar usuario por email
     */
    public function findByEmail($email) {
        return $this->db->fetchOne(
            "SELECT * FROM users WHERE email = :email",
            ['email' => $email]
        );
    }
    
    /**
     * Buscar usuario por ID
     */
    public function findById($id) {
        return $this->db->fetchOne(
            "SELECT id, name, email, phone, university_id, career, instagram, avatar_url, is_premium, premium_until, verified, created_at 
             FROM users WHERE id = :id",
            ['id' => $id]
        );
    }
    
    /**
     * Verificar email
     */
    public function verifyEmail($token) {
        $user = $this->db->fetchOne(
            "SELECT id FROM users WHERE verification_token = :token",
            ['token' => $token]
        );
        
        if (!$user) {
            return false;
        }
        
        $this->db->update(
            'users',
            ['verified' => 1, 'verification_token' => null],
            'id = :id',
            ['id' => $user['id']]
        );
        
        return true;
    }
    
    /**
     * Actualizar perfil
     */
    public function updateProfile($userId, $data) {
        $allowedFields = ['name', 'career', 'instagram', 'avatar_url', 'phone'];
        $updateData = [];
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updateData[$field] = $data[$field];
            }
        }
        
        if (empty($updateData)) {
            return false;
        }
        
        $this->db->update('users', $updateData, 'id = :id', ['id' => $userId]);
        return true;
    }
    
    /**
     * Activar premium
     */
    public function activatePremium($userId, $months = 1) {
        $premiumUntil = date('Y-m-d H:i:s', strtotime("+{$months} months"));
        
        $this->db->update(
            'users',
            ['is_premium' => 1, 'premium_until' => $premiumUntil],
            'id = :id',
            ['id' => $userId]
        );
        
        return true;
    }
    
    /**
     * Verificar si es premium activo
     */
    public function isPremium($userId) {
        $user = $this->db->fetchOne(
            "SELECT is_premium, premium_until FROM users WHERE id = :id",
            ['id' => $userId]
        );
        
        if (!$user || !$user['is_premium']) {
            return false;
        }
        
        if ($user['premium_until'] && strtotime($user['premium_until']) < time()) {
            // Premium expirado
            $this->db->update('users', ['is_premium' => 0], 'id = :id', ['id' => $userId]);
            return false;
        }
        
        return true;
    }
}
