// Tab navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const superRemainingBtn = document.getElementById('superRemainingBtn');
    const logoutPanel = document.getElementById('logoutPanel');
    const closeLogoutPanel = document.getElementById('closeLogoutPanel');
    const cancelLogout = document.getElementById('cancelLogout');
    const confirmLogout = document.getElementById('confirmLogout');
    const loginTime = document.getElementById('loginTime');
    const sessionDuration = document.getElementById('sessionDuration');
    const lastActivity = document.getElementById('lastActivity');

    let sessionStartTime = new Date();
    let lastActivityTime = new Date();

    // Initialize session info
    updateSessionInfo();
    setInterval(updateSessionInfo, 1000);

    // Update user activity
    document.addEventListener('click', updateLastActivity);
    document.addEventListener('keypress', updateLastActivity);

    // Tab switching
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            navButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const tab = this.getAttribute('data-tab');
            console.log('Switching to tab:', tab);
        });
    });
    
    // Add button functionality
    const addButton = document.querySelector('.add-btn');
    if (addButton) {
        addButton.addEventListener('click', function() {
            alert('Add New Area functionality would go here');
        });
    }
    
    // Action buttons functionality
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const icon = this.querySelector('i').className;
            if (icon.includes('fa-eye')) {
                alert('View action clicked');
            } else if (icon.includes('fa-camera')) {
                alert('Camera action clicked');
            } else if (icon.includes('fa-edit')) {
                alert('Edit action clicked');
            }
        });
    });

    // Super Remaining Button - Open logout panel
    superRemainingBtn.addEventListener('click', function() {
        logoutPanel.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    // Close logout panel
    closeLogoutPanel.addEventListener('click', closePanel);
    cancelLogout.addEventListener('click', closePanel);

    // Confirm logout - Enhanced with better UX
    confirmLogout.addEventListener('click', function() {
        // Show custom confirmation dialog
        showLogoutConfirmation();
    });

    // Close panel when clicking outside
    document.addEventListener('click', function(event) {
        if (logoutPanel.classList.contains('active') && 
            !logoutPanel.contains(event.target) && 
            !superRemainingBtn.contains(event.target)) {
            closePanel();
        }
    });

    // Close panel with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && logoutPanel.classList.contains('active')) {
            closePanel();
        }
    });

    function closePanel() {
        logoutPanel.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    function showLogoutConfirmation() {
        // Create custom confirmation modal
        const confirmationModal = document.createElement('div');
        confirmationModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 3000;
        `;

        confirmationModal.innerHTML = `
            <div style="
                background: white;
                padding: 30px;
                border-radius: 15px;
                text-align: center;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            ">
                <div style="font-size: 48px; color: #ef4444; margin-bottom: 15px;">
                    <i class="fas fa-sign-out-alt"></i>
                </div>
                <h3 style="color: #374151; margin-bottom: 10px;">Confirm Logout</h3>
                <p style="color: #6b7280; margin-bottom: 25px;">Are you sure you want to log out of your account?</p>
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button id="cancelLogoutConfirm" style="
                        padding: 10px 20px;
                        background: #f3f4f6;
                        color: #374151;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 500;
                    ">Cancel</button>
                    <button id="confirmLogoutFinal" style="
                        padding: 10px 20px;
                        background: linear-gradient(135deg, #ef4444, #dc2626);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 500;
                    ">Yes, Logout</button>
                </div>
            </div>
        `;

        document.body.appendChild(confirmationModal);

        // Handle confirmation
        document.getElementById('confirmLogoutFinal').addEventListener('click', function() {
            // Show loading state in the original logout panel
            confirmLogout.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging out...';
            confirmLogout.disabled = true;
            
            // Remove confirmation modal
            document.body.removeChild(confirmationModal);
            closePanel();
            
            // Redirect after short delay
            setTimeout(function() {
                window.location.href = 'landingpage.html';
            }, 1000);
        });

        // Handle cancellation
        document.getElementById('cancelLogoutConfirm').addEventListener('click', function() {
            document.body.removeChild(confirmationModal);
        });

        // Close modal when clicking outside
        confirmationModal.addEventListener('click', function(e) {
            if (e.target === confirmationModal) {
                document.body.removeChild(confirmationModal);
            }
        });
    }

    function updateSessionInfo() {
        const now = new Date();
        
        // Update login time
        loginTime.textContent = sessionStartTime.toLocaleTimeString();
        
        // Update session duration
        const duration = Math.floor((now - sessionStartTime) / 1000);
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        const seconds = duration % 60;
        sessionDuration.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Update last activity
        const activityDiff = Math.floor((now - lastActivityTime) / 1000);
        if (activityDiff < 10) {
            lastActivity.textContent = 'Just now';
        } else if (activityDiff < 60) {
            lastActivity.textContent = `${activityDiff} seconds ago`;
        } else {
            const activityMinutes = Math.floor(activityDiff / 60);
            lastActivity.textContent = `${activityMinutes} minute${activityMinutes > 1 ? 's' : ''} ago`;
        }
    }

    function updateLastActivity() {
        lastActivityTime = new Date();
    }
});