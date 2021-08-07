import {getRandomInt, getRandomItem} from './random.js';

export function drawBackground(ctx, biome = 'summer') {
    let colors = {
        summer: '#567d46',
        fall: '#98964D'
    }
    ctx.fillStyle = colors[biome];
    ctx.fillRect(0, canvas.height - 40, canvas.width, canvas.height-10);
}

class Scatter {
    constructor(options) {
    	this.items = [];
        this.ctx = options.ctx;
        this.biome = 'biome' in options
            ? options.biome
            : 'summer';
        this.minX = 'minX' in options
            ? options.minX
            : 20;
        this.minY = 'minY' in options
            ? options.minY
            : canvas.height - 50;
        this.maxX = 'maxX' in options
            ? options.maxX
            : canvas.width - 20;
        this.maxY = 'maxY' in options
            ? options.maxY
            : canvas.height - 60;
        this.minSize = 'minSize' in options
            ? options.minSize
            : 12;
        this.maxSize = 'maxSize' in options
            ? options.maxSize
            : 24;
    }

    populate () {
        for (let i=0; i<=80; i++) {
          // Get random positions for items
          var itemx = getRandomInt(this.minX, this.maxX);
          var itemy = getRandomInt(this.minY, this.maxY);

          var colors = this.colors[this.biome];
          var color = getRandomItem(colors);

          let itemSize = getRandomInt(this.minSize, this.maxSize);
          this.items.push([color, itemx, itemy, itemSize]);
        }
        this.items = this.items.sort((function(index){
            return function(a, b){
                return (a[index] === b[index] ? 0 : (a[index] < b[index] ? -1 : 1));
            };
        })(2));
    }
}

export class Trees extends Scatter {
    constructor(options) {
        super(options);
        this.colors = {
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
        };
        this.populate();
    }

    draw () {
        for (let i=0; i < this.items.length; i++) {
            var x = this.items[i][1];
            var y = 22;
            y += this.items[i][2];
            this.ctx.fillStyle = this.items[i][0];
            this.ctx.beginPath();
            this.ctx.moveTo(x,y);
            this.ctx.lineTo((x+this.items[i][3]),y);
            this.ctx.lineTo((x+(this.items[i][3])/2),(y-this.items[i][3]));
            this.ctx.lineTo(x,y);
            this.ctx.closePath();
            this.ctx.fill();
        }
    }
}

export class Rocks extends Scatter {
    constructor(options) {
        super(options);
        this.minY = canvas.height;
        this.maxY = canvas.height - 40;
        this.minSize = 1;
        this.maxSize = 3;
        this.colors = {
            summer: [
                '#878a81',
                '#81878a',
                '#8a8187'
            ],
            fall: [
                '#6b6980',
                '#807669',
                '#697f80'
            ],
        };
        this.populate();
    }

    draw () {
        for (let i=0; i < this.items.length; i++) {
            var x = this.items[i][1];
            var y = 0;
            y += this.items[i][2];
			this.ctx.fillStyle = this.items[i][0];
            this.ctx.beginPath();
            this.ctx.arc(x, y, this.items[i][3], 0, 2 * Math.PI);
            this.ctx.fill();
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
