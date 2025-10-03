// Game Over Screen
// Handles the game over UI overlay

class GameOverScreen {
    constructor(onRestart) {
        this.onRestart = onRestart;
        this.modal = document.getElementById('game-over-modal');
        this.restartBtn = document.getElementById('restart-btn');
        
        this.setupEventListeners();
        
        console.log('✅ Game Over Screen initialized');
    }

    setupEventListeners() {
        if (this.restartBtn) {
            this.restartBtn.addEventListener('click', () => {
                this.hide();
                if (this.onRestart) {
                    this.onRestart();
                }
            });
        }
    }

    show() {
        if (this.modal) {
            this.modal.style.display = 'flex';
            console.log('💀 Game Over screen shown');
        }
    }

    hide() {
        if (this.modal) {
            this.modal.style.display = 'none';
            console.log('🔄 Game Over screen hidden');
        }
    }

    isVisible() {
        return this.modal && this.modal.style.display === 'flex';
    }
}

