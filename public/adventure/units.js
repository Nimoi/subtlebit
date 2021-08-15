import {mapRange} from './range.js';

class Unit {
    constructor(ctx, data) {
        this.ctx = ctx;
        this.data = data;
        this.x = data.x;
        this.y = data.y;
        this.width = data.width;
        this.height = data.height;
        this.health = data.health;
        this.indicators = [];
    }

    process() {
        this.indicators = this.indicators.filter((indicator) => {
            return ! indicator.finished;
        });
        this.indicators.forEach((indicator) => {
            indicator.process();
        });
    }

    damage(amount) {
        if (amount > 0) {
            this.health -= amount;
            if (this.health < 0) {
                this.health = 0;
            }
            this.indicators.push(new DamageIndicator(this, amount));
            return;
        }
        this.miss();
    }

    miss() {
        this.indicators.push(new MissIndicator(this));
    }

    drawHealthBar() {
        // Health - Background
        this.ctx.fillStyle = '#3f0000';
        this.ctx.fillRect(
            this.x,
            this.y - 4,
            this.width,
            4
        );

        // Health - Foreground
        this.ctx.fillStyle = '#a60000';
        this.ctx.fillRect(
            this.x,
            this.y - 4,
            mapRange(this.health, 0, this.data.record.stats.health_max, 0, this.width),
            4
        );
    }

    drawNameBar() {
        this.ctx.fillStyle = 'rgba(255,255,255,0.1)';
        this.ctx.fillRect(
            this.x,
            this.y - 24,
            this.width,
            18
        );
    }

    drawName() {
        this.ctx.fillStyle = this.data.color;
        this.ctx.font = '14px serif';
        let textWidth = this.ctx.measureText(this.data.name).width;
        this.ctx.fillText(
            this.data.name,
            this.x + (this.width - textWidth) / 2,
            this.y-10
        );
    }
}

export class Player extends Unit {
    draw() {
        this.ctx.drawImage(
            this.data.logo, 
            this.x, 
            this.y, 
            this.width, 
            this.height
        );

        this.drawHealthBar();
        this.drawNameBar();
        this.drawName();

        this.indicators.forEach((indicator) => {
            indicator.draw();
        });
    }
}

export class Enemy extends Unit {
    draw() {
        this.ctx.fillStyle = this.data.color;
        this.ctx.fillRect(
            this.x,
            this.y,
            this.width,
            this.height
        );

        this.drawHealthBar();
        this.drawNameBar();
        this.drawName();

        this.indicators.forEach((indicator) => {
            indicator.draw();
        });
    }
}

class Indicator {
    constructor(parent, text) {
        this.parent = parent;
        this.ctx = parent.ctx;
        this.text = text;
        this.maxFrames = 50;
        this.frames = 0;
        this.finished = 0;
        this.color = '#aaa';
        this.font = '14px serif';
    }

    process() {
        this.frames++;
        if (this.frames < this.maxFrames) {
            return;
        }
        this.finished = 1;
    }

    draw() {
        this.ctx.fillStyle = this.color;
        this.ctx.font = this.font;
        let textWidth = this.ctx.measureText(this.text).width;
        this.ctx.fillText(
            this.text,
            this.parent.x + (this.parent.width - textWidth) / 2,
            this.parent.y - 20 - (this.frames)
        );
    }
}

class DamageIndicator extends Indicator {
    constructor(parent, text) {
        super(parent, text);
        this.color = '#ff2211';
    }
}

class MissIndicator extends Indicator {
    constructor(parent) {
        super(parent, 'miss');
        this.color = '#ffd500';
    }
}

class HealthIndicator extends Indicator {
    constructor(parent, text) {
        super(parent, text);
        this.color = '#3bc43b';
    }
}
