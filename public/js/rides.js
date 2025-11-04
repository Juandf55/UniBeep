/**
 * Rides Manager
 * Gestión de búsqueda y visualización de viajes
 */

const Rides = {
    currentFilters: {},
    
    /**
     * Inicializar
     */
    init() {
        this.loadRides();
        this.attachEventListeners();
    },
    
    /**
     * Cargar viajes
     */
    async loadRides(filters = {}) {
        const ridesContainer = document.getElementById('rides-list');
        if (!ridesContainer) return;
        
        ridesContainer.innerHTML = '<div class="loading-rides">Buscando viajes...</div>';
        
        try {
            const response = await API.rides.search(filters);
            
            if (response.success && response.data.length > 0) {
                ridesContainer.innerHTML = response.data.map(ride => this.renderPublicRideCard(ride)).join('');
            } else {
                ridesContainer.innerHTML = `
                    <div class="empty-state">
                        <p>No se encontraron viajes con estos filtros</p>
                        <p class="empty-hint">Prueba ajustando tu búsqueda</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error cargando viajes:', error);
            ridesContainer.innerHTML = '<div class="error">Error al buscar viajes</div>';
        }
    },
    
    /**
     * Renderizar tarjeta pública de viaje
     */
    renderPublicRideCard(ride) {
        const days = this.getDaysFromBitmask(ride.days_bitmask);
        const canContact = ride.is_premium;
        
        return `
            <div class="public-ride-card ${ride.is_premium ? 'premium-ride' : ''}">
                <div class="ride-driver">
                    <img src="${ride.driver_avatar || '/images/default-avatar.png'}" 
                         alt="${ride.driver_name}" class="driver-avatar">
                    <div class="driver-info">
                        <div class="driver-name">
                            ${ride.driver_name}
                            ${ride.is_premium ? '<span class="premium-mini">⭐</span>' : ''}
                        </div>
                        ${canContact && ride.instagram ? `
                            <a href="https://instagram.com/${ride.instagram}" 
                               target="_blank" class="driver-contact">
                                📸 @${ride.instagram}
                            </a>
                        ` : ''}
                    </div>
                </div>
                
                <div class="ride-route-public">
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
                
                <div class="ride-details-public">
                    <div class="detail">
                        <span class="icon">🕒</span>
                        <span>${ride.schedule_time}</span>
                    </div>
                    <div class="detail">
                        <span class="icon">📅</span>
                        <span>${days}</span>
                    </div>
                    <div class="detail">
                        <span class="icon">💺</span>
                        <span>${ride.seats_available - ride.passengers_count} plazas disponibles</span>
                    </div>
                </div>
                
                ${ride.description ? `
                    <p class="ride-description-public">${ride.description}</p>
                ` : ''}
                
                <div class="ride-actions-public">
                    ${API.auth.isAuthenticated() ? `
                        <button class="btn-join-ride" onclick="Rides.joinRide(${ride.id})">
                            Solicitar Unirme
                        </button>
                        <button class="btn-message" onclick="Chat.startConversation(${ride.driver_id})">
                            💬 Enviar Mensaje
                        </button>
                    ` : `
                        <a href="/login.html" class="btn-login-required">
                            Inicia sesión para unirte
                        </a>
                    `}
                </div>
            </div>
        `;
    },
    
    /**
     * Unirse a un viaje
     */
    async joinRide(rideId) {
        if (!Auth.requireAuth()) return;
        
        try {
            const response = await API.rides.join(rideId);
            
            if (response.success) {
                Auth.showMessage('¡Solicitud enviada! El conductor te contactará pronto.', 'success');
            }
        } catch (error) {
            Auth.showMessage(error.message, 'error');
        }
    },
    
    /**
     * Aplicar filtros de búsqueda
     */
    applyFilters() {
        const origin = document.getElementById('filter-origin')?.value;
        const destination = document.getElementById('filter-destination')?.value;
        const time = document.getElementById('filter-time')?.value;
        const day = document.getElementById('filter-day')?.value;
        
        const filters = {};
        if (origin) filters.origin = origin;
        if (destination) filters.destination = destination;
        if (time) filters.time = time;
        if (day) filters.day = day;
        
        this.currentFilters = filters;
        this.loadRides(filters);
    },
    
    /**
     * Limpiar filtros
     */
    clearFilters() {
        document.querySelectorAll('.filter-input').forEach(input => input.value = '');
        this.currentFilters = {};
        this.loadRides();
    },
    
    /**
     * Convertir bitmask a días
     */
    getDaysFromBitmask(bitmask) {
        const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        const selected = [];
        
        for (let i = 0; i < 7; i++) {
            if (bitmask & (1 << i)) {
                selected.push(days[i]);
            }
        }
        
        return selected.join(', ') || 'Días flexibles';
    },
    
    /**
     * Event listeners
     */
    attachEventListeners() {
        // Botón de búsqueda
        const searchBtn = document.getElementById('search-rides-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.applyFilters());
        }
        
        // Botón limpiar filtros
        const clearBtn = document.getElementById('clear-filters-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearFilters());
        }
        
        // Búsqueda al presionar Enter
        document.querySelectorAll('.filter-input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.applyFilters();
                }
            });
        });
    }
};

// Exportar
window.Rides = Rides;
