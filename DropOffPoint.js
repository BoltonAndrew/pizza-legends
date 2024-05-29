class DropOffPoint extends GameObject {
  constructor(config) {
    super(config);
    this.sprite = new Sprite({
      gameObject: this,
      src: "/images/ui/arrow-down.png",
      animations: {
        down: [
          [0, 0],
          [1, 0],
          [2, 0],
          [3, 0],
          [4, 0],
          [5, 0],
        ],
      },
      currentAnimation: "down",
    });
    this.storyFlag = config.storyFlag || "IS_CARRYING";

    this.talking = [
      {
        events: [
          { type: "toggleFlag", flag: this.storyFlag },
          {
            type: "changeSprite",
            whoId: "hero",
            src: "/images/characters/people/andy.png",
          },
          { type: "dropOffItem" },
        ],
      },
    ];
  }
}
