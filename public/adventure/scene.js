export function drawBackground(ctx) {
    ctx.fillStyle = '#aabbff';
    ctx.fillRect(0, 0, canvas.width, 60);
    ctx.fillStyle = '#99ffbb';
    ctx.fillRect(0, 60, canvas.width, canvas.height-60);
}

export var trees = {
    init: function () {
    	this.trees = [];
        for (let i=0; i<=80; i++) {
          // Get random positions for trees
          var treex = ~~(Math.random() * (canvas.width - 22));
          var treey = ~~(Math.random() * 10)+40;

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
