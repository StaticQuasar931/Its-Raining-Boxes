"use strict"

let ctx;

let isMovingR = false,isMovingL = false,
    gameOver = false,
    isJumping = false,
    isTouchingBoxes = false,
    isAntiGravity = false,
    begainAG = false,
    help = false;

let px = 102,
    py = 432,
    dir = 1,
    playerWidth = 34,
    playerheight = 55,
    pxSpeed = 0,
    pySpeed = 0,
    score = 0,
    antiGravity = 3;

let gravity = 0.06,
    boxesGravity = 0.00618;

let notFallingBoxes = [[55, 521, 219, 400],
                       [384, 312, 219, 300],
                       [713, 377, 219, 300]],
    fallingBoxes = [],
    rainDrops = [],
    creatBombsArray = [];

let BoxDimensions = [34, 55, 89, 144];

let jumpCount = 0,
    alpha = 1,
    dragBox = -1,
    boxRate=377;

let frameBox=0,
    frameSink=0,
    framBomb=0,
    AGF=0;

function AG(e) {
    if(gameOver) {
        framBomb=frameSink=frameBox=0;
        gameOver=false;
        alpha=1;   
    }
    if (!isAntiGravity) {
        isAntiGravity = true;
        frameBox=0;
        creatBombsArray=[];
        boxRate=144;
        if (antiGravity > 0) {
            --antiGravity;
        } else {
            isAntiGravity = false;
            boxRate=377;
            return;
        }

    } else if (isAntiGravity) {
        let x = e.clientX;
        let y = e.clientY;

        dragBox = -1;
        for (let i = 0; i < notFallingBoxes.length; ++i) {
            if (x >= notFallingBoxes[i][0] && x <= notFallingBoxes[i][0] + notFallingBoxes[i][2] && y >= notFallingBoxes[i][1] && y <= notFallingBoxes[i][1] + notFallingBoxes[i][3]) {
                dragBox = i;
                console.log(notFallingBoxes[i]);
                break;
            }
        }

    }
}
function startUp() {
    let canvas = document.getElementById("game");
    ctx = canvas.getContext("2d");
    let x = window.innerWidth;
    let y = window.innerHeight;
    if (localStorage.getItem("highScore") === null) {
        localStorage.setItem("highScore", -1);
    }
    for (let i = 0; i < 55; ++i) {
        rainDrops.push([randomInteger(0, 987), randomInteger(-610, 0)]);
    }

    setInterval(frame, 1);

    canvas.addEventListener("mousedown", function (e) {AG()} , false);
    canvas.addEventListener("mousemove", function (e) {
        let x = e.clientX;
        let y = e.clientY;
        if (isAntiGravity) {
            if (dragBox !== -1) {
                notFallingBoxes[dragBox][0] = x;
                notFallingBoxes[dragBox][1] = y;
            }
        }

    }, false);
    canvas.addEventListener("mouseup", function () {
        dragBox = -1;
    }, false);

}

function frame() {
    drawCanvas();
    if(!gameOver) {
        if(isMovingR) moveRight();
        if(isMovingL) moveLeft();
        if(isJumping) jump();
        if(!begainAG)
        if(frameBox==boxRate){
            frameBox=0;
            randomBoxes();
            ++score;

        }
        if(framBomb==21) {
            framBomb=0;
            bombBlast();
        }

        if(isAntiGravity) {
            ++AGF;
            if(AGF==2584) {
                frameBox=0;
                isAntiGravity=false;
                boxRate=377;
                AGF=0; 
            }
        }
    }
    if(frameSink==5) {
        if(!isAntiGravity) {
            sinking();
        } 
        frameSink=0;
        waterMovement();
    }
    fallingBoxesGravity();
    if(!isJumping) playerGravity();
    ++framBomb;
    ++frameSink;
    ++frameBox;
}

function drawCanvas() {
    ctx.clearRect(0, 0, 987, 610);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, 987, 610);
    let grd = ctx.createLinearGradient(0, 0, 0, 3000);
    grd.addColorStop(0, "white");
    grd.addColorStop(1, "black");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 987, 610);
    let img1 = new Image();
    img1.src = "src/w3.png";
    ctx.globalAlpha = 0.3;
    ctx.drawImage(img1, w13, 550);
    ctx.fillStyle = "#303030"
    ctx.fillRect(0, 579, 987, 300);
    ctx.globalAlpha = 1;
    for (let i = 0; i < notFallingBoxes.length; ++i) {
        ctx.fillStyle = "black";
        ctx.fillRect(notFallingBoxes[i][0], notFallingBoxes[i][1], notFallingBoxes[i][2], notFallingBoxes[i][3]);
    }
    for (let i = 0; i < fallingBoxes.length; ++i) {
        ctx.fillStyle = "black";
        ctx.fillRect(fallingBoxes[i][0], fallingBoxes[i][1], fallingBoxes[i][2], fallingBoxes[i][3]);
    }

    for (let i = 0; i < creatBombsArray.length; ++i) {
        if (creatBombsArray[i][0] < 0 || creatBombsArray[i][0] > 987 || creatBombsArray[i][1] > 610) {
            creatBombsArray.splice(i, 1);
        }
        if (i === creatBombsArray.length) break;
        ctx.fillStyle = "black";
        ctx.fillRect(creatBombsArray[i][0], creatBombsArray[i][1], 13, 13);
    }

    ctx.fillStyle = "#303030"
    ctx.globalAlpha = 0.5;
    ctx.drawImage(img1, w2, 560);
    ctx.fillRect(0, 589, 987, 300);
    ctx.globalAlpha = 0.8;
    ctx.drawImage(img1, w13, 570);
    ctx.fillRect(0, 599, 987, 300);
    for (let i = 0; i < 55; ++i) {
        rainDrops[i][1] += 5;
        rainDrops[i][0] += 0.618;
        if (rainDrops[i][0] > 978 || rainDrops[i][1] > 610) {
            rainDrops[i][1] = randomInteger(-610, 0);
            rainDrops[i][0] = randomInteger(0, 987);
        }
        ctx.beginPath();
        ctx.lineWidth = 1.618;
        ctx.globalAlpha = 0.5;
        ctx.moveTo(rainDrops[i][0], rainDrops[i][1]);
        ctx.lineTo(rainDrops[i][0] + 2, rainDrops[i][1] + 21);
        ctx.stroke();
    }

    drawPlayer(px, py, dir);
    ctx.globalAlpha = alpha;
    ctx.font = "55px Sand";
    ctx.fillStyle = "#888888";
    ctx.textAlign = "center";
    ctx.fillText(score, 493, 144);
    ctx.font = "21px Sand";
    ctx.fillText("Anti Gravity : " + antiGravity, 72, 21);
    if (help) {
        ctx.font = "21px Sand";
        ctx.fillText("WATCH OUT !!!", px - 13, py - 8);
    }

    if (begainAG) {
        ctx.beginPath();
        ctx.strokeStyle = "#999999";
        ctx.moveTo(0, 89);
        ctx.lineTo(987, 89);
        ctx.stroke();
    }

    ctx.globalAlpha = alpha;
    if (gameOver) {
        ctx.globalAlpha = 1;
        ctx.font = "75px verdana";
        ctx.fillStyle = "white";
        ctx.fillText("Press F5 to play agian", 493, 305);
        ctx.fillText("Your Score : " + score, 493, 400);
        ctx.fillText("High score : " + localStorage.getItem("highScore"), 493, 500);
    }
    ctx.globalAlpha = alpha;
}
function drawPlayer(x, y, direction) {
    ctx.save();
    if (begainAG) {
        if (y < 89) {
            begainAG = false;
            antiGravity += 3;
        }
    }
    ctx.translate(x, y);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, playerWidth, 55);
    ctx.fillStyle = "white";
    ctx.globalAlpha = 1;
    if (direction === 1) {
        ctx.fillRect(playerWidth - 9, 13, 5, 5.5);
        ctx.fillRect(playerWidth - 20, 13, 5, 5.5);
        ctx.globalAlpha = 0.618;
    } else {
        ctx.fillRect(5, 13, 5, 5.5);
        ctx.fillRect(16, 13, 5, 5.5);
        ctx.globalAlpha = 0.618;
    }
    ctx.restore();
}

function moveRight() {
    if (px > 987) {
        px = -playerWidth;
    }
    if (dir === -1) {
        dir = 1;
    }
    px += pxSpeed;
    rightCollision();
    if (!isTouchingBoxes) {
        pxSpeed = 1.3;
    } else {
        pxSpeed = 0.8;
    }
}
function moveLeft() {
    if (px < -playerWidth) {
        px = 987;
    }
    if (dir === 1) {
        dir = -1;
    }
    px -= pxSpeed;
    leftCollision();
    if (!isTouchingBoxes) {
        pxSpeed = 1.3;
    } else {
        pxSpeed = 0.8;
    }
}
function jump() {
    if (pySpeed < 0) {
        isJumping = false;
        return;
    }
    pySpeed -= gravity;
    py -= pySpeed;
    isStopJumping();
}

function rightCollision() {
    for (let i = 0; i < notFallingBoxes.length; ++i) {
        if (py > notFallingBoxes[i][1] - playerheight && py < notFallingBoxes[i][1] + notFallingBoxes[i][3]) {
            if (px + playerWidth > notFallingBoxes[i][0] - 5 && px + playerWidth < notFallingBoxes[i][0]) {
                isTouchingBoxes = true;
                notFallingBoxes[i][0] += pxSpeed;
            }
        }
    }
}
function leftCollision() {
    for (let i = 0; i < notFallingBoxes.length; ++i) {
        if (py > notFallingBoxes[i][1] - playerheight && py < notFallingBoxes[i][1] + notFallingBoxes[i][3]) {
            if (px > notFallingBoxes[i][0] + notFallingBoxes[i][2] && px < notFallingBoxes[i][0] + notFallingBoxes[i][2] + 5) {
                isTouchingBoxes = true;
                notFallingBoxes[i][0] -= pxSpeed;
            }
        }
    }
}

function isStopJumping() {
    for (let i = 0; i < notFallingBoxes.length; ++i) {
        if (px > notFallingBoxes[i][0] - playerWidth && px < notFallingBoxes[i][0] + notFallingBoxes[i][2]) {
            if (py > notFallingBoxes[i][1] && py < notFallingBoxes[i][1] + notFallingBoxes[i][3]) {
                gravity = 0.06;
                pySpeed = 0;
                isJumping=false;
                return;
            }
        }
    }
}
function playerGravity() {
    if (isJumping) {
        isStopJumping();
    }
    if(isAntiGravity && py>610 ) {
        gravity = 0.06;
        pySpeed = 0;
        py=610-playerheight; 
        isJumping=false;
        return;
    }
    if(isAntiGravity && pySpeed==0) return;
    if(py>610) gameEnd();
    for (let i = 0; i < notFallingBoxes.length; ++i) {
        if (px > notFallingBoxes[i][0] - playerWidth - 5 && px < notFallingBoxes[i][0] + notFallingBoxes[i][2] + 5) {
            if (py > notFallingBoxes[i][1] - playerheight && py < notFallingBoxes[i][1] + 3) {
                isJumping = false;
                pySpeed = 0;
                return;
            }
        }
    }
    pySpeed += gravity;
    py += pySpeed;
}

function fallingBoxesGravity() {
    for (let i = 0; i < fallingBoxes.length; ++i) {
        fallingBoxes[i][4] += boxesGravity;
    }
    for (let i = 0; i < fallingBoxes.length; ++i) {
        let hasToStop = false;
        if (fallingBoxes[i][1] > 610) {
            fallingBoxes.splice(i, 1);
        }
        if (i === fallingBoxes.length) break;
        fallingBoxes[i][1] += fallingBoxes[i][4];
        if (fallingBoxes[i][0] > px - fallingBoxes[i][2] && fallingBoxes[i][0] < px + playerWidth) {
            help = true;
            if (fallingBoxes[i][1] >= py - fallingBoxes[i][3] && fallingBoxes[i][1] <= py - fallingBoxes[i][3] + playerheight) {
                if(isAntiGravity) hasToStop=true;
                else gameEnd();
            }
        }
        for (let j = 0; j < notFallingBoxes.length; ++j) {
            if ((fallingBoxes[i][0] > notFallingBoxes[j][0] - fallingBoxes[i][2] && fallingBoxes[i][0] <= notFallingBoxes[j][0] + notFallingBoxes[j][2])) {
                if ((fallingBoxes[i][1] + fallingBoxes[i][3] > notFallingBoxes[j][1])) {
                    hasToStop = true;
                    fallingBoxes[i][4] = 0;
                }
            }
        }
        if (hasToStop) {
            let box = fallingBoxes[i];
            fallingBoxes.splice(i, 1);
            notFallingBoxes.push(box);
        }
    }
}

function sinking() {
    for (let i = 0; i < notFallingBoxes.length; ++i) {
        notFallingBoxes[i][1] += 0.5;

        if (notFallingBoxes[i][1] > 610) {
            notFallingBoxes.splice(i, 1);
        }
    }
    py += 0.5;
}

function keyDown() {
    let ch = event.keyCode;
    if ((ch === 37 || ch === 65) && !isMovingL) {
        isMovingL = true;
    } else if ((ch === 39 || ch === 68) && !isMovingR) {
        isMovingR = true;
    } else if (ch===69 || ch===101) AG(); 
    else if ((ch === 38 || ch === 87)) {
        if (!isJumping) {
            isJumping = true;
            jumpCount = 1;
            gravity = 0.06;
            pySpeed = 4;

        } else if (jumpCount === 1) {
            jumpCount = 2;
            gravity = 0.06;
            pySpeed = 4;
            creatBombs();
        }
    }
}
function keyUp() {
    let ch = event.keyCode;
    if ((isMovingR || isMovingL) && (ch === 37 || ch === 39 || ch === 68 || ch === 65)) {
        isMovingR = false;
        isMovingL = false;
        isTouchingBoxes = false;
        pxSpeed = 0;

    }
}

function bombBlast() {
    if (creatBombsArray.length === 0) {
        return;
    }
    for (let i = 0; i < creatBombsArray.length; ++i) 
        creatBombsArray[i][randomInteger(0,1)] += randomInteger(-55,55);

    for (let i = 0; i < notFallingBoxes.length; ++i) {
        for (let j = 0; j < creatBombsArray.length; ++j) {
            if (creatBombsArray[j][0] >= notFallingBoxes[i][0] && creatBombsArray[j][0] <= notFallingBoxes[i][0] + notFallingBoxes[i][2] && creatBombsArray[j][1] >= notFallingBoxes[i][1] && creatBombsArray[j][1] <= notFallingBoxes[i][1] + notFallingBoxes[i][3]) {
                creatBombsArray.splice(j, 1);
                notFallingBoxes.splice(i, 1);
                --i;
                break;
            }
        }
    }
}

function gameEnd() {
    alpha = 0.5;
    let highScore = localStorage.getItem("highScore");
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
    }
    gameOver = true;
    notFallingBoxes = [];
    fallingBoxes = [];
    py = 987;
}

function randomBoxes() {
    help = false;
    let box = [randomInteger(0, 987), -210, BoxDimensions[randomInteger(0, 3)], BoxDimensions[randomInteger(0, 3)], 0];
    fallingBoxes.push(box);
}

let w13 = -7,
    w2 = -36;
function waterMovement() {
    w13 = (w13 === -43) ? -7 : w13 - 1;
    w2 = (w2 === 0) ? -36 : w2 + 1;
}

function creatBombs() {
    creatBombsArray.push([px + playerWidth / 2, py + playerheight / 2]);
    creatBombsArray.push([px + playerWidth / 2, py + playerheight / 2]);
    creatBombsArray.push([px + playerWidth / 2, py + playerheight / 2]);
}

function randomInteger(low, high) {
    return Math.floor(Math.random() * (1 + high - low)) + low;
}
