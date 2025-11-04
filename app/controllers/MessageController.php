<?php
/**
 * MessageController - Sistema de chat
 */

class MessageController {
    private $messageModel;
    
    public function __construct() {
        $this->messageModel = new Message();
    }
    
    /**
     * Enviar mensaje
     * POST /api/messages
     */
    public function send($userId) {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (empty($data['receiver_id']) || empty($data['content'])) {
            Response::error('Receptor y contenido requeridos', 400);
        }
        
        try {
            $messageId = $this->messageModel->send(
                $userId,
                $data['receiver_id'],
                $data['content'],
                $data['ride_id'] ?? null
            );
            
            Response::success(['message_id' => $messageId], 'Mensaje enviado', 201);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }
    
    /**
     * Obtener conversación
     * GET /api/messages/conversation/{userId}
     */
    public function getConversation($currentUserId, $otherUserId) {
        $messages = $this->messageModel->getConversation($currentUserId, $otherUserId);
        
        // Marcar como leídos
        $this->messageModel->markAsRead($currentUserId, $otherUserId);
        
        Response::success($messages);
    }
    
    /**
     * Obtener lista de chats
     * GET /api/messages/chats
     */
    public function getChats($userId) {
        $chats = $this->messageModel->getUserChats($userId);
        Response::success($chats);
    }
}
