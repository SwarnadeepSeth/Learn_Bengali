// Utils Module - Bengali Learning App
// Utility functions and helpers

const Utils = {
    // DOM manipulation utilities
    querySelector: (selector, parent = document) => parent.querySelector(selector),
    querySelectorAll: (selector, parent = document) => parent.querySelectorAll(selector),

    // Event handling
    addEvent: (element, event, handler) => {
        if (element) {
            element.addEventListener(event, handler);
        }
    },

    removeEvent: (element, event, handler) => {
        if (element) {
            element.removeEventListener(event, handler);
        }
    },

    // Animation utilities
    fadeIn: (element, duration = 300) => {
        if (!element) return Promise.resolve();

        return new Promise(resolve => {
            element.style.opacity = '0';
            element.style.display = 'block';

            let start = performance.now();
            const fade = (timestamp) => {
                const elapsed = timestamp - start;
                const progress = Math.min(elapsed / duration, 1);

                element.style.opacity = progress;

                if (progress < 1) {
                    requestAnimationFrame(fade);
                } else {
                    resolve();
                }
            };
            requestAnimationFrame(fade);
        });
    },

    fadeOut: (element, duration = 300) => {
        if (!element) return Promise.resolve();

        return new Promise(resolve => {
            let start = performance.now();
            const startOpacity = parseFloat(getComputedStyle(element).opacity) || 1;

            const fade = (timestamp) => {
                const elapsed = timestamp - start;
                const progress = Math.min(elapsed / duration, 1);

                element.style.opacity = startOpacity * (1 - progress);

                if (progress < 1) {
                    requestAnimationFrame(fade);
                } else {
                    element.style.display = 'none';
                    resolve();
                }
            };
            requestAnimationFrame(fade);
        });
    },

    // Progress calculation
    calculateProgress: (completed, total) => {
        if (total === 0) return 0;
        return Math.round((completed / total) * 100);
    },

    // Memory storage wrapper (no localStorage in sandbox)
    saveToStorage: (key, data) => {
        try {
            if (!window.memoryStorage) {
                window.memoryStorage = {};
            }
            window.memoryStorage[key] = JSON.stringify(data);
        } catch (e) {
            console.warn('Storage not available:', e);
        }
    },

    loadFromStorage: (key) => {
        try {
            if (!window.memoryStorage) {
                return null;
            }
            const data = window.memoryStorage[key];
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.warn('Storage not available:', e);
            return null;
        }
    },

    // String utilities
    capitalize: (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    // Number utilities
    clamp: (num, min, max) => Math.min(Math.max(num, min), max),

    // Array utilities
    shuffleArray: (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    // Delay utility for smooth transitions
    delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

    // Debounce utility
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Create element with attributes
    createElement: (tag, attributes = {}, children = []) => {
        const element = document.createElement(tag);

        Object.keys(attributes).forEach(key => {
            if (key === 'className') {
                element.className = attributes[key];
            } else if (key === 'innerHTML') {
                element.innerHTML = attributes[key];
            } else {
                element.setAttribute(key, attributes[key]);
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
    },

    // Format time (minutes)
    formatTime: (minutes) => {
        if (minutes < 60) {
            return `${minutes} min${minutes !== 1 ? 's' : ''}`;
        }
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}m`;
    },

    // Validate lesson data
    validateLessonData: (lesson) => {
        const requiredFields = ['id', 'title', 'category', 'teaching_content'];
        return requiredFields.every(field => lesson && lesson.hasOwnProperty(field));
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
