"use strict";

class Enemy extends SpriteActor {
  constructor(x, y) {
    const sprite = new Sprite(
      assets.get("internet_god"),
      new Rectangle(0, 0, 240, 240)
    );
    const hitArea = new Rectangle(80, 40, 80, 80);
    super(x, y, sprite, hitArea, ["enemy"]);

    this.maxHp = 200;
    this.currentHp = this.maxHp;

    this._interval = 20;
    this._timeCount = 0;
    this._timeCount = this._interval;
    this._velocityX = 1;
    this._velocityY = 1;
    this._count = 0;

    // Reduce HP if hit by player's bullet.
    this.addEventListener("hit", e => {
      if (e.target.hasTag("fighterBullet")) {
        this.currentHp--;
        this.dispatchEvent("changehp", new GameEvent(this));
      }
    });
  }

  shootBullet(degree, speed) {
    const rad = (degree / 180) * Math.PI;
    const velocityX = Math.cos(rad) * speed;
    const velocityY = Math.sin(rad) * speed;

    const bullet = new EnemyBullet(this.x + 120, this.y + 120, velocityX, velocityY);
    this.spawnActor(bullet);
  }

  shootCircularBullets(num, speed, initialDegree) {
    const degree = 360 / num;
    for (let i = 0; i < num; i++) {
      this.shootBullet(initialDegree + degree * i, speed);
    }
  }

  update(gameInfo, input) {
    // Move to horizontal.
    this.x += this._velocityX;
    if (this.x <= 40 || this.x >= 200) {
      this._velocityX *= -1;
    }

    this.y += this._velocityY;
    if (this.y <= 20 || this.y >= 60) {
      this._velocityY *= -1;
    }

    // Shoot bullets according to interval.
    this._timeCount++;
    if (this._timeCount > this._interval && this.currentHp <= 100) {
      // this._count += 10;
      // this.shootCircularBullets(10, 1, this._count);

      // const spawner = new SpiralBulletsSpawner(this.x, this.y, 4);
      // this.spawnActor(spawner)
      // this._timeCount = 0;

      const spdX = (120 - this.x) / 24;
      const spdY = 4;
      const explosionTime = 12;
      const bullet = new FireworksBullet(
        this.x + 100,
        this.y + 100,
        spdX,
        spdY,
        explosionTime
      );
      this.shootBullet(60, 3);
      this.shootBullet(120, 3);
      this.spawnActor(bullet);
      this._timeCount = 0;
    } else if (this._timeCount > this._interval) {
      this.shootBullet(60, 3);
      this.shootBullet(90, 4);
      this.shootBullet(120, 3);
      this._timeCount = 0;
    }



    if (this.currentHp <= 0) {
      this.destroy();
    }
  }
}