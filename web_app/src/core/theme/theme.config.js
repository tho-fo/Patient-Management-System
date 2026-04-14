/**
 * Theme Configuration
 * Centralized theme variables for consistent styling
 */

const THEME_CONFIG = {
    // Primary Colors
    COLORS: {
        PRIMARY: '#667eea',
        PRIMARY_DARK: '#764ba2',
        PRIMARY_LIGHT: '#a78bfa',
        
        SECONDARY: '#2d3748',
        SUCCESS: '#38a169',
        WARNING: '#f6ad55',
        DANGER: '#f56565',
        INFO: '#3182ce',
        
        // Neutral Colors
        WHITE: '#ffffff',
        LIGHT: '#f7fafc',
        GRAY_50: '#f7fafc',
        GRAY_100: '#edf2f7',
        GRAY_200: '#e2e8f0',
        GRAY_300: '#cbd5e0',
        GRAY_400: '#a0aec0',
        GRAY_500: '#718096',
        GRAY_600: '#4a5568',
        GRAY_700: '#2d3748',
        GRAY_800: '#1a202c',
        DARK: '#1a202c',
        
        // Status Colors
        PENDING: '#f6ad55',
        COMPLETED: '#38a169',
        CANCELLED: '#f56565',
        CONFIRMED: '#3182ce'
    },
    
    // Typography
    TYPOGRAPHY: {
        FONTS: {
            DEFAULT: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            MONO: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace"
        },
        
        SIZES: {
            XS: '12px',
            SM: '14px',
            BASE: '16px',
            LG: '18px',
            XL: '20px',
            '2XL': '24px',
            '3XL': '30px',
            '4XL': '36px'
        },
        
        WEIGHTS: {
            LIGHT: 300,
            NORMAL: 400,
            MEDIUM: 500,
            SEMIBOLD: 600,
            BOLD: 700,
            EXTRABOLD: 800
        },
        
        LINE_HEIGHTS: {
            TIGHT: 1.25,
            NORMAL: 1.5,
            RELAXED: 1.75,
            LOOSE: 2
        }
    },
    
    // Spacing
    SPACING: {
        XS: '4px',
        SM: '8px',
        MD: '16px',
        LG: '24px',
        XL: '32px',
        '2XL': '48px',
        '3XL': '64px'
    },
    
    // Shadows
    SHADOWS: {
        NONE: 'none',
        SM: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        BASE: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        MD: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        LG: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        XL: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },
    
    // Border Radius
    RADIUS: {
        NONE: '0',
        SM: '4px',
        MD: '8px',
        LG: '12px',
        XL: '16px',
        FULL: '9999px'
    },
    
    // Transitions
    TRANSITIONS: {
        FAST: '150ms ease-in-out',
        BASE: '300ms ease-in-out',
        SLOW: '500ms ease-in-out'
    },
    
    // Breakpoints (Responsive)
    BREAKPOINTS: {
        XS: '0px',
        SM: '576px',
        MD: '768px',
        LG: '992px',
        XL: '1200px',
        XXL: '1400px'
    },
    
    // Z-Index Scale
    ZINDEX: {
        HIDE: -1,
        BASE: 0,
        DROPDOWN: 1000,
        STICKY: 1020,
        FIXED: 1030,
        MODAL_BACKDROP: 1040,
        MODAL: 1050,
        POPOVER: 1060,
        TOOLTIP: 1070,
        NOTIFICATION: 2000
    },
    
    // Component Sizes
    COMPONENT_SIZES: {
        BTN_SM: '32px',
        BTN_MD: '40px',
        BTN_LG: '48px',
        
        INPUT_SM: '32px',
        INPUT_MD: '40px',
        INPUT_LG: '48px',
        
        ICON_SM: '16px',
        ICON_MD: '24px',
        ICON_LG: '32px',
        
        AVATAR_SM: '32px',
        AVATAR_MD: '40px',
        AVATAR_LG: '64px'
    }
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { THEME_CONFIG };
}
