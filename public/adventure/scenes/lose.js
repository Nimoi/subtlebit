import {Scene} from './index.js';

export class loseScene extends Scene {
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
        this.ctx.font = '20px serif';
        this.ctx.fillStyle = `rgba(240,245,250,0.5)`;
        this.ctx.fillText(
            'You died!',
            (this.canvas.width * 0.5) - 10,
            this.baseline + 10
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
}
