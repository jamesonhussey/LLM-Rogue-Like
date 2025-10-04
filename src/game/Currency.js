// Currency Class
// Handles individual currency drops that float toward the player

class Currency {
    constructor(scene, x, y, value = 10) {
        this.scene = scene;
        this.value = value;
        
        // Create currency sprite (small blue circle)
        this.sprite = scene.add.circle(x, y, 6, 0x3b82f6); // Bright blue
        scene.physics.add.existing(this.sprite);
        
        // Add a subtle white border for visibility
        this.sprite.setStrokeStyle(1, 0xffffff, 0.8);
        
        // Store reference
        this.sprite.currencyData = this;
        this.isActive = true;
        
        // Float/bob animation
        this.bobOffset = Math.random() * Math.PI * 2; // Random start phase
        this.bobSpeed = 2;
        this.bobAmount = 3;
        this.initialY = y;
        
        // Magnetic pull properties
        this.magnetSpeed = 150; // Speed when moving toward player
    }

    update(playerX, playerY, playerPickupRange) {
        if (!this.isActive) return;

        // Calculate distance to player
        const distance = Phaser.Math.Distance.Between(
            this.sprite.x,
            this.sprite.y,
            playerX,
            playerY
        );

        // If within pickup range, move toward player
        if (distance <= playerPickupRange) {
            const angle = Phaser.Math.Angle.Between(
                this.sprite.x,
                this.sprite.y,
                playerX,
                playerY
            );
            
            this.sprite.body.setVelocity(
                Math.cos(angle) * this.magnetSpeed,
                Math.sin(angle) * this.magnetSpeed
            );
        } else {
            // Otherwise, just bob in place
            this.sprite.body.setVelocity(0, 0);
            
            // Subtle bobbing animation
            const bobY = Math.sin(this.scene.time.now / 1000 * this.bobSpeed + this.bobOffset) * this.bobAmount;
            this.sprite.y = this.initialY + bobY;
        }
    }

    pickup() {
        if (!this.isActive) return 0;
        
        this.isActive = false;
        
        // Particle effect: create small burst of blue circles
        this.createPickupEffect();
        
        // Destroy sprite
        this.sprite.destroy();
        
        console.log(`💰 Picked up ${this.value} gold`);
        return this.value;
    }

    createPickupEffect() {
        // Simple particle burst
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 / 6) * i;
            const speed = 50;
            const particle = this.scene.add.circle(
                this.sprite.x,
                this.sprite.y,
                3,
                0x3b82f6,
                0.8
            );
            
            this.scene.physics.add.existing(particle);
            particle.body.setVelocity(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed
            );
            
            // Fade out and destroy
            this.scene.tweens.add({
                targets: particle,
                alpha: 0,
                scale: 0.5,
                duration: 300,
                onComplete: () => particle.destroy()
            });
        }
    }

    destroy() {
        if (!this.isActive) return;
        this.isActive = false;
        this.sprite.destroy();
    }
}

