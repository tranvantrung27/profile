// ===== MAIN APPLICATION CONTROLLER =====

class ProfileApp {
    constructor() {
        this.isInitialized = false;
        this.components = {};
        this.init();
    }

    async init() {
        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setupApp());
            } else {
                this.setupApp();
            }
        } catch (error) {
            console.error('Lỗi khởi tạo ứng dụng:', error);
        }
    }

    async setupApp() {
        try {
            // Show loading state
            this.showLoadingState();

            // Initialize all components
            await this.initializeComponents();

            // Setup event listeners
            this.setupEventListeners();

            // Handle initial overlay
            this.setupWelcomeOverlay();

            // Initialize animations
            this.initializeAnimations();

            // Mark as initialized
            this.isInitialized = true;

            console.log('✅ Ứng dụng đã được khởi tạo thành công');
        } catch (error) {
            console.error('❌ Lỗi trong quá trình thiết lập:', error);
        }
    }

    showLoadingState() {
        // Add loading class to body
        document.body.classList.add('loading');
    }

    async initializeComponents() {
        try {
            // Initialize Background Manager
            if (typeof BackgroundManager !== 'undefined') {
                this.components.background = new BackgroundManager();
            }

            // Initialize Volume Control
            if (typeof VolumeControl !== 'undefined') {
                this.components.volumeControl = new VolumeControl();
            }

            // Initialize Profile Card
            if (typeof ProfileCard !== 'undefined') {
                this.components.profileCard = new ProfileCard();
            }

            // Initialize Social Networks
            if (typeof SocialNetworks !== 'undefined') {
                this.components.socialNetworks = new SocialNetworks();
            }

            // Initialize Heart Animation
            if (typeof HeartAnimation !== 'undefined') {
                this.components.heartAnimation = new HeartAnimation();
            }

            // Initialize Particles
            if (typeof ParticleSystem !== 'undefined') {
                this.components.particles = new ParticleSystem();
            }

            console.log('✅ Tất cả components đã được khởi tạo');
        } catch (error) {
            console.error('❌ Lỗi khởi tạo components:', error);
        }
    }

    setupEventListeners() {
        // Global click handler for overlay
        document.addEventListener('click', this.handleGlobalClick.bind(this));

        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboard.bind(this));

        // Window resize handler
        window.addEventListener('resize', Utils.debounce(this.handleResize.bind(this), 250));

        // Visibility change handler
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

        // Error handler
        window.addEventListener('error', this.handleError.bind(this));
    }

    setupWelcomeOverlay() {
        const overlay = document.getElementById('overlay');
        if (!overlay) return;

        // Auto-hide overlay after 5 seconds if user doesn't interact
        setTimeout(() => {
            if (overlay && !overlay.classList.contains('hidden')) {
                this.hideOverlay();
            }
        }, 5000);
    }

    initializeAnimations() {
        // Add entrance animations
        this.addEntranceAnimations();

        // Setup intersection observer for scroll animations
        this.setupScrollAnimations();
    }

    addEntranceAnimations() {
        const elements = document.querySelectorAll('.card, .social-btn, .heart-container');
        elements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, 100 * index);
        });
    }

    setupScrollAnimations() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '50px'
            });

            document.querySelectorAll('.animate-on-scroll').forEach(el => {
                observer.observe(el);
            });
        }
    }

    handleGlobalClick(event) {
        const overlay = document.getElementById('overlay');
        
        // Hide overlay on any click
        if (overlay && !overlay.classList.contains('hidden')) {
            this.hideOverlay();
            event.preventDefault();
            return;
        }

        // Handle other global clicks
        this.handleComponentClicks(event);
    }

    handleComponentClicks(event) {
        // Delegate clicks to appropriate components
        const target = event.target.closest('[data-component]');
        if (!target) return;

        const componentName = target.dataset.component;
        const component = this.components[componentName];

        if (component && typeof component.handleClick === 'function') {
            component.handleClick(event);
        }
    }

    handleKeyboard(event) {
        // Keyboard shortcuts
        switch (event.key) {
            case 'Escape':
                this.hideOverlay();
                break;
            case ' ':
                if (event.target === document.body) {
                    event.preventDefault();
                    this.togglePlayPause();
                }
                break;
            case 'h':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    this.showHelpModal();
                }
                break;
        }
    }

    handleResize() {
        // Notify all components about resize
        Object.values(this.components).forEach(component => {
            if (typeof component.handleResize === 'function') {
                component.handleResize();
            }
        });

        // Update viewport units for mobile
        this.updateViewportUnits();
    }

    handleVisibilityChange() {
        if (document.hidden) {
            // Page is hidden - pause animations/video
            this.pauseAnimations();
        } else {
            // Page is visible - resume animations/video
            this.resumeAnimations();
        }
    }

    handleError(event) {
        console.error('Global error:', event.error);
        
        // Show user-friendly error message
        this.showErrorMessage('Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.');
    }

    hideOverlay() {
        const overlay = document.getElementById('overlay');
        if (!overlay) return;

        overlay.classList.add('hidden');
        
        setTimeout(() => {
            overlay.style.display = 'none';
            document.body.classList.remove('loading');
            this.startMainAnimations();
        }, 800);
    }

    startMainAnimations() {
        // Start background video
        if (this.components.background) {
            this.components.background.startVideo();
        }

        // Start particles
        if (this.components.particles) {
            this.components.particles.start();
        }

        // Trigger entrance animations
        this.addEntranceAnimations();
    }

    togglePlayPause() {
        if (this.components.background) {
            this.components.background.togglePlayPause();
        }
    }

    pauseAnimations() {
        Object.values(this.components).forEach(component => {
            if (typeof component.pause === 'function') {
                component.pause();
            }
        });
    }

    resumeAnimations() {
        Object.values(this.components).forEach(component => {
            if (typeof component.resume === 'function') {
                component.resume();
            }
        });
    }

    updateViewportUnits() {
        // Fix mobile viewport height issues
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    showErrorMessage(message) {
        // Create and show error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4757;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(errorDiv);

        // Animate in
        setTimeout(() => {
            errorDiv.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove after 5 seconds
        setTimeout(() => {
            errorDiv.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.parentNode.removeChild(errorDiv);
                }
            }, 300);
        }, 5000);
    }

    showHelpModal() {
        // Show help/shortcuts modal
        console.log('Hiển thị modal trợ giúp');
    }

    // Public API methods
    getComponent(name) {
        return this.components[name];
    }

    isReady() {
        return this.isInitialized;
    }

    destroy() {
        // Cleanup method
        Object.values(this.components).forEach(component => {
            if (typeof component.destroy === 'function') {
                component.destroy();
            }
        });

        // Remove event listeners
        document.removeEventListener('click', this.handleGlobalClick);
        document.removeEventListener('keydown', this.handleKeyboard);
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        window.removeEventListener('error', this.handleError);

        this.isInitialized = false;
        console.log('🧹 Ứng dụng đã được dọn dẹp');
    }
}

// ===== INITIALIZE APP =====
let app;

// Start the app
try {
    app = new ProfileApp();
    
    // Make app globally accessible for debugging
    window.ProfileApp = app;
    
} catch (error) {
    console.error('❌ Lỗi khởi tạo ứng dụng chính:', error);
}

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (app && typeof app.destroy === 'function') {
        app.destroy();
    }
});