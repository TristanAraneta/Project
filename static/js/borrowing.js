// Borrowing Management JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Modal elements
    const newBorrowModal = document.getElementById('newBorrowModal');
    const newBorrowBtn = document.getElementById('newBorrowBtn');
    const closeBorrowModal = document.getElementById('closeBorrowModal');
    const cancelBorrow = document.getElementById('cancelBorrow');
    const saveBorrow = document.getElementById('saveBorrow');
    const searchInput = document.getElementById('searchBorrowings');
    const borrowingTableBody = document.getElementById('borrowingTableBody');
    const borrowItemSelect = document.getElementById('borrowItem');

    // Borrowing data
    let borrowings = [];
    let inventory = [];

    // Modal functions
    newBorrowBtn.addEventListener('click', () => {
        newBorrowModal.style.display = 'block';
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('dueDate').min = today;
    });

    // Initialize modal as hidden
    newBorrowModal.style.display = 'none';

    closeBorrowModal.addEventListener('click', () => {
        newBorrowModal.style.display = 'none';
    });

    cancelBorrow.addEventListener('click', () => {
        newBorrowModal.style.display = 'none';
    });

    // Save new borrow
    saveBorrow.addEventListener('click', async () => {
        const borrowerName = document.getElementById('borrowerName').value;
        const borrowItem = document.getElementById('borrowItem').value;
        const borrowQuantity = parseInt(document.getElementById('borrowQuantity').value);
        const dueDate = document.getElementById('dueDate').value;
        const borrowPurpose = document.getElementById('borrowPurpose').value;

        if (borrowerName && borrowItem && !isNaN(borrowQuantity) && dueDate) {
            try {
                const response = await fetch('/api/borrowings', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        borrower_name: borrowerName,
                        item_id: parseInt(borrowItem),
                        quantity: borrowQuantity,
                        due_date: dueDate,
                        purpose: borrowPurpose
                    })
                });

                if (response.ok) {
                    newBorrowModal.style.display = 'none';
                    document.getElementById('newBorrowForm').reset();
                    loadData(); // Reload data
                } else {
                    const error = await response.json();
                    alert(error.error || 'Failed to create borrowing');
                }
            } catch (error) {
                console.error('Error creating borrowing:', error);
                alert('Failed to create borrowing');
            }
        } else {
            alert('Please fill all required fields correctly.');
        }
    });

    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filterBorrowings(searchTerm);
    });

    // Borrow status calculation
    function getBorrowStatus(dateBorrowed, dueDate) {
        const today = new Date();
        const due = new Date(dueDate);
        
        if (today > due) return 'overdue';
        return 'borrowed';
    }

    // Filter borrowings
    function filterBorrowings(searchTerm) {
        if (searchTerm === '') {
            renderBorrowingTable();
            return;
        }

        const filteredBorrowings = borrowings.filter(borrow =>
            borrow.borrower_name.toLowerCase().includes(searchTerm) ||
            borrow.item_name.toLowerCase().includes(searchTerm) ||
            borrow.status.toLowerCase().includes(searchTerm)
        );
        renderBorrowingTable(filteredBorrowings);
    }

    // Render borrowing table
    function renderBorrowingTable(items = borrowings) {
        borrowingTableBody.innerHTML = '';
        
        if (items.length === 0) {
            // Show empty state
            const emptyRow = document.createElement('tr');
            emptyRow.className = 'empty-state';
            emptyRow.innerHTML = `
                <td colspan="7">
                    <div class="empty-message">
                        <i class="fas fa-exchange-alt"></i>
                        <h3>No Borrowings</h3>
                        <p>${borrowings.length === 0 ? 'No borrowings recorded yet. Start by creating a new borrow request.' : 'No borrowings match your search criteria.'}</p>
                    </div>
                </td>
            `;
            borrowingTableBody.appendChild(emptyRow);
            return;
        }
        
        items.forEach(borrow => {
            const statusClass = borrow.status;
            const statusText = getStatusText(borrow.status);

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${borrow.borrower_name}</td>
                <td>${borrow.item_name}</td>
                <td>${borrow.quantity} ${borrow.unit}</td>
                <td>${borrow.date_borrowed}</td>
                <td>${borrow.due_date}</td>
                <td>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        ${borrow.status === 'borrowed' ? `<button class="action-btn return-btn" onclick="markReturned(${borrow.id})" title="Mark Returned">
                            <i class="fas fa-check"></i>
                        </button>` : ''}
                        <button class="action-btn delete-btn" onclick="deleteBorrow(${borrow.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            borrowingTableBody.appendChild(row);
        });
    }

    // Get status text
    function getStatusText(status) {
        switch(status) {
            case 'borrowed': return 'Borrowed';
            case 'returned': return 'Returned';
            case 'overdue': return 'Overdue';
            case 'pending': return 'Pending';
            default: return 'Unknown';
        }
    }

    // Global functions for button actions
    window.markReturned = async function(id) {
        if (confirm('Mark this item as returned?')) {
            try {
                const response = await fetch(`/api/borrowings/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ status: 'returned' })
                });

                if (response.ok) {
                    loadData(); // Reload data
                } else {
                    alert('Failed to mark as returned');
                }
            } catch (error) {
                console.error('Error marking as returned:', error);
                alert('Failed to mark as returned');
            }
        }
    };

    window.editBorrow = function(id) {
        const borrow = borrowings.find(b => b.id === id);
        if (borrow) {
            // Populate modal with borrow data for editing
            document.getElementById('borrowerName').value = borrow.borrower_name;
            document.getElementById('borrowItem').value = borrow.item_id;
            document.getElementById('borrowQuantity').value = borrow.quantity;
            document.getElementById('dueDate').value = borrow.due_date;
            document.getElementById('borrowPurpose').value = borrow.purpose || '';

            newBorrowModal.style.display = 'block';
        }
    };

    window.deleteBorrow = async function(id) {
        if (confirm('Are you sure you want to delete this borrowing record?')) {
            try {
                const response = await fetch(`/api/borrowings/${id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    loadData(); // Reload data
                } else {
                    alert('Failed to delete borrowing');
                }
            } catch (error) {
                console.error('Error deleting borrowing:', error);
                alert('Failed to delete borrowing');
            }
        }
    };

    // Load data from API
    async function loadData() {
        try {
            const [borrowingsResponse, inventoryResponse] = await Promise.all([
                fetch('/api/borrowings'),
                fetch('/api/inventory')
            ]);

            if (borrowingsResponse.ok) {
                const borrowingsData = await borrowingsResponse.json();
                borrowings = borrowingsData.borrowings;
            }

            if (inventoryResponse.ok) {
                const inventoryData = await inventoryResponse.json();
                inventory = inventoryData.inventory;
                populateItemSelect();
            }

            renderBorrowingTable();
            updateSummaryStats();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    // Update summary statistics
    function updateSummaryStats() {
        const totalBorrowings = borrowings.length;
        const activeBorrowings = borrowings.filter(b => b.status === 'borrowed').length;
        const overdueBorrowings = borrowings.filter(b => b.status === 'overdue').length;
        const returnedBorrowings = borrowings.filter(b => b.status === 'returned').length;

        // Update the summary values
        const summaryItems = document.querySelectorAll('.summary-value');
        if (summaryItems.length >= 4) {
            summaryItems[0].textContent = totalBorrowings;
            summaryItems[1].textContent = activeBorrowings;
            summaryItems[2].textContent = overdueBorrowings;
            summaryItems[3].textContent = returnedBorrowings;
        }
    }

    // Populate item select dropdown
    function populateItemSelect() {
        borrowItemSelect.innerHTML = '<option value="">Select an item...</option>';
        inventory.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = `${item.name} (${item.stock} ${item.unit} available)`;
            borrowItemSelect.appendChild(option);
        });
    }

    // Initial load
    loadData();
});
