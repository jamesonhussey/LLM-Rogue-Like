// UI Logic
// Handles all user interface interactions

class UI {
    constructor() {
        this.selectedItem1 = null;
        this.selectedItem2 = null;
        this.init();
    }

    init() {
        // Wait for DOM to load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.populateItemSelects();
        this.attachEventListeners();
        this.updateInventoryDisplay();
        this.updateStats();
        
        console.log('✅ UI initialized');
    }

    // Populate dropdown selects with items
    populateItemSelects() {
        const select1 = document.getElementById('item1-select');
        const select2 = document.getElementById('item2-select');

        const items = itemStorage.getAllItems();

        // Clear existing options
        select1.innerHTML = '<option value="">-- Select Item --</option>';
        select2.innerHTML = '<option value="">-- Select Item --</option>';

        // Group items by type
        const startingItems = items.filter(i => i.isStartingItem);
        const generatedItems = items.filter(i => !i.isStartingItem);

        // Add starting items
        if (startingItems.length > 0) {
            const group1 = document.createElement('optgroup');
            group1.label = 'Starting Items';
            const group2 = document.createElement('optgroup');
            group2.label = 'Starting Items';

            startingItems.forEach(item => {
                const option1 = this.createItemOption(item);
                const option2 = this.createItemOption(item);
                group1.appendChild(option1);
                group2.appendChild(option2);
            });

            select1.appendChild(group1);
            select2.appendChild(group2);
        }

        // Add generated items
        if (generatedItems.length > 0) {
            const group1 = document.createElement('optgroup');
            group1.label = 'Generated Items';
            const group2 = document.createElement('optgroup');
            group2.label = 'Generated Items';

            generatedItems.forEach(item => {
                const option1 = this.createItemOption(item);
                const option2 = this.createItemOption(item);
                group1.appendChild(option1);
                group2.appendChild(option2);
            });

            select1.appendChild(group1);
            select2.appendChild(group2);
        }
    }

    createItemOption(item) {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = `${item.name} (${item.rarity})`;
        return option;
    }

    // Attach event listeners
    attachEventListeners() {
        const combineBtn = document.getElementById('combine-btn');
        const clearDataBtn = document.getElementById('clear-data-btn');
        const toggleJsonBtn = document.getElementById('toggle-json-btn');
        const closeModalBtn = document.getElementById('close-item-detail');
        const modal = document.getElementById('item-detail-modal');
        const toggleUiBtn = document.getElementById('toggle-ui-btn');
        const uiPanel = document.getElementById('ui-panel');

        combineBtn.addEventListener('click', () => this.handleCombine());
        clearDataBtn.addEventListener('click', () => this.handleClearData());
        toggleJsonBtn.addEventListener('click', () => this.toggleJsonView());
        closeModalBtn.addEventListener('click', () => this.closeItemDetail());
        
        // Toggle UI panel
        toggleUiBtn.addEventListener('click', () => {
            uiPanel.classList.toggle('open');
        });

        // Close modal when clicking outside of it
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeItemDetail();
            }
        });

        // ESC key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeItemDetail();
            }
        });

        // Update selected items when dropdowns change
        document.getElementById('item1-select').addEventListener('change', (e) => {
            this.selectedItem1 = itemStorage.getAllItems().find(i => i.id === e.target.value);
        });

        document.getElementById('item2-select').addEventListener('change', (e) => {
            this.selectedItem2 = itemStorage.getAllItems().find(i => i.id === e.target.value);
        });
    }

    // Handle combine button click
    async handleCombine() {
        if (!this.selectedItem1 || !this.selectedItem2) {
            this.showError('Please select two items to combine!');
            return;
        }

        const combineBtn = document.getElementById('combine-btn');
        const resultContainer = document.getElementById('result-container');
        const loadingDiv = document.getElementById('loading');

        // Show loading state
        combineBtn.disabled = true;
        loadingDiv.style.display = 'block';
        resultContainer.style.display = 'none';

        try {
            const result = await itemGenerator.combineItems(this.selectedItem1, this.selectedItem2);
            
            // Show result
            this.displayResult(result.item, result.fromCache);
            
            // Update UI
            this.populateItemSelects(); // Refresh dropdowns with new item
            this.updateInventoryDisplay();
            this.updateStats();

        } catch (error) {
            console.error('Error combining items:', error);
            this.showError(`Failed to combine items: ${error.message}`);
        } finally {
            combineBtn.disabled = false;
            loadingDiv.style.display = 'none';
        }
    }

    // Display generated item result
    displayResult(item, fromCache) {
        const resultContainer = document.getElementById('result-container');
        const resultContent = document.getElementById('result-content');
        const jsonOutput = document.getElementById('json-output');

        // Create HTML for item display
        const effectsList = Object.entries(item.effects)
            .filter(([key, value]) => value !== 0)
            .map(([key, value]) => {
                const sign = value > 0 ? '+' : '';
                const displayName = key.replace(/([A-Z])/g, ' $1').trim();
                const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
                return `<li>${capitalizedName}: ${sign}${value}</li>`;
            })
            .join('');

        const rarityEmoji = {
            common: '⚪',
            uncommon: '🟢',
            rare: '🔵',
            epic: '🟣',
            legendary: '🟡'
        };

        resultContent.innerHTML = `
            <div class="item-card ${item.rarity}">
                <div class="item-header">
                    <h3>${rarityEmoji[item.rarity] || '⚪'} ${item.name}</h3>
                    <span class="rarity-badge ${item.rarity}">${item.rarity}</span>
                </div>
                <p class="item-description">${item.description}</p>
                ${effectsList ? `<ul class="item-effects">${effectsList}</ul>` : '<p class="no-effects">No stat effects</p>'}
                ${fromCache ? '<div class="cache-badge">⚡ Retrieved from cache</div>' : '<div class="new-badge">✨ Newly generated!</div>'}
            </div>
        `;

        // Show JSON
        jsonOutput.textContent = JSON.stringify(item, null, 2);

        // Show result container with animation
        resultContainer.style.display = 'block';
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Show error message
    showError(message) {
        const resultContainer = document.getElementById('result-container');
        const resultContent = document.getElementById('result-content');

        resultContent.innerHTML = `
            <div class="error-message">
                <h3>❌ Error</h3>
                <p>${message}</p>
            </div>
        `;

        resultContainer.style.display = 'block';
    }

    // Toggle JSON view
    toggleJsonView() {
        const jsonContainer = document.getElementById('json-container');
        const btn = document.getElementById('toggle-json-btn');
        
        if (jsonContainer.style.display === 'none') {
            jsonContainer.style.display = 'block';
            btn.textContent = 'Hide JSON';
        } else {
            jsonContainer.style.display = 'none';
            btn.textContent = 'Show JSON';
        }
    }

    // Update inventory display
    updateInventoryDisplay() {
        const inventoryList = document.getElementById('inventory-list');
        const items = itemStorage.getAllItems();

        inventoryList.innerHTML = items.map(item => {
            const rarityEmoji = {
                common: '⚪',
                uncommon: '🟢',
                rare: '🔵',
                epic: '🟣',
                legendary: '🟡'
            };
            return `<span class="inventory-item ${item.rarity}" 
                         data-item-id="${item.id}" 
                         title="Click to view details">
                ${rarityEmoji[item.rarity] || '⚪'} ${item.name}
            </span>`;
        }).join('');

        // Add click listeners to inventory items
        document.querySelectorAll('.inventory-item').forEach(element => {
            element.addEventListener('click', (e) => {
                const itemId = e.currentTarget.getAttribute('data-item-id');
                const item = itemStorage.getAllItems().find(i => i.id === itemId);
                if (item) {
                    this.showItemDetail(item);
                }
            });
        });
    }

    // Update statistics
    updateStats() {
        const stats = itemStorage.getStats();
        document.getElementById('stat-total').textContent = stats.totalItems;
        document.getElementById('stat-generated').textContent = stats.generatedItems;
        document.getElementById('stat-combinations').textContent = stats.totalCombinations;
    }

    // Clear all data
    handleClearData() {
        if (confirm('Are you sure you want to clear all generated items and combinations? This cannot be undone!')) {
            itemStorage.clearAll();
            this.populateItemSelects();
            this.updateInventoryDisplay();
            this.updateStats();
            
            document.getElementById('result-container').style.display = 'none';
            
            alert('✅ All data cleared! Starting fresh with 10 base items.');
        }
    }

    // Show item detail modal
    showItemDetail(item) {
        const modal = document.getElementById('item-detail-modal');
        const detailContent = document.getElementById('item-detail-content');

        const rarityEmoji = {
            common: '⚪',
            uncommon: '🟢',
            rare: '🔵',
            epic: '🟣',
            legendary: '🟡'
        };

        // Get rarity color for border
        const rarityColors = {
            common: 'var(--color-common)',
            uncommon: 'var(--color-uncommon)',
            rare: 'var(--color-rare)',
            epic: 'var(--color-epic)',
            legendary: 'var(--color-legendary)'
        };

        // Format effects for display
        const effectsEntries = Object.entries(item.effects)
            .filter(([key, value]) => value !== 0);

        const effectsHTML = effectsEntries.length > 0 
            ? effectsEntries.map(([key, value]) => {
                const sign = value > 0 ? '+' : '';
                const displayName = key.replace(/([A-Z])/g, ' $1').trim();
                const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
                const valueClass = value > 0 ? 'positive' : 'negative';
                
                return `
                    <div class="stat-item">
                        <span class="stat-label">${capitalizedName}</span>
                        <span class="stat-value ${valueClass}">${sign}${value}</span>
                    </div>
                `;
            }).join('')
            : '<p style="text-align: center; color: var(--color-text-dim);">No stat effects</p>';

        // Get parent info if it's a generated item
        const parentInfo = item.parents ? (() => {
            const parent1 = itemStorage.getAllItems().find(i => i.id === item.parents[0]);
            const parent2 = itemStorage.getAllItems().find(i => i.id === item.parents[1]);
            return `
                <div class="item-detail-meta">
                    <strong>Created from:</strong><br>
                    ${parent1 ? parent1.name : 'Unknown'} + ${parent2 ? parent2.name : 'Unknown'}
                </div>
            `;
        })() : '<div class="item-detail-meta">⭐ Starting Item</div>';

        detailContent.innerHTML = `
            <div class="item-detail-header">
                <div class="item-detail-name">
                    ${rarityEmoji[item.rarity] || '⚪'} ${item.name}
                </div>
                <span class="rarity-badge ${item.rarity}">${item.rarity}</span>
            </div>
            
            <div class="item-detail-description">
                "${item.description}"
            </div>
            
            <div class="item-detail-stats ${item.rarity}" style="border-color: ${rarityColors[item.rarity]}">
                <h3>Effects</h3>
                <div class="stat-grid">
                    ${effectsHTML}
                </div>
            </div>
            
            ${parentInfo}
        `;

        modal.style.display = 'flex';
    }

    // Close item detail modal
    closeItemDetail() {
        const modal = document.getElementById('item-detail-modal');
        modal.style.display = 'none';
    }
}

// Initialize UI when script loads
const ui = new UI();

