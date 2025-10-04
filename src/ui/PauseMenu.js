// PauseMenu Class
// Manages the pause menu UI that appears when ESC is pressed

class PauseMenu {
    constructor(resumeCallback, restartCallback) {
        this.modal = document.getElementById('pause-modal');
        this.resumeButton = document.getElementById('resume-btn');
        this.restartButton = document.getElementById('restart-from-pause-btn');
        
        this.resumeCallback = resumeCallback;
        this.restartCallback = restartCallback;

        this.setupEventListeners();
        console.log('✅ Pause Menu initialized');
    }

    setupEventListeners() {
        // Resume button
        if (this.resumeButton) {
            this.resumeButton.addEventListener('click', () => {
                this.hide();
                this.resumeCallback();
            });
        }

        // Restart button
        if (this.restartButton) {
            this.restartButton.addEventListener('click', () => {
                this.hide();
                this.restartCallback();
            });
        }

        // Note: No "click outside to close" as per user request
    }

    show(playerStats, playerInventory, roundNumber, currency) {
        if (!this.modal) return;

        // Update all content
        this.updateRoundInfo(roundNumber, currency);
        this.updatePlayerStats(playerStats);
        this.updateEquippedItems(playerInventory);

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

    updateRoundInfo(roundNumber, currency) {
        const infoDiv = document.getElementById('pause-round-info');
        if (!infoDiv) return;

        infoDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; font-size: 1.3em;">
                <span>📍 Round ${roundNumber}</span>
                <span>💰 ${currency}</span>
            </div>
        `;
    }

    updatePlayerStats(stats) {
        const statsDiv = document.getElementById('pause-player-stats');
        if (!statsDiv) return;

        const statEntries = [
            { label: 'Health', value: `${Math.round(stats.currentHealth)} / ${stats.maxHealth}`, icon: '❤️' },
            { label: 'Health Regen', value: stats.healthRegen, icon: '💚' },
            { label: 'Armor', value: stats.armor, icon: '🛡️' },
            { label: 'Speed', value: stats.speed, icon: '⚡' },
            { label: 'Dodge', value: `${stats.dodge}%`, icon: '💨' },
            { label: 'Luck', value: stats.luck, icon: '🍀' },
            { label: 'Damage Bonus', value: `+${stats.damageBonus}`, icon: '⚔️' },
            { label: 'Crit Chance', value: `${stats.critChance}%`, icon: '💥' },
            { label: 'Attack Speed', value: `${stats.attackSpeed}x`, icon: '🔫' },
            { label: 'Pickup Range', value: stats.pickup_range, icon: '🧲' },
            { label: 'XP Gain', value: `${stats.xp_gain}x`, icon: '⭐' }
        ];

        const statsHTML = statEntries.map(stat => {
            return `
                <div class="pause-stat-item">
                    <span class="pause-stat-label">${stat.icon} ${stat.label}</span>
                    <span class="pause-stat-value">${stat.value}</span>
                </div>
            `;
        }).join('');

        statsDiv.innerHTML = `
            <h3>Player Stats</h3>
            <div class="pause-stats-grid">
                ${statsHTML}
            </div>
        `;
    }

    updateEquippedItems(playerInventory) {
        const itemsDiv = document.getElementById('pause-equipped-items');
        if (!itemsDiv) return;

        // playerInventory is array of { item, count }
        if (!playerInventory || playerInventory.length === 0) {
            itemsDiv.innerHTML = `
                <h3>Equipped Items</h3>
                <div class="pause-no-items">No items equipped yet</div>
            `;
            return;
        }

        const itemsHTML = playerInventory.map(stack => {
            const item = stack.item;
            const count = stack.count;
            const countText = count > 1 ? ` x${count}` : '';

            const rarityEmoji = {
                common: '⚪',
                uncommon: '🟢',
                rare: '🔵',
                epic: '🟣',
                legendary: '🟡'
            };

            // Get non-zero effects
            const effectsEntries = Object.entries(item.effects)
                .filter(([key, value]) => value !== 0);

            const effectsHTML = effectsEntries.length > 0 
                ? effectsEntries.map(([key, value]) => {
                    const sign = value > 0 ? '+' : '';
                    const displayName = key.replace(/([A-Z])/g, ' $1').trim();
                    const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
                    const valueClass = value > 0 ? 'positive' : 'negative';
                    
                    return `<span class="pause-effect-line ${valueClass}">${sign}${value} ${capitalizedName}</span>`;
                }).join('')
                : '<span class="pause-no-effects">No stat effects</span>';

            return `
                <div class="pause-item ${item.rarity}">
                    <div class="pause-item-name">
                        ${rarityEmoji[item.rarity] || '⚪'} ${item.name}${countText}
                    </div>
                    <div class="pause-item-effects">
                        ${effectsHTML}
                    </div>
                </div>
            `;
        }).join('');

        itemsDiv.innerHTML = `
            <h3>Equipped Items (${playerInventory.length})</h3>
            <div class="pause-items-list">
                ${itemsHTML}
            </div>
        `;
    }
}

