// BetweenRoundsScreen Class
// Manages the UI modal shown between rounds

class BetweenRoundsScreen {
    constructor(startNextRoundCallback) {
        this.modal = document.getElementById('between-rounds-modal');
        this.roundNumberText = document.getElementById('round-complete-number');
        this.startButton = document.getElementById('start-next-round-btn');
        this.startCallback = startNextRoundCallback;

        if (this.startButton) {
            this.startButton.addEventListener('click', () => {
                this.hide();
                this.startCallback();
            });
        }

        console.log('✅ Between Rounds Screen initialized');
    }

    show(roundNumber) {
        if (this.modal && this.roundNumberText) {
            this.roundNumberText.textContent = `Round ${roundNumber} Complete!`;
            this.modal.style.display = 'flex';
        }
    }

    hide() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
    }

    isVisible() {
        return this.modal && this.modal.style.display === 'flex';
    }
}

