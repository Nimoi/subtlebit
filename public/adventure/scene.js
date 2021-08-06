class Scene {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.finished = 0;
    }

    resetMap() {
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
};

export class titleScene extends Scene {
};

export class travelScene extends Scene {
    constructor(canvas, ctx, data, logo) {
        super(canvas, ctx);
        this.data = data;
        this.logo = logo;
        this.player = {
            x: 10,
            y: canvas.height - 80,
            width: 80,
            height: 80
        };
        this.place = {
            x: canvas.width - 170,
            y: canvas.height - 80,
            width: 160, 
            height: 100
        };
        trees.init();
    }

    process() {
        if (this.player.x < this.place.x - 10 - this.player.width) {
            this.player.x += 1;
            return;
        }
        this.finished = 1;
    }

    draw() {
        this.resetMap();
        drawBackground(this.ctx);
        trees.draw(this.ctx);
        this.drawPlayer();
        this.drawPlace();
    }

    drawPlayer() {
        // Logo
        this.ctx.drawImage(
            this.logo, 
            this.player.x, 
            this.player.y, 
            this.player.width, 
            this.player.height
        );

        // Name
        this.ctx.font = '14px serif';
        this.ctx.fillStyle = this.data.context.color;
        this.ctx.fillText(
            this.data.context['display-name'],
            this.player.x,
            this.player.y+10+this.player.height
        );
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
        return new placeScene(this.canvas, this.ctx, this.data, this.logo);
    }
};

export class placeScene extends Scene {
    process() {
    }
    draw() {
        this.resetMap();
        this.ctx.fillStyle = 'rgb(200, 0, 0)';
        this.ctx.fillRect(10, 10, 50, 50);
        this.ctx.fillStyle = 'rgba(0, 0, 200, 0.5)';
        this.ctx.fillRect(30, 30, 50, 50);
    }
};

export function drawBackground(ctx) {
    ctx.fillStyle = '#99ffbb';
    ctx.fillRect(0, canvas.height - 40, canvas.width, canvas.height-10);
}

export var trees = {
    init: function () {
    	this.trees = [];
        for (let i=0; i<=80; i++) {
          // Get random positions for trees
          var treex = ~~(Math.random() * (canvas.width - 22));
          var treey = ~~(Math.random() * 10) + canvas.height - 60;

          var colors = ['rgba(31, 138, 112, 1)','rgba(26, 117, 95, 1)','rgba(36, 159, 129, 1)'];
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
