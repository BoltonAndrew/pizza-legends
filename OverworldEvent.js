class OverworldEvent {
  constructor({ map, event }) {
    this.map = map;
    this.event = event;
  }

  stand(resolve) {
    const who = this.map.gameObjects[this.event.who];
    who.startBehaviour(
      {
        map: this.map,
      },
      {
        type: "stand",
        direction: this.event.direction,
        time: this.event.time,
      }
    );

    //Set up a handler to complete when correct person is done walking, then resolve the event
    const completeHandler = (e) => {
      if (e.detail.whoId === this.event.who) {
        document.removeEventListener("PersonStandComplete", completeHandler);
        resolve();
      }
    };

    document.addEventListener("PersonStandComplete", completeHandler);
  }

  walk(resolve) {
    const who = this.map.gameObjects[this.event.who];
    who.startBehaviour(
      {
        map: this.map,
      },
      {
        type: "walk",
        direction: this.event.direction,
        retry: true,
      }
    );

    //Set up a handler to complete when correct person is done walking, then resolve the event
    const completeHandler = (e) => {
      if (e.detail.whoId === this.event.who) {
        document.removeEventListener("PersonWalkingComplete", completeHandler);
        resolve();
      }
    };

    document.addEventListener("PersonWalkingComplete", completeHandler);
  }

  textMessage(resolve) {
    if (this.event.faceHero) {
      const obj = this.map.gameObjects[this.event.faceHero];
      obj.direction = utils.oppositeDirection(
        this.map.gameObjects["hero"].direction
      );
    }

    const message = new TextMessage({
      text: this.event.text,
      onComplete: () => resolve(),
    });
    message.init(document.querySelector(".game-container"));
  }

  changeMap(resolve) {
    //Deactivate old objects
    Object.values(this.map.gameObjects).forEach((obj) => {
      obj.isMounted = false;
    });

    const sceneTransition = new SceneTransition();
    sceneTransition.init(document.querySelector(".game-container"), () => {
      this.map.overworld.startMap(window.OverworldMaps[this.event.map], {
        x: this.event.x,
        y: this.event.y,
        direction: this.event.direction,
      });
      resolve();

      sceneTransition.fadeOut();
    });
  }

  battle(resolve) {
    const battle = new Battle({
      enemy: Enemies[this.event.enemyId],
      onComplete: (didWin) => {
        resolve(didWin ? "WON_BATTLE" : "LOST_BATTLE");
      },
    });
    battle.init(document.querySelector(".game-container"));
  }

  pause(resolve) {
    this.map.isPaused = true;
    const menu = new PauseMenu({
      progress: this.map.overworld.progress,
      onComplete: () => {
        resolve();
        this.map.isPaused = false;
        this.map.overworld.startGameLoop();
      },
    });
    menu.init(this.map.overworld.element);
  }

  addStoryFlag(resolve) {
    window.playerState.storyFlags[this.event.flag] = true;
    resolve();
  }

  toggleFlag(resolve) {
    window.playerState.storyFlags[this.event.flag] =
      !window.playerState.storyFlags[this.event.flag];
    console.log(window.playerState);
    resolve();
  }

  decreaseCrateQuantity(resolve) {
    const obj = this.map.gameObjects[this.event.id];
    obj.quantity = obj.quantity > 0 ? obj.quantity - 1 : 0;
    if (obj.quantity === 0) {
      delete this.map.gameObjects[this.event.id];
    }
    resolve();
  }

  displayTarget(resolve) {
    const [x, y] = utils.randomCoords(this.map.shelves[this.event.dept]);
    const dropOffPoint = new DropOffPoint({
      id: "dropOffPoint",
      type: "DropOffPoint",
      x, //May have to change, unsure of whether they get converted or not
      y,
    });
    this.map.gameObjects.dropOffPoint = dropOffPoint;
    resolve();
  }

  dropOffItem(resolve) {
    console.log("Dropped Off");
    delete this.map.gameObjects.dropOffPoint;

    //Increase quantity
    resolve();
  }

  changeSprite(resolve) {
    const who = this.map.gameObjects[this.event.whoId];
    who.sprite.image.src = this.event.src;

    resolve();
  }

  craftingMenu(resolve) {
    const menu = new CraftingMenu({
      pizzas: this.event.pizzas,
      onComplete: () => {
        resolve();
      },
    });
    menu.init(this.map.overworld.element);
  }

  init() {
    return new Promise((resolve) => {
      this[this.event.type](resolve);
    });
  }
}
