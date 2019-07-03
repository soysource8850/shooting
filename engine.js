'use strict';

class Rectangle {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  hitTest(other) {
    const horizontal = (other.x < this.x + this.width) && (this.x < other.x + other.width);
    const vertical = (other.y < this.y + this.height) && (this.y < other.y < other.height);

    return (horizontal && vertical);
  }
}

class Sprite {
  constructor(image, rectangle) {
    this.image = image;
    this.rectangle = rectangle;
  }
}