// Monitoring-specific JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    // Modal functionality
    const modal = document.getElementById('addAreaModal');
    const openModalBtn = document.getElementById('openAddAreaModal');
    const closeModalBtn = document.getElementById('closeAddAreaModal');
    const cancelBtn = document.getElementById('cancelAddArea');
    const submitBtn = document.getElementById('submitAddArea');
    const form = document.getElementById('addAreaForm');

    // Open modal
    if (openModalBtn) {
        openModalBtn.addEventListener('click', function() {
            modal.style.display = 'block';
        });
    }

    // Close modal functions
    function closeModal() {
        modal.style.display = 'none';
        form.reset();
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Submit form
    if (submitBtn) {
        submitBtn.addEventListener('click', function() {
            const areaName = document.getElementById('areaName').value.trim();
            const building = document.getElementById('building').value.trim();

            if (!areaName || !building) {
                alert('Please fill in all fields');
                return;
            }

            // Send POST request to create area
            fetch('/api/areas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: areaName,
                    building: building
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    alert('Area added successfully!');
                    closeModal();
                    // Reload page to show new area
                    location.reload();
                } else {
                    alert('Error: ' + (data.error || 'Unknown error'));
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while adding the area');
            });
        });
    }

    // Action buttons functionality for monitoring table
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
            } else if (icon.includes('fa-trash')) {
                // Delete action
                const areaId = this.getAttribute('data-area-id');
                if (confirm('Are you sure you want to delete this area? This action cannot be undone.')) {
                    deleteArea(areaId);
                }
            }
        });
    });

    // Function to delete an area
    function deleteArea(areaId) {
        fetch(`/api/areas/${areaId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert('Area deleted successfully!');
                // Reload page to show updated areas list
                location.reload();
            } else {
                alert('Error: ' + (data.error || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while deleting the area');
        });
    }
});
