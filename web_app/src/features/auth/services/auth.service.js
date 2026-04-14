/**
 * Authentication Service
 * Handles all authentication-related API calls and logic
 */

class AuthService {
    constructor() {
        this.apiService = window.apiService || new APIService();
    }
    
    /**
     * Login user
     */
    async login(email, password) {
        try {
            const response = await this.apiService.POST('/auth/login', {
                email,
                password
            });
            
            if (response.success && response.data) {
                // Store auth token
                if (response.data.token) {
                    localStorage.setItem('authToken', response.data.token);
                }
                
                // Store user data
                if (response.data.user) {
                    localStorage.setItem('userData', JSON.stringify(response.data.user));
                }
                
                return {
                    success: true,
                    user: response.data.user,
                    token: response.data.token
                };
            } else {
                return {
                    success: false,
                    message: response.message || 'Login failed'
                };
            }
        } catch (error) {
            return {
                success: false,
                message: 'An error occurred during login',
                error
            };
        }
    }
    
    /**
     * Logout user
     */
    async logout() {
        try {
            // Call logout endpoint (optional)
            await this.apiService.POST('/auth/logout', {});
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            // Clear auth data regardless
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            localStorage.removeItem('refreshToken');
        }
    }
    
    /**
     * Register new user
     */
    async register(userData) {
        try {
            const response = await this.apiService.POST('/auth/register', userData);
            
            if (response.success) {
                return {
                    success: true,
                    user: response.data.user
                };
            } else {
                return {
                    success: false,
                    message: response.message || 'Registration failed'
                };
            }
        } catch (error) {
            return {
                success: false,
                message: 'An error occurred during registration',
                error
            };
        }
    }
    
    /**
     * Change password
     */
    async changePassword(oldPassword, newPassword) {
        try {
            const response = await this.apiService.POST('/auth/change-password', {
                oldPassword,
                newPassword
            });
            
            return {
                success: response.success,
                message: response.message
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to change password',
                error
            };
        }
    }
    
    /**
     * Request password reset
     */
    async requestPasswordReset(email) {
        try {
            const response = await this.apiService.POST('/auth/forgot-password', { email });
            
            return {
                success: response.success,
                message: response.message || 'Password reset link sent to your email'
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to send reset link',
                error
            };
        }
    }
    
    /**
     * Reset password with token
     */
    async resetPassword(token, newPassword) {
        try {
            const response = await this.apiService.POST('/auth/reset-password', {
                token,
                newPassword
            });
            
            return {
                success: response.success,
                message: response.message || 'Password reset successful'
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to reset password',
                error
            };
        }
    }
    
    /**
     * Refresh auth token
     */
    async refreshToken() {
        try {
            const response = await this.apiService.POST('/auth/refresh-token', {});
            
            if (response.success && response.data.token) {
                localStorage.setItem('authToken', response.data.token);
                return {
                    success: true,
                    token: response.data.token
                };
            } else {
                return {
                    success: false,
                    message: 'Failed to refresh token'
                };
            }
        } catch (error) {
            return {
                success: false,
                message: 'Token refresh failed',
                error
            };
        }
    }
    
    /**
     * Get current authenticated user
     */
    getCurrentUser() {
        try {
            const userData = localStorage.getItem('userData');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    }
    
    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!localStorage.getItem('authToken');
    }
    
    /**
     * Get auth token
     */
    getToken() {
        return localStorage.getItem('authToken');
    }
}

// Create singleton instance
const authService = new AuthService();

// Export service
if (typeof window !== 'undefined') {
    window.authService = authService;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AuthService, authService };
}
