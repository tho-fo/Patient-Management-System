/**
 * Dashboard Service
 * Handles all dashboard-related API calls
 */

class DashboardService {
    constructor() {
        this.apiService = window.apiService || new APIService();
    }
    
    /**
     * Get dashboard summary
     */
    async getSummary() {
        try {
            const response = await this.apiService.GET('/dashboard/summary');
            return response.success ? response.data : null;
        } catch (error) {
            console.error('Error fetching summary:', error);
            return null;
        }
    }
    
    /**
     * Get today's appointments
     */
    async getTodayAppointments() {
        try {
            const response = await this.apiService.GET('/dashboard/today-appointments');
            return response.success ? response.data : [];
        } catch (error) {
            console.error('Error fetching today appointments:', error);
            return [];
        }
    }
    
    /**
     * Get recent patients
     */
    async getRecentPatients(limit = 5) {
        try {
            const response = await this.apiService.GET('/dashboard/recent-patients', { limit });
            return response.success ? response.data : [];
        } catch (error) {
            console.error('Error fetching recent patients:', error);
            return [];
        }
    }
    
    /**
     * Get quick stats
     */
    async getQuickStats() {
        try {
            const response = await this.apiService.GET('/dashboard/quick-stats');
            return response.success ? response.data : {};
        } catch (error) {
            console.error('Error fetching quick stats:', error);
            return {};
        }
    }
}

// Create singleton instance
const dashboardService = new DashboardService();

// Export service
if (typeof window !== 'undefined') {
    window.dashboardService = dashboardService;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DashboardService, dashboardService };
}
