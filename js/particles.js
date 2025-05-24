// ===== PARTICLE SYSTEM COMPONENT =====

class ParticleSystem {
    constructor() {
        this.container = null;
        this.particles = [];
        this.animationId = null;
        this.isRunning = false;
        this.settings = {
            count: 50,
            speed: 0.5,
            size: { min: 1, max: 4 },
            opacity: { min: 0.1, max: 0.8 },
            colors: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'],
            shapes: ['circle', 'star', 'heart'],
            direction: 'up', // up, down, left, right, random
            interactive: true
        };
        
        this.init();
    }

    init() {
        this.createParticleContainer();
        this.setupEventListeners();
        this.loadSettings();
        this.createParticles();
        Utils.log('Particle System initialized', 'success');
    }

    createParticleContainer() {
        this.container = document.querySelector('.particles-container');
        
        if (!this.container) {
            // Create container if it doesn't exist
            this.container = Utils.createElement('div', {
                className: 'particles-container',
                style: `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 0;
                    overflow: hidden;
                `
            });
            document.body.appendChild(this.container);
        }

        // Ensure proper styling
        this.container.style.pointerEvents = 'none';
        this.container.style.zIndex = '0';
    }

    setupEventListeners() {
        // Window resize handler
        window.addEventListener('resize', Utils.debounce(() => {
            this.handleResize();
        }, 250));

        // Page visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });

        // Mouse interaction
        if (this.settings.interactive && !Utils.isMobile()) {
            this.setupMouseInteraction();
        }

        // Performance monitoring
        this.setupPerformanceMonitoring();
    }

    setupMouseInteraction() {
        let mouseX = 0;
        let mouseY = 0;

        document.addEventListener('mousemove', Utils.throttle((e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Update particle attractions
            this.updateParticleAttraction(mouseX, mouseY);
        }, 16));

        // Click to create burst effect
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.social-btn, .card, .heart-container')) {
                this.createBurst(e.clientX, e.clientY);
            }
        });
    }

    setupPerformanceMonitoring() {
        // Monitor FPS and adjust particle count accordingly
        let frames = 0;
        let lastTime = performance.now();
        
        const monitor = () => {
            frames++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frames * 1000) / (currentTime - lastTime));
                
                // Adjust particle count based on FPS
                if (fps < 30 && this.settings.count > 20) {
                    this.settings.count = Math.max(20, this.settings.count - 5);
                    this.optimizeForPerformance();
                } else if (fps > 50 && this.settings.count < 50) {
                    this.settings.count = Math.min(50, this.settings.count + 2);
                }
                
                frames = 0;
                lastTime = currentTime;
            }
            
            if (this.isRunning) {
                requestAnimationFrame(monitor);
            }
        };
        
        if (this.isRunning) {
            monitor();
        }
    }

    createParticles() {
        // Clear existing particles
        this.particles = [];
        if (this.container) {
            this.container.innerHTML = '';
        }

        // Adjust particle count for mobile
        const particleCount = Utils.isMobile() ? 
            Math.min(this.settings.count, 20) : 
            this.settings.count;

        for (let i = 0; i < particleCount; i++) {
            this.createParticle();
        }
    }

    createParticle() {
        const particle = {
            id: Utils.generateId('particle'),
            x: Utils.random(0, window.innerWidth),
            y: Utils.random(0, window.innerHeight),
            vx: Utils.random(-this.settings.speed, this.settings.speed),
            vy: Utils.random(-this.settings.speed, this.settings.speed),
            size: Utils.random(this.settings.size.min, this.settings.size.max),
            opacity: Utils.random(this.settings.opacity.min, this.settings.opacity.max),
            color: this.settings.colors[Utils.randomInt(0, this.settings.colors.length - 1)],
            shape: this.settings.shapes[Utils.randomInt(0, this.settings.shapes.length - 1)],
            rotation: Utils.random(0, 360),
            rotationSpeed: Utils.random(-2, 2),
            life: 1,
            maxLife: Utils.random(5, 15),
            element: null
        };

        // Set direction based on settings
        this.setParticleDirection(particle);

        // Create DOM element
        particle.element = this.createParticleElement(particle);
        
        if (this.container) {
            this.container.appendChild(particle.element);
        }

        this.particles.push(particle);
        return particle;
    }

    setParticleDirection(particle) {
        switch (this.settings.direction) {
            case 'up':
                particle.vy = -Math.abs(particle.vy) - 0.5;
                break;
            case 'down':
                particle.vy = Math.abs(particle.vy) + 0.5;
                break;
            case 'left':
                particle.vx = -Math.abs(particle.vx) - 0.5;
                break;
            case 'right':
                particle.vx = Math.abs(particle.vx) + 0.5;
                break;
            case 'random':
            default:
                // Keep random velocities
                break;
        }
    }

    createParticleElement(particle) {
        const element = Utils.createElement('div', {
            className: `particle particle-${particle.shape}`,
            style: `
                position: absolute;
                width: ${particle.size}px;
                height: ${particle.size}px;
                background: ${particle.color};
                border-radius: ${particle.shape === 'circle' ? '50%' : '0'};
                opacity: ${particle.opacity};
                transform: translate(${particle.x}px, ${particle.y}px) rotate(${particle.rotation}deg);
                pointer-events: none;
                z-index: 1;
                transition: none;
            `
        });

        // Apply shape-specific styling
        this.applyShapeStyle(element, particle);

        return element;
    }

    applyShapeStyle(element, particle) {
        switch (particle.shape) {
            case 'star':
                element.style.clipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
                element.style.borderRadius = '0';
                break;
            case 'heart':
                element.innerHTML = '❤️';
                element.style.background = 'transparent';
                element.style.fontSize = `${particle.size}px`;
                element.style.lineHeight = '1';
                break;
            case 'circle':
            default:
                element.style.borderRadius = '50%';
                break;
        }
    }

    updateParticles() {
        this.particles.forEach((particle, index) => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Update rotation
            particle.rotation += particle.rotationSpeed;

            // Update life
            particle.life += 0.016; // ~60fps

            // Apply physics
            this.applyPhysics(particle);

            // Check boundaries and reset if needed
            this.checkBoundaries(particle);

            // Update DOM element
            this.updateParticleElement(particle);

            // Remove old particles
            if (particle.life > particle.maxLife) {
                this.removeParticle(index);
            }
        });

        // Maintain particle count
        while (this.particles.length < this.settings.count) {
            this.createParticle();
        }
    }

    applyPhysics(particle) {
        // Gravity (subtle)
        particle.vy += 0.01;

        // Air resistance
        particle.vx *= 0.999;
        particle.vy *= 0.999;

        // Brownian motion (random movement)
        particle.vx += Utils.random(-0.02, 0.02);
        particle.vy += Utils.random(-0.02, 0.02);

        // Clamp velocities
        const maxVel = 2;
        particle.vx = Utils.clamp(particle.vx, -maxVel, maxVel);
        particle.vy = Utils.clamp(particle.vy, -maxVel, maxVel);
    }

    checkBoundaries(particle) {
        const margin = 50;
        
        // Horizontal boundaries
        if (particle.x < -margin) {
            particle.x = window.innerWidth + margin;
        } else if (particle.x > window.innerWidth + margin) {
            particle.x = -margin;
        }

        // Vertical boundaries
        if (particle.y < -margin) {
            particle.y = window.innerHeight + margin;
        } else if (particle.y > window.innerHeight + margin) {
            particle.y = -margin;
        }
    }

    updateParticleElement(particle) {
        if (!particle.element) return;

        // Calculate fade based on life
        const fadeStart = 0.8;
        const fadeOpacity = particle.life > particle.maxLife * fadeStart ? 
            Utils.lerp(particle.opacity, 0, (particle.life - particle.maxLife * fadeStart) / (particle.maxLife * (1 - fadeStart))) :
            particle.opacity;

        // Update transform and opacity
        particle.element.style.transform = `translate(${particle.x}px, ${particle.y}px) rotate(${particle.rotation}deg)`;
        particle.element.style.opacity = fadeOpacity;
    }

    removeParticle(index) {
        const particle = this.particles[index];
        if (particle && particle.element && particle.element.parentNode) {
            particle.element.parentNode.removeChild(particle.element);
        }
        this.particles.splice(index, 1);
    }

    updateParticleAttraction(mouseX, mouseY) {
        this.particles.forEach(particle => {
            const dx = mouseX - particle.x;
            const dy = mouseY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                const force = (100 - distance) / 100 * 0.03;
                particle.vx += (dx / distance) * force;
                particle.vy += (dy / distance) * force;
            }
        });
    }

    createBurst(x, y) {
        const burstCount = Utils.randomInt(10, 20);
        
        for (let i = 0; i < burstCount; i++) {
            const angle = (360 / burstCount) * i + Utils.random(-10, 10);
            const speed = Utils.random(2, 5);
            const radians = (angle * Math.PI) / 180;
            
            const particle = {
                id: Utils.generateId('burst'),
                x: x,
                y: y,
                vx: Math.cos(radians) * speed,
                vy: Math.sin(radians) * speed,
                size: Utils.random(2, 6),
                opacity: 1,
                color: this.settings.colors[Utils.randomInt(0, this.settings.colors.length - 1)],
                shape: 'circle',
                rotation: 0,
                rotationSpeed: Utils.random(-5, 5),
                life: 0,
                maxLife: Utils.random(1, 3),
                element: null
            };

            particle.element = this.createParticleElement(particle);
            
            if (this.container) {
                this.container.appendChild(particle.element);
            }

            this.particles.push(particle);
        }
    }

    animate() {
        if (!this.isRunning) return;

        this.updateParticles();
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.animate();
        Utils.log('Particle system started', 'success');
    }

    pause() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        Utils.log('Particle system paused', 'info');
    }

    resume() {
        if (!this.isRunning) {
            this.start();
        }
    }

    optimizeForPerformance() {
        // Reduce visual effects for better performance
        this.settings.interactive = false;
        
        // Simplify particle shapes
        this.particles.forEach(particle => {
            if (particle.shape !== 'circle') {
                particle.shape = 'circle';
                this.applyShapeStyle(particle.element, particle);
            }
        });

        Utils.log('Particle system optimized for performance', 'warning');
    }

    handleResize() {
        // Update particle positions to fit new window size
        const widthRatio = window.innerWidth / (this.container?.offsetWidth || window.innerWidth);
        const heightRatio = window.innerHeight / (this.container?.offsetHeight || window.innerHeight);

        this.particles.forEach(particle => {
            particle.x *= widthRatio;
            particle.y *= heightRatio;
        });

        Utils.log('Particle system resized', 'info');
    }

    // Configuration methods
    setParticleCount(count) {
        this.settings.count = Utils.clamp(count, 10, 100);
        
        // Adjust current particles
        while (this.particles.length > this.settings.count) {
            this.removeParticle(this.particles.length - 1);
        }
    }

    setSpeed(speed) {
        this.settings.speed = Utils.clamp(speed, 0.1, 3);
        
        // Update existing particles
        this.particles.forEach(particle => {
            const factor = this.settings.speed / Math.abs(particle.vx || particle.vy);
            particle.vx *= factor;
            particle.vy *= factor;
        });
    }

    setColors(colors) {
        if (Array.isArray(colors) && colors.length > 0) {
            this.settings.colors = colors;
        }
    }

    setDirection(direction) {
        const validDirections = ['up', 'down', 'left', 'right', 'random'];
        if (validDirections.includes(direction)) {
            this.settings.direction = direction;
            
            // Update existing particles
            this.particles.forEach(particle => {
                this.setParticleDirection(particle);
            });
        }
    }

    setInteractive(interactive) {
        this.settings.interactive = interactive;
        
        if (interactive && !Utils.isMobile()) {
            this.setupMouseInteraction();
        }
    }

    // Preset configurations
    setPreset(presetName) {
        const presets = {
            minimal: {
                count: 20,
                speed: 0.3,
                colors: ['rgba(255,255,255,0.3)'],
                shapes: ['circle'],
                interactive: false
            },
            colorful: {
                count: 40,
                speed: 0.7,
                colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b'],
                shapes: ['circle', 'star'],
                interactive: true
            },
            hearts: {
                count: 15,
                speed: 0.5,
                colors: ['#ff6b6b', '#ff8a80', '#ff5252'],
                shapes: ['heart'],
                direction: 'up',
                interactive: true
            },
            stars: {
                count: 30,
                speed: 0.4,
                colors: ['#ffd700', '#fff', '#87ceeb'],
                shapes: ['star'],
                interactive: false
            },
            performance: {
                count: 15,
                speed: 0.2,
                colors: ['rgba(255,255,255,0.2)'],
                shapes: ['circle'],
                interactive: false
            }
        };

        const preset = presets[presetName];
        if (preset) {
            this.settings = { ...this.settings, ...preset };
            this.recreateParticles();
            Utils.log(`Applied preset: ${presetName}`, 'info');
        }
    }

    recreateParticles() {
        // Clear existing particles
        this.particles.forEach(particle => {
            if (particle.element && particle.element.parentNode) {
                particle.element.parentNode.removeChild(particle.element);
            }
        });
        
        // Create new particles with current settings
        this.createParticles();
    }

    // Special effects
    createFireworks(x, y) {
        const colors = ['#ff6b6b', '#ffd700', '#4ecdc4', '#45b7d1', '#f9ca24'];
        const layers = 3;
        
        for (let layer = 0; layer < layers; layer++) {
            setTimeout(() => {
                const particlesPerLayer = 20 - (layer * 5);
                
                for (let i = 0; i < particlesPerLayer; i++) {
                    const angle = (360 / particlesPerLayer) * i;
                    const speed = 3 - (layer * 0.5);
                    const radians = (angle * Math.PI) / 180;
                    
                    const particle = {
                        id: Utils.generateId('firework'),
                        x: x,
                        y: y,
                        vx: Math.cos(radians) * speed,
                        vy: Math.sin(radians) * speed,
                        size: 3 + layer,
                        opacity: 1,
                        color: colors[Utils.randomInt(0, colors.length - 1)],
                        shape: 'star',
                        rotation: 0,
                        rotationSpeed: Utils.random(-10, 10),
                        life: 0,
                        maxLife: 2 + layer,
                        element: null
                    };

                    particle.element = this.createParticleElement(particle);
                    
                    if (this.container) {
                        this.container.appendChild(particle.element);
                    }

                    this.particles.push(particle);
                }
            }, layer * 200);
        }
    }

    createTrail(startX, startY, endX, endY) {
        const distance = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
        const particleCount = Math.floor(distance / 10);
        
        for (let i = 0; i < particleCount; i++) {
            const progress = i / particleCount;
            const x = Utils.lerp(startX, endX, progress);
            const y = Utils.lerp(startY, endY, progress);
            
            setTimeout(() => {
                const particle = {
                    id: Utils.generateId('trail'),
                    x: x + Utils.random(-5, 5),
                    y: y + Utils.random(-5, 5),
                    vx: Utils.random(-0.5, 0.5),
                    vy: Utils.random(-0.5, 0.5),
                    size: Utils.random(1, 3),
                    opacity: 0.8,
                    color: this.settings.colors[Utils.randomInt(0, this.settings.colors.length - 1)],
                    shape: 'circle',
                    rotation: 0,
                    rotationSpeed: 0,
                    life: 0,
                    maxLife: 1,
                    element: null
                };

                particle.element = this.createParticleElement(particle);
                
                if (this.container) {
                    this.container.appendChild(particle.element);
                }

                this.particles.push(particle);
            }, i * 50);
        }
    }

    // Save and load settings
    saveSettings() {
        Utils.setStorage('profileApp_particleSettings', this.settings);
    }

    loadSettings() {
        const saved = Utils.getStorage('profileApp_particleSettings');
        if (saved) {
            this.settings = { ...this.settings, ...saved };
            Utils.log('Loaded particle settings', 'info');
        }
    }

    // Public API methods
    getSettings() {
        return { ...this.settings };
    }

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.recreateParticles();
        this.saveSettings();
    }

    getParticleCount() {
        return this.particles.length;
    }

    isRunning() {
        return this.isRunning;
    }

    // Debug methods
    showDebugInfo() {
        const debugInfo = Utils.createElement('div', {
            className: 'particle-debug',
            innerHTML: `
                <div style="
                    position: fixed;
                    top: 10px;
                    right: 10px;
                    background: rgba(0,0,0,0.8);
                    color: white;
                    padding: 10px;
                    border-radius: 5px;
                    font-family: monospace;
                    font-size: 12px;
                    z-index: 10000;
                ">
                    <div>Particles: ${this.particles.length}</div>
                    <div>Running: ${this.isRunning}</div>
                    <div>Speed: ${this.settings.speed}</div>
                    <div>Interactive: ${this.settings.interactive}</div>
                </div>
            `
        });

        document.body.appendChild(debugInfo);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (debugInfo.parentNode) {
                debugInfo.remove();
            }
        }, 5000);
    }

    // Event handlers
    handleClick(event) {
        if (this.settings.interactive) {
            this.createBurst(event.clientX, event.clientY);
        }
    }

    // Cleanup and destroy
    destroy() {
        // Stop animation
        this.pause();

        // Remove all particles
        this.particles.forEach(particle => {
            if (particle.element && particle.element.parentNode) {
                particle.element.parentNode.removeChild(particle.element);
            }
        });
        this.particles = [];

        // Remove container
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }

        // Remove event listeners
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('click', this.handleClick);

        // Save settings
        this.saveSettings();

        Utils.log('Particle System destroyed', 'info');
    }
}

// Make ParticleSystem globally available
window.ParticleSystem = ParticleSystem;