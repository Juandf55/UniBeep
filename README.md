PROPUESTA TÉCNICA AMPLIADA: CampusRide – Plataforma de Conexión para Compartir Coche 

 

1. RESUMEN EJECUTIVO 

Objetivo General: 
Desarrollar una plataforma web que permita a los estudiantes conectar entre sí para compartir coche y reducir gastos, mediante una experiencia segura, social y geolocalizada. 

Stack Tecnológico 

Frontend: HTML5, CSS3, JavaScript ES6 

Backend:  PHP  

Base de datos: MySQL 

Mapas: Google Maps API  

Hosting: Servidor compartido con SSL y dominio .es 

Tiempo estimado: 6–8 semanas (gracias a agentes generativos) 
 Presupuesto: Solo dominio y hosting (~€50–100/año) 

 

2. ALCANCE DEL PROYECTO 

Fase 1: MVP (Semanas 1–3) 

Funcionalidades Base: 

Registro/Login con email  

Perfil editable (nombre, carrera, universidad, red social o teléfono opcional) 

Publicar viajes:  horario, días, usuario 

Búsqueda de viajes por ubicación y horario 

Chat interno entre usuarios conectados 

Validación de identidad universitaria 

Estructura de BD 

users(id, name, email, university, phone, instagram, is_premium, created_at) 
rides(id, driver_id, schedule, days, status) 
messages(id, sender_id, receiver_id, ride_id, content, timestamp) 
 

 

Fase 2: Funcionalidades Avanzadas (Semanas 4–6) 

✅ Panel de Búsqueda Geolocalizada 

Filtro por zona de residencia y horario. 

Integración con Google Maps API para mostrar resultados cercanos. 

Cada marcador del mapa muestra datos del usuario (nombre, universidad, redes/WhatsApp si es público). 

✅ Chat Directo 

Mensajería instantánea entre usuarios que coinciden en los filtros. 

Notificaciones visuales en el panel. 

Protección contra spam (máx. 10 chats activos). 

✅ Premium Access 

Solo usuarios premium (€2,50/mes) pueden mostrar contacto personal (Instagram/teléfono) en resultados del panel. 

Los demás solo acceden al chat interno. 

 

Fase 3: Monetización y Anunciantes (Semanas 7–8) 

✅ Panel de Anunciantes 

Empresas locales pueden publicar banners segmentados por universidad o zona. 

Estadísticas de visualización y clics. 

Sistema básico de facturación mensual automatizada. 

 

3. ANÁLISIS DE MERCADO Y COMPETENCIA (Fase de Análisis - SDLC) 

Basado en el modelo de business case de Tilley 

Tilley_SysAnalDes_13e_PPT_Ch02 

Objetivo de negocio: 

Reducir costes de transporte entre estudiantes y fomentar sostenibilidad y comunidad universitaria. 

Análisis de la competencia (Madrid y España): 

BlaBlaCar: generalista, no universitaria. No filtra por campus ni horarios académicos. 

Amovens: orientado a empresas, menos social. 

CompartirCoche.es: sin integración de chat ni mapas. 
 ➡️ CampusRide se diferencia por su enfoque local, académico y social (vinculado a campus). 

Análisis PESTEL resumido: 

Político: impulso al transporte sostenible. 

Económico: aumento de precios de transporte → alta demanda. 

Social: cultura de movilidad compartida entre jóvenes. 

Tecnológico: APIs de Google Maps, IA para matching. 

Ecológico: reducción de emisiones. 

Legal: cumplimiento de RGPD y verificación universitaria. 

 

4. DISEÑO DEL SISTEMA 

Arquitectura Backend (Laravel) 

app/ 
├── Http/ 
│   ├── Controllers/ 
│   │   ├── UserController.php 
│   │   ├── RideController.php 
│   │   ├── MessageController.php 
│   │   └── AdminController.php 
├── Models/ 
│   ├── User.php 
│   ├── Ride.php 
│   └── Message.php 
routes/ 
├── web.php 
├── api.php 
 

Seguridad 

Hash de contraseñas con bcrypt 

Validación por correo  

CSRF tokens y sanitización de inputs 

Límite de mensajes/día 

SSL y encriptación de datos sensibles 

 

5. REQUISITOS FUNCIONALES Y NO FUNCIONALES (Cap. 4 - Tilley) 

Tilley_SysAnalDes_13e_PPT_Ch04 

Funcionales: 

Registro/Login con validación  

Filtro geográfico y horario (vinculado a mapas) para el panel de viajes 

Chat directo entre usuarios filtrados 

Publicación de viajes y gestión de estado 

Sistema de pago y suscripción premium 

Panel de anuncios geolocalizado 

No Funcionales: 

Soporte para +50 usuarios concurrentes 

Respuesta del sistema < 2 segundos 

Interfaz responsive (mobile-first) 

Seguridad RGPD y HTTPS obligatorio 

Disponibilidad mínima 99.5% 

 

6. GESTIÓN DE PROYECTO (Cap. 3 - Tilley) 

Tilley_SysAnalDes_13e_PPT_Ch03 

Metodología: Agile con enfoque RAD (Rapid Application Development) 

Entregas semanales (iteraciones) 

Prototipos validados con usuarios reales 

Control visual con tablero Kanban 

Herramientas: Trello, GitHub, Figma, Notion 

Cronograma estimado: 

Fase 

Actividad 

Duración 

1 

Diseño UX/UI y BD 

1 semana 

2 

Desarrollo MVP 

2 semanas 

3 

Filtros + Mapas + Chat 

2 semanas 

4 

Premium + Ads 

2 semanas 

5 

Pruebas y despliegue 

1 semana 

 

7. BENEFICIOS ESPERADOS 

Plataforma sin intermediarios, de estudiantes para estudiantes. 

Promueve sostenibilidad y ahorro. 

Potencial de monetización real con bajo coste operativo. 

Escalable a universidades de toda España. 

 

Para el css, darle un ejmplo . https://codepen.io/zaidik/pen/RwrKdez 
https://codepen.io/themrsami/pen/YPyWZBE 
 
 
