import {Scene} from './index.js';
import {loseScene} from './lose.js';
import {winScene} from './win.js';
import {drawBackground, Trees, Rocks} from '../environment.js';
import {Player, Enemy} from '../units.js';
import {getRandomColor} from '../random.js';

export class placeScene extends Scene {
    constructor(canvas, ctx, data) {
        super(canvas, ctx, data);
        this.player = new Player(ctx, {
            x: 10,
            y: canvas.height - 80,
            width: 64,
            height: 64,
            color: data.context.color,
            name: data.context['display-name'],
            logo: data.logo,
            health: this.data.record.stats.health_max,
            record: data.record
        });
        this.enemy = new Enemy(
            ctx, {
                x: canvas.width - 90,
                y: canvas.height - 80,
                width: 64, 
                height: 64,
                color: getRandomColor(),
                name: data.enemy.name,
                health: data.enemy.stats.health_max,
                record: data.enemy
            });
        let placeImage = new Image();
        placeImage.src = `/images/place_city.png`;
        this.place = {
            x: canvas.width - 170,
            y: canvas.height - 80,
            width: 64, 
            height: 64,
            image: placeImage
        };
        this.trees = new Trees({ctx: ctx, biome: this.data.biome});
        this.rocks = new Rocks({
            ctx: ctx,
            biome: this.data.biome,
        });
        this.frames = 0;
        this.lastFrame = 0;
        this.next = false;
    }

    process() {
        this.frames++;
        this.player.process();
        this.enemy.process();
        
        // Move to battle
        if (this.player.x < this.enemy.x - 10 - this.player.width) {
            this.player.x += 3;
            this.enemy.x -= 3;
            return;
        }

        // Do battle
        if (this.data.battle.log.length) {
            if (this.frames % 20 == 0) {
                this.fight();
            }
            return;
        }

        // Set the next scene
        if (! this.next) {
            this.next = this.player.health <= 0
                ? new loseScene(this.canvas, this.ctx, this.data)
                : new winScene(this.canvas, this.ctx, this.data);

            this.lastFrame = this.frames + 40;
        }

        // Delay before next scene
        if (this.frames >= this.lastFrame) {
            this.finished = 1;
        }
    }

    fight() {
        let round = this.data.battle.log.shift();
        if (round.turn === 'player') {
            if (round.heal) {
                this.player.heal(round.heal);
            }
            if (round.hit.damage) {
                this.enemy.damage(round.hit);
            }
        }
        if (round.turn === 'enemy') {
            if (round.heal) {
                this.enemy.heal(round.heal);
            }
            if (round.hit.damage) {
                this.player.damage(round.hit);
            }
        }
    }

    battle(player, enemy) {
        // FORMULA = ([userdef] - [enematk]) - ([enemdef] - [useratk])
        return (player.defense - enemy.attack) - (enemy.defense - player.attack);
    }

    draw() {
        this.resetMap();
        drawBackground(this.ctx, this.data.biome);
        this.rocks.draw();
        this.trees.draw();
        this.drawPlace();
        this.player.draw();
        this.enemy.draw();

        // Sentence
        if (this.frames > 30 && this.frames < 30 * 6) {
            this.ctx.font = '14px serif';

            let textWidth = this.ctx.measureText(this.data.sentence).width;
            this.ctx.fillText(
                this.data.sentence,
                this.enemy.x + (this.enemy.width - textWidth) / 2,
                this.enemy.y-30
            );
        }
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
        return this.next;
    }
}
