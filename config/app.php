<?php
/**
 * Configuración General de la Aplicación
 */

return [
    'name' => 'UniBeep - CampusRide',
    'env' => getenv('APP_ENV') ?: 'production',
    'debug' => getenv('APP_DEBUG') === 'true' ? true : false,
    'url' => getenv('APP_URL') ?: 'https://tu-dominio-azure.com',
    'timezone' => 'Europe/Madrid',
    
    // JWT Secret Key
    'jwt_secret' => getenv('JWT_SECRET') ?: 'CAMBIAR_EN_PRODUCCION_SECRETO_LARGO_Y_SEGURO',
    'jwt_expiration' => 86400, // 24 horas en segundos
    
    // Seguridad
    'csrf_enabled' => true,
    'rate_limit' => [
        'enabled' => true,
        'max_requests' => 100,
        'per_minutes' => 15
    ],
    
    // Premium
    'premium_price' => 2.50,
    'premium_currency' => 'EUR',
    
    // Límites
    'max_messages_per_day' => 50,
    'max_rides_per_user' => 10,
    'free_ads_duration_days' => 7,
];
