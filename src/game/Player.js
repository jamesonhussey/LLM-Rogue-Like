// Player Class
// Handles player entity, movement, and stats

class Player {
    constructor(scene, x, y, mapBounds) {
        this.scene = scene;
        this.mapBounds = mapBounds; // Store map bounds for position clamping
        
        // Create player sprite (32x32 adventurer)
        this.sprite = scene.add.sprite(x, y, 'player', 0);
        
        // Scale sprite visually to 2x (32x32 → 64x64)
        this.sprite.setScale(2);
        
        // Add physics AFTER scaling
        scene.physics.add.existing(this.sprite);
        // Don't use world bounds - we'll clamp to map bounds manually
        this.sprite.body.setCollideWorldBounds(false);
        
        // Set physics body: radius 12, centered horizontally, adjusted vertically
        const hitboxRadius = 8; // Desired collision radius in world pixels
        const visualSize = 64; // 32 * 2 scale
        const circleOffsetX = 5;
        const circleOffsetY = 10; // Adjusted up by 10 pixels
        
        this.sprite.body.setCircle(hitboxRadius, circleOffsetX, circleOffsetY);
        
        // Play idle animation
        this.sprite.play('player_idle');
        
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
            xp_gain: 1,
            currency: 1000 // Gold collected
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
            
            // Update animation based on direction
            if (direction.y < 0) {
                // Moving up/north - use backwards facing animation
                this.sprite.play('player_walk_up', true);
                this.sprite.setFlipX(false);
            } else if (direction.x !== 0) {
                // Moving left/right (or diagonally down) - use side walking animation
                this.sprite.play('player_walk_side', true);
                this.sprite.setFlipX(direction.x < 0); // Flip if moving left
            } else {
                // Moving down - use side walking animation (no flip)
                this.sprite.play('player_walk_side', true);
                this.sprite.setFlipX(false);
            }
        } else {
            // No input - stop immediately
            this.sprite.body.setVelocity(0, 0);
            
            // Play idle animation
            this.sprite.play('player_idle', true);
        }
        
        // Clamp player position to map bounds
        if (this.mapBounds) {
            this.sprite.x = Phaser.Math.Clamp(this.sprite.x, this.mapBounds.minX, this.mapBounds.maxX);
            this.sprite.y = Phaser.Math.Clamp(this.sprite.y, this.mapBounds.minY, this.mapBounds.maxY);
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
        
        // Return actual damage dealt (for iframe calculation)
        return actualDamage;
    }

    getPosition() {
        return { x: this.sprite.x, y: this.sprite.y };
    }
}

