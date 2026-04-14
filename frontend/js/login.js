/**
 * Patient Management System - Login Form JavaScript
 * Handles form validation and API communication
 */

// Global Configuration
const API_BASE_URL = 'http://localhost:8000/api'; // Adjust based on your backend URL
const AUTH_ENDPOINT = '/auth/login';

// DOM Elements
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const rememberMeCheckbox = document.getElementById('rememberMe');
const togglePasswordBtn = document.getElementById('togglePassword');
const loginBtn = document.getElementById('loginBtn');
const errorAlert = document.getElementById('errorAlert');
const errorMessage = document.getElementById('errorMessage');
const successAlert = document.getElementById('successAlert');
const loadingSpinner = document.getElementById('loadingSpinner');
const forgotPasswordLink = document.querySelector('.forgot-password-link');

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', function () {
    initializeForm();
    loadSavedEmail();
});

/**
 * Initialize form event listeners
 */
function initializeForm() {
    // Form submission
    loginForm.addEventListener('submit', handleLogin);

    // Toggle password visibility
    togglePasswordBtn.addEventListener('click', togglePasswordVisibility);

    // Real-time validation
    emailInput.addEventListener('blur', validateEmail);
    passwordInput.addEventListener('blur', validatePassword);

    // Clear errors on input
    emailInput.addEventListener('input', () => clearError('email'));
    passwordInput.addEventListener('input', () => clearError('password'));

    // Forgot password (placeholder)
    forgotPasswordLink.addEventListener('click', handleForgotPassword);
}

/**
 * Handle login form submission
 */
async function handleLogin(event) {
    event.preventDefault();

    // Validate form
    if (!validateForm()) {
        return;
    }

    // Get form values
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const rememberMe = rememberMeCheckbox.checked;

    // Show loading state
    showLoading(true);
    hideAlert();

    try {
        // Send login request to backend
        const response = await fetch(`${API_BASE_URL}${AUTH_ENDPOINT}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Login successful
            handleLoginSuccess(data, rememberMe, email);
        } else {
            // Login failed
            const errorMsg = data.message || 'Invalid email or password. Please try again.';
            showError(errorMsg);
            showLoading(false);
        }
    } catch (error) {
        // Network or parsing error
        console.error('Login error:', error);
        
        // Check if backend is running
        if (error instanceof TypeError && error.message.includes('fetch')) {
            showError('Unable to connect to the server. Please ensure the backend is running.');
        } else {
            showError('An error occurred during login. Please try again.');
        }
        
        showLoading(false);
    }
}

/**
 * Handle successful login
 */
function handleLoginSuccess(data, rememberMe, email) {
    showLoading(false);
    
    // Show success message
    showSuccess('Login successful! Redirecting...');
    
    // Save credentials if "Remember me" is checked
    if (rememberMe) {
        localStorage.setItem('savedEmail', email);
    } else {
        localStorage.removeItem('savedEmail');
    }

    // Store authentication token
    if (data.token) {
        localStorage.setItem('authToken', data.token);
    }

    // Store user information
    if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
    }

    // Redirect to dashboard after a short delay
    setTimeout(() => {
        // Adjust the redirect URL based on user role
        const redirectUrl = determineRedirectUrl(data.user);
        window.location.href = redirectUrl;
    }, 1500);
}

/**
 * Determine redirect URL based on user role
 */
function determineRedirectUrl(user) {
    const baseUrl = window.location.origin;
    
    if (user && user.role) {
        switch (user.role.toLowerCase()) {
            case 'admin':
                return `${baseUrl}/frontend/admin-dashboard.html`;
            case 'doctor':
                return `${baseUrl}/frontend/doctor-dashboard.html`;
            case 'receptionist':
                return `${baseUrl}/frontend/receptionist-dashboard.html`;
            case 'patient':
                return `${baseUrl}/frontend/patient-dashboard.html`;
            default:
                return `${baseUrl}/frontend/dashboard.html`;
        }
    }
    
    return `${baseUrl}/frontend/dashboard.html`;
}

/**
 * Validate entire form
 */
function validateForm() {
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();

    return isEmailValid && isPasswordValid;
}

/**
 * Validate email/username field
 */
function validateEmail() {
    const email = emailInput.value.trim();
    const emailError = document.getElementById('emailError');

    if (!email) {
        emailInput.classList.add('is-invalid');
        emailError.textContent = 'Email or username is required.';
        return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$|^[a-zA-Z0-9_]{3,}$/;
    if (!emailRegex.test(email)) {
        emailInput.classList.add('is-invalid');
        emailError.textContent = 'Please enter a valid email or username.';
        return false;
    }

    emailInput.classList.remove('is-invalid');
    emailInput.classList.add('is-valid');
    return true;
}

/**
 * Validate password field
 */
function validatePassword() {
    const password = passwordInput.value;
    const passwordError = document.getElementById('passwordError');

    if (!password) {
        passwordInput.classList.add('is-invalid');
        passwordError.textContent = 'Password is required.';
        return false;
    }

    if (password.length < 6) {
        passwordInput.classList.add('is-invalid');
        passwordError.textContent = 'Password must be at least 6 characters long.';
        return false;
    }

    passwordInput.classList.remove('is-invalid');
    passwordInput.classList.add('is-valid');
    return true;
}

/**
 * Toggle password visibility
 */
function togglePasswordVisibility() {
    const icon = togglePasswordBtn.querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('bi-eye');
        icon.classList.add('bi-eye-slash');
        togglePasswordBtn.title = 'Hide password';
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('bi-eye-slash');
        icon.classList.add('bi-eye');
        togglePasswordBtn.title = 'Show password';
    }
}

/**
 * Clear validation errors
 */
function clearError(fieldName) {
    if (fieldName === 'email') {
        emailInput.classList.remove('is-invalid', 'is-valid');
    } else if (fieldName === 'password') {
        passwordInput.classList.remove('is-invalid', 'is-valid');
    }
}

/**
 * Show error alert
 */
function showError(message) {
    errorMessage.textContent = message;
    errorAlert.classList.remove('d-none');
    errorAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Show success alert
 */
function showSuccess(message) {
    successAlert.querySelector('#successMessage').textContent = message;
    successAlert.classList.remove('d-none');
    successAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Hide alerts
 */
function hideAlert() {
    errorAlert.classList.add('d-none');
    successAlert.classList.add('d-none');
}

/**
 * Show/hide loading spinner
 */
function showLoading(isLoading) {
    if (isLoading) {
        loginBtn.disabled = true;
        loadingSpinner.classList.remove('d-none');
        loginBtn.classList.add('d-none');
    } else {
        loginBtn.disabled = false;
        loadingSpinner.classList.add('d-none');
        loginBtn.classList.remove('d-none');
    }
}

/**
 * Load saved email from localStorage
 */
function loadSavedEmail() {
    const savedEmail = localStorage.getItem('savedEmail');
    if (savedEmail) {
        emailInput.value = savedEmail;
        rememberMeCheckbox.checked = true;
        // Focus on password field for better UX
        passwordInput.focus();
    }
}

/**
 * Handle forgot password link
 */
function handleForgotPassword(event) {
    event.preventDefault();
    
    // Placeholder implementation
    // In a real system, this would redirect to a password reset page
    // or show a modal for password recovery
    
    const email = emailInput.value.trim();
    
    if (email) {
        alert(`Password reset link will be sent to: ${email}\n\nNote: This is a placeholder. Implement the actual password reset flow in your backend.`);
    } else {
        alert('Please enter your email address first.');
        emailInput.focus();
    }
}

/**
 * Optional: Check if user is already logged in on page load
 */
function checkExistingSession() {
    const authToken = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    if (authToken && user) {
        // User might already be logged in
        // Could redirect to dashboard or just proceed
        console.log('Existing session detected');
    }
}

/**
 * Logout function (for use in other pages after login)
 */
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('savedEmail'); // Optional
    window.location.href = window.location.origin + '/frontend/login.html';
}

// Export functions for use in other files if needed
window.logout = logout;
window.isUserLoggedIn = () => !!localStorage.getItem('authToken');
