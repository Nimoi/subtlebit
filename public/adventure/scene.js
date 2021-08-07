import {getRandomColor, getRandomItem} from './random.js';
import {Player, Enemy} from './units.js';
import {drawBackground, Trees, Rocks} from './environment.js';

class Scene {
    constructor(canvas, ctx, data) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.data = data;
        this.finished = 0;
        this.baseline = canvas.height - 40;
    }

    resetMap() {
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
};

export class titleScene extends Scene {
    constructor(canvas, ctx, data) {
        super(canvas, ctx, data);
        this.maxFrames = 30*3;
        this.frames = 0;
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
        return new travelScene(this.canvas, this.ctx, this.data);
    }
};

export class travelScene extends Scene {
    constructor(canvas, ctx, data) {
        super(canvas, ctx, data);
        this.place = {
            x: canvas.width - 170,
            y: canvas.height - 80,
            width: 160, 
            height: 100,
        };
        this.player = new Player(ctx, {
            x: 10,
            y: canvas.height - 80,
            width: 80,
            height: 80,
            color: data.context.color,
            name: data.context['display-name'],
            logo: data.logo,
            health: 100
        });
        this.trees = new Trees({ctx: ctx, biome: this.data.biome});
        this.rocks = new Rocks({
            ctx: ctx,
            biome: this.data.biome,
        });
    }

    process() {
        if (this.player.x < this.place.x - 10 - this.player.width) {
            this.player.x += 2;
            return;
        }
        this.finished = 1;
    }

    draw() {
        this.resetMap();
        drawBackground(this.ctx, this.data.biome);
        this.rocks.draw();
        this.trees.draw();
        this.player.draw();
        this.drawPlace();
    }

    drawPlace() {
        // Draw place
        this.ctx.fillStyle = "#aaa";
        this.ctx.fillRect(
            this.place.x,
            this.place.y,
            this.place.width,
            this.place.height
        );

        // Place Text
        this.ctx.fillStyle = "#333";
        this.ctx.fillText(
            `The ${this.data.place.type} of ${this.data.place.name}`,
            this.place.x + 20,
            this.place.y+this.place.height/2,
            this.place.width - 40
        );
    }

    nextScene() {
        return new placeScene(this.canvas, this.ctx, this.data);
    }
};

export class placeScene extends Scene {
    constructor(canvas, ctx, data) {
        super(canvas, ctx, data);
        this.player = new Player(ctx, {
            x: 10,
            y: canvas.height - 80,
            width: 80,
            height: 80,
            color: data.context.color,
            name: data.context['display-name'],
            logo: data.logo,
            health: 100
        });
        this.enemy = new Enemy(ctx, {
            x: canvas.width - 90,
            y: canvas.height - 80,
            width: 80, 
            height: 80,
            color: getRandomColor(),
            name: data.enemy.name,
            health: 100
        });
        this.frames = 0;
    }
    process() {
        this.frames++;
        if (this.player.x < this.enemy.x - 10 - this.player.width) {
            this.player.x += 3;
            this.enemy.x -= 3;
            return;
        }
        if (this.player.health && this.enemy.health) {
            if (this.frames % 10 == 0) {
                
            }
            return;
        }
        this.finished = 1;
    }
    draw() {
        this.resetMap();
        drawBackground(this.ctx, this.data.biome);
        this.player.draw();
        this.enemy.draw();

        // Sentence
        if (this.frames > 30 && this.frames < 30 * 3) {
            this.ctx.font = '14px serif';

            let textWidth = this.ctx.measureText(this.data.sentence).width;
            this.ctx.fillText(
                this.data.sentence,
                this.enemy.x + (this.enemy.width - textWidth) / 2,
                this.enemy.y-30
            );
        }
    }

    nextScene() {
        return false;
    }
};
