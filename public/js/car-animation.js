/**
 * Animación 3D del Coche con Three.js
 * Se mueve al hacer scroll
 */

class CarAnimation {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.car = null;
        this.isLoaded = false;
    }
    
    async init() {
        // Verificar que Three.js está cargado
        if (typeof THREE === 'undefined') {
            console.error('Three.js no está cargado');
            return;
        }
        
        const container = document.getElementById('car-3d-container');
        if (!container) {
            console.error('Container no encontrado');
            return;
        }
        
        // Crear escena
        this.scene = new THREE.Scene();
        this.scene.background = null; // Fondo transparente
        
        // Crear cámara
        this.camera = new THREE.PerspectiveCamera(
            75,
            container.offsetWidth / container.offsetHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 2, 5);
        this.camera.lookAt(0, 0, 0);
        
        // Crear renderer
        this.renderer = new THREE.WebGLRenderer({ 
            alpha: true, 
            antialias: true 
        });
        this.renderer.setSize(container.offsetWidth, container.offsetHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(this.renderer.domElement);
        
        // Luces
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 5);
        this.scene.add(directionalLight);
        
        const pointLight = new THREE.PointLight(0x0040F1, 1, 100);
        pointLight.position.set(0, 5, 0);
        this.scene.add(pointLight);
        
        // Crear coche simple (sin modelo externo)
        this.createSimpleCar();
        
        // Scroll animation con GSAP
        this.setupScrollAnimation();
        
        // Resize handler
        window.addEventListener('resize', () => this.onResize());
        
        // Animación loop
        this.animate();
        
        this.isLoaded = true;
    }
    
    createSimpleCar() {
        const carGroup = new THREE.Group();
        
        // Carrocería
        const bodyGeometry = new THREE.BoxGeometry(2, 0.8, 4);
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x0040F1,
            metalness: 0.8,
            shininess: 100
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.4;
        carGroup.add(body);
        
        // Cabina
        const cabinGeometry = new THREE.BoxGeometry(1.6, 0.6, 2);
        const cabinMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x008CFF,
            metalness: 0.6
        });
        const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
        cabin.position.y = 1;
        cabin.position.z = -0.3;
        carGroup.add(cabin);
        
        // Ruedas
        const wheelGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.3, 16);
        const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
        
        const positions = [
            [-0.8, 0.3, 1.2],  // Delantera izquierda
            [0.8, 0.3, 1.2],   // Delantera derecha
            [-0.8, 0.3, -1.2], // Trasera izquierda
            [0.8, 0.3, -1.2]   // Trasera derecha
        ];
        
        positions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(...pos);
            carGroup.add(wheel);
        });
        
        // Faros
        const lightGeometry = new THREE.SphereGeometry(0.15, 16, 16);
        const lightMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFFFFFF,
            emissive: 0xFFFFFF
        });
        
        const leftLight = new THREE.Mesh(lightGeometry, lightMaterial);
        leftLight.position.set(-0.6, 0.5, 2);
        carGroup.add(leftLight);
        
        const rightLight = new THREE.Mesh(lightGeometry, lightMaterial);
        rightLight.position.set(0.6, 0.5, 2);
        carGroup.add(rightLight);
        
        // Añadir glow effect
        const glowGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x0040F1,
            transparent: true,
            opacity: 0.3
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.scale.set(2, 2, 2);
        carGroup.add(glow);
        
        this.car = carGroup;
        this.scene.add(this.car);
    }
    
    setupScrollAnimation() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            console.warn('GSAP o ScrollTrigger no disponibles');
            return;
        }
        
        gsap.registerPlugin(ScrollTrigger);
        
        // Animación de rotación y movimiento
        gsap.to(this.car.rotation, {
            y: Math.PI * 2,
            scrollTrigger: {
                trigger: '#services',
                start: 'top center',
                end: 'bottom top',
                scrub: 1
            }
        });
        
        // Movimiento lateral
        gsap.to(this.car.position, {
            x: 3,
            scrollTrigger: {
                trigger: '#about',
                start: 'top center',
                end: 'bottom center',
                scrub: 2
            }
        });
        
        gsap.to(this.car.position, {
            x: -3,
            scrollTrigger: {
                trigger: '#services',
                start: 'top center',
                end: 'bottom center',
                scrub: 2
            }
        });
        
        // Bounce suave
        gsap.to(this.car.position, {
            y: '+=0.5',
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: 'power1.inOut'
        });
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.car) {
            // Rotación constante suave
            this.car.rotation.y += 0.002;
        }
        
        this.renderer.render(this.scene, this.camera);
    }
    
    onResize() {
        const container = document.getElementById('car-3d-container');
        if (!container) return;
        
        this.camera.aspect = container.offsetWidth / container.offsetHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.offsetWidth, container.offsetHeight);
    }
}

// Inicializar cuando cargue Three.js
let carAnimation = null;

function initCarAnimation() {
    if (typeof THREE !== 'undefined') {
        carAnimation = new CarAnimation();
        carAnimation.init();
    } else {
        console.log('Esperando Three.js...');
        setTimeout(initCarAnimation, 500);
    }
}

// Auto-inicializar si el DOM está listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCarAnimation);
} else {
    initCarAnimation();
}

window.CarAnimation = CarAnimation;
