'use strict';

class TextLabel extends Actor {
  constructor(x, y, text) {
    const hitArea = new Rectangle(0, 0, 0, 0);
    super(x, y, hitArea);

    this.text = text;
  }

  render(target) {
    const context = target.getContext('2d');
    context.font = '25px sans-serif';
    context.fillStyle = 'white';
    context.fillText(this.text, this.x, this.y);
  }
}

class EnemyHpBar extends Actor {
  constructor(x, y, enemy) {
    const hitArea = new Rectangle(0, 0, 0, 0);
    super(x, y, hitArea);

    this._width = 200;
    this._height = 10;

    this._innerWidth = this._width;

    enemy.addEventListener('changehp', (e) => {
      const maxHp = e.target.maxHp;
      const hp = e.target.currentHp;
      this._innerWidth = this._width * (hp / maxHp);
    });
  }

  render(target) {
    const context = target.getContext('2d');
    context.strokeStyle = 'white';
    context.fillStyle = 'white';

    context.strokeRect(this.x, this.y, this._width, this._height);
    context.fillRect(this.x, this.y, this._innerWidth, this._height);
  }
}

class Bullet extends SpriteActor {
  constructor(x, y) {
    const sprite = new Sprite(assets.get('sprite'), new Rectangle(0, 16, 16, 16));
    const hitArea = new Rectangle(4, 0, 8, 16);
    super(x, y, sprite, hitArea, ['playerBullet']);

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

class Fighter extends SpriteActor {
  constructor(x, y) {
    const sprite = new Sprite(assets.get('sprite'), new Rectangle(0, 0, 16, 16));
    const hitArea = new Rectangle(8, 8, 2, 2);
    super(x, y, sprite, hitArea);

    this._interval = 5;
    this._timeCount = 0;
    this._speed = 3;
    this._velocityX = 0;
    this._velocityY = 0;

    this.addEventListener('hit', (e) => {
      if (e.target.hasTag('enemyBullet')) {
        this.destroy();
      }
    });
  }

  update(gameInfo, input) {
    // Move according to the pressed key.
    this._velocityX = 0;
    this._velocityY = 0;

    if (input.getKey('ArrowUp')) {
      this._velocityY = -this._speed;
    }
    if (input.getKey('ArrowDown')) {
      this._velocityY = this._speed;
    }
    if (input.getKey('ArrowRight')) {
      this._velocityX = this._speed;
    }
    if (input.getKey('ArrowLeft')) {
      this._velocityX = -this._speed;
    }

    this.x += this._velocityX;
    this.y += this._velocityY;

    // Prevent movement outside the screen.
    const boundWidth = gameInfo.screenRectangle.width - this.width;
    const boundHeight = gameInfo.screenRectangle.height - this.height;
    const bound = new Rectangle(this.width, this.height, boundWidth, boundHeight);
    // todo: Do not get caught on the wall.
    if (this.isOutOfBounds(bound)) {
      this.x -= this._velocityX;
      this.y -= this._velocityY;
    }

    // Shoot bullet when the space key is pressed.
    this._timeCount++;
    const isFireReady = this._timeCount > this._interval;
    if (isFireReady && input.getKey(' ')) {
      const bullet = new Bullet(this.x, this.y);
      this.spawnActor(bullet);
      this._timeCount = 0;
    }
  }
}

class SpiralBulletsSpawner extends Actor {
  constructor(x, y, rotations) {
    const hitArea = new Rectangle(0, 0, 0, 0);
    super(x, y, hitArea);

    this._rotations = rotations;
    this._intaval = 1;
    this._timeCount = 0;
    this._angle = 0;
    this._radius = 10;
    this._bullets = [];
    this._isFrozen = true;
  }

  update(gameInfo, input) {
    // End the bullets expansion accoding to rotation.
    const rotation = this._angle / 360;
    if (rotation >= this._rotations) {
      this._bullets.forEach((b) => b.isFrozen = false);
      this.destroy();
      return;
    }

    // Wait until elapsed interval.
    this._timeCount++;
    if (this._timeCount < this._intaval) {
      return;
    }
    this._timeCount = 0;

    // Change bullet's properties over time.
    this._angle += 10;
    this._radius += 1;
    this._isFrozen = !this._isFrozen;

    // Fire!
    const rad = this._angle / 180 * Math.PI;
    const bX = this.x + Math.cos(rad) * this._radius;
    const bY = this.y + Math.sin(rad) * this._radius;
    const bSpdX = Math.random() * 2 - 1;
    const bSpdY = Math.random() * 2 - 1;
    const isFrozen = this._isFrozen;
    const bullet = new EnemyBullet(bX, bY, bSpdX, bSpdY, isFrozen);
    this._bullets.push(bullet);

    this.spawnActor(bullet);
  }
}

class EnemyBullet extends SpriteActor {
  constructor(x, y, velocityX, velocityY, isFrozen = false) {
    const sprite = new Sprite(assets.get('sprite'), new Rectangle(16, 16, 16, 16));
    const hitArea = new Rectangle(4, 4, 8, 8);
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

class Enemy extends SpriteActor {
  constructor(x, y) {
    const sprite = new Sprite(assets.get('sprite'), new Rectangle(16, 0, 16, 16));
    const hitArea = new Rectangle(0, 0, 16, 16);
    super(x, y, sprite, hitArea, ['enemy']);

    this.maxHp = 50;
    this.currentHp = this.maxHp;

    this._interval = 30;
    this._timeCount = 0;
    this._timeCount = this._interval;
    this._velocityX = 0;
    this._count = 0;

    // Reduce HP if hit by player's bullet.
    this.addEventListener('hit', (e) => {
      if (e.target.hasTag('playerBullet')) {
        this.currentHp--;
        this.dispatchEvent('changehp', new GameEvent(this));
      }
    });
  }

  shootBullet(degree, speed) {
    const rad = degree / 180 * Math.PI;
    const velocityX = Math.cos(rad) * speed;
    const velocityY = Math.sin(rad) * speed;

    const bullet = new EnemyBullet(this.x, this.y, velocityX, velocityY);
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
    if (this.x <= 100 || this.x >= 200) {
      this._velocityX *= -1;
    }

    // Shoot bullets according to interval.
    this._timeCount++;
    if (this._timeCount > this._interval) {
      // this._count += 10;
      // this.shootCircularBullets(10, 1, this._count);

      // const spawner = new SpiralBulletsSpawner(this.x, this.y, 4);
      // this.spawnActor(spawner)
      // this._timeCount = 0;

      const spdX = Math.random() * 4 - 2;
      const spdY = Math.random() * 4 - 2;
      const explosionTime = 30;
      const bullet = new FireworksBullet(this.x, this.y, spdX, spdY, explosionTime);
      this.spawnActor(bullet);
      this._timeCount = 0;
    }

    if (this.currentHp <= 0) {
      this.destroy();
    }
  }
}

class DanmakuStgEndScene extends Scene {
  constructor(renderingTarget) {
    super('クリア', 'black', renderingTarget);
    const text = new TextLabel(60, 200, 'ゲームクリア！');
    this.add(text);
  }
}

class DanmakuStgGameOverScene extends Scene {
  constructor(renderingTarget) {
    super('ゲームオーバー', 'black', renderingTarget);
    const text = new TextLabel(50, 200, 'ゲームオーバー...');
    this.add(text);
  }
}

class DanmakuStgMainScene extends Scene {
  constructor(renderingTarget) {
    super('メイン', 'black', renderingTarget);
    const fighter = new Fighter(150, 300);
    const enemy = new Enemy(150, 100);
    const hpBar = new EnemyHpBar(50, 20, enemy);
    this.add(fighter);
    this.add(enemy);
    this.add(hpBar);

    // Change scene to GameOver if a fighter is destroyed.
    fighter.addEventListener('destroy', (e) => {
      const scene = new DanmakuStgGameOverScene(this.renderingTarget);
      this.changeScene(scene);
    });

    // Change scene to End if enemys is destroyed.
    enemy.addEventListener('destroy', (e) => {
      const scene = new DanmakuStgEndScene(this.renderingTarget);
      this.changeScene(scene);
    });
  }
}

class DanmakuStgTitleScene extends Scene {
  constructor(renderingTarget) {
    super('タイトル', 'black', renderingTarget);
    const title = new TextLabel(100, 200, '弾幕STG');
    this.add(title);
  }

  update(gameInfo, input) {
    super.update(gameInfo, input);
    if (input.getKeyDown(' ')) {
      const mainScene = new DanmakuStgMainScene(this.renderingTarget);
      this.changeScene(mainScene);
    }
  }
}

class DanmakuStgGame extends Game {
  constructor() {
    super('弾幕STG', 300, 400, 60);
    const titleScene = new DanmakuStgTitleScene(this.screenCanvas);
    this.changeScene(titleScene);
  }
}

assets.addImage('sprite', 'sprite.png');
assets.loadAll().then((a) => {
  const game = new DanmakuStgGame();
  document.body.appendChild(game.screenCanvas);
  game.start();
});