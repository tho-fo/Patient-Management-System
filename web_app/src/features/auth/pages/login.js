/**
 * Login Page Script
 * Handles login form logic and authentication
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeLoginForm();
    loadSavedEmail();
});

// Form Elements
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

/**
 * Initialize login form event listeners
 */
function initializeLoginForm() {
    // Form submission
    loginForm.addEventListener('submit', handleLogin);

    // Toggle password visibility
    togglePasswordBtn.addEventListener('click', togglePasswordVisibility);

    // Real-time validation
    emailInput.addEventListener('blur', validateEmail);
    passwordInput.addEventListener('blur', validatePassword);

    // Clear errors on input
    emailInput.addEventListener('input', () => clearInputError('email'));
    passwordInput.addEventListener('input', () => clearInputError('password'));

    // Forgot password link
    forgotPasswordLink.addEventListener('click', handleForgotPassword);

    // Enter key to submit
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            loginForm.dispatchEvent(new Event('submit'));
        }
    });
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

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const rememberMe = rememberMeCheckbox.checked;

    // Show loading state
    showLoading(true);
    hideAlerts();

    try {
        // Call auth service
        const result = await authService.login(email, password);

        if (result.success) {
            // Save email if remember me is checked
            if (rememberMe) {
                localStorage.setItem('savedEmail', email);
            } else {
                localStorage.removeItem('savedEmail');
            }

            // Show success message
            showSuccess('Login successful! Redirecting...');

            // Redirect to dashboard after a short delay
            setTimeout(() => {
                redirectToDashboard(result.user);
            }, 1500);
        } else {
            showError(result.message || 'Login failed. Please check your credentials.');
            showLoading(false);
        }
    } catch (error) {
        showError('An error occurred during login. Please try again.');
        showLoading(false);
        console.error('Login error:', error);
    }
}

/**
 * Redirect to appropriate dashboard based on user role
 */
function redirectToDashboard(user) {
    const baseUrl = window.location.origin;
    let dashboardUrl = `${baseUrl}/dashboard.html`;

    if (user && user.role) {
        switch (user.role.toLowerCase()) {
            case 'admin':
                dashboardUrl = `${baseUrl}/dashboard.html?role=admin`;
                break;
            case 'doctor':
                dashboardUrl = `${baseUrl}/dashboard.html?role=doctor`;
                break;
            case 'receptionist':
                dashboardUrl = `${baseUrl}/dashboard.html?role=receptionist`;
                break;
            case 'patient':
                dashboardUrl = `${baseUrl}/dashboard.html?role=patient`;
                break;
        }
    }

    window.location.href = dashboardUrl;
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

    // Email or username validation (email format or 3+ characters for username)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameValid = email.length >= 3;

    if (!emailRegex.test(email) && !usernameValid) {
        emailInput.classList.add('is-invalid');
        emailError.textContent = 'Please enter a valid email or username (3+ characters).';
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
        passwordError.textContent = 'Password must be at least 6 characters.';
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
 * Clear input error styles
 */
function clearInputError(fieldName) {
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
    document.getElementById('successMessage').textContent = message;
    successAlert.classList.remove('d-none');
    successAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Hide all alerts
 */
function hideAlerts() {
    errorAlert.classList.add('d-none');
    successAlert.classList.add('d-none');
}

/**
 * Show/hide loading state
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

    const email = emailInput.value.trim();

    if (!email) {
        showError('Please enter your email address to reset your password.');
        return;
    }

    // In a real system, this would redirect to a password reset page
    // or show a modal to send reset link
    showError('Password reset feature coming soon. Please contact administrator for assistance.');

    // Could redirect to reset password page:
    // window.location.href = '/password-reset.html?email=' + encodeURIComponent(email);
}

/**
 * Logout function (for use throughout the app)
 */
async function logout() {
    try {
        await authService.logout();
        window.location.href = '/web_app/src/features/auth/pages/login.html';
    } catch (error) {
        console.error('Logout error:', error);
        // Still clear data and redirect
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        window.location.href = '/web_app/src/features/auth/pages/login.html';
    }
}

/**
 * Check if user is already logged in
 */
function checkExistingSession() {
    if (authService.isAuthenticated()) {
        // Redirect to dashboard
        redirectToDashboard(authService.getCurrentUser());
    }
}

// Check for existing session on page load
checkExistingSession();

// Export functions globally
window.logout = logout;
