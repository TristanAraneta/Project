// Inventory Management JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Modal elements
    const addItemModal = document.getElementById('addItemModal');
    const addItemBtn = document.getElementById('addItemBtn');
    const closeModal = document.getElementById('closeModal');
    const cancelAddItem = document.getElementById('cancelAddItem');
    const saveItem = document.getElementById('saveItem');
    const searchInput = document.getElementById('searchInventory');
    const inventoryTableBody = document.getElementById('inventoryTableBody');

    // Empty inventory data
    let inventoryItems = [];

    // Modal functions
    addItemBtn.addEventListener('click', () => {
        addItemModal.style.display = 'block';
    });

    closeModal.addEventListener('click', () => {
        addItemModal.style.display = 'none';
    });

    cancelAddItem.addEventListener('click', () => {
        addItemModal.style.display = 'none';
    });

    // Save new item
    saveItem.addEventListener('click', () => {
        const itemName = document.getElementById('itemName').value;
        const currentStock = parseInt(document.getElementById('currentStock').value);
        const stockAlert = parseInt(document.getElementById('stockAlert').value);
        const unit = document.getElementById('unit').value;

        if (itemName && !isNaN(currentStock) && !isNaN(stockAlert)) {
            const newItem = {
                id: inventoryItems.length + 1,
                name: itemName,
                stock: currentStock,
                alert: stockAlert,
                unit: unit,
                status: getStockStatus(currentStock, stockAlert)
            };

            inventoryItems.push(newItem);
            renderInventoryTable();
            updateSummaryStats();
            addItemModal.style.display = 'none';
            document.getElementById('addItemForm').reset();
        } else {
            alert('Please fill all required fields correctly.');
        }
    });

    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filterInventory(searchTerm);
    });

    // Stock status calculation
    function getStockStatus(stock, alertLevel) {
        if (stock === 0) return 'critical';
        if (stock <= alertLevel) return 'low';
        return 'ok';
    }

    // Filter inventory
    function filterInventory(searchTerm) {
        if (searchTerm === '') {
            renderInventoryTable();
            return;
        }
        
        const filteredItems = inventoryItems.filter(item => 
            item.name.toLowerCase().includes(searchTerm) ||
            item.id.toString().includes(searchTerm)
        );
        renderInventoryTable(filteredItems);
    }

    // Render inventory table
    function renderInventoryTable(items = inventoryItems) {
        inventoryTableBody.innerHTML = '';
        
        if (items.length === 0) {
            // Show empty state
            const emptyRow = document.createElement('tr');
            emptyRow.className = 'empty-state';
            emptyRow.innerHTML = `
                <td colspan="7">
                    <div class="empty-message">
                        <i class="fas fa-cube"></i>
                        <h3>No Inventory Items</h3>
                        <p>${inventoryItems.length === 0 ? 'Get started by adding your first inventory item.' : 'No items match your search criteria.'}</p>
                    </div>
                </td>
            `;
            inventoryTableBody.appendChild(emptyRow);
            return;
        }
        
        items.forEach(item => {
            const statusClass = item.status;
            const statusText = getStatusText(item.status);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.stock}</td>
                <td>&lt;${item.alert}</td>
                <td>${item.unit}</td>
                <td>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit-btn" onclick="editItem(${item.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="deleteItem(${item.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            inventoryTableBody.appendChild(row);
        });
    }

    // Get status text
    function getStatusText(status) {
        switch(status) {
            case 'critical': return 'Out of Stock';
            case 'low': return 'Low Stock';
            case 'ok': return 'In Stock';
            default: return 'Unknown';
        }
    }

    // Update summary stats
    function updateSummaryStats() {
        const totalItems = inventoryItems.length;
        const lowStock = inventoryItems.filter(item => item.status === 'low').length;
        const outOfStock = inventoryItems.filter(item => item.status === 'critical').length;
        const inStock = inventoryItems.filter(item => item.status === 'ok').length;

        // Update the summary values using correct selectors
        const summaryItems = document.querySelectorAll('.summary-item');
        summaryItems[0].querySelector('.summary-value').textContent = totalItems;
        summaryItems[1].querySelector('.summary-value').textContent = lowStock;
        summaryItems[2].querySelector('.summary-value').textContent = outOfStock;
        summaryItems[3].querySelector('.summary-value').textContent = inStock;
    }

    // Global functions for button actions
    window.editItem = function(id) {
        const item = inventoryItems.find(item => item.id === id);
        if (item) {
            // Populate modal with item data for editing
            document.getElementById('itemName').value = item.name;
            document.getElementById('currentStock').value = item.stock;
            document.getElementById('stockAlert').value = item.alert;
            document.getElementById('unit').value = item.unit;
            
            addItemModal.style.display = 'block';
        }
    };

    window.deleteItem = function(id) {
        if (confirm('Are you sure you want to delete this item?')) {
            inventoryItems = inventoryItems.filter(item => item.id !== id);
            renderInventoryTable();
            updateSummaryStats();
        }
    };

    // Initial render
    renderInventoryTable();
    updateSummaryStats();
});