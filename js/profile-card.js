// ===== PROFILE CARD COMPONENT =====

class ProfileCard {
    constructor() {
        this.container = null;
        this.avatar = null;
        this.toggleButton = null;
        this.checkbox = null;
        this.isExpanded = false;
        this.profileData = {
            name: 'Trungg',
            description: 'Chàng trai thư giãn - Cần 1 tình yêu ấm áp',
            avatar: 'assets/profile.jpg'
        };
        
        this.init();
    }

    init() {
        this.createProfileCard();
        this.setupEventListeners();
        this.loadProfileData();
        Utils.log('Profile Card initialized', 'success');
    }

    createProfileCard() {
        const targetContainer = document.getElementById('profile-card');
        if (!targetContainer) {
            Utils.log('Profile card container not found', 'warning');
            return;
        }

        // Create profile card HTML
        const cardHTML = `
            <div class="card" data-component="profileCard">
                <div class="card-title">${this.profileData.name}</div>
                <div class="card-info">
                    <span class="avatar-container">
                        <img src="${this.profileData.avatar}" alt="Avatar" class="avatar" loading="lazy">
                        <div class="avatar-overlay">
                            <i class="fas fa-camera"></i>
                        </div>
                    </span>
                    <p class="profile-description">${this.profileData.description}</p>
                    <label class="btn" for="toggle">
                        <span class="btn-text">Mạng xã hội</span>
                        <i class="fas fa-chevron-down btn-icon"></i>
                    </label>
                    <input id="toggle" type="checkbox">
                </div>
            </div>
        `;

        targetContainer.innerHTML = cardHTML;

        // Get references to created elements
        this.container = targetContainer.querySelector('.card');
        this.avatar = targetContainer.querySelector('.avatar');
        this.toggleButton = targetContainer.querySelector('.btn');
        this.checkbox = targetContainer.querySelector('#toggle');
        this.description = targetContainer.querySelector('.profile-description');
        this.btnIcon = targetContainer.querySelector('.btn-icon');
    }

    setupEventListeners() {
        if (!this.container) return;

        // Avatar hover effects
        if (this.avatar) {
            this.setupAvatarEvents();
        }

        // Toggle button events
        if (this.toggleButton && this.checkbox) {
            this.setupToggleEvents();
        }

        // Card hover effects
        this.setupCardEvents();

        // Description typing effect
        this.setupTypingEffect();
    }

    setupAvatarEvents() {
        const avatarContainer = this.avatar.closest('.avatar-container');
        
        // Add overlay for hover effect
        if (!avatarContainer.querySelector('.avatar-overlay')) {
            const overlay = Utils.createElement('div', {
                className: 'avatar-overlay',
                innerHTML: '<i class="fas fa-camera"></i>',
                style: `
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.7);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    cursor: pointer;
                    color: white;
                    font-size: 1.5rem;
                `
            });
            avatarContainer.appendChild(overlay);
            avatarContainer.style.position = 'relative';
        }

        // Hover events
        avatarContainer.addEventListener('mouseenter', () => {
            const overlay = avatarContainer.querySelector('.avatar-overlay');
            if (overlay) overlay.style.opacity = '1';
            this.avatar.style.transform = 'scale(1.05)';
        });

        avatarContainer.addEventListener('mouseleave', () => {
            const overlay = avatarContainer.querySelector('.avatar-overlay');
            if (overlay) overlay.style.opacity = '0';
            this.avatar.style.transform = 'scale(1)';
        });

        // Click event for avatar
        avatarContainer.addEventListener('click', () => {
            this.handleAvatarClick();
        });

        // Error handling for avatar image
        this.avatar.addEventListener('error', () => {
            this.handleAvatarError();
        });

        // Lazy loading completion
        this.avatar.addEventListener('load', () => {
            this.avatar.style.opacity = '1';
            Utils.log('Avatar loaded successfully', 'success');
        });
    }

    setupToggleEvents() {
        // Listen for checkbox changes
        this.checkbox.addEventListener('change', (e) => {
            this.isExpanded = e.target.checked;
            this.updateToggleState();
            this.toggleSocialNetworks();
        });

        // Button click handling
        this.toggleButton.addEventListener('click', (e) => {
            // Let the label handle the checkbox toggle
            this.addButtonClickEffect();
        });

        // Keyboard support
        this.toggleButton.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.checkbox.checked = !this.checkbox.checked;
                this.checkbox.dispatchEvent(new Event('change'));
            }
        });
    }

    setupCardEvents() {
        // Card entrance animation
        this.container.style.opacity = '0';
        this.container.style.transform = 'translateY(30px) scale(0.95)';
        
        setTimeout(() => {
            this.container.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            this.container.style.opacity = '1';
            this.container.style.transform = 'translateY(0) scale(1)';
        }, 200);

        // Parallax effect on scroll (if page scrolls)
        if (!Utils.isMobile()) {
            window.addEventListener('scroll', Utils.throttle(() => {
                this.handleParallax();
            }, 16));
        }

        // Tilt effect on mouse move
        if (!Utils.isTouchDevice()) {
            this.setupTiltEffect();
        }
    }

    setupTiltEffect() {
        this.container.addEventListener('mousemove', (e) => {
            const rect = this.container.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const deltaX = (e.clientX - centerX) / (rect.width / 2);
            const deltaY = (e.clientY - centerY) / (rect.height / 2);
            
            const rotateX = deltaY * 5; // Max 5 degrees
            const rotateY = deltaX * -5; // Max 5 degrees
            
            this.container.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });

        this.container.addEventListener('mouseleave', () => {
            this.container.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
        });
    }

    setupTypingEffect() {
        if (!this.description) return;

        const originalText = this.description.textContent;
        this.description.textContent = '';
        
        // Start typing effect after a delay
        setTimeout(() => {
            this.typeText(this.description, originalText, 50);
        }, 1000);
    }

    typeText(element, text, speed) {
        let index = 0;
        const cursor = Utils.createElement('span', {
            className: 'typing-cursor',
            textContent: '|',
            style: 'animation: blink 1s infinite; color: #667eea;'
        });

        element.appendChild(cursor);

        const typeInterval = setInterval(() => {
            element.textContent = text.substring(0, index) + '|';
            index++;

            if (index > text.length) {
                clearInterval(typeInterval);
                element.textContent = text;
                
                // Remove cursor after typing is complete
                setTimeout(() => {
                    if (cursor.parentNode) {
                        cursor.remove();
                    }
                }, 1000);
            }
        }, speed);

        // Add blinking cursor animation
        if (!document.getElementById('typing-styles')) {
            const style = Utils.createElement('style', {
                id: 'typing-styles',
                innerHTML: `
                    @keyframes blink {
                        0%, 50% { opacity: 1; }
                        51%, 100% { opacity: 0; }
                    }
                `
            });
            document.head.appendChild(style);
        }
    }

    updateToggleState() {
        if (!this.btnIcon) return;

        if (this.isExpanded) {
            this.btnIcon.style.transform = 'rotate(180deg)';
            this.toggleButton.classList.add('active');
        } else {
            this.btnIcon.style.transform = 'rotate(0deg)';
            this.toggleButton.classList.remove('active');
        }
    }

    addButtonClickEffect() {
        // Add ripple effect
        const rect = this.toggleButton.getBoundingClientRect();
        const ripple = Utils.createElement('div', {
            className: 'ripple-effect',
            style: `
                position: absolute;
                width: 4px;
                height: 4px;
                background: rgba(255, 255, 255, 0.6);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `
        });

        this.toggleButton.style.position = 'relative';
        this.toggleButton.style.overflow = 'hidden';
        this.toggleButton.appendChild(ripple);

        // Add ripple animation if not exists
        if (!document.getElementById('ripple-styles')) {
            const style = Utils.createElement('style', {
                id: 'ripple-styles',
                innerHTML: `
                    @keyframes ripple {
                        to {
                            transform: scale(4);
                            opacity: 0;
                        }
                    }
                `
            });
            document.head.appendChild(style);
        }

        // Remove ripple after animation
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.remove();
            }
        }, 600);
    }

    toggleSocialNetworks() {
        // Dispatch event to social networks component
        const event = new CustomEvent('toggleSocialNetworks', {
            detail: { expanded: this.isExpanded }
        });
        document.dispatchEvent(event);

        Utils.log(`Social networks ${this.isExpanded ? 'expanded' : 'collapsed'}`, 'info');
    }

    handleAvatarClick() {
        // Show avatar zoom modal or trigger upload
        this.showAvatarModal();
    }

    showAvatarModal() {
        const modal = Utils.createElement('div', {
            className: 'avatar-modal',
            innerHTML: `
                <div class="avatar-modal-content">
                    <img src="${this.profileData.avatar}" alt="Avatar" class="avatar-large">
                    <div class="avatar-actions">
                        <button class="avatar-btn" data-action="zoom">
                            <i class="fas fa-search-plus"></i> Phóng to
                        </button>
                        <button class="avatar-btn" data-action="close">
                            <i class="fas fa-times"></i> Đóng
                        </button>
                    </div>
                </div>
            `,
            style: `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.3s ease;
            `
        });

        // Style modal content
        const content = modal.querySelector('.avatar-modal-content');
        content.style.cssText = `
            text-align: center;
            transform: scale(0.8);
            transition: transform 0.3s ease;
        `;

        const largeAvatar = modal.querySelector('.avatar-large');
        largeAvatar.style.cssText = `
            width: 300px;
            height: 300px;
            border-radius: 50%;
            object-fit: cover;
            border: 4px solid rgba(255, 255, 255, 0.3);
            margin-bottom: 2rem;
        `;

        // Add modal to page
        document.body.appendChild(modal);

        // Animate in
        setTimeout(() => {
            modal.style.opacity = '1';
            content.style.transform = 'scale(1)';
        }, 10);

        // Handle modal actions
        modal.addEventListener('click', (e) => {
            const action = e.target.closest('[data-action]')?.dataset.action;
            
            if (action === 'close' || e.target === modal) {
                this.closeAvatarModal(modal);
            } else if (action === 'zoom') {
                this.zoomAvatar(largeAvatar);
            }
        });

        // Keyboard close
        const handleKeydown = (e) => {
            if (e.key === 'Escape') {
                this.closeAvatarModal(modal);
                document.removeEventListener('keydown', handleKeydown);
            }
        };
        document.addEventListener('keydown', handleKeydown);
    }

    closeAvatarModal(modal) {
        const content = modal.querySelector('.avatar-modal-content');
        
        modal.style.opacity = '0';
        content.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 300);
    }

    zoomAvatar(avatarElement) {
        if (avatarElement.style.transform.includes('scale(1.5)')) {
            avatarElement.style.transform = 'scale(1)';
        } else {
            avatarElement.style.transform = 'scale(1.5)';
        }
    }

    handleAvatarError() {
        // Show fallback avatar
        this.avatar.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNjAiIGN5PSI2MCIgcj0iNjAiIGZpbGw9IiM2NjdlZWEiLz48Y2lyY2xlIGN4PSI2MCIgY3k9IjQ1IiByPSIyMCIgZmlsbD0id2hpdGUiLz48cGF0aCBkPSJNMjAgOTVjMC0yMiAxOC00MCA0MC00MHM0MCAxOCA0MCA0MCIgZmlsbD0id2hpdGUiLz48L3N2Zz4=';
        Utils.log('Avatar failed to load, using fallback', 'warning');
    }

    handleParallax() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        if (this.container) {
            this.container.style.transform = `translateY(${rate}px)`;
        }
    }

    loadProfileData() {
        // Load saved profile data if exists
        const saved = Utils.getStorage('profileApp_profileData');
        if (saved) {
            this.profileData = { ...this.profileData, ...saved };
            Utils.log('Loaded saved profile data', 'info');
        }
    }

    saveProfileData() {
        Utils.setStorage('profileApp_profileData', this.profileData);
    }

    // Public API methods
    updateProfile(data) {
        this.profileData = { ...this.profileData, ...data };
        this.saveProfileData();
        
        // Update UI elements
        if (data.name && this.container.querySelector('.card-title')) {
            this.container.querySelector('.card-title').textContent = data.name;
        }
        
        if (data.description && this.description) {
            this.description.textContent = data.description;
        }
        
        if (data.avatar && this.avatar) {
            this.avatar.src = data.avatar;
        }
    }

    getProfileData() {
        return { ...this.profileData };
    }

    toggleExpanded() {
        this.checkbox.checked = !this.checkbox.checked;
        this.checkbox.dispatchEvent(new Event('change'));
    }

    isExpanded() {
        return this.isExpanded;
    }

    handleClick(event) {
        // Handle component-specific clicks
        if (event.target.closest('.avatar-container')) {
            this.handleAvatarClick();
        }
    }

    handleResize() {
        // Adjust card for mobile
        if (Utils.isMobile() && this.container) {
            this.container.classList.add('mobile-optimized');
        }
    }

    destroy() {
        // Save current state
        this.saveProfileData();

        // Remove event listeners
        if (this.checkbox) {
            this.checkbox.removeEventListener('change', this.updateToggleState);
        }

        // Remove any modals
        const modals = document.querySelectorAll('.avatar-modal');
        modals.forEach(modal => modal.remove());

        Utils.log('Profile Card destroyed', 'info');
    }
}

// Make ProfileCard globally available
window.ProfileCard = ProfileCard;