// ===== VOLUME CONTROL COMPONENT =====

class VolumeControl {
    constructor() {
        this.container = null;
        this.slider = null;
        this.volumeIcon = null;
        this.indicator = null;
        this.currentVolume = 50;
        this.isMuted = false;
        this.previousVolume = 50;
        
        this.init();
    }

    init() {
        this.createVolumeControl();
        this.setupEventListeners();
        this.loadSavedVolume();
        Utils.log('Volume Control initialized', 'success');
    }

    createVolumeControl() {
        const targetContainer = document.getElementById('volume-container');
        if (!targetContainer) {
            Utils.log('Volume container not found', 'warning');
            return;
        }

        // Create volume control HTML
        const volumeHTML = `
            <div class="slider-container">
                <label class="slider" id="volume-control">
                    <input type="range" class="level" min="0" max="100" value="${this.currentVolume}" />
                    <svg class="volume" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                        <g>
                            <path class="volume-high" d="M18.36 19.36a1 1 0 0 1-.705-1.71C19.167 16.148 20 14.142 20 12s-.833-4.148-2.345-5.65a1 1 0 1 1 1.41-1.419C20.958 6.812 22 9.322 22 12s-1.042 5.188-2.935 7.069a.997.997 0 0 1-.705.291z" fill="currentColor"></path>
                            <path class="volume-medium" d="M15.53 16.53a.999.999 0 0 1-.703-1.711C15.572 14.082 16 13.054 16 12s-.428-2.082-1.173-2.819a1 1 0 1 1 1.406-1.422A6 6 0 0 1 18 12a6 6 0 0 1-1.767 4.241.996.996 0 0 1-.703.289z" fill="currentColor"></path>
                            <path class="volume-base" d="M12 22a1 1 0 0 1-.707-.293L6.586 17H4c-1.103 0-2-.897-2-2V9c0-1.103.897-2 2-2h2.586l4.707-4.707A.998.998 0 0 1 13 3v18a1 1 0 0 1-1 1z" fill="currentColor"></path>
                        </g>
                    </svg>
                    <div class="volume-indicator">${this.currentVolume}%</div>
                </label>
            </div>
        `;

        targetContainer.innerHTML = volumeHTML;

        // Get references to created elements
        this.container = targetContainer.querySelector('.slider-container');
        this.slider = targetContainer.querySelector('.level');
        this.volumeIcon = targetContainer.querySelector('.volume');
        this.indicator = targetContainer.querySelector('.volume-indicator');
    }

    setupEventListeners() {
        if (!this.slider || !this.volumeIcon) return;

        // Slider input event
        this.slider.addEventListener('input', (e) => {
            this.handleVolumeChange(parseInt(e.target.value));
        });

        // Slider change event (mouse release)
        this.slider.addEventListener('change', (e) => {
            this.saveVolume();
        });

        // Icon click to toggle mute
        this.volumeIcon.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleMute();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });

        // Mouse wheel on slider
        this.slider.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -5 : 5;
            this.setVolume(this.currentVolume + delta);
        });

        // Touch events for mobile
        if (Utils.isTouchDevice()) {
            this.setupTouchEvents();
        }

        // Container hover events for indicator
        this.container.addEventListener('mouseenter', () => {
            this.showIndicator();
        });

        this.container.addEventListener('mouseleave', () => {
            this.hideIndicator();
        });
    }

    setupTouchEvents() {
        if (!this.slider) return;

        let isDragging = false;

        this.slider.addEventListener('touchstart', (e) => {
            isDragging = true;
            this.showIndicator();
        }, { passive: true });

        this.slider.addEventListener('touchend', (e) => {
            isDragging = false;
            this.hideIndicator();
            this.saveVolume();
        }, { passive: true });

        this.slider.addEventListener('touchmove', (e) => {
            if (isDragging) {
                // Update indicator during touch drag
                this.updateIndicator();
            }
        }, { passive: true });
    }

    handleVolumeChange(volume) {
        this.currentVolume = Utils.clamp(volume, 0, 100);
        
        // Update visual elements
        this.updateVolumeIcon();
        this.updateIndicator();
        this.updateSliderTrack();
        
        // Apply volume to background video
        this.applyVolumeToMedia();
        
        // Auto unmute if volume is increased from 0
        if (volume > 0 && this.isMuted) {
            this.isMuted = false;
            this.updateVolumeIcon();
        }

        // Auto mute if volume is set to 0
        if (volume === 0 && !this.isMuted) {
            this.isMuted = true;
            this.updateVolumeIcon();
        }

        Utils.log(`Volume changed to ${this.currentVolume}%`, 'info');
    }

    updateVolumeIcon() {
        if (!this.volumeIcon) return;

        const paths = {
            high: this.volumeIcon.querySelector('.volume-high'),
            medium: this.volumeIcon.querySelector('.volume-medium'),
            base: this.volumeIcon.querySelector('.volume-base')
        };

        // Reset all paths
        Object.values(paths).forEach(path => {
            if (path) path.style.opacity = '1';
        });

        if (this.isMuted || this.currentVolume === 0) {
            // Muted state - show only base (speaker) with X
            if (paths.high) paths.high.style.opacity = '0.3';
            if (paths.medium) paths.medium.style.opacity = '0.3';
            this.volumeIcon.style.filter = 'brightness(0.7)';
        } else if (this.currentVolume < 30) {
            // Low volume - show base only
            if (paths.high) paths.high.style.opacity = '0.3';
            if (paths.medium) paths.medium.style.opacity = '0.3';
            this.volumeIcon.style.filter = 'brightness(1)';
        } else if (this.currentVolume < 70) {
            // Medium volume - show base and medium
            if (paths.high) paths.high.style.opacity = '0.3';
            this.volumeIcon.style.filter = 'brightness(1)';
        } else {
            // High volume - show all
            this.volumeIcon.style.filter = 'brightness(1)';
        }

        // Add visual feedback animation
        this.volumeIcon.style.transform = 'scale(1.1)';
        setTimeout(() => {
            this.volumeIcon.style.transform = 'scale(1)';
        }, 150);
    }

    updateIndicator() {
        if (!this.indicator) return;

        this.indicator.textContent = `${this.currentVolume}%`;
        
        // Color coding for volume levels
        if (this.isMuted || this.currentVolume === 0) {
            this.indicator.style.color = '#ff6b6b';
        } else if (this.currentVolume < 30) {
            this.indicator.style.color = '#ffa500';
        } else if (this.currentVolume < 70) {
            this.indicator.style.color = '#fff';
        } else {
            this.indicator.style.color = '#2ecc71';
        }
    }

    updateSliderTrack() {
        if (!this.slider) return;

        // Create gradient background for slider track
        const percentage = this.currentVolume;
        const gradient = `linear-gradient(90deg, 
            rgba(102, 126, 234, 0.8) 0%, 
            rgba(118, 75, 162, 0.8) ${percentage}%, 
            rgba(255, 255, 255, 0.2) ${percentage}%, 
            rgba(255, 255, 255, 0.1) 100%)`;
        
        this.slider.style.background = gradient;
    }

    showIndicator() {
        if (!this.indicator) return;
        this.indicator.style.opacity = '1';
    }

    hideIndicator() {
        if (!this.indicator) return;
        this.indicator.style.opacity = '0';
    }

    applyVolumeToMedia() {
        // Apply to background video
        const video = document.getElementById('background-video');
        if (video) {
            video.volume = this.currentVolume / 100;
            video.muted = this.isMuted || this.currentVolume === 0;
        }

        // Apply to any audio elements
        const audioElements = document.querySelectorAll('audio');
        audioElements.forEach(audio => {
            audio.volume = this.currentVolume / 100;
            audio.muted = this.isMuted || this.currentVolume === 0;
        });

        // Notify other components
        this.notifyVolumeChange();
    }

    notifyVolumeChange() {
        // Dispatch custom event for other components to listen
        const event = new CustomEvent('volumeChange', {
            detail: {
                volume: this.currentVolume,
                isMuted: this.isMuted,
                normalizedVolume: this.currentVolume / 100
            }
        });
        document.dispatchEvent(event);
    }

    toggleMute() {
        if (this.isMuted) {
            // Unmute
            this.isMuted = false;
            this.setVolume(this.previousVolume || 50);
        } else {
            // Mute
            this.previousVolume = this.currentVolume;
            this.isMuted = true;
            this.updateVolumeIcon();
            this.updateIndicator();
            this.applyVolumeToMedia();
        }

        Utils.log(`Volume ${this.isMuted ? 'muted' : 'unmuted'}`, 'info');
    }

    setVolume(volume) {
        const newVolume = Utils.clamp(volume, 0, 100);
        this.slider.value = newVolume;
        this.handleVolumeChange(newVolume);
    }

    increaseVolume(amount = 10) {
        this.setVolume(this.currentVolume + amount);
    }

    decreaseVolume(amount = 10) {
        this.setVolume(this.currentVolume - amount);
    }

    handleKeyboard(e) {
        // Only handle if no input elements are focused
        if (document.activeElement.tagName === 'INPUT' || 
            document.activeElement.tagName === 'TEXTAREA') {
            return;
        }

        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                this.increaseVolume(5);
                this.showVolumeToast();
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.decreaseVolume(5);
                this.showVolumeToast();
                break;
            case 'm':
            case 'M':
                e.preventDefault();
                this.toggleMute();
                this.showVolumeToast();
                break;
        }
    }

    showVolumeToast() {
        // Remove existing toast
        const existingToast = document.querySelector('.volume-toast');
        if (existingToast) {
            existingToast.remove();
        }

        // Create new toast
        const toast = Utils.createElement('div', {
            className: 'volume-toast',
            innerHTML: `
                <div class="volume-toast-content">
                    <i class="fas fa-volume-${this.getVolumeIcon()}"></i>
                    <span>${this.isMuted ? 'Tắt tiếng' : this.currentVolume + '%'}</span>
                </div>
            `,
            style: `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 10px;
                z-index: 10000;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                opacity: 0;
                transition: opacity 0.3s ease;
                pointer-events: none;
            `
        });

        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.style.opacity = '1';
        }, 10);

        // Remove after 2 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 2000);
    }

    getVolumeIcon() {
        if (this.isMuted || this.currentVolume === 0) return 'mute';
        if (this.currentVolume < 30) return 'down';
        if (this.currentVolume < 70) return 'down';
        return 'up';
    }

    saveVolume() {
        Utils.setStorage('profileApp_volume', {
            volume: this.currentVolume,
            isMuted: this.isMuted
        });
    }

    loadSavedVolume() {
        const saved = Utils.getStorage('profileApp_volume');
        if (saved) {
            this.currentVolume = saved.volume || 50;
            this.isMuted = saved.isMuted || false;
            
            if (this.slider) {
                this.slider.value = this.currentVolume;
            }
            
            this.updateVolumeIcon();
            this.updateIndicator();
            this.updateSliderTrack();
            this.applyVolumeToMedia();
            
            Utils.log(`Loaded saved volume: ${this.currentVolume}%`, 'info');
        }
    }

    // Public API methods
    getVolume() {
        return this.currentVolume;
    }

    getMuted() {
        return this.isMuted;
    }

    setMuted(muted) {
        if (muted !== this.isMuted) {
            this.toggleMute();
        }
    }

    handleClick(event) {
        // Handle component-specific clicks
        if (event.target.closest('.volume')) {
            this.toggleMute();
        }
    }

    handleResize() {
        // Adjust volume control for mobile
        if (Utils.isMobile() && this.container) {
            this.container.classList.add('mobile-optimized');
        }
    }

    destroy() {
        // Remove event listeners
        if (this.slider) {
            this.slider.removeEventListener('input', this.handleVolumeChange);
            this.slider.removeEventListener('change', this.saveVolume);
            this.slider.removeEventListener('wheel', this.handleWheel);
        }

        if (this.volumeIcon) {
            this.volumeIcon.removeEventListener('click', this.toggleMute);
        }

        document.removeEventListener('keydown', this.handleKeyboard);

        // Save current state before destroying
        this.saveVolume();

        Utils.log('Volume Control destroyed', 'info');
    }
}

// Make VolumeControl globally available
window.VolumeControl = VolumeControl;