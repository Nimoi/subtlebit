import {Scene} from './index.js';
import {mapRange} from '../range.js';

export class winScene extends Scene {
    process() {
        this.frames++;
        if (this.frames < 100) {
            return;
        }
        this.finished = 1;
    }

    draw() {
        this.resetMap();
        this.drawLogo();
        this.drawName();
        this.drawTitle();
        this.drawExperience();

        if (this.data.decideTakeItem) {
            this.drawItem();
        }
    }

    drawName() {
        this.ctx.font = '20px serif';
        this.ctx.fillStyle = this.data.context.color;
        this.ctx.fillText(
            this.data.context['display-name'],
            (this.canvas.width * 0.5) - 10,
            this.baseline - 10
        );
    }

    drawTitle() {
        let title = `You defeated ${this.data.enemy.name}!`;
        this.ctx.font = '20px serif';
        this.ctx.fillStyle = `rgba(240,245,250,0.5)`;
        this.ctx.fillText(
            title,
            (this.canvas.width * 0.5) - 10,
            this.baseline + 10
        );
    }

    drawItem() {
        let item = `You found a ${this.data.item.item.name}`;
        this.ctx.font = '16px serif';
        this.ctx.fillStyle = `rgba(240,245,250,0.75)`;
        this.ctx.fillText(
            item,
            (this.canvas.width * 0.5) - 10,
            this.baseline - 40
        );
    }

    drawLogo() {
        this.ctx.drawImage(
            this.data.logo, 
            (this.canvas.width * 0.5) - 120,
            this.baseline - 60, //+ 100 + (this.canvas.height - this.baseline),
            100, 
            100
        );
    }

    drawExperience() {
        // Experience Background
        this.ctx.fillStyle = '#4c6972';
        this.ctx.fillRect(
            (this.canvas.width * 0.5) - 10,
            this.baseline + 20,
            100,
            10
        );

        // 
        let previousLevelXp = this.data.levels[this.data.record.level],
            nextLevelXp = this.data.levels[this.data.record.level + 1],
            currentXpWidth = mapRange(this.data.record.experience, previousLevelXp, nextLevelXp, 0, 100),
            updatedXp = this.data.record.experience + this.data.battle.experience,
            updatedXpWidth = mapRange(updatedXp, previousLevelXp, nextLevelXp, 0, 100),
            currentFrameWidth = mapRange(this.frames, 0, 100, currentXpWidth, updatedXpWidth);

        // Experience foreground
        this.ctx.fillStyle = '#0390bb';
        this.ctx.fillRect(
            (this.canvas.width * 0.5) - 10,
            this.baseline + 20,
            currentFrameWidth,
            10
        );

        this.ctx.font = '12px serif';
        this.ctx.fillStyle = `rgba(240,245,250,0.75)`;
        this.ctx.fillText(
            `You earned ${this.data.battle.experience} XP`,
            (this.canvas.width * 0.5) - 10,
            this.baseline + 30
        );
    }
}
