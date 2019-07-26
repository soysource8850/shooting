"use strict";

class Fighter extends SpriteActor {
  constructor(x, y) {
    const sprite = new Sprite(
      assets.get("sprite"),
      new Rectangle(SPRITE_CELL_SIZE * 0, SPRITE_CELL_SIZE * 0, 40, 40)
    );
    const hitArea = new Rectangle(20, 20, 2, 2);
    super(x, y, sprite, hitArea);

    this._interval = 6;
    this._timeCount = 0;

    this._force = 0;
    this._friction = 0.4;
    this._acceleration = 0;
    this._resistance = 0.9;

    this._velocityX = 0;
    this._velocityY = 0;

    this.addEventListener("hit", e => {
      if (e.target.hasTag("enemyBullet")) {
        this.destroy();
      }
    });
  }

  update(gameInfo, input) {
    // Move according to the pressed key.
    this._velocityX = this._velocityX * this._resistance;
    this._velocityY = this._velocityY * this._resistance;

    if (
      input.getKey("ArrowUp") ||
      input.getKey("ArrowDown") ||
      input.getKey("ArrowRight") ||
      input.getKey("ArrowLeft")
    ) {
      if (input.getKey("z")) {
        this._force = 1;
      } else {
        this._force = 2;
      }
    } else {
      this._force = 0;
    }

    this._acceleration = this._force - this._friction * Math.hypot(this._velocityX, this._velocityY);

    if (input.getKey("ArrowUp")) {
      this._velocityY -= this._acceleration;
    }
    if (input.getKey("ArrowDown")) {
      this._velocityY += this._acceleration;
    }
    if (input.getKey("ArrowRight")) {
      this._velocityX += this._acceleration;
    }
    if (input.getKey("ArrowLeft")) {
      this._velocityX -= this._acceleration;
    }

    this.x += this._velocityX;
    this.y += this._velocityY;

    // Prevent movement outside the screen.
    const boundWidth = gameInfo.screenRectangle.width - this.width;
    const boundHeight = gameInfo.screenRectangle.height - this.height;
    const bound = new Rectangle(
      this.width,
      this.height,
      boundWidth,
      boundHeight
    );

    // TODO: Refactor
    if (this.isOutOfBoundsX(bound)) {
      this.x -= this._velocityX;
    }

    // TODO: Refactor
    if (this.isOutOfBoundsY(bound)) {
      this.y -= this._velocityY;
    }

    // Shoot bullet when the x key is pressed.
    this._timeCount++;
    const isFireReady = this._timeCount > this._interval;
    if (isFireReady && input.getKey("x")) {
      const bullet1 = new FighterBullet(this.x, this.y, 0);
      this.spawnActor(bullet1);
      const bullet2 = new FighterBullet(this.x, this.y, -1);
      this.spawnActor(bullet2);
      const bullet3 = new FighterBullet(this.x, this.y, 1);
      this.spawnActor(bullet3);
      this._timeCount = 0;
    }
  }
}