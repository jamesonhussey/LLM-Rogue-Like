// Item Storage & Caching System
// Manages combination history and inventory

class ItemStorage {
    constructor() {
        this.combinationHistory = new Map(); // Cache for combinations
        this.inventory = [...STARTING_ITEMS]; // All available items
        this.loadFromLocalStorage();
    }

    // Generate cache key from two items
    getCacheKey(item1Id, item2Id) {
        // Sort IDs to ensure "A+B" and "B+A" are treated the same
        const sorted = [item1Id, item2Id].sort();
        return `${sorted[0]}+${sorted[1]}`;
    }

    // Check if combination exists in cache
    hasCombination(item1Id, item2Id) {
        const key = this.getCacheKey(item1Id, item2Id);
        return this.combinationHistory.has(key);
    }

    // Get cached combination result
    getCachedCombination(item1Id, item2Id) {
        const key = this.getCacheKey(item1Id, item2Id);
        return this.combinationHistory.get(key);
    }

    // Store new combination result
    storeCombination(item1Id, item2Id, resultItem) {
        const key = this.getCacheKey(item1Id, item2Id);
        const record = {
            item: resultItem,
            timestamp: Date.now(),
            parents: [item1Id, item2Id]
        };
        
        this.combinationHistory.set(key, record);
        this.addToInventory(resultItem);
        this.saveToLocalStorage();
        
        return resultItem;
    }

    // Add item to inventory
    addToInventory(item) {
        // Check if item already exists
        const exists = this.inventory.find(i => i.id === item.id);
        if (!exists) {
            this.inventory.push(item);
        }
    }

    // Get all items in inventory
    getAllItems() {
        return this.inventory;
    }

    // Get only starting items
    getStartingItems() {
        return this.inventory.filter(item => item.isStartingItem);
    }

    // Get only generated items
    getGeneratedItems() {
        return this.inventory.filter(item => !item.isStartingItem);
    }

    // Save to localStorage for persistence
    saveToLocalStorage() {
        try {
            const data = {
                inventory: this.inventory,
                history: Array.from(this.combinationHistory.entries())
            };
            localStorage.setItem('itemFusionData', JSON.stringify(data));
        } catch (e) {
            console.warn('Failed to save to localStorage:', e);
        }
    }

    // Load from localStorage
    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('itemFusionData');
            if (saved) {
                const data = JSON.parse(saved);
                
                // Restore inventory (merge with starting items)
                const savedGenerated = data.inventory.filter(item => !item.isStartingItem);
                this.inventory = [...STARTING_ITEMS, ...savedGenerated];
                
                // Restore history
                if (data.history) {
                    this.combinationHistory = new Map(data.history);
                }
                
                console.log('📦 Loaded saved progress:', {
                    items: this.inventory.length,
                    combinations: this.combinationHistory.size
                });
            }
        } catch (e) {
            console.warn('Failed to load from localStorage:', e);
        }
    }

    // Clear all data (useful for testing)
    clearAll() {
        this.combinationHistory.clear();
        this.inventory = [...STARTING_ITEMS];
        localStorage.removeItem('itemFusionData');
        console.log('🗑️ Cleared all data');
    }

    // Get statistics
    getStats() {
        return {
            totalItems: this.inventory.length,
            startingItems: this.getStartingItems().length,
            generatedItems: this.getGeneratedItems().length,
            totalCombinations: this.combinationHistory.size
        };
    }
}

// Create global instance
const itemStorage = new ItemStorage();

