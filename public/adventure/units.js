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
            mapRange(this.health, 0, 100, 0, this.width),
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
    }
}
