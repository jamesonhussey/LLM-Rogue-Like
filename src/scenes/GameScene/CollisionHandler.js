// Collision Handler
// Manages all collision logic and damage calculations

class CollisionHandler {
    constructor(scene, player, visualEffects) {
        this.scene = scene;
        this.player = player;
        this.visualEffects = visualEffects;
        
        // Track dynamic iframes for player damage
        this.lastEnemyDamageTime = 0;
        this.currentIframeDuration = 0; // In milliseconds
    }

    /**
     * Setup all collision handlers in the scene
     */
    setupCollisions(projectileManager, enemyManager, currencyManager) {
        // Store references
        this.projectileManager = projectileManager;
        this.enemyManager = enemyManager;
        this.currencyManager = currencyManager;

        // Collision between projectiles and enemies (damage)
        this.scene.physics.add.overlap(
            projectileManager.getGroup(),
            enemyManager.enemyGroup,
            (projectileSprite, enemySprite) => this.onProjectileHitEnemy(projectileSprite, enemySprite),
            null,
            this
        );

        // Overlap between player and enemies (damage detection)
        this.scene.physics.add.overlap(
            this.player.sprite,
            enemyManager.enemyGroup,
            (playerSprite, enemySprite) => this.onPlayerHitEnemy(playerSprite, enemySprite),
            null,
            this
        );

        // Physical collision between player and enemies (blocking movement)
        this.scene.physics.add.collider(
            this.player.sprite,
            enemyManager.enemyGroup
        );

        // Physical collision between enemies (prevent full overlap)
        this.scene.physics.add.collider(
            enemyManager.enemyGroup,
            enemyManager.enemyGroup
        );

        // Overlap between player and currency (pickup)
        this.scene.physics.add.overlap(
            this.player.sprite,
            currencyManager.getGroup(),
            (playerSprite, currencySprite) => {
                currencyManager.onCurrencyPickup(playerSprite, currencySprite);
            },
            null,
            this
        );
    }

    /**
     * Handle projectile hitting an enemy
     */
    onProjectileHitEnemy(projectileSprite, enemySprite) {
        // Get data from sprites
        const projectile = projectileSprite.projectileData;
        const enemy = enemySprite.enemyData;

        if (!projectile || !enemy || !projectile.isActive || !enemy.isAlive) {
            return;
        }

        // Get base damage
        let damage = projectile.getDamage();
        
        // Calculate if this hit is a crit
        const critChance = this.player.stats.critChance;
        const isCrit = Math.random() * 100 < critChance;
        
        // Apply crit multiplier (2x damage)
        if (isCrit) {
            damage = Math.round(damage * 2);
        }

        // Apply damage
        enemy.takeDamage(damage);

        // Show damage number at enemy position
        this.visualEffects.showDamageNumber(enemy.sprite.x, enemy.sprite.y, damage, isCrit);

        // Destroy projectile
        projectile.destroy();
    }

    /**
     * Handle player collision with enemy
     */
    onPlayerHitEnemy(playerSprite, enemySprite) {
        // Check iframes from previous hit (dynamic duration)
        if (this.scene.time.now < this.lastEnemyDamageTime + this.currentIframeDuration) {
            return;
        }

        const enemy = enemySprite.enemyData;
        if (!enemy || !enemy.isAlive) {
            return;
        }

        // Dodge roll (capped at 60%)
        const dodgeChance = Math.min(this.player.stats.dodge, 60);
        const dodgeRoll = Math.random() * 100;
        
        if (dodgeRoll < dodgeChance) {
            // Dodge successful!
            this.visualEffects.showDodgeEffect(this.player.sprite.x, this.player.sprite.y);
            
            // Set minimum iframe for dodge (0.2s)
            this.currentIframeDuration = 200; // 0.2s in milliseconds
            this.lastEnemyDamageTime = this.scene.time.now;
            return; // Skip damage entirely
        }

        // Apply damage and get actual damage dealt (armor-aware)
        const actualDamage = this.player.takeDamage(enemy.contactDamage);
        
        // Show damage number on player
        this.visualEffects.showPlayerDamageNumber(this.player.sprite.x, this.player.sprite.y, actualDamage);
        
        // Calculate iframe duration using Brotato formula
        // Iframe Duration = 0.4s * (Damage % of Max HP) / 15%
        const damagePercent = (actualDamage / this.player.stats.maxHealth) * 100;
        const baseIframe = 0.4 * (damagePercent / 15); // In seconds
        
        // Clamp to min 0.2s, max 0.4s, round to 3 decimal places
        const clampedIframe = Math.max(0.2, Math.min(0.4, baseIframe));
        const roundedIframe = Math.round(clampedIframe * 1000) / 1000; // 3 decimal places
        
        // Convert to milliseconds and store
        this.currentIframeDuration = roundedIframe * 1000;
        this.lastEnemyDamageTime = this.scene.time.now;
        
        console.log(`🛡️ Iframe: ${roundedIframe.toFixed(3)}s (${actualDamage} dmg = ${damagePercent.toFixed(1)}% of max HP)`);
    }
}

