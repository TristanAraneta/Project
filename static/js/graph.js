// Graph Analytics JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const timeFilter = document.getElementById('timeFilter');
    const refreshBtn = document.getElementById('refreshData');
    const contactBtn = document.querySelector('.contact-btn');

    // Empty analytics data
    let analyticsData = {
        mostUsed: 0,
        lowStock: 0,
        highStock: 0,
        outOfStock: 0
    };

    // Event Listeners
    refreshBtn.addEventListener('click', function() {
        refreshAnalytics();
    });

    timeFilter.addEventListener('change', function() {
        updateCharts();
    });

    contactBtn.addEventListener('click', function() {
        alert('Support contact feature will be implemented soon!');
    });

    // Functions
    function refreshAnalytics() {
        // Show loading state
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Refreshing...</span>';
        refreshBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            // For now, keep data empty since no backend
            updateStats();
            
            // Reset button
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i><span>Refresh</span>';
            refreshBtn.disabled = false;
            
            alert('Data refreshed! (Note: No backend connected yet)');
        }, 1000);
    }

    function updateStats() {
        // Update quick stats
        document.querySelector('.stat-card:nth-child(1) .stat-value').textContent = analyticsData.mostUsed;
        document.querySelector('.stat-card:nth-child(2) .stat-value').textContent = analyticsData.lowStock;
        document.querySelector('.stat-card:nth-child(3) .stat-value').textContent = analyticsData.highStock;
        document.querySelector('.stat-card:nth-child(4) .stat-value').textContent = analyticsData.outOfStock;
    }

    function updateCharts() {
        const timeRange = timeFilter.value;
        console.log('Updating charts for time range:', timeRange);
        // Chart update logic will be implemented when we have real data
    }

    // Initialize
    updateStats();
});