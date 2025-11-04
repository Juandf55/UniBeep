<?php
/**
 * RideController - Gestión de viajes
 */

class RideController {
    private $rideModel;
    
    public function __construct() {
        $this->rideModel = new Ride();
    }
    
    /**
     * Crear viaje
     * POST /api/rides
     */
    public function create($userId) {
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validaciones
        if (empty($data['origin_text']) || empty($data['dest_text']) || empty($data['schedule_time'])) {
            Response::error('Origen, destino y horario son requeridos', 400);
        }
        
        try {
            $rideId = $this->rideModel->create($userId, $data);
            Response::success(['ride_id' => $rideId], 'Viaje creado correctamente', 201);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }
    
    /**
     * Buscar viajes
     * GET /api/rides/search
     */
    public function search() {
        $filters = [
            'origin' => $_GET['origin'] ?? null,
            'destination' => $_GET['destination'] ?? null,
            'time' => $_GET['time'] ?? null,
            'day' => $_GET['day'] ?? null
        ];
        
        $filters = array_filter($filters, function($value) {
            return $value !== null;
        });
        
        $rides = $this->rideModel->search($filters);
        Response::success($rides);
    }
    
    /**
     * Obtener mis viajes
     * GET /api/rides/my-rides
     */
    public function myRides($userId) {
        $rides = $this->rideModel->getUserRides($userId);
        Response::success($rides);
    }
    
    /**
     * Obtener detalles de un viaje
     * GET /api/rides/{id}
     */
    public function show($id) {
        $ride = $this->rideModel->getById($id);
        
        if (!$ride) {
            Response::notFound('Viaje no encontrado');
        }
        
        Response::success($ride);
    }
    
    /**
     * Unirse a un viaje
     * POST /api/rides/{id}/join
     */
    public function join($rideId, $userId) {
        try {
            $requestId = $this->rideModel->joinRide($rideId, $userId);
            Response::success(['request_id' => $requestId], 'Solicitud enviada correctamente', 201);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }
    
    /**
     * Actualizar estado del viaje
     * PUT /api/rides/{id}/status
     */
    public function updateStatus($rideId, $userId) {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (empty($data['status'])) {
            Response::error('Estado requerido', 400);
        }
        
        try {
            $this->rideModel->updateStatus($rideId, $userId, $data['status']);
            Response::success([], 'Estado actualizado correctamente');
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }
}
