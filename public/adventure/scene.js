import {getRandomColor, getRandomItem} from './random.js';
import {Player, Enemy} from './units.js';

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
            logo: data.logo
        });
        trees.init(this.data.biome);
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
        trees.draw(this.ctx);
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
            logo: data.logo
        });
        this.enemy = new Enemy(ctx, {
            x: canvas.width - 90,
            y: canvas.height - 80,
            width: 80, 
            height: 80,
            color: getRandomColor(),
            name: data.enemy.name
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
        this.finished = 1;
    }
    draw() {
        this.resetMap();
        drawBackground(this.ctx, this.data.biome);
        this.player.draw();
        this.enemy.draw();

        // Sentence
        if (this.frames > 30 < 30 * 5) {
            this.ctx.font = '14px serif';
            this.ctx.fillText(
                this.data.sentence,
                this.enemy.x,
                this.enemy.y-25
            );
        }
    }

    nextScene() {
        return false;
    }
};

export function drawBackground(ctx, biome = 'summer') {
    let colors = {
        summer: '#4c9a00',
        fall: '#98964D'
    }
    ctx.fillStyle = colors[biome];
    ctx.fillRect(0, canvas.height - 40, canvas.width, canvas.height-10);
}

export var trees = {
    colors: {
        summer: [
            'rgba(31, 138, 112, 1)',
            'rgba(26, 117, 95, 1)',
            'rgba(36, 159, 129, 1)',
            '#A79F0F',
            '#8B9216',
            '#EDA421'
        ],
        fall: [
            '#8B9216',
            '#A79F0F',
            '#EDA421',
            '#E98604',
            '#DF3908',
            '#C91E0A'
        ],
    },
    init: function (biome) {
    	this.trees = [];
        for (let i=0; i<=80; i++) {
          // Get random positions for trees
          var treex = ~~(Math.random() * (canvas.width - 22));
          var treey = ~~(Math.random() * 10) + canvas.height - 60;

          var colors = this.colors[biome];
          var color = Math.floor(Math.random()*colors.length - 1);
          let treeFill = colors[color];

          if(treeFill == undefined) {
            treeFill = colors[0];
          }

          let treeSize = ~~(Math.random() * 10)+12;
          this.trees.push([treeFill, treex, treey, treeSize]);
        }
        this.trees = this.trees.sort((function(index){
            return function(a, b){
                return (a[index] === b[index] ? 0 : (a[index] < b[index] ? -1 : 1));
            };
        })(2));
    },
    draw: function (ctx) {
        for (let i=0; i < this.trees.length; i++) {
            var x = this.trees[i][1];
            var y = 22;
            y += this.trees[i][2];
            // Draw the given tree
            ctx.fillStyle = this.trees[i][0];
            ctx.beginPath();
            ctx.moveTo(x,y);
            ctx.lineTo((x+this.trees[i][3]),y);
            ctx.lineTo((x+(this.trees[i][3])/2),(y-this.trees[i][3]));
            ctx.lineTo(x,y);
            ctx.closePath();
            ctx.fill();
        }
    }
}

export var clouds = {
	init: function() {
		this.arr = [];
	    for (let i=0; i<=20; i++) {
	      // Get random positions for trees
	      var cx = ~~(Math.random() * (canvas.width - 22));
	      // var cy = ~~(Math.random() * canvas.height);
	      var cy = Math.floor(Math.random() * 2);

	      let size = Math.floor(Math.random() * 2) + 1;
	      let speed = Math.random()*0.25;
	      this.arr.push([cx, cy, size, speed]);
	    }
	},
	draw: function(ctx) {
		for (let i=0; i < this.arr.length; i++) {
			var x = this.arr[i][0],
			y = this.arr[i][1],
			size = 20,
			speed = this.arr[i][3];

			this.arr[i][0] += speed;
			if(this.arr[i][0] > (canvas.width+size)) {
				this.arr[i][0] = -size;
			}
			// Draw the given cloud
			ctx.fillStyle = "rgba(255,255,255,0.5)";
			ctx.beginPath();
			ctx.arc(x, y, 20, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.fill();
		}
	}
}
