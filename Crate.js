class Crate extends GameObject {
  constructor(config) {
    super(config);
    this.sprite = new Sprite({
      gameObject: this,
      src: config.src,
      animations: {
        "used-down": [[1, 0]],
        "unused-down": [[0, 0]],
      },
      currentAnimation: "unused-down",
    });
    this.quantity = config.quantity || 2;
    this.storyFlag = config.storyFlag || "IS_CARRYING";
    this.dept = config.dept || "gallery";

    this.talking = [
      {
        required: [this.storyFlag],
        events: [
          { type: "textMessage", text: "You're already carrying something!" },
        ],
      },
      {
        events: [
          {
            type: "changeSprite",
            whoId: "hero",
            src: "/images/characters/people/AndyWithBox.png",
          },
          { type: "toggleFlag", flag: this.storyFlag },
          { type: "displayTarget", dept: this.dept },
          { type: "decreaseCrateQuantity", id: config.id },
        ],
      },
    ];
  }

  update() {
    this.sprite.currentAnimation =
      this.quantity > 1 ? "unused-down" : "used-down";
  }
}
