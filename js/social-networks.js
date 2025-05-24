// ===== SOCIAL NETWORKS COMPONENT =====

class SocialNetworks {
    constructor() {
        this.container = null;
        this.isVisible = false;
        this.socialData = [
            {
                name: 'facebook',
                displayName: 'Facebook',
                url: 'https://www.facebook.com/trungbebong.2704',
                icon: this.getFacebookIcon(),
                color: '#1877f2'
            },
            {
                name: 'instagram',
                displayName: 'Instagram',
                url: 'https://www.instagram.com/_tv.trung04/',
                icon: this.getInstagramIcon(),
                color: '#e4405f'
            },
            {
                name: 'tiktok',
                displayName: 'TikTok',
                url: 'https://www.tiktok.com/@trunggbebongg',
                icon: this.getTikTokIcon(),
                color: '#000000'
            },
            {
                name: 'locket',
                displayName: 'Locket',
                url: 'https://locket.cam/trunggneee',
                icon: this.getLocketIcon(),
                color: '#ff6b6b'
            }
        ];
        
        this.init();
    }

    init() {
        this.createSocialNetworks();
        this.setupEventListeners();
        this.loadSocialData();
        Utils.log('Social Networks initialized', 'success');
    }

    createSocialNetworks() {
        const targetContainer = document.getElementById('social-networks');
        if (!targetContainer) {
            Utils.log('Social networks container not found', 'warning');
            return;
        }

        // Create social networks HTML
        const socialHTML = `
            <div class="social-networks" data-component="socialNetworks">
                <div class="social-title">
                    <i class="fas fa-share-alt"></i>
                    Kết nối với tôi
                </div>
                ${this.socialData.map(social => this.createSocialButton(social)).join('')}
            </div>
        `;

        targetContainer.innerHTML = socialHTML;

        // Get reference to container
        this.container = targetContainer.querySelector('.social-networks');
        
        // Initially hide the container
        this.container.style.display = 'none';
    }

    createSocialButton(social) {
        return `
            <a href="${social.url}" target="_blank" rel="noopener noreferrer" 
               class="social-btn ${social.name}" 
               data-social="${social.name}"
               aria-label="Truy cập ${social.displayName}">
                ${social.icon}
                <span class="${social.name}-text">${social.displayName}</span>
                <div class="social-btn-effect"></div>
            </a>
        `;
    }

    setupEventListeners() {
        // Listen for toggle events from profile card
        document.addEventListener('toggleSocialNetworks', (e) => {
            this.handleToggle(e.detail.expanded);
        });

        // Setup individual button events
        if (this.container) {
            this.setupButtonEvents();
        }

        // Setup intersection observer for animations
        this.setupIntersectionObserver();
    }

    setupButtonEvents() {
        const buttons = this.container.querySelectorAll('.social-btn');
        
        buttons.forEach((button, index) => {
            // Click tracking
            button.addEventListener('click', (e) => {
                const socialName = button.dataset.social;
                this.trackSocialClick(socialName);
                this.addClickEffect(button);
            });

            // Hover effects
            button.addEventListener('mouseenter', () => {
                this.addHoverEffect(button);
            });

            button.addEventListener('mouseleave', () => {
                this.removeHoverEffect(button);
            });

            // Keyboard support
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    button.click();
                }
            });

            // Long press for mobile context menu
            if (Utils.isTouchDevice()) {
                this.setupLongPress(button);
            }

            // Staggered entrance animation
            button.style.opacity = '0';
            button.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                button.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                button.style.opacity = '1';
                button.style.transform = 'translateY(0)';
            }, 100 * (index + 1));
        });
    }

    setupLongPress(button) {
        let pressTimer = null;
        
        button.addEventListener('touchstart', (e) => {
            pressTimer = setTimeout(() => {
                this.showSocialOptions(button);
            }, 800);
        }, { passive: true });

        button.addEventListener('touchend', () => {
            if (pressTimer) {
                clearTimeout(pressTimer);
                pressTimer = null;
            }
        }, { passive: true });

        button.addEventListener('touchmove', () => {
            if (pressTimer) {
                clearTimeout(pressTimer);
                pressTimer = null;
            }
        }, { passive: true });
    }

    setupIntersectionObserver() {
        if (!this.container || !('IntersectionObserver' in window)) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateButtons();
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '50px'
        });

        observer.observe(this.container);
    }

    handleToggle(expanded) {
        this.isVisible = expanded;
        
        if (expanded) {
            this.showSocialNetworks();
        } else {
            this.hideSocialNetworks();
        }
    }

    showSocialNetworks() {
        if (!this.container) return;

        this.container.style.display = 'flex';
        
        // Trigger reflow
        this.container.offsetHeight;
        
        // Add show animation
        this.container.style.opacity = '0';
        this.container.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            this.container.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            this.container.style.opacity = '1';
            this.container.style.transform = 'translateY(0)';
        }, 10);

        // Animate buttons with stagger
        this.animateButtons();
        
        Utils.log('Social networks shown', 'info');
    }

    hideSocialNetworks() {
        if (!this.container) return;

        this.container.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        this.container.style.opacity = '0';
        this.container.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            this.container.style.display = 'none';
        }, 400);
        
        Utils.log('Social networks hidden', 'info');
    }

    animateButtons() {
        const buttons = this.container?.querySelectorAll('.social-btn');
        if (!buttons) return;

        buttons.forEach((button, index) => {
            button.style.transform = 'translateY(20px) scale(0.8)';
            button.style.opacity = '0';
            
            setTimeout(() => {
                button.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                button.style.transform = 'translateY(0) scale(1)';
                button.style.opacity = '1';
            }, 100 * index);
        });
    }

    addClickEffect(button) {
        // Create ripple effect
        const rect = button.getBoundingClientRect();
        const ripple = Utils.createElement('div', {
            className: 'click-ripple',
            style: `
                position: absolute;
                width: 4px;
                height: 4px;
                background: rgba(255, 255, 255, 0.6);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
                top: 50%;
                left: 50%;
                margin: -2px 0 0 -2px;
            `
        });

        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);

        // Add scale effect
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 150);

        // Remove ripple after animation
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.remove();
            }
        }, 600);
    }

    addHoverEffect(button) {
        const icon = button.querySelector('svg');
        const text = button.querySelector('span');
        
        if (icon) {
            icon.style.transform = 'scale(1.2) rotate(10deg)';
        }
        
        if (text) {
            text.style.transform = 'translateX(5px)';
        }

        // Add glow effect
        const socialName = button.dataset.social;
        const social = this.socialData.find(s => s.name === socialName);
        if (social) {
            button.style.boxShadow = `0 15px 40px ${Utils.hexToRgba(social.color, 0.4)}`;
        }
    }

    removeHoverEffect(button) {
        const icon = button.querySelector('svg');
        const text = button.querySelector('span');
        
        if (icon) {
            icon.style.transform = 'scale(1) rotate(0deg)';
        }
        
        if (text) {
            text.style.transform = 'translateX(0)';
        }

        // Remove glow effect
        button.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.2)';
    }

    showSocialOptions(button) {
        const socialName = button.dataset.social;
        const social = this.socialData.find(s => s.name === socialName);
        
        if (!social) return;

        const modal = Utils.createElement('div', {
            className: 'social-options-modal',
            innerHTML: `
                <div class="social-options-content">
                    <h3>${social.displayName}</h3>
                    <div class="social-options-buttons">
                        <button class="option-btn" data-action="visit">
                            <i class="fas fa-external-link-alt"></i>
                            Truy cập
                        </button>
                        <button class="option-btn" data-action="copy">
                            <i class="fas fa-copy"></i>
                            Sao chép link
                        </button>
                        <button class="option-btn" data-action="share">
                            <i class="fas fa-share"></i>
                            Chia sẻ
                        </button>
                        <button class="option-btn cancel" data-action="cancel">
                            <i class="fas fa-times"></i>
                            Hủy
                        </button>
                    </div>
                </div>
            `,
            style: `
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: rgba(0, 0, 0, 0.9);
                z-index: 10000;
                transform: translateY(100%);
                transition: transform 0.3s ease;
            `
        });

        document.body.appendChild(modal);

        // Animate in
        setTimeout(() => {
            modal.style.transform = 'translateY(0)';
        }, 10);

        // Handle options
        modal.addEventListener('click', async (e) => {
            const action = e.target.closest('[data-action]')?.dataset.action;
            
            switch (action) {
                case 'visit':
                    window.open(social.url, '_blank');
                    break;
                case 'copy':
                    const copied = await Utils.copyToClipboard(social.url);
                    if (copied) {
                        this.showToast('Link đã được sao chép!');
                    }
                    break;
                case 'share':
                    if (navigator.share) {
                        try {
                            await navigator.share({
                                title: `Theo dõi tôi trên ${social.displayName}`,
                                url: social.url
                            });
                        } catch (error) {
                            // User cancelled or error occurred
                        }
                    } else {
                        // Fallback to copy
                        await Utils.copyToClipboard(social.url);
                        this.showToast('Link đã được sao chép!');
                    }
                    break;
            }
            
            if (action) {
                this.closeSocialOptions(modal);
            }
        });

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeSocialOptions(modal);
            }
        });
    }

    closeSocialOptions(modal) {
        modal.style.transform = 'translateY(100%)';
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 300);
    }

    showToast(message) {
        const toast = Utils.createElement('div', {
            className: 'social-toast',
            textContent: message,
            style: `
                position: fixed;
                bottom: 2rem;
                left: 50%;
                transform: translateX(-50%) translateY(100px);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                z-index: 10001;
                transition: transform 0.3s ease;
                backdrop-filter: blur(10px);
            `
        });

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(0)';
        }, 10);

        setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(100px)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, 3000);
    }

    trackSocialClick(socialName) {
        // Track social media clicks for analytics
        const clickData = {
            social: socialName,
            timestamp: Date.now(),
            userAgent: navigator.userAgent
        };

        // Save to local storage for analytics
        const clicks = Utils.getStorage('profileApp_socialClicks', []);
        clicks.push(clickData);
        
        // Keep only last 100 clicks
        if (clicks.length > 100) {
            clicks.splice(0, clicks.length - 100);
        }
        
        Utils.setStorage('profileApp_socialClicks', clicks);
        
        Utils.log(`Social click tracked: ${socialName}`, 'info');
    }

    loadSocialData() {
        // Load saved social data if exists
        const saved = Utils.getStorage('profileApp_socialData');
        if (saved && Array.isArray(saved)) {
            this.socialData = this.socialData.map(social => {
                const savedSocial = saved.find(s => s.name === social.name);
                return savedSocial ? { ...social, ...savedSocial } : social;
            });
            Utils.log('Loaded saved social data', 'info');
        }
    }

    saveSocialData() {
        Utils.setStorage('profileApp_socialData', this.socialData);
    }

    // SVG Icons
    getFacebookIcon() {
        return `
            <svg style="fill:#FFFFFF;" class="facebook-svg" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
                <path d="M48,0C21.5,0,0,21.5,0,48c0,23.6,17.2,43.1,39.6,47.5V62.2h-8.9V48h8.9V37.4c0-8.8,5.2-13.8,13.1-13.8c3.8,0,7.8,0.7,7.8,0.7v8.6H55.4c-4.3,0-5.6,2.7-5.6,5.5v6.5h9.5l-1.5,14.2h-8v33.3C78.8,91.1,96,71.6,96,48C96,21.5,74.5,0,48,0z"></path>
            </svg>
        `;
    }

    getInstagramIcon() {
        return `
            <svg style="fill:#FFFFFF;" class="instagram-svg" viewBox="0 0 169.063 169.063" xmlns="http://www.w3.org/2000/svg">
                <path d="M122.406,0H46.657C20.895,0,0,20.896,0,46.657v75.748c0,25.761,20.895,46.657,46.657,46.657h75.748c25.761,0,46.657-20.896,46.657-46.657V46.657C169.063,20.896,148.167,0,122.406,0z M159.063,122.406c0,20.206-16.451,36.657-36.657,36.657H46.657C26.451,159.063,10,142.613,10,122.406V46.657C10,26.451,26.451,10,46.657,10h75.748c20.206,0,36.657,16.451,36.657,36.657V122.406z"/>
                <path d="M84.531,41.615c-23.717,0-43.017,19.3-43.017,43.017s19.3,43.017,43.017,43.017s43.017-19.3,43.017-43.017S108.248,41.615,84.531,41.615z M84.531,117.649c-19.816,0-35.917-16.101-35.917-35.917c0-19.816,16.101-35.917,35.917-35.917s35.917,16.101,35.917,35.917C120.448,101.549,104.347,117.649,84.531,117.649z"/>
                <path d="M129.921,29.709c-4.728,0-8.568,3.84-8.568,8.568s3.84,8.568,8.568,8.568s8.568-3.84,8.568-8.568S134.649,29.709,129.921,29.709z"/>
            </svg>
        `;
    }

    getTikTokIcon() {
        return `
            <svg viewBox="0 0 19.738 22.466" height="22.466" width="19.738" xmlns="http://www.w3.org/2000/svg" class="tiktok-svg">
                <path fill="#FFFFFF" transform="translate(-31.423 -0.39)" d="M51.151,6.015a5.661,5.661,0,0,1-3.42-1.143A5.662,5.662,0,0,1,45.469.39H41.8V10.414l0,5.49a3.325,3.325,0,1,1-2.281-3.151V9.029a7.218,7.218,0,0,0-1.058-.078,7.034,7.034,0,0,0-5.286,2.364,6.893,6.893,0,0,0,.311,9.505,7.158,7.158,0,0,0,.663.579,7.035,7.035,0,0,0,4.312,1.458,7.219,7.219,0,0,0,1.058-.078,7.011,7.011,0,0,0,3.917-1.959,6.868,6.868,0,0,0,2.06-4.887l-.019-8.2a9.3,9.3,0,0,0,5.688,1.933V6.014h-.011Z"></path>
            </svg>
        `;
    }

    getLocketIcon() {
        return `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="locket-svg">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#ffffff"/>
            </svg>
        `;
    }

    // Public API methods
    updateSocial(name, data) {
        const index = this.socialData.findIndex(s => s.name === name);
        if (index !== -1) {
            this.socialData[index] = { ...this.socialData[index], ...data };
            this.saveSocialData();
            this.createSocialNetworks(); // Recreate to reflect changes
        }
    }

    getSocialData() {
        return [...this.socialData];
    }

    show() {
        this.handleToggle(true);
    }

    hide() {
        this.handleToggle(false);
    }

    isShowing() {
        return this.isVisible;
    }

    getClickStats() {
        return Utils.getStorage('profileApp_socialClicks', []);
    }

    handleClick(event) {
        // Handle component-specific clicks
        const button = event.target.closest('.social-btn');
        if (button) {
            this.addClickEffect(button);
        }
    }

    handleResize() {
        // Adjust social buttons for mobile
        if (Utils.isMobile() && this.container) {
            this.container.classList.add('mobile-optimized');
        }
    }

    destroy() {
        // Save current state
        this.saveSocialData();

        // Remove event listeners
        document.removeEventListener('toggleSocialNetworks', this.handleToggle);

        // Remove any modals
        const modals = document.querySelectorAll('.social-options-modal, .social-toast');
        modals.forEach(modal => modal.remove());

        Utils.log('Social Networks destroyed', 'info');
    }
}

// Make SocialNetworks globally available
window.SocialNetworks = SocialNetworks;