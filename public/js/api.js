/**
 * API Service Layer
 * Gestión centralizada de peticiones a la API
 */

const API = {
    baseURL: '/api',
    
    /**
     * Realizar petición HTTP
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const config = {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            credentials: 'include' // Incluir cookies
        };
        
        if (options.body) {
            config.body = JSON.stringify(options.body);
        }
        
        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Error en la petición');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    
    // ========== AUTH ==========
    auth: {
        async register(userData) {
            return API.request('/auth/register', {
                method: 'POST',
                body: userData
            });
        },
        
        async login(email, password) {
            const response = await API.request('/auth/login', {
                method: 'POST',
                body: { email, password }
            });
            
            // Guardar usuario en localStorage
            if (response.success && response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
                localStorage.setItem('token', response.data.token);
            }
            
            return response;
        },
        
        async logout() {
            const response = await API.request('/auth/logout', {
                method: 'POST'
            });
            
            // Limpiar localStorage
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            
            return response;
        },
        
        async me() {
            return API.request('/auth/me');
        },
        
        isAuthenticated() {
            return !!localStorage.getItem('user');
        },
        
        getUser() {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        }
    },
    
    // ========== RIDES ==========
    rides: {
        async search(filters = {}) {
            const params = new URLSearchParams(filters);
            return API.request(`/rides/search?${params}`);
        },
        
        async getById(id) {
            return API.request(`/rides/${id}`);
        },
        
        async create(rideData) {
            return API.request('/rides', {
                method: 'POST',
                body: rideData
            });
        },
        
        async myRides() {
            return API.request('/rides/my-rides');
        },
        
        async join(rideId) {
            return API.request(`/rides/${rideId}/join`, {
                method: 'POST'
            });
        },
        
        async updateStatus(rideId, status) {
            return API.request(`/rides/${rideId}/status`, {
                method: 'PUT',
                body: { status }
            });
        }
    },
    
    // ========== MESSAGES ==========
    messages: {
        async send(receiverId, content, rideId = null) {
            return API.request('/messages', {
                method: 'POST',
                body: { receiver_id: receiverId, content, ride_id: rideId }
            });
        },
        
        async getChats() {
            return API.request('/messages/chats');
        },
        
        async getConversation(userId) {
            return API.request(`/messages/conversation/${userId}`);
        }
    }
};

// Exportar para uso global
window.API = API;
