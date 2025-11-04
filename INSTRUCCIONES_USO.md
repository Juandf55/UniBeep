# UniBeep / CampusRide - Instrucciones de Uso

## 🎉 Aplicación Completa Lista para Azure

Has recibido una aplicación full-stack completa de ridesharing universitario con:
- ✅ Backend PHP MVC profesional
- ✅ Base de datos MySQL normalizada
- ✅ Frontend interactivo con animaciones
- ✅ Sistema de autenticación JWT
- ✅ Chat en tiempo real
- ✅ Panel de búsqueda de viajes
- ✅ Animación 3D del coche con Three.js
- ✅ Sistema Premium
- ✅ Seguridad robusta (SQL injection, CSRF, rate limiting)

---

## 📦 Contenido del Proyecto

### Backend (PHP MVC)
```
app/
├── controllers/     # AuthController, RideController, MessageController
├── models/         # User, Ride, Message  
├── middlewares/    # AuthMiddleware
├── helpers/        # Database, JWT, Security, Response
└── Router.php      # Sistema de rutas

config/
├── app.php         # Configuración general
└── database.php    # Configuración BD

database/
└── schema.sql      # Schema completo MySQL
```

### Frontend
```
public/
├── index.html            # Landing page con panel de viajes integrado
├── login.html           # Login/Registro funcionando con backend
├── api.php              # API REST entry point
├── .htaccess            # Configuración Apache
├── css/
│   └── login.css
└── js/
    ├── api.js           # Capa de servicios API
    ├── auth.js          # Gestión de autenticación
    ├── rides.js         # Búsqueda y gestión de viajes
    ├── chat.js          # Sistema de chat
    ├── dashboard.js     # Dashboard de usuario
    └── car-animation.js # Animación 3D del coche
```

---

## 🚀 Despliegue en Azure

### Paso 1: Configurar Base de Datos Azure MySQL

1. En Azure Portal, crea un **Azure Database for MySQL**
2. Anota las credenciales:
   - Servidor: `tu-servidor.mysql.database.azure.com`
   - Usuario: `tu_usuario@tu-servidor`
   - Contraseña: `tu_contraseña`
   - Base de datos: `unibeep_db`

3. Importa el schema:
```bash
mysql -h tu-servidor.mysql.database.azure.com -u tu_usuario@tu-servidor -p < database/schema.sql
```

### Paso 2: Configurar Variables de Entorno

En Azure App Service > Configuration > Application Settings, añade:

```
DB_HOST=tu-servidor.mysql.database.azure.com
DB_PORT=3306
DB_NAME=unibeep_db
DB_USER=tu_usuario@tu-servidor
DB_PASS=tu_contraseña_segura

JWT_SECRET=GENERA_UN_SECRETO_ALEATORIO_LARGO_64_CARACTERES

APP_ENV=production
APP_DEBUG=false
APP_URL=https://tu-dominio.azurewebsites.net
```

**IMPORTANTE**: Genera un JWT_SECRET aleatorio seguro:
```bash
php -r "echo bin2hex(random_bytes(32));"
```

### Paso 3: Subir Archivos a Azure

**Opción A - Git Deploy (Recomendado)**:
```bash
git init
git add .
git commit -m "Deploy UniBeep"
git remote add azure https://tu-usuario@tu-app.scm.azurewebsites.net/tu-app.git
git push azure master
```

**Opción B - FTP/FTPS**:
- Usa FileZilla o WinSCP
- Servidor: `ftp://tu-app.azurewebsites.net`
- Sube TODOS los archivos del proyecto

**Opción C - Azure CLI**:
```bash
az webapp deploy --resource-group tu-grupo --name tu-app --src-path . --type zip
```

### Paso 4: Configurar DocumentRoot

En Azure App Service:
1. Ve a **Configuration** > **Path mappings**
2. Configura el Virtual Directory:
   - Virtual path: `/`
   - Physical path: `site\wwwroot\public`

### Paso 5: Verificar Instalación

1. Visita: `https://tu-app.azurewebsites.net`
2. Deberías ver el landing page con el coche 3D animándose
3. Prueba la API: `https://tu-app.azurewebsites.net/api/rides/search`

---

## 🧪 Pruebas Locales (Opcional)

Si quieres probar localmente antes de Azure:

1. **Instala PHP 7.4+ y MySQL**

2. **Configura la base de datos**:
```bash
mysql -u root -p
CREATE DATABASE unibeep_db;
exit

mysql -u root -p unibeep_db < database/schema.sql
```

3. **Configura .env**:
```bash
cp .env.example .env
# Edita .env con tus credenciales locales
```

4. **Inicia el servidor PHP**:
```bash
cd public
php -S localhost:8000
```

5. **Accede a**:
- Frontend: http://localhost:8000
- API: http://localhost:8000/api/rides/search

---

## 📱 Funcionalidades Implementadas

### ✅ Autenticación
- Registro con validación de email universitario
- Login con JWT + cookies HTTP-only
- Verificación por email con tokens únicos
- Protección contra ataques (bcrypt, rate limiting, CSRF)

### ✅ Búsqueda de Viajes (Panel Integrado en Index)
- Filtros por origen, destino, horario, día de la semana
- Resultados en tiempo real desde la base de datos
- Cards de viajes con información del conductor
- Botones para unirse o enviar mensaje

### ✅ Sistema de Chat
- Mensajería directa entre usuarios
- Modal de chat animado
- Auto-refresh cada 3 segundos
- Límite diario de 50 mensajes

### ✅ Dashboard de Usuario (Protegido)
- Mis viajes publicados
- Lista de conversaciones
- Estadísticas personales
- Gestión de estado de viajes

### ✅ Sistema Premium
- Suscripción €2.50/mes
- Contacto visible (Instagram, teléfono)
- Anuncios ilimitados vs 7 días para usuarios free
- Badge premium visible

### ✅ Animación 3D del Coche
- Modelo 3D creado con Three.js
- Se mueve al hacer scroll (GSAP ScrollTrigger)
- Rotación automática suave
- Efectos de iluminación y glow

### ✅ Seguridad
- Prepared statements (anti SQL injection)
- CSRF tokens
- Rate limiting (100 req/15min)
- XSS prevention (sanitización)
- Contraseñas hasheadas con bcrypt (cost 12)
- JWT con expiración de 24 horas

---

## 🎯 API Endpoints Disponibles

### Públicos
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Login
- `GET /api/auth/verify/{token}` - Verificar email
- `GET /api/rides/search` - Buscar viajes
- `GET /api/rides/{id}` - Detalles de viaje

### Protegidos (requieren autenticación)
- `GET /api/auth/me` - Perfil del usuario actual
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/rides` - Crear viaje
- `GET /api/rides/my-rides` - Mis viajes
- `POST /api/rides/{id}/join` - Unirse a viaje
- `PUT /api/rides/{id}/status` - Actualizar estado
- `POST /api/messages` - Enviar mensaje
- `GET /api/messages/chats` - Lista de chats
- `GET /api/messages/conversation/{userId}` - Ver conversación

---

## 🔧 Configuración de Seguridad en Producción

1. **CORS**: Edita `public/api.php` y `.htaccess`:
   - Cambia `Access-Control-Allow-Origin: *` por tu dominio específico

2. **JWT Secret**: NUNCA uses el valor por defecto
   - Genera uno aleatorio de 64+ caracteres

3. **Firewall MySQL**: 
   - Permite solo IPs de Azure App Service
   - Deshabilita acceso público directo

4. **SSL**: 
   - Azure App Service incluye certificado SSL gratuito
   - Verifica que HTTPS esté habilitado

5. **.env**: 
   - NUNCA lo subas a Git
   - Usa solo Application Settings en Azure

---

## 📊 Monitoreo y Logs

### Logs de Aplicación
Ubicación: `storage/logs/`

### Logs de Azure
Azure Portal > tu App Service > Monitoring > Log stream

### Activar debugging temporal
```
APP_DEBUG=true
```
⚠️ **Recuerda desactivarlo en producción**

---

## 🐛 Solución de Problemas

### Error: "Can't connect to database"
- Verifica las credenciales en Application Settings
- Comprueba que las IPs de Azure estén permitidas en MySQL Firewall
- Revisa que el servidor MySQL esté activo

### Error 500
- Revisa logs en Azure Portal
- Activa temporalmente `APP_DEBUG=true`
- Verifica permisos de carpetas `storage/`

### Las rutas no funcionan
- Verifica que `.htaccess` esté en `/public`
- Comprueba que `mod_rewrite` esté habilitado en Apache
- DocumentRoot debe apuntar a `/public`

### La animación 3D no aparece
- Verifica que Three.js se haya cargado (consola del navegador)
- Comprueba que el contenedor `#car-3d-container` existe
- Revisa errores de JavaScript en la consola

---

## 📧 Soporte

Para preguntas o problemas:
- Email: soporte@unibeep.com
- Revisa los logs en Azure Portal
- Consulta la documentación en `README_AZURE_DEPLOYMENT.md`

---

## 🎓 Próximos Pasos Sugeridos

1. **Panel de Administración**: Implementar CRUD completo de usuarios/viajes/anuncios
2. **Pasarela de Pago**: Integrar Stripe para suscripciones premium
3. **Notificaciones**: Email/SMS cuando alguien se une a tu viaje
4. **Google Maps**: Integrar mapa interactivo con marcadores
5. **WebSockets**: Chat en tiempo real (actualmente usa polling)
6. **Tests**: Pruebas automatizadas con PHPUnit
7. **CI/CD**: Automatizar despliegue con GitHub Actions

---

¡Tu plataforma UniBeep/CampusRide está lista para despegar! 🚀
