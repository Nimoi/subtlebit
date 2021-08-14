import {Scene} from './index.js';
import {placeScene} from './place.js';

export class titleScene extends Scene {
    constructor(canvas, ctx, data) {
        super(canvas, ctx, data);
        this.maxFrames = 30*3;
    }

    process() {
        this.frames++;
        if (this.frames === this.maxFrames) {
            this.finished = 1;
        }
    }

    draw() {
        this.resetMap();
        this.drawLogo();
        if (this.frames > 20) {
            this.drawName();
        }
        if (this.frames > 40) {
            this.drawTitle();
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
        this.ctx.font = '20px serif';
        this.ctx.fillStyle = `rgba(240,245,250,0.5)`;
        this.ctx.fillText(
            'goes on an adventure!',
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

    nextScene() {
        return new placeScene(this.canvas, this.ctx, this.data);
    }
}
