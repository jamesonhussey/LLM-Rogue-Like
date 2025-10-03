// Phaser 3 Game Setup
// Main game initialization and configuration

// Phaser Game Configuration
const gameConfig = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    backgroundColor: '#0a0a0a',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [GameScene],
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// Initialize game when DOM is ready
window.addEventListener('load', () => {
    const game = new Phaser.Game(gameConfig);
    
    // Make game instance accessible globally for debugging
    window.phaserGame = game;
    
    console.log('🎮 Phaser game initialized');
});

