// Debug Manager
// Handles debug controls and debug information display

class DebugManager {
    constructor(scene, player, enemyManager, waveManager, projectileManager) {
        this.scene = scene;
        this.player = player;
        this.enemyManager = enemyManager;
        this.waveManager = waveManager;
        this.projectileManager = projectileManager;
        
        // Create debug text display
        this.debugText = scene.add.text(10, 90, '', {
            fontSize: '14px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 5, y: 5 }
        });
        
        // Setup debug key bindings
        this.setupDebugControls();
    }

    /**
     * Setup debug keyboard controls
     */
    setupDebugControls() {
        // T key: Damage nearest enemy
        this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T).on('down', () => {
            const nearest = this.enemyManager.findNearest(this.player.sprite.x, this.player.sprite.y);
            if (nearest) {
                nearest.takeDamage(10);
                console.log('🔨 Test damage applied to nearest enemy');
            }
        });

        // E key: Spawn new enemy at test location
        this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E).on('down', () => {
            const width = this.scene.scale.width;
            const height = this.scene.scale.height;
            this.enemyManager.spawn(width / 2 + 200, height / 2);
            console.log('🎯 New enemy spawned (E key)');
        });

        // K key: Kill player (test game over)
        this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K).on('down', () => {
            this.player.stats.currentHealth = 0;
            console.log('☠️ Player killed (K key - testing game over)');
        });

        // N key: Force next round (skip to between rounds)
        this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.N).on('down', () => {
            if (this.waveManager.isRoundActive) {
                this.waveManager.roundTimeRemaining = 0;
                console.log('⏩ Forcing round end (N key)');
            }
        });
    }

    /**
     * Update debug text display
     */
    update() {
        const playerPos = this.player.getPosition();
        const stats = this.player.stats;
        const nearestEnemy = this.enemyManager.findNearest(playerPos.x, playerPos.y);
        const enemyInfo = nearestEnemy 
            ? `Nearest Enemy: ${Math.round(Phaser.Math.Distance.Between(playerPos.x, playerPos.y, nearestEnemy.sprite.x, nearestEnemy.sprite.y))}px`
            : 'No enemies';

        const roundInfo = this.waveManager.getRoundInfo();
        const graceStatus = this.waveManager.isInGracePeriod() ? ' [GRACE]' : '';

        this.debugText.setText([
            `=== PLAYER STATS ===`,
            `Position: (${Math.round(playerPos.x)}, ${Math.round(playerPos.y)})`,
            `Health: ${Math.round(stats.currentHealth)}/${stats.maxHealth} | Regen: ${stats.healthRegen}`,
            `Speed: ${stats.speed} | Armor: ${stats.armor} | Dodge: ${stats.dodge}%`,
            `Damage: +${stats.damageBonus} | Crit: ${stats.critChance}% | Atk Speed: ${stats.attackSpeed}`,
            `Luck: ${stats.luck} | XP Gain: ${stats.xp_gain}x | Pickup: ${stats.pickup_range}`,
            `Currency: 💰 ${stats.currency}`,
            ``,
            `=== WAVE INFO ===`,
            `Round: ${roundInfo.roundNumber} | Time: ${roundInfo.timeRemaining}s${graceStatus}`,
            `Wave: ${this.waveManager.currentWaveInRound} | Enemies: ${roundInfo.enemyCount} | Projectiles: ${this.projectileManager.getCount()}`,
            enemyInfo,
            '',
            'Controls: WASD or Arrow Keys',
            'E: spawn enemy | K: game over | N: next round'
        ]);
    }
}

