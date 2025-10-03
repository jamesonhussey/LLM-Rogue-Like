// Player Class
// Handles player entity, movement, and stats

class Player {
    constructor(scene, x, y) {
        this.scene = scene;
        
        // Create player sprite (green circle)
        this.sprite = scene.add.circle(x, y, 15, 0x4caf50);
        scene.physics.add.existing(this.sprite);
        this.sprite.body.setCollideWorldBounds(true);
        
        // Set smaller collision body (80% of visual size for better overlap with enemies)
        this.sprite.body.setCircle(12); // Visual radius 15, physics radius 12
        
        // No drag - using velocity-based movement like enemies

        // Player stats (will be affected by items)
        this.stats = {
            maxHealth: 100,
            currentHealth: 100,
            speed: 200,
            damageBonus: 0,
            armor: 0,
            critChance: 0,
            attackSpeed: 1,
            healthRegen: 0,
            dodge: 0,
            luck: 0,
            pickup_range: 100,
            xp_gain: 1
        };

        // Weapon will be set by GameScene
        this.weapon = null;

        console.log('✅ Player created');
    }

    setWeapon(weapon) {
        this.weapon = weapon;
    }

    update(cursors, wasd) {
        // Player movement (velocity-based like enemies)
        const direction = new Phaser.Math.Vector2(0, 0);
        
        // Check WASD and arrow keys
        if (cursors.left.isDown || wasd.left.isDown) {
            direction.x = -1;
        } else if (cursors.right.isDown || wasd.right.isDown) {
            direction.x = 1;
        }
        
        if (cursors.up.isDown || wasd.up.isDown) {
            direction.y = -1;
        } else if (cursors.down.isDown || wasd.down.isDown) {
            direction.y = 1;
        }

        // Apply movement directly with velocity (like enemies)
        if (direction.x !== 0 || direction.y !== 0) {
            // Normalize diagonal movement
            direction.normalize();
            
            // Apply velocity based on speed stat
            const speed = this.stats.speed;
            this.sprite.body.setVelocity(direction.x * speed, direction.y * speed);
        } else {
            // No input - stop immediately
            this.sprite.body.setVelocity(0, 0);
        }
    }

    applyItemEffects(item) {
        if (!item || !item.effects) return;

        // Apply each effect
        for (const [key, value] of Object.entries(item.effects)) {
            if (this.stats.hasOwnProperty(key)) {
                this.stats[key] += value;
            }
        }

        // Update current health if max health changed
        if (item.effects.maxHealth) {
            this.stats.currentHealth = Math.min(
                this.stats.currentHealth + item.effects.maxHealth,
                this.stats.maxHealth
            );
        }

        console.log(`✨ Applied item effects from: ${item.name}`);
        console.log('Player stats:', this.stats);
    }

    takeDamage(amount) {
        // Reduce damage by armor (simple formula: 1 armor = 1% damage reduction)
        const damageReduction = Math.min(this.stats.armor, 75) / 100; // Cap at 75% reduction
        const actualDamage = Math.round(amount * (1 - damageReduction));
        
        this.stats.currentHealth -= actualDamage;
        if (this.stats.currentHealth < 0) {
            this.stats.currentHealth = 0;
        }
        
        console.log(`💥 Player took ${actualDamage} damage (Health: ${this.stats.currentHealth}/${this.stats.maxHealth})`);
    }

    getPosition() {
        return { x: this.sprite.x, y: this.sprite.y };
    }
}

