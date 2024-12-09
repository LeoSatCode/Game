class Sprite {
    constructor(config) {
        this.image = new Image();
        this.image.src = config.src;
        this.image.onload = () => {
            this.isLoaded = true;
        
        };
        this.image.onerror = (error) => {
            console.error("Erro ao carregar a imagem:", error);
        };

        this.shadow = new Image();
        this.useShadow = true;
        if (this.useShadow) {
            this.shadow.src = "assets/player/shadow.png";
        }
        this.shadow.onload = () => {
            this.isShadowLoaded = true;
        };

        // Configurar Animação e Estado Inicial
        this.animations = config.animations || {
            "idle-down": [[0, 0]],
            "idle-right": [[1, 0]],
            "idle-up": [[2, 0]],
            "idle-left": [[3, 0]],
            "walk-down": [[0, 1], [1, 1]],
            "walk-right": [[0, 2], [1, 2]],
            "walk-up": [[0, 3], [1, 3]],
            "walk-left": [[0, 4], [1, 4]],
        };
        this.currentAnimation = config.currentAnimation || "idle-down";
        this.currentAnimationFrame = 0;

        this.animationFrameLimit = config.animationFrameLimit || 7;
        this.animationFrameProgress = this.animationFrameLimit;

        // Referenciar o objeto de jogo
        this.gameObject = config.gameObject;
    }

    get frame() {
        return this.animations[this.currentAnimation][this.currentAnimationFrame];
    }

    setAnimation(key) {
        if (this.currentAnimation !== key) {
            this.currentAnimation = key;
            this.currentAnimationFrame = 0;
            this.animationFrameProgress = this.animationFrameLimit;
        }
    }

    updateAnimationProgress() {
        if (this.animationFrameProgress > 0) {
            this.animationFrameProgress -= 1;
            return;
        }

        this.animationFrameProgress = this.animationFrameLimit;
        this.currentAnimationFrame += 1;

        if (this.frame === undefined) {
            this.currentAnimationFrame = 0;
        }
    }

    draw(ctx, cameraPerson) {
        const x = this.gameObject.x - 8 + utils.withGrid(14) - cameraPerson.x;
        const y = this.gameObject.y - 18 + utils.withGrid(10) - cameraPerson.y;

        

        this.isShadowLoaded && ctx.drawImage(this.shadow, x, y);

        const [frameX, frameY] = this.frame;

        if (this.isLoaded) {
            
            ctx.drawImage(this.image,
                frameX * 32, frameY * 32,
                32, 32,
                x, y,
                32, 32
            );
        }

        this.updateAnimationProgress();
    }
}
