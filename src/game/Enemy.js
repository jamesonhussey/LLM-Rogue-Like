// Enemy Class and Manager
// Handles enemy entities, health bars, and spawning

class Enemy {
    constructor(scene, x, y) {
        this.scene = scene;
        
        // Create enemy sprite (red circle)
        this.sprite = scene.add.circle(x, y, 12, 0xff4444);
        scene.physics.add.existing(this.sprite);
        this.sprite.body.setCollideWorldBounds(true);

        // Enemy stats
        this.maxHealth = 50;
        this.currentHealth = 50;
        this.speed = 0; // Stationary for now

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

    update() {
        if (!this.isAlive) return;

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

    update() {
        // Update all enemies
        this.enemies.forEach(enemy => {
            if (enemy.isAlive) {
                enemy.update();
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

