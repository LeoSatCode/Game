class Overworld {
    constructor(config) {
        this.element = config.element;
        this.canvas = this.element.querySelector(".game-canvas");
        this.ctx = this.canvas.getContext("2d");
        this.map = null;
    }

    startGameLoop() {
        const step = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            const cameraPerson = this.map.gameObjects.hero;

            Object.values(this.map.gameObjects).forEach(object => {
                object.update({
                    arrow: this.directionInput.direction,
                    map: this.map,
                });
            });

            this.map.drawLowerImage(this.ctx, cameraPerson);

            Object.values(this.map.gameObjects).sort((a, b) => a.y - b.y).forEach(object => {
                object.update({
                    arrow: this.directionInput.direction,
                    map: this.map,
                });
                object.sprite.draw(this.ctx, cameraPerson);
            });

            this.map.drawUpperImage(this.ctx, cameraPerson);

            requestAnimationFrame(() => {
                step();
            });
        };
        step();
    }

    bindActionInput() {
        new KeyPressListener("Space", () => {
            this.map.checkForActionCutscene();
        });
    }

    bindHeroPositionCheck() {
        document.addEventListener("PersonWalkingComplete", e => {
            if (e.detail.whoId === "hero") {
                this.map.checkForFootstepCutscene();
            }
        });
    }

    startMap(mapConfig) {
        this.map = new OverworldMap(mapConfig);
        this.map.overworld = this;
        this.map.mountObjects();

        // Reiniciar controles do personagem
        this.directionInput = new DirectionInput();
        this.directionInput.init();
    }

    init() {
        this.startMap(window.OverworldMaps.StartMap);

        this.bindActionInput();
        this.bindHeroPositionCheck();

        this.startGameLoop();




       //this.map.startCutscene([
       //     { who: "hero", type: "walk", direction: "up" },
       //     { who: "hero", type: "walk", direction: "up" },
       //     { who: "npc1", type: "walk", direction: "left" },
       //     { who: "npc1", type: "walk", direction: "down" },
       //     { who: "npc1", type: "walk", direction: "down" },
       //     { who: "npc1", type: "stand", direction: "down" },
       //     { type: "textMessage", text: "Guard: Going to hunt again, uh?" },
       //     { type: "textMessage", text: "Hero: Yep!" },
       //     { type: "textMessage", text: "Guard: Be careful right there." },
       //     { who: "npc1", type: "walk", direction: "up" },
       //     { who: "npc1", type: "walk", direction: "up" },
       //     { who: "npc1", type: "walk", direction: "right" },
       //     { who: "npc1", type: "stand", direction: "down" },
       //      { who: "npc2", type: "walk", direction: "right" },
       //      { who: "npc2", type: "walk", direction: "right" },
       //     { who: "npc2", type: "stand", direction: "right" },
       // ]);
    }
}







