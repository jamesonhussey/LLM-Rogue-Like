// HealthBar Class
// Manages the player health bar UI display

class HealthBar {
    constructor(scene, x, y) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        
        const barWidth = 200;
        const barHeight = 25;

        // Label
        this.label = scene.add.text(x, y - 15, 'Health', {
            fontSize: '16px',
            fill: '#ffffff',
            fontStyle: 'bold'
        });

        // Background bar (dark gray)
        this.background = scene.add.rectangle(x, y, barWidth, barHeight, 0x333333);
        this.background.setOrigin(0, 0);

        // Foreground bar (green - shows current health)
        this.fill = scene.add.rectangle(x + 2, y + 2, barWidth - 4, barHeight - 4, 0x4caf50);
        this.fill.setOrigin(0, 0);

        // Health text (shows numbers)
        this.text = scene.add.text(x + barWidth / 2, y + barHeight / 2, '', {
            fontSize: '14px',
            fill: '#ffffff',
            fontStyle: 'bold'
        });
        this.text.setOrigin(0.5, 0.5);

        // Store dimensions
        this.maxBarWidth = barWidth - 4; // Account for padding
        this.barWidth = barWidth;
        this.barHeight = barHeight;

        console.log('✅ Health Bar UI initialized');
    }

    update(currentHealth, maxHealth) {
        const healthPercent = currentHealth / maxHealth;

        // Update bar width
        this.fill.width = this.maxBarWidth * healthPercent;

        // Update color based on health percentage
        if (healthPercent > 0.6) {
            this.fill.setFillStyle(0x4caf50); // Green
        } else if (healthPercent > 0.3) {
            this.fill.setFillStyle(0xffa726); // Orange
        } else {
            this.fill.setFillStyle(0xf44336); // Red
        }

        // Update text
        this.text.setText(`${Math.max(0, Math.round(currentHealth))} / ${maxHealth}`);
    }

    // Optional: Hide/show methods for future use
    hide() {
        this.label.setVisible(false);
        this.background.setVisible(false);
        this.fill.setVisible(false);
        this.text.setVisible(false);
    }

    show() {
        this.label.setVisible(true);
        this.background.setVisible(true);
        this.fill.setVisible(true);
        this.text.setVisible(true);
    }
}

