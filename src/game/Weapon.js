// Weapon Class
// Handles auto-firing and targeting

class Weapon {
    constructor(scene, owner, projectileManager, enemyManager) {
        this.scene = scene;
        this.owner = owner; // Player or entity that owns this weapon
        this.projectileManager = projectileManager;
        this.enemyManager = enemyManager;
        
        // Weapon stats
        this.baseDamage = 10;
        this.fireRateCooldown = 0; // Countdown timer
        
        console.log('✅ Weapon created');
    }

    update(deltaTime) {
        // Decrease cooldown
        if (this.fireRateCooldown > 0) {
            this.fireRateCooldown -= deltaTime;
            return;
        }

        // Try to fire
        this.tryFire();
    }

    tryFire() {
        // Find nearest enemy
        const ownerPos = this.owner.getPosition();
        const nearestEnemy = this.enemyManager.findNearest(ownerPos.x, ownerPos.y);
        
        if (!nearestEnemy) {
            return; // No target
        }

        // Fire at enemy's physics body center (not sprite center)
        const targetX = nearestEnemy.sprite.body.x + nearestEnemy.sprite.body.halfWidth;
        const targetY = nearestEnemy.sprite.body.y + nearestEnemy.sprite.body.halfHeight;
        const damage = this.calculateDamage();
        
        this.projectileManager.fire(
            ownerPos.x,
            ownerPos.y,
            targetX,
            targetY,
            damage
        );

        // Set cooldown based on attack speed
        const attackSpeed = this.owner.stats.attackSpeed || 1;
        this.fireRateCooldown = 1000 / attackSpeed; // Convert to milliseconds
    }

    calculateDamage() {
        const damageBonus = this.owner.stats.damageBonus || 0;
        return this.baseDamage + damageBonus;
    }
}

