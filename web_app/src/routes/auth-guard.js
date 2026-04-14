/**
 * Authentication Guard
 * Protects pages that require authentication
 */

(function() {
    // Check if user is authenticated
    function checkAuthentication() {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');

        // If no token or user data, redirect to login
        if (!token || !userData) {
            redirectToLogin();
            return false;
        }

        return true;
    }

    /**
     * Redirect to login page
     */
    function redirectToLogin() {
        // Show a loading screen briefly
        document.body.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <div style="text-align: center; color: white;">
                    <div class="spinner-border" style="width: 40px; height: 40px; border-width: 4px;" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p style="margin-top: 20px; font-family: sans-serif;">Redirecting to login...</p>
                </div>
            </div>
        `;

        // Redirect after a short delay
        setTimeout(() => {
            const loginUrl = '/web_app/src/features/auth/pages/login.html';
            if (window.location.href.includes(loginUrl)) {
                // Already on login page
                return;
            }
            window.location.href = loginUrl;
        }, 500);
    }

    /**
     * Check if current page requires authentication
     */
    function isProtectedPage() {
        const pathname = window.location.pathname;
        const unprotectedPages = [
            '/login.html',
            '/password-reset.html',
            '/forgot-password.html'
        ];

        return !unprotectedPages.some(page => pathname.includes(page));
    }

    // Run auth check on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            if (isProtectedPage()) {
                checkAuthentication();
            }
        });
    } else {
        // DOM is already loaded
        if (isProtectedPage()) {
            checkAuthentication();
        }
    }

    // Export for manual use
    if (typeof window !== 'undefined') {
        window.authGuard = {
            checkAuthentication,
            redirectToLogin,
            isProtectedPage
        };
    }
})();
