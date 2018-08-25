class Game{
    constructor(){
        this.url =  window.URL || window.webkitURL;
        this.init();
    }

    init() {
        kontra.init();
        kontra.assets.images = {
          z: document.getElementById("z"),
          z2: document.getElementById("z2"),
          f: document.getElementById("f"),
          w: document.getElementById("w"),
          h: document.getElementById("h"),
          o1: document.getElementById("o1"),
          o2: document.getElementById("o2"),
          o3: document.getElementById("o3"),
          o4: document.getElementById("o4"),
          o5: document.getElementById("o5"),
          o6: document.getElementById("o6"),
          o7: document.getElementById("o7"),
          o8: document.getElementById("o8"),
          o9: document.getElementById("o8"),
          o10: document.getElementById("o10")
        };
        this.main();
    }

    main(){
        let jumpSnd = jsfxr([0,,0.3433,,0.168,0.3024,,0.1901,,,,,,0.185,,,,,1,,,,,0.5]);
        let deathSnd = jsfxr([1,0.1477,0.616,0.4993,0.3202,0.5067,,-0.0011,-0.1641,,0.0282,-0.1922,0.6789,0.9542,0.5482,0.2699,-0.0007,-0.386,0.9599,-0.5059,0.4179,0.0777,0.0307,0.25]);
        let overSnd = jsfxr([2,,0.0881,,0.1905,0.3526,,-0.5607,,,,,,,,,,,1,,,,,0.4]);
        let player = new Audio();
        
        let CW = 256, CH = 144, ctx = kontra.context;
        
        function lightingEffect() {
            let grd = ctx.createRadialGradient(180, 90, 15, 150, 70, 120);
            grd.addColorStop(0, "#ffffff11");
            grd.addColorStop(1, "#00000099");
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, CW, CH);
        }
        
        function score() {
            ctx.font = "10px monospace";
            ctx.fillStyle = "#000000";
            ctx.fillText(prettyTime(elapsedTime), 87, 57);
            ctx.fillStyle = "#ffffff";
            ctx.fillText(prettyTime(elapsedTime), 86, 56);
            ctx.fillStyle = "#000000";
            ctx.fillText("BEST - " + prettyTime(bestTime), 187, 57);
            ctx.fillStyle = "#ffff00";
            ctx.fillText("BEST - " + prettyTime(bestTime), 186, 56);
        }
        
        function second() {
            elapsedTime += 1;
            difficulty = 1 - (1/Math.exp(elapsedTime/150));
        }
        
        function prettyTime(seconds) {
            let minutes = (seconds / 60) | 0;
            seconds = seconds - (minutes * 60);
            return (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds);
        }
        
        var background = [], obstacles = [], FLOOR_POS = 102, DT = 0, generateIn = Math.random() * 2, gameOver = true;
        var elapsedTime = 0, bestTime = 0, timer, difficulty = 0, MIN_TIME = 1;
    
        let OBSTACLES = [
            {
                anim: "z",
                off: 14,
                fw: 10,
                fh: 16,
                frms: "0..5",
                fr: 6,
                dx: -1.2,
                posy: -1
            },
            {
                anim: "z2",
                off: 13,
                fw: 16,
                fh: 10,
                frms: "0..5",
                fr: 3,
                dx: -0.9,
                posy: 7
            },
            {
                spr: "o1",
                off: 8
            },
            {
                spr: "o2",
                off: 7
            },
            {
                spr: "o3",
                off: 10
            },
            {
                anim: "o4",
                off: 10,
                fw: 12,
                fh: 14,
                frms: [0,1],
                fr: 8
            },
            {
                spr: "o5",
                off: 12,
                posy: 6
            },
            {
                spr: "o6",
                off: 12,
                posy: 8
            },
            {
                spr: "o7",
                off: 13,
                posy: 7
            },
            {
                spr: "o8",
                off: 13,
                posy: 8
            },
            {
                spr: "o9",
                off: 13,
                posy: 8
            },
            {
                spr: "o10",
                off: 13,
                posy: 4
            }
        ];
        
        // walls
        for (let i=0; i<24; i++) {
          for (let j=1; j<8; j++) {
            let wallTile = kontra.sprite({
              x: 16 * i,
              y: 16 * j,
              dx: -0.8,
              image: kontra.assets.images.w
            });
            background.push(wallTile);
          }
        }
        
        // floor
        for (let i=0; i<17; i++) {
            let floorTile = kontra.sprite({
                x: 16 * i,
                y: 116,
                dx: -1,
                image: kontra.assets.images.f
            });
            background.push(floorTile);
        }

        let heroSpriteSheet = kontra.spriteSheet({
            image: kontra.assets.images.h,
            frameWidth: 16,
            frameHeight: 16,
            animations: {
                run: {
                    frames: "2..8",
                    frameRate: 12
                },
                idle: {
                    frames: [0,1],
                    frameRate: 6
                }
            }
        });

        let hero = kontra.sprite({
            x: 0,
            y: FLOOR_POS,
            dt: 0,
            blink: false,
            animations: heroSpriteSheet.animations,
            update(dt) {
                this.dt += dt;
                if (this.dt > .15) {
                    this.dt = 0;
                    this.blink = !this.blink;
                }
                
                this.advance();
                
                if (this.isJumping) {
                    this.ddy = .09;
                    if (!this.verticalJump) {
                        this.dx = 0.3;
                    }
                }
                
                if (this.x > 160) {
                    this.dx = 0;
                    this.x = this.x | 0;
                }
                
                if (this.y > FLOOR_POS || this.isOver) {
                    this.isJumping = false;
                    this.ddy = 0;
                    this.dy = 0;
                    this.dx = 0;
                    if (!this.isOver) {
                        this.y = FLOOR_POS;
                        player.src = overSnd;
                        player.play();   
                    }
                }
                
                if (this.isColliding) this.dx = this.isColliding.dx;
                if (this.isOver) this.dx = this.isOver.dx;
                
                if (this.dx < 0) {
                    this.playAnimation("idle");
                } else {
                    this.playAnimation("run");
                }
            },
            render() {
                if (gameOver) {
                    let rnd = Math.random() < .5;
                    if (this.blink) {
                        ctx.save();
                        ctx.globalCompositeOperation = "soft-light";
                    }
                    this.draw();
                    if (this.blink) {
                        ctx.restore();
                    }
                } else {
                    this.draw();
                }
            }
        });

        addEventListener("click", jump);
        kontra.keys.bind("space", jump);

        function jump() {
            if (hero.isJumping || gameOver) {
                return;
            }
            player.src = jumpSnd;
            player.play();
            hero.isJumping = true;
            hero.isOver = false;
            if (hero.isColliding && !gameOver) hero.verticalJump = true;
            hero.ddy = -2;
        }

        kontra.gameLoop({
            update: function(dt) {
                if (gameOver) {
                    hero.dx = 1;
                    if (hero.x > CW/2) {
                        hero.x = CW/2;
                        hero.dx = 0;
                        gameOver = false;
                        hero.verticalJump = false;
                        timer = setInterval(second, 1000);
                    }
                } else {
                    DT += dt;
                    if (DT > generateIn) {
                        generateIn = (MIN_TIME * (1 -difficulty)) + Math.random() * 2;
                        DT = 0;
                        let which = (Math.random() * OBSTACLES.length) | 0;
                        if (Math.random() < .25 + (.1 * difficulty)) which = 0;
                        let o = OBSTACLES[which];
                        var cfg = {
                            x: CW,
                            y: FLOOR_POS + (o.posy || 2) ,
                            offset: o.off || 0,
                            dx: o.dx || -1
                        };
                        if (o.spr) {
                            cfg.image = kontra.assets.images[o.spr];
                        } else {
                            let sheet = kontra.spriteSheet({
                                image: kontra.assets.images[o.anim],
                                frameWidth: o.fw,
                                frameHeight: o.fh,
                                animations: {
                                    idle: {
                                        frames: o.frms,
                                        frameRate: o.fr
                                    }
                                }
                            });
                            cfg.animations = sheet.animations;
                        }
                        obstacles.push(kontra.sprite(cfg));
                    }
                }
                
                background.map(tile => {
                    tile.update();

                    if (tile.x <= -16) {
                        tile.x = CW;
                    }
                });
                
                hero.isColliding = false;
                obstacles.map((obs, index) => {
                    obs.update();

                    if (hero.collidesWith(obs)) {
                        if (hero.y < obs.y - obs.offset && !hero.isOver &&!hero.verticalJump && hero.dy > 0) {
                            player.src = overSnd;
                            player.play();
                            hero.isOver = obs;
                            hero.dy = 0;
                            hero.ddy = 0;
                            hero.y = obs.y - obs.offset - 1;
                        } else if (hero.y > obs.y - obs.offset) {
                            hero.isColliding = obs;
                        }
                    }
                    
                    if (obs.x <= -16) {
                        obstacles.splice(index, 1);
                        obs = null;
                    }
                });
                
                hero.update(dt);
                if (hero.x <= -16) {
                    if (!gameOver) {
                        player.src = deathSnd;
                        player.play();
                    }
                    gameOver = true;
                    clearInterval(timer);
                    if (elapsedTime > bestTime) bestTime = elapsedTime;
                    elapsedTime = 0;
                }
            },
            render: function() {
                background.map(tile => {
                    tile.render();
                });
                obstacles.map(obs => {
                    obs.render();
                });
                hero.render();
                
                lightingEffect();
                
                score();
            }
        }).start();
    }
}

let g = new Game();