# CampusRide / UniBeep - Plataforma de Conexión Universitaria

## Overview
**UniBeep (CampusRide)** es una plataforma full-stack para que estudiantes universitarios compartan coche entre campus. 

**Estado Actual**: Aplicación completa con backend PHP MVC + MySQL y frontend interactivo
**Objetivo**: Despliegue en servidor Azure (no optimizado para Replit)
**Stack**: PHP puro (MVC), MySQL, HTML5, CSS3, JavaScript ES6, GSAP, Three.js

## Arquitectura del Proyecto

### Backend (PHP MVC)
```
app/
├── controllers/     # AuthController, RideController, MessageController
├── models/         # User, Ride, Message
├── middlewares/    # AuthMiddleware
├── helpers/        # Database, JWT, Security, Response
└── Router.php      # Sistema de rutas
```

### Frontend
```
public/
├── index.html       # Landing page principal
├── api.php         # API REST entry point
├── login.html      # Autenticación
├── panel_usuarios.html  # Panel de viajes
├── css/            # Estilos
├── js/             # JavaScript + Three.js para 3D
└── assets/         # Recursos (car model 3D, imágenes)
```

### Base de Datos (MySQL)
```sql
- universities: Universidades españolas con dominios válidos
- users: Usuarios con verificación universitaria
- rides: Viajes publicados con geolocalización
- ride_passengers: Relación pasajeros-viajes
- messages: Sistema de chat interno
- payments: Suscripciones premium
- ads: Sistema de anuncios
```

## Características Implementadas

### Autenticación y Seguridad
- ✅ Registro con validación de email universitario
- ✅ Login con JWT + cookies HTTP-only
- ✅ Verificación por email
- ✅ Hash de contraseñas con bcrypt (cost 12)
- ✅ Protección contra SQL injection (prepared statements)
- ✅ CSRF tokens
- ✅ Rate limiting (100 req/15min)
- ✅ Middleware de autenticación

### Gestión de Viajes
- ✅ Publicar viajes con origen, destino, horario
- ✅ Búsqueda con filtros (zona, horario, días)
- ✅ Unirse a viajes
- ✅ Límite de viajes activos por usuario (10)
- ✅ Gestión de plazas disponibles
- ✅ Estados: active, inactive, cancelled, completed

### Sistema de Chat
- ✅ Mensajería directa entre usuarios
- ✅ Historial de conversaciones
- ✅ Marcado de leído/no leído
- ✅ Límite diario de mensajes (50)
- ✅ Chat asociado a viajes específicos

### Sistema Premium
- ✅ Suscripción €2.50/mes
- ✅ Contacto visible (Instagram, teléfono)
- ✅ Anuncios ilimitados
- ✅ Anuncios gratuitos limitados a 7 días
- ✅ Verificación de expiración automática

### API REST Endpoints

#### Públicos
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `GET /api/auth/verify/{token}` - Verificar email
- `GET /api/rides/search` - Buscar viajes
- `GET /api/rides/{id}` - Detalles de viaje

#### Protegidos (requieren autenticación)
- `GET /api/auth/me` - Perfil actual
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/rides` - Crear viaje
- `GET /api/rides/my-rides` - Mis viajes
- `POST /api/rides/{id}/join` - Unirse a viaje
- `PUT /api/rides/{id}/status` - Actualizar estado
- `POST /api/messages` - Enviar mensaje
- `GET /api/messages/chats` - Lista de chats
- `GET /api/messages/conversation/{userId}` - Ver conversación

## Frontend (Pendiente de Integración)

### Características a Implementar
- 🔲 Integrar panel_usuarios.html en index.html
- 🔲 Animación 3D coche con Three.js (se mueve al scrollear)
- 🔲 Conectar formularios con API backend
- 🔲 Dashboard de usuario autenticado
- 🔲 Panel de chat en vivo
- 🔲 Panel de administración
- 🔲 Pasarela de pago premium (Stripe)
- 🔲 Sistema de notificaciones

## Configuración para Desarrollo Local

1. **Base de datos**:
```bash
# Importar schema
mysql -u root -p < database/schema.sql
```

2. **Configurar .env**:
```bash
cp .env.example .env
# Editar credenciales
```

3. **Servidor PHP** (temporal para desarrollo):
```bash
cd public
php -S localhost:8000
```

4. **Acceso**:
- Frontend: http://localhost:8000
- API: http://localhost:8000/api/*

## Despliegue en Azure

Ver guía completa en: `README_AZURE_DEPLOYMENT.md`

**Pasos resumidos**:
1. Configurar Azure Database for MySQL
2. Subir archivos a Azure App Service
3. Configurar variables de entorno
4. DocumentRoot apunta a `/public`
5. Verificar certificado SSL automático

## Tecnologías

### Backend
- PHP 7.4+ (puro, sin frameworks)
- Arquitectura MVC custom
- JWT para autenticación
- PDO con prepared statements
- Bcrypt para passwords

### Frontend
- HTML5 semántico
- CSS3 con animaciones (GSAP 3.12.2)
- JavaScript ES6+ vanilla
- Three.js (para modelo 3D del coche)
- Responsive mobile-first

### Base de Datos
- MySQL 5.7+ / Azure MySQL
- Schema normalizado (3NF)
- Indices optimizados
- Relaciones con integridad referencial

### Seguridad
- RGPD compliant
- Validación universitaria por dominio email
- Rate limiting por IP
- CSRF protection
- XSS prevention (sanitización)
- SQL injection prevention (prepared statements)

## Diseño UX/UI

### Principios
- Mobile-first responsive
- Animaciones interactivas (inspirado en dora.ai)
- Scroll-triggered animations
- Electric blue theme (#0040F1, #008CFF)
- Interfaz en español
- Atractivo para público joven

### Componentes Visuales
- Navbar flotante con glass morphism
- Cards con efectos eléctricos y glow
- Botones 3D con sombras realistas
- Login con anillos rotativos animados
- Carousel de perfiles draggable
- **Coche 3D que se mueve al scrollear** (Three.js)

## Próximos Pasos

1. **Frontend**: Integrar panel de usuarios en index
2. **3D**: Implementar modelo de coche animado con scroll
3. **Dashboard**: Crear área de usuario autenticado
4. **Chat UI**: Interfaz de chat en tiempo real
5. **Admin Panel**: Panel de gestión
6. **Pagos**: Integrar Stripe para premium
7. **Testing**: Pruebas de seguridad y carga
8. **Deployment**: Configurar CI/CD a Azure

## Notas Importantes

⚠️ **Este proyecto NO está optimizado para Replit**
- Diseñado específicamente para Azure App Service
- Requiere MySQL (no SQLite)
- Usa .htaccess (Apache)
- DocumentRoot debe ser `/public`

📧 **Email universitario requerido**
- Solo dominios registrados en tabla `universities`
- Validación automática por dominio
- Tokens de verificación únicos

🔒 **Seguridad**
- NUNCA commitear .env con credenciales reales
- JWT_SECRET debe ser aleatorio y largo (64+ chars)
- Cambiar valores por defecto en producción

## Autor

Desarrollado para conexión universitaria española
