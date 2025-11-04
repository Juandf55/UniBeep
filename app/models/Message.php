<?php
/**
 * Modelo Message - Sistema de chat
 */

class Message {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    /**
     * Enviar mensaje
     */
    public function send($senderId, $receiverId, $content, $rideId = null) {
        // Verificar límite diario de mensajes
        $config = require __DIR__ . '/../../config/app.php';
        $today = date('Y-m-d');
        
        $count = $this->db->fetchOne(
            "SELECT COUNT(*) as total FROM messages 
             WHERE sender_id = :id AND DATE(created_at) = :today",
            ['id' => $senderId, 'today' => $today]
        );
        
        if ($count['total'] >= $config['max_messages_per_day']) {
            throw new Exception("Has alcanzado el límite diario de mensajes");
        }
        
        return $this->db->insert('messages', [
            'sender_id' => $senderId,
            'receiver_id' => $receiverId,
            'content' => $content,
            'ride_id' => $rideId
        ]);
    }
    
    /**
     * Obtener conversación entre dos usuarios
     */
    public function getConversation($userId1, $userId2, $limit = 50) {
        return $this->db->fetchAll(
            "SELECT m.*, u.name as sender_name, u.avatar_url as sender_avatar
             FROM messages m
             JOIN users u ON m.sender_id = u.id
             WHERE (m.sender_id = :user1 AND m.receiver_id = :user2)
                OR (m.sender_id = :user2 AND m.receiver_id = :user1)
             ORDER BY m.created_at DESC
             LIMIT :limit",
            ['user1' => $userId1, 'user2' => $userId2, 'limit' => $limit]
        );
    }
    
    /**
     * Obtener lista de chats del usuario
     */
    public function getUserChats($userId) {
        return $this->db->fetchAll(
            "SELECT DISTINCT 
                    CASE 
                        WHEN m.sender_id = :user THEN m.receiver_id 
                        ELSE m.sender_id 
                    END as user_id,
                    u.name, u.avatar_url,
                    (SELECT content FROM messages m2 
                     WHERE (m2.sender_id = u.id AND m2.receiver_id = :user)
                        OR (m2.receiver_id = u.id AND m2.sender_id = :user)
                     ORDER BY m2.created_at DESC LIMIT 1) as last_message,
                    (SELECT COUNT(*) FROM messages m3
                     WHERE m3.sender_id = u.id AND m3.receiver_id = :user AND m3.is_read = 0) as unread_count
             FROM messages m
             JOIN users u ON u.id = CASE 
                                        WHEN m.sender_id = :user THEN m.receiver_id 
                                        ELSE m.sender_id 
                                     END
             WHERE m.sender_id = :user OR m.receiver_id = :user
             ORDER BY (SELECT created_at FROM messages m4
                       WHERE (m4.sender_id = u.id AND m4.receiver_id = :user)
                          OR (m4.receiver_id = u.id AND m4.sender_id = :user)
                       ORDER BY m4.created_at DESC LIMIT 1) DESC",
            ['user' => $userId]
        );
    }
    
    /**
     * Marcar mensajes como leídos
     */
    public function markAsRead($userId, $senderId) {
        $this->db->query(
            "UPDATE messages SET is_read = 1 
             WHERE receiver_id = :receiver AND sender_id = :sender",
            ['receiver' => $userId, 'sender' => $senderId]
        );
        return true;
    }
}
