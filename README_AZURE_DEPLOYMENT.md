# UniBeep - Guía de Despliegue en Azure

## Estructura del Proyecto

```
unibeep/
├── app/
│   ├── controllers/      # Controladores MVC
│   ├── models/          # Modelos de datos
│   ├── middlewares/     # Middlewares de autenticación
│   ├── helpers/         # Clases auxiliares (Database, JWT, Security)
│   └── Router.php       # Sistema de rutas
├── config/
│   ├── app.php         # Configuración general
│   └── database.php    # Configuración de base de datos
├── database/
│   └── schema.sql      # Schema de la base de datos
├── public/             # Carpeta pública (DocumentRoot)
│   ├── index.html      # Página principal
│   ├── api.php         # Punto de entrada API
│   ├── .htaccess       # Configuración Apache
│   ├── css/           # Estilos
│   ├── js/            # JavaScript
│   └── assets/        # Recursos (imágenes, modelos 3D)
└── storage/
    ├── logs/          # Logs de la aplicación
    └── uploads/       # Archivos subidos
```

## Requisitos del Servidor Azure

1. **Azure App Service** con soporte PHP 7.4+
2. **Azure Database for MySQL** 5.7+
3. **Extensiones PHP necesarias**:
   - PDO
   - PDO_MySQL
   - mbstring
   - openssl
   - json

## Pasos de Despliegue

### 1. Configurar Base de Datos

Conéctate a tu Azure MySQL y ejecuta:

```bash
mysql -h tu-servidor.mysql.database.azure.com -u tu_usuario@tu-servidor -p < database/schema.sql
```

### 2. Configurar Variables de Entorno

Copia `.env.example` a `.env` y configura:

```bash
cp .env.example .env
# Editar .env con tus credenciales de Azure
```

O configura las variables en Azure App Service:
- Ve a Configuration > Application Settings
- Añade cada variable del archivo .env.example

### 3. Configurar DocumentRoot

En Azure App Service, configura el DocumentRoot:
- Path: `/site/wwwroot/public`
- En Configuration > Path mappings

### 4. Subir Archivos

Opción A - FTP/FTPS:
```bash
# Usa FileZilla o WinSCP para subir todos los archivos
# Servidor: ftp://tu-app.azurewebsites.net
```

Opción B - Git Deploy:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add azure https://tu-usuario@tu-app.scm.azurewebsites.net/tu-app.git
git push azure master
```

Opción C - Azure CLI:
```bash
az webapp deploy --resource-group tu-grupo --name tu-app --src-path . --type zip
```

### 5. Configurar Permisos

```bash
chmod -R 755 app config database
chmod -R 775 storage
chmod 644 public/.htaccess
```

### 6. Verificar Instalación

1. Visita: `https://tu-app.azurewebsites.net`
2. Prueba la API: `https://tu-app.azurewebsites.net/api/rides/search`

## Seguridad en Producción

1. **Cambiar JWT Secret**: Genera uno nuevo aleatorio de 64+ caracteres
2. **Configurar CORS**: En `public/api.php` y `.htaccess`, cambiar `*` por tu dominio
3. **HTTPS**: Azure App Service incluye certificado SSL automático
4. **Firewall MySQL**: Permitir solo IPs de Azure App Service

## Monitoreo y Logs

Los logs se guardan en:
- `storage/logs/` (logs de aplicación)
- Azure App Service > Monitoring > Log stream (logs del servidor)

## Solución de Problemas Comunes

### Error de conexión a base de datos
- Verifica que las IPs de Azure App Service estén permitidas en MySQL Firewall
- Comprueba las credenciales en Application Settings

### Error 500
- Revisa los logs en Azure Portal
- Activa `APP_DEBUG=true` temporalmente

### Rutas no funcionan
- Verifica que `.htaccess` esté en `/public`
- Asegúrate que `mod_rewrite` esté habilitado

## Contacto

Para soporte técnico: soporte@unibeep.com
