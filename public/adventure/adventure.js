import {addToDom} from './dom.js';

var socket = io();

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
}

resizeCanvas();
