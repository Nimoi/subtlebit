export class Scene {
    constructor(canvas, ctx, data) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.data = data;
        this.finished = 0;
        this.baseline = canvas.height - 40;
        this.frames = 0;
    }

    resetMap() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    nextScene() {
        return false;
    }
}

