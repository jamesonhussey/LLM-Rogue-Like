// CurrencyManager Class
// Manages all currency drops in the game

class CurrencyManager {
    constructor(scene) {
        this.scene = scene;
        this.currencies = [];
        this.currencyGroup = scene.physics.add.group();
        
        console.log('✅ Currency Manager initialized');
    }

    spawn(x, y, value = 10) {
        const currency = new Currency(this.scene, x, y, value);
        this.currencies.push(currency);
        this.currencyGroup.add(currency.sprite);
        
        return currency;
    }

    update(playerX, playerY, playerPickupRange) {
        // Update all active currencies
        this.currencies.forEach(currency => {
            if (currency.isActive) {
                currency.update(playerX, playerY, playerPickupRange);
            }
        });

        // Clean up inactive currencies
        this.currencies = this.currencies.filter(c => c.isActive);
    }

    onCurrencyPickup(playerSprite, currencySprite) {
        const currencyData = currencySprite.currencyData;
        if (!currencyData) return;

        const value = currencyData.pickup();
        
        // Add to player's currency
        if (this.scene.player) {
            this.scene.player.stats.currency += value;
            
            // Update UI
            if (this.scene.updateCurrencyUI) {
                this.scene.updateCurrencyUI();
            }
        }
    }

    clearAll() {
        this.currencies.forEach(currency => {
            if (currency.isActive) {
                currency.destroy();
            }
        });
        this.currencies = [];
    }

    getCount() {
        return this.currencies.length;
    }

    getGroup() {
        return this.currencyGroup;
    }
}

