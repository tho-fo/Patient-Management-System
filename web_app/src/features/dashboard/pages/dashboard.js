/**
 * Dashboard Page Script
 * Handles dashboard initialization and data loading
 */

// Dashboard state
const dashboardState = {
    loadingContainer: document.getElementById('loadingContainer'),
    dashboardContent: document.getElementById('dashboardContent'),
    initialized: false,
    components: {
        sidebar: document.getElementById('appSidebar'),
        header: document.getElementById('appHeader')
    }
};

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

/**
 * Initialize dashboard
 */
async function initializeDashboard() {
    try {
        // Load shared components (sidebar and header)
        await loadSharedComponents();
        
        // Set up sidebar navigation
        setupSidebarNavigation();
        setupHeaderNavigation();
        
        // Load dashboard data
        await loadDashboardData();
        
        // Show dashboard content
        dashboardState.loadingContainer.classList.add('d-none');
        dashboardState.dashboardContent.classList.remove('d-none');
        
        dashboardState.initialized = true;
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showErrorState();
    }
}

/**
 * Load shared components (sidebar and header)
 */
async function loadSharedComponents() {
    try {
        // Load sidebar
        const sidebarResponse = await fetch('/web_app/src/shared/components/sidebar.html');
        if (sidebarResponse.ok) {
            dashboardState.components.sidebar.innerHTML = await sidebarResponse.text();
        }

        // Load header
        const headerResponse = await fetch('/web_app/src/shared/components/header.html');
        if (headerResponse.ok) {
            dashboardState.components.header.innerHTML = await headerResponse.text();
        }
    } catch (error) {
        console.error('Error loading shared components:', error);
    }
}

/**
 * Setup sidebar navigation
 */
function setupSidebarNavigation() {
    const sidebarToggles = document.querySelectorAll('.menu-toggle');
    const sidebarMenuItems = document.querySelectorAll('.menu-item');

    // Menu toggle functionality
    sidebarToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            const parentItem = this.closest('.menu-item');
            parentItem.classList.toggle('expanded');
        });
    });

    // Set active menu item based on current page
    const currentPage = window.location.pathname;
    sidebarMenuItems.forEach(item => {
        const link = item.querySelector('a');
        if (link && currentPage.includes(link.getAttribute('href'))) {
            link.classList.add('active');
            // Expand parent if submenu
            const parentItem = link.closest('.menu-item');
            if (parentItem) {
                parentItem.classList.add('expanded');
            }
        }
    });

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to logout?')) {
                logout();
            }
        });
    }
}

/**
 * Setup header navigation
 */
function setupHeaderNavigation() {
    // Set page title
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        pageTitle.textContent = 'Dashboard';
    }

    // Set current page in breadcrumb
    const currentPage = document.getElementById('currentPage');
    if (currentPage) {
        currentPage.textContent = 'Dashboard';
    }

    // Set user info in header
    const user = authService.getCurrentUser();
    if (user) {
        const userName = document.getElementById('userName');
        if (userName) {
            userName.textContent = user.name || 'User';
        }

        const dropdownUserName = document.getElementById('dropdownUserName');
        if (dropdownUserName) {
            dropdownUserName.textContent = user.name || 'User Name';
        }

        const dropdownUserRole = document.getElementById('dropdownUserRole');
        if (dropdownUserRole) {
            dropdownUserRole.textContent = user.role || 'Role';
        }

        const profileName = document.getElementById('profileName');
        if (profileName) {
            profileName.textContent = user.name || 'User Name';
        }

        const profileRole = document.getElementById('profileRole');
        if (profileRole) {
            profileRole.textContent = user.role || 'Role';
        }

        const profileEmail = document.getElementById('profileEmail');
        if (profileEmail) {
            profileEmail.textContent = user.email || 'email@example.com';
        }
    }

    // Header logout button
    const headerLogoutBtn = document.getElementById('headerLogoutBtn');
    if (headerLogoutBtn) {
        headerLogoutBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to logout?')) {
                logout();
            }
        });
    }
}

/**
 * Load dashboard data
 */
async function loadDashboardData() {
    try {
        // For now, load mock data
        // In production, these would be actual API calls
        
        // Get summary stats
        const summary = await dashboardService.getSummary();
        updateSummaryCards(summary);

        // Get today's appointments
        const appointments = await dashboardService.getTodayAppointments();
        displayTodayAppointments(appointments);

        // Get recent patients
        const recentPatients = await dashboardService.getRecentPatients(5);
        displayRecentPatients(recentPatients);

        // Get quick stats
        const quickStats = await dashboardService.getQuickStats();
        updateQuickStats(quickStats);

    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

/**
 * Update summary cards
 */
function updateSummaryCards(summary) {
    if (!summary) {
        // Show placeholder data
        document.getElementById('totalPatients').textContent = '0';
        document.getElementById('totalDoctors').textContent = '0';
        document.getElementById('totalAppointments').textContent = '0';
        document.getElementById('todayAppointments').textContent = '0';
        return;
    }

    document.getElementById('totalPatients').textContent = summary.totalPatients || '0';
    document.getElementById('patientsMeta').textContent = 'Registered patients';

    document.getElementById('totalDoctors').textContent = summary.totalDoctors || '0';
    document.getElementById('doctorsMeta').textContent = 'Active doctors';

    document.getElementById('totalAppointments').textContent = summary.totalAppointments || '0';
    document.getElementById('appointmentsMeta').textContent = 'All appointments';

    document.getElementById('todayAppointments').textContent = summary.todayAppointments || '0';
    document.getElementById('todayMeta').textContent = 'Today';
}

/**
 * Display today's appointments
 */
function displayTodayAppointments(appointments) {
    const appointmentsList = document.getElementById('appointmentsList');
    
    if (!appointments || appointments.length === 0) {
        appointmentsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="bi bi-calendar-x"></i>
                </div>
                <p class="empty-state-text">No appointments scheduled for today</p>
            </div>
        `;
        return;
    }

    appointmentsList.innerHTML = appointments.map(apt => `
        <div class="appointment-item">
            <div class="appointment-info">
                <div class="appointment-patient-name">${apt.patientName || 'Unknown Patient'}</div>
                <div class="appointment-meta">
                    <span><i class="bi bi-person-check"></i> Dr. ${apt.doctorName || 'TBD'}</span>
                    <span class="appointment-status ${apt.status || 'pending'}">${apt.status || 'Pending'}</span>
                </div>
            </div>
            <div class="appointment-time">
                <i class="bi bi-clock"></i> ${apt.time || '--:--'}
            </div>
        </div>
    `).join('');
}

/**
 * Display recent patients
 */
function displayRecentPatients(patients) {
    const tableBody = document.getElementById('patientsTableBody');
    
    if (!patients || patients.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">No patients found</td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = patients.map(patient => `
        <tr>
            <td class="patient-name">${patient.name || 'N/A'}</td>
            <td>${patient.age || '-'}</td>
            <td>${patient.gender || '-'}</td>
            <td>${patient.contact || '-'}</td>
            <td>${patient.dateAdded ? formatDate(patient.dateAdded) : '-'}</td>
            <td class="patient-action">
                <a href="../patients/pages/patient-details.html?id=${patient.id}" title="View">
                    <i class="bi bi-eye"></i>
                </a>
                <a href="../patients/pages/edit-patient.html?id=${patient.id}" title="Edit">
                    <i class="bi bi-pencil"></i>
                </a>
            </td>
        </tr>
    `).join('');
}

/**
 * Update quick stats
 */
function updateQuickStats(stats) {
    // Quick stats can be used for other widgets or features
    console.log('Quick stats:', stats);
}

/**
 * Show error state
 */
function showErrorState() {
    dashboardState.loadingContainer.innerHTML = `
        <div class="container mt-5">
            <div class="alert alert-danger" role="alert">
                <h4 class="alert-heading">Error Loading Dashboard</h4>
                <p>An error occurred while loading the dashboard. Please refresh the page or contact support.</p>
                <hr>
                <button class="btn btn-primary" onclick="location.reload()">Refresh Page</button>
            </div>
        </div>
    `;
}

/**
 * Handle sidebar toggle on mobile
 */
function setupMobileMenu() {
    const headerMenuToggle = document.getElementById('headerMenuToggle');
    const sidebar = document.getElementById('appSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    if (headerMenuToggle && sidebar) {
        headerMenuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('show');
            if (sidebarOverlay) {
                sidebarOverlay.classList.toggle('show');
            }
        });
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', function() {
            sidebar.classList.remove('show');
            this.classList.remove('show');
        });
    }
}

// Initialize mobile menu after components are loaded
setTimeout(setupMobileMenu, 100);

// Format date helper (in case it's not loaded from helpers)
function formatDate(dateString, format = 'MM/DD/YYYY') {
    try {
        const date = new Date(dateString);
        if (isNaN(date)) return dateString;
        
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        
        return format
            .replace('DD', day)
            .replace('MM', month)
            .replace('YYYY', year);
    } catch (error) {
        return dateString;
    }
}
