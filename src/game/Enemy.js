// Enemy Class and Manager
// Handles enemy entities, health bars, and spawning

class Enemy {
    constructor(scene, x, y) {
        this.scene = scene;
        
        // Create enemy sprite (mummy, 64x64)
        this.sprite = scene.add.sprite(x, y, 'mummy', 0);
        scene.physics.add.existing(this.sprite);
        this.sprite.body.setCollideWorldBounds(true);
        
        // Manual collision body setup
        const hitboxRadius = 12; // Physics radius
        const spriteSize = 64; // 64x64 sprite
        const circleOffsetX = ((spriteSize - hitboxRadius * 2) / 2) + 5; // Center horizontally
        const circleOffsetY = ((spriteSize - hitboxRadius * 2) / 2) + 17; // Center vertically
        
        this.sprite.body.setCircle(hitboxRadius, circleOffsetX, circleOffsetY);
        this.sprite.body.setBounce(0.3); // Slight bounce to separate overlapping enemies
        
        // Play walk animation
        this.sprite.play('mummy_walk');

        // Enemy stats
        this.maxHealth = 50;
        this.currentHealth = 50;
        this.speed = 60; // Movement speed
        this.contactDamage = 10; // Damage dealt to player on contact

        // Create health bar
        const barWidth = 40;
        const barHeight = 5;
        const barOffsetY = -20;

        // Background (dark gray)
        this.healthBarBg = scene.add.rectangle(x, y + barOffsetY, barWidth, barHeight, 0x333333);
        
        // Fill (green - shows current health)
        this.healthBarFill = scene.add.rectangle(x, y + barOffsetY, barWidth, barHeight, 0x4caf50);
        this.healthBarFill.setOrigin(0, 0.5); // Anchor to left side for scaling

        // Store reference
        this.sprite.enemyData = this;
        
        this.isAlive = true;
    }

    update(playerX, playerY) {
        if (!this.isAlive) return;

        // Move toward player
        if (playerX !== undefined && playerY !== undefined) {
            const angle = Phaser.Math.Angle.Between(
                this.sprite.x, 
                this.sprite.y, 
                playerX, 
                playerY
            );
            
            this.sprite.body.setVelocity(
                Math.cos(angle) * this.speed,
                Math.sin(angle) * this.speed
            );
            
            // Flip sprite based on horizontal movement direction
            if (this.sprite.body.velocity.x < 0) {
                this.sprite.setFlipX(true);  // Moving left - flip
            } else if (this.sprite.body.velocity.x > 0) {
                this.sprite.setFlipX(false); // Moving right - don't flip
            }
            // If velocity.x === 0 (moving straight up/down), keep current facing
        }

        // Update health bar position to follow enemy
        const x = this.sprite.x;
        const y = this.sprite.y - 20;
        
        this.healthBarBg.setPosition(x, y);
        this.healthBarFill.setPosition(x - 20, y); // Offset for left-anchored scaling

        // Update health bar width based on current health
        const healthPercent = this.currentHealth / this.maxHealth;
        this.healthBarFill.scaleX = healthPercent;

        // Change color based on health
        if (healthPercent > 0.6) {
            this.healthBarFill.setFillStyle(0x4caf50); // Green
        } else if (healthPercent > 0.3) {
            this.healthBarFill.setFillStyle(0xffa726); // Orange
        } else {
            this.healthBarFill.setFillStyle(0xf44336); // Red
        }
        
        // Clamp enemy position to map bounds
        if (this.scene.mapBounds) {
            this.sprite.x = Phaser.Math.Clamp(this.sprite.x, this.scene.mapBounds.minX, this.scene.mapBounds.maxX);
            this.sprite.y = Phaser.Math.Clamp(this.sprite.y, this.scene.mapBounds.minY, this.scene.mapBounds.maxY);
        }
    }

    takeDamage(amount) {
        this.currentHealth -= amount;
        
        if (this.currentHealth <= 0) {
            this.currentHealth = 0;
            this.kill();
        }
    }

    kill() {
        console.log('💀 Enemy killed');
        
        this.isAlive = false;
        
        // Drop currency at death position
        if (this.scene.currencyManager) {
            this.scene.currencyManager.spawn(this.sprite.x, this.sprite.y, 10); // 10 gold per enemy
        }
        
        // Remove health bar
        this.healthBarBg.destroy();
        this.healthBarFill.destroy();
        
        // Remove sprite
        this.sprite.destroy();
    }

    getPosition() {
        return { x: this.sprite.x, y: this.sprite.y };
    }
}

// Enemy Manager
// Handles spawning, tracking, and managing all enemies

class EnemyManager {
    constructor(scene) {
        this.scene = scene;
        this.enemies = [];
        this.enemyGroup = scene.physics.add.group();
        
        console.log('✅ Enemy Manager initialized');
    }

    spawn(x, y) {
        const enemy = new Enemy(this.scene, x, y);
        this.enemies.push(enemy);
        this.enemyGroup.add(enemy.sprite);
        
        console.log(`👾 Enemy spawned at (${x}, ${y})`);
        return enemy;
    }

    update(playerX, playerY) {
        // Update all enemies (pass player position for movement)
        this.enemies.forEach(enemy => {
            if (enemy.isAlive) {
                enemy.update(playerX, playerY);
            }
        });

        // Clean up dead enemies
        this.enemies = this.enemies.filter(enemy => enemy.isAlive);
    }

    findNearest(x, y) {
        if (this.enemies.length === 0) return null;

        let nearest = null;
        let nearestDist = Infinity;

        this.enemies.forEach(enemy => {
            if (!enemy.isAlive) return;
            
            const dist = Phaser.Math.Distance.Between(x, y, enemy.sprite.x, enemy.sprite.y);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = enemy;
            }
        });

        return nearest;
    }

    getCount() {
        return this.enemies.length;
    }

    getEnemies() {
        return this.enemies;
    }
}

