// ===== UTILITY FUNCTIONS =====

class Utils {
    // Debounce function for performance optimization
    static debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    }

    // Throttle function for scroll events
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Generate random number between min and max
    static random(min, max) {
        return Math.random() * (max - min) + min;
    }

    // Generate random integer between min and max
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Linear interpolation
    static lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    // Map value from one range to another
    static map(value, inMin, inMax, outMin, outMax) {
        return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    }

    // Clamp value between min and max
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    // Check if element is in viewport
    static isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // Get element offset from top of page
    static getOffset(element) {
        let offsetTop = 0;
        let offsetLeft = 0;
        
        while (element) {
            offsetTop += element.offsetTop;
            offsetLeft += element.offsetLeft;
            element = element.offsetParent;
        }
        
        return { top: offsetTop, left: offsetLeft };
    }

    // Smooth scroll to element
    static scrollToElement(element, duration = 1000, offset = 0) {
        const targetPosition = this.getOffset(element).top - offset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = Utils.easeInOutQuad(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        }

        requestAnimationFrame(animation);
    }

    // Easing function for smooth animations
    static easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    // Format number with separators
    static formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // Generate unique ID
    static generateId(prefix = 'id') {
        return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Copy text to clipboard
    static async copyToClipboard(text) {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                return successful;
            }
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            return false;
        }
    }

    // Detect mobile device
    static isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // Detect touch device
    static isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    // Get browser info
    static getBrowserInfo() {
        const ua = navigator.userAgent;
        let browser = 'Unknown';
        
        if (ua.includes('Chrome')) browser = 'Chrome';
        else if (ua.includes('Firefox')) browser = 'Firefox';
        else if (ua.includes('Safari')) browser = 'Safari';
        else if (ua.includes('Edge')) browser = 'Edge';
        else if (ua.includes('Opera')) browser = 'Opera';
        
        return {
            name: browser,
            userAgent: ua,
            isMobile: this.isMobile(),
            isTouch: this.isTouchDevice()
        };
    }

    // Create element with attributes
    static createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'innerHTML') {
                element.innerHTML = value;
            } else if (key === 'textContent') {
                element.textContent = value;
            } else {
                element.setAttribute(key, value);
            }
        });
        
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof HTMLElement) {
                element.appendChild(child);
            }
        });
        
        return element;
    }

    // Wait for element to exist
    static waitForElement(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
                return;
            }

            const observer = new MutationObserver((mutations, obs) => {
                const element = document.querySelector(selector);
                if (element) {
                    obs.disconnect();
                    resolve(element);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Element ${selector} not found within ${timeout}ms`));
            }, timeout);
        });
    }

    // Animate element
    static animate(element, keyframes, options = {}) {
        const defaultOptions = {
            duration: 1000,
            easing: 'ease-in-out',
            fill: 'forwards'
        };
        
        const animationOptions = { ...defaultOptions, ...options };
        
        if (element.animate) {
            return element.animate(keyframes, animationOptions);
        } else {
            // Fallback for browsers without Web Animations API
            return new Promise((resolve) => {
                element.style.transition = `all ${animationOptions.duration}ms ${animationOptions.easing}`;
                
                const lastFrame = keyframes[keyframes.length - 1];
                Object.entries(lastFrame).forEach(([property, value]) => {
                    element.style[property] = value;
                });
                
                setTimeout(resolve, animationOptions.duration);
            });
        }
    }

    // Load image with promise
    static loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
            img.src = src;
        });
    }

    // Convert hex to rgba
    static hexToRgba(hex, alpha = 1) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // Get contrast color (black or white)
    static getContrastColor(hexcolor) {
        const r = parseInt(hexcolor.substr(1, 2), 16);
        const g = parseInt(hexcolor.substr(3, 2), 16);
        const b = parseInt(hexcolor.substr(5, 2), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? '#000000' : '#ffffff';
    }

    // Storage helpers
    static setStorage(key, value, type = 'localStorage') {
        try {
            const storage = type === 'sessionStorage' ? sessionStorage : localStorage;
            storage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Storage error:', error);
            return false;
        }
    }

    static getStorage(key, defaultValue = null, type = 'localStorage') {
        try {
            const storage = type === 'sessionStorage' ? sessionStorage : localStorage;
            const item = storage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Storage error:', error);
            return defaultValue;
        }
    }

    static removeStorage(key, type = 'localStorage') {
        try {
            const storage = type === 'sessionStorage' ? sessionStorage : localStorage;
            storage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage error:', error);
            return false;
        }
    }

    // Performance monitoring
    static measure(name, fn) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        console.log(`${name} took ${end - start} milliseconds`);
        return result;
    }

    // CSS transition end promise
    static transitionEnd(element, timeout = 1000) {
        return new Promise((resolve) => {
            const handleTransitionEnd = () => {
                element.removeEventListener('transitionend', handleTransitionEnd);
                resolve();
            };
            
            element.addEventListener('transitionend', handleTransitionEnd);
            
            // Fallback timeout
            setTimeout(() => {
                element.removeEventListener('transitionend', handleTransitionEnd);
                resolve();
            }, timeout);
        });
    }

    // Log with styling
    static log(message, type = 'info', data = null) {
        const styles = {
            info: 'color: #3498db; font-weight: bold;',
            success: 'color: #2ecc71; font-weight: bold;',
            warning: 'color: #f39c12; font-weight: bold;',
            error: 'color: #e74c3c; font-weight: bold;',
            debug: 'color: #9b59b6; font-weight: bold;'
        };

        console.log(`%c${message}`, styles[type] || styles.info, data || '');
    }
}

// Make Utils globally available
window.Utils = Utils;