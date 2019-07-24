"use strict";

class Fighter extends SpriteActor {
  constructor(x, y) {
    const sprite = new Sprite(
      assets.get("sprite"),
      new Rectangle(SPRITE_CELL_SIZE * 0, SPRITE_CELL_SIZE * 0, 40, 40)
    );
    const hitArea = new Rectangle(20, 20, 2, 2);
    super(x, y, sprite, hitArea);

    this._interval = 5;
    this._timeCount = 0;
    this._speed = 3;
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
    this._velocityX = 0;
    this._velocityY = 0;
    this._delayRate = 0.5;

    if (input.getKey("ArrowUp")) {
      this._velocityY = -this._speed;
    }
    if (input.getKey("ArrowDown")) {
      this._velocityY = this._speed;
    }
    if (input.getKey("ArrowRight")) {
      this._velocityX = this._speed;
    }
    if (input.getKey("ArrowLeft")) {
      this._velocityX = -this._speed;
    }

    if (input.getKey("z")) {
      this._velocityX = this._velocityX * this._delayRate;
      this._velocityY = this._velocityY * this._delayRate;
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

    // Shoot bullet when the space key is pressed.
    this._timeCount++;
    const isFireReady = this._timeCount > this._interval;
    if (isFireReady && input.getKey("x")) {
      const bullet = new FighterBullet(this.x, this.y);
      this.spawnActor(bullet);
      this._timeCount = 0;
    }
  }
}