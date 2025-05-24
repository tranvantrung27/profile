// ===== HEART ANIMATION COMPONENT =====

class HeartAnimation {
    constructor() {
        this.container = null;
        this.checkbox = null;
        this.svgContainer = null;
        this.likeCount = null;
        this.currentCount = 0;
        this.isLiked = false;
        this.floatingHearts = [];
        this.heartData = {
            totalLikes: 0,
            lastLiked: null,
            isLiked: false
        };
        
        this.init();
    }

    init() {
        this.createHeartComponent();
        this.setupEventListeners();
        this.loadHeartData();
        // Cập nhật số lượt thích ban đầu
        this.updateLikeCount();
        Utils.log('Heart Animation initialized', 'success');
    }

    createHeartComponent() {
        const targetContainer = document.getElementById('heart-component');
        if (!targetContainer) {
            Utils.log('Heart component container not found', 'warning');
            return;
        }

        // Create heart animation HTML
        const heartHTML = `
            <div class="heart-container" data-component="heartAnimation" title="Thích">
                <div class="heart-title">Bạn thích profile này?</div>
                <input type="checkbox" class="checkbox" id="Give-It-An-Id">
                <div class="svg-container">
                    <svg viewBox="0 0 24 24" class="svg-outline" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Zm-3.585,18.4a2.973,2.973,0,0,1-3.83,0C4.947,16.006,2,11.87,2,8.967a4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,11,8.967a1,1,0,0,0,2,0,4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,22,8.967C22,11.87,19.053,16.006,13.915,20.313Z"></path>
                    </svg>
                    <svg viewBox="0 0 24 24" class="svg-filled" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Z"></path>
                    </svg>
                    <svg class="svg-celebrate" width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                        <polygon points="10,10 20,20" fill="#ffd700"></polygon>
                        <polygon points="10,50 20,50" fill="#ffd700"></polygon>
                        <polygon points="20,80 30,70" fill="#ffd700"></polygon>
                        <polygon points="90,10 80,20" fill="#ffd700"></polygon>
                        <polygon points="90,50 80,50" fill="#ffd700"></polygon>
                        <polygon points="80,80 70,70" fill="#ffd700"></polygon>
                    </svg>
                </div>
                <div class="like-count">${this.currentCount}</div>
                <div class="floating-hearts"></div>
            </div>
        `;

        targetContainer.innerHTML = heartHTML;

        // Get references to created elements
        this.container = targetContainer.querySelector('.heart-container');
        this.checkbox = targetContainer.querySelector('.checkbox');
        this.svgContainer = targetContainer.querySelector('.svg-container');
        this.likeCount = targetContainer.querySelector('.like-count');
        this.floatingHeartsContainer = targetContainer.querySelector('.floating-hearts');
    }

    setupEventListeners() {
        if (!this.checkbox || !this.svgContainer) return;

        // Checkbox change event
        this.checkbox.addEventListener('change', (e) => {
            this.handleLikeToggle(e.target.checked);
        });

        // SVG container click (alternative to checkbox)
        this.svgContainer.addEventListener('click', (e) => {
            e.preventDefault();
            this.checkbox.checked = !this.checkbox.checked;
            this.checkbox.dispatchEvent(new Event('change'));
        });

        // Keyboard support
        this.svgContainer.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.checkbox.checked = !this.checkbox.checked;
                this.checkbox.dispatchEvent(new Event('change'));
            }
        });

        // Double click for extra hearts
        this.svgContainer.addEventListener('dblclick', (e) => {
            e.preventDefault();
            if (this.isLiked) {
                this.createBurstEffect();
            }
        });

        // Touch events for mobile
        if (Utils.isTouchDevice()) {
            this.setupTouchEvents();
        }

        // Setup entrance animation
        this.setupEntranceAnimation();
    }

    setupTouchEvents() {
        let touchCount = 0;
        let touchTimer = null;

        this.svgContainer.addEventListener('touchend', (e) => {
            touchCount++;
            
            if (touchTimer) {
                clearTimeout(touchTimer);
            }

            if (touchCount === 1) {
                touchTimer = setTimeout(() => {
                    // Single tap
                    touchCount = 0;
                }, 300);
            } else if (touchCount === 2) {
                // Double tap
                e.preventDefault();
                if (this.isLiked) {
                    this.createBurstEffect();
                }
                touchCount = 0;
                clearTimeout(touchTimer);
            }
        }, { passive: false });
    }

    setupEntranceAnimation() {
        if (!this.container) return;

        // Initial state
        this.container.style.opacity = '0';
        this.container.style.transform = 'translateY(30px) scale(0.8)';
        
        // Animate in after delay
        setTimeout(() => {
            this.container.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            this.container.style.opacity = '1';
            this.container.style.transform = 'translateY(0) scale(1)';
        }, 600);

        // Add subtle pulse animation
        this.addIdlePulse();
    }

    addIdlePulse() {
        if (!this.svgContainer) return;

        setInterval(() => {
            if (!this.isLiked) {
                this.svgContainer.style.animation = 'heartPulse 2s ease-in-out';
                setTimeout(() => {
                    this.svgContainer.style.animation = '';
                }, 2000);
            }
        }, 5000);
    }

    handleLikeToggle(liked) {
        this.isLiked = liked;
        
        if (liked) {
            this.performLike();
        } else {
            this.performUnlike();
        }

        this.updateHeartState();
        this.saveHeartData();
    }

    performLike() {
        // Gửi request tăng lượt thích
        fetch('http://localhost:3000/api/likes', {
            method: 'POST'
        })
        .then(() => {
            // Cập nhật số lượt thích mới
            this.updateLikeCount();
            
            // Tạo hiệu ứng
            this.createCelebrationEffect();
            this.createFloatingHearts();
            this.addHeartBeat();
        });

        // Haptic feedback on mobile
        if (Utils.isTouchDevice() && navigator.vibrate) {
            navigator.vibrate(50);
        }
    }

    performUnlike() {
        if (this.currentCount > 0) {
            this.currentCount--;
        }
        
        this.heartData.totalLikes = this.currentCount;
        this.heartData.isLiked = false;

        // Update count display
        this.updateLikeCount();

        // Add unlike animation
        this.addUnlikeAnimation();

        Utils.log('Heart unliked', 'info');
    }

    updateLikeCount() {
        if (!this.likeCount) return;

        // Lấy số lượt thích từ server
        fetch('http://localhost:3000/api/stats')
            .then(res => res.json())
            .then(data => {
                // Animate count change
                this.likeCount.style.transform = 'scale(1.3)';
                this.likeCount.textContent = this.formatCount(data.likes);
                
                setTimeout(() => {
                    this.likeCount.style.transform = 'scale(1)';
                }, 200);

                // Color animation based on count
                if (data.likes > 0) {
                    this.likeCount.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ff8a80 100%)';
                    this.likeCount.style.color = 'white';
                } else {
                    this.likeCount.style.background = 'rgba(255, 255, 255, 0.1)';
                    this.likeCount.style.color = 'rgba(255, 255, 255, 0.9)';
                }
            })
            .catch(err => console.error('Lỗi khi cập nhật số lượt thích:', err));
    }

    formatCount(count) {
        if (count >= 1000000) {
            return (count / 1000000).toFixed(1) + 'M';
        } else if (count >= 1000) {
            return (count / 1000).toFixed(1) + 'K';
        }
        return count.toString();
    }

    updateHeartState() {
        if (!this.svgContainer) return;

        const outline = this.svgContainer.querySelector('.svg-outline');
        const filled = this.svgContainer.querySelector('.svg-filled');

        if (this.isLiked) {
            outline.style.opacity = '0';
            outline.style.transform = 'translate(-50%, -50%) scale(0)';
            filled.style.opacity = '1';
            filled.style.transform = 'translate(-50%, -50%) scale(1)';
        } else {
            outline.style.opacity = '1';
            outline.style.transform = 'translate(-50%, -50%) scale(1)';
            filled.style.opacity = '0';
            filled.style.transform = 'translate(-50%, -50%) scale(0)';
        }
    }

    createCelebrationEffect() {
        const celebrate = this.svgContainer?.querySelector('.svg-celebrate');
        if (!celebrate) return;

        celebrate.style.opacity = '1';
        celebrate.style.animation = 'celebrate 0.8s ease-out';

        setTimeout(() => {
            celebrate.style.opacity = '0';
            celebrate.style.animation = '';
        }, 800);
    }

    createFloatingHearts() {
        if (!this.floatingHeartsContainer) return;

        const heartCount = Utils.randomInt(3, 6);
        
        for (let i = 0; i < heartCount; i++) {
            setTimeout(() => {
                this.createSingleFloatingHeart();
            }, i * 100);
        }
    }

    createSingleFloatingHeart() {
        const heart = Utils.createElement('div', {
            className: 'floating-heart',
            innerHTML: '❤️',
            style: `
                position: absolute;
                font-size: ${Utils.random(1, 2)}rem;
                left: ${Utils.random(-20, 20)}px;
                opacity: 0;
                pointer-events: none;
                z-index: 10;
                animation: floatHeart 2s ease-out forwards;
            `
        });

        this.floatingHeartsContainer.appendChild(heart);

        // Remove after animation
        setTimeout(() => {
            if (heart.parentNode) {
                heart.remove();
            }
        }, 2000);
    }

    createBurstEffect() {
        // Create multiple hearts in a burst pattern
        const burstCount = Utils.randomInt(8, 12);
        
        for (let i = 0; i < burstCount; i++) {
            const angle = (360 / burstCount) * i;
            this.createBurstHeart(angle);
        }

        // Screen shake effect
        this.addScreenShake();
    }

    createBurstHeart(angle) {
        const heart = Utils.createElement('div', {
            className: 'burst-heart',
            innerHTML: '💖',
            style: `
                position: absolute;
                font-size: 1.5rem;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                opacity: 1;
                pointer-events: none;
                z-index: 15;
            `
        });

        this.container.appendChild(heart);

        // Calculate movement based on angle
        const distance = 80;
        const radians = (angle * Math.PI) / 180;
        const deltaX = Math.cos(radians) * distance;
        const deltaY = Math.sin(radians) * distance;

        // Animate burst
        Utils.animate(heart, [
            { 
                transform: 'translate(-50%, -50%) scale(1)',
                opacity: 1 
            },
            { 
                transform: `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px)) scale(0)`,
                opacity: 0 
            }
        ], {
            duration: 800,
            easing: 'ease-out'
        }).then(() => {
            if (heart.parentNode) {
                heart.remove();
            }
        });
    }

    addHeartBeat() {
        if (!this.svgContainer) return;

        this.svgContainer.style.animation = 'heartBeat 0.6s ease-in-out';
        
        setTimeout(() => {
            this.svgContainer.style.animation = '';
        }, 600);
    }

    addUnlikeAnimation() {
        if (!this.svgContainer) return;

        this.svgContainer.style.animation = 'heartShrink 0.3s ease-in-out';
        
        setTimeout(() => {
            this.svgContainer.style.animation = '';
        }, 300);
    }

    addScreenShake() {
        document.body.style.animation = 'screenShake 0.5s ease-in-out';
        
        setTimeout(() => {
            document.body.style.animation = '';
        }, 500);

        // Add shake animation if not exists
        if (!document.getElementById('shake-styles')) {
            const style = Utils.createElement('style', {
                id: 'shake-styles',
                innerHTML: `
                    @keyframes screenShake {
                        0%, 100% { transform: translateX(0); }
                        10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
                        20%, 40%, 60%, 80% { transform: translateX(2px); }
                    }
                    @keyframes heartShrink {
                        0% { transform: scale(1); }
                        50% { transform: scale(0.8); }
                        100% { transform: scale(1); }
                    }
                `
            });
            document.head.appendChild(style);
        }
    }

    saveHeartData() {
        Utils.setStorage('profileApp_heartData', this.heartData);
    }

    loadHeartData() {
        const saved = Utils.getStorage('profileApp_heartData');
        if (saved) {
            this.heartData = { ...this.heartData, ...saved };
            this.currentCount = this.heartData.totalLikes || 0;
            this.isLiked = this.heartData.isLiked || false;
            
            // Update UI to reflect loaded state
            if (this.checkbox) {
                this.checkbox.checked = this.isLiked;
            }
            
            this.updateHeartState();
            this.updateLikeCount();
            
            Utils.log(`Loaded heart data: ${this.currentCount} likes`, 'info');
        }
    }

    // Milestone celebrations
    checkMilestones() {
        const milestones = [1, 5, 10, 25, 50, 100, 500, 1000];
        
        if (milestones.includes(this.currentCount)) {
            this.celebrateMilestone(this.currentCount);
        }
    }

    celebrateMilestone(count) {
        // Create special milestone effect
        const milestone = Utils.createElement('div', {
            className: 'milestone-celebration',
            innerHTML: `
                <div class="milestone-content">
                    <h3>🎉 Cột mốc ${count} lượt thích! 🎉</h3>
                    <p>Cảm ơn bạn đã ủng hộ!</p>
                </div>
            `,
            style: `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0);
                background: linear-gradient(135deg, #ff6b6b, #ffa500);
                color: white;
                padding: 2rem;
                border-radius: 20px;
                text-align: center;
                z-index: 10000;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                transition: transform 0.3s ease;
            `
        });

        document.body.appendChild(milestone);

        // Animate in
        setTimeout(() => {
            milestone.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 10);

        // Auto remove after 3 seconds
        setTimeout(() => {
            milestone.style.transform = 'translate(-50%, -50%) scale(0)';
            setTimeout(() => {
                if (milestone.parentNode) {
                    milestone.remove();
                }
            }, 300);
        }, 3000);

        // Create confetti effect
        this.createConfetti();
    }

    createConfetti() {
        const colors = ['#ff6b6b', '#ffa500', '#667eea', '#764ba2', '#f093fb'];
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = Utils.createElement('div', {
                    className: 'confetti',
                    style: `
                        position: fixed;
                        width: 10px;
                        height: 10px;
                        background: ${colors[Utils.randomInt(0, colors.length - 1)]};
                        left: ${Utils.random(0, 100)}vw;
                        top: -10px;
                        z-index: 9999;
                        animation: confettiFall ${Utils.random(2, 4)}s linear;
                    `
                });

                document.body.appendChild(confetti);

                setTimeout(() => {
                    if (confetti.parentNode) {
                        confetti.remove();
                    }
                }, 4000);
            }, i * 50);
        }

        // Add confetti animation if not exists
        if (!document.getElementById('confetti-styles')) {
            const style = Utils.createElement('style', {
                id: 'confetti-styles',
                innerHTML: `
                    @keyframes confettiFall {
                        to {
                            transform: translateY(100vh) rotate(360deg);
                        }
                    }
                `
            });
            document.head.appendChild(style);
        }
    }

    // Public API methods
    like() {
        if (!this.isLiked) {
            this.checkbox.checked = true;
            this.checkbox.dispatchEvent(new Event('change'));
        }
    }

    unlike() {
        if (this.isLiked) {
            this.checkbox.checked = false;
            this.checkbox.dispatchEvent(new Event('change'));
        }
    }

    toggleLike() {
        this.checkbox.checked = !this.checkbox.checked;
        this.checkbox.dispatchEvent(new Event('change'));
    }

    getLikeCount() {
        return this.currentCount;
    }

    isCurrentlyLiked() {
        return this.isLiked;
    }

    setLikeCount(count) {
        this.currentCount = Math.max(0, count);
        this.heartData.totalLikes = this.currentCount;
        this.updateLikeCount();
        this.saveHeartData();
    }

    getHeartData() {
        return { ...this.heartData };
    }

    handleClick(event) {
        // Handle component-specific clicks
        if (event.target.closest('.svg-container')) {
            this.addClickEffect();
        }
    }

    addClickEffect() {
        if (!this.svgContainer) return;

        // Add temporary scale effect
        this.svgContainer.style.transform = 'scale(0.9)';
        setTimeout(() => {
            this.svgContainer.style.transform = 'scale(1)';
        }, 100);
    }

    handleResize() {
        // Adjust heart size for mobile
        if (Utils.isMobile() && this.container) {
            this.container.classList.add('mobile-optimized');
        }
    }

    destroy() {
        // Save current state
        this.saveHeartData();

        // Clear any running animations
        if (this.svgContainer) {
            this.svgContainer.style.animation = '';
        }

        // Remove any floating elements
        const floatingElements = document.querySelectorAll('.floating-heart, .burst-heart, .milestone-celebration, .confetti');
        floatingElements.forEach(el => el.remove());

        // Remove event listeners
        if (this.checkbox) {
            this.checkbox.removeEventListener('change', this.handleLikeToggle);
        }

        if (this.svgContainer) {
            this.svgContainer.removeEventListener('click', this.toggleLike);
            this.svgContainer.removeEventListener('keydown', this.handleKeyboard);
            this.svgContainer.removeEventListener('dblclick', this.createBurstEffect);
        }

        Utils.log('Heart Animation destroyed', 'info');
    }
}

// Make HeartAnimation globally available
window.HeartAnimation = HeartAnimation;