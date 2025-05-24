// ===== BACKGROUND MANAGER =====

class BackgroundManager {
    constructor() {
        this.video = null;
        this.isPlaying = false;
        this.isMuted = true;
        this.init();
    }

    init() {
        this.setupVideo();
        this.setupEventListeners();
        Utils.log('Background Manager initialized', 'success');
    }

    setupVideo() {
        this.video = document.getElementById('background-video');
        
        if (!this.video) {
            Utils.log('Background video element not found', 'warning');
            return;
        }

        // Set initial properties
        this.video.muted = this.isMuted;
        this.video.loop = true;
        this.video.playsinline = true;
        this.video.preload = 'metadata';

        // Handle video loading states
        this.video.addEventListener('loadstart', () => {
            Utils.log('Video loading started', 'info');
        });

        this.video.addEventListener('loadedmetadata', () => {
            Utils.log('Video metadata loaded', 'info');
            this.optimizeVideoPlayback();
        });

        this.video.addEventListener('loadeddata', () => {
            Utils.log('Video data loaded', 'info');
        });

        this.video.addEventListener('canplay', () => {
            Utils.log('Video can start playing', 'info');
            this.handleVideoReady();
        });

        this.video.addEventListener('canplaythrough', () => {
            Utils.log('Video can play through', 'success');
        });

        // Handle errors
        this.video.addEventListener('error', (e) => {
            Utils.log('Video error occurred', 'error', e);
            this.handleVideoError();
        });

        // Handle video events
        this.video.addEventListener('play', () => {
            this.isPlaying = true;
            Utils.log('Video started playing', 'info');
        });

        this.video.addEventListener('pause', () => {
            this.isPlaying = false;
            Utils.log('Video paused', 'info');
        });

        this.video.addEventListener('ended', () => {
            this.isPlaying = false;
            Utils.log('Video ended', 'info');
        });
    }

    setupEventListeners() {
        // Page visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });

        // Window focus/blur
        window.addEventListener('focus', () => {
            this.resume();
        });

        window.addEventListener('blur', () => {
            this.pause();
        });

        // Connection change for mobile data saving
        if ('connection' in navigator) {
            navigator.connection.addEventListener('change', () => {
                this.handleConnectionChange();
            });
        }
    }

    optimizeVideoPlayback() {
        if (!this.video) return;

        // Reduce quality on slow connections
        if ('connection' in navigator) {
            const connection = navigator.connection;
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                this.video.style.filter = 'blur(2px)';
                Utils.log('Video quality reduced for slow connection', 'warning');
            }
        }

        // Reduce frame rate on mobile
        if (Utils.isMobile()) {
            this.video.style.filter = 'brightness(0.8) contrast(1.1)';
        }
    }

    handleVideoReady() {
        // Add fade-in effect
        this.video.style.opacity = '0';
        this.video.style.transition = 'opacity 1s ease-in-out';
        
        setTimeout(() => {
            this.video.style.opacity = '1';
        }, 100);
    }

    handleVideoError() {
        // Show fallback background
        this.showFallbackBackground();
        Utils.log('Switched to fallback background', 'warning');
    }

    showFallbackBackground() {
        // Create fallback gradient background
        const fallbackBg = Utils.createElement('div', {
            className: 'fallback-background',
            style: `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: linear-gradient(135deg, 
                    #667eea 0%, 
                    #764ba2 25%, 
                    #f093fb 50%, 
                    #f5576c 75%, 
                    #4facfe 100%);
                background-size: 400% 400%;
                animation: gradientShift 15s ease infinite;
                z-index: -2;
            `
        });

        // Add animation keyframes
        if (!document.getElementById('fallback-styles')) {
            const style = Utils.createElement('style', {
                id: 'fallback-styles',
                innerHTML: `
                    @keyframes gradientShift {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                `
            });
            document.head.appendChild(style);
        }

        document.body.appendChild(fallbackBg);

        // Hide video element
        if (this.video) {
            this.video.style.display = 'none';
        }
    }

    handleConnectionChange() {
        if (!('connection' in navigator)) return;

        const connection = navigator.connection;
        
        // Pause video on very slow connections
        if (connection.effectiveType === 'slow-2g') {
            this.pause();
            Utils.log('Video paused due to slow connection', 'warning');
        } else if (connection.effectiveType === '4g' && !this.isPlaying) {
            this.play();
            Utils.log('Video resumed on fast connection', 'info');
        }
    }

    startVideo() {
        if (!this.video) return Promise.resolve();

        return this.play().catch(error => {
            Utils.log('Video autoplay failed', 'warning', error);
            this.handleAutoplayFailure();
        });
    }

    async play() {
        if (!this.video) return;

        try {
            await this.video.play();
            this.isPlaying = true;
            Utils.log('Video playing', 'success');
        } catch (error) {
            // Autoplay might be blocked
            throw error;
        }
    }

    pause() {
        if (!this.video || !this.isPlaying) return;

        this.video.pause();
        this.isPlaying = false;
    }

    resume() {
        if (!this.video || this.isPlaying) return;

        this.play().catch(error => {
            Utils.log('Resume failed', 'warning', error);
        });
    }

    togglePlayPause() {
        if (!this.video) return;

        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    mute() {
        if (!this.video) return;

        this.video.muted = true;
        this.isMuted = true;
    }

    unmute() {
        if (!this.video) return;

        this.video.muted = false;
        this.isMuted = false;
    }

    toggleMute() {
        if (this.isMuted) {
            this.unmute();
        } else {
            this.mute();
        }
    }

    setVolume(volume) {
        if (!this.video) return;

        this.video.volume = Utils.clamp(volume, 0, 1);
        
        // Auto unmute if volume is set above 0
        if (volume > 0 && this.isMuted) {
            this.unmute();
        }
    }

    handleAutoplayFailure() {
        // Show play button overlay
        this.showPlayButton();
    }

    showPlayButton() {
        const playButton = Utils.createElement('div', {
            className: 'video-play-button',
            innerHTML: `
                <button class="play-btn">
                    <i class="fas fa-play"></i>
                    <span>Nhấp để phát video</span>
                </button>
            `,
            style: `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 1000;
                text-align: center;
            `
        });

        const button = playButton.querySelector('.play-btn');
        button.style.cssText = `
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid rgba(255, 255, 255, 0.5);
            color: white;
            padding: 1rem 2rem;
            border-radius: 50px;
            font-size: 1.1rem;
            cursor: pointer;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        `;

        button.addEventListener('click', () => {
            this.play().then(() => {
                playButton.remove();
            });
        });

        document.body.appendChild(playButton);
    }

    // Public API
    getCurrentTime() {
        return this.video ? this.video.currentTime : 0;
    }

    getDuration() {
        return this.video ? this.video.duration : 0;
    }

    seek(time) {
        if (!this.video) return;
        this.video.currentTime = Utils.clamp(time, 0, this.getDuration());
    }

    getPlaybackRate() {
        return this.video ? this.video.playbackRate : 1;
    }

    setPlaybackRate(rate) {
        if (!this.video) return;
        this.video.playbackRate = Utils.clamp(rate, 0.25, 4);
    }

    isVideoPlaying() {
        return this.isPlaying;
    }

    isVideoMuted() {
        return this.isMuted;
    }

    handleResize() {
        // Optimize video for new viewport size
        if (this.video && Utils.isMobile()) {
            this.optimizeVideoPlayback();
        }
    }

    destroy() {
        if (this.video) {
            this.pause();
            this.video.src = '';
            this.video.load();
        }

        // Remove event listeners
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        window.removeEventListener('focus', this.handleFocus);
        window.removeEventListener('blur', this.handleBlur);

        Utils.log('Background Manager destroyed', 'info');
    }
}

// Make BackgroundManager globally available
window.BackgroundManager = BackgroundManager;