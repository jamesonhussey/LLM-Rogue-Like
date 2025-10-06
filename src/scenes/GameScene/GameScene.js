// Main Game Scene
// Orchestrates all game entities and logic

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // Load map background
        this.load.image('map_normal', 'assets/images/backgrounds/normal_map_no_walls_smoothed.png');
        // this.load.image('map_pixel', 'assets/images/backgrounds/map_pixel_art.png'); // Alternative
        
        // Load player sprite sheet (416x480, 13x15 grid, 32x32 frames)
        this.load.spritesheet('player', 'assets/images/characters/Adventurer Sprite Sheet v1.5.png', {
            frameWidth: 32,
            frameHeight: 32
        });
    }

    createPlayerAnimations() {
        // Idle animation (row 1, frames 0-12)
        this.anims.create({
            key: 'player_idle',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 12 }),
            frameRate: 10,
            repeat: -1
        });

        // Walk up/north (row 9, frames 104-107 = 8*13 to 8*13+3)
        this.anims.create({
            key: 'player_walk_up',
            frames: this.anims.generateFrameNumbers('player', { start: 104, end: 107 }),
            frameRate: 8,
            repeat: -1
        });

        // Walk side (row 2, frames 13-20 = 1*13 to 1*13+7)
        this.anims.create({
            key: 'player_walk_side',
            frames: this.anims.generateFrameNumbers('player', { start: 13, end: 20 }),
            frameRate: 10,
            repeat: -1
        });
    }

    create() {
        // Get canvas dimensions
        const width = this.scale.width;
        const height = this.scale.height;

        // Set pixel art rendering (crisp, no blur/smoothing)
        this.textures.get('player').setFilter(Phaser.Textures.FilterMode.NEAREST);

        // Add map background (1024x1024, maintaining aspect ratio)
        // Scale to fit height (600x600) to preserve square aspect ratio
        this.add.image(width / 2, height / 2, 'map_normal').setDisplaySize(height, height);

        // Create player animations
        this.createPlayerAnimations();

        // Initialize game entities
        this.player = new Player(this, width / 2, height / 2);
        this.enemyManager = new EnemyManager(this);
        this.projectileManager = new ProjectileManager(this);
        this.currencyManager = new CurrencyManager(this);

        // Give player a weapon
        const weapon = new Weapon(this, this.player, this.projectileManager, this.enemyManager);
        this.player.setWeapon(weapon);

        // Initialize Wave Manager
        this.waveManager = new WaveManager(this, this.enemyManager);

        // Initialize helper managers
        this.visualEffects = new VisualEffects(this);
        this.collisionHandler = new CollisionHandler(this, this.player, this.visualEffects);
        this.debugManager = new DebugManager(this, this.player, this.enemyManager, this.waveManager, this.projectileManager);

        // Setup collisions (delegated to CollisionHandler)
        this.collisionHandler.setupCollisions(this.projectileManager, this.enemyManager, this.currencyManager);

        // Input controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        };

        // ESC key: Toggle pause menu
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC).on('down', () => {
            this.togglePause();
        });

        // Create UI elements
        this.healthBar = new HealthBar(this, 15, 20);

        // Currency UI (top-right corner)
        this.currencyText = this.add.text(width - 15, 20, '💰 0', {
            fontSize: '20px',
            fill: '#ffd700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(1, 0).setScrollFactor(0); // Anchor to top-right, fixed to camera

        // Game state
        this.isGameOver = false;
        this.isPaused = false;

        // Health regeneration tracking
        this.lastHealthRegenTime = 0;

        // Initialize UI Screens
        this.gameOverScreen = new GameOverScreen(() => this.restartGame());
        this.shopScreen = new ShopScreen(() => this.startNextRound());
        this.pauseMenu = new PauseMenu(
            () => this.resumeGame(),
            () => {
                this.pauseMenu.hide();
                this.resumeGame();
                this.restartGame();
            }
        );

        // Round HUD elements
        this.roundNumberText = document.getElementById('round-number');
        this.roundTimerText = document.getElementById('round-timer');
        this.enemyCountText = document.getElementById('enemy-count');

        // Listen for round complete event
        this.events.on('roundComplete', (roundNumber) => {
            this.onRoundComplete(roundNumber);
        });

        // Start first round
        this.waveManager.startRound();

        console.log('✅ Game scene created');
    }

    update(time, delta) {
        // Stop updates if game over, paused, or in shop
        if (this.isGameOver || this.isPaused || this.shopScreen.isVisible()) {
            return;
        }

        // Health regeneration
        if (this.player.stats.healthRegen > 0 && 
            this.player.stats.currentHealth < this.player.stats.maxHealth) {
            
            // Recalculate interval based on current HP_Regen stat (always up-to-date!)
            const regenInterval = this.calculateHealthRegenInterval();
            
            if (this.time.now >= this.lastHealthRegenTime + regenInterval) {
                // Heal 1 HP
                this.player.stats.currentHealth = Math.min(
                    this.player.stats.currentHealth + 1,
                    this.player.stats.maxHealth
                );
                
                // Show heal effect at player position
                this.visualEffects.showHealEffect(this.player.sprite.x, this.player.sprite.y);
                
                // Reset timer
                this.lastHealthRegenTime = this.time.now;
            }
        }

        // Check for game over
        if (this.player.stats.currentHealth <= 0) {
            this.triggerGameOver();
            return;
        }

        // Update wave manager (handles round timer, wave spawning)
        this.waveManager.update(delta);

        // Update player
        this.player.update(this.cursors, this.wasd);

        // Update weapon (auto-fire)
        if (this.player.weapon) {
            this.player.weapon.update(delta);
        }

        // Update projectiles
        this.projectileManager.update();

        // Update enemies (pass player position for chasing)
        const playerPos = this.player.getPosition();
        this.enemyManager.update(playerPos.x, playerPos.y);

        // Update currency (magnetic pull toward player)
        this.currencyManager.update(playerPos.x, playerPos.y, this.player.stats.pickup_range);

        // Update UI
        this.healthBar.update(this.player.stats.currentHealth, this.player.stats.maxHealth);
        this.updateRoundHUD();
        this.debugManager.update();
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
        this.player.stats.currency = 0; // Reset currency on full game restart

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

        // Clear all currency drops
        this.currencyManager.clearAll();

        // Clear player's run inventory (items they've bought this run)
        itemStorage.clearPlayerRunInventory();

        // Reset wave manager and start from round 1
        this.waveManager.currentRound = 0; // Will become 1 when startRound() is called
        this.waveManager.startRound();

        console.log('✅ Game restarted');
    }

    updateRoundHUD() {
        const roundInfo = this.waveManager.getRoundInfo();
        
        if (this.roundNumberText) {
            this.roundNumberText.textContent = `Round: ${roundInfo.roundNumber}`;
        }
        if (this.roundTimerText) {
            this.roundTimerText.textContent = `Time: ${roundInfo.timeRemaining}s`;
        }
        if (this.enemyCountText) {
            this.enemyCountText.textContent = `Enemies: ${roundInfo.enemyCount}`;
        }
    }

    updateCurrencyUI() {
        if (this.currencyText) {
            this.currencyText.setText(`💰 ${this.player.stats.currency}`);
        }
    }

    calculateHealthRegenInterval() {
        const hpRegen = this.player.stats.healthRegen;
        
        // Brotato formula: seconds to regenerate 1 HP
        // HPEveryXSeconds = 5.0 / (1.0 + ((HP_Regen - 1) / 2.25))
        const secondsPer1HP = 5.0 / (1.0 + ((hpRegen - 1) / 2.25));
        
        // Convert to milliseconds
        return secondsPer1HP * 1000;
    }

    togglePause() {
        // Don't allow pausing if game over or in shop
        if (this.isGameOver || this.shopScreen.isVisible()) {
            return;
        }

        if (this.isPaused) {
            // Resume
            this.resumeGame();
        } else {
            // Pause
            this.pauseGame();
        }
    }

    pauseGame() {
        this.isPaused = true;
        this.physics.pause();

        // Show pause menu with current data
        const playerInventory = itemStorage.getPlayerRunInventory();
        const roundInfo = this.waveManager.getRoundInfo();
        
        this.pauseMenu.show(
            this.player.stats,
            playerInventory,
            roundInfo.roundNumber,
            this.player.stats.currency
        );

        console.log('⏸️ Game paused');
    }

    resumeGame() {
        this.isPaused = false;
        this.physics.resume();
        this.pauseMenu.hide();
        console.log('▶️ Game resumed');
    }

    onRoundComplete(roundNumber) {
        console.log(`🎉 Round ${roundNumber} complete event received`);
        
        // Clear all projectiles
        this.projectileManager.projectiles.forEach(projectile => {
            if (projectile.isActive) {
                projectile.destroy();
            }
        });
        console.log('   🧹 Cleared all projectiles');
        
        // Pause physics
        this.physics.pause();

        // Show shop screen (only after Round 1+, always show for now)
        const itemPool = itemStorage.getAllItems(); // Get all discovered items
        this.shopScreen.show(roundNumber, this.player.stats.currency, itemPool);
    }

    startNextRound() {
        console.log('▶️ Starting next round...');
        
        // Reset player position to center
        const width = this.scale.width;
        const height = this.scale.height;
        this.player.sprite.setPosition(width / 2, height / 2);
        this.player.sprite.body.setVelocity(0, 0);
        console.log('   📍 Player repositioned to center');
        
        // Heal player to full health
        this.player.stats.currentHealth = this.player.stats.maxHealth;
        console.log(`   💚 Player healed to full (${this.player.stats.maxHealth} HP)`);
        
        // Resume physics
        this.physics.resume();

        // Start next round
        this.waveManager.startRound();
    }

    // Public method to apply item effects to player
    applyItemEffectsToPlayer(item) {
        this.player.applyItemEffects(item);
    }
}

