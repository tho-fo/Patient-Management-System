/**
 * API Service
 * Handles all HTTP requests to the backend API
 */

class APIService {
    constructor() {
        this.baseURL = window.API_CONFIG?.BASE_URL || 'http://localhost:8000/api';
        this.timeout = window.API_CONFIG?.TIMEOUT || 30000;
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }
    
    /**
     * Get authorization token from localStorage
     */
    getAuthToken() {
        return localStorage.getItem('authToken');
    }
    
    /**
     * Get request headers with authentication
     */
    getHeaders() {
        const headers = { ...this.defaultHeaders };
        const token = this.getAuthToken();
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    }
    
    /**
     * Make an HTTP request
     */
    async request(endpoint, method = 'GET', data = null, options = {}) {
        try {
            const url = `${this.baseURL}${endpoint}`;
            
            const config = {
                method,
                headers: this.getHeaders(),
                timeout: this.timeout,
                ...options
            };
            
            // Add body for requests with data
            if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
                config.body = JSON.stringify(data);
            }
            
            // Add query parameters for GET requests
            if (data && method === 'GET') {
                const params = new URLSearchParams(data);
                return this.request(`${endpoint}?${params.toString()}`, method, null, options);
            }
            
            // Make the request
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);
            
            const response = await fetch(url, {
                ...config,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            // Parse response
            const contentType = response.headers.get('content-type');
            let responseData;
            
            if (contentType && contentType.includes('application/json')) {
                responseData = await response.json();
            } else {
                responseData = await response.text();
            }
            
            // Handle errors
            if (!response.ok) {
                return this.handleError(response.status, responseData);
            }
            
            return {
                success: true,
                status: response.status,
                data: responseData
            };
            
        } catch (error) {
            return this.handleException(error);
        }
    }
    
    /**
     * Handle HTTP error responses
     */
    handleError(status, responseData) {
        const errorMessage = typeof responseData === 'string' 
            ? responseData 
            : responseData?.message || 'An error occurred';
        
        // Check if token is invalid (401)
        if (status === 401) {
            // Clear auth data and redirect to login
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            // window.location.href = '/login.html'; // Uncomment if needed
        }
        
        return {
            success: false,
            status,
            message: errorMessage,
            data: responseData
        };
    }
    
    /**
     * Handle request exceptions
     */
    handleException(error) {
        let message = 'An error occurred';
        let code = 'NETWORK_ERROR';
        
        if (error.name === 'AbortError') {
            message = 'Request timeout';
            code = 'TIMEOUT_ERROR';
        } else if (error instanceof TypeError) {
            message = 'Unable to connect to the server';
            code = 'CONNECTION_ERROR';
        }
        
        console.error('API Error:', error);
        
        return {
            success: false,
            message,
            code,
            error
        };
    }
    
    // HTTP Methods
    
    /**
     * GET request
     */
    GET(endpoint, params = null) {
        return this.request(endpoint, 'GET', params);
    }
    
    /**
     * POST request
     */
    POST(endpoint, data = {}) {
        return this.request(endpoint, 'POST', data);
    }
    
    /**
     * PUT request
     */
    PUT(endpoint, data = {}) {
        return this.request(endpoint, 'PUT', data);
    }
    
    /**
     * PATCH request
     */
    PATCH(endpoint, data = {}) {
        return this.request(endpoint, 'PATCH', data);
    }
    
    /**
     * DELETE request
     */
    DELETE(endpoint) {
        return this.request(endpoint, 'DELETE');
    }
    
    /**
     * Upload file
     */
    async uploadFile(endpoint, file) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const token = this.getAuthToken();
            const headers = { 'Authorization': `Bearer ${token}` };
            
            const url = `${this.baseURL}${endpoint}`;
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: formData
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                return this.handleError(response.status, data);
            }
            
            return {
                success: true,
                status: response.status,
                data
            };
        } catch (error) {
            return this.handleException(error);
        }
    }
}

// Create singleton instance
const apiService = new APIService();

// Export service
if (typeof window !== 'undefined') {
    window.apiService = apiService;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APIService, apiService };
}
