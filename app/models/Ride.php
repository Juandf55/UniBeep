<?php
/**
 * Modelo Ride - Gestión de viajes
 */

class Ride {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    /**
     * Crear nuevo viaje
     */
    public function create($userId, $data) {
        // Validar límite de viajes por usuario
        $count = $this->db->fetchOne(
            "SELECT COUNT(*) as total FROM rides WHERE driver_id = :id AND status = 'active'",
            ['id' => $userId]
        );
        
        $config = require __DIR__ . '/../../config/app.php';
        if ($count['total'] >= $config['max_rides_per_user']) {
            throw new Exception("Has alcanzado el límite de viajes activos");
        }
        
        return $this->db->insert('rides', [
            'driver_id' => $userId,
            'origin_lat' => $data['origin_lat'] ?? null,
            'origin_lng' => $data['origin_lng'] ?? null,
            'origin_text' => $data['origin_text'],
            'dest_lat' => $data['dest_lat'] ?? null,
            'dest_lng' => $data['dest_lng'] ?? null,
            'dest_text' => $data['dest_text'],
            'schedule_time' => $data['schedule_time'],
            'days_bitmask' => $data['days_bitmask'] ?? 0,
            'seats_available' => $data['seats_available'] ?? 1,
            'description' => $data['description'] ?? null
        ]);
    }
    
    /**
     * Buscar viajes con filtros
     */
    public function search($filters = []) {
        $where = ["status = 'active'"];
        $params = [];
        
        if (isset($filters['origin'])) {
            $where[] = "origin_text LIKE :origin";
            $params['origin'] = "%{$filters['origin']}%";
        }
        
        if (isset($filters['destination'])) {
            $where[] = "dest_text LIKE :destination";
            $params['destination'] = "%{$filters['destination']}%";
        }
        
        if (isset($filters['time'])) {
            $where[] = "schedule_time >= :time";
            $params['time'] = $filters['time'];
        }
        
        if (isset($filters['day'])) {
            $dayBit = pow(2, intval($filters['day']));
            $where[] = "(days_bitmask & :day) > 0";
            $params['day'] = $dayBit;
        }
        
        $whereClause = implode(' AND ', $where);
        
        return $this->db->fetchAll(
            "SELECT r.*, u.name as driver_name, u.avatar_url as driver_avatar, u.is_premium,
                    (SELECT COUNT(*) FROM ride_passengers WHERE ride_id = r.id AND status = 'accepted') as passengers_count
             FROM rides r
             JOIN users u ON r.driver_id = u.id
             WHERE {$whereClause}
             ORDER BY r.created_at DESC
             LIMIT 50",
            $params
        );
    }
    
    /**
     * Obtener viajes de un usuario
     */
    public function getUserRides($userId) {
        return $this->db->fetchAll(
            "SELECT r.*, 
                    (SELECT COUNT(*) FROM ride_passengers WHERE ride_id = r.id AND status = 'accepted') as passengers_count
             FROM rides r
             WHERE r.driver_id = :id
             ORDER BY r.created_at DESC",
            ['id' => $userId]
        );
    }
    
    /**
     * Obtener detalles del viaje
     */
    public function getById($id) {
        return $this->db->fetchOne(
            "SELECT r.*, u.name as driver_name, u.avatar_url as driver_avatar, u.instagram, u.phone, u.is_premium
             FROM rides r
             JOIN users u ON r.driver_id = u.id
             WHERE r.id = :id",
            ['id' => $id]
        );
    }
    
    /**
     * Unirse a un viaje
     */
    public function joinRide($rideId, $userId) {
        // Verificar disponibilidad
        $ride = $this->getById($rideId);
        if (!$ride) {
            throw new Exception("Viaje no encontrado");
        }
        
        $passengersCount = $this->db->fetchOne(
            "SELECT COUNT(*) as total FROM ride_passengers WHERE ride_id = :id AND status = 'accepted'",
            ['id' => $rideId]
        );
        
        if ($passengersCount['total'] >= $ride['seats_available']) {
            throw new Exception("No hay plazas disponibles");
        }
        
        // Insertar solicitud
        return $this->db->insert('ride_passengers', [
            'ride_id' => $rideId,
            'user_id' => $userId,
            'status' => 'pending'
        ]);
    }
    
    /**
     * Actualizar estado del viaje
     */
    public function updateStatus($rideId, $userId, $status) {
        // Verificar que el usuario es el conductor
        $ride = $this->db->fetchOne(
            "SELECT driver_id FROM rides WHERE id = :id",
            ['id' => $rideId]
        );
        
        if (!$ride || $ride['driver_id'] != $userId) {
            throw new Exception("No autorizado");
        }
        
        $this->db->update('rides', ['status' => $status], 'id = :id', ['id' => $rideId]);
        return true;
    }
}
