// Projectile Class
// Handles individual bullets/projectiles

class Projectile {
    constructor(scene, x, y, damage) {
        this.scene = scene;
        this.damage = damage;
        
        // Create projectile sprite (yellow circle)
        this.sprite = scene.add.circle(x, y, 4, 0xffeb3b);
        scene.physics.add.existing(this.sprite);
        
        // Store reference
        this.sprite.projectileData = this;
        this.isActive = true;
        
        // Lifetime (auto-destroy after distance/time)
        this.maxDistance = 800;
        this.startX = x;
        this.startY = y;
    }

    setVelocity(targetX, targetY) {
        // Calculate direction to target
        const angle = Phaser.Math.Angle.Between(
            this.sprite.x, 
            this.sprite.y, 
            targetX, 
            targetY
        );
        
        // Set velocity toward target
        const speed = 400;
        this.sprite.body.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );
    }

    update() {
        if (!this.isActive) return;

        // Check if traveled too far
        const distance = Phaser.Math.Distance.Between(
            this.startX, 
            this.startY, 
            this.sprite.x, 
            this.sprite.y
        );
        
        if (distance > this.maxDistance) {
            this.destroy();
        }
    }

    destroy() {
        if (!this.isActive) return;
        
        this.isActive = false;
        this.sprite.destroy();
    }

    getDamage() {
        return this.damage;
    }
}

// Projectile Manager
// Manages all active projectiles

class ProjectileManager {
    constructor(scene) {
        this.scene = scene;
        this.projectiles = [];
        this.projectileGroup = scene.physics.add.group();
        
        console.log('✅ Projectile Manager initialized');
    }

    fire(x, y, targetX, targetY, damage) {
        const projectile = new Projectile(this.scene, x, y, damage);
        this.projectiles.push(projectile);
        this.projectileGroup.add(projectile.sprite);
        
        // Set velocity AFTER adding to physics group (important!)
        projectile.setVelocity(targetX, targetY);
        
        return projectile;
    }

    update() {
        // Update all projectiles
        this.projectiles.forEach(projectile => {
            if (projectile.isActive) {
                projectile.update();
            }
        });

        // Clean up destroyed projectiles
        this.projectiles = this.projectiles.filter(p => p.isActive);
    }

    getGroup() {
        return this.projectileGroup;
    }

    getCount() {
        return this.projectiles.length;
    }
}

