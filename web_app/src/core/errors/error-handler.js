/**
 * Custom Error Handler
 * Centralized error handling for the application
 */

class AppError extends Error {
    constructor(message, statusCode = 500, code = 'APP_ERROR') {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.timestamp = new Date().toISOString();
        
        // Set the prototype explicitly for proper instanceof checks
        Object.setPrototypeOf(this, AppError.prototype);
    }
    
    toJSON() {
        return {
            message: this.message,
            statusCode: this.statusCode,
            code: this.code,
            timestamp: this.timestamp
        };
    }
}

class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed', code = 'UNAUTHORIZED') {
        super(message, 401, code);
        Object.setPrototypeOf(this, AuthenticationError.prototype);
    }
}

class ValidationError extends AppError {
    constructor(message = 'Validation failed', details = {}, code = 'VALIDATION_ERROR') {
        super(message, 400, code);
        this.details = details;
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
    
    toJSON() {
        return {
            ...super.toJSON(),
            details: this.details
        };
    }
}

class NotFoundError extends AppError {
    constructor(resource = 'Resource', code = 'NOT_FOUND') {
        super(`${resource} not found`, 404, code);
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

class ForbiddenError extends AppError {
    constructor(message = 'Access forbidden', code = 'FORBIDDEN') {
        super(message, 403, code);
        Object.setPrototypeOf(this, ForbiddenError.prototype);
    }
}

class NetworkError extends AppError {
    constructor(message = 'Network error occurred', code = 'NETWORK_ERROR') {
        super(message, 0, code);
        Object.setPrototypeOf(this, NetworkError.prototype);
    }
}

/**
 * Error Handler Utility
 */
class ErrorHandler {
    static handle(error) {
        // Log error in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Error:', error);
        }
        
        // Return structured error response
        return {
            success: false,
            message: this.getMessage(error),
            code: this.getCode(error),
            statusCode: this.getStatusCode(error)
        };
    }
    
    static getMessage(error) {
        if (error instanceof AppError) {
            return error.message;
        }
        if (error instanceof Error) {
            return error.message;
        }
        return 'An unknown error occurred';
    }
    
    static getCode(error) {
        if (error instanceof AppError) {
            return error.code;
        }
        return 'UNKNOWN_ERROR';
    }
    
    static getStatusCode(error) {
        if (error instanceof AppError) {
            return error.statusCode;
        }
        if (error instanceof TypeError) {
            return 400;
        }
        return 500;
    }
    
    static createFromResponse(responseData) {
        if (responseData.statusCode === 401) {
            return new AuthenticationError(responseData.message);
        }
        if (responseData.statusCode === 403) {
            return new ForbiddenError(responseData.message);
        }
        if (responseData.statusCode === 404) {
            return new NotFoundError(responseData.message);
        }
        if (responseData.statusCode === 400 && responseData.details) {
            return new ValidationError(responseData.message, responseData.details);
        }
        return new AppError(responseData.message, responseData.statusCode);
    }
}

// Export error classes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AppError,
        AuthenticationError,
        ValidationError,
        NotFoundError,
        ForbiddenError,
        NetworkError,
        ErrorHandler
    };
}
