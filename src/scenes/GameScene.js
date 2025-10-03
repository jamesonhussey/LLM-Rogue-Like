// Main Game Scene
// Orchestrates all game entities and logic

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // No assets to load yet - using colored circles
    }

    create() {
        // Get canvas dimensions
        const width = this.scale.width;
        const height = this.scale.height;

        // Create simple background
        this.add.rectangle(0, 0, width, height, 0x0a0a0a).setOrigin(0);
        
        // Add grid pattern for visual reference
        const graphics = this.add.graphics();
        graphics.lineStyle(1, 0x222222, 0.3);
        for (let x = 0; x < width; x += 50) {
            graphics.lineBetween(x, 0, x, height);
        }
        for (let y = 0; y < height; y += 50) {
            graphics.lineBetween(0, y, width, y);
        }

        // Initialize game entities
        this.player = new Player(this, width / 2, height / 2);
        this.enemyManager = new EnemyManager(this);
        this.projectileManager = new ProjectileManager(this);

        // Give player a weapon
        const weapon = new Weapon(this, this.player, this.projectileManager, this.enemyManager);
        this.player.setWeapon(weapon);

        // Spawn initial test enemy
        this.enemyManager.spawn(width / 2 + 200, height / 2);

        // Setup collisions
        this.setupCollisions();

        // Input controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        };

        // Debug/Test controls
        this.setupDebugControls();

        // Debug text
        this.debugText = this.add.text(10, 10, '', {
            fontSize: '14px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 5, y: 5 }
        });

        // Game state
        this.isGameOver = false;

        // Initialize Game Over Screen
        this.gameOverScreen = new GameOverScreen(() => this.restartGame());

        console.log('✅ Game scene created');
    }

    setupCollisions() {
        // Collision between projectiles and enemies
        this.physics.add.overlap(
            this.projectileManager.getGroup(),
            this.enemyManager.enemyGroup,
            this.onProjectileHitEnemy,
            null,
            this
        );
    }

    onProjectileHitEnemy(projectileSprite, enemySprite) {
        // Get data from sprites
        const projectile = projectileSprite.projectileData;
        const enemy = enemySprite.enemyData;

        if (!projectile || !enemy || !projectile.isActive || !enemy.isAlive) {
            return;
        }

        // Apply damage
        enemy.takeDamage(projectile.getDamage());

        // Destroy projectile
        projectile.destroy();
    }

    setupDebugControls() {
        // T key: Damage nearest enemy
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T).on('down', () => {
            const nearest = this.enemyManager.findNearest(this.player.sprite.x, this.player.sprite.y);
            if (nearest) {
                nearest.takeDamage(10);
                console.log('🔨 Test damage applied to nearest enemy');
            }
        });

        // E key: Spawn new enemy at test location
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E).on('down', () => {
            const width = this.scale.width;
            const height = this.scale.height;
            this.enemyManager.spawn(width / 2 + 200, height / 2);
            console.log('🎯 New enemy spawned (E key)');
        });

        // K key: Kill player (test game over)
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K).on('down', () => {
            this.player.stats.currentHealth = 0;
            console.log('☠️ Player killed (K key - testing game over)');
        });
    }

    update(time, delta) {
        // Stop updates if game over
        if (this.isGameOver) {
            return;
        }

        // Check for game over
        if (this.player.stats.currentHealth <= 0) {
            this.triggerGameOver();
            return;
        }

        // Update player
        this.player.update(this.cursors, this.wasd);

        // Update weapon (auto-fire)
        if (this.player.weapon) {
            this.player.weapon.update(delta);
        }

        // Update projectiles
        this.projectileManager.update();

        // Update enemies
        this.enemyManager.update();

        // Update debug text
        this.updateDebugText();
    }

    triggerGameOver() {
        this.isGameOver = true;
        
        // Show game over screen
        this.gameOverScreen.show();

        // Pause physics
        this.physics.pause();
    }

    restartGame() {
        console.log('🔄 Restarting game...');
        
        // Reset game state
        this.isGameOver = false;

        // Resume physics
        this.physics.resume();

        // Reset player
        const width = this.scale.width;
        const height = this.scale.height;
        this.player.sprite.setPosition(width / 2, height / 2);
        this.player.sprite.body.setVelocity(0, 0);
        this.player.stats.currentHealth = this.player.stats.maxHealth;

        // Clear all enemies
        this.enemyManager.getEnemies().forEach(enemy => {
            if (enemy.isAlive) {
                enemy.kill();
            }
        });

        // Clear all projectiles
        this.projectileManager.projectiles.forEach(projectile => {
            if (projectile.isActive) {
                projectile.destroy();
            }
        });

        // Spawn initial enemy
        this.enemyManager.spawn(width / 2 + 200, height / 2);

        console.log('✅ Game restarted');
    }

    updateDebugText() {
        const playerPos = this.player.getPosition();
        const nearestEnemy = this.enemyManager.findNearest(playerPos.x, playerPos.y);
        const enemyInfo = nearestEnemy 
            ? `Nearest Enemy: ${Math.round(Phaser.Math.Distance.Between(playerPos.x, playerPos.y, nearestEnemy.sprite.x, nearestEnemy.sprite.y))}px`
            : 'No enemies';

        this.debugText.setText([
            `Player: (${Math.round(playerPos.x)}, ${Math.round(playerPos.y)})`,
            `Health: ${this.player.stats.currentHealth}/${this.player.stats.maxHealth}`,
            `Damage: ${this.player.stats.damageBonus} | Attack Speed: ${this.player.stats.attackSpeed}`,
            `Enemies: ${this.enemyManager.getCount()} | Projectiles: ${this.projectileManager.getCount()}`,
            enemyInfo,
            '',
            'Controls: WASD or Arrow Keys',
            'Press E to spawn enemy | Press K to test game over'
        ]);
    }

    // Public method to apply item effects to player
    applyItemEffectsToPlayer(item) {
        this.player.applyItemEffects(item);
    }
}

