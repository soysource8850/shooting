'use strict';

class Title extends Actor {
  constructor(x, y) {
    const hitArea = new Rectangle(0, 0, 0, 0);
    super(x, y, hitArea);
  }

  render(target) {
    const context = target.getContext('2d');
    context.font = '25px sans-serif';
    context.fillStyle = 'white';
    context.fillText('弾幕STG', this.x, this.y);
  }
}

class Fighter extends SpriteActor {
  constructor(x, y) {
    const sprite = new Sprite(assets.get('sprite'), new Rectangle(0, 0, 16, 16));
    const hitArea = new Rectangle(8, 8, 2, 2);
    super(x, y, sprite, hitArea);

    this.speed = 2;
  }

  update(gameInfo, input) {
    if (input.getKey('ArrowUp')) {
      this.y -= this.speed;
    }
    if (input.getKey('ArrowDown')) {
      this.y += this.speed;
    }
    if (input.getKey('ArrowRight')) {
      this.x += this.speed;
    }
    if (input.getKey('ArrowLeft')) {
      this.x -= this.speed;
    }
  }
}