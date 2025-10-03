// Player Class
// Handles player entity, movement, and stats

class Player {
    constructor(scene, x, y) {
        this.scene = scene;
        
        // Create player sprite (green circle)
        this.sprite = scene.add.circle(x, y, 15, 0x4caf50);
        scene.physics.add.existing(this.sprite);
        this.sprite.body.setCollideWorldBounds(true);
        this.sprite.body.setDrag(800);
        this.sprite.body.setMaxVelocity(300);

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

        console.log('✅ Player created');
    }

    update(cursors, wasd) {
        // Player movement
        const velocity = new Phaser.Math.Vector2(0, 0);
        
        // Check WASD and arrow keys
        if (cursors.left.isDown || wasd.left.isDown) {
            velocity.x = -1;
        } else if (cursors.right.isDown || wasd.right.isDown) {
            velocity.x = 1;
        }
        
        if (cursors.up.isDown || wasd.up.isDown) {
            velocity.y = -1;
        } else if (cursors.down.isDown || wasd.down.isDown) {
            velocity.y = 1;
        }

        // Normalize diagonal movement
        velocity.normalize();
        
        // Apply movement
        const speed = this.stats.speed;
        this.sprite.body.setAcceleration(velocity.x * speed * 10, velocity.y * speed * 10);
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

    getPosition() {
        return { x: this.sprite.x, y: this.sprite.y };
    }
}

