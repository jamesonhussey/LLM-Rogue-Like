// ShopCraftingUI Class
// Manages item crafting UI within the shop modal

class ShopCraftingUI {
    constructor() {
        this.currentCraftedItem = null;
        this.setupShopCrafting();
        console.log('✅ Shop Crafting UI initialized');
    }

    setupShopCrafting() {
        // Populate shop item selectors
        this.populateShopItemSelects();

        // Wire up shop combine button
        const shopCombineBtn = document.getElementById('shop-combine-btn');
        if (shopCombineBtn) {
            shopCombineBtn.addEventListener('click', () => {
                this.combineItemsInShop();
            });
        }

        // Wire up crafting result buttons
        const buyEquipBtn = document.getElementById('craft-buy-equip-btn');
        const addPoolBtn = document.getElementById('craft-add-pool-btn');
        const discardBtn = document.getElementById('craft-discard-btn');

        if (buyEquipBtn) {
            buyEquipBtn.addEventListener('click', () => {
                this.handleCraftResult('buy');
            });
        }
        if (addPoolBtn) {
            addPoolBtn.addEventListener('click', () => {
                this.handleCraftResult('pool');
            });
        }
        if (discardBtn) {
            discardBtn.addEventListener('click', () => {
                this.handleCraftResult('discard');
            });
        }
    }

    populateShopItemSelects() {
        const select1 = document.getElementById('shop-item1-select');
        const select2 = document.getElementById('shop-item2-select');

        if (!select1 || !select2) return;

        // Use player's CURRENT RUN inventory (items they've bought/equipped this run)
        const allItems = itemStorage.getPlayerRunInventory();

        // Deduplicate items by ID (prevent same item showing multiple times)
        const uniqueItems = [];
        const seenIds = new Set();
        
        allItems.forEach(item => {
            if (!seenIds.has(item.id)) {
                seenIds.add(item.id);
                uniqueItems.push(item);
            }
        });

        // Clear existing options
        select1.innerHTML = '<option value="">-- Select Item --</option>';
        select2.innerHTML = '<option value="">-- Select Item --</option>';

        // Add unique items (no grouping for simplicity in shop)
        uniqueItems.forEach(item => {
            const option1 = this.createItemOption(item);
            const option2 = this.createItemOption(item);
            select1.appendChild(option1);
            select2.appendChild(option2);
        });
    }

    createItemOption(item) {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = `${item.name} (${item.rarity})`;
        return option;
    }

    async combineItemsInShop() {
        const select1 = document.getElementById('shop-item1-select');
        const select2 = document.getElementById('shop-item2-select');
        const loadingDiv = document.getElementById('shop-crafting-loading');
        const resultDiv = document.getElementById('shop-crafting-result');
        const combineBtn = document.getElementById('shop-combine-btn');

        const item1Id = select1.value;
        const item2Id = select2.value;

        if (!item1Id || !item2Id) {
            alert('⚠️ Please select two items to combine');
            return;
        }

        // Check if player has enough currency
        const craftingCost = 50;
        if (typeof game !== 'undefined' && game.scene && game.scene.scenes[0]) {
            const gameScene = game.scene.scenes[0];
            if (gameScene.player.stats.currency < craftingCost) {
                alert(`⚠️ Not enough currency! Need ${craftingCost} gold.`);
                return;
            }
        }

        const item1 = itemStorage.getItemById(item1Id);
        const item2 = itemStorage.getItemById(item2Id);

        if (!item1 || !item2) {
            alert('⚠️ Could not find selected items');
            return;
        }

        // Show loading
        if (loadingDiv) loadingDiv.style.display = 'block';
        if (resultDiv) resultDiv.style.display = 'none';
        if (combineBtn) combineBtn.disabled = true;

        try {
            // Deduct crafting cost
            if (typeof game !== 'undefined' && game.scene && game.scene.scenes[0]) {
                const gameScene = game.scene.scenes[0];
                gameScene.player.stats.currency -= craftingCost;
                gameScene.updateCurrencyUI();
                
                // Update shop screen currency
                if (gameScene.shopScreen) {
                    gameScene.shopScreen.updateCurrency(gameScene.player.stats.currency);
                }
            }

            // Call LLM to generate item
            const result = await itemGenerator.combineItems(item1, item2);
            this.currentCraftedItem = result.item;

            // Display result
            this.displayCraftedItem(result.item, result.fromCache);

            // Hide loading, show result
            if (loadingDiv) loadingDiv.style.display = 'none';
            if (resultDiv) resultDiv.style.display = 'block';

        } catch (error) {
            console.error('❌ Error combining items in shop:', error);
            alert(`Error: ${error.message}`);

            // Refund crafting cost on error
            if (typeof game !== 'undefined' && game.scene && game.scene.scenes[0]) {
                const gameScene = game.scene.scenes[0];
                gameScene.player.stats.currency += craftingCost;
                gameScene.updateCurrencyUI();
                
                if (gameScene.shopScreen) {
                    gameScene.shopScreen.updateCurrency(gameScene.player.stats.currency);
                }
            }

            if (loadingDiv) loadingDiv.style.display = 'none';
        } finally {
            if (combineBtn) combineBtn.disabled = false;
        }
    }

    displayCraftedItem(item, fromCache) {
        const displayDiv = document.getElementById('crafted-item-display');
        if (!displayDiv) return;

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

        const effectsEntries = Object.entries(item.effects)
            .filter(([key, value]) => value !== 0);

        const effectsHTML = effectsEntries.length > 0 
            ? effectsEntries.map(([key, value]) => {
                const sign = value > 0 ? '+' : '';
                const displayName = key.replace(/([A-Z])/g, ' $1').trim();
                const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
                const valueClass = value > 0 ? 'positive' : 'negative';
                
                return `<span class="effect-line ${valueClass}">${sign}${value} ${capitalizedName}</span>`;
            }).join('<br>')
            : '<span style="color: var(--color-text-dim);">No stat effects</span>';

        const cost = this.getItemCostByRarity(item.rarity);

        displayDiv.innerHTML = `
            <div style="text-align: center;">
                <h3 style="color: ${rarityColors[item.rarity]};">
                    ${rarityEmoji[item.rarity]} ${item.name}
                </h3>
                <p style="color: var(--color-text-dim); font-style: italic; margin: 10px 0;">
                    "${item.description}"
                </p>
                <div style="background: rgba(15, 52, 96, 0.5); padding: 15px; border-radius: 8px; margin: 15px 0;">
                    ${effectsHTML}
                </div>
                <p style="font-size: 1.3em; font-weight: bold; color: #ffd700;">
                    Cost to buy: 💰 ${cost}
                </p>
            </div>
        `;

        // Update Buy & Equip button with cost
        const buyEquipBtn = document.getElementById('craft-buy-equip-btn');
        if (buyEquipBtn) {
            buyEquipBtn.textContent = `Buy & Equip (💰 ${cost})`;
        }
    }

    handleCraftResult(action) {
        if (!this.currentCraftedItem) {
            console.error('❌ No crafted item to handle');
            return;
        }

        const item = this.currentCraftedItem;
        const gameScene = typeof game !== 'undefined' && game.scene ? game.scene.scenes[0] : null;

        if (action === 'buy') {
            // Buy & Equip
            const cost = this.getItemCostByRarity(item.rarity);
            
            if (gameScene && gameScene.player.stats.currency < cost) {
                alert(`⚠️ Not enough currency! Need ${cost} gold.`);
                return;
            }

            // Deduct cost and apply item
            if (gameScene) {
                gameScene.player.stats.currency -= cost;
                gameScene.updateCurrencyUI();
                gameScene.player.applyItemEffects(item);
                
                if (gameScene.shopScreen) {
                    gameScene.shopScreen.updateCurrency(gameScene.player.stats.currency);
                }
            }

            // Add to player's current run inventory (for crafting)
            itemStorage.addToPlayerRunInventory(item);

            console.log(`✅ Bought & equipped: ${item.name}`);
            alert(`✅ Bought & equipped: ${item.name}`);

        } else if (action === 'pool') {
            // Add to Pool (free) - item is already in itemStorage from storeCombination()
            console.log(`✅ Added to pool: ${item.name}`);
            alert(`✅ Added to item pool: ${item.name}`);

        } else if (action === 'discard') {
            // Discard - remove the item from inventory since it was auto-added by storeCombination()
            itemStorage.removeFromInventory(item.id);
            
            console.log(`🗑️ Discarded: ${item.name}`);
            alert(`🗑️ Discarded: ${item.name}`);
        }

        // Hide result dialog
        const resultDiv = document.getElementById('shop-crafting-result');
        if (resultDiv) resultDiv.style.display = 'none';

        // Clear crafted item
        this.currentCraftedItem = null;

        // Refresh shop item selects and shop display
        this.populateShopItemSelects();
        
        // Refresh shop items display if shop is open
        if (gameScene && gameScene.shopScreen && gameScene.shopScreen.isVisible()) {
            const itemPool = itemStorage.getAllItems();
            gameScene.shopScreen.itemPool = itemPool;
            gameScene.shopScreen.generateShopItems();
            gameScene.shopScreen.displayPlayerInventory(); // Update inventory display
        }
    }

    getItemCostByRarity(rarity) {
        const costs = {
            common: 50,
            uncommon: 100,
            rare: 200,
            epic: 300,
            legendary: 500
        };
        return costs[rarity] || 50;
    }
}

