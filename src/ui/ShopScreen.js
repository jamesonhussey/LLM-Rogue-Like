// ShopScreen Class
// Manages the combined shop + crafting modal that appears between rounds

class ShopScreen {
    constructor(startNextRoundCallback) {
        this.modal = document.getElementById('shop-modal');
        this.roundNumberText = document.getElementById('shop-round-number');
        this.startButton = document.getElementById('start-next-round-from-shop-btn');
        this.startNextRoundCallback = startNextRoundCallback;

        // Shop elements
        this.shopItemsContainer = document.getElementById('shop-items');
        this.rerollButton = document.getElementById('reroll-shop-btn');
        this.currencyDisplay = document.getElementById('shop-currency-display');

        // Crafting elements (reuse existing UI logic)
        this.craftingUI = null; // Will be set by main UI class

        // Shop state
        this.currentShopItems = [];
        this.itemPool = [];
        this.playerCurrency = 0;

        // Bind events
        if (this.startButton) {
            this.startButton.addEventListener('click', () => {
                this.hide();
                this.startNextRoundCallback();
            });
        }

        if (this.rerollButton) {
            this.rerollButton.addEventListener('click', () => {
                this.rerollShop();
            });
        }

        console.log('✅ Shop Screen initialized');
    }

    show(roundNumber, playerCurrency, itemPool) {
        if (!this.modal) return;

        this.playerCurrency = playerCurrency;
        this.itemPool = itemPool;

        // Update round number
        if (this.roundNumberText) {
            this.roundNumberText.textContent = `Round ${roundNumber} Complete!`;
        }

        // Generate initial shop items
        this.generateShopItems();

        // Update currency display
        this.updateCurrencyDisplay();

        // Display player's current inventory
        this.displayPlayerInventory();

        // Show modal
        this.modal.style.display = 'flex';
    }

    hide() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
    }

    isVisible() {
        return this.modal && this.modal.style.display === 'flex';
    }

    generateShopItems() {
        // Select 4 random items from item pool
        const shuffled = [...this.itemPool].sort(() => Math.random() - 0.5);
        this.currentShopItems = shuffled.slice(0, 4);

        // Render shop items
        this.renderShopItems();
    }

    renderShopItems() {
        if (!this.shopItemsContainer) return;

        this.shopItemsContainer.innerHTML = '';

        this.currentShopItems.forEach((item, index) => {
            const cost = this.getItemCost(item.rarity);
            const canAfford = this.playerCurrency >= cost;

            const itemCard = document.createElement('div');
            itemCard.className = `shop-item-card ${item.rarity}`;
            itemCard.innerHTML = `
                <div class="shop-item-header">
                    <span class="shop-item-name">${this.getRarityEmoji(item.rarity)} ${item.name}</span>
                    <span class="rarity-badge ${item.rarity}">${item.rarity}</span>
                </div>
                <div class="shop-item-description">${item.description}</div>
                <div class="shop-item-effects">
                    ${this.renderItemEffects(item.effects)}
                </div>
                <div class="shop-item-footer">
                    <span class="shop-item-cost">💰 ${cost}</span>
                    <button class="shop-buy-btn ${canAfford ? '' : 'disabled'}" 
                            data-item-index="${index}"
                            ${canAfford ? '' : 'disabled'}>
                        Buy
                    </button>
                </div>
            `;

            // Add buy event listener
            const buyBtn = itemCard.querySelector('.shop-buy-btn');
            if (buyBtn && canAfford) {
                buyBtn.addEventListener('click', () => {
                    this.buyItem(index);
                });
            }

            this.shopItemsContainer.appendChild(itemCard);
        });
    }

    renderItemEffects(effects) {
        const nonZeroEffects = Object.entries(effects).filter(([key, value]) => value !== 0);
        
        if (nonZeroEffects.length === 0) {
            return '<span class="no-effects">No stat effects</span>';
        }

        return nonZeroEffects.map(([key, value]) => {
            const sign = value > 0 ? '+' : '';
            const displayName = key.replace(/([A-Z])/g, ' $1').trim();
            const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
            const valueClass = value > 0 ? 'positive' : 'negative';
            
            return `<span class="effect-line ${valueClass}">${sign}${value} ${capitalizedName}</span>`;
        }).join('');
    }

    buyItem(index) {
        const item = this.currentShopItems[index];
        const cost = this.getItemCost(item.rarity);

        if (this.playerCurrency < cost) {
            console.warn('⚠️ Not enough currency to buy this item');
            return;
        }

        // Deduct currency
        this.playerCurrency -= cost;
        
        // Apply item to player (via game scene)
        if (typeof game !== 'undefined' && game.scene && game.scene.scenes[0]) {
            const gameScene = game.scene.scenes[0];
            gameScene.player.stats.currency = this.playerCurrency;
            gameScene.player.applyItemEffects(item);
            gameScene.updateCurrencyUI();
        }

        // Add to player's current run inventory (for crafting)
        itemStorage.addToPlayerRunInventory(item);

        // Add to inventory (with stacking)
        this.addToInventory(item);

        console.log(`✅ Bought: ${item.name} for ${cost} gold`);

        // Update UI
        this.updateCurrencyDisplay();
        this.renderShopItems(); // Re-render to update button states
        this.displayPlayerInventory(); // Update inventory display
        
        // Refresh crafting dropdowns
        if (typeof ui !== 'undefined' && ui.populateShopItemSelects) {
            ui.populateShopItemSelects();
        }
    }

    addToInventory(item) {
        // This will be handled by the main UI class
        // For now, just trigger the inventory update
        if (typeof ui !== 'undefined' && ui.addToInventory) {
            ui.addToInventory(item);
        }
    }

    rerollShop() {
        const rerollCost = 10;

        if (this.playerCurrency < rerollCost) {
            console.warn('⚠️ Not enough currency to reroll shop');
            return;
        }

        // Deduct currency
        this.playerCurrency -= rerollCost;

        // Update player currency in game
        if (typeof game !== 'undefined' && game.scene && game.scene.scenes[0]) {
            const gameScene = game.scene.scenes[0];
            gameScene.player.stats.currency = this.playerCurrency;
            gameScene.updateCurrencyUI();
        }

        // Generate new shop items
        this.generateShopItems();

        // Update currency display
        this.updateCurrencyDisplay();

        console.log(`🔄 Rerolled shop for ${rerollCost} gold`);
    }

    updateCurrencyDisplay() {
        if (this.currencyDisplay) {
            this.currencyDisplay.textContent = `💰 ${this.playerCurrency}`;
        }

        // Update reroll button state
        if (this.rerollButton) {
            const rerollCost = 10;
            if (this.playerCurrency < rerollCost) {
                this.rerollButton.classList.add('disabled');
                this.rerollButton.disabled = true;
            } else {
                this.rerollButton.classList.remove('disabled');
                this.rerollButton.disabled = false;
            }
        }
    }

    getItemCost(rarity) {
        const costs = {
            common: 50,
            uncommon: 100,
            rare: 200,
            epic: 300,
            legendary: 500
        };
        return costs[rarity] || 50;
    }

    getRarityEmoji(rarity) {
        const emojis = {
            common: '⚪',
            uncommon: '🟢',
            rare: '🔵',
            epic: '🟣',
            legendary: '🟡'
        };
        return emojis[rarity] || '⚪';
    }

    displayPlayerInventory() {
        const inventoryList = document.getElementById('shop-player-inventory-list');
        if (!inventoryList) return;

        const playerStacks = itemStorage.getPlayerRunInventory(); // Array of { item, count }

        if (playerStacks.length === 0) {
            inventoryList.innerHTML = '<div class="shop-inventory-empty">No items yet. Buy items from the shop to start crafting!</div>';
            return;
        }

        inventoryList.innerHTML = playerStacks.map(stack => {
            const item = stack.item;
            const count = stack.count;
            
            const effectsEntries = Object.entries(item.effects)
                .filter(([key, value]) => value !== 0);

            const effectsHTML = effectsEntries.length > 0 
                ? effectsEntries.map(([key, value]) => {
                    const sign = value > 0 ? '+' : '';
                    const displayName = key.replace(/([A-Z])/g, ' $1').trim();
                    const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
                    const valueClass = value > 0 ? 'positive' : 'negative';
                    
                    return `<span class="effect-line ${valueClass}">${sign}${value} ${capitalizedName}</span>`;
                }).join('')
                : '<span class="no-effects">No stat effects</span>';

            // Display count only if > 1
            const countText = count > 1 ? ` x${count}` : '';

            return `
                <div class="shop-inventory-item ${item.rarity}">
                    <div class="shop-inventory-item-name">
                        ${this.getRarityEmoji(item.rarity)} ${item.name}${countText}
                    </div>
                    <div class="shop-inventory-item-effects">
                        ${effectsHTML}
                    </div>
                </div>
            `;
        }).join('');
    }

    // Called by main UI when crafting completes
    onItemCrafted(item) {
        // Add the newly crafted item to the item pool
        this.itemPool.push(item);
        console.log(`✨ Added ${item.name} to item pool`);
    }

    // Update currency after crafting cost is paid
    updateCurrency(newAmount) {
        this.playerCurrency = newAmount;
        this.updateCurrencyDisplay();
        this.renderShopItems(); // Update buy button states
    }
}

