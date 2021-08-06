import {addToDom} from './dom.js';
import {drawBackground, trees, clouds} from './scene.js';
import {getRandomInt} from './random.js';

var socket = io();

/*
socket.on("connect", () => {
    addToDom('main.container .panel', 'status', 'Connected to chat');
});

socket.on("chat", (chat) => {
    console.log(chat);
    if ('data' in chat) {
        var logo = new Image();
        logo.addEventListener('load', function() {
            ctx.drawImage(logo, 0, 0);
        }, false);
        logo.src = chat.data.profile_image_url
    }
    printChat(chat);
});

function printChat(chat) {
    let html = `<p>
        <strong style="color:${chat.context.color}">${chat.context['display-name']}</strong>
        ${chat.message}
    </p>`;
    addToDom('main.container .panel', 'message', html);
}
*/

socket.on('adventure', (adventure) => {
    onAdventure(adventure);
});

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
    ctx.fillStyle = 'rgba(0, 0, 200, 0.5)';
    ctx.fillRect(30, 30, 50, 50);
    ctx.font = '32px serif';
    ctx.fillText('Have an Adventure!', 100, 60);
}

resizeCanvas();

var adventure;
var logo;

function onAdventure(data) {
    new Adventure(data);
}

class Adventure {
    constructor(data) {
        this.data = data;
        this.player = {
            x: 10,
            y: 100,
            width: 80,
            height: 80
        };
        console.log(data);
        clouds.init();
        trees.init();
        this.logo = new Image();
        this.logo.addEventListener('load', () => {
            ctx.drawImage(this.logo, 0, 0, 50, 50);
        }, false);
        this.logo.src = `/cache/${this.data.username}.jpg`;

        this.fps = 30;
        this.fpsInterval = 1000 / this.fps;
        this.then = Date.now();
        this.startTime = this.then;

        window.requestAnimationFrame(() => {
            this.frame();
        });
    }

    frame() {
        let now = Date.now();
        let elapsed = now - this.then;

        if (elapsed > this.fpsInterval) {
            this.then = now - (elapsed % this.fpsInterval);
            this.draw();
        }

        window.requestAnimationFrame(() => {
            this.frame();
        });
    }

    draw() {
        this.resetMap();
        drawBackground(ctx);
        trees.draw(ctx);
        clouds.draw(ctx);
        this.drawPlayer();
        this.drawPlace();
        this.drawEnemy();
    }

    resetMap() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    drawPlayer() {
        // Logo
        ctx.drawImage(
            this.logo, 
            this.player.x, 
            this.player.y, 
            this.player.width, 
            this.player.height
        );

        // Name
        ctx.font = '14px serif';
        ctx.fillStyle = this.data.context.color;
        ctx.fillText(
            this.data.context['display-name'],
            this.player.x,
            this.player.y+10+this.player.height
        );
    }

    drawPlace() {
        ctx.fillStyle = "#aaa";
        ctx.fillRect(canvas.width - 100, 100, 200, 100);

        ctx.fillStyle = "#333";
        ctx.fillText(this.data.place, canvas.width - 80, 150, 200);
    }

    drawEnemy() {
        // Shout TODO: Speach bubble?
        ctx.font = '14px serif';
        ctx.fillStyle = "black";
        ctx.fillText(this.data.sentence, 160, 100, canvas.width - 360);
    }
}
