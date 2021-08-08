import {addToDom} from './dom.js';
import {
    titleScene,
    travelScene,
    placeScene
} from './scene.js';
import {getRandomItem} from './random.js';

/*
 * TODOs:
 *
 *  - More environments:
 *      - Winter
 *      - Spring
 *      - Desert
 *
 * - Levels and Experience:
 *      - Define which levels are unlocked at which experience level
 *      - Award players experience and levels
 *      - Level determines range of enemies
 *      - Higher levels unlock new biomes
 */

var socket = io();

/*
 * Canvas
 */

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    render();
}

function render() {
    ctx.fillStyle = 'rgb(200, 0, 0)';
    ctx.fillRect(10, 10, 50, 50);
    ctx.fillStyle = 'rgba(0, 100, 200, 0.5)';
    ctx.fillRect(30, 30, 50, 50);
    ctx.font = '32px serif';
    ctx.fillStyle = 'rgba(50, 150, 220, 0.5)';
    ctx.fillText('Have an Adventure!', 100, 60);
}

resizeCanvas();

var biomes = [
    'summer',
    'fall',
];

class Adventure {
    constructor(data, callback) {
        console.log(data);
        data.biome = getRandomItem(biomes);
        data.logo = new Image();
        data.logo.src = `/cache/${data.username}.jpg`;
        this.data = data;
        this.callback = callback;

        this.fps = 30;
        this.fpsInterval = 1000 / this.fps;
        this.then = Date.now();
        this.startTime = this.then;

        this.scene = new titleScene(canvas, ctx, data);

        window.requestAnimationFrame(() => {
            this.frame();
        });
    }

    frame() {
        let now = Date.now();
        let elapsed = now - this.then;

        if (elapsed > this.fpsInterval) {
            this.then = now - (elapsed % this.fpsInterval);
            if (this.scene === false) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                return this.callback();
            }
            this.scene.process();
            this.scene.draw();
            if (this.scene.finished) {
                this.scene = this.scene.nextScene();
            }
        }

        window.requestAnimationFrame(() => {
            this.frame();
        });
    }

    drawEnemy() {
        // Shout TODO: Speach bubble?
        ctx.font = '14px serif';
        ctx.fillStyle = "black";
        ctx.fillText(this.data.sentence, 160, 100, canvas.width - 360);
    }
}

/*
 * Queue
 */

var queue = {
    list: [],
    process: function () {
        if (this.list.length === 0) {
            return setTimeout(() => {
                this.process();
            }, 1000);
        }

        new Adventure(this.list.shift(), () => {
            this.process();
        });
    }
};

queue.process();

/*
 * On !RPG
 */
socket.on('adventure', (adventure) => {
    queue.list.push(adventure);
});

