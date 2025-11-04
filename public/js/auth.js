/**
 * Authentication Manager
 * Gestión de autenticación en el frontend
 */

const Auth = {
    /**
     * Inicializar auth en la página
     */
    init() {
        this.updateUI();
        this.attachEventListeners();
    },
    
    /**
     * Actualizar UI según estado de autenticación
     */
    updateUI() {
        const isAuthenticated = API.auth.isAuthenticated();
        const user = API.auth.getUser();
        
        // Elementos del navbar
        const loginBtn = document.querySelector('.login-btn');
        const signupBtn = document.querySelector('.signup-btn');
        const userMenu = document.querySelector('.user-menu');
        
        if (isAuthenticated && user) {
            // Usuario autenticado
            if (loginBtn) loginBtn.style.display = 'none';
            if (signupBtn) signupBtn.style.display = 'none';
            
            // Mostrar menú de usuario
            if (userMenu) {
                userMenu.style.display = 'flex';
                userMenu.innerHTML = `
                    <div class="user-info">
                        <img src="${user.avatar_url || '/images/default-avatar.png'}" alt="${user.name}" class="user-avatar">
                        <span class="user-name">${user.name}</span>
                        ${user.is_premium ? '<span class="premium-badge">⭐</span>' : ''}
                    </div>
                    <div class="user-dropdown">
                        <a href="#dashboard">Mi Panel</a>
                        <a href="#mis-viajes">Mis Viajes</a>
                        <a href="#mensajes">Mensajes</a>
                        <a href="#perfil">Perfil</a>
                        <a href="#" id="logout-btn">Cerrar Sesión</a>
                    </div>
                `;
                
                // Event listener para logout
                document.getElementById('logout-btn')?.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.logout();
                });
            }
        } else {
            // Usuario no autenticado
            if (loginBtn) loginBtn.style.display = 'block';
            if (signupBtn) signupBtn.style.display = 'block';
            if (userMenu) userMenu.style.display = 'none';
        }
    },
    
    /**
     * Registrar usuario
     */
    async register(formData) {
        try {
            const response = await API.auth.register(formData);
            
            if (response.success) {
                this.showMessage('¡Registro exitoso! Revisa tu email para verificar tu cuenta.', 'success');
                // Redirigir a login después de 2 segundos
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 2000);
            }
        } catch (error) {
            this.showMessage(error.message || 'Error al registrarse', 'error');
        }
    },
    
    /**
     * Login de usuario
     */
    async login(email, password) {
        try {
            const response = await API.auth.login(email, password);
            
            if (response.success) {
                this.showMessage('¡Bienvenido! Redirigiendo...', 'success');
                this.updateUI();
                
                // Redirigir al dashboard después de 1 segundo
                setTimeout(() => {
                    window.location.href = '/#dashboard';
                }, 1000);
            }
        } catch (error) {
            this.showMessage(error.message || 'Credenciales inválidas', 'error');
        }
    },
    
    /**
     * Logout
     */
    async logout() {
        try {
            await API.auth.logout();
            this.showMessage('Sesión cerrada', 'success');
            this.updateUI();
            
            // Redirigir a home
            setTimeout(() => {
                window.location.href = '/';
            }, 500);
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    },
    
    /**
     * Mostrar mensaje al usuario
     */
    showMessage(message, type = 'info') {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 15px 25px;
            background: ${type === 'success' ? '#0040F1' : type === 'error' ? '#e74c3c' : '#333'};
            color: white;
            border-radius: 10px;
            box-shadow: 0 8px 16px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Remover después de 3 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },
    
    /**
     * Adjuntar event listeners
     */
    attachEventListeners() {
        // Formulario de login
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = e.target.email.value;
                const password = e.target.password.value;
                await this.login(email, password);
            });
        }
        
        // Formulario de registro
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = {
                    name: e.target.name.value,
                    email: e.target.email.value,
                    password: e.target.password.value,
                    phone: e.target.phone?.value
                };
                await this.register(formData);
            });
        }
    },
    
    /**
     * Verificar autenticación (para rutas protegidas)
     */
    requireAuth() {
        if (!API.auth.isAuthenticated()) {
            this.showMessage('Debes iniciar sesión', 'error');
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 1500);
            return false;
        }
        return true;
    }
};

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Auth.init());
} else {
    Auth.init();
}

// Exportar
window.Auth = Auth;

// Animaciones CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    .user-menu {
        position: relative;
    }
    
    .user-info {
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        padding: 8px 15px;
        border-radius: 25px;
        background: rgba(255,255,255,0.1);
        transition: all 0.3s ease;
    }
    
    .user-info:hover {
        background: rgba(255,255,255,0.2);
    }
    
    .user-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        object-fit: cover;
    }
    
    .user-name {
        color: white;
        font-weight: 600;
        font-size: 0.9rem;
    }
    
    .premium-badge {
        font-size: 0.9rem;
    }
    
    .user-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        margin-top: 10px;
        background: rgba(26, 26, 26, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 15px;
        padding: 10px 0;
        min-width: 200px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
    }
    
    .user-menu:hover .user-dropdown {
        opacity: 1;
        visibility: visible;
    }
    
    .user-dropdown a {
        display: block;
        padding: 12px 20px;
        color: #e0e0e0;
        text-decoration: none;
        transition: all 0.3s ease;
    }
    
    .user-dropdown a:hover {
        background: rgba(255,255,255,0.1);
        color: white;
    }
`;
document.head.appendChild(style);
