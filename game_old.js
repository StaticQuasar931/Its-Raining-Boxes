"use strict"

let ctx;

let Mid, jum, isMoving = false,
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

let notFallingBoxes = [
    [55, 521, 219, 400],
    [384, 312, 219, 300],
    [713, 377, 219, 300]
],
    fallingBoxes = [],
    rainDrops = [],
    bombsArray = [];

let jumpCount = 0,
    ant = 9,
    alpha = 1,
    w13 = -7,
    w2 = -36,
    dragBox = -1;

let snkg,
    rndmBxs,
    fllngBxsGrvt,
    scr,
    plrG,
    bmb;

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

function isStopJumping() {
    for (let i = 0; i < notFallingBoxes.length; ++i) {
        if (px > notFallingBoxes[i][0] - playerWidth && px < notFallingBoxes[i][0] + notFallingBoxes[i][2]) {
            if (py > notFallingBoxes[i][1] && py < notFallingBoxes[i][1] + notFallingBoxes[i][3]) {
                gravity = 0.06;
                pySpeed = 0;
                clearInterval(jum);
                clearInterval(plrG);
                plrG = setInterval(playerGravity, 1);
                return;
            }
        }
    }
}

function jump() {
    if (pySpeed < 0) {
        clearInterval(jum);
        plrG = setInterval(playerGravity, 1);
        return;
    }
    pySpeed -= gravity;
    py -= pySpeed;
    isStopJumping();
}

function playerGravity() {
    if (isJumping) {
        isStopJumping();
    }
    if (py > 610) {
        gameEnd();
    }
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

function keyDown() {
    let ch = event.keyCode;
    if ((ch === 37 || ch === 65) && !isMoving) {
        Mid = setInterval(moveLeft, 1);
        isMoving = true;
    } else if ((ch === 39 || ch === 68) && !isMoving) {
        Mid = setInterval(moveRight, 1);
        isMoving = true;
    } else if ((ch === 38 || ch === 87)) {
        if (!isJumping) {
            isJumping = true;
            jumpCount = 1;
            clearInterval(plrG);
            gravity = 0.06;
            pySpeed = 4;
            jum = setInterval(jump, 1);

        } else if (jumpCount === 1) {
            clearInterval(jum);
            clearInterval(plrG);
            jumpCount = 2;
            gravity = 0.06;
            pySpeed = 4;
            jum = setInterval(jump, 1);
            bombs();
        }
    }
}

function keyUp() {
    let ch = event.keyCode;
    if (isMoving && (ch === 37 || ch === 39 || ch === 68 || ch === 65)) {
        clearInterval(Mid);
        isMoving = false;
        isTouchingBoxes = false;
        pxSpeed = 0;

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

    setInterval(drawCanvas, 1);
    setInterval(waterMovement, 55);
    setInterval(AG, 13000);
    snkg = setInterval(sinking, 55);

    scr = setInterval(function () {
        ++score;
    }, 1000);

    rndmBxs = setInterval(randomBoxes, 987);
    fllngBxsGrvt = setInterval(fallingBoxesGravity, 3);
    plrG = setInterval(playerGravity, 1);

    canvas.addEventListener("mousedown", function (e) {

        if (!isAntiGravity) {
            isAntiGravity = true;

            if (antiGravity > 0) {
                --antiGravity;
            } else {
                isAntiGravity = false;
                return;
            }

            clearInterval(snkg);
            let agi = setInterval(function () {
                if (ant > 0) {
                    --ant;
                } else {
                    ant = 9;
                    isAntiGravity = false;
                    clearInterval(agi);
                    snkg = setInterval(sinking, 55);
                }
            }, 1000);

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

    }, false);
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

    for (let i = 0; i < bombsArray.length; ++i) {
        if (bombsArray[i][0] < 0 || bombsArray[i][0] > 987 || bombsArray[i][1] > 610) {
            bombsArray.splice(i, 1);
        }
        if (i === bombsArray.length) break;
        ctx.fillStyle = "black";
        ctx.fillRect(bombsArray[i][0], bombsArray[i][1], 12, 12);
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

function AG() {
    begainAG = (begainAG) ? false : true;
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
                gameEnd();
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

let BoxDimensions = [34, 55, 89, 144];

function randomBoxes() {
    help = false;
    let box = [randomInteger(0, 987), -210, BoxDimensions[randomInteger(0, 3)], BoxDimensions[randomInteger(0, 3)], 0];
    fallingBoxes.push(box);
}



function bombs() {
    clearInterval(bmb);
    bombsArray.push([px + playerWidth / 2, py + playerheight / 2]);
    bombsArray.push([px + playerWidth / 2, py + playerheight / 2]);
    bombsArray.push([px + playerWidth / 2, py + playerheight / 2]);
    bmb = setInterval(bombBlast, 21);
}

function bombBlast() {
    if (bombsArray.length === 0) {
        clearInterval(bmb);
        return;
    }
    for (let i = 0; i < bombsArray.length; ++i) {
        if (i % 3 === 0) {
            bombsArray[i][1] += 1;
        } else if (i % 3 === 1) {
            bombsArray[i][0] -= 1;
        } else if (i % 3 === 2) {
            bombsArray[i][0] += 1;
        }
    }
    for (let i = 0; i < notFallingBoxes.length; ++i) {
        for (let j = 0; j < bombsArray.length; ++j) {
            if (bombsArray[j][0] >= notFallingBoxes[i][0] && bombsArray[j][0] <= notFallingBoxes[i][0] + notFallingBoxes[i][2] && bombsArray[j][1] >= notFallingBoxes[i][1] && bombsArray[j][1] <= notFallingBoxes[i][1] + notFallingBoxes[i][3]) {
                bombsArray.splice(j, 1);
                notFallingBoxes.splice(i, 1);
                --i;
                break;
            }
        }
    }
}

function waterMovement() {
    w13 = (w13 === -43) ? -7 : w13 - 1;
    w2 = (w2 === 0) ? -36 : w2 + 1;
}

function gameEnd() {
    clearInterval(snkg);
    clearInterval(scr);
    clearInterval(rndmBxs);
    clearInterval(fllngBxsGrvt);
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

function randomInteger(low, high) {
    return Math.floor(Math.random() * (1 + high - low)) + low;
}
