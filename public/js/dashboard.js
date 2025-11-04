/**
 * Dashboard de Usuario
 * Panel de control para usuarios autenticados
 */

const Dashboard = {
    async init() {
        if (!Auth.requireAuth()) return;
        
        await this.loadUserData();
        await this.loadRides();
        await this.loadChats();
        this.attachEventListeners();
    },
    
    /**
     * Cargar datos del usuario
     */
    async loadUserData() {
        try {
            const response = await API.auth.me();
            if (response.success) {
                this.renderUserProfile(response.data);
            }
        } catch (error) {
            console.error('Error cargando usuario:', error);
        }
    },
    
    /**
     * Cargar viajes del usuario
     */
    async loadRides() {
        const ridesContainer = document.getElementById('my-rides-list');
        if (!ridesContainer) return;
        
        ridesContainer.innerHTML = '<div class="loading">Cargando viajes...</div>';
        
        try {
            const response = await API.rides.myRides();
            
            if (response.success && response.data.length > 0) {
                ridesContainer.innerHTML = response.data.map(ride => this.renderRideCard(ride)).join('');
            } else {
                ridesContainer.innerHTML = `
                    <div class="empty-state">
                        <p>No has publicado ningún viaje aún</p>
                        <button class="btn btn-primary" onclick="Dashboard.showCreateRideModal()">
                            Publicar Viaje
                        </button>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error cargando viajes:', error);
            ridesContainer.innerHTML = '<div class="error">Error al cargar viajes</div>';
        }
    },
    
    /**
     * Renderizar tarjeta de viaje
     */
    renderRideCard(ride) {
        const days = this.getDaysFromBitmask(ride.days_bitmask);
        const statusColors = {
            'active': '#0040F1',
            'inactive': '#999',
            'cancelled': '#e74c3c',
            'completed': '#27ae60'
        };
        
        return `
            <div class="ride-card" data-ride-id="${ride.id}">
                <div class="ride-header">
                    <span class="ride-status" style="background: ${statusColors[ride.status]}">
                        ${ride.status}
                    </span>
                    <span class="ride-passengers">
                        👥 ${ride.passengers_count}/${ride.seats_available}
                    </span>
                </div>
                <div class="ride-route">
                    <div class="route-point">
                        <span class="icon">📍</span>
                        <span class="text">${ride.origin_text}</span>
                    </div>
                    <div class="route-arrow">→</div>
                    <div class="route-point">
                        <span class="icon">🎯</span>
                        <span class="text">${ride.dest_text}</span>
                    </div>
                </div>
                <div class="ride-details">
                    <div class="detail">
                        <span class="icon">🕒</span>
                        <span>${ride.schedule_time}</span>
                    </div>
                    <div class="detail">
                        <span class="icon">📅</span>
                        <span>${days}</span>
                    </div>
                </div>
                ${ride.description ? `<p class="ride-description">${ride.description}</p>` : ''}
                <div class="ride-actions">
                    <button class="btn-small" onclick="Dashboard.editRide(${ride.id})">Editar</button>
                    <button class="btn-small btn-danger" onclick="Dashboard.cancelRide(${ride.id})">Cancelar</button>
                </div>
            </div>
        `;
    },
    
    /**
     * Convertir bitmask a días de la semana
     */
    getDaysFromBitmask(bitmask) {
        const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
        const selected = [];
        
        for (let i = 0; i < 7; i++) {
            if (bitmask & (1 << i)) {
                selected.push(days[i]);
            }
        }
        
        return selected.join(', ') || 'Sin días específicos';
    },
    
    /**
     * Cargar chats
     */
    async loadChats() {
        const chatsContainer = document.getElementById('chats-list');
        if (!chatsContainer) return;
        
        chatsContainer.innerHTML = '<div class="loading">Cargando conversaciones...</div>';
        
        try {
            const response = await API.messages.getChats();
            
            if (response.success && response.data.length > 0) {
                chatsContainer.innerHTML = response.data.map(chat => this.renderChatItem(chat)).join('');
            } else {
                chatsContainer.innerHTML = `
                    <div class="empty-state">
                        <p>No tienes conversaciones aún</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error cargando chats:', error);
            chatsContainer.innerHTML = '<div class="error">Error al cargar chats</div>';
        }
    },
    
    /**
     * Renderizar item de chat
     */
    renderChatItem(chat) {
        return `
            <div class="chat-item ${chat.unread_count > 0 ? 'unread' : ''}" 
                 onclick="Chat.openConversation(${chat.user_id})">
                <img src="${chat.avatar_url || '/images/default-avatar.png'}" 
                     alt="${chat.name}" class="chat-avatar">
                <div class="chat-info">
                    <div class="chat-name">${chat.name}</div>
                    <div class="chat-last-message">${chat.last_message || 'Sin mensajes'}</div>
                </div>
                ${chat.unread_count > 0 ? `<span class="chat-unread-badge">${chat.unread_count}</span>` : ''}
            </div>
        `;
    },
    
    /**
     * Renderizar perfil de usuario
     */
    renderUserProfile(user) {
        const profileContainer = document.getElementById('user-profile');
        if (!profileContainer) return;
        
        profileContainer.innerHTML = `
            <div class="profile-card">
                <img src="${user.avatar_url || '/images/default-avatar.png'}" 
                     alt="${user.name}" class="profile-avatar">
                <h2>${user.name}</h2>
                <p class="profile-email">${user.email}</p>
                ${user.is_premium ? '<span class="premium-badge-large">⭐ Premium</span>' : ''}
                <div class="profile-stats">
                    <div class="stat">
                        <span class="stat-number" id="rides-count">0</span>
                        <span class="stat-label">Viajes</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number" id="passengers-count">0</span>
                        <span class="stat-label">Pasajeros</span>
                    </div>
                </div>
                ${!user.is_premium ? `
                    <button class="btn btn-premium" onclick="Dashboard.showPremiumModal()">
                        Hazte Premium - €2.50/mes
                    </button>
                ` : ''}
            </div>
        `;
    },
    
    /**
     * Mostrar modal para crear viaje
     */
    showCreateRideModal() {
        // Implementar modal
        Auth.showMessage('Función en desarrollo', 'info');
    },
    
    /**
     * Editar viaje
     */
    editRide(rideId) {
        Auth.showMessage('Función en desarrollo', 'info');
    },
    
    /**
     * Cancelar viaje
     */
    async cancelRide(rideId) {
        if (!confirm('¿Seguro que quieres cancelar este viaje?')) return;
        
        try {
            await API.rides.updateStatus(rideId, 'cancelled');
            Auth.showMessage('Viaje cancelado', 'success');
            await this.loadRides();
        } catch (error) {
            Auth.showMessage(error.message, 'error');
        }
    },
    
    /**
     * Mostrar modal premium
     */
    showPremiumModal() {
        Auth.showMessage('Pasarela de pago en desarrollo', 'info');
    },
    
    /**
     * Event listeners
     */
    attachEventListeners() {
        // Implementar según necesidad
    }
};

// Exportar
window.Dashboard = Dashboard;
