class Overworld {
  constructor(config) {
    this.element = config.element;
    this.canvas = this.element.querySelector(".game-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.map = null;
  }

  gameLoopStepWork(delta) {
    //Clear off the canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    //Establish the camera person
    const cameraPerson = this.map.gameObjects.hero;

    //Update all objects
    Object.values(this.map.gameObjects).forEach((object) => {
      object.update({
        arrow: this.directionInput.direction,
        map: this.map,
      });
    });

    //Draw Lower layer
    this.map.drawLowerImage(this.ctx, cameraPerson);

    //Draw Game Objects
    Object.values(this.map.gameObjects)
      .sort((a, b) => {
        return a.y - b.y;
      })
      .forEach((object) => {
        object.sprite.draw(this.ctx, cameraPerson);
      });

    //Draw Upper layer
    this.map.drawUpperImage(this.ctx, cameraPerson);

    //Draw any Overlays
    Object.values(this.map.gameObjects).forEach((obj) => {
      if (obj.id === "dropOffPoint") {
        obj.sprite.isShadowLoaded = false;
        obj.sprite.draw(this.ctx, cameraPerson);
        obj.sprite.isShadowLoaded = true;
      }
    });
  }

  startGameLoop() {
    let previousMs;
    const step = 1 / 60;

    //Timer logic
    const startTime = Date.now();
    const duration = 1 * 60 * 1000;

    const stepFn = (timestampMs) => {
      //Timer logic
      const currentTime = Date.now();
      const elapsedTime = currentTime - startTime;
      const remainingTime = duration - elapsedTime;

      // console.log(remainingTime / 1000 / 60);

      // if (remainingTime <= 0) {
      //   this.init();
      //   return;
      // }

      if (this.map.isPaused) {
        return;
      }
      if (previousMs === undefined) {
        previousMs = timestampMs;
      }
      let delta = (timestampMs - previousMs) / 1000;
      while (delta >= step) {
        this.gameLoopStepWork(delta);
        delta -= step;
      }
      previousMs = timestampMs - delta * 1000;

      //Business as usual tick
      requestAnimationFrame(stepFn);
    };
    //First kickoff tick
    requestAnimationFrame(stepFn);
  }

  bindActionInput() {
    new KeyPressListener("Enter", () => {
      //Is there a person here to talk to?
      this.map.checkForActionCutscene();
    });

    new KeyPressListener("Escape", () => {
      if (!this.map.isCutscenePlaying) {
        this.map.startCutscene([
          {
            type: "pause",
          },
        ]);
      }
    });
  }

  bindHeroPositionCheck() {
    document.addEventListener("PersonWalkingComplete", (e) => {
      if (e.detail.whoId === "hero") {
        //Hero's position has changed
        this.map.checkForFootstepCutscene();
      }
    });
  }

  startMap(mapConfig, heroInitialState = null) {
    this.map = new OverworldMap(mapConfig);
    this.map.overworld = this;
    this.map.mountObjects();

    if (heroInitialState) {
      const { hero } = this.map.gameObjects;
      hero.x = heroInitialState.x;
      hero.y = heroInitialState.y;
      hero.direction = heroInitialState.direction;
    }

    this.progress.mapId = mapConfig.id;
    this.progress.startingHeroX = this.map.gameObjects.hero.x;
    this.progress.startingHeroY = this.map.gameObjects.hero.y;
    this.progress.startingHeroDirection = this.map.gameObjects.hero.direction;
  }

  async init() {
    //Create a new Progress tracker
    this.progress = new Progress();

    //Show the title screen
    this.titleScreen = new TitleScreen({
      progress: this.progress,
    });
    const useSaveFile = await this.titleScreen.init(this.element);
    // const useSaveFile = false;

    //Potentially load saved data
    let initialHeroState = null;

    if (useSaveFile) {
      this.progress.load();
      initialHeroState = {
        x: this.progress.startingHeroX,
        y: this.progress.startingHeroY,
        direction: this.progress.startingHeroDirection,
      };
    }

    //Load the HUD
    // this.hud = new Hud();
    // this.hud.init(this.element);

    //Start the first map
    // this.startMap(window.OverworldMaps.Entrance);
    this.startMap(window.OverworldMaps[this.progress.mapId], initialHeroState);

    //Create controls
    this.bindActionInput();
    this.bindHeroPositionCheck();

    this.directionInput = new DirectionInput();
    this.directionInput.init();

    //Kick off the game
    this.startGameLoop();

    // this.map.startCutscene([{ type: "battle", enemyId: "beth" }]);
  }
}
