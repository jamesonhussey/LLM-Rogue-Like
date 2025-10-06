// Visual Effects Manager
// Handles all floating text and visual feedback effects

class VisualEffects {
    constructor(scene) {
        this.scene = scene;
    }

    /**
     * Show damage number when enemy takes damage
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} damage - Damage amount
     * @param {boolean} isCrit - Whether this is a critical hit
     */
    showDamageNumber(x, y, damage, isCrit = false) {
        // Create text at enemy position
        const color = isCrit ? '#ffd700' : '#ffffff';
        const fontSize = isCrit ? '24px' : '18px';
        const displayText = isCrit ? `${damage} ★` : `${damage}`;
        
        // Random horizontal offset to prevent stacking
        const offsetX = Phaser.Math.Between(-10, 10);
        
        const damageText = this.scene.add.text(x + offsetX, y, displayText, {
            fontSize: fontSize,
            fill: color,
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5, 0.5);
        
        // Animate: float up + fade out
        this.scene.tweens.add({
            targets: damageText,
            y: y - 60,  // Float upward 60 pixels
            alpha: 0,   // Fade to invisible
            duration: 1000,  // Over 1 second
            ease: 'Power2',
            onComplete: () => {
                damageText.destroy();  // Clean up
            }
        });
    }

    /**
     * Show damage number when player takes damage
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} damage - Damage amount
     */
    showPlayerDamageNumber(x, y, damage) {
        // Random horizontal offset to prevent stacking
        const offsetX = Phaser.Math.Between(-15, 15);
        
        const damageText = this.scene.add.text(x + offsetX, y, `-${damage}`, {
            fontSize: '20px',
            fill: '#ff3333', // Bright red
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5, 0.5);
        
        // Animate: float up + fade out
        this.scene.tweens.add({
            targets: damageText,
            y: y - 60,  // Float upward
            alpha: 0,   // Fade out
            duration: 900,
            ease: 'Power2',
            onComplete: () => {
                damageText.destroy();
            }
        });
    }

    /**
     * Show heal effect when player regenerates health
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    showHealEffect(x, y) {
        // Random horizontal offset to prevent stacking
        const offsetX = Phaser.Math.Between(-10, 10);
        
        const healText = this.scene.add.text(x + offsetX, y, '+', {
            fontSize: '20px',
            fill: '#4caf50', // Green
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5, 0.5);
        
        // Animate: float up + fade out + scale pulse
        this.scene.tweens.add({
            targets: healText,
            y: y - 50,  // Float upward 50 pixels
            alpha: 0,   // Fade to invisible
            scale: 0.8, // Scale pulse from 1.0 to 0.8
            duration: 800,  // Slightly faster than damage numbers
            ease: 'Power2',
            onComplete: () => {
                healText.destroy();  // Clean up
            }
        });
    }

    /**
     * Show dodge effect when player successfully dodges
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    showDodgeEffect(x, y) {
        // Random horizontal offset to prevent stacking
        const offsetX = Phaser.Math.Between(-15, 15);
        
        const dodgeText = this.scene.add.text(x + offsetX, y, 'DODGE!', {
            fontSize: '22px',
            fill: '#00bcd4', // Bright cyan
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5, 0.5);
        
        // Animate: float up + fade out + scale up (opposite of heal)
        this.scene.tweens.add({
            targets: dodgeText,
            y: y - 60,  // Float upward 60 pixels
            alpha: 0,   // Fade to invisible
            scale: 1.2, // Scale up from 1.0 to 1.2 for emphasis
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
                dodgeText.destroy();  // Clean up
            }
        });
    }
}

