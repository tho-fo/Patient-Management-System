/**
 * Helper Utilities
 * Common utility functions for the application
 */

/**
 * Format date for display
 */
function formatDate(dateString, format = 'MM/DD/YYYY') {
    try {
        const date = new Date(dateString);
        if (isNaN(date)) return dateString;
        
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return format
            .replace('DD', day)
            .replace('MM', month)
            .replace('YYYY', year)
            .replace('HH', hours)
            .replace('mm', minutes);
    } catch (error) {
        console.error('Error formatting date:', error);
        return dateString;
    }
}

/**
 * Format currency
 */
function formatCurrency(amount, currency = 'USD') {
    try {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        });
        return formatter.format(amount);
    } catch (error) {
        return `${currency} ${amount}`;
    }
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
    return !!localStorage.getItem('authToken');
}

/**
 * Get current user data
 */
function getCurrentUser() {
    try {
        const userData = localStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
    }
}

/**
 * Check if user has specific role
 */
function hasRole(role) {
    const user = getCurrentUser();
    return user && user.role === role;
}

/**
 * Check if user has any of the given roles
 */
function hasAnyRole(...roles) {
    const user = getCurrentUser();
    return user && roles.includes(user.role);
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info', duration = 3000) {
    const toastContainer = document.getElementById('toastContainer') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="bi bi-check-circle"></i>
            <span>${message}</span>
        </div>
        <button class="toast-close" type="button">
            <i class="bi bi-x"></i>
        </button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove after duration
    const timeout = setTimeout(() => {
        toast.remove();
    }, duration);
    
    // Remove on close click
    toast.querySelector('.toast-close').addEventListener('click', () => {
        clearTimeout(timeout);
        toast.remove();
    });
}

/**
 * Create toast container if it doesn't exist
 */
function createToastContainer() {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .toast-container {
                position: fixed;
                top: 80px;
                right: 20px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .toast {
                background: white;
                border-radius: 8px;
                padding: 16px;
                min-width: 300px;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                display: flex;
                align-items: center;
                justify-content: space-between;
                animation: slideInRight 0.3s ease-out;
            }
            
            @keyframes slideInRight {
                from {
                    opacity: 0;
                    transform: translateX(100px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            .toast-content {
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: 14px;
                flex: 1;
            }
            
            .toast-success { border-left: 4px solid #38a169; }
            .toast-success .bi { color: #38a169; }
            
            .toast-error { border-left: 4px solid #f56565; }
            .toast-error .bi { color: #f56565; }
            
            .toast-warning { border-left: 4px solid #f6ad55; }
            .toast-warning .bi { color: #f6ad55; }
            
            .toast-info { border-left: 4px solid #3182ce; }
            .toast-info .bi { color: #3182ce; }
            
            .toast-close {
                background: none;
                border: none;
                cursor: pointer;
                color: #718096;
                font-size: 16px;
                padding: 0 0 0 8px;
            }
            
            .toast-close:hover {
                color: #2d3748;
            }
        `;
        document.head.appendChild(style);
    }
    
    return container;
}

/**
 * Show confirmation dialog
 */
function showConfirm(message, onConfirm, onCancel) {
    const modal = document.createElement('div');
    modal.className = 'custom-modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <h5>Confirmation</h5>
            <p>${message}</p>
            <div class="modal-actions">
                <button class="btn btn-secondary btn-sm cancel-btn" type="button">Cancel</button>
                <button class="btn btn-primary btn-sm confirm-btn" type="button">Confirm</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.cancel-btn').addEventListener('click', () => {
        modal.remove();
        if (onCancel) onCancel();
    });
    
    modal.querySelector('.confirm-btn').addEventListener('click', () => {
        modal.remove();
        if (onConfirm) onConfirm();
    });
    
    modal.querySelector('.modal-overlay').addEventListener('click', () => {
        modal.remove();
        if (onCancel) onCancel();
    });
}

/**
 * Debounce function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Validate email
 */
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Validate phone number
 */
function validatePhone(phone) {
    const regex = /^[0-9]{10,15}$/;
    return regex.test(phone.replace(/[- ]/g, ''));
}

/**
 * Calculate age from birthdate
 */
function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    return age;
}

/**
 * Generate unique ID
 */
function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Copy text to clipboard
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard', 'success');
    } catch (error) {
        console.error('Error copying to clipboard:', error);
        showToast('Failed to copy', 'error');
    }
}

/**
 * Check if element is in viewport
 */
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Scroll to element smoothly
 */
function scrollToElement(element, offset = 0) {
    const top = element.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({
        top,
        behavior: 'smooth'
    });
}

/**
 * Export functions globally
 */
if (typeof window !== 'undefined') {
    window.helpers = {
        formatDate,
        formatCurrency,
        isAuthenticated,
        getCurrentUser,
        hasRole,
        hasAnyRole,
        showToast,
        showConfirm,
        debounce,
        throttle,
        validateEmail,
        validatePhone,
        calculateAge,
        generateId,
        copyToClipboard,
        isInViewport,
        scrollToElement
    };
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatDate,
        formatCurrency,
        isAuthenticated,
        getCurrentUser,
        hasRole,
        hasAnyRole,
        showToast,
        showConfirm,
        debounce,
        throttle,
        validateEmail,
        validatePhone,
        calculateAge,
        generateId,
        copyToClipboard,
        isInViewport,
        scrollToElement
    };
}
