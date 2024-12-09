class OverworldMap {
    constructor(config) {
        this.overworld = null;
        this.gameObjects = config.gameObjects;
        this.cutsceneSpaces = config.cutsceneSpaces || {};
        this.walls = config.walls || {};

        this.lowerImage = new Image();
        this.lowerImage.src = config.lowerSrc;

        this.upperImage = new Image();
        this.upperImage.src = config.upperSrc;

        this.isCutscenePlaying = false;
    }

    drawLowerImage(ctx, cameraPerson) {
        ctx.drawImage(
            this.lowerImage,
            utils.withGrid(14) - cameraPerson.x,
            utils.withGrid(10) - cameraPerson.y
        );
    }

    drawUpperImage(ctx, cameraPerson) {
        ctx.drawImage(
            this.upperImage,
            utils.withGrid(14) - cameraPerson.x,
            utils.withGrid(10) - cameraPerson.y
        );
    }

    isSpaceTaken(currentX, currentY, direction) {
        const { x, y } = utils.nextPosition(currentX, currentY, direction);
        return this.walls[`${x},${y}`] || false;
    }


    mountObjects() {
        Object.keys(this.gameObjects).forEach(key => {
            let object = this.gameObjects[key];
            object.id = key;
            //ToDo: determine if this object should actually mount
            object.mount(this);
        })
    }

    async startCutscene(events) {
        this.isCutscenePlaying = true;

        for (let i = 0; i < events.length; i++) {
            const eventHandler = new OverworldEvent({
                event: events[i],
                map: this,
            })
            await eventHandler.init();
        }

        this.isCutscenePlaying = false;

        //Reset NPC's to do their idle behavior
        Object.values(this.gameObjects).forEach(object => object.doBehaviorEvent(this))
    }



    checkForActionCutscene() {
        const hero = this.gameObjects["hero"];
        const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction);
        const match = Object.values(this.gameObjects).find(object => {
            return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`; // Remover espaços
        });
        if (!this.isCutscenePlaying && match && match.talking.length) {
            this.startCutscene(match.talking[0].events)
        }

    }

    checkForFootstepCutscene() {
        const hero = this.gameObjects["hero"];
        const match = this.cutsceneSpaces[`${hero.x},${hero.y}`];
        if (!this.isCutscenePlaying && match) {
            this.startCutscene(match[0].events)
        }
    }


    addWall(x, y) {
        this.walls[`${x},${y}`] = true;
    }
    removeWall(x, y) {
        delete this.walls[`${x},${y}`]
    }
    moveWall(wasX, wasY, direction) {
        this.removeWall(wasX, wasY)
        const { x, y } = utils.nextPosition(wasX, wasY, direction);
        this.addWall(x, y);
    }
}

window.OverworldMaps = {
    StartMap: {
        lowerSrc: "/assets/images/lowermapa0.png",
        upperSrc: "/assets/images/uppermapa0.png",
        gameObjects: {
            hero: new Person({
                isPlayerControlled: true,
                x: utils.withGrid(14),
                y: utils.withGrid(10),
                animations: {
                    "idle-down": [
                        [0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0],
                    ],
                    "idle-right": [
                        [4, 4], [4, 5], [3, 5], [2, 5], [1, 5], [0, 5],
                    ],
                    "idle-up": [
                        [0, 7], [1, 7], [2, 7], [3, 7], [4, 7], [5, 7],
                    ],
                    "idle-left": [
                        [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2],
                    ],
                    "walk-down": [
                        [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1],
                    ],
                    "walk-right": [
                        [8, 5], [0, 6], [1, 6], [2, 6], [3, 6], [4, 6],
                    ],
                    "walk-up": [
                        [8, 7], [0, 8], [1, 8], [2, 8], [3, 8], [4, 8],
                    ],
                    "walk-left": [
                        [0, 4], [8, 3], [7, 3], [6, 3], [5, 3], [4, 3],
                    ],
                }
            }),
            npc1: new Person({
                x: utils.withGrid(15),
                y: utils.withGrid(5),
                src: "assets/player/warrior.png",
                animations: {
                    "idle-down": [
                        [0, 0], [1, 0], [2, 0], [3, 0]
                    ],
                    "idle-right": [
                        [0, 4], [1, 4], [2, 4], [3, 4]
                    ],
                    "idle-up": [
                        [0, 2], [1, 2], [2, 2], [3, 2]
                    ],
                    "idle-left": [
                        [0, 5], [1, 5], [2, 5], [3, 5]
                    ],
                    "walk-down": [
                        [0, 6], [1, 6], [2, 6], [3, 6]
                    ],
                    "walk-right": [
                        [0, 1], [1, 1], [2, 1], [3, 1]
                    ],
                    "walk-up": [
                        [0, 7], [1, 7], [2, 7], [3, 7]
                    ],
                    "walk-left": [
                        [0, 3], [1, 3], [2, 3], [3, 3],
                    ],
                },
                behaviorLoop: [

                    { type: "stand", direction: "left", time: 800 },
                    { type: "stand", direction: "up", time: 800 },
                    { type: "stand", direction: "right", time: 800 },
                    { type: "stand", direction: "down", time: 800 },



                ],
                talking: [
                    {
                        events: [
                            { type: "textMessage", text: "Guard: Going to hunt again, uh?", faceHero: "npc1" },
                            { type: "textMessage", text: "Hero: Yep!" },
                            { type: "textMessage", text: "Guard: Be careful right there." },
                        ]
                    }
                ]
            }),
            npc2: new Person({
                x: utils.withGrid(14),
                y: utils.withGrid(1),
                src: "assets/player/guard.png",
                animations: {
                    "idle-down": [
                        [0, 0], [1, 0], [2, 0], [3, 0]
                    ],
                    "idle-right": [
                        [0, 1], [1, 1], [2, 1], [3, 1]
                    ],
                    "idle-up": [
                        [0, 2], [1, 2], [2, 2], [3, 2]
                    ],
                    "idle-left": [
                        [0, 5], [1, 5], [2, 5], [3, 5]
                    ],
                    "walk-down": [
                        [0, 6], [1, 6], [2, 6], [3, 6]
                    ],
                    "walk-right": [
                        [0, 1], [1, 1], [2, 1], [3, 1]
                    ],
                    "walk-up": [
                        [0, 7], [1, 7], [2, 7], [3, 7]
                    ],
                    "walk-left": [
                        [0, 3], [1, 3], [2, 3], [3, 3],
                    ],
                }

            })
        },
        walls: {
            [utils.asGridCoord(6, 9)]: true,
            [utils.asGridCoord(7, 9)]: true,
            [utils.asGridCoord(8, 9)]: true,
            [utils.asGridCoord(15, 9)]: true,
            [utils.asGridCoord(16, 8)]: true,
            [utils.asGridCoord(17, 8)]: true,
            [utils.asGridCoord(18, 8)]: true,
            [utils.asGridCoord(5, 10)]: true,
            [utils.asGridCoord(6, 9)]: true,
            [utils.asGridCoord(7, 9)]: true,
            [utils.asGridCoord(8, 9)]: true,
            [utils.asGridCoord(12, 11)]: true,
            [utils.asGridCoord(17, 13)]: true,
            [utils.asGridCoord(18, 13)]: true,
            [utils.asGridCoord(19, 13)]: true,
            [utils.asGridCoord(16, 14)]: true,
            [utils.asGridCoord(12, 16)]: true,
            [utils.asGridCoord(13, 16)]: true,
            [utils.asGridCoord(14, 16)]: true,
            [utils.asGridCoord(11, 17)]: true,
            [utils.asGridCoord(6, 14)]: true,
            [utils.asGridCoord(7, 14)]: true,
            [utils.asGridCoord(8, 14)]: true,
            [utils.asGridCoord(5, 15)]: true,
            [utils.asGridCoord(11, 0)]: true,
            [utils.asGridCoord(11, 1)]: true,
            [utils.asGridCoord(10, 1)]: true,
            [utils.asGridCoord(9, 2)]: true,
            [utils.asGridCoord(9, 3)]: true,
            [utils.asGridCoord(8, 2)]: true,
            [utils.asGridCoord(7, 2)]: true,
            [utils.asGridCoord(6, 3)]: true,
            [utils.asGridCoord(16, 14)]: true,
            [utils.asGridCoord(6, 4)]: true,
            [utils.asGridCoord(5, 5)]: true,
            [utils.asGridCoord(4, 5)]: true,
            [utils.asGridCoord(3, 5)]: true,
            [utils.asGridCoord(2, 6)]: true,
            [utils.asGridCoord(1, 7)]: true,
            [utils.asGridCoord(0, 8)]: true,
            [utils.asGridCoord(0, 9)]: true,

        },

        cutsceneSpaces: {
            [utils.asGridCoord(13, 1)]: [
                {
                    events: [
                        { who: "npc2", type: "stand", direction: "left" },
                        { type: "textMessage", text: "You can't leave the village right now!" },
                        { who: "hero", type: "walk", direction: "down" },
                        { who: "npc2", type: "stand", direction: "down" },
                    ]
                }
            ],
            [utils.asGridCoord(15, 1)]: [
                {
                    events: [
                        { who: "npc2", type: "stand", direction: "right" },
                        { type: "textMessage", text: "You can't leave the village right now!" },
                        { who: "hero", type: "walk", direction: "down" },
                        { who: "npc2", type: "stand", direction: "down" },
                    ]
                }
            ],
            [utils.asGridCoord(16, 1)]: [
                {
                    events: [
                        {type: "changeMap", map: "FirstMap" }
                    ]
                }
            ]
        }   
        
    },
    FirstMap: {
        lowerSrc: "assets/images/lowermapa1.png",
        upperSrc: "/assets/images/uppermapa1.png",
        gameObjects: {
            hero: new Person({
                isPlayerControlled: true,
                x: utils.withGrid(14),
                y: utils.withGrid(18),
                animations: {
                    "idle-down": [
                        [0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0],
                    ],
                    "idle-right": [
                        [4, 4], [4, 5], [3, 5], [2, 5], [1, 5], [0, 5],
                    ],
                    "idle-up": [
                        [0, 7], [1, 7], [2, 7], [3, 7], [4, 7], [5, 7],
                    ],
                    "idle-left": [
                        [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2],
                    ],
                    "walk-down": [
                        [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1],
                    ],
                    "walk-right": [
                        [8, 5], [0, 6], [1, 6], [2, 6], [3, 6], [4, 6],
                    ],
                    "walk-up": [
                        [8, 7], [0, 8], [1, 8], [2, 8], [3, 8], [4, 8],
                    ],
                    "walk-left": [
                        [0, 4], [8, 3], [7, 3], [6, 3], [5, 3], [4, 3],
                    ],
                }
            }),
            npcA: new Person({
                x: utils.withGrid(15),
                y: utils.withGrid(10),
                src: "assets/player/warrior.png",
                animations: {
                    "idle-down": [
                        [0, 0], [1, 0], [2, 0], [3, 0]
                    ],
                    "idle-right": [
                        [0, 4], [1, 4], [2, 4], [3, 4]
                    ],
                    "idle-up": [
                        [0, 2], [1, 2], [2, 2], [3, 2]
                    ],
                    "idle-left": [
                        [0, 5], [1, 5], [2, 5], [3, 5]
                    ],
                    "walk-down": [
                        [0, 6], [1, 6], [2, 6], [3, 6]
                    ],
                    "walk-right": [
                        [0, 1], [1, 1], [2, 1], [3, 1]
                    ],
                    "walk-up": [
                        [0, 7], [1, 7], [2, 7], [3, 7]
                    ],
                    "walk-left": [
                        [0, 3], [1, 3], [2, 3], [3, 3],
                    ],
                },
                talking: [
                    {
                        events: [
                            { type: "textMessage", text: "Guard: Going to hunt again, uh?", faceHero: "npcA" },
                            { type: "textMessage", text: "Hero: Yep!" },
                            { type: "textMessage", text: "Guard: Be careful right there." },
                        ]
                    }
                ]
            
            }),
            npcB: new Person({
                x: utils.withGrid(10),
                y: utils.withGrid(8),
                src: "assets/player/guard.png",
                animations: {
                    "idle-down": [
                        [0, 0], [1, 0], [2, 0], [3, 0]
                    ],
                    "idle-right": [
                        [0, 4], [1, 4], [2, 4], [3, 4]
                    ],
                    "idle-up": [
                        [0, 2], [1, 2], [2, 2], [3, 2]
                    ],
                    "idle-left": [
                        [0, 5], [1, 5], [2, 5], [3, 5]
                    ],
                    "walk-down": [
                        [0, 6], [1, 6], [2, 6], [3, 6]
                    ],
                    "walk-right": [
                        [0, 1], [1, 1], [2, 1], [3, 1]
                    ],
                    "walk-up": [
                        [0, 7], [1, 7], [2, 7], [3, 7]
                    ],
                    "walk-left": [
                        [0, 3], [1, 3], [2, 3], [3, 3],
                    ],
                },
            })
        },
        cutsceneSpaces: {
            [utils.asGridCoord(14, 19)]: [
                {
                    events: [
                        {type: "changeMap", map: "StartMap" }
                    ]
                }
            ]
        }
    },
};
