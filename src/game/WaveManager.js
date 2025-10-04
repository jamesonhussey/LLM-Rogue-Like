// WaveManager Class
// Manages round timers, wave spawning, and difficulty progression

class WaveManager {
    constructor(scene, enemyManager) {
        this.scene = scene;
        this.enemyManager = enemyManager;

        // Current state
        this.currentRound = 1;
        this.currentWaveInRound = 0;
        this.isRoundActive = false;
        this.isWaveSpawning = false;

        // Timers
        this.roundTimeRemaining = 0; // milliseconds
        this.waveTimerRemaining = 0; // milliseconds
        this.graceTimeRemaining = 0; // milliseconds (2 second delay after clearing wave)

        // Difficulty parameters (will be calculated per round)
        this.roundDuration = 0;
        this.enemiesPerWave = 0;
        this.waveTimer = 0;
        this.spawnRate = 0; // milliseconds between each enemy spawn within a wave

        // Spawn tracking
        this.enemiesSpawnedThisWave = 0;
        this.enemiesToSpawnThisWave = 0;
        this.nextSpawnTime = 0;

        console.log('✅ Wave Manager initialized');
    }

    // Start a new round
    startRound() {
        this.currentRound++;
        this.currentWaveInRound = 0;
        this.isRoundActive = true;

        // Calculate difficulty for this round
        this.calculateRoundDifficulty();

        // Set round timer
        this.roundTimeRemaining = this.roundDuration * 1000; // convert to ms

        console.log(`🌊 Starting Round ${this.currentRound} (${this.roundDuration}s)`);
        console.log(`   Enemies/Wave: ${this.enemiesPerWave} | Wave Timer: ${this.waveTimer}s | Spawn Rate: ${this.spawnRate}ms`);

        // Start first wave immediately
        this.startNextWave();
    }

    // Calculate difficulty parameters for current round
    calculateRoundDifficulty() {
        const round = this.currentRound;

        // Round duration (30s → 90s)
        if (round <= 5) {
            this.roundDuration = 30;
        } else if (round <= 10) {
            this.roundDuration = 45;
        } else if (round <= 15) {
            this.roundDuration = 60;
        } else {
            this.roundDuration = 90;
        }

        // Enemies per wave (gradual increase - whole numbers only)
        this.enemiesPerWave = 5 + (round - 1) * 2; // R1=5, R2=7, R3=9, R10=23, R20=43

        // Wave timer (time before forced next wave) - consistent 10 seconds for now
        this.waveTimer = 10;

        // Spawn rate (time between each enemy spawn within a wave) - specific values per round
        // Earlier rounds: slower spawns, later rounds: faster spawns
        let totalSpawnTime;
        if (round <= 3) {
            totalSpawnTime = 2000; // 2 seconds to spawn full wave
        } else if (round <= 6) {
            totalSpawnTime = 2500; // 2.5 seconds
        } else if (round <= 10) {
            totalSpawnTime = 3000; // 3 seconds
        } else if (round <= 15) {
            totalSpawnTime = 4000; // 4 seconds
        } else {
            totalSpawnTime = 5000; // 5 seconds
        }
        
        this.spawnRate = totalSpawnTime / this.enemiesPerWave;
    }

    // Start spawning the next wave
    startNextWave() {
        if (!this.isRoundActive) return;

        this.currentWaveInRound++;
        this.isWaveSpawning = true;
        this.enemiesSpawnedThisWave = 0;
        this.enemiesToSpawnThisWave = this.enemiesPerWave;
        
        // Reset wave timer to 10 seconds every time a new wave starts
        this.waveTimerRemaining = this.waveTimer * 1000; // convert to ms
        this.nextSpawnTime = this.scene.time.now;

        // Clear grace period if it was active
        this.graceTimeRemaining = 0;

        console.log(`   ⚔️ Wave ${this.currentWaveInRound} spawning (${this.enemiesToSpawnThisWave} enemies)`);
    }

    // Update wave manager each frame
    update(delta) {
        if (!this.isRoundActive) return;

        // Update round timer
        this.roundTimeRemaining -= delta;

        if (this.roundTimeRemaining <= 0) {
            this.endRound();
            return;
        }

        // Handle grace period (2 second delay after clearing wave)
        if (this.graceTimeRemaining > 0) {
            this.graceTimeRemaining -= delta;
            if (this.graceTimeRemaining <= 0) {
                this.startNextWave(); // This will reset waveTimerRemaining
            }
            return; // Skip other checks during grace period
        }

        // Update wave timer (always counting down - forces next wave after 10 seconds)
        this.waveTimerRemaining -= delta;

        if (this.waveTimerRemaining <= 0) {
            // Wave timer expired - force next wave regardless of enemy state
            console.log(`   ⏰ Wave timer expired - forcing next wave`);
            this.startNextWave(); // This will reset waveTimerRemaining
            return;
        }

        // Spawn enemies gradually (if currently spawning a wave)
        if (this.isWaveSpawning && this.enemiesSpawnedThisWave < this.enemiesToSpawnThisWave) {
            if (this.scene.time.now >= this.nextSpawnTime) {
                this.spawnEnemy();
                this.enemiesSpawnedThisWave++;
                this.nextSpawnTime = this.scene.time.now + this.spawnRate;

                // Check if wave spawning is complete
                if (this.enemiesSpawnedThisWave >= this.enemiesToSpawnThisWave) {
                    this.isWaveSpawning = false;
                    console.log(`   ✅ Wave ${this.currentWaveInRound} fully spawned`);
                }
            }
        }

        // Check if all enemies cleared (trigger grace period)
        // Only check this if we're not currently spawning and grace period isn't already active
        if (!this.isWaveSpawning && this.graceTimeRemaining === 0) {
            if (this.enemyManager.getCount() === 0) {
                console.log(`   🎯 All enemies cleared - starting grace period`);
                this.graceTimeRemaining = 2000; // 2 second grace period
            }
        }
    }

    // Spawn a single enemy at random position within screen bounds
    spawnEnemy() {
        const width = this.scene.scale.width;
        const height = this.scene.scale.height;

        // Random position within screen bounds (with small margin from edges)
        const margin = 30;
        const x = Phaser.Math.Between(margin, width - margin);
        const y = Phaser.Math.Between(margin, height - margin);

        this.enemyManager.spawn(x, y);
    }

    // End the current round
    endRound() {
        console.log(`🏁 Round ${this.currentRound} complete!`);
        
        this.isRoundActive = false;
        this.isWaveSpawning = false;

        // Remove all remaining enemies (don't kill them, just remove)
        this.removeAllEnemies();

        // Trigger round complete event
        this.scene.events.emit('roundComplete', this.currentRound);
    }

    // Remove all enemies without killing them
    removeAllEnemies() {
        const enemies = this.enemyManager.getEnemies();
        enemies.forEach(enemy => {
            if (enemy.isAlive) {
                // Remove sprites and health bars
                enemy.sprite.destroy();
                enemy.healthBarBg.destroy();
                enemy.healthBarFill.destroy();
                enemy.isAlive = false;
            }
        });
        // Clear the array
        this.enemyManager.enemies = [];
        console.log('   🧹 Cleared all remaining enemies');
    }

    // Get round info for UI display
    getRoundInfo() {
        return {
            roundNumber: this.currentRound,
            timeRemaining: Math.max(0, Math.ceil(this.roundTimeRemaining / 1000)),
            enemyCount: this.enemyManager.getCount(),
            isActive: this.isRoundActive
        };
    }

    // Check if currently in grace period
    isInGracePeriod() {
        return this.graceTimeRemaining > 0;
    }
}

