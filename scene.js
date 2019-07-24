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

    this._width = 360;
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

class DanmakuStgEndScene extends Scene {
  constructor(renderingTarget) {
    super('クリア', 'black', renderingTarget);
    const text = new TextLabel(80, 200, '何かもリリース');
    this.add(text);
  }

  update(gameInfo, input) {
    super.update(gameInfo, input);
    if (input.getKeyDown(' ')) {
      const mainScene = new DanmakuStgTitleScene(this.renderingTarget);
      this.changeScene(mainScene);
    }
  }
}

class DanmakuStgGameOverScene extends Scene {
  constructor(renderingTarget) {
    super('ゲームオーバー', 'black', renderingTarget);
    const text = new TextLabel(40, 320, '神は言っている...ここで死ぬ定めではないと...');
    this.add(text);
  }

  update(gameInfo, input) {
    super.update(gameInfo, input);
    if (input.getKeyDown(' ')) {
      const mainScene = new DanmakuStgTitleScene(this.renderingTarget);
      this.changeScene(mainScene);
    }
  }
}

class DanmakuStgMainScene extends Scene {
  constructor(renderingTarget) {
    super('メイン', 'black', renderingTarget);
    const fighter = new Fighter(240, 480);
    const enemy = new Enemy(120, 120);
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
    const title = new TextLabel(80, 240, 'Meteorfall Development');
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
    super('弾幕STG', 480, 640, 60);
    const titleScene = new DanmakuStgTitleScene(this.screenCanvas);
    this.changeScene(titleScene);
  }
}

assets.addImage('sprite', 'spritesheet.png');
assets.addImage('internet_god', 'internet_god.png');
assets.loadAll().then((a) => {
  const game = new DanmakuStgGame();
  document.body.appendChild(game.screenCanvas);
  game.start();
});