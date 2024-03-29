class Game{
    constructor(){
        this.url =  window.URL || window.webkitURL;
        this.init();
    }

    init() {
        kontra.init();
        let imgs = ["m", "b", "t", "z", "z2", "f", "w", "h", "o1", "o2", "o3", "o4", "o5", "o6", "o7", "o8", "o9", "o10"];
        imgs.forEach(im => {
            kontra.assets.images[im] = document.getElementById(im); 
        });
        this.main();
    }

    main(){
        let M = Math, RND = M.random;
        
        let jumpSnd = jsfxr([0,,0.3433,,0.168,0.3024,,0.1901,,,,,,0.185,,,,,1,,,,,0.5]);
        let deathSnd = jsfxr([1,0.1477,0.616,0.4993,0.3202,0.5067,,-0.0011,-0.1641,,0.0282,-0.1922,0.6789,0.9542,0.5482,0.2699,-0.0007,-0.386,0.9599,-0.5059,0.4179,0.0777,0.0307,0.25]);
        let overSnd = jsfxr([2,,0.0881,,0.1905,0.3526,,-0.5607,,,,,,,,,,,1,,,,,0.4]);
        let introSnd = jsfxr([3,0.55,0.53,,0.56,0.0628,,1,1,1,,,,-0.0465,-0.0438,0.22,,,0.82,-0.0999,0.52,0.0314,-0.0015,0.58]);
        let player = new Audio(), playerName = "Player";
        
        let CW = 256, CH = 144, ctx = kontra.context;
        
        function lightingEffect() {
            var x1 = 0, y1 = 0, x2 = 0, y2 = 0;
            if (RND() < .04) {
                x1 = RND() * 4;
                y1 = RND() * 4;
                x2 = RND() * 40;
                y2 = RND() * 12;
            }
            let grd = ctx.createRadialGradient(CW/2 + 20 + (x1|0), 90+y1, 15+x1-y1, 150+x2, 70+y2, 100+x2-y2);
            grd.addColorStop(0, "#ffffff11");
            grd.addColorStop(1, "#00000099");
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, CW, CH);
        }
        
        function score() {
            text(20, 30, prettyTime(elapsedTime));
            text(180, 30, `BEST - ${prettyTime(bestTime)}`, "#ffff00");
        }
        
        function text(x, y, txt, col) {
            ctx.font = "10px monospace";
            ctx.fillStyle = "#000000";
            ctx.fillText(txt, x, y);
            ctx.fillStyle = col || "#ffffff";
            ctx.fillText(txt, x-1, y-1);
        }
        
        function second() {
            elapsedTime += 1;
            difficulty = 1 - (1/M.exp(elapsedTime/150));
        }
        
        function prettyTime(seconds) {
            let minutes = (seconds / 60) | 0;
            seconds = seconds - (minutes * 60);
            return (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds);
        }
        
        function sortScores() {
            let s = currentScores.sort((a, b)=>{
                return a.s > b.s ? 1 : (a.s < b.s ? -1 : 0);
            });
            s.forEach((score, i)=>{
                console.log((s.length - i) + ". " + score.n + " " + prettyTime(score.s) + "\n");
            });
            console.log("--------------------------------\n");
            currentScores = s;
        }
        
        function generateObstacle() {
            generateIn = (MIN_TIME * (1 -difficulty)) + RND() * 2;
            DT = 0;
            let which = (RND() * OBSTACLES.length) | 0;
            if (RND() < .25 + (.1 * difficulty)) which = 0;
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
        
        function displayIntroText() {
            if (DT > generateIn) {
                DT = 0;
                let t = introTexts.shift();
                if (t) {
                    generateIn = t.p;
                    bubble.text = t.t;
                } else if (!title.s) {
                    player.src = introSnd;
                    player.play();
                    title.s = true;
//                    setTimeout(()=>{
//                        intro = false;
//                        elapsedTime = 0;
//                    }, 4000);
                }
            }
        }
        
        function displayScoreInfoText() {
            if (sDT > nextScoreInfoIn) {
                sDT = 0;
                nextScoreInfoIn = MIN_TEXT_TIME + RND() * (5 + 5 * difficulty);
                if (currentInfoText.length == 0) {
                    let t = scoresQueue.shift();
                    if (t) {
                        currentInfoText = t;
                    }
                } else {
                    currentInfoText = "";
                }
            }
        }
        
        let BEAT_BEST_SCORE = "CONGRATS! YOU JUST BEAT YOUR BEST SCORE!",
            TUTO_1 = "Controls: press SPACE or Tap screen to jump",
            TUTO_2 = "Can you enter top 10 highscores?  Share it!";
        
        function enqueueScoreInfo() {
            sortScores();
            if (bestTime > 0 && elapsedTime > bestTime) {
                addToQueueScores(BEAT_BEST_SCORE);
            }
            
            let previousScore = currentScores.find(function(s) {
                return s.s < elapsedTime
            });
            if (previousScore) {
                addToQueueScores(`You just BEAT ${previousScore.n}'s highscore of ${prettyTime(previousScore.s)}`);
            }
            
            let nextScore = currentScores.find(function(s) {
                return s.s > elapsedTime;
            });
            if (nextScore) {
                addToQueueScores(`NEXT highscore to BEAT: ${nextScore.n} -> ${prettyTime(nextScore.s)}`)
            }
        }
        
        function resetGame() {
            player.src = deathSnd;
            player.play();
            gameOver = true;
            scoresQueue = [];
            alreadyDisplayed = {};
            if (elapsedTime > bestTime) {
                bestTime = elapsedTime;
            }
            let previousScore = currentScores.findIndex(function(s) {
                return s.s < elapsedTime
            });
            let nextScore = currentScores.findIndex(function(s) {
                console.warn("found next score", s);
                return s.s > elapsedTime
            });
            if (previousScore >= 0) {
                console.warn("found previous score", previousScore, currentScores[previousScore]);
                currentScores.push({n: playerName, s: elapsedTime});
            }
            sortScores();
            console.log("prev", previousScore, "next", nextScore);
            if (previousScore >= 0) {            
                var highscoreChart = [];
                for (var q=previousScore; q<previousScore+3; q++) {
                    if (currentScores[q]) {
                        highscoreChart.push((currentScores.length - q) + "." + currentScores[q].n + " " + prettyTime(currentScores[q].s) + "  ");
                    }
                }
                
                highscoreInfoText = highscoreChart;
                currentInfoText = "";
                nextScoreInfoIn = 0;
                sDT = 0;
            }
            elapsedTime = 0;
            clearInterval(timer);
        }
        
        function addToQueueScores(str) {
            if (alreadyDisplayed[str]) return;
            scoresQueue.push(str);
            alreadyDisplayed[str] = true;
        }
        
        function jump() {
            if (intro) {
                return;
            }
            
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
        
        var background = [], obstacles = [], FLOOR_POS = 102, DT = 0, generateIn = RND() * 2, gameOver = true;
        var elapsedTime = 0, bestTime = 0, timer, difficulty = 0, MIN_TIME = 1, intro = true;
        var sDT = 0, MIN_TEXT_TIME = 2, nextScoreInfoIn = MIN_TEXT_TIME + RND() * 5, currentInfoText = "", highscoreInfoText = [];
            
        let introTexts = [
            {t: "Phone signal's gone!", p: 2},
            {t: "", p: 2},
            {t: "It's kind of an...", p: 2},
            {t: "offline apocalypse!", p: 2},
            {t: "", p: 2},
            {t: "Any phone cabinet?", p: 2},
            {t: "...because...", p: 2},
            {t: "", p: 2}            
        ];
        
        var DUMMY_SCORES = [
            {s: 25, n: "Zane"},
            {s: 105, n: "Adele"},
            {s: 120, n: "Drew"},
            {s: 45, n: "Monica"},
            {s: 150, n: "Faris"},
            {s: 65, n: "Dante"},
            {s: 180, n: "Lukas"},
            {s: 85, n: "Bodhi"},
            {s: 200, n: "Lucy"},
            {s: 95, n: "Bobby"}
        ];
        var currentScores = DUMMY_SCORES, scoresQueue = [
            TUTO_1,
            TUTO_2
        ], alreadyDisplayed = {};
        sortScores();
    
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
        
        // moon
        let moon = kontra.sprite({
            x: 300,
            y: 40,
            dx: -0.8,
            image: kontra.assets.images.m,
            update() {
                this.advance();
                if (this.x < -50) this.x = 300 + (M.random() * 300) | 0
            }
        });

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
        
        let bubble = kontra.sprite({
            x: 115,
            y: 65,
            image: kontra.assets.images.b,
            text: "",
            hideB: false,
            render() {
                if (this.text.length == 0) return;
                
                if (!this.hideB) this.draw();
                
                text(this.x + 10, this.y + 16, this.text, this.hideB ? "#fff" : "#caca00");
            }
        });
        
        let title = kontra.sprite({
            x: 50,
            y: 65,
            s: false,
            image: kontra.assets.images.t,
            render() {
                if (this.s) this.draw();
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
                    let rnd = RND() < .5;
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


        kontra.gameLoop({
            update: function(dt) {
                if (gameOver) {
                    hero.dx = 1;
                    hero.y = FLOOR_POS;
                    if (hero.x > CW/2 - 20) {
                        hero.x = CW/2 - 20;
                        hero.dx = 0;
                        gameOver = false;
                        hero.verticalJump = false;
                        timer = setInterval(second, 1000);
                    }
                } else if (intro) {
                    DT += dt;
                    displayIntroText();
                } else {
                    DT += dt;
                    sDT += dt;
                    if (DT > generateIn) {
                        generateObstacle();
                    }
                    if (sDT > nextScoreInfoIn) {
                        enqueueScoreInfo();
                        displayScoreInfoText();
                        highscoreInfoText = [];
                    }
                }
                
                moon.update();
                
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
                        resetGame();
                    }
                }
            },
            render: function() {
                if (!intro) {
                    background.map(tile => {
                        tile.render();
                    });
                    obstacles.map(obs => {
                        obs.render();
                    });
                    moon.render();

                    score();
                    text(10, 45, currentInfoText, "#00FF00");
                    highscoreInfoText.forEach((t, i)=>{
                        text(10, 75 - 10*i, highscoreInfoText[i], i == 1 ? "#5533ff" : "#fff");
                    });
                } else {
                    bubble.render();
                    title.render();
                }
                hero.render();
                
                lightingEffect();
            }
        }).start();
    }
}

let g = new Game();