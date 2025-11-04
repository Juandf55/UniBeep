<?php
/**
 * Router - Sistema de rutas
 */

class Router {
    private $routes = [];
    
    /**
     * Registrar ruta GET
     */
    public function get($path, $callback) {
        $this->routes['GET'][$path] = $callback;
    }
    
    /**
     * Registrar ruta POST
     */
    public function post($path, $callback) {
        $this->routes['POST'][$path] = $callback;
    }
    
    /**
     * Registrar ruta PUT
     */
    public function put($path, $callback) {
        $this->routes['PUT'][$path] = $callback;
    }
    
    /**
     * Registrar ruta DELETE
     */
    public function delete($path, $callback) {
        $this->routes['DELETE'][$path] = $callback;
    }
    
    /**
     * Ejecutar router
     */
    public function run() {
        $method = $_SERVER['REQUEST_METHOD'];
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        
        // Normalizar path
        $path = rtrim($path, '/');
        if (empty($path)) $path = '/';
        
        // Buscar ruta exacta
        if (isset($this->routes[$method][$path])) {
            return $this->executeCallback($this->routes[$method][$path], []);
        }
        
        // Buscar ruta con parámetros
        foreach ($this->routes[$method] ?? [] as $route => $callback) {
            $pattern = $this->convertToPattern($route);
            
            if (preg_match($pattern, $path, $matches)) {
                array_shift($matches); // Remover match completo
                return $this->executeCallback($callback, $matches);
            }
        }
        
        // Ruta no encontrada
        Response::notFound('Ruta no encontrada');
    }
    
    /**
     * Convertir ruta a patrón regex
     */
    private function convertToPattern($route) {
        $pattern = preg_replace('/\{([a-zA-Z0-9_]+)\}/', '([^/]+)', $route);
        return '#^' . $pattern . '$#';
    }
    
    /**
     * Ejecutar callback
     */
    private function executeCallback($callback, $params) {
        if (is_callable($callback)) {
            return call_user_func_array($callback, $params);
        }
        
        if (is_string($callback)) {
            list($controller, $method) = explode('@', $callback);
            
            if (!class_exists($controller)) {
                Response::error('Controller not found', 500);
            }
            
            $controllerInstance = new $controller();
            
            if (!method_exists($controllerInstance, $method)) {
                Response::error('Method not found', 500);
            }
            
            return call_user_func_array([$controllerInstance, $method], $params);
        }
    }
}
