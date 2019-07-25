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
    const text = new TextLabel(160, 320, 'God is dead.');
    const back = new TextLabel(120, 520, 'Space : Back to title');
    this.add(text);
    this.add(back);
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
    const text = new TextLabel(160, 320, 'Failed...');
    const back = new TextLabel(120, 520, 'Space : Back to title');
    this.add(text);
    this.add(back);
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
    const enemy = new Enemy(120, 40);
    const hpBar = new EnemyHpBar(60, 20, enemy);
    const fighter = new Fighter(240, 480);
    this.add(enemy);
    this.add(hpBar);
    this.add(fighter);

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
    const title = new TextLabel(80, 200, 'Project Meteorfall');
    const subtitle = new TextLabel(240, 240, '- Developers -');
    const zkey = new TextLabel(180, 400, 'Z : Slow');
    const xkey = new TextLabel(180, 440, 'X : Shot');
    const start = new TextLabel(160, 520, 'Press X key');


    this.add(title);
    this.add(subtitle);
    this.add(zkey);
    this.add(xkey);
    this.add(start);
  }

  update(gameInfo, input) {
    super.update(gameInfo, input);
    if (input.getKeyDown('x')) {
      const mainScene = new DanmakuStgMainScene(this.renderingTarget);
      this.changeScene(mainScene);
    }
  }
}

class DanmakuStgGame extends Game {
  constructor() {
    super('弾幕STG', GAME_VIEW_WIDTH, GAME_VIEW_HIGHT, MAXFPS);
    const titleScene = new DanmakuStgTitleScene(this.screenCanvas);
    this.changeScene(titleScene);
  }
}

assets.addImage('internet_god', 'internet_god.png');
assets.addImage('sprite', 'spritesheet.png');
assets.loadAll().then((a) => {
  const game = new DanmakuStgGame();
  document.body.appendChild(game.screenCanvas);
  game.start();
});