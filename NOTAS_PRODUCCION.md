# Notas para Despliegue en Producción

## ⚠️ IMPORTANTE: Configuraciones de Desarrollo

Este proyecto incluye algunas configuraciones adaptadas para facilitar el desarrollo y pruebas. **DEBES CAMBIARLAS antes del despliegue en producción**.

---

## 1. Verificación de Email

### Estado Actual (Desarrollo)
- **Verificación deshabilitada**: Los usuarios pueden hacer login sin verificar su email
- `database/schema.sql`: `verified BOOLEAN DEFAULT TRUE`
- `app/controllers/AuthController.php`: Verificación comentada (líneas 73-77)

### Para Producción
1. **Configura un servicio de email** (SendGrid, Mailgun, AWS SES, etc.)

2. **Activa la verificación en `AuthController.php`**:
```php
// Descomentar estas líneas (actualmente líneas 73-77):
if (!$user['verified']) {
    Response::error('Debes verificar tu email primero', 403);
}
```

3. **Cambia el default en el schema**:
```sql
verified BOOLEAN DEFAULT FALSE,  -- Cambiar a FALSE en producción
```

4. **Implementa el envío de emails**:
```php
// En AuthController::register() (línea 41-42)
// Actualmente es un TODO:
$this->sendVerificationEmail($data['email'], $result['verification_token']);
```

5. **Crea el método de envío**:
```php
private function sendVerificationEmail($email, $token) {
    $verifyLink = $_ENV['APP_URL'] . '/api/auth/verify/' . $token;
    
    // Usar tu servicio de email configurado
    // Ejemplo con SendGrid, Mailgun, etc.
    $subject = 'Verifica tu cuenta en UniBeep';
    $body = "Haz clic aquí para verificar: $verifyLink";
    
    // MailService::send($email, $subject, $body);
}
```

---

## 2. Seguridad JWT

### Estado Actual
- JWT guardado en **cookies HTTP-only** ✅ (Correcto)
- Datos de usuario en localStorage (solo para UI, no contiene token)

### Para Producción
- **Genera un JWT_SECRET único y aleatorio**:
```bash
php -r "echo bin2hex(random_bytes(64));"
```

- **Añade en Azure Application Settings**:
```
JWT_SECRET=tu_secreto_aleatorio_muy_largo_de_128_caracteres
```

- **NUNCA uses el valor de ejemplo del .env.example en producción**

---

## 3. CORS y Seguridad

### Actual (Desarrollo)
```php
// public/api.php permite todos los orígenes:
header('Access-Control-Allow-Origin: *');
```

### Para Producción
```php
// Cambiar a tu dominio específico:
header('Access-Control-Allow-Origin: https://tu-dominio.azurewebsites.net');
header('Access-Control-Allow-Credentials: true');
```

---

## 4. Modo Debug

### Actual
```php
// config/app.php
'debug' => $_ENV['APP_DEBUG'] ?? true,
```

### Para Producción
En Azure Application Settings:
```
APP_DEBUG=false
APP_ENV=production
```

---

## 5. Rate Limiting

### Actual
- 100 peticiones cada 15 minutos por IP
- Configurado en `app/helpers/Security.php`

### Para Producción
- **Revisa y ajusta según tu tráfico esperado**
- Considera usar Redis para rate limiting distribuido si usas múltiples instancias

---

## 6. Base de Datos

### MySQL Firewall
1. En Azure Portal > MySQL > Connection security
2. **Permite solo IPs de:**
   - Tu Azure App Service
   - Tu IP de desarrollo (temporal)
3. **Deshabilita** "Allow access to Azure services" después de configurar

### Backups
1. Habilita backups automáticos en Azure MySQL
2. Configura retención de al menos 7 días
3. Prueba la restauración antes de lanzar

---

## 7. Logging

### Producción
- Usa Azure Application Insights
- Configura alertas para:
  - Errores 500
  - Intentos de login fallidos masivos
  - Excepciones no capturadas

---

## 8. SSL/HTTPS

### Azure
- Azure App Service incluye SSL gratuito
- Verifica que esté habilitado
- Fuerza HTTPS en `.htaccess`:

```apache
# Añadir al inicio de public/.htaccess
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

---

## 9. Variables de Entorno COMPLETAS

Asegúrate de tener TODAS estas en Azure Application Settings:

```
# Base de Datos
DB_HOST=tu-servidor.mysql.database.azure.com
DB_PORT=3306
DB_NAME=unibeep_db
DB_USER=tu_usuario@tu-servidor
DB_PASS=contraseña_muy_segura_aquí

# JWT
JWT_SECRET=secreto_aleatorio_64_caracteres_mínimo

# App
APP_ENV=production
APP_DEBUG=false
APP_URL=https://tu-dominio.azurewebsites.net

# Email (cuando lo configures)
MAIL_DRIVER=smtp
MAIL_HOST=smtp.tuservicio.com
MAIL_PORT=587
MAIL_USERNAME=tu-email
MAIL_PASSWORD=tu-password
MAIL_FROM_ADDRESS=noreply@tudominio.com
MAIL_FROM_NAME=UniBeep

# Opcional: Stripe para pagos
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

---

## 10. Checklist Pre-Lanzamiento

- [ ] JWT_SECRET generado aleatoriamente
- [ ] APP_DEBUG=false
- [ ] APP_ENV=production
- [ ] Verificación de email activada
- [ ] CORS configurado para dominio específico
- [ ] MySQL Firewall configurado
- [ ] Backups automáticos activados
- [ ] SSL/HTTPS funcionando
- [ ] Todas las variables de entorno configuradas
- [ ] Logs y monitoring configurados
- [ ] .env NO subido a Git
- [ ] Pruebas de registro/login funcionando
- [ ] Pruebas de publicar/unirse a viajes
- [ ] Chat funcionando correctamente

---

## 🔐 Seguridad Adicional Recomendada

1. **Implementa 2FA (Two-Factor Authentication)**
2. **Añade Captcha en registro/login** (Google reCAPTCHA v3)
3. **Configura WAF** (Web Application Firewall) en Azure
4. **Monitorea intentos de login sospechosos**
5. **Implementa password reset seguro**
6. **Añade audit logs para acciones críticas**

---

¡Todo listo para producción después de aplicar estos cambios! 🚀
