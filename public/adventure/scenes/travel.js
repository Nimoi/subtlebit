import {Scene} from './index.js';
import {Player} from '../units.js';
import {drawBackground, Trees, Rocks} from '../environment.js';
import {placeScene} from './place.js';

export class travelScene extends Scene {
    constructor(canvas, ctx, data) {
        super(canvas, ctx, data);
        let placeImage = new Image();
        placeImage.src = `/images/place_city.png`;
        this.place = {
            x: canvas.width - 170,
            y: canvas.height - 80,
            width: 64, 
            height: 64,
            image: placeImage
        };
        this.player = new Player(ctx, {
            x: 10,
            y: canvas.height - 80,
            width: 64,
            height: 64,
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
        this.ctx.drawImage(
            this.place.image, 
            this.place.x,
            this.place.y,
            this.place.width,
            this.place.height
        );

        // Place Text
        this.ctx.fillStyle = "#eee";
        this.ctx.fillText(
            `The ${this.data.place.type} of ${this.data.place.name}`,
            this.place.x + 20,
            this.place.y - 20
        );
    }

    nextScene() {
        return new placeScene(this.canvas, this.ctx, this.data);
    }
}
