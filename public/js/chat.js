/**
 * Chat System
 * Sistema de mensajería en tiempo real
 */

const Chat = {
    currentConversation: null,
    refreshInterval: null,
    
    /**
     * Abrir conversación
     */
    async openConversation(userId) {
        if (!Auth.requireAuth()) return;
        
        this.currentConversation = userId;
        
        // Mostrar modal de chat
        this.showChatModal(userId);
        
        // Cargar mensajes
        await this.loadMessages(userId);
        
        // Auto-refresh cada 3 segundos
        if (this.refreshInterval) clearInterval(this.refreshInterval);
        this.refreshInterval = setInterval(() => {
            this.loadMessages(userId, true);
        }, 3000);
    },
    
    /**
     * Mostrar modal de chat
     */
    showChatModal(userId) {
        let modal = document.getElementById('chat-modal');
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'chat-modal';
            modal.className = 'chat-modal';
            document.body.appendChild(modal);
        }
        
        modal.innerHTML = `
            <div class="chat-modal-content">
                <div class="chat-modal-header">
                    <h3>Chat</h3>
                    <button class="chat-close" onclick="Chat.closeConversation()">&times;</button>
                </div>
                <div class="chat-messages" id="chat-messages">
                    <div class="loading">Cargando mensajes...</div>
                </div>
                <div class="chat-input-container">
                    <textarea id="chat-input" placeholder="Escribe un mensaje..." rows="2"></textarea>
                    <button class="btn-send" onclick="Chat.sendMessage()">Enviar</button>
                </div>
            </div>
        `;
        
        modal.style.display = 'flex';
        
        // Focus en el input
        setTimeout(() => {
            document.getElementById('chat-input')?.focus();
        }, 100);
        
        // Enviar con Enter (Shift+Enter para nueva línea)
        document.getElementById('chat-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    },
    
    /**
     * Cargar mensajes
     */
    async loadMessages(userId, silent = false) {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;
        
        if (!silent) {
            messagesContainer.innerHTML = '<div class="loading">Cargando mensajes...</div>';
        }
        
        try {
            const response = await API.messages.getConversation(userId);
            
            if (response.success) {
                const currentUser = API.auth.getUser();
                const messages = response.data.reverse(); // Orden cronológico
                
                if (messages.length > 0) {
                    messagesContainer.innerHTML = messages.map(msg => `
                        <div class="chat-message ${msg.sender_id === currentUser.id ? 'own-message' : 'other-message'}">
                            <div class="message-avatar">
                                <img src="${msg.sender_avatar || '/images/default-avatar.png'}" alt="${msg.sender_name}">
                            </div>
                            <div class="message-content">
                                <div class="message-author">${msg.sender_name}</div>
                                <div class="message-text">${this.escapeHtml(msg.content)}</div>
                                <div class="message-time">${this.formatTime(msg.created_at)}</div>
                            </div>
                        </div>
                    `).join('');
                    
                    // Scroll al último mensaje
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                } else {
                    messagesContainer.innerHTML = '<div class="empty-chat">Aún no hay mensajes. ¡Empieza la conversación!</div>';
                }
            }
        } catch (error) {
            console.error('Error cargando mensajes:', error);
            if (!silent) {
                messagesContainer.innerHTML = '<div class="error">Error al cargar mensajes</div>';
            }
        }
    },
    
    /**
     * Enviar mensaje
     */
    async sendMessage() {
        if (!this.currentConversation) return;
        
        const input = document.getElementById('chat-input');
        const content = input.value.trim();
        
        if (!content) return;
        
        try {
            await API.messages.send(this.currentConversation, content);
            input.value = '';
            await this.loadMessages(this.currentConversation, true);
        } catch (error) {
            Auth.showMessage(error.message, 'error');
        }
    },
    
    /**
     * Iniciar conversación (desde tarjeta de viaje)
     */
    startConversation(userId) {
        this.openConversation(userId);
    },
    
    /**
     * Cerrar conversación
     */
    closeConversation() {
        const modal = document.getElementById('chat-modal');
        if (modal) modal.style.display = 'none';
        
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
        
        this.currentConversation = null;
    },
    
    /**
     * Formatear tiempo
     */
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Ahora';
        if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)} min`;
        if (diff < 86400000) return `Hace ${Math.floor(diff / 3600000)} h`;
        
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    },
    
    /**
     * Escapar HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Exportar
window.Chat = Chat;

// Estilos del chat
const chatStyles = document.createElement('style');
chatStyles.textContent = `
    .chat-modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(5px);
        z-index: 10000;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
    }
    
    .chat-modal-content {
        background: #1a1a1a;
        width: 90%;
        max-width: 600px;
        height: 70vh;
        border-radius: 20px;
        display: flex;
        flex-direction: column;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        animation: slideUp 0.3s ease;
    }
    
    .chat-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 25px;
        border-bottom: 1px solid #333;
    }
    
    .chat-modal-header h3 {
        margin: 0;
        color: white;
        font-size: 1.3rem;
    }
    
    .chat-close {
        background: none;
        border: none;
        color: #999;
        font-size: 2rem;
        cursor: pointer;
        transition: color 0.3s ease;
    }
    
    .chat-close:hover {
        color: white;
    }
    
    .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 15px;
    }
    
    .chat-message {
        display: flex;
        gap: 10px;
        max-width: 70%;
    }
    
    .own-message {
        align-self: flex-end;
        flex-direction: row-reverse;
    }
    
    .other-message {
        align-self: flex-start;
    }
    
    .message-avatar img {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
    }
    
    .message-content {
        background: #2a2a2a;
        padding: 10px 15px;
        border-radius: 15px;
    }
    
    .own-message .message-content {
        background: #0040F1;
    }
    
    .message-author {
        font-size: 0.8rem;
        color: #999;
        margin-bottom: 5px;
    }
    
    .own-message .message-author {
        color: rgba(255, 255, 255, 0.7);
    }
    
    .message-text {
        color: white;
        line-height: 1.4;
        word-wrap: break-word;
    }
    
    .message-time {
        font-size: 0.7rem;
        color: #666;
        margin-top: 5px;
    }
    
    .own-message .message-time {
        color: rgba(255, 255, 255, 0.5);
    }
    
    .empty-chat {
        text-align: center;
        color: #666;
        padding: 40px 20px;
    }
    
    .chat-input-container {
        padding: 20px;
        border-top: 1px solid #333;
        display: flex;
        gap: 10px;
    }
    
    #chat-input {
        flex: 1;
        background: #2a2a2a;
        border: 1px solid #444;
        border-radius: 10px;
        padding: 10px 15px;
        color: white;
        font-family: inherit;
        font-size: 0.95rem;
        resize: none;
    }
    
    #chat-input:focus {
        outline: none;
        border-color: #0040F1;
    }
    
    .btn-send {
        background: #0040F1;
        border: none;
        border-radius: 10px;
        padding: 10px 20px;
        color: white;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .btn-send:hover {
        background: #0050FF;
        transform: translateY(-2px);
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes slideUp {
        from { 
            opacity: 0;
            transform: translateY(50px);
        }
        to { 
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(chatStyles);
