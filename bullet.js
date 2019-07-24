'use strict';

class FighterBullet extends SpriteActor {
  constructor(x, y) {
    const sprite = new Sprite(assets.get('sprite'), new Rectangle(SPRITE_CELL_SIZE * 1, SPRITE_CELL_SIZE * 0, 40, 40));
    const hitArea = new Rectangle(18, 4, 4, 32);
    super(x, y, sprite, hitArea, ['fighterBullet']);

    this.speed = 6;

    this.addEventListener('hit', (e) => {
      if (e.target.hasTag('enemy')) {
        this.destroy();
      }
    });
  }

  update(gameInfo, input) {
    this.y -= this.speed;
    if (this.isOutOfBounds(gameInfo.screenRectangle)) {
      this.destroy();
    }
  }
}

class EnemyBullet extends SpriteActor {
  constructor(x, y, velocityX, velocityY, isFrozen = false) {
    const sprite = new Sprite(assets.get('sprite'), new Rectangle(SPRITE_CELL_SIZE * 4, SPRITE_CELL_SIZE * 0, 40, 40));
    const hitArea = new Rectangle(8, 8, 24, 24);
    super(x, y, sprite, hitArea, ['enemyBullet']);

    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.isFrozen = isFrozen;
  }

  update(gameInfo, input) {
    if (!this.isFrozen) {
      this.x += this.velocityX;
      this.y += this.velocityY;
    }

    if (this.isOutOfBounds(gameInfo.screenRectangle)) {
      this.destroy();
    }
  }
}

class FireworksBullet extends EnemyBullet {
  constructor(x, y, velocityX, velocityY, explosionTime) {
    super(x, y, velocityX, velocityY);

    this._eplasedTime = 0;
    this.explosionTime = explosionTime;
  }

  shootBullet(degree, speed) {
    const rad = degree / 180 * Math.PI;
    const velocityX = Math.cos(rad) * speed;
    const velocityY = Math.sin(rad) * speed;

    const bullet = new EnemyBullet(this.x, this.y, velocityX, velocityY);
    this.spawnActor(bullet);
  }

  shootCircularBullets(num, speed) {
    const degree = 360 / num;
    for (let i = 0; i < num; i++) {
      this.shootBullet(degree * i, speed);
    }
  }

  update(gameInfo, input) {
    super.update(gameInfo, input);

    this._eplasedTime++;

    if (this._eplasedTime > this.explosionTime) {
      this.shootCircularBullets(12, 2);
      this.destroy();
    }
  }
}