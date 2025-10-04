// ItemDetailModal Class
// Manages the item detail popup when clicking inventory items

class ItemDetailModal {
    constructor() {
        this.modal = document.getElementById('item-detail-modal');
        this.detailContent = document.getElementById('item-detail-content');
        this.closeBtn = document.getElementById('close-item-detail');
        
        this.setupEventListeners();
        console.log('✅ Item Detail Modal initialized');
    }

    setupEventListeners() {
        // Close button
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }

        // Close when clicking outside modal
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.close();
                }
            });
        }

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible()) {
                this.close();
            }
        });
    }

    show(item) {
        if (!item) return;

        const rarityEmoji = {
            common: '⚪',
            uncommon: '🟢',
            rare: '🔵',
            epic: '🟣',
            legendary: '🟡'
        };

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

        this.detailContent.innerHTML = `
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
            
            <button class="equip-btn" data-item-id="${item.id}">
                ⚔️ Equip Item
            </button>
        `;

        // Add click listener to equip button
        const equipBtn = this.detailContent.querySelector('.equip-btn');
        if (equipBtn) {
            equipBtn.addEventListener('click', () => {
                this.equipItem(item);
            });
        }

        this.modal.style.display = 'flex';
    }

    close() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
    }

    isVisible() {
        return this.modal && this.modal.style.display === 'flex';
    }

    equipItem(item) {
        // Check if game is available
        if (typeof game === 'undefined' || !game.scene || !game.scene.scenes[0]) {
            console.error('❌ Game not initialized yet');
            alert('Game not ready! Please wait for the game to load.');
            return;
        }

        // Get the game scene
        const gameScene = game.scene.scenes[0];
        
        if (!gameScene.player || !gameScene.player.applyItemEffects) {
            console.error('❌ Player not ready');
            alert('Cannot equip item - player not ready');
            return;
        }

        // Apply item effects to player
        gameScene.player.applyItemEffects(item);

        // Add to player's run inventory
        itemStorage.addToPlayerRunInventory(item);

        // Close modal
        this.close();

        // Show feedback
        console.log(`✅ Equipped: ${item.name}`);
        
        // Visual feedback notification
        const notification = document.createElement('div');
        notification.className = 'equip-notification';
        notification.textContent = `⚔️ Equipped: ${item.name}`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
}

