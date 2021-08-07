class Unit {
    constructor(ctx, data) {
        this.ctx = ctx;
        this.data = data;
        this.x = data.x;
        this.y = data.y;
        this.width = data.width;
        this.height = data.height;
    }
}

export class Player extends Unit {
    draw() {
        // Logo
        this.ctx.drawImage(
            this.data.logo, 
            this.x, 
            this.y, 
            this.width, 
            this.height
        );

        // Name
        this.ctx.font = '14px serif';
        this.ctx.fillStyle = this.data.color;
        this.ctx.fillText(
            this.data.name,
            this.x,
            this.y-10
        );
    }
}

export class Enemy extends Unit {
    draw() {
        this.ctx.fillStyle = this.data.color;
        this.ctx.fillRect(
            this.x,
            this.y,
            this.width,
            this.height
        );

        // Name
        this.ctx.font = '14px serif';
        this.ctx.fillText(
            this.data.name,
            this.x,
            this.y-10
        );
    }
}
